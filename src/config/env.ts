import dotenv from "dotenv";

dotenv.config();

export const env = {
  HEADLESS: process.env.HEADLESS === "true",

  HEALER_AI_SERVICE_URL:
    process.env.HEALER_AI_SERVICE_URL || "",

  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: Number(process.env.DB_PORT || 5432),
  DB_USER: process.env.DB_USER || "postgres",
  DB_PASSWORD: process.env.DB_PASSWORD || "postgres",
  DB_NAME: process.env.DB_NAME || "locators"
};