import mongoose from "mongoose"
import { ONLINE_DB_URL } from "../config/config.service";

export const checkConnectionDB = async () => {
    try {
        await mongoose.connect(ONLINE_DB_URL!), 
        console.log("Connected to the database successfully");
    } catch (error) {
        console.error("Error connecting to the database:", error);
    }
}