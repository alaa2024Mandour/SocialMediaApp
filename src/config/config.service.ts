import { config } from "dotenv";
import { resolve } from "node:path";

const NODE_ENV = process.env.NODE_ENV ;
config({
    path: resolve(`.env.${NODE_ENV}`),
})

export const PORT : number = Number(process.env.PORT) || 4000;
export const DB_URL : string = process.env.DB_URL!;