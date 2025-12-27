const mongoose = require("mongoose");

const giaoDichSchema = new mongoose.Schema(
  {
    nguoiDung: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    loai: {
      type: String,
      enum: ["nap_tien", "mua_khoa_hoc"],
      required: true,
    },
    soTien: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GiaoDich", giaoDichSchema);
