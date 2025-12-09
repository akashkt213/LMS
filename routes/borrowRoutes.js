import express from "express";
import auth from "../middlewares/auth.middleware.js";
import Book from "../models/books.model.js";
import User from "../models/user.model.js";

const router = express.Router();

router.post("/borrow", auth, async (req, res) => {
  try {
    const { id } = req.body;
    const { user } = req;
    // console.log("user", user);

    const book = await Book.findById(id);

    // console.log(book);

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    if (book.number_of_books <= 0) {
      return res.status(400).json({ error: "Book not available" });
    }
    const currUser = await User.findById(user);
    if (!currUser) {
      return res.status(404).json({ error: "User not found" });
    }

    currUser.borrowedBooks.push(book._id);

    book.number_of_books -= 1;

    await currUser.save();
    await book.save();

    res.status(200).json({ statusCode: 200, message: "Book allocated" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ statusCode: 400, message: error.message });
  }
});

router.post("/return", auth, async (req, res) => {
  try {
    const { bookId } = req.body;
    console.log(bookId);
    const { user } = req;
    if (!bookId) {
      return res.status(404).json({ error: "Book not found" });
    }

    const currUser = await User.findById(user);
    const book = await Book.findById(bookId);

    if (!currUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    currUser.borrowedBooks = currUser.borrowedBooks.filter(
      (item) => item.toString() !== bookId.toString()
    );

    book.number_of_books += 1;

    await currUser.save();
    await book.save();
    res.status(200).json({ message: "Book returned successfully" });
  } catch (error) {
    res.status(400).json({ statusCode: 400, message: error.message });
  }
});

export default router;
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MzdjOTg2Y2FlMDZhYThlNWNkY2QyNSIsImlhdCI6MTc2NTI3NTIwNywiZXhwIjoxNzY1Mjc4ODA3fQ.r5K9S80zKaPJxyY4UKATIWKWm3w8KyGWDAdLAWaFe7Y
