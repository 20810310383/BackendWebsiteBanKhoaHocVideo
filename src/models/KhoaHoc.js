const mongoose = require("mongoose");
const crypto = require("crypto"); 
const baiHocSchema = new mongoose.Schema(
  {
    tieuDe: {
      type: String,
      required: true,
    },
    video: {
      type: String, // filename video
      required: true,
    },
    thoiLuong: {
      type: Number, // giây (optional)
    },
  },
  { _id: false }
);

const khoaHocSchema = new mongoose.Schema(
  {
    maKhoaHoc: {  
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
    },
    moTa: {
      type: String,
      required: true,
    },
    hinhAnh: {
      type: String, // filename
      required: true,
    },
    videoGioiThieu: {
      type: String, // filename hoặc url ngoài (drive)
    },
    gia: {
      type: Number,
      required: true,
      min: 0,
    },
    giamGia: {
      type: Number,
      min: 0,
      default: 0,
    },
    danhMuc: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DanhMuc",
      required: true,
    },
    baiHoc: {
      type: [baiHocSchema], // mảng video bài học
      default: [],
    },
    tags: {
      type: [String], // Mảng các chuỗi
      default: [],    // Mặc định là mảng rỗng
      index: true     // Đánh index để tìm kiếm theo tag nhanh hơn
    },
    isTrangThaiMua: { type: Boolean, default: false },
    isHienThi: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("KhoaHoc", khoaHocSchema);
