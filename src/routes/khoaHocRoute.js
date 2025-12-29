const express = require("express");
const adminMiddleware = require("../middlewares/adminMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const { getAllKhoaHoc, getKhoaHocById, createKhoaHoc, updateKhoaHoc, deleteKhoaHoc, toggleHienThi } = require("../controllers/khoaHoc/khoaHocController");
const router = express.Router();



/* ===== PUBLIC ===== */
router.get("/", getAllKhoaHoc);
router.get("/:id", getKhoaHocById);

/* ===== ADMIN ===== */
router.post("/", protect, adminMiddleware, createKhoaHoc);
router.put("/:id", protect, adminMiddleware, updateKhoaHoc);
router.delete("/:id", protect, adminMiddleware, deleteKhoaHoc);
router.put(
  "/:id/toggle-hien-thi",
  protect,
  adminMiddleware,
  toggleHienThi
);

module.exports = router;
