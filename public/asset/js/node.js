import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// Example route to create a payment
app.post("/api/create-payment", async (req, res) => {
  const response = await fetch("https://api.nowpayments.io/v1/payment", {
    method: "POST",
    headers: {
      "x-api-key": process.env.NOWPAYMENTS_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      price_amount: req.body.amount,
      price_currency: "usd",
      pay_currency: "btc",
      order_id: "test_order",
      order_description: "CryptoX Deposit",
    }),
  });
  const data = await response.json();
  res.json(data);
});

app.listen(5000, () => console.log("Server running on port 5000"));
