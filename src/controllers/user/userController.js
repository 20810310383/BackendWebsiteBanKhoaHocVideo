const User = require("../../models/User");
const WalletTransaction = require("../../models/WalletTransaction");

/* ================= GET ALL USERS (ADMIN) ================= */
exports.getAllUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive !== undefined)
      filter.isActive = req.query.isActive === "true";

    const [data, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("getAllUsers:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* ================= GET USER BY ID (ADMIN) ================= */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    res.json(user);
  } catch (err) {
    res.status(400).json({ message: "ID không hợp lệ" });
  }
};

/* ================= CREATE USER (ADMIN) ================= */
exports.createUser = async (req, res) => {
  try {
    const { hoTen, email, soDienThoai, password, role } = req.body;

    if (!hoTen || !email || !password)
      return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc" });

    const existed = await User.findOne({ email });
    if (existed)
      return res.status(400).json({ message: "Email đã tồn tại" });

    const user = await User.create({
      hoTen,
      email,
      soDienThoai,
      password,
      role: role || "user",
    });

    res.status(201).json({
      message: "Tạo người dùng thành công",
      data: user,
    });
  } catch (err) {
    console.error("createUser:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* ================= UPDATE USER (ADMIN) ================= */
exports.updateUser = async (req, res) => {
  try {
    const { hoTen, soDienThoai, diaChi, avatar, role, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    if (hoTen) user.hoTen = hoTen;
    if (soDienThoai) user.soDienThoai = soDienThoai;
    if (diaChi) user.diaChi = diaChi;
    if (avatar !== undefined) user.avatar = avatar;
    if (role) user.role = role;
    if (typeof isActive === "boolean") user.isActive = isActive;

    await user.save();

    res.json({
      message: "Cập nhật người dùng thành công",
      data: user,
    });
  } catch (err) {
    console.error("updateUser:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* ================= DELETE USER (ADMIN) ================= */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    res.json({ message: "Xóa người dùng thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* ================= CỘNG / TRỪ SỐ DƯ (ADMIN) ================= */
exports.updateSoDu = async (req, res) => {
  try {
    const { amount, type } = req.body; 
    // type: "add" | "sub"

    if (!amount || amount <= 0)
      return res.status(400).json({ message: "Số tiền không hợp lệ" });

    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    const soDuTruoc = user.soDu;
    let noiDungGiaoDich = (type === "add" ? "Admin cộng tiền thủ công" : "Admin trừ tiền thủ công");

    if (type === "add") {
      user.soDu += amount;
    } else if (type === "sub") {
      if (user.soDu < amount)
        return res.status(400).json({ message: "Số dư không đủ" });
      user.soDu -= amount;
    } else {
      return res.status(400).json({ message: "Type không hợp lệ" });
    }

    const soDuSau = user.soDu;

    // 1. LƯU LỊCH SỬ BIẾN ĐỘNG SỐ DƯ (Cho User xem)
    const transactionLog = new WalletTransaction({
      nguoiDung: user._id,
      loaiGiaoDich: type === "add" ? "NAP_TIEN_THU_CONG" : "TRU_TIEN_THU_CONG", // Hoặc tạo thêm loại "DIEU_CHINH_AD"
      soTien: type === "add" ? amount : -amount,
      soDuTruoc: soDuTruoc,
      soDuSau: soDuSau,
      noiDung: noiDungGiaoDich,
      maThamChieu: `AD_MANUAL_${Date.now()}`, // Đánh dấu đây là giao dịch thủ công
    });

    // await user.save();

    await Promise.all([
      user.save(),
      transactionLog.save()
    ]);

    res.json({
      message: "Cập nhật số dư thành công",
      soDu: user.soDu,
    });
  } catch (err) {
    console.error("updateSoDu:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* ================= USER TỰ XEM PROFILE ================= */
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};
