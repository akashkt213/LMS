import express from "express";
import auth from "../middlewares/auth.middleware.js";
import Book from "../models/books.model.js";
import User from "../models/user.model.js";
import Borrowing from "../models/borrowings.model.js";

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

    const borrowedBook = await Borrowing.create({
      user: currUser,
      book,
      borrowDate: new Date().toLocaleDateString("en-US"),
      status: "BORROWED",
    });

    if (borrowedBook) {
      book.number_of_books -= 1;
      await book.save();
    }

    res
      .status(200)
      .json({ statusCode: 200, message: "Book allocated", data: borrowedBook });
  } catch (error) {
    console.log(error);
    res.status(400).json({ statusCode: 400, message: error.message });
  }
});

router.post("/return", auth, async (req, res) => {
  try {
    const { bookId, recordId } = req.body;

    const { user } = req;

    const currUser = await User.findById(user);
    const book = await Book.findById(bookId);

    if (!currUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    const returnedBook = await Borrowing.findByIdAndUpdate(
      recordId,
      {
        returnDate: new Date().toLocaleDateString("en-US"),
        status: "RETURNED",
      },
      { new: true }
    );

    if (returnedBook) {
      book.number_of_books += 1;
      await book.save();
    }

    res.status(200).json({
      statusCode: 200,
      message: "Book returned successfully",
      data: returnedBook,
    });
  } catch (error) {
    res.status(400).json({ statusCode: 400, message: error.message });
  }
});

router.get("/current_borrowings/:user_id", auth, async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(404).json({
        statusCode: 404,
        message: "Please provide user id",
      });
    }

    const curr_borrowings = await Borrowing.find({
      user: user_id,
      status: "BORROWED",
    }).populate("book");

    const currentBooksResult = curr_borrowings.map((record) => {
      return {
        borrowRecordId: record._id,
        bookId: record.book._id,
        title: record.book.title,
        author: record.book.author,
        borrowDate: record.borrowDate,
      };
    });

    res.status(200).json({
      statusCode: 200,
      message: "Retrieved data",
      data: currentBooksResult,
    });
  } catch (error) {
    res.status(400).json({ statusCode: 400, message: error.message });
  }
});

export default router;
