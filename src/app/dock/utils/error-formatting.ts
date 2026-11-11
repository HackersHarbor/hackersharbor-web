
export interface FormattedError {
    name: string;
    message: string;
    traceback?: string;
  }
  
  export function formatError(error: unknown): FormattedError {
    if (error instanceof Error) {
      return {
        name: error.name || "Error",
        message: error.message || "An unexpected error occurred.",
        traceback: error.stack,
      };
    }
  
    if (typeof error === "string") {
      return {
        name: "Error",
        message: error,
      };
    }
  
    return {
      name: "UnknownError",
      message: "An unexpected error occurred.",
    };
  }
  