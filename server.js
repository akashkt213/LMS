import mongoose from "mongoose";
import dotenv from "dotenv";
import express from "express";
import userRoutes from "./routes/userRoutes.js";
import booksRoutes from './routes/booksRoutes.js'
import borrowRoutes from './routes/borrowRoutes.js'


dotenv.config();

const app = express();
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.use("/api/users", userRoutes);
app.use("/api/books", booksRoutes);
app.use("/api/borrow", borrowRoutes);


app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
