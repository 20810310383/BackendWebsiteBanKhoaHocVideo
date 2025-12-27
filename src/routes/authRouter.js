const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { registerTK, loginTK, logoutTK, getMeTK, doiMatKhau, capNhatThongTin } = require("../controllers/auth/authController");

router.post("/register", registerTK);
router.post("/login", loginTK);
router.post("/logout", logoutTK);
router.get("/me", protect, getMeTK);

// ✅ Đổi mật khẩu
router.put("/doi-mat-khau", protect, doiMatKhau);

// ✅ Cập nhật thông tin
router.put("/cap-nhat-thong-tin", protect, capNhatThongTin);

module.exports = router;
