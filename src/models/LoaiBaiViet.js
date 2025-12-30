const mongoose = require("mongoose");
const crypto = require("crypto");
const loaiBaiVietSchema = new mongoose.Schema(
  {
    maLoaiBV: {  
      type: String,
      unique: true, // Đảm bảo mã không trùng lặp giữa các user
      uppercase: true, // Tự động chuyển thành chữ hoa
      default: () => {
        // Sinh 6 ký tự ngẫu nhiên (chữ và số)
        return crypto.randomBytes(3).toString("hex").toUpperCase();
      }
    },
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
