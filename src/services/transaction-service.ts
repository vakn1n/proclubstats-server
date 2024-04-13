import { startSession, ClientSession } from "mongoose";
import logger from "../logger";

class TransactionService {
  async withTransaction<T>(fn: (session: ClientSession) => Promise<T>): Promise<T> {
    const session = await startSession();
    session.startTransaction();
    try {
      const result = await fn(session);
      await session.commitTransaction();
      logger.info(`Commit transaction`);
      return result;
    } catch (error: any) {
      logger.info(`Abort transaction`);
      logger.error(error.message);

      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

export const transactionService = new TransactionService();
