const mongoose = require("mongoose");

const loaiBaiVietSchema = new mongoose.Schema(
  {
    ten: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    moTa: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    anh: {
      type: String, // filename ảnh đại diện
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LoaiBaiViet", loaiBaiVietSchema);
