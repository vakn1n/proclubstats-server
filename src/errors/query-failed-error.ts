import { StatusCodes } from "http-status-codes";
import CustomError from "./custom-error";

export default class QueryFailedError extends CustomError {
  constructor(message: string = "Query Failed") {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}
