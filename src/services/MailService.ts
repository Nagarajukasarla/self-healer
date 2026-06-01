import { logger } from "@/utils/logger";

export class MailService {

    async sendMail(subject: string, body: string): Promise<void> {

        /**
         * TODO:
         * Implement later
         */

        logger.info({ subject, body }, "Mail sended");

    }
}

export const mailService = new MailService();