import React from 'react';

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log for debugging
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="p-6">
            <h2 className="font-semibold mb-2 text-red-600">Render error</h2>
            <p className="text-sm text-red-500">{String(this.state.error?.message || this.state.error)}</p>
            <p className="text-xs opacity-70 mt-2">Open DevTools console for stack trace.</p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
