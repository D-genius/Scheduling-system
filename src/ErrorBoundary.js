import React, { Component } from 'react';
import { Alert } from '@mui/material';

class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <Alert severity="error">
          Something went wrong. Please try refreshing the page.
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;