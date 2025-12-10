import express from "express";
import Book from "../models/books.model.js";
import auth from "../middlewares/auth.middleware.js";
import authorizeRole from "../middlewares/authorize.middleware.js";

const router = express.Router();
router.post("/book", auth, authorizeRole(0), async (req, res) => {
  try {
    const { title, author, ISBN, publication_date, genre, total_books } =
      req.body;

    const book = await Book.create({
      title,
      author,
      ISBN,
      publication_date,
      genre,
      total_books,
      available_books_for_borrowing: total_books,
    });

    res.status(201).json({ message: "Book added", book });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/book/:id", auth, authorizeRole(0), async (req, res) => {
  try {
    const { id } = req.params;

    const { title, author, ISBN, publication_date, genre, total_books } =
      req.body;

    const updatedBook = await Book.findByIdAndUpdate(
      id,
      {
        title,
        author,
        ISBN,
        publication_date,
        genre,
        total_books,
      },
      { new: true }
    );
    if (!updatedBook) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json({ message: "Book updated", updatedBook });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/book/:id", auth, authorizeRole(0), async (req, res) => {
  try {
    const { id } = req.params;
    console.log("id", id);

    const deletedBook = await Book.findByIdAndDelete(id);
    console.log(deletedBook);

    if (!deletedBook) {
      return res.status(400).json({ error: "Error in deleting books" });
    }

    res.json({ message: "Book deleted" });
  } catch (error) {
    res.status(400).json({ statusCode: 201, error: error.message });
  }
});

router.get("/book", auth, async (req, res) => {
  try {
    const { search } = req.query;

    // Build query object
    let query = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const allBooks = await Book.find(query);

    res.json({
      statusCode: 200,
      data: allBooks,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/current_records", auth, authorizeRole(0), async (req, res) => {
  try {
    const books = await Book.find();

    let total_books = 0;
    let available_books = 0;
    let borrowed_books = 0;

    books.forEach((book) => {
      total_books += book.total_books;
      available_books += book.available_books_for_borrowing;
    });

    borrowed_books = total_books - available_books;

    res.status(200).json({
      statusCode: 200,
      message: "Summary report",
      data: {
        total_books,
        available_books,
        borrowed_books,
      },
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ statusCode: 400, message: err.message });
  }
});

export default router;
