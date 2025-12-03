import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
    try {
        const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/task-management";

        await mongoose.connect(mongoURI);

        console.log("MongoDB Connected Successfully");

        mongoose.connection.on("error", (error) => {
            console.error("MongoDB connection error:", error);
        });

        mongoose.connection.on("disconnected", () => {
            console.log("MongoDB disconnected");
        });

    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};
