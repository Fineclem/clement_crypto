# 🚀 CryptoX – Cryptocurrency Portfolio Dashboard

CryptoX is a responsive web application that allows users to **track their cryptocurrency portfolio, manage trades (buy/sell), and monitor live market data**. It integrates with the [CoinGecko API](https://www.coingecko.com/en/api) to fetch real-time crypto prices and updates.

---

## ✨ Features

* 📊 **Dashboard Overview**

  * Portfolio Value (calculated live from owned coins)
  * 24h Change (based on portfolio coins’ performance)
  * Owned Coins count
  * Available Balance (updated after each trade)

* 💹 **Portfolio Management**

  * Buy coins with simulated balance
  * Sell coins and restore balance
  * Remove coins from portfolio
  * Each coin card shows:

    * Current amount owned
    * Current value in USD
    * 24h price change
    * Real-time price updates

* 🔐 **Multi-User Support**

  * Portfolios and balances are stored uniquely per user (using `localStorage` keys tied to the logged-in user’s email/ID).
  * Different accounts on the same device will not share the same data.

* ⚠ **Error Handling**

  * SweetAlert2 popups for errors and confirmations
  * Fallback messages when CoinGecko API fetch fails

* 🎨 **UI/UX Enhancements**

  * Clean Bootstrap 5 design
  * SweetAlert2 modals for actions (buy, sell, remove, errors)
  * Responsive layout for mobile and desktop

---

## 🛠️ Tech Stack

* **Frontend**: HTML5, CSS3, Bootstrap 5
* **JavaScript**: Vanilla JS (ES6+), SweetAlert2
* **API**: CoinGecko REST API
* **Storage**: Browser `localStorage` (per-user portfolios & balances)

---

## 📂 Project Structure

```
CryptoX/
│── index.html        # Main entry point
│── /css              # Custom styles (optional)
│── /js               # Scripts (portfolio logic, API handling)
│── /assets           # Images, icons, etc.
│── README.md         # Project documentation
```

---

## ⚙️ Setup & Usage

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/cryptox.git
   cd cryptox
   ```

2. **Open in browser**
   Since CryptoX is a frontend-only project, you can run it by simply opening `index.html` in your browser.

3. **Simulated Login**

   * Replace the `currentUser` variable with your actual login system.
   * Example:

     ```js
     const currentUser = localStorage.getItem("loggedInUserEmail");
     ```
   * This ensures different users have their own separate portfolios.

4. **Start Trading!**

   * Use the "Buy Coin" form to add crypto to your portfolio.
   * Sell or remove coins directly from portfolio cards.
   * Watch your dashboard update in real time.

---

## 🚨 Notes

* All balances and portfolios are **simulated** and stored in `localStorage`.
* No real money is involved.
* The app requires internet access to fetch live prices from the CoinGecko API.

---

## 📌 Roadmap

* [ ] Add real authentication system
* [ ] Integrate with live trading APIs (Binance, Coinbase, etc.)
* [ ] Add historical charts for portfolio performance
* [ ] Support multiple fiat currencies (USD, EUR, NGN, etc.)

---

## 📜 License

This project is licensed under the MIT License.
You are free to use, modify, and distribute this project for personal and commercial use.

---

## 🙌 Acknowledgements

* [CoinGecko API](https://www.coingecko.com/en/api) for real-time crypto data
* [Bootstrap 5](https://getbootstrap.com/) for responsive UI
* [SweetAlert2](https://sweetalert2.github.io/) for elegant alerts and modals

---
