const KhoaHoc = require("../../models/KhoaHoc");
const MaKhuyenMai = require("../../models/MaKhuyenMai");

// CREATE
exports.createMaKhuyenMai = async (req, res) => {
  try {
    const doc = new MaKhuyenMai(req.body);
    await doc.save();
    res.status(201).json({ success: true, data: doc, message: "Tạo mới thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Tạo mới thất bại", error: error.message });
  }
};

// READ (All with Pagination, Search, Sort, Filters)
exports.getAllMaKhuyenMai = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 1000, 
      search = "", 
      sortField = "createdAt", 
      sortOrder = "descend",
      // --- Bộ lọc (Filter) ---
      loaiGiam = "",
      kichHoat = "" 
    } = req.query;

    let query = {};
    // Tìm kiếm
    if (search) {
      query.$or = [
        { tenma: { $regex: search, $options: "i" } },
        { mota: { $regex: search, $options: "i" } }
      ];
    }

    // --- Áp dụng bộ lọc ---
    if (loaiGiam) {
      query.loaiGiam = loaiGiam; // 'phanTram' hoặc 'tienMat'
    }
    if (kichHoat !== "") {
      query.kichHoat = kichHoat === 'true'; // 'true' hoặc 'false'
    }
    
    // Sắp xếp
    const sortOptions = {};
    sortOptions[sortField] = sortOrder === "ascend" ? 1 : -1;

    const data = await MaKhuyenMai.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await MaKhuyenMai.countDocuments(query);

    res.json({
      success: true,
      data,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      total: count,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lấy danh sách thất bại", error: error.message });
  }
};

// READ (One by ID)
exports.getMaKhuyenMaiById = async (req, res) => {
  try {
    const doc = await MaKhuyenMai.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: "Không tìm thấy" });
    }
    res.json({ success: true, data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lấy chi tiết thất bại", error: error.message });
  }
};

// UPDATE by ID
exports.updateMaKhuyenMaiById = async (req, res) => {
  try {
    const doc = await MaKhuyenMai.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return res.status(404).json({ success: false, message: "Không tìm thấy" });
    }
    res.json({ success: true, data: doc, message: "Cập nhật thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Cập nhật thất bại", error: error.message });
  }
};

// DELETE by ID
exports.deleteMaKhuyenMaiById = async (req, res) => {
  try {
    const doc = await MaKhuyenMai.findByIdAndDelete(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: "Không tìm thấy" });
    }
    res.json({ success: true, message: "Xóa thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Xóa thất bại", error: error.message });
  }
};

// ✅ API 1: Áp dụng Voucher
exports.applyVoucher = async (req, res) => {
  try {
    const { tenma, idKhoaHoc } = req.body;

    // 1. Tìm và cập nhật trừ số lượng ngay lập tức nếu thỏa mãn điều kiện
    // Điều kiện: Tên khớp, đang kích hoạt, còn số lượng, trong thời hạn
    const now = new Date();
    const voucher = await MaKhuyenMai.findOneAndUpdate(
      { 
        tenma: tenma.toUpperCase(), 
        kichHoat: true,
        soLuongMa: { $gt: 0 },
        ngayBatDau: { $lte: now },
        ngayKetThuc: { $gte: now }
      },
      { $inc: { soLuongMa: -1 } }, // Trừ đi 1
      { new: true }
    );

    if (!voucher) {
      return res.status(400).json({ message: "Mã không tồn tại, hết hạn hoặc đã hết lượt sử dụng." });
    }

    // 2. Lấy giá khóa học để tính toán số tiền giảm (giống logic cũ)
    const khoaHoc = await KhoaHoc.findById(idKhoaHoc);
    if (!khoaHoc) {
        // Nếu không có khóa học, phải cộng lại số lượng mã vừa trừ
        await MaKhuyenMai.findByIdAndUpdate(voucher._id, { $inc: { soLuongMa: 1 } });
        return res.status(404).json({ message: "Không tìm thấy khóa học." });
    }

    const giaHeThong = khoaHoc.gia * (1 - khoaHoc.giamGia / 100);

    // Kiểm tra đơn hàng tối thiểu
    if (giaHeThong < voucher.dieuKienApDung) {
      await MaKhuyenMai.findByIdAndUpdate(voucher._id, { $inc: { soLuongMa: 1 } }); // Trả lại mã
      return res.status(400).json({ message: `Đơn hàng tối thiểu ${voucher.dieuKienApDung.toLocaleString()}đ` });
    }

    // Tính toán số tiền giảm...
    let soTienGiam = voucher.loaiGiam === "tienMat" 
        ? voucher.giaTriGiam 
        : Math.min((giaHeThong * voucher.giaTriGiam) / 100, voucher.giamToiDa || Infinity);

    res.status(200).json({
      message: "Áp dụng mã giảm giá thành công",
      voucher: { tenma: voucher.tenma, soTienGiam, tongSauGiam: giaHeThong - soTienGiam }
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
  }
};

exports.removeVoucher = async (req, res) => {
  try {
    const { tenma, idKhoaHoc } = req.body;

    // 1. Tăng lại số lượng mã trong kho
    await MaKhuyenMai.findOneAndUpdate(
      { tenma: tenma.toUpperCase() },
      { $inc: { soLuongMa: 1 } }
    );

    // 2. Tính lại giá gốc hệ thống để trả về giao diện
    const khoaHoc = await KhoaHoc.findById(idKhoaHoc);
    const giaHeThong = khoaHoc ? khoaHoc.gia * (1 - khoaHoc.giamGia / 100) : 0;

    res.status(200).json({
      message: "Đã hủy áp dụng mã giảm giá",
      giaGocHeThong: giaHeThong
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống", error: error.message });
  }
};