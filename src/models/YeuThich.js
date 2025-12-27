const mongoose = require("mongoose");

const yeuThichSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
    indexes: [{ unique: true, fields: ["nguoiDung", "khoaHoc"] }],
  }
);

// tránh user like trùng 1 khóa học
yeuThichSchema.index(
  { nguoiDung: 1, khoaHoc: 1 },
  { unique: true }
);

module.exports = mongoose.model("YeuThich", yeuThichSchema);
