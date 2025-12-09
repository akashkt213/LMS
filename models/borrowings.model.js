import mongoose from "mongoose";

const borrowRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },

    borrowDate: {
      type: Date,
      default: Date.now,
    },

    returnDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["BORROWED", "RETURNED"],
      default: "BORROWED",
    },
  },
  { timestamps: true }
);

const Borrowing = mongoose.model("BorrowRecord", borrowRecordSchema);

export default Borrowing