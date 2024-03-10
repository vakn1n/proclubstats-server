import { NextFunction, Request, Response } from "express";
import CustomError from "../errors/custom-error";
import logger from "../logger";

export default function errorHandlerMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  let statusCode = 500;
  let message = "Internal Server Error";

  // Check if it's a custom error
  if (err instanceof CustomError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  logger.error(err.stack);

  res.status(statusCode).send({ message });
}
