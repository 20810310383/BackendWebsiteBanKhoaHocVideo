const mongoose = require("mongoose");

const binhLuanSchema = new mongoose.Schema(
  {
    nguoiDung: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    khoaHoc: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KhoaHoc",
      required: true,
    },
    noiDung: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BinhLuan", binhLuanSchema);
