export const errorHandler = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;

  // Better stack trace in development
  if (Error.captureStackTrace && process.env.NODE_ENV !== "production") {
    Error.captureStackTrace(error, errorHandler);
  }

  return error;
};