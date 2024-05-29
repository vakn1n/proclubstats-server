import { ReasonPhrases, StatusCodes } from "http-status-codes";
import CustomError from "./custom-error";

export class BadRequestError extends CustomError {
  constructor(message: string = ReasonPhrases.BAD_REQUEST) {
    super(message, StatusCodes.BAD_REQUEST);
  }
}
