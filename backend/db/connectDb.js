import mongoose from "mongoose";
import { DBName } from "../constants.js";

const connectDb = async () => {
    try {
        const dbInstance = await mongoose.connect(
            `${process.env.MONGODB_URI}/${DBName}`,
        );
        console.log("Connected to the database: ", dbInstance.connection.host);
        return dbInstance;
    } catch (err) {
        console.error("Error connecting to the database: ", err);
        throw err;
    }
};

export { connectDb };
