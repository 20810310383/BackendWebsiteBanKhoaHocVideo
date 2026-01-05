const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const multer = require("multer");

const viewEngine = require("./config/viewEngine");
const connectDB = require("./config/connectDB");

// ================= ROUTES =================
const uploadImageRoute = require("./routes/uploadImageRoute");
const uploadVideoRoute = require("./routes/uploadVideoRoute");
const authRouter = require("./routes/authRouter");
const loaiBaiVietRoute = require("./routes/loaiBaiVietRoute");
const baiVietRoute = require("./routes/baiVietRoute");
const userRoute = require("./routes/userRoute");
const danhMucRoute = require("./routes/danhMucRoute");
const khoaHocRoute = require("./routes/khoaHocRoute");
const aiRouter = require("./routes/aiRouter");
const maKhuyenMaiRoute = require("./routes/maKhuyenMaiRoute");
const donHangRoutes = require("./routes/donHangRoutes");
const sepayRoute = require("./routes/sepayRoute");
// ==========================================

require("dotenv").config();

const app = express();

// ================= DB =================
connectDB();

// ================= CORS =================
const allowedOrigins = ["http://localhost:3172"];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "upload-type"],
  })
);

app.options("/*", cors());
app.set("trust proxy", true);

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// ================= STATIC =================
app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "public", "uploads"))
);
// ================= VIEW ENGINE =================
viewEngine(app);

// ================= ROUTES MAP =================
const routes = [
  { path: "/api/upload", router: uploadImageRoute },
  { path: "/api/upload-video", router: uploadVideoRoute },
  { path: '/api/auth', router: authRouter },
  { path: '/api/loaibv', router: loaiBaiVietRoute },
  { path: '/api/bv', router: baiVietRoute },
  { path: '/api/users', router: userRoute },
  { path: '/api/khoahoc', router: khoaHocRoute },
  { path: '/api/danhmuc', router: danhMucRoute },
  { path: '/api/ai', router: aiRouter },
  { path: '/api/ma-khuyen-mai', router: maKhuyenMaiRoute },
  { path: '/api/don-hang', router: donHangRoutes },
  { path: '/api/sepay', router: sepayRoute }, 
];

routes.forEach((r) => app.use(r.path, r.router));

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

module.exports = app;
