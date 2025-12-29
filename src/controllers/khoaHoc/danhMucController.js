const DanhMuc = require("../../models/DanhMuc");

/* ================= CREATE ================= */
exports.createDanhMuc = async (req, res) => {
  try {
    const { ten, moTa, anh } = req.body;
    console.log("req.user:", req.user);

    const loai = await DanhMuc.create({ ten, moTa, anh });

    res.status(201).json({
      message: "Tạo loại khoá học thành công",
      data: loai,
    });
  } catch (error) {
    console.error("createDanhMuc:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* ================= GET ALL (PAGINATION) ================= */
exports.getAllDanhMuc = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      DanhMuc.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      DanhMuc.countDocuments(),
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
exports.getDanhMucById = async (req, res) => {
  try {
    const loai = await DanhMuc.findById(req.params.id);
    if (!loai) {
      return res.status(404).json({ message: "Không tìm thấy loại khoá học" });
    }
    res.json(loai);
  } catch (error) {
    res.status(400).json({ message: "ID không hợp lệ" });
  }
};

/* ================= UPDATE ================= */
exports.updateDanhMuc = async (req, res) => {
  try {
    const { ten, moTa, anh } = req.body;

    const loai = await DanhMuc.findById(req.params.id);
    if (!loai) {
      return res.status(404).json({ message: "Không tìm thấy loại khoá học" });
    }

    if (ten) loai.ten = ten;
    if (moTa) loai.moTa = moTa;
    if (anh !== undefined) loai.anh = anh;

    await loai.save();

    res.json({
      message: "Cập nhật loại khoá học thành công",
      data: loai,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* ================= DELETE ================= */
exports.deleteDanhMuc = async (req, res) => {
  try {
    const loai = await DanhMuc.findByIdAndDelete(req.params.id);
    if (!loai) {
      return res.status(404).json({ message: "Không tìm thấy loại khoá học" });
    }

    res.json({ message: "Xóa loại khoá học thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};
