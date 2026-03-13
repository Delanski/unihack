import { Response } from 'express';

export class ServerError extends Error {
  /** The error type, for example 'UNAUTHORIZED' */
  error: string;
  /** A human-friendly error message, for example 'A token was provided, but it is invalid.' */
  message: string;

  constructor(error: string, message: string) {
    super(message);
    this.error = error;
    this.message = message;
  }
}

export function errorToStatus(e: string): number {
  switch (e) {
    // TODO: Add other error types here
    case 'UNAUTHORIZED':
      return 401;
    // If we don't recognise the error type, we should give an error to help us find the place where
    // we need to add the mapping.
    default:
      throw new Error(`Missing status code definition for error type '${e}'!`);
  }
}

export function handleError(res: Response, err: unknown) {
  if (err instanceof ServerError) {
    return res.status(errorToStatus(err.error)).json({ error: err.message });
  }

  throw err;
}
