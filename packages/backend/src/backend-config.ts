/**
 * Main configuration for backend, read from .env
 * author: Ke An Nguyen
 */
import { config } from "dotenv";
import path, { resolve } from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

config({path: resolve(__dirname, "../.env")});

type EnvironmentConfig = {
    NODE_ENV?: 'development' | 'production' | 'test',
    DATABASE_URL?: string,
    HMAC_SECRET?: string,
    PUBLIC_URL?: string,
    SMTP_HOST?: string,
    SMTP_PORT?: string,
    SMTP_USER?: string,
    SMTP_PASSWORD?: string,
};

const env: EnvironmentConfig = process.env as any;

export const CONFIG: typeof env= {
    // Default value, these variables can be overwritten by ...env
    NODE_ENV: 'development',
    HMAC_SECRET: 'devsecret',
    PUBLIC_URL: 'https://localhost',
    ...env,
    SMTP_HOST: env.NODE_ENV === 'development' ? 'mailhog' : env.SMTP_HOST,
    SMTP_PORT: env.NODE_ENV === 'development' ? '1025' : env.SMTP_PORT
}