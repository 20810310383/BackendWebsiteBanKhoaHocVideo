const mongoose = require("mongoose");

const donHangSchema = new mongoose.Schema(
  {
    nguoiDung: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Lưu ID gốc để truy vấn nếu cần
    khoaHocGocId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KhoaHoc",
    },
    // SNAPSHOT: Lưu lại toàn bộ thông tin khóa học tại thời điểm mua
    thongTinKhoaHoc: {
      tieuDe: String,
      hinhAnh: String,
      moTa: String,
      maKhoaHoc: String,
      baiHoc: [
        {
          tieuDe: String,
          video: String,
          thoiLuong: Number,
        }
      ],
    },
    giaGoc: Number,         // Giá niêm yết của khóa học
    giaHeThong: Number,     // Giá sau khi giảm giá của hệ thống
    maKhuyenMai: String,    // Lưu mã code voucher đã dùng (nếu có)
    soTienGiamVoucher: {
      type: Number,
      default: 0
    },
    tongTien: {             // Số tiền thực tế user bị trừ
      type: Number,
      required: true,
      min: 0,
    },
    phuongThucThanhToan: {
      type: String,
      default: "SoDuTaiKhoan"
    },
    trangThai: {
      type: Boolean,
      default: true, // Thanh toán bằng số dư thành công thì set true luôn
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DonHang", donHangSchema);