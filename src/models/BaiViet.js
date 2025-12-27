const mongoose = require("mongoose");

const baiVietSchema = new mongoose.Schema(
  {
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
