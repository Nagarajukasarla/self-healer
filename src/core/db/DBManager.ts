import pg from "pg";
import { LocatorRow, LocatorStrategy } from "@/types/locator";
import { env } from "@/config/env";
import { logger } from "@/utils/logger";

export class DbManager {
    private pool: pg.Pool;

    constructor() {
        this.pool = new pg.Pool({
            host: env.DB_HOST,
            port: env.DB_PORT,
            user: env.DB_USER,
            password: env.DB_PASSWORD,
            database: env.DB_NAME,
            connectionTimeoutMillis: 5000,
        });

        this.pool.on("error", (err) => {
            logger.error({ err }, " Unexpected PostgreSQL pool error");
        });
    }

    /**
     * Get locator by key
     */
    async getLocator(key: string): Promise<string | null> {
        const query = `SELECT primary_locator FROM locators WHERE key_name = $1 LIMIT 1`;

        try {
            logger.info({ key }, "Fetching locator from DB");

            const result = await this.pool.query(query, [key]);

            if (result.rowCount === 0) {
                logger.warn({ key }, "Locator not found");
                return null;
            }

            logger.info({ key }, "Locator fetched successfully");

            return result.rows[0].primary_locator.value;
        } catch (error) {
            logger.error({ key, error }, "Failed to fetch locator");

            throw error;
        }
    }

    /**
     * Get locator data by key
     */
    async getLocatorData(key: string): Promise<LocatorRow | null> {
        const query = `
            SELECT
                key_name,
                primary_locator,
                metadata
            FROM locators
            WHERE key_name = $1
            LIMIT 1
        `;

        try {
            logger.info({ key }, "Fetching locator from DB");

            const result = await this.pool.query<LocatorRow>(query, [key]);

            if (result.rowCount === 0) {
                logger.warn({ key }, "Locator not found");
                return null;
            }

            logger.info({ key }, "Locator fetched successfully");

            return result.rows[0];
        } catch (error) {
            logger.error({ key, error }, "Failed to fetch locator");

            throw error;
        }
    }

    /**
    * Update primary locator
    */
    async updateLocator(key: string, locator: LocatorStrategy): Promise<void> {

        const query = `
        UPDATE locators
        SET
            primary_locator = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE key_name = $2
    `;

        try {
            await this.pool.query(query, [JSON.stringify(locator), key]);
            logger.info({ key, locator }, "Locator updated successfully");

        } catch (error) {
            logger.error({ key, locator, error }, "Failed to update locator");
            throw error;
        }
    }

    /**
     * Close DB pool
     */
    async close(): Promise<void> {
        await this.pool.end();

        logger.info("PostgreSQL pool closed");
    }
}

export const dbManager = new DbManager();