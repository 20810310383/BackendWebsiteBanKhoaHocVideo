const mongoose = require("mongoose");

const donHangSchema = new mongoose.Schema(
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
    tongTien: {
      type: Number,
      required: true,
      min: 0,
    },
    trangThai: {
      type: Boolean,
      default: false, // false = chưa thanh toán, true = đã mua
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DonHang", donHangSchema);
