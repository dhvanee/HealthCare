import React from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex items-center justify-center h-full bg-background-dark/50 backdrop-blur-sm">
          <div className="text-center p-6 max-w-md mx-4">
            <div className="mb-4">
              <svg
                className="w-16 h-16 text-red-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <h2 className="text-xl font-bold text-white mb-2">
                Map Loading Error
              </h2>
              <p className="text-gray-400 mb-4">
                We're having trouble loading the map. This might be due to a network issue or browser compatibility.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                  if (this.props.onRetry) {
                    this.props.onRetry();
                  }
                }}
                className="w-full bg-primary text-background-dark font-semibold py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors"
              >
                Refresh Page
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 text-left bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <h3 className="text-sm font-semibold text-red-400 mb-2">Development Error Details:</h3>
                <pre className="text-xs text-gray-300 overflow-auto max-h-32">
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  onRetry: PropTypes.func,
};

export default ErrorBoundary;
