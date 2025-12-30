const mongoose = require("mongoose");
const crypto = require("crypto"); // Thư viện có sẵn của NodeJS

const baiVietSchema = new mongoose.Schema(
  {
    maBV: {  
      type: String,
      unique: true, // Đảm bảo mã không trùng lặp giữa các user
      uppercase: true, // Tự động chuyển thành chữ hoa
      default: () => {
        // Sinh 6 ký tự ngẫu nhiên (chữ và số)
        return crypto.randomBytes(3).toString("hex").toUpperCase();
      }
    },
    tieuDe: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    noiDung: {
      type: String,
      required: true, // thường là HTML / markdown
    },
    anhDaiDien: {
      type: String, // filename ảnh
      default: null,
    },
    loaiBaiViet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LoaiBaiViet",
      required: true,
    },
    tacGia: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BaiViet", baiVietSchema);
