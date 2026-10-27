import type { ErrorInfo, PropsWithChildren, ReactNode } from 'react';
import { Component } from 'react';

interface ApplicationErrorBoundaryState {
  hasError: boolean;
}

export class ApplicationErrorBoundary extends Component<
  PropsWithChildren,
  ApplicationErrorBoundaryState
> {
  public state: ApplicationErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): ApplicationErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(_error: Error, _errorInfo: ErrorInfo): void {
    window.location.replace('/');
  }

  public render(): ReactNode {
    return this.state.hasError ? null : this.props.children;
  }
}
