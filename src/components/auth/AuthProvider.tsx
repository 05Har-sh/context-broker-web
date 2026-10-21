"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import type Keycloak from 'keycloak-js';
import { getKeycloakInstance, KEYCLOAK_CLIENT_ID } from '@/lib/keycloak';
import { Role, Organization, OrganizationMembership } from '@/types';

// ─── Types ────────────────────────────────────────────────────

export interface KeycloakUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  emailVerified: boolean;
  roles: Role[];
  /** Convenience: first client role, for backward compatibility with `user.role` */
  role?: Role;
  /** Auth provider identifier */
  authProvider: string;
  /** Provider-specific user ID */
  providerUserId: string;
  /** Avatar URL (from Keycloak profile if available) */
  avatarUrl?: string;
  /** Account creation time (from token if available) */
  createdAt?: string;
  /** Last login time (from token if available) */
  lastLoginAt?: string;
}

type AuthState = 'initializing' | 'authenticated' | 'unauthenticated' | 'error';

interface AuthContextType {
  /** High-level auth state machine */
  authState: AuthState;
  /** Convenience booleans */
  isAuthenticated: boolean;
  isLoading: boolean;
  /** User profile derived from Keycloak token */
  user: KeycloakUser | null;
  /** Direct internal authentication using username and password */
  loginWithCredentials: (username: string, password: string) => Promise<void>;
  /** Redirect to Keycloak login page (for OAuth/SSO) */
  login: (redirectTo?: string, options?: { loginHint?: string }) => void;
  /** End the Keycloak session and redirect */
  logout: () => void;
  /** Get the current access token (refreshes if needed) */
  getAccessToken: () => Promise<string | null>;
  /** Check if the user has a specific client role */
  hasRole: (role: Role) => boolean;

  // ── Backward-compatible stubs for existing settings pages ──
  organization: Organization | null;
  membership: OrganizationMembership | null;
  updateUser: (updates: Partial<KeycloakUser>) => void;
  updateOrganization: (updates: Partial<Organization>) => void;
  updateMembership: (updates: Partial<OrganizationMembership>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Helpers ──────────────────────────────────────────────────

function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return undefined;
  }
}

function extractUser(kc: Keycloak): KeycloakUser | null {
  if (!kc.tokenParsed) return null;

  const tp = kc.tokenParsed as Record<string, unknown>;
  const firstName = (tp.given_name as string) || '';
  const lastName = (tp.family_name as string) || '';

  // Extract client roles from resource_access
  const resourceAccess = tp.resource_access as
    | Record<string, { roles?: string[] }>
    | undefined;
  const clientRoles = resourceAccess?.[KEYCLOAK_CLIENT_ID]?.roles || [];
  const roles = clientRoles as Role[];

  return {
    id: (tp.sub as string) || '',
    email: (tp.email as string) || '',
    firstName,
    lastName,
    name: (tp.name as string) || `${firstName} ${lastName}`.trim() || (tp.preferred_username as string) || 'User',
    emailVerified: (tp.email_verified as boolean) || false,
    roles,
    role: roles.length > 0 ? roles[0] : undefined,
    authProvider: 'keycloak',
    providerUserId: (tp.sub as string) || '',
    avatarUrl: (tp.picture as string) || undefined,
    createdAt: (tp.created_at as string) || undefined,
    lastLoginAt: (tp.auth_time as number)
      ? new Date((tp.auth_time as number) * 1000).toISOString()
      : undefined,
  };
}

// ─── Provider ─────────────────────────────────────────────────

const TOKEN_MIN_VALIDITY_SECONDS = 30;
const TOKEN_REFRESH_INTERVAL_MS = 30_000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>('initializing');
  const [user, setUser] = useState<KeycloakUser | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [membership, setMembership] = useState<OrganizationMembership | null>(null);
  const kcRef = useRef<Keycloak | null>(null);
  const initCalledRef = useRef(false);

  // ── Helper to refresh direct tokens ──
  const refreshDirectToken = async (refreshToken: string) => {
    const kcUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080';
    const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'context-broker-dev';
    const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'context-broker';

    const tokenUrl = `${kcUrl}/realms/${realm}/protocol/openid-connect/token`;
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      refresh_token: refreshToken,
    });

    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!res.ok) throw new Error('Refresh token expired');
    return res.json();
  };

  // ── Initialize Keycloak ──
  useEffect(() => {
    if (initCalledRef.current) return;
    initCalledRef.current = true;

    const kc = getKeycloakInstance();
    kcRef.current = kc;

    kc.onAuthSuccess = () => {
      setUser(extractUser(kc));
      setAuthState('authenticated');
    };

    kc.onAuthError = () => {
      setUser(null);
      setAuthState('error');
    };

    kc.onAuthRefreshSuccess = () => {
      if (kc.token) localStorage.setItem('kc_access_token', kc.token);
      if (kc.refreshToken) localStorage.setItem('kc_refresh_token', kc.refreshToken);
      setUser(extractUser(kc));
    };

    kc.onAuthRefreshError = () => {
      localStorage.removeItem('kc_access_token');
      localStorage.removeItem('kc_refresh_token');
      setUser(null);
      setAuthState('unauthenticated');
    };

    kc.onTokenExpired = () => {
      kc.updateToken(TOKEN_MIN_VALIDITY_SECONDS).catch(() => {
        const savedRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('kc_refresh_token') : null;
        if (savedRefreshToken) {
          refreshDirectToken(savedRefreshToken)
            .then((data) => {
              kc.token = data.access_token;
              kc.refreshToken = data.refresh_token;
              kc.authenticated = true;
              kc.tokenParsed = parseJwt(data.access_token);
              localStorage.setItem('kc_access_token', data.access_token);
              localStorage.setItem('kc_refresh_token', data.refresh_token);
              setUser(extractUser(kc));
              setAuthState('authenticated');
            })
            .catch(() => {
              localStorage.removeItem('kc_access_token');
              localStorage.removeItem('kc_refresh_token');
              setUser(null);
              setAuthState('unauthenticated');
            });
        } else {
          setUser(null);
          setAuthState('unauthenticated');
        }
      });
    };

    kc.onAuthLogout = () => {
      localStorage.removeItem('kc_access_token');
      localStorage.removeItem('kc_refresh_token');
      setUser(null);
      setAuthState('unauthenticated');
    };

    const savedAccessToken = typeof window !== 'undefined' ? localStorage.getItem('kc_access_token') : null;
    const savedRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('kc_refresh_token') : null;

    kc.init({
      onLoad: 'check-sso',
      pkceMethod: 'S256',
      token: savedAccessToken || undefined,
      refreshToken: savedRefreshToken || undefined,
      checkLoginIframe: false,
      silentCheckSsoRedirectUri:
        typeof window !== 'undefined'
          ? `${window.location.origin}/silent-check-sso.html`
          : undefined,
    })
      .then((authenticated) => {
        if (authenticated) {
          if (kc.token) localStorage.setItem('kc_access_token', kc.token);
          if (kc.refreshToken) localStorage.setItem('kc_refresh_token', kc.refreshToken);
          setUser(extractUser(kc));
          setAuthState('authenticated');
        } else if (savedRefreshToken) {
          // Attempt direct refresh if saved tokens exist
          refreshDirectToken(savedRefreshToken)
            .then((data) => {
              kc.token = data.access_token;
              kc.refreshToken = data.refresh_token;
              kc.authenticated = true;
              kc.tokenParsed = parseJwt(data.access_token);
              localStorage.setItem('kc_access_token', data.access_token);
              localStorage.setItem('kc_refresh_token', data.refresh_token);
              setUser(extractUser(kc));
              setAuthState('authenticated');
            })
            .catch(() => {
              localStorage.removeItem('kc_access_token');
              localStorage.removeItem('kc_refresh_token');
              setUser(null);
              setAuthState('unauthenticated');
            });
        } else {
          setAuthState('unauthenticated');
        }
      })
      .catch(() => {
        if (savedRefreshToken) {
          refreshDirectToken(savedRefreshToken)
            .then((data) => {
              kc.token = data.access_token;
              kc.refreshToken = data.refresh_token;
              kc.authenticated = true;
              kc.tokenParsed = parseJwt(data.access_token);
              localStorage.setItem('kc_access_token', data.access_token);
              localStorage.setItem('kc_refresh_token', data.refresh_token);
              setUser(extractUser(kc));
              setAuthState('authenticated');
            })
            .catch(() => {
              localStorage.removeItem('kc_access_token');
              localStorage.removeItem('kc_refresh_token');
              setAuthState('unauthenticated');
            });
        } else {
          setAuthState('unauthenticated');
        }
      });
  }, []);

  // ── Periodic token refresh ──
  useEffect(() => {
    if (authState !== 'authenticated') return;

    const interval = setInterval(() => {
      const kc = kcRef.current;
      if (!kc) return;

      kc.updateToken(TOKEN_MIN_VALIDITY_SECONDS).catch(() => {
        const savedRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('kc_refresh_token') : null;
        if (savedRefreshToken) {
          refreshDirectToken(savedRefreshToken)
            .then((data) => {
              kc.token = data.access_token;
              kc.refreshToken = data.refresh_token;
              kc.authenticated = true;
              kc.tokenParsed = parseJwt(data.access_token);
              localStorage.setItem('kc_access_token', data.access_token);
              localStorage.setItem('kc_refresh_token', data.refresh_token);
              setUser(extractUser(kc));
              setAuthState('authenticated');
            })
            .catch(() => {
              localStorage.removeItem('kc_access_token');
              localStorage.removeItem('kc_refresh_token');
              setUser(null);
              setAuthState('unauthenticated');
            });
        } else {
          setUser(null);
          setAuthState('unauthenticated');
        }
      });
    }, TOKEN_REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [authState]);

  // ── Actions ──

  const loginWithCredentials = useCallback(async (username: string, password: string): Promise<void> => {
    const kcUrl = process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080';
    const realm = process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'context-broker-dev';
    const clientId = process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'context-broker';

    const tokenUrl = `${kcUrl}/realms/${realm}/protocol/openid-connect/token`;
    const params = new URLSearchParams({
      grant_type: 'password',
      client_id: clientId,
      username: username.trim(),
      password,
      scope: 'openid profile email',
    });

    const res = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!res.ok) {
      let errorMsg = 'Invalid username or password';
      try {
        const errorData = await res.json();
        if (errorData.error_description) {
          errorMsg = errorData.error_description;
        } else if (errorData.error === 'invalid_grant') {
          errorMsg = 'Invalid username or password. Please check your credentials and try again.';
        }
      } catch {
        // fallback
      }
      throw new Error(errorMsg);
    }

    const data = await res.json();
    const accessToken = data.access_token;
    const refreshToken = data.refresh_token;

    if (typeof window !== 'undefined') {
      localStorage.setItem('kc_access_token', accessToken);
      localStorage.setItem('kc_refresh_token', refreshToken);
    }

    const kc = getKeycloakInstance();
    kc.token = accessToken;
    kc.refreshToken = refreshToken;
    kc.authenticated = true;
    kc.tokenParsed = parseJwt(accessToken);

    const parsedUser = extractUser(kc);
    setUser(parsedUser);
    setAuthState('authenticated');
  }, []);

  const login = useCallback((redirectTo?: string, options?: { loginHint?: string }) => {
    const kc = kcRef.current;
    if (!kc) return;

    if (redirectTo) {
      sessionStorage.setItem('auth_redirect', redirectTo);
    }

    kc.login({
      redirectUri: `${window.location.origin}/login`,
      loginHint: options?.loginHint,
    });
  }, []);

  const logout = useCallback(() => {
    const kc = kcRef.current;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kc_access_token');
      localStorage.removeItem('kc_refresh_token');
      localStorage.removeItem('kc_id_token');
    }
    setUser(null);
    setAuthState('unauthenticated');

    if (kc && kc.authenticated) {
      kc.logout({
        redirectUri: `${window.location.origin}/login`,
      });
    }
  }, []);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const kc = kcRef.current;
    if (kc && kc.authenticated && kc.token) {
      try {
        await kc.updateToken(TOKEN_MIN_VALIDITY_SECONDS);
        if (kc.token) localStorage.setItem('kc_access_token', kc.token);
        return kc.token;
      } catch {
        // fallback to saved token if present
      }
    }

    const savedAccessToken = typeof window !== 'undefined' ? localStorage.getItem('kc_access_token') : null;
    const savedRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('kc_refresh_token') : null;

    if (savedAccessToken) return savedAccessToken;

    if (savedRefreshToken) {
      try {
        const data = await refreshDirectToken(savedRefreshToken);
        if (typeof window !== 'undefined') {
          localStorage.setItem('kc_access_token', data.access_token);
          localStorage.setItem('kc_refresh_token', data.refresh_token);
        }
        if (kc) {
          kc.token = data.access_token;
          kc.refreshToken = data.refresh_token;
          kc.authenticated = true;
          kc.tokenParsed = parseJwt(data.access_token);
        }
        return data.access_token;
      } catch {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('kc_access_token');
          localStorage.removeItem('kc_refresh_token');
        }
        setUser(null);
        setAuthState('unauthenticated');
        return null;
      }
    }

    return null;
  }, []);

  const hasRole = useCallback(
    (role: Role): boolean => {
      if (!user) return false;
      return user.roles.includes(role);
    },
    [user]
  );

  const updateUser = useCallback((updates: Partial<KeycloakUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updatedName = updates.firstName || updates.lastName
        ? `${updates.firstName ?? prev.firstName} ${updates.lastName ?? prev.lastName}`
        : prev.name;
      return { ...prev, ...updates, name: updatedName };
    });
  }, []);

  const updateOrganization = useCallback((updates: Partial<Organization>) => {
    setOrganization((prev) => {
      if (!prev) return { id: '', name: '', workspaceUrl: '', industry: '', teamSize: '', createdAt: '', ...updates };
      return { ...prev, ...updates };
    });
  }, []);

  const updateMembership = useCallback((updates: Partial<OrganizationMembership>) => {
    setMembership((prev) => {
      if (!prev) return null;
      return { ...prev, ...updates };
    });
  }, []);

  const value: AuthContextType = {
    authState,
    isAuthenticated: authState === 'authenticated',
    isLoading: authState === 'initializing',
    user,
    loginWithCredentials,
    login,
    logout,
    getAccessToken,
    hasRole,
    organization,
    membership,
    updateUser,
    updateOrganization,
    updateMembership,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
