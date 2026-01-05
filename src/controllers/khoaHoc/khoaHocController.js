const KhoaHoc = require("../../models/KhoaHoc");
const CryptoJS = require("crypto-js");
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY_CUA_BAN

// Hàm hỗ trợ mã hóa
const encryptPayload = (data) => {
    try {
        // 1. Kiểm tra key trước khi mã hóa
        if (!SECRET_KEY) {
            throw new Error("SECRET_KEY is undefined. Check your .env file.");
        }

        // 2. Chuyển đổi data sang JSON string
        const dataToEncrypt = data ? JSON.stringify(data) : JSON.stringify({});
        
        // 3. Thực hiện mã hóa
        return CryptoJS.AES.encrypt(dataToEncrypt, SECRET_KEY).toString();
    } catch (error) {
        console.error("Lỗi mã hóa tại Server:", error.message);
        return ""; // Trả về chuỗi rỗng để tránh crash server
    }
};

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

    const [courses, total] = await Promise.all([
        KhoaHoc.find(filter)
            .populate("danhMuc")
            .sort(sortQuery)
            .skip(skip)
            .limit(Number(limit)),
        KhoaHoc.countDocuments(filter),
    ]);

    const responseData = {
        data: courses,
        pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / limit),
        },
    };

    // Trả về payload mã hóa
    res.json({ payload: encryptPayload(responseData) });

    // const [data, total] = await Promise.all([
    //   KhoaHoc.find(filter)
    //     .populate("danhMuc")
    //     .select("-baiHoc")
    //     .sort(sortQuery)
    //     .skip(skip)
    //     .limit(Number(limit)),
    //   KhoaHoc.countDocuments(filter),
    // ]);

    // res.json({
    //   data,
    //   pagination: {
    //     total,
    //     page: Number(page),
    //     limit: Number(limit),
    //     totalPages: Math.ceil(total / limit),
    //   },
    // });
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

    // Ẩn link video trong chi tiết (Chỉ hiện tiêu đề để xem thử hoặc Sidebar)
    if (khoaHoc.baiHoc) {
        khoaHoc.baiHoc = khoaHoc.baiHoc.map(lesson => ({
            _id: lesson._id,
            tieuDe: lesson.tieuDe,
            // video: lesson.video -> KHÔNG TRẢ VỀ URL Ở ĐÂY
        }));
    }

    res.json({ payload: encryptPayload(khoaHoc) });
    // res.json(khoaHoc);
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
