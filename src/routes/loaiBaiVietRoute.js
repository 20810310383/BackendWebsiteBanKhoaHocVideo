const express = require("express");
const { createLoaiBaiViet, getAllLoaiBaiViet, getLoaiBaiVietById, updateLoaiBaiViet, deleteLoaiBaiViet } = require("../controllers/baiViet/loaiBaiVietController");
const { protect } = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const router = express.Router();

router.post("/", protect, adminMiddleware, createLoaiBaiViet);
router.get("/", protect, adminMiddleware, getAllLoaiBaiViet);
router.get("/:id", protect, adminMiddleware, getLoaiBaiVietById);
router.put("/:id", protect, adminMiddleware, updateLoaiBaiViet);
router.delete("/:id", protect, adminMiddleware, deleteLoaiBaiViet);

module.exports = router;
