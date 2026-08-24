export const NODE_ENV = {
  STAGING: 'staging',
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
} as const;

export const REQUEST_METHOD = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

export const ERROR_MESSAGE = {
  // Network
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  NETWORK_TIMEOUT: 'Request timed out. Please try again.',
  NO_INTERNET: 'No internet connection available.',

  // Authentication
  JWT_EXPIRED: 'Your session has expired. Please sign in again.',
  JWT_INVALID: 'Authentication failed. Please sign in again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',

  // Server
  INTERNAL_SERVER_ERROR:
    'Something went wrong on our end. Please try again later.',
  BAD_REQUEST: 'Invalid request. Please check your input.',
  NOT_FOUND: 'Resource not found.',
  CONFLICT: 'This resource already exists.',

  // Validation
  VALIDATION_ERROR: 'Please check your input and try again.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PASSWORD: 'Password must be at least 8 characters.',

  // Operations
  OPERATION_FAILED: 'Operation failed. Please try again.',
  DUPLICATE_ENTRY: 'This entry already exists.',
  INSUFFICIENT_PERMISSIONS:
    'You do not have permission to perform this action.',

  DEFAULT: 'An unexpected error occurred. Please try again.',
};
