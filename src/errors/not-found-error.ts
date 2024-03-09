import CustomError from "./custom-error";

export default class NotFoundError extends CustomError {
  constructor(message: string = "Not Found") {
    super(message, 404);
  }
}
