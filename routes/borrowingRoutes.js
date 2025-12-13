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

    if (book.available_books_for_borrowing <= 0) {
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
      book.available_books_for_borrowing -= 1;
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
      book.available_books_for_borrowing += 1;
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

router.get("/history/:user_id", auth, async (req, res) => {
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
    }).populate("book");

    // console.log(curr_borrowings);
    const borrowingHistory = curr_borrowings.map((record) => {
      return {
        borrowRecordId: record._id,
        bookId: record.book._id,
        title: record.book.title,
        author: record.book.author,
        borrowDate: record.borrowDate,
        returnDate: record.returnDate,
        status: record.status,
      };
    });
    res.status(200).json({ statusCode: 200, data: borrowingHistory });
  } catch (error) {
    res.status(400).json({ statusCode: 400, data: error.message });
  }
});

router.get("/most-borrowed-books", auth, async (req, res) => {
  try {
    const result = await Borrowing.aggregate([
      {
        $group: {
          _id: "$book",
          borrowCount: { $sum: 1 }, // total times borrowed (BORROWED + RETURNED)
        },
      },
      {
        $lookup: {
          from: "books", // MongoDB collection name, not model name
          localField: "_id",
          foreignField: "_id",
          as: "bookDetails",
        },
      },
      { $unwind: "$bookDetails" },
      {
        $project: {
          _id: 0,
          bookId: "$bookDetails._id",
          title: "$bookDetails.title",
          author: "$bookDetails.author",
          genre: "$bookDetails.genre",
          borrowCount: 1,
        },
      },
      { $sort: { borrowCount: -1 } },
    ]);

    res.status(200).json({
      statusCode: 200,
      message: "Most borrowed books report",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// aggeration exercise: 1
router.get("/total_borrowed_books", async (req, res) => {
  try {
    const result = await Borrowing.aggregate([
      { $match: { status: "BORROWED" } },
      { $count: "total" },
    ]);

    const total = result.length ? result[0].total : 0;

    res.status(200).json({ status_code: 200, data: results_count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// aggeration exercise: 3 list all borrowed books
// [
//   { "bookId": "...", "userId": "...", "borrowDate": "..." }
// ]

router.get("/borrowed_books", async (req, res) => {
  try {
    const result = await Borrowing.aggregate([
      {
        $match: { status: "BORROWED" },
      },
      {
        $lookup: {
          from: "books",
          localField: "book",
          foreignField: "_id",
          as: "bookDetails",
        },
      },
      { $unwind: "$bookDetails" },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          _id: 0,
          borrowRecordId: "$_id",
          borrowDate: 1,
          title: "$bookDetails.title",
          author: "$bookDetails.author",
          user: "$userDetails.username",
          userEmail: "$userDetails.email",
        },
      },
    ]);
    res.status(200).json({ status_code: 200, data: result });
  } catch (error) {}
});

// aggeration exercise: 4 Find users and the number of books each has borrowed

router.get("/users_with_books", async (req, res) => {
  try {
    const result = await Borrowing.aggregate([
      {
        $group: {
          _id: "$user", // group by user ID (Borrowing.user)
          borrowCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id", // this _id is userId after grouping
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          username: "$userDetails.username",
          email: "$userDetails.email",
          borrowCount: 1,
        },
      },
      { $sort: { borrowCount: -1 } },
    ]);

    res.status(200).json({ status_code: 200, data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

// 69391672cf9d0cd2d50215f6
