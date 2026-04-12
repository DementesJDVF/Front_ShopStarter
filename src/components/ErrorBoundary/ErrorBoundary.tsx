import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "flowbite-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: "",
  };

  public static getDerivedStateFromError(error: Error): State {
    // Actualiza el estado para que la siguiente renderización muestre la interfaz de repuesto
    return { hasError: true, errorMessage: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in React:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4 text-center">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="mb-6 flex justify-center">
              <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">¡Ups! Algo salió mal.</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Ha ocurrido un error inesperado en la interfaz. El equipo técnico ha sido alertado (en consola).
            </p>
            <div className="bg-gray-100 dark:bg-gray-700 rounded p-3 text-left mb-6 overflow-auto max-h-32 text-sm text-red-600 dark:text-red-400 font-mono">
                {this.state.errorMessage.toString()}
            </div>
            <Button color="failure" onClick={this.handleReload} className="w-full">
              Recargar la página
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
