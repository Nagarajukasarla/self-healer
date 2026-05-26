import pg from "pg";
import { env } from "../../config/env";
import { logger } from "../../utils/logger";

export interface LocatorRow {
    id: number;
    key_name: string;
    locator_value: string;
    locator_type: string;
    page_name: string;
    description?: string;
    created_at?: Date;
    updated_at?: Date;
}

export class DbManager {
    private pool: pg.Pool;

    constructor() {
        this.pool = new pg.Pool({
            host: env.DB_HOST,
            port: env.DB_PORT,
            user: env.DB_USER,
            password: env.DB_PASSWORD,
            database: env.DB_NAME,
            // Setting a short timeout for tests/runs in case the local PG server is down
            connectionTimeoutMillis: 5000,
        });

        this.pool.on("error", (err) => {
            logger.error(err, "Unexpected error on idle PostgreSQL client");
        });
    }

    /**
     * Retrieves all locator elements from database for a specific page.
     * Returns a key-value record mapping key_name to locator_value.
     */
    async getLocators(pageName: string): Promise<Record<string, string>> {
        const queryText = `
      SELECT key_name, locator_value 
      FROM locators 
      WHERE page_name = $1
    `;

        try {
            logger.info({ pageName }, "Fetching locators from database...");
            const res = await this.pool.query<Pick<LocatorRow, "key_name" | "locator_value">>(queryText, [pageName]);
            const locatorMap: Record<string, string> = {};

            for (const row of res.rows) {
                locatorMap[row.key_name] = row.locator_value;
            }

            logger.info({ pageName, count: res.rowCount }, "Locators successfully loaded from database");
            return locatorMap;
        } catch (error) {
            logger.error({ pageName, error }, "Failed to fetch locators from database");
            throw error;
        }
    }

    /**
     * Closes the database pool connections.
     */
    async close(): Promise<void> {
        await this.pool.end();
        logger.info("PostgreSQL database connection pool closed");
    }
}

// Export a singleton instance
export const dbManager = new DbManager();
