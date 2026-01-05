const mongoose = require("mongoose");

const walletTransactionSchema = new mongoose.Schema(
  {
    nguoiDung: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    loaiGiaoDich: {
      type: String,
      enum: ["NAP_TIEN", "MUA_KHOA_HOC", "NAP_TIEN_THU_CONG", "TRU_TIEN_THU_CONG"], // Phân loại giao dịch
      required: true,
    },
    soTien: {
      type: Number,
      required: true,
    },
    soDuTruoc: {
      type: Number,
      required: true,
    },
    soDuSau: {
      type: Number,
      required: true,
    },
    noiDung: {
      type: String,
      required: true,
    },
    trangThai: {
      type: String,
      enum: ["THANH_CONG", "THAT_BAI"], 
      default: "THANH_CONG",
    },
    maThamChieu: {
      type: String, // Lưu mã đơn hàng hoặc mã giao dịch SePay để đối soát
    }
  },
  { timestamps: true }
);  

module.exports = mongoose.model("WalletTransaction", walletTransactionSchema);