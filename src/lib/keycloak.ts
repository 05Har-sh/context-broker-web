import Keycloak from 'keycloak-js';

let keycloakInstance: Keycloak | null = null;

/**
 * Returns the singleton Keycloak instance.
 * Only call this on the client side.
 */
export function getKeycloakInstance(): Keycloak {
  if (typeof window === 'undefined') {
    throw new Error('Keycloak can only be initialized on the client side');
  }

  if (!keycloakInstance) {
    keycloakInstance = new Keycloak({
      url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:8080',
      realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'context-broker-dev',
      clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'context-broker',
    });
  }

  return keycloakInstance;
}

/** The Keycloak client ID used for extracting resource_access roles. */
export const KEYCLOAK_CLIENT_ID =
  process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'context-broker';
