const app = require("./app");

const PORT = process.env.PORT || 8882;

app.listen(PORT, () => {
  console.log(
    "🚀 Backend NodeJS running at:",
    `http://localhost:${PORT}`
  );
});
