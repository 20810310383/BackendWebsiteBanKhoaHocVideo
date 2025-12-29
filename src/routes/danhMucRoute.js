const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const { createDanhMuc, getAllDanhMuc, getDanhMucById, updateDanhMuc, deleteDanhMuc } = require("../controllers/khoaHoc/danhMucController");
const router = express.Router();

router.post("/", protect, adminMiddleware, createDanhMuc);
router.get("/", protect, adminMiddleware, getAllDanhMuc);
router.get("/:id", protect, adminMiddleware, getDanhMucById);
router.put("/:id", protect, adminMiddleware, updateDanhMuc);
router.delete("/:id", protect, adminMiddleware, deleteDanhMuc);

module.exports = router;
