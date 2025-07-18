import { AppError } from '../utils/AppError.js';
import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';
import { Error as MongooseError } from 'mongoose';
import type { MongoServerError } from 'mongodb';
import type { NextFunction, Request, Response } from 'express';
import { config } from '../utils/config.js';


const handleCastErrorDB = (err: MongooseError.CastError): AppError => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, StatusCodes.BAD_REQUEST);
};

const handleDuplicateFieldsDB = (err: MongoServerError): AppError => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];

  const message = `Duplicate field value: ${value}. Please use another value.`;
  return new AppError(message, StatusCodes.BAD_REQUEST);
};

const handleValidationErrorDB = (
  err: MongooseError.ValidationError
): AppError => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(' ')}`;
  return new AppError(message, StatusCodes.BAD_REQUEST);
};

const handleJWTError = (): AppError =>
  new AppError('Invalid token. Please log in again!', StatusCodes.UNAUTHORIZED);

const handleJWTExpiredError = (): AppError =>
  new AppError(
    'Your token has expired! Please log in again.',
    StatusCodes.UNAUTHORIZED
  );

const handleZodError = (err: ZodError): AppError => {
  const errors = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
  const message = `Invalid input data. ${errors.join(' ')}`;
  return new AppError(message, StatusCodes.BAD_REQUEST);
};

const sendErrorDev = (err: AppError, res: Response): void => {
  console.error('ERROR:', err);

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: AppError, res: Response): void => {
  console.error('ERROR:', err);
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  err.statusCode ??= StatusCodes.INTERNAL_SERVER_ERROR;
  err.status ??= 'error';

  if (config.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (config.NODE_ENV === 'production') {
    let error = Object.create(err);
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if ('code' in error && (error as MongoServerError).code === 11000)
      error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (error instanceof ZodError) error = handleZodError(error);

    sendErrorProd(error, res);
  }
};
