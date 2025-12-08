import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: false },
  author: { type: String, required: true, unique: false },
  ISBN: { type: String, required: true, unique: true },
  publication_date: { type: Date, required: true, unique: true },
  genre: { type: String, required: false },
  number_of_books: { type: Number, required: false },
});

const Book = mongoose.model("Book", bookSchema);
export default Book;
