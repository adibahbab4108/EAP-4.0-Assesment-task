import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Log error stack for debugging
  console.error(`[Error] ${statusCode} - ${message}`);
  if (statusCode === 500) {
    console.error(err);
  }
  
  res.status(statusCode).json({
    success: false,
    message,
  });
};
