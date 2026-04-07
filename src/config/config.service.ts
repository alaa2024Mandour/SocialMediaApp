import { config } from "dotenv";
import { resolve } from "node:path";

const NODE_ENV = process.env.NODE_ENV ;
config({
    path: resolve(__dirname, `.env.${NODE_ENV}`),
})

export const PORT : number = Number(process.env.PORT) || 4000;