import { config } from "dotenv";
import { resolve } from "node:path";

const NODE_ENV = process.env.NODE_ENV ;
config({
    path: resolve(`.env.${NODE_ENV}`),
})

export const PORT : number = Number(process.env.PORT) || 4000;
export const DB_URL : string = process.env.DB_URL!;

export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
export const IV_LENGTH = Number(process.env.IV_LENGTH);

export const ACCESS_SECRET_KEY_USER = process.env.ACCESS_SECRET_KEY_USER;
export const REFRESH_SECRET_KEY_USER = process.env.REFRESH_SECRET_KEY_USER;

export const ACCESS_SECRET_KEY_ADMIN = process.env.ACCESS_SECRET_KEY_ADMIN;
export const REFRESH_SECRET_KEY_ADMIN = process.env.REFRESH_SECRET_KEY_ADMIN;

export const CLUDINARY_CLOUD_NAME = process.env.CLUDINARY_CLOUD_NAME;
export const CLUDINARY_API_KEY = process.env.CLUDINARY_API_KEY;
export const CLUDINARY_API_SECRET = process.env.CLUDINARY_API_SECRET;

export const REDIS_URL = process.env.REDIS_URL;

export const PREFIX_USER = process.env.PREFIX_USER;
export const PREFIX_ADMIN = process.env.PREFIX_ADMIN;

export const APPE_MAIL = process.env.APPE_MAIL;
export const SENDING_EMAIL_PASSWORD = process.env.SENDING_EMAIL_PASSWORD;
export const WHITE_LIST = process.env.WHITE_LIST?.split(",")||[];
