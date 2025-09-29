#  CryptoX – Cryptocurrency Portfolio Dashboard

CryptoX is a responsive web application that allows users to **track their cryptocurrency portfolio, manage trades (buy/sell), and monitor live market data**. It integrates with the [CoinGecko API](https://www.coingecko.com/en/api) to fetch real-time crypto prices and updates.



##  Features

*  **Dashboard Overview**

  * Portfolio Value (calculated live from owned coins)
  * 24h Change (based on portfolio coins’ performance)
  * Owned Coins count
  * Available Balance (updated after each trade)

*  **Portfolio Management**

  * Buy coins with simulated balance
  * Sell coins and restore balance
  * Remove coins from portfolio
  * Each coin card shows:

    * Current amount owned
    * Current value in USD
    * 24h price change
    * Real-time price updates

*  **Multi-User Support**

  * Portfolios and balances are stored uniquely per user (using `localStorage` keys tied to the logged-in user’s email/ID).
  * Different accounts on the same device will not share the same data.

* ⚠ **Error Handling**

  * SweetAlert2 popups for errors and confirmations
  * Fallback messages when CoinGecko API fetch fails

* **UI/UX Enhancements**

  * Clean Bootstrap 5 design
  * SweetAlert2 modals for actions (buy, sell, remove, errors)
  * Responsive layout for mobile and desktop

## Use Case

**Fineclem, a crypto enthusiast, uses CryptoX to manage and trade his portfolio:**

1. Logs in and views his dashboard with portfolio value, watchlist, and top coins.
2. Browses the market section to see real-time coin prices and charts.
3. Buys BTC using his balance; portfolio and balance update automatically.
4. Monitors 24h profit/loss and portfolio growth.
5. Reads latest cryptocurrency news and insights.
6. Updates profile, resets password, or logs out securely.


##  Tech Stack

* **Frontend**: HTML5, CSS3, Bootstrap 5
* **JavaScript**: Vanilla JS (ES6+), SweetAlert2
* **API**: CoinGecko REST API
* **Storage**: Browser `localStorage` and API

---

##  Project Structure

```
CryptoX/
│── index.html        # Main entry point
│── /css              # Custom styles 
│── /js               # Scripts (portfolio logic, API handling)
│── /assets           # Images, icons, etc.
│── README.md         # Project documentation
```

---

##  Setup & Usage

1. **Clone the repository**

   ```bash
   git clone https://github.com/Fineclem/clement_crypto
   cd cryptox
   ```

2. **Open in browser**
   Since CryptoX is a frontend-only project, you can run it by simply opening `index.html` in your browser.

3. **Simulated Login**
    Easy login process
     
4. **Start Trading!**

   * Use the "Buy Coin" form to add crypto to your portfolio.
   * Sell or remove coins directly from portfolio cards.
   * Watch your dashboard update in real time.

---

##  Notes

* All balances and portfolios are stored.
* No real money is involved for now.
* The app requires internet access to fetch live prices from the CoinGecko API.

---

##  Roadmap

* [ ] Add real authentication system
* [ ] Integrate with live trading APIs (Binance, Coinbase, etc.)
* [ ] Add historical charts for portfolio performance
* [ ] Support multiple fiat currencies (USD, EUR, NGN, etc.)


##  Acknowledgements

* [CoinGecko API](https://www.coingecko.com/en/api) for real-time crypto data
* [Bootstrap 5](https://getbootstrap.com/) for responsive UI
* [SweetAlert2](https://sweetalert2.github.io/) for elegant alerts and modals

---
