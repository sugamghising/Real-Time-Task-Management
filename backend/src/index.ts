import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

const app = express();
dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));


app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});