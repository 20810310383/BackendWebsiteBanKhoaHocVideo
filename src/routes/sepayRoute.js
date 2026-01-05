const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { napTienQuaSePay, getLichSuNapTien, getLichSuVi, getAllWalletHistoryAdmin } = require("../controllers/NapTienTuDong/napTienAutoController");
const adminMiddleware = require("../middlewares/adminMiddleware");

// 1. Webhook nhận thông báo tiền về từ SePay
// Đường dẫn: POST /api/sepay/webhook
router.post("/webhook", napTienQuaSePay);

// 2. Lấy lịch sử giao dịch của User đang đăng nhập
// Đường dẫn: GET /api/sepay/history
router.get("/history", protect, getLichSuNapTien);
router.get("/history-vi", protect, getLichSuVi);

// 3. Lấy toàn bộ lịch sử giao dịch ví của tất cả người dùng (Admin)
router.get(
  "/wallet/all-history", 
  protect, 
  adminMiddleware, 
  getAllWalletHistoryAdmin
);

module.exports = router;