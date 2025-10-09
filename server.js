// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public")); // serve dashboard frontend

// ✅ Check API key
console.log(
  "NOWPayments API Key Loaded:",
  process.env.NOWPAYMENTS_API_KEY ? "✅ Yes" : "❌ No"
);

// ✅ Test route
app.get("/api", (req, res) => {
  res.json({ message: "CryptoX Backend Running ✅" });
});

// ✅ Test connection with NOWPayments
app.get("/api/nowpayments", async (req, res) => {
  try {
    const response = await fetch("https://api.nowpayments.io/v1/status", {
      headers: { "x-api-key": process.env.NOWPAYMENTS_API_KEY },
    });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching from NOWPayments:", error);
    res.status(500).json({ error: "Failed to connect to NOWPayments API" });
  }
});

// ✅ Create Deposit Address
app.post("/api/create-deposit", async (req, res) => {
  const { coin, amount } = req.body;
  try {
    const response = await fetch("https://api.nowpayments.io/v1/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NOWPAYMENTS_API_KEY,
      },
      body: JSON.stringify({
        price_amount: amount,
        price_currency: "usd",
        pay_currency: coin.toLowerCase(),
        order_id: Date.now().toString(),
        order_description: "CryptoX Deposit",
      }),
    });

    const data = await response.json();

    // ✅ Add a generated QR code link
    if (data.payment_id && data.pay_address) {
      const qrCodeUrl = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(
        data.pay_address
      )}`;

      // ✅ Send QR code along with NOWPayments data
      return res.json({
        ...data,
        qr_code: qrCodeUrl,
      });
    }

    res.status(400).json({ error: "Failed to generate deposit" });
  } catch (error) {
    console.error("Deposit creation failed:", error);
    res.status(500).json({ error: "Deposit creation failed" });
  }
});




// ✅ Simple mock balance and withdraw route (for testing)
let balance = 0;

app.get("/api/balance", (req, res) => {
  res.json({ balance });
});

app.post("/api/withdraw", (req, res) => {
  const { amount } = req.body;
  if (amount > balance) {
    return res.json({ success: false, message: "Insufficient balance." });
  }
  balance -= amount;
  res.json({ success: true, message: "Withdrawal processed." });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
