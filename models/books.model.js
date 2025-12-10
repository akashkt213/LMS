import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: false },
  author: { type: String, required: true, unique: false },
  ISBN: { type: String, required: true, unique: true },
  publication_date: { type: Date, required: true },
  genre: { type: String, required: false },
  total_books:{ type: Number, required: true },
  available_books_for_borrowing: { type: Number, required: false },
});

const Book = mongoose.model("Book", bookSchema);
export default Book;
