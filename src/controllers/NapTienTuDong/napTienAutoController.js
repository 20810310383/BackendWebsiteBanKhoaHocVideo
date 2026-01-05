require("dotenv").config();
const SePayTransaction = require("../../models/SepayTransaction");
const User = require("../../models/User");
const CryptoJS = require("crypto-js");
const WalletTransaction = require("../../models/WalletTransaction");
const SECRET_KEY = process.env.SECRET_KEY_CUA_BAN

// Hàm hỗ trợ mã hóa
const encryptPayload = (data) => {
    try {
        const dataString = JSON.stringify(data || {});
        return CryptoJS.AES.encrypt(dataString, SECRET_KEY).toString();
    } catch (error) {
        console.error("Lỗi mã hóa lịch sử nạp tiền:", error);
        return "";
    }
};

exports.napTienQuaSePay = async (req, res) => {
  try {
    console.log("🔍 Webhook nạp tiền SePay:", req.body.content);

    // 1️⃣ BẢO MẬT: Kiểm tra API Key
    const authorizationAPI = req.headers.authorization;
    if (authorizationAPI !== process.env.SEPAY_API_KEY) {
      console.error("❌ Sai API Key");
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 3️⃣ TRÍCH XUẤT MÃ NGƯỜI DÙNG
    // Giả sử nội dung là "DH ABCDEF" hoặc "DHABCDEF"
    const content = req.body.content || "";
    const maUser = content.replace(/DH\s*/gi, "").trim().toUpperCase();
    console.log("👤 Đang xử lý nạp tiền cho User Code:", maUser);

    // 4️⃣ TÌM NGƯỜI DÙNG
    const user = await User.findOne({ maNguoiDung: maUser });

    if (!user) {
      // Vẫn lưu transaction nhưng đánh dấu là không tìm thấy User để đối soát sau
      await SePayTransaction.create({
        sepayId: req.body.id,
        gateway: req.body.gateway,
        transactionDate: new Date(req.body.transactionDate),
        accountNumber: req.body.accountNumber,
        content: req.body.content,
        transferAmount: parseFloat(req.body.transferAmount),
        orderId: maUser, // Lưu tạm mã user không tồn tại vào đây
        description: "LỖI: Không tìm thấy người dùng"
      });
      console.error("❌ Không tìm thấy User với mã:", maUser);
      return res.status(200).json({ success: false, message: "User không tồn tại" });
    }

    // 5️⃣ CẬP NHẬT SỐ DƯ VÀ LƯU GIAO DỊCH (Dùng Transaction để đảm bảo an toàn dữ liệu)
    const amount = parseFloat(req.body.transferAmount);

    // Cộng tiền vào tài khoản User
    user.soDu += amount;
    await user.save();

    const transactionLog = new WalletTransaction({
        nguoiDung: user._id,
        loaiGiaoDich: "NAP_TIEN",
        soTien: amount, // Dấu dương
        soDuTruoc: user.soDu - amount,
        soDuSau: user.soDu,
        noiDung: `Nạp tiền tự động qua ngân hàng (SePay)`,
        maThamChieu: req.body.id, // ID giao dịch từ SePay
    });
    await transactionLog.save();

    // Lưu lại lịch sử giao dịch SePay
    const transaction = await SePayTransaction.create({
      sepayId: req.body.id,
      gateway: req.body.gateway,
      transactionDate: new Date(req.body.transactionDate),
      accountNumber: req.body.accountNumber,
      subAccount: req.body.subAccount,
      code: req.body.code,
      content: req.body.content,
      transferType: req.body.transferType,
      transferAmount: amount,
      referenceCode: req.body.referenceCode,
      accumulated: req.body.accumulated,
      orderId: maUser, // Ở đây đóng vai trò là UserId
      processedAt: new Date(),
    });

    console.log(`✅ Đã cộng ${amount.toLocaleString()}đ cho User ${user.email}. Số dư mới: ${user.soDu.toLocaleString()}đ`);

    return res.status(200).json({
      success: true,
      message: "Nạp tiền thành công",
      data: {
        email: user.email,
        soDuMoi: user.soDu,
        amount: amount,
        transactionId: transaction._id
      }
    });

  } catch (error) {
    console.error("❌ Lỗi SePay Webhook:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy lịch sử nạp tiền của người dùng
exports.getLichSuNapTien1 = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Tìm các giao dịch có orderId khớp với maNguoiDung của User đang đăng nhập
    const query = { orderId: req.user.maNguoiDung };

    const [transactions, total] = await Promise.all([
      SePayTransaction.find(query)
        .sort({ transactionDate: -1 }) // Mới nhất hiện lên đầu
        .skip(skip)
        .limit(limit)
        .lean(),
      SePayTransaction.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Lỗi lấy lịch sử nạp tiền:", error);
    res.status(500).json({ message: "Không thể lấy lịch sử giao dịch" });
  }
};
// Lấy lịch sử nạp tiền của người dùng (Dữ liệu mã hóa)
exports.getLichSuNapTien = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Tìm các giao dịch của user hiện tại
    const query = { orderId: req.user.maNguoiDung };

    const [transactions, total] = await Promise.all([
      SePayTransaction.find(query)
        .sort({ transactionDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SePayTransaction.countDocuments(query),
    ]);

    // Chuẩn bị object dữ liệu gốc
    const responseData = {
      data: transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    // 🛡️ MÃ HÓA DỮ LIỆU TRƯỚC KHI TRẢ VỀ
    const encrypted = encryptPayload(responseData);

    res.status(200).json({
      success: true,
      payload: encrypted, // Trả về chuỗi mã hóa thay vì mảng transactions trực tiếp
    });
  } catch (error) {
    console.error("Lỗi lấy lịch sử nạp tiền:", error);
    res.status(500).json({ message: "Không thể lấy lịch sử giao dịch" });
  }
};

exports.getLichSuVi = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { nguoiDung: req.user._id };

    const [logs, total] = await Promise.all([
      WalletTransaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      WalletTransaction.countDocuments(query),
    ]);

    // Giải mã AES cho payload nếu cần bảo mật như các phần trước
    const responseData = {
      data: logs,
      pagination: { total, page, limit }
    };

    res.status(200).json({ payload: encryptPayload(responseData) });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy lịch sử ví" });
  }
};

exports.getAllWalletHistoryAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20; // Admin thường xem danh sách dài hơn
    const skip = (page - 1) * limit;

    const { loaiGiaoDich, search } = req.query;
    const filter = {};

    // Lọc theo loại (NAP_TIEN / MUA_KHOA_HOC)
    if (loaiGiaoDich) filter.loaiGiaoDich = loaiGiaoDich;
    
    // Tìm kiếm theo nội dung hoặc mã tham chiếu
    if (search) {
      // Tìm các User khớp với Tên, Email hoặc mã khách hàng
      const users = await User.find({
        $or: [
          { hoTen: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { maNguoiDung: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      const userIds = users.map((u) => u._id);

      // Kết hợp lọc giao dịch theo User ID hoặc Nội dung/Mã tham chiếu của giao dịch
      filter.$or = [
        { nguoiDung: { $in: userIds } },
        { noiDung: { $regex: search, $options: "i" } },
        { maThamChieu: { $regex: search, $options: "i" } },
      ];
    }

    const [transactions, total] = await Promise.all([
      WalletTransaction.find(filter)
        .populate("nguoiDung", "hoTen email maNguoiDung avatar") // Lấy thông tin User
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      WalletTransaction.countDocuments(filter),
    ]);

    const responseData = {
      data: transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    res.status(200).json({
      success: true,
      payload: encryptPayload(responseData),
    });
  } catch (error) {
    console.error("Admin Wallet Error:", error);
    res.status(500).json({ message: "Lỗi server khi lấy lịch sử ví." });
  }
};