export type NavigatorErrorCode =
  | "UNAUTHORIZED"
  | "INVALID_REQUEST"
  | "RATE_LIMITED"
  | "OPENAI_ERROR"
  | "NETWORK_ERROR"
  | "STREAM_ERROR"
  | "CONFIGURATION_ERROR"
  | "INTERNAL_ERROR";

export class NavigatorException extends Error {
  constructor(
    public readonly code: NavigatorErrorCode,
    message: string,
    public readonly statusCode: number = 500
  ) {
    super(message);

    this.name = "NavigatorException";

    Object.setPrototypeOf(this, NavigatorException.prototype);
  }
}

export function getNavigatorError(error: unknown): NavigatorException {
  if (error instanceof NavigatorException) {
    return error;
  }

  if (error instanceof Error) {
    return new NavigatorException(
      "INTERNAL_ERROR",
      "Navigator encountered an unexpected error.",
      500
    );
  }

  return new NavigatorException(
    "INTERNAL_ERROR",
    "Something went wrong. Please try again.",
    500
  );
}

export function createNavigatorErrorResponse(
  error: unknown
): {
  error: {
    code: NavigatorErrorCode;
    message: string;
  };
  status: number;
} {
  const normalized = getNavigatorError(error);

  return {
    error: {
      code: normalized.code,
      message: normalized.message,
    },
    status: normalized.statusCode,
  };
}
