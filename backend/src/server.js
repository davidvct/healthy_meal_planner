const express = require("express");
const cors = require("cors");
const { getDb } = require("./db");

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database (creates tables + seeds data on first run)
getDb();

// Routes
app.use("/api/dishes", require("./routes/dishes"));
app.use("/api/mealplan", require("./routes/mealplan"));
app.use("/api/shopping-list", require("./routes/shoppingList"));
app.use("/api/users", require("./routes/users"));
app.use("/api/caretakers", require("./routes/caretakers"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[MealWise] Backend running on http://localhost:${PORT}`);
});
