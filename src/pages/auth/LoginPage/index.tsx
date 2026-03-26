/**
 * Login Page - Redesigned
 *
 * Modern asymmetrical login page with:
 * - 40% left: Login form with branding
 * - 60% right: Hero image with tennis court
 * - Framer Motion animations
 * - Quick login demo accounts (dev only)
 * - Timezone badge
 *
 * Design System:
 * - Primary: #006b3f (emerald)
 * - Secondary: #9d431b (orange/brown)
 * - Surface: #f5fbf3
 * - Typography: Lexend (headlines), Work Sans (body)
 *
 * Route: /login
 *
 * @module @pages/auth/LoginPage
 */

import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

// ==========================================
// ROLE-BASED ROUTES
// ==========================================

const ROLE_ROUTES: Record<string, string> = {
  admin: '/admin',
  moniteur: '/moniteur',
  client: '/client',
};

// ==========================================
// DEMO ACCOUNTS (Development Only)
// ==========================================

const DEMO_ACCOUNTS = [
  {
    role: 'Admin',
    email: 'admin@tennis-club.com',
    password: 'Admin123!',
    color: 'text-primary',
    icon: 'admin_panel_settings',
  },
  {
    role: 'Moniteur',
    email: 'moniteur@tennis-club.com',
    password: 'Moniteur123!',
    color: 'text-secondary',
    icon: 'sports_tennis',
  },
  {
    role: 'Client',
    email: 'client@tennis-club.com',
    password: 'Client123!',
    color: 'text-tertiary',
    icon: 'person',
  },
];

// ==========================================
// ANIMATION VARIANTS
// ==========================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const formItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

const heroVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const floatingVariants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  /**
   * Handle login form submission
   */
  const handleLogin = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError(null);

      if (!email || !password) {
        setFormError('Please fill in all fields');
        return;
      }

      const result = await login(email, password, rememberMe);

      if (result.success && result.user) {
        // Redirect based on role
        const route = ROLE_ROUTES[result.user.role] || '/client';
        navigate(route, { replace: true });
      } else if (result.error) {
        setFormError(result.error);
      }
    },
    [login, navigate, email, password, rememberMe]
  );

  /**
   * Handle demo account quick login
   */
  const handleDemoLogin = useCallback(
    async (email: string, password: string) => {
      setFormError(null);
      await login(email, password, true);
    },
    [login]
  );

  /**
   * Navigate to register page
   */
  const handleNavigateToRegister = React.useCallback(() => {
    navigate('/register', { replace: false });
  }, [navigate]);

  /**
   * Navigate to forgot password page
   */
  const handleNavigateToForgotPassword = React.useCallback(() => {
    navigate('/forgot-password', { replace: false });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface flex items-center justify-center p-0 md:p-4">
      <motion.main
        initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: 'easeOut' }}
        className="w-full max-w-[1440px] flex flex-col md:flex-row bg-surface-container-lowest overflow-hidden md:rounded-xl shadow-sm min-h-screen md:min-h-[921px]"
      >
        {/* LEFT: Login Form */}
        <section className="w-full md:w-[45%] lg:w-[40%] flex flex-col p-8 md:p-12 lg:p-16 justify-between">
          {/* Branding Header */}
          <motion.header
            variants={formItemVariants}
            initial="hidden"
            animate="visible"
            className="flex items-center gap-3"
          >
            <motion.div
              className="bg-primary-fixed-dim p-2 rounded-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <span className="material-symbols-outlined text-primary text-3xl">
                sports_tennis
              </span>
            </motion.div>
            <h1 className="font-headline font-extrabold text-xl tracking-tighter text-primary">
              TENNIS CLUB DU FRANÇOIS
            </h1>
          </motion.header>

          {/* Main Form */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="py-12 flex-1"
          >
            <motion.div variants={formItemVariants} className="mb-10">
              <h2 className="font-headline font-bold text-3xl md:text-4xl text-on-surface mb-2">
                Welcome Back
              </h2>
              <p className="text-on-surface-variant text-sm font-medium">
                Access your court bookings and player stats.
              </p>
            </motion.div>

            <form onSubmit={handleLogin} className="space-y-8" noValidate>
              {/* General Error Alert */}
              <AnimatePresence>
                {(formError || error) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    role="alert"
                    className="flex items-start gap-3 rounded-lg border border-error-container bg-error-container p-4 overflow-hidden"
                  >
                    <span
                      className="material-symbols-outlined text-2xl text-error flex-shrink-0"
                      aria-hidden="true"
                    >
                      error
                    </span>
                    <p className="font-body text-sm text-on-error-container">
                      {formError || error}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <motion.div variants={formItemVariants} className="space-y-2">
                <label
                  htmlFor="email"
                  className="block font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => {}}
                  autoComplete="email"
                  required
                  aria-invalid={!!formError}
                  className="no-line-input w-full px-4 py-4 rounded-lg text-on-surface font-body text-base transition-colors"
                  placeholder="player@tennisclubfrancois.mq"
                />
              </motion.div>

              {/* Password */}
              <motion.div variants={formItemVariants} className="space-y-2">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="password"
                    className="block font-label text-xs uppercase tracking-widest text-on-surface-variant font-semibold"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleNavigateToForgotPassword}
                    className="text-[10px] uppercase font-bold tracking-tighter text-secondary hover:underline focus:outline-none focus:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => {}}
                  autoComplete="current-password"
                  required
                  aria-invalid={!!formError}
                  className="no-line-input w-full px-4 py-4 rounded-lg text-on-surface font-body text-base transition-colors"
                  placeholder="••••••••"
                />
              </motion.div>

              {/* Remember Me */}
              <motion.div variants={formItemVariants} className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-5 h-5 rounded border-outline text-primary focus:ring-primary cursor-pointer"
                />
                <label
                  htmlFor="remember"
                  className="ml-3 text-sm text-on-surface-variant cursor-pointer select-none"
                >
                  Remember my session
                </label>
              </motion.div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isLoading}
                variants={formItemVariants}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold text-lg rounded-xl shadow-lg shadow-primary/10 transition-all disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-lg shadow-primary/10"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span
                      className="material-symbols-outlined animate-spin"
                      aria-hidden="true"
                    >
                      progress_activity
                    </span>
                    Logging in...
                  </span>
                ) : (
                  'Log In'
                )}
              </motion.button>
            </form>

            {/* Signup Link */}
            <motion.div variants={formItemVariants} className="mt-12 space-y-4">
              <p className="text-sm text-on-surface-variant">
                Not a member yet?{' '}
                <button
                  type="button"
                  onClick={handleNavigateToRegister}
                  className="text-primary font-bold hover:underline focus:outline-none focus:underline"
                >
                  Create Account
                </button>
              </p>
            </motion.div>
          </motion.div>

          {/* Footer */}
          <motion.footer
            variants={formItemVariants}
            initial="hidden"
            animate="visible"
            className="flex items-center justify-between pt-8 border-t border-surface-container-high"
          >
            <div className="flex gap-6">
              <a
                href="#"
                className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60 hover:text-on-surface transition-colors"
              >
                Support
              </a>
              <a
                href="#"
                className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant/60 hover:text-on-surface transition-colors"
              >
                Privacy
              </a>
            </div>
            <a
              href="#"
              className="flex items-center gap-1 font-label text-[10px] uppercase tracking-widest text-secondary font-bold hover:text-secondary-container transition-colors"
            >
              <span className="material-symbols-outlined text-xs">admin_panel_settings</span>
              Admin Access
            </a>
          </motion.footer>
        </section>

        {/* RIGHT: Hero Image */}
        <motion.section
          variants={heroVariants}
          initial="hidden"
          animate="visible"
          className="hidden md:block md:w-[55%] lg:w-[60%] relative overflow-hidden bg-surface-container-highest"
        >
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0"
              alt="Professional clay tennis court"
              className="w-full h-full object-cover"
            />
            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/80 via-primary/30 to-transparent mix-blend-multiply" />
            <div className="absolute inset-0 bg-black/10" />
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col justify-end p-12 lg:p-20">
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.6, delay: 0.3 }}
              className="max-w-xl backdrop-blur-md bg-white/10 p-10 rounded-2xl border border-white/10"
            >
              <span className="font-label text-xs uppercase tracking-[0.3em] text-secondary-fixed mb-4 block font-bold">
                Martinique Heritage
              </span>
              <h2 className="font-headline font-extrabold text-5xl lg:text-6xl leading-[1.1] mb-6 tracking-tight text-white">
                Experience <br />
                Excellence on <br />
                the{' '}
                <span className="text-secondary-container">Clay</span>
              </h2>
              <p className="font-body text-lg text-white/90 leading-relaxed">
                Join the most prestigious tennis community in the Antilles.
              </p>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="mt-10 flex gap-12 border-t border-white/20 pt-8"
              >
                <div>
                  <p className="font-headline font-bold text-2xl text-white">08</p>
                  <p className="font-label text-[10px] uppercase tracking-widest text-white/70">
                    Premium Courts
                  </p>
                </div>
                <div>
                  <p className="font-headline font-bold text-2xl text-white">100%</p>
                  <p className="font-label text-[10px] uppercase tracking-widest text-white/70">
                    Clay Surface
                  </p>
                </div>
                <div>
                  <p className="font-headline font-bold text-2xl text-white">1982</p>
                  <p className="font-label text-[10px] uppercase tracking-widest text-white/70">
                    Since Founded
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Floating Element */}
          <motion.div
            variants={floatingVariants}
            animate="animate"
            className="absolute top-12 right-12 w-32 h-32 border border-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
          >
            <div className="w-24 h-24 border border-white/40 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white/40 text-4xl">
                light_mode
              </span>
            </div>
          </motion.div>
        </motion.section>
      </motion.main>

      {/* Timezone Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-8 z-50"
      >
        <div className="flex items-center gap-2 bg-on-surface text-surface px-4 py-2 rounded-full text-[10px] font-label uppercase tracking-widest shadow-xl">
          <span className="w-2 h-2 rounded-full bg-secondary" />
          Timezone: America/Martinique
        </div>
      </motion.div>

      {/* Demo Accounts (Development Only) */}
      {import.meta.env.DEV && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:bottom-8 md:right-8 md:mb-20 z-40"
        >
          <div className="bg-surface-container-lowest rounded-xl shadow-xl p-6 border border-surface-container-high max-w-md">
            <div className="text-center mb-4">
              <p className="font-body text-xs font-medium text-on-surface">
                Quick Login (Dev only):
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {DEMO_ACCOUNTS.map((account) => (
                <motion.button
                  key={account.role}
                  onClick={() => handleDemoLogin(account.email, account.password)}
                  disabled={isLoading}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`group relative flex flex-col items-center justify-center gap-1 rounded-lg border-2 bg-surface-container-lowest p-4 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    account.role === 'Admin'
                      ? 'border-primary focus:ring-primary'
                      : account.role === 'Moniteur'
                      ? 'border-secondary focus:ring-secondary'
                      : 'border-tertiary focus:ring-tertiary'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-2xl ${account.color}`}
                  >
                    {account.icon}
                  </span>
                  <span
                    className={`font-body text-xs font-bold ${account.color}`}
                  >
                    {account.role}
                  </span>
                </motion.button>
              ))}
            </div>

            <div className="mt-4 rounded-lg bg-surface-container-high p-3">
              <p className="font-body text-xs font-medium text-on-surface mb-2">
                Or use these credentials:
              </p>
              <ul className="space-y-1 font-body text-[10px] text-on-surface-variant">
                <li>
                  <strong>Admin:</strong> admin@tennis-club.com / Admin123!
                </li>
                <li>
                  <strong>Moniteur:</strong> moniteur@tennis-club.com / Moniteur123!
                </li>
                <li>
                  <strong>Client:</strong> client@tennis-club.com / Client123!
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default LoginPage;
