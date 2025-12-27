const express = require("express");
const adminMiddleware = require("../middlewares/adminMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const { updateSoDu, getMyProfile, getAllUsers, getUserById, createUser, updateUser, deleteUser } = require("../controllers/user/userController");
const router = express.Router();



/* ===== USER ===== */
router.get("/me", protect, getMyProfile);

/* ===== ADMIN ===== */
router.get("/", protect, adminMiddleware, getAllUsers);
router.get("/:id", protect, adminMiddleware, getUserById);
router.post("/", protect, adminMiddleware, createUser);
router.put("/:id", protect, adminMiddleware, updateUser);
router.delete("/:id", protect, adminMiddleware, deleteUser);

// cộng / trừ số dư
router.put(
  "/:id/so-du",
  protect,
  adminMiddleware,
  updateSoDu
);

module.exports = router;
