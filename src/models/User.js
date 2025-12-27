const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    hoTen: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    soDienThoai: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    avatar: {
      type: String, // filename
      default: null,
    },
    diaChi: {
      type: String,
    },
    soDu: {
      type: Number,
      default: 0,
      min: 0,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    isActive: { type: Boolean, default: true },
    currentToken: { type: String }, // ✅ token đang hoạt động
    permissions: {
        type: [String],
        default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
