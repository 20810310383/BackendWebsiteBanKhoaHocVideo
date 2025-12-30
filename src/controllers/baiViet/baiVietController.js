const BaiViet = require("../../models/BaiViet");

/* ================= CREATE ================= */
exports.createBaiViet = async (req, res) => {
  try {
    const { tieuDe, noiDung, anhDaiDien, loaiBaiViet } = req.body;
    const tacGia = req.user?._id; // từ middleware auth
    console.log("req.user:", req.user);

    if (!tieuDe || !noiDung || !loaiBaiViet) {
      return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc" });
    }

    const baiViet = await BaiViet.create({
      tieuDe,
      noiDung,
      anhDaiDien,
      loaiBaiViet,
      tacGia,
    });

    res.status(201).json({
      message: "Tạo bài viết thành công",
      data: baiViet,
    });
  } catch (error) {
    console.error("createBaiViet:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* ================= GET ALL (PAGINATION) ================= */
exports.getAllBaiViet = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.loaiBaiViet) {
      filter.loaiBaiViet = req.query.loaiBaiViet;
    }

    const [data, total] = await Promise.all([
      BaiViet.find(filter)
        .populate("loaiBaiViet", "ten maLoaiBV")
        .populate("tacGia", "hoTen avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      BaiViet.countDocuments(filter),
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
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* ================= GET BY ID ================= */
exports.getBaiVietById = async (req, res) => {
  try {
    const baiViet = await BaiViet.findOne({maBV: req.params.id})
      .populate("loaiBaiViet", "ten maLoaiBV")
      .populate("tacGia", "hoTen avatar");

    if (!baiViet) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    } 

    res.json(baiViet);
  } catch (error) {
    res.status(400).json({ message: "ID không hợp lệ" });
  }
};

/* ================= UPDATE ================= */
exports.updateBaiViet = async (req, res) => {
  try {
    const { tieuDe, noiDung, anhDaiDien, loaiBaiViet } = req.body;

    const baiViet = await BaiViet.findById(req.params.id);
    if (!baiViet) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }

    if (tieuDe) baiViet.tieuDe = tieuDe;
    if (noiDung) baiViet.noiDung = noiDung;
    if (anhDaiDien !== undefined) baiViet.anhDaiDien = anhDaiDien;
    if (loaiBaiViet) baiViet.loaiBaiViet = loaiBaiViet;

    await baiViet.save();

    res.json({
      message: "Cập nhật bài viết thành công",
      data: baiViet,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* ================= DELETE ================= */
exports.deleteBaiViet = async (req, res) => {
  try {
    const baiViet = await BaiViet.findByIdAndDelete(req.params.id);
    if (!baiViet) {
      return res.status(404).json({ message: "Không tìm thấy bài viết" });
    }

    res.json({ message: "Xóa bài viết thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};
