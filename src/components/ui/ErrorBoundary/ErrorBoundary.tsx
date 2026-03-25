/**
 * ErrorBoundary Component
 *
 * React error boundary component class for catching and handling errors.
 * Provides Firebase error classification and user-friendly error messages.
 *
 * Features:
 * - Catches JavaScript errors in child components
 * - Firebase error classification
 * - User-friendly error messages
 * - Recovery actions
 * - Focus trap for accessibility
 *
 * @module @components/ui/ErrorBoundary/ErrorBoundary
 */

import React, { Component, type ReactNode, createRef } from 'react';
import type { ErrorBoundaryProps, ErrorBoundaryState, ErrorCategory, ErrorRecoveryAction } from '../../../types/error.types';
import { classifyFirebaseError, getErrorTitle, getErrorIcon } from '../../../utils/errorUtils';

/**
 * ErrorBoundary component class
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private containerRef = createRef<HTMLDivElement>();
  private firstButtonRef = createRef<HTMLButtonElement>();

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    this.setState({ errorInfo: { componentStack: errorInfo.componentStack } });
    this.props.onError?.(error, { componentStack: errorInfo.componentStack });
    this.reportError(error, errorInfo);
  }

  private reportError(error: Error, errorInfo: React.ErrorInfo): void {
    // TODO: Integrate with error tracking service (Sentry, LogRocket, etc.)
  }

  private getErrorDisplayInfo(): {
    title: string;
    message: string;
    icon: 'error' | 'warning' | 'info';
    actions: ErrorRecoveryAction[];
  } {
    if (!this.state.error) {
      return {
        title: 'Error',
        message: 'An unexpected error occurred.',
        icon: 'error',
        actions: [{ label: 'Try Again', action: () => this.handleReset(), primary: true }],
      };
    }

    const firebaseErrorInfo = classifyFirebaseError(this.state.error);
    return {
      title: getErrorTitle(firebaseErrorInfo.category),
      message: firebaseErrorInfo.userMessage,
      icon: getErrorIcon(firebaseErrorInfo.category),
      actions: this.getErrorActions(firebaseErrorInfo.category),
    };
  }

  private getErrorActions(category: ErrorCategory): ErrorRecoveryAction[] {
    const actions: ErrorRecoveryAction[] = [];
    switch (category) {
      case 'permission':
      case 'not-found':
        actions.push({ label: 'Go to Home', action: () => (window.location.href = '/'), primary: true });
        break;
      case 'network':
        actions.push(
          { label: 'Retry', action: () => this.handleReset(), primary: true },
          { label: 'Check Connection', action: () => window.open('https://www.google.com/search?q=is+my+internet+working', '_blank') }
        );
        break;
      case 'quota':
        actions.push({ label: 'Try Again', action: () => this.handleReset(), primary: true });
        break;
      default:
        actions.push(
          { label: 'Try Again', action: () => this.handleReset(), primary: true },
          { label: 'Go to Home', action: () => (window.location.href = '/') }
        );
    }
    return actions;
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onReset?.();
  };

  private handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Escape') {
      this.handleReset();
    }
  };

  private renderFallback(): ReactNode {
    const { title, message, icon, actions } = this.getErrorDisplayInfo();

    if (this.props.fallback) return this.props.fallback;

    return (
      <div
        ref={this.containerRef}
        role="alert"
        aria-modal="true"
        tabIndex={-1}
        onKeyDown={this.handleKeyDown}
        className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-error-container bg-error-container p-6 text-center"
      >
        <div className="mb-4">
          {icon === 'error' && <span className="material-symbols-outlined text-4xl text-error">error</span>}
          {icon === 'warning' && <span className="material-symbols-outlined text-4xl text-warning">warning</span>}
          {icon === 'info' && <span className="material-symbols-outlined text-4xl text-info">info</span>}
        </div>

        <h2 className="mb-2 font-headline text-xl font-bold text-on-surface">{title}</h2>
        <p className="mb-6 max-w-md font-body text-base text-on-surface-variant">{message}</p>

        <div className="flex flex-wrap justify-center gap-3">
          {actions.map((action, index) => (
            <button
              key={index}
              ref={index === 0 ? this.firstButtonRef : undefined}
              onClick={action.action}
              aria-label={action.label}
              className={`rounded-lg px-4 py-2 font-body text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                action.primary
                  ? 'bg-primary text-on-primary hover:bg-primary/90'
                  : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>

        {import.meta.env.DEV && this.state.error && (
          <details className="mt-6 w-full max-w-lg">
            <summary className="cursor-pointer text-sm text-on-surface-variant hover:text-on-surface">Error Details</summary>
            <pre className="mt-2 max-h-64 overflow-auto rounded bg-surface-container-highest p-4 text-left text-xs text-on-surface-variant">
              {this.state.error.toString()}
              {this.state.errorInfo?.componentStack && (
                <div className="mt-2 border-t border-outline-variant pt-2">
                  <strong>Component Stack:</strong>
                  {this.state.errorInfo.componentStack}
                </div>
              )}
            </pre>
          </details>
        )}
      </div>
    );
  }

  render(): ReactNode {
    if (this.state.hasError) return this.renderFallback();
    return this.props.children;
  }
}

export default ErrorBoundary;
