import mongoose from "mongoose"
import { DB_URL } from "../config/config.service";

export const checkConnectionDB = async () => {
    try {
        await mongoose.connect(DB_URL!), 
        console.log("Connected to the database successfully");
    } catch (error) {
        console.error("Error connecting to the database:", error);
    }
}