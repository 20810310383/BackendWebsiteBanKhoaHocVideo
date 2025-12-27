const mongoose = require("mongoose");

const danhMucSchema = new mongoose.Schema(
  {
    ten: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    moTa: {
      type: String,
      trim: true,
    },
    anh: {
      type: String, // filename
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DanhMuc", danhMucSchema);
