"use client";

import { useAuth } from '@/components/auth/AuthProvider';
import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';

// ─── SVG Icons ────────────────────────────────────────────────

function UserIcon() {
  return (
    <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function EyeIcon({ show }: { show: boolean }) {
  return show ? (
    <svg className="w-4 h-4 opacity-50 hover:opacity-100 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="w-4 h-4 opacity-50 hover:opacity-100 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.025 10.025 0 0110.122 3.937M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 3l-18-18" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="w-4 h-4 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}

// ─── Validation Types & Helpers ───────────────────────────────

interface FieldErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
  password?: string;
  tenantName?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Inner Content Component ──────────────────────────────────

function LoginPageContent() {
  const { isAuthenticated, isLoading, loginWithCredentials } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Mode: 'dark' | 'light'
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Tab state: 'login' | 'signup'
  const initialTab = searchParams?.get('tab') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState<'login' | 'signup'>(initialTab);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [tenantName, setTenantName] = useState('');

  // Field-level error messages & shake animation trigger
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [shakeTrigger, setShakeTrigger] = useState(0);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = sessionStorage.getItem('auth_redirect') || sessionStorage.getItem('post_login_redirect') || '/dashboard';
      sessionStorage.removeItem('auth_redirect');
      sessionStorage.removeItem('post_login_redirect');
      router.push(redirectPath);
    }
  }, [isAuthenticated, router]);

  // Validate signup fields against strict rules
  const validateSignup = (): boolean => {
    const errors: FieldErrors = {};

    // First name: Required, cannot be blank, maximum 100 characters
    if (!firstName.trim()) {
      errors.firstName = 'First name is required and cannot be blank';
    } else if (firstName.trim().length > 100) {
      errors.firstName = 'Maximum 100 characters allowed';
    }

    // Last name: Required, cannot be blank, maximum 100 characters
    if (!lastName.trim()) {
      errors.lastName = 'Last name is required and cannot be blank';
    } else if (lastName.trim().length > 100) {
      errors.lastName = 'Maximum 100 characters allowed';
    }

    // Email: Required, valid email format, maximum 255 characters
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    } else if (email.trim().length > 255) {
      errors.email = 'Maximum 255 characters allowed';
    }

    // Username: Required, 3–100 characters
    if (!username.trim()) {
      errors.username = 'Username is required (3–100 characters)';
    } else if (username.trim().length < 3 || username.trim().length > 100) {
      errors.username = 'Username must be between 3 and 100 characters';
    }

    // Password: Required, 12–128 characters
    if (!password) {
      errors.password = 'Password is required (12–128 characters)';
    } else if (password.length < 12 || password.length > 128) {
      errors.password = 'Password must be between 12 and 128 characters';
    }

    // Workspace name: Required, 2–255 characters
    if (!tenantName.trim()) {
      errors.tenantName = 'Workspace name is required (2–255 characters)';
    } else if (tenantName.trim().length < 2 || tenantName.trim().length > 255) {
      errors.tenantName = 'Workspace name must be between 2 and 255 characters';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setShakeTrigger(prev => prev + 1);
    }
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (mode === 'login') {
      if (!username.trim() || !password) return;
      setIsSubmitting(true);
      try {
        await loginWithCredentials(username, password);
      } catch (err: any) {
        setErrorMessage(err?.message || 'Invalid username or password.');
        setIsSubmitting(false);
      }
    } else {
      const isValid = validateSignup();
      if (!isValid) {
        return;
      }

      setIsSubmitting(true);

      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
        const res = await fetch(`${API_BASE}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            username: username.trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            password,
            tenantName: tenantName.trim(),
          }),
        });

        if (res.status === 201) {
          setSuccessMessage('Account created successfully! Switching to sign in...');
          setTimeout(() => {
            setMode('login');
            setSuccessMessage(null);
            setFieldErrors({});
            setIsSubmitting(false);
          }, 1800);
          return;
        }

        const data = await res.json().catch(() => null);
        const msg = data?.message || (res.status === 409 ? 'An account with this email or username already exists.' : 'Registration failed. Please check your inputs.');
        setErrorMessage(msg);
        setIsSubmitting(false);
      } catch {
        setErrorMessage('Network error. Registration outcome is pending verification.');
        setIsSubmitting(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen w-full flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-[#0c0c0e] text-white' : 'bg-[#edf4ff] text-zinc-900'}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#16a34a] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium opacity-60">Loading Causality…</p>
        </div>
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen w-full flex items-center justify-center p-4 md:p-8 transition-colors duration-300 ${
      isDark ? 'bg-[#0c0c0e] text-white' : 'bg-[#edf4ff] text-zinc-900'
    }`}>
      
      {/* ── Fixed Outer Card Container (Spacious fixed height with NO scrolling) ── */}
      <div className={`max-w-4xl w-full h-[690px] min-h-[690px] mx-auto rounded-md p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-2xl transition-all duration-300 ${
        isDark ? 'bg-[#141416] border border-zinc-800/80 shadow-black/80' : 'bg-white border border-zinc-200/80 shadow-indigo-100'
      }`}>
        
        {/* ── Left Column: Form Section (No scrollbar / No slider) ── */}
        <div className="flex flex-col justify-between h-full py-1">
          <div>
            {/* Logo */}
            <div className="mb-5 flex items-center gap-2.5">
              <img src="/logo.svg" alt="Causality Logo" className="w-8 h-8 object-contain" />
              <span className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                Causality
              </span>
            </div>

            {/* Heading & Subtitle */}
            <div className="mb-4">
              <h1 className={`text-2xl font-bold tracking-tight mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                {mode === 'login' ? 'Welcome back!' : 'Create account'}
              </h1>
              <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {mode === 'login'
                  ? 'Enter your credentials to access your account.'
                  : 'Get started with your Causality workspace.'}
              </p>
            </div>

            {/* General Alert Messages */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-2.5 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-md mb-3 flex items-center gap-2"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs rounded-md mb-3 flex items-center gap-2"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{successMessage}</span>
              </motion.div>
            )}

            {/* ── Unified Form with Smooth Field Transitions & Validation ── */}
            <form onSubmit={handleSubmit} className="space-y-2.5">
              
              {/* Extra Signup Fields (Smooth Arrival/Vanishing) */}
              <AnimatePresence initial={false}>
                {mode === 'signup' && (
                  <motion.div
                    key="signup-extra-fields-top"
                    initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    className="space-y-2.5"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                          First name
                        </label>
                        <motion.div
                          key={`firstName-${fieldErrors.firstName ? shakeTrigger : 0}`}
                          animate={fieldErrors.firstName ? { x: [0, -6, 6, -4, 4, -2, 2, 0] } : { x: 0 }}
                          transition={{ duration: 0.35, ease: 'easeInOut' }}
                          className="relative"
                        >
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <UserIcon />
                          </span>
                          <input
                            type="text"
                            value={firstName}
                            onChange={e => {
                              setFirstName(e.target.value);
                              if (fieldErrors.firstName) setFieldErrors(prev => ({ ...prev, firstName: undefined }));
                            }}
                            placeholder="First name"
                            className={`w-full text-xs rounded-md pl-9 pr-3 py-2 border transition-all outline-none ${
                              fieldErrors.firstName
                                ? 'border-red-500 ring-1 ring-red-500/20 bg-red-500/5 text-red-500 focus:border-red-500'
                                : isDark
                                ? 'bg-[#0e0e10] border-zinc-800 text-white placeholder-zinc-500 focus:border-[#16a34a]'
                                : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-[#16a34a]'
                            }`}
                          />
                        </motion.div>
                        <AnimatePresence>
                          {fieldErrors.firstName && (
                            <motion.p
                              initial={{ opacity: 0, y: -2, height: 0 }}
                              animate={{ opacity: 1, y: 0, height: 'auto' }}
                              exit={{ opacity: 0, y: -2, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="text-[10px] text-red-500 mt-0.5"
                            >
                              {fieldErrors.firstName}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      <div>
                        <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                          Last name
                        </label>
                        <motion.div
                          key={`lastName-${fieldErrors.lastName ? shakeTrigger : 0}`}
                          animate={fieldErrors.lastName ? { x: [0, -6, 6, -4, 4, -2, 2, 0] } : { x: 0 }}
                          transition={{ duration: 0.35, ease: 'easeInOut' }}
                          className="relative"
                        >
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <UserIcon />
                          </span>
                          <input
                            type="text"
                            value={lastName}
                            onChange={e => {
                              setLastName(e.target.value);
                              if (fieldErrors.lastName) setFieldErrors(prev => ({ ...prev, lastName: undefined }));
                            }}
                            placeholder="Last name"
                            className={`w-full text-xs rounded-md pl-9 pr-3 py-2 border transition-all outline-none ${
                              fieldErrors.lastName
                                ? 'border-red-500 ring-1 ring-red-500/20 bg-red-500/5 text-red-500 focus:border-red-500'
                                : isDark
                                ? 'bg-[#0e0e10] border-zinc-800 text-white placeholder-zinc-500 focus:border-[#16a34a]'
                                : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-[#16a34a]'
                            }`}
                          />
                        </motion.div>
                        <AnimatePresence>
                          {fieldErrors.lastName && (
                            <motion.p
                              initial={{ opacity: 0, y: -2, height: 0 }}
                              animate={{ opacity: 1, y: 0, height: 'auto' }}
                              exit={{ opacity: 0, y: -2, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="text-[10px] text-red-500 mt-0.5"
                            >
                              {fieldErrors.lastName}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                        Work email
                      </label>
                      <motion.div
                        key={`email-${fieldErrors.email ? shakeTrigger : 0}`}
                        animate={fieldErrors.email ? { x: [0, -6, 6, -4, 4, -2, 2, 0] } : { x: 0 }}
                        transition={{ duration: 0.35, ease: 'easeInOut' }}
                        className="relative"
                      >
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <MailIcon />
                        </span>
                        <input
                          type="email"
                          value={email}
                          onChange={e => {
                            setEmail(e.target.value);
                            if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
                          }}
                          placeholder="user@example.com"
                          className={`w-full text-xs rounded-md pl-9 pr-4 py-2 border transition-all outline-none ${
                            fieldErrors.email
                              ? 'border-red-500 ring-1 ring-red-500/20 bg-red-500/5 text-red-500 focus:border-red-500'
                              : isDark
                              ? 'bg-[#0e0e10] border-zinc-800 text-white placeholder-zinc-500 focus:border-[#16a34a]'
                              : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-[#16a34a]'
                          }`}
                        />
                      </motion.div>
                      <AnimatePresence>
                        {fieldErrors.email && (
                          <motion.p
                            initial={{ opacity: 0, y: -2, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -2, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-[10px] text-red-500 mt-0.5"
                          >
                            {fieldErrors.email}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Username Field (Always Present) */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                  Username
                </label>
                <motion.div
                  key={`username-${fieldErrors.username ? shakeTrigger : 0}`}
                  animate={fieldErrors.username ? { x: [0, -6, 6, -4, 4, -2, 2, 0] } : { x: 0 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="relative"
                >
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <UserIcon />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={e => {
                      setUsername(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                      if (fieldErrors.username) setFieldErrors(prev => ({ ...prev, username: undefined }));
                    }}
                    placeholder="Enter your username"
                    className={`w-full text-xs rounded-md pl-9 pr-4 py-2 border transition-all outline-none ${
                      fieldErrors.username
                        ? 'border-red-500 ring-1 ring-red-500/20 bg-red-500/5 text-red-500 focus:border-red-500'
                        : isDark
                        ? 'bg-[#0e0e10] border-zinc-800 text-white placeholder-zinc-500 focus:border-[#16a34a]'
                        : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-[#16a34a]'
                    }`}
                  />
                </motion.div>
                <AnimatePresence>
                  {fieldErrors.username && (
                    <motion.p
                      initial={{ opacity: 0, y: -2, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -2, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-[10px] text-red-500 mt-0.5"
                    >
                      {fieldErrors.username}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Password Field (Always Present) */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                  Password
                </label>
                <motion.div
                  key={`password-${fieldErrors.password ? shakeTrigger : 0}`}
                  animate={fieldErrors.password ? { x: [0, -6, 6, -4, 4, -2, 2, 0] } : { x: 0 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                  className="relative"
                >
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <LockIcon />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                      if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
                    }}
                    placeholder="Enter your password"
                    className={`w-full text-xs rounded-md pl-9 pr-10 py-2 border transition-all outline-none ${
                      fieldErrors.password
                        ? 'border-red-500 ring-1 ring-red-500/20 bg-red-500/5 text-red-500 focus:border-red-500'
                        : isDark
                        ? 'bg-[#0e0e10] border-zinc-800 text-white placeholder-zinc-500 focus:border-[#16a34a]'
                        : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-[#16a34a]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon show={showPassword} />
                  </button>
                </motion.div>
                <AnimatePresence>
                  {fieldErrors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -2, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -2, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-[10px] text-red-500 mt-0.5"
                    >
                      {fieldErrors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Workspace Field (Smooth Arrival/Vanishing for Signup) */}
              <AnimatePresence initial={false}>
                {mode === 'signup' && (
                  <motion.div
                    key="signup-extra-field-bottom"
                    initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                  >
                    <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                      Workspace / Tenant name
                    </label>
                    <motion.div
                      key={`tenantName-${fieldErrors.tenantName ? shakeTrigger : 0}`}
                      animate={fieldErrors.tenantName ? { x: [0, -6, 6, -4, 4, -2, 2, 0] } : { x: 0 }}
                      transition={{ duration: 0.35, ease: 'easeInOut' }}
                      className="relative"
                    >
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <BuildingIcon />
                      </span>
                      <input
                        type="text"
                        value={tenantName}
                        onChange={e => {
                          setTenantName(e.target.value);
                          if (fieldErrors.tenantName) setFieldErrors(prev => ({ ...prev, tenantName: undefined }));
                        }}
                        placeholder="Example Workspace"
                        className={`w-full text-xs rounded-md pl-9 pr-4 py-2 border transition-all outline-none ${
                          fieldErrors.tenantName
                            ? 'border-red-500 ring-1 ring-red-500/20 bg-red-500/5 text-red-500 focus:border-red-500'
                            : isDark
                            ? 'bg-[#0e0e10] border-zinc-800 text-white placeholder-zinc-500 focus:border-[#16a34a]'
                            : 'bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-[#16a34a]'
                        }`}
                      />
                    </motion.div>
                    <AnimatePresence>
                      {fieldErrors.tenantName && (
                        <motion.p
                          initial={{ opacity: 0, y: -2, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                          exit={{ opacity: 0, y: -2, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-[10px] text-red-500 mt-0.5"
                        >
                          {fieldErrors.tenantName}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 mt-2 rounded-md bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-40 text-white font-medium text-xs tracking-wide shadow-md shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                  </>
                ) : (
                  mode === 'login' ? 'Sign in' : 'Create account'
                )}
              </button>
            </form>
          </div>

          {/* Bottom Switcher Link */}
          <div className="text-center pt-3 border-t border-zinc-800/30">
            <span className="text-xs text-zinc-500">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setErrorMessage(null);
                setSuccessMessage(null);
                setFieldErrors({});
              }}
              className="text-xs text-[#16a34a] font-semibold hover:underline cursor-pointer bg-transparent border-none p-0"
            >
              {mode === 'login' ? 'Create account' : 'Sign in'}
            </button>
          </div>
        </div>

        {/* ── Right Column: Fixed Size Image Panel ── */}
        <div className="rounded-md overflow-hidden h-full min-h-[620px] relative bg-zinc-900">
          <img
            src="/auth-bg.jpg"
            alt="Causality Visual"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* ── Theme Switcher Button (Icon Only) ── */}
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className={`fixed bottom-6 right-6 z-50 rounded-md w-9 h-9 flex items-center justify-center shadow-xl border cursor-pointer hover:scale-105 transition-all duration-200 backdrop-blur-md ${
          isDark
            ? 'bg-zinc-900/90 text-white border-zinc-700 hover:bg-zinc-800'
            : 'bg-white/95 text-zinc-900 border-zinc-300 hover:bg-zinc-100'
        }`}
        title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        aria-label="Toggle theme"
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </button>
    </div>
  );
}

// ─── Export wrapped in Suspense ───────────────────────────────

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-[#0c0c0e] flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#16a34a] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-medium text-zinc-400">Loading Causality…</p>
          </div>
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
