const LoaiBaiViet = require("../../models/LoaiBaiViet");

/* ================= CREATE ================= */
exports.createLoaiBaiViet = async (req, res) => {
  try {
    const { ten, moTa, anh } = req.body;
    console.log("req.user:", req.user);

    const loai = await LoaiBaiViet.create({ ten, moTa, anh });

    res.status(201).json({
      message: "Tạo loại bài viết thành công",
      data: loai,
    });
  } catch (error) {
    console.error("createLoaiBaiViet:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* ================= GET ALL (PAGINATION) ================= */
exports.getAllLoaiBaiViet = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      LoaiBaiViet.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      LoaiBaiViet.countDocuments(),
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
exports.getLoaiBaiVietById = async (req, res) => {
  try {
    const loai = await LoaiBaiViet.findById(req.params.id);
    if (!loai) {
      return res.status(404).json({ message: "Không tìm thấy loại bài viết" });
    }
    res.json(loai);
  } catch (error) {
    res.status(400).json({ message: "ID không hợp lệ" });
  }
};

/* ================= UPDATE ================= */
exports.updateLoaiBaiViet = async (req, res) => {
  try {
    const { ten, moTa, anh } = req.body;

    const loai = await LoaiBaiViet.findById(req.params.id);
    if (!loai) {
      return res.status(404).json({ message: "Không tìm thấy loại bài viết" });
    }

    if (ten) loai.ten = ten;
    if (moTa) loai.moTa = moTa;
    if (anh !== undefined) loai.anh = anh;

    await loai.save();

    res.json({
      message: "Cập nhật loại bài viết thành công",
      data: loai,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* ================= DELETE ================= */
exports.deleteLoaiBaiViet = async (req, res) => {
  try {
    const loai = await LoaiBaiViet.findByIdAndDelete(req.params.id);
    if (!loai) {
      return res.status(404).json({ message: "Không tìm thấy loại bài viết" });
    }

    res.json({ message: "Xóa loại bài viết thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};
