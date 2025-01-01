/**
 * Main configuration for frontend, read from .env
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
};

const env: EnvironmentConfig = process.env as any;

export const CONFIG: typeof env= {
    // Default value, these variables can be overwritten by ...env
    NODE_ENV: 'development',
    ...env,
}