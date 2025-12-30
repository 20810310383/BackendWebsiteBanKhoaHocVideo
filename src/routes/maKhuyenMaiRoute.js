const express = require("express");
const { createMaKhuyenMai, getAllMaKhuyenMai, getMaKhuyenMaiById, updateMaKhuyenMaiById, deleteMaKhuyenMaiById } = require("../controllers/maKhuyenMai/maKhuyenMaiController");
const { protect } = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const router = express.Router();

router.post("/", protect, adminMiddleware, createMaKhuyenMai);
router.get("/", getAllMaKhuyenMai);
router.get("/:id",  getMaKhuyenMaiById);
router.put("/:id", protect, adminMiddleware, updateMaKhuyenMaiById);
router.delete("/:id", protect, adminMiddleware, deleteMaKhuyenMaiById);

module.exports = router;