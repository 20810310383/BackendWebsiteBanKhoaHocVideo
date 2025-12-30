const mongoose = require("mongoose");
const crypto = require("crypto");

const danhMucSchema = new mongoose.Schema(
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
     