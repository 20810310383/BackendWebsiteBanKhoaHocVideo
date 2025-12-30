const KhoaHoc = require("../../models/KhoaHoc");

/* ================= CREATE (ADMIN) ================= */
exports.createKhoaHoc = async (req, res) => {
  try {
    const data = req.body;

    const khoaHoc = await KhoaHoc.create(data);

    res.status(201).json({
      message: "Tạo khóa học thành công",
      data: khoaHoc,
    });
  } catch (err) {
    console.error("createKhoaHoc:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* ================= GET ALL + FILTER + SEARCH ================= */
exports.getAllKhoaHoc = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      tieuDe,
      danhMuc,
      isHienThi,
      giaTu,
      giaDen,
      sort
    } = req.query;

    const filter = {};

    // Xử lý logic sắp xếp
    let sortQuery = { createdAt: -1 }; // Mặc định mới nhất
    if (sort === "price_asc") sortQuery = { gia: 1 };
    if (sort === "price_desc") sortQuery = { gia: -1 };
    if (sort === "newest") sortQuery = { createdAt: -1 };

    /* ===== SEARCH THEO TIÊU ĐỀ ===== */
    if (tieuDe) {
      filter.tieuDe = { $regex: tieuDe, $options: "i" };
    }

    /* ===== LỌC THEO DANH MỤC ===== */
    if (danhMuc) {
      filter.danhMuc = danhMuc;
    }

    /* ===== LỌC THEO HIỂN THỊ ===== */
    if (isHienThi !== undefined) {
      filter.isHienThi = isHienThi === "true";
    }

    /* ===== LỌC THEO GIÁ (RADIO) ===== */
    if (giaTu || giaDen) {
      filter.gia = {};
      if (giaTu) filter.gia.$gte = Number(giaTu);
      if (giaDen) filter.gia.$lte = Number(giaDen);
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      KhoaHoc.find(filter)
        .populate("danhMuc")
        .sort(sortQuery)
        .skip(skip)
        .limit(Number(limit)),
      KhoaHoc.countDocuments(filter),
    ]);

    res.json({
      data,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("getAllKhoaHoc:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* ================= GET BY ID ================= */
exports.getKhoaHocById = async (req, res) => {
  try {
    const khoaHoc = await KhoaHoc.findOne({maKhoaHoc: req.params.id}).populate("danhMuc");

    if (!khoaHoc) {
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    }

    res.json(khoaHoc);
  } catch (err) {
    res.status(400).json({ message: "ID không hợp lệ" });
  }
};

/* ================= UPDATE (ADMIN) ================= */
exports.updateKhoaHoc = async (req, res) => {
  try {
    const khoaHoc = await KhoaHoc.findById(req.params.id);
    if (!khoaHoc) {
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    }

    Object.assign(khoaHoc, req.body);
    await khoaHoc.save();

    res.json({
      message: "Cập nhật khóa học thành công",
      data: khoaHoc,
    });
  } catch (err) {
    console.error("updateKhoaHoc:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* ================= DELETE (ADMIN) ================= */
exports.deleteKhoaHoc = async (req, res) => {
  try {
    const khoaHoc = await KhoaHoc.findByIdAndDelete(req.params.id);
    if (!khoaHoc) {
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    }

    res.json({ message: "Xóa khóa học thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

/* ================= TOGGLE HIỂN THỊ (ADMIN) ================= */
exports.toggleHienThi = async (req, res) => {
  try {
    const khoaHoc = await KhoaHoc.findById(req.params.id);
    if (!khoaHoc) {
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    }

    khoaHoc.isHienThi = !khoaHoc.isHienThi;
    await khoaHoc.save();

    res.json({
      message: "Cập nhật trạng thái hiển thị",
      isHienThi: khoaHoc.isHienThi,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};
