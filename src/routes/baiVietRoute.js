const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const { createBaiViet, getAllBaiViet, getBaiVietById, updateBaiViet, deleteBaiViet } = require("../controllers/baiViet/baiVietController");

router.post("/", protect, adminMiddleware, createBaiViet);
router.get("/",  getAllBaiViet);
router.get("/:id", getBaiVietById);
router.put("/:id", protect, adminMiddleware, updateBaiViet);
router.delete("/:id", protect, adminMiddleware, deleteBaiViet);

module.exports = router;