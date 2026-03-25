/**
 * RootErrorBoundary Component
 *
 * Global error boundary for the entire application.
 * Wraps the root component tree and handles uncaught errors.
 *
 * Features:
 * - Global error handling
 * - Error type classification
 * - Recovery actions
 * - Error logging
 * - User-friendly error display
 * - Escape key handler
 *
 * @module @components/ui/ErrorBoundary/RootErrorBoundary
 */

import React, { Component, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { ErrorBoundaryState, ErrorCategory, ErrorRecoveryAction } from '../../../types/error.types';
import { classifyRootError } from '../../../utils/errorUtils';

export interface RootErrorBoundaryProps {
  children: ReactNode;
}

/**
 * RootErrorBoundary component - Global error boundary
 */
export class RootErrorBoundary extends Component<RootErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: RootErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[RootErrorBoundary] Caught error:', error, errorInfo);
    this.setState({ errorInfo: { componentStack: errorInfo.componentStack } });
    this.logError(error, errorInfo);
  }

  private logError(error: Error, errorInfo: React.ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.group('[RootErrorBoundary] Error Details');
      console.error('Error:', error);
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
    // TODO: Integrate with error tracking service
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Escape') {
      this.handleReset();
    }
  };

  private renderErrorPage(): ReactNode {
    const { error } = this.state;
    if (!error) return null;

    const errorInfo = classifyRootError(error);
    const actions = this.getRecoveryActions(errorInfo);

    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center bg-surface p-6"
        onKeyDown={this.handleKeyDown}
        tabIndex={-1}
        role="alert"
        aria-modal="true"
      >
        <div className="max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <span className="material-symbols-outlined text-6xl text-error">error</span>
          </div>

          <h1 className="mb-4 font-headline text-2xl font-bold text-on-surface">
            {errorInfo.category === 'permission'
              ? 'Access Denied'
              : errorInfo.category === 'network'
                ? 'Connection Error'
                : errorInfo.category === 'quota'
                  ? 'Rate Limit Exceeded'
                  : 'Oops! Something went wrong'}
          </h1>

          <p className="mb-8 font-body text-base text-on-surface-variant">{errorInfo.userMessage}</p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                aria-label={action.label}
                className={`rounded-lg px-6 py-3 font-body text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  action.primary
                    ? 'bg-primary text-on-primary hover:bg-primary/90'
                    : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <Link to="/courts" className="font-body text-sm text-primary hover:text-primary/80 focus:outline-none focus:underline">
              Browse Courts
            </Link>
            <Link to="/contact" className="font-body text-sm text-primary hover:text-primary/80 focus:outline-none focus:underline">
              Contact Support
            </Link>
          </div>

          {import.meta.env.DEV && (
            <details className="mt-8 text-left">
              <summary className="cursor-pointer text-sm text-on-surface-variant hover:text-on-surface">Technical Details</summary>
              <pre className="mt-2 max-h-96 overflow-auto rounded-lg bg-surface-container-highest p-4 text-xs text-on-surface-variant">
                <strong>Error:</strong> {error.toString()}
                {'\n\n'}
                <strong>Stack:</strong> {error.stack}
                {this.state.errorInfo?.componentStack && (
                  <>
                    {'\n\n'}
                    <strong>Component Stack:</strong>
                    {this.state.errorInfo.componentStack}
                  </>
                )}
              </pre>
            </details>
          )}
        </div>

        <footer className="mt-12 text-center text-sm text-on-surface-variant">
          <p>Tennis Club du François</p>
          <p className="mt-1">© {new Date().getFullYear()} All rights reserved</p>
        </footer>
      </div>
    );
  }

  private getRecoveryActions(errorInfo: ReturnType<typeof classifyRootError>): ErrorRecoveryAction[] {
    const actions: ErrorRecoveryAction[] = [];
    switch (errorInfo.category) {
      case 'permission':
      case 'not-found':
        actions.push({ label: 'Go to Home', action: () => (window.location.href = '/'), primary: true });
        break;
      case 'network':
        actions.push(
          { label: 'Retry', action: () => this.handleReset(), primary: true },
          { label: 'Check Connection', action: () => window.open('https://www.google.com/search?q=is+my+internet+working', '_blank', 'noopener,noreferrer') }
        );
        break;
      case 'quota':
        actions.push({ label: 'Try Again', action: () => this.handleReset(), primary: true });
        break;
      default:
        actions.push(
          { label: 'Reload Page', action: () => window.location.reload(), primary: true },
          { label: 'Go to Home', action: () => (window.location.href = '/') }
        );
    }
    return actions;
  }

  render(): ReactNode {
    if (this.state.hasError) return this.renderErrorPage();
    return this.props.children;
  }
}

export default RootErrorBoundary;
