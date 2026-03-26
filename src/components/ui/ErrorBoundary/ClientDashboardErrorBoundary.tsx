/**
 * ClientDashboardErrorBoundary Component
 *
 * Error boundary for Client Dashboard.
 * Captures Firebase errors and displays user-friendly message.
 * Includes "Retry" button and error logging.
 *
 * @module @components/ui/ErrorBoundary/ClientDashboardErrorBoundary
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  onRetry?: () => void;
  fallbackMessage?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ClientDashboardErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log error to console (in production, send to error tracking service)
    console.error('[ClientDashboardErrorBoundary] Error caught:', {
      error: {
        message: error.message,
        stack: error.stack,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
    });

    // Log to error tracking service (e.g., Sentry, Firebase Crashlytics)
    // if (import.meta.env.PROD) {
    //   logErrorToService(error, errorInfo);
    // }
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Call parent retry handler
    this.props.onRetry?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          className="flex min-h-[400px] flex-col items-center justify-center rounded-xl bg-surface-container-low p-8 text-center"
          role="alert"
          aria-live="assertive"
        >
          {/* Error Icon */}
          <span
            className="material-symbols-outlined text-5xl text-tertiary"
            aria-hidden="true"
          >
            error
          </span>

          {/* Error Message */}
          <h2 className="mt-4 font-headline text-headline-md font-bold text-on-surface">
            Oups, une erreur est survenue
          </h2>

          <p className="mt-2 max-w-md font-body text-body text-on-surface/70">
            {this.props.fallbackMessage ||
              "Nous n'avons pas pu charger le tableau de bord. Veuillez réessayer dans quelques instants."}
          </p>

          {/* Error Details (Development Only) */}
          {import.meta.env.DEV && this.state.error && (
            <details className="mt-4 w-full max-w-lg text-left">
              <summary className="cursor-pointer font-body text-body-sm font-medium text-on-surface/60 hover:text-on-surface">
                Détails de l'erreur (cliquez pour afficher)
              </summary>
              <pre className="mt-2 overflow-auto rounded-lg bg-surface-container-highest p-4 font-mono text-xs text-on-surface">
                {this.state.error.message}
                {this.state.error.stack && (
                  <code>{`\n\n${this.state.error.stack}`}</code>
                )}
              </pre>
            </details>
          )}

          {/* Retry Button */}
          <button
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-container px-6 py-3 font-body text-body font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            onClick={this.handleRetry}
            aria-label="Réessayer de charger le tableau de bord"
          >
            <span
              className="material-symbols-outlined text-lg"
              aria-hidden="true"
            >
              refresh
            </span>
            Réessayer
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ClientDashboardErrorBoundary;
