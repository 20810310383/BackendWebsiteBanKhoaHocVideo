const DonHang = require("../../models/DonHang");
const KhoaHoc = require("../../models/KhoaHoc");
const MaKhuyenMai = require("../../models/MaKhuyenMai");
const User = require("../../models/User");

exports.thanhToanKhoaHoc = async (req, res) => {
  try {
    const { idKhoaHoc, tenma } = req.body;
    const userId = req.user._id; // Lấy từ middleware protect/verifyToken

    // 1. Kiểm tra khóa học tồn tại
    const khoaHoc = await KhoaHoc.findById(idKhoaHoc);
    if (!khoaHoc) {
      return res.status(404).json({ message: "Khóa học không tồn tại." });
    }

    // 2. Kiểm tra xem user đã mua khóa học này chưa
    // const daMua = await DonHang.findOne({ nguoiDung: userId, khoaHocGocId: idKhoaHoc, trangThai: true });
    // if (daMua) {
    //   return res.status(400).json({ message: " bạn đã sở hữu khóa học này rồi." });
    // }

    // 3. Tính toán giá tiền
    const giaHeThong = khoaHoc.gia * (1 - khoaHoc.giamGia / 100);
    let soTienGiamVoucher = 0;
    let voucherData = null;

    // 4. Xử lý Voucher (nếu có gửi lên)
    if (tenma) {
      voucherData = await MaKhuyenMai.findOne({ tenma: tenma.toUpperCase(), kichHoat: true });
      if (voucherData) {
        // Tái sử dụng logic tính giảm giá tương tự applyVoucher
        if (voucherData.loaiGiam === "tienMat") {
          soTienGiamVoucher = voucherData.giaTriGiam;
        } else {
          soTienGiamVoucher = (giaHeThong * voucherData.giaTriGiam) / 100;
          if (voucherData.giamToiDa > 0 && soTienGiamVoucher > voucherData.giamToiDa) {
            soTienGiamVoucher = voucherData.giamToiDa;
          }
        }
      }
    }

    const tongTienThanhToan = Math.max(0, giaHeThong - soTienGiamVoucher);

    // 5. Kiểm tra số dư người dùng
    const user = await User.findById(userId);
    if (user.soDu < tongTienThanhToan) {
      return res.status(400).json({ message: "Số dư không đủ. Vui lòng nạp thêm tiền." });
    }

    // 6. THỰC HIỆN GIAO DỊCH (Trừ tiền và tạo đơn)
    user.soDu -= tongTienThanhToan;
    await user.save();

    const moiDonHang = new DonHang({
      nguoiDung: userId,
      khoaHocGocId: idKhoaHoc,
      thongTinKhoaHoc: {
        tieuDe: khoaHoc.tieuDe,
        hinhAnh: khoaHoc.hinhAnh,
        moTa: khoaHoc.moTa,
        maKhoaHoc: khoaHoc.maKhoaHoc,
        baiHoc: khoaHoc.baiHoc // Lưu snapshot toàn bộ bài học
      },
      giaGoc: khoaHoc.gia,
      giaHeThong: giaHeThong,
      maKhuyenMai: tenma || null,
      soTienGiamVoucher: soTienGiamVoucher,
      tongTien: tongTienThanhToan,
      trangThai: true
    });

    await moiDonHang.save();

    res.status(200).json({
      message: "Thanh toán thành công! Chúc bạn học tập tốt.",
      soDuConLai: user.soDu,
      donHang: moiDonHang
    });

  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống khi thanh toán", error: error.message });
  }
};

// API lấy danh sách khóa học đã mua của User
exports.getKhoaHocDaMua = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6; // Mỗi trang 6 khóa học cho đẹp giao diện
    const skip = (page - 1) * limit;

    const total = await DonHang.countDocuments({ 
      nguoiDung: req.user._id, 
      trangThai: true 
    });

    const orders = await DonHang.find({ 
      nguoiDung: req.user._id, 
      trangThai: true 
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách khóa học" });
  }
};
// ✅ Lấy tất cả đơn hàng (Dành cho Admin)
exports.getAllDonHang = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    let query = {};

    if (search) {
      // 1. Tìm các User có tên hoặc email khớp với từ khóa
      const users = await User.find({
        $or: [
          { hoTen: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { soDienThoai: { $regex: search, $options: "i" } }
        ]
      }).select("_id");

      const userIds = users.map(u => u._id);

      // 2. Xây dựng query cho DonHang
      query = {
        $or: [
          { "thongTinKhoaHoc.tieuDe": { $regex: search, $options: "i" } }, // Tìm theo tên khóa học
          { "maKhuyenMai": { $regex: search, $options: "i" } },           // Tìm theo mã giảm giá
          { nguoiDung: { $in: userIds } }                               // Tìm theo danh sách User tìm được
        ]
      };

      // 3. Nếu search là một ID hợp lệ của MongoDB, tìm theo ID đơn hàng luôn
      if (search.match(/^[0-9a-fA-F]{24}$/)) {
        query.$or.push({ _id: search });
      }
    }

    const orders = await DonHang.find(query)
      .populate("nguoiDung", "hoTen email maNguoiDung soDienThoai avatar")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await DonHang.countDocuments(query);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách đơn hàng", error: error.message });
  }
};

// ✅ Lấy chi tiết 1 đơn hàng
exports.getDonHangById = async (req, res) => {
  try {
    const order = await DonHang.findById(req.params.id).populate("nguoiDung", "hoTen email");
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// ✅ Cập nhật trạng thái đơn hàng (Ví dụ: Chuyển từ chưa thanh toán sang đã thanh toán)
exports.updateStatusDonHang = async (req, res) => {
  try {
    const { trangThai } = req.body;
    const order = await DonHang.findByIdAndUpdate(
      req.params.id, 
      { trangThai }, 
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    res.status(200).json({ success: true, message: "Cập nhật trạng thái thành công", data: order });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật đơn hàng", error: error.message });
  }
};

// ✅ Xóa đơn hàng
exports.deleteDonHang = async (req, res) => {
  try {
    const order = await DonHang.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng để xóa" });

    res.status(200).json({ success: true, message: "Đã xóa đơn hàng vĩnh viễn" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa đơn hàng", error: error.message });
  }
};

// ✅ Admin cập nhật lại nội dung bài học cho một đơn hàng cụ thể từ khóa học gốc
exports.syncCourseSnapshot = async (req, res) => {
  try {
    const { idDonHang } = req.params;

    // 1. Tìm đơn hàng
    const donHang = await DonHang.findById(idDonHang);
    if (!donHang) {
      return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    // 2. Tìm khóa học gốc dựa trên khoaHocGocId đã lưu trong đơn hàng
    const khoaHocGoc = await KhoaHoc.findById(donHang.khoaHocGocId);
    if (!khoaHocGoc) {
      return res.status(404).json({ success: false, message: "Khóa học gốc đã bị xóa, không thể đồng bộ" });
    }

    // 3. Cập nhật bài học mới vào snapshot của đơn hàng
    donHang.thongTinKhoaHoc.baiHoc = khoaHocGoc.baiHoc;
    donHang.thongTinKhoaHoc.tieuDe = khoaHocGoc.tieuDe; // Cập nhật cả tiêu đề nếu cần
    
    await donHang.save();

    res.status(200).json({
      success: true,
      message: "Đã cập nhật nội dung bài học mới nhất cho khách hàng",
      data: donHang.thongTinKhoaHoc.baiHoc
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi đồng bộ dữ liệu", error: error.message });
  }
};