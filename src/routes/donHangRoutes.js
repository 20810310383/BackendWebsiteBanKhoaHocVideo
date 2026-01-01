const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { thanhToanKhoaHoc, getKhoaHocDaMua, getAllDonHang, getDonHangById, updateStatusDonHang, deleteDonHang, syncCourseSnapshot } = require("../controllers/donHang/donHangController");
const adminMiddleware = require("../middlewares/adminMiddleware");

// Thanh toán khóa học
router.post("/thanh-toan", protect, thanhToanKhoaHoc);

// Lấy danh sách khóa học đã sở hữu
router.get("/my-courses", protect, getKhoaHocDaMua);

// --- ROUTES CHO ADMIN (Quản lý đơn hàng) ---
router.get("/", protect, adminMiddleware, getAllDonHang);
router.get("/:id", protect, adminMiddleware, getDonHangById);
router.put("/:id", protect, adminMiddleware, updateStatusDonHang);
router.delete("/:id", protect, adminMiddleware, deleteDonHang);
router.put("/sync-snapshot/:idDonHang", protect, adminMiddleware, syncCourseSnapshot);

module.exports = router;