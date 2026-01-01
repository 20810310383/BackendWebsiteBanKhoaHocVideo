const express = require("express");
const { createMaKhuyenMai, getAllMaKhuyenMai, getMaKhuyenMaiById, updateMaKhuyenMaiById, deleteMaKhuyenMaiById, applyVoucher, removeVoucher } = require("../controllers/maKhuyenMai/maKhuyenMaiController");
const { protect } = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const router = express.Router();

router.post("/", protect, adminMiddleware, createMaKhuyenMai);
router.get("/", getAllMaKhuyenMai);
router.get("/:id",  getMaKhuyenMaiById);
router.put("/:id", protect, adminMiddleware, updateMaKhuyenMaiById);
router.delete("/:id", protect, adminMiddleware, deleteMaKhuyenMaiById);

// ✅ Route áp dụng mã và giữ chỗ (Trừ soLuongMa)
// POST: /api/ma-khuyen-mai/apply
router.post("/apply", protect, applyVoucher);

// ✅ Route hủy áp dụng mã (Cộng lại soLuongMa)
// POST: /api/ma-khuyen-mai/remove
router.post("/remove", protect, removeVoucher);

module.exports = router;