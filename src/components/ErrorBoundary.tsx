'use client';

import React, { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  message: string;
}

/**
 * Catches render errors so a single component failure does not white-screen the app.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message || 'Unknown error' };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // Keep console for local debugging; no external reporting in v1
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="min-h-[200px] m-4 p-6 rounded-xl border border-red-800 bg-red-950/40 text-red-100"
        >
          <h2 className="text-lg font-bold mb-2">
            {this.props.fallbackTitle ?? 'Something went wrong'}
          </h2>
          <p className="text-sm text-red-200/90 mb-4">{this.state.message}</p>
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-red-800 hover:bg-red-700 text-white text-sm font-semibold"
            onClick={() => this.setState({ hasError: false, message: '' })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
