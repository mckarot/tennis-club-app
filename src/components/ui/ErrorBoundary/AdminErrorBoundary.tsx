/**
 * AdminErrorBoundary Component
 *
 * Error boundary specifically for admin dashboard components.
 * Catches Firebase errors and displays user-friendly messages.
 *
 * Features:
 * - Catches JavaScript errors in child components
 * - Firebase error classification
 * - User-friendly error messages
 * - Retry and Back to Dashboard actions
 * - Focus trap for accessibility
 *
 * @module @components/ui/ErrorBoundary/AdminErrorBoundary
 */

import React, { Component, type ReactNode, createRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface AdminErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onReset?: () => void;
}

export class AdminErrorBoundary extends Component<AdminErrorBoundaryProps, AdminErrorBoundaryState> {
  private containerRef = createRef<HTMLDivElement>();
  private buttonRef = createRef<HTMLButtonElement>();

  constructor(props: AdminErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<AdminErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[AdminErrorBoundary] Caught error:', error, errorInfo);
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onReset?.();
  };

  private handleBackToDashboard = (): void => {
    window.location.href = '/admin';
  };

  private handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Escape') {
      this.handleReset();
    }
  };

  private getErrorDisplay(): { title: string; message: string; icon: string } {
    if (!this.state.error) {
      return {
        title: 'Unexpected Error',
        message: 'An unexpected error occurred. Please try again.',
        icon: 'error',
      };
    }

    const errorMessage = this.state.error.message.toLowerCase();
    const errorCode = this.state.error.message;

    // Firebase Quota Exceeded Error
    if (
      errorMessage.includes('quota') ||
      errorCode.includes('QuotaExceededError') ||
      errorMessage.includes('too many requests')
    ) {
      return {
        title: 'Quota Exceeded',
        message: 'Too many requests. Please wait a moment and try again.',
        icon: 'hourglass_empty',
      };
    }

    // Firebase Invalid State Error
    if (
      errorMessage.includes('invalid state') ||
      errorCode.includes('InvalidStateError') ||
      errorMessage.includes('transaction failed') ||
      errorMessage.includes('document already exists')
    ) {
      return {
        title: 'Invalid State',
        message: 'The operation could not be completed due to a conflict. Please refresh and try again.',
        icon: 'warning',
      };
    }

    // Firebase Unavailable Error (service temporarily unavailable)
    if (
      errorMessage.includes('unavailable') ||
      errorCode.includes('UnavailableError') ||
      errorMessage.includes('service temporarily unavailable') ||
      errorMessage.includes('503')
    ) {
      return {
        title: 'Service Unavailable',
        message: 'The service is temporarily unavailable. Please try again in a few moments.',
        icon: 'cloud_off',
      };
    }

    if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
      return {
        title: 'Permission Denied',
        message: 'You do not have permission to access this resource. Please contact your administrator.',
        icon: 'lock',
      };
    }

    if (errorMessage.includes('network') || errorMessage.includes('offline')) {
      return {
        title: 'Connection Error',
        message: 'Unable to connect to the server. Please check your internet connection.',
        icon: 'wifi_off',
      };
    }

    if (errorMessage.includes('not-found') || errorMessage.includes('missing')) {
      return {
        title: 'Resource Not Found',
        message: 'The requested resource could not be found.',
        icon: 'search_off',
      };
    }

    return {
      title: 'Dashboard Error',
      message: this.state.error.message,
      icon: 'error',
    };
  }

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { title, message, icon } = this.getErrorDisplay();

    return (
      <AnimatePresence>
        <motion.div
          ref={this.containerRef}
          role="alert"
          aria-modal="true"
          tabIndex={-1}
          onKeyDown={this.handleKeyDown}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="flex min-h-[400px] flex-col items-center justify-center rounded-xl bg-surface-container-low p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <span className="material-symbols-outlined text-6xl text-secondary">{icon}</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-3 font-headline text-2xl font-bold text-on-surface"
          >
            {title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8 max-w-md font-body text-base text-on-surface-variant"
          >
            {message}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <button
              ref={this.buttonRef}
              onClick={this.handleReset}
              aria-label="Retry loading dashboard"
              className="rounded-lg bg-primary px-6 py-3 font-body text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <span className="material-symbols-outlined mr-2 inline-block align-text-bottom">refresh</span>
              Retry
            </button>

            <button
              onClick={this.handleBackToDashboard}
              aria-label="Go back to dashboard"
              className="rounded-lg bg-surface-container-highest px-6 py-3 font-body text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <span className="material-symbols-outlined mr-2 inline-block align-text-bottom">dashboard</span>
              Back to Dashboard
            </button>
          </motion.div>

          {import.meta.env.DEV && this.state.error && (
            <motion.details
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 w-full max-w-lg"
            >
              <summary className="cursor-pointer text-sm text-on-surface-variant hover:text-on-surface">
                Error Details (Development Only)
              </summary>
              <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-surface-container-highest p-4 text-left text-xs text-on-surface-variant">
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack && (
                  <div className="mt-3 border-t border-outline-variant pt-3">
                    <strong>Component Stack:</strong>
                    {this.state.errorInfo.componentStack}
                  </div>
                )}
              </pre>
            </motion.details>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }
}

export default AdminErrorBoundary;
