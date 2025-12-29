    const express = require("express");
const { taoNoiDungAI } = require("../controllers/auth/chatGPTController");

const router = express.Router();

router.post("/generate", taoNoiDungAI);

module.exports = router;
