const mongoose = require("mongoose");

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
  },
  { timestamps: true }
);

module.exports = mongoose.model("KhoaHoc", khoaHocSchema);
