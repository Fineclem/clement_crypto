if(!localStorage.getItem("loggedInUser")){
  window.location.href = "public/index.html"; 
};


// ================ Market Fetch ===========
  const userName = document.getElementById("userName");
  const userAvatar = document.getElementById("userAvatar");
  const loader1 = document.getElementById("loader1");

  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if(loggedInUser){
    userName.textContent = `Hi, ${loggedInUser.userName || "User"}!`;
    userName.className = "text-warning fw-semibold" 
};
  
  
// --- Market (CoinGecko API) ---
function fetchMarketData() {
  fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=100&page=1")
    .then(res => res.json())
    .then(data => {
      // Save to localStorage
      localStorage.setItem("marketData", JSON.stringify(data));

     
      let list = document.getElementById("market-list");
      list.innerHTML = "";
           loader1.classList.remove("d-none");
      data.forEach(c => {
        list.innerHTML += `
          <tr>
            <td><img src="${c.image}" width="30"></td>
            <td>${c.name}</td>
           
            <td class="text-muted">${c.symbol.toUpperCase()}</td>
            <td>$${c.current_price.toLocaleString()}</td>
            <td class="rounded-pill  ${c.price_change_percentage_24h >= 0 ? 'text-light bg-success' : 'text-light bg-danger'}">
              ${c.price_change_percentage_24h.toFixed(2)}%
            </td>
          </tr>
        `;
      });

      loader1.classList.add("d-none");
      updateDashboard();
    })
    .catch(error => {
      console.error("Error fetching market data:", error);
      // document.getElementById("market-list").innerHTML =
      //   `<tr><td colspan="6" class="text-danger">Failed to load market data</td></tr>`;
      loader1.classList.add("d-none");
    });
}

fetchMarketData();



// ================ Market Fetch End Here===========



  // --- Trading ---
 const coins = [
  "BTC","ETH","BNB","XRP","ADA","SOL","DOGE","DOT","MATIC","LTC",
  "SHIB","AVAX","TRX","UNI","LINK","XLM","ATOM","ETC","XMR","ALGO",
  "VET","ICP","FIL","APT","QNT","NEAR","AAVE","EGLD","FLOW","HBAR",
  "SAND","MANA","AXS","XTZ","THETA","GRT","KAVA","CRV","CHZ","SNX",
  "ZEC","EOS","RUNE","STX","CSPR","1INCH","ENJ","CAKE","KSM","BAT",
  "FTM","NEXO","MIOTA","COMP","HT","VTHO","LRC","DASH","HOT","RVN",
  "CELO","KLAY","ZIL","QTUM","OMG","BTT","YFI","ANKR","KNC","ICX",
  "PAXG","WAVES","DCR","NANO","SRM","LUSD","GLM","OCEAN","HNT","GNO",
  "AR","SCRT","RAY","CVC","STORJ","FET","SXP","REN","UMA","BAL",
  "KAVA","ZEN","KSM","MKR","OXT","NKN","ALPHA","CTSI","POLY","XCH",
  "CHZ","ANKR","SC","RSR","ARDR","DGB","KNC","IOST","STMX","HIVE",
  "Pi"
];

  const pairSelector = document.getElementById("pairSelector");

  coins.forEach(c => {
    let opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c + "/USDT";
    pairSelector.appendChild(opt);
  });

  function loadChart(symbol = "BTC") {
    document.getElementById("tradingview_chart").innerHTML = "";
    new TradingView.widget({
      width: "100%",
      height: 500,
      symbol: `BINANCE:${symbol}USDT`,
      interval: "30",
      theme: "dark",
      container_id: "tradingview_chart"
    });
  }
  loadChart();

  pairSelector.addEventListener("change", () => {
    loadChart(pairSelector.value);
  });

 




// --- Portfolio  ---

const coinSelector = document.getElementById("coinSelector");
const buyBtn = document.getElementById("buyBtn");
const portfolioContainer = document.getElementById("portfolio-container1");


function getCurrentUser() {
  return JSON.parse(localStorage.getItem("loggedInUser"));
}


function loadCoinOptions() {
  coinSelector.innerHTML = '<option value="">Loading...</option>';

  fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=20&page=1")
    .then(res => res.json())
    .then(data => {
      coinSelector.innerHTML = '<option value="">Select a coin</option>';
      data.forEach(coin => {
        const opt = document.createElement("option");
        opt.value = JSON.stringify({
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol,
          image: coin.image,
          price: coin.current_price
        });
        opt.textContent = `${coin.name} (${coin.symbol.toUpperCase()}) - $${coin.current_price}`;
        coinSelector.appendChild(opt);
      });
    })
    .catch(err => {
      console.error("Error loading coins:", err);
      coinSelector.innerHTML = '<option value="">⚠ Failed to load coins</option>';
    });
}

// --- Portfolio storage ---
function getPortfolio() {
  const user = getCurrentUser();
  if (!user) return [];
  return JSON.parse(localStorage.getItem(`portfolio_${user.id}`)) || [];
}

function savePortfolio(portfolio) {
  const user = getCurrentUser();
  if (!user) return;
  localStorage.setItem(`portfolio_${user.id}`, JSON.stringify(portfolio));
}

// --- Balance function---
function getBalance() {
  const user = getCurrentUser();
  if (!user) return 0;
  return parseFloat(localStorage.getItem(`balance_${user.id}`)) || 10000; 
}

function saveBalance(amount) {
  const user = getCurrentUser();
  if (!user) return;
  localStorage.setItem(`balance_${user.id}`, amount);
}

function updateBalanceUI() {
  const balance = getBalance();
  document.getElementById("dash-balance").textContent = `$${balance.toFixed(2)}`;
}

// --- portfolio coin prices ---

function renderPortfolio() {
  const portfolio = getPortfolio();
  portfolioContainer.innerHTML = "";

  if (portfolio.length === 0) {
    portfolioContainer.innerHTML = `<p class="text-muted">No coins in your portfolio yet.</p>`;
    document.getElementById("dash-portfolio-value").textContent = "$0";
    document.getElementById("dash-change").textContent = "0%";
    return;
  }

  const ids = portfolio.map(item => item.id).join(",");
  fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}`)
    .then(res => res.json())
    .then(liveData => {
      let totalValue = 0;
      let totalPrevValue = 0;

      // Start table
      let tableHTML = `
        <div class="table-responsive">
          <table class="table table-striped table-hover align-middle">
            <thead class="table-dark">
              <tr>
                <th>Coin</th>
                <th>Amount</th>
                <th>Price</th>
                <th>Value</th>
                <th>24h Change</th>
                <th>24h P/L</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
      `;

      portfolio.forEach((item, index) => {
        const liveCoin = liveData.find(c => c.id === item.id);

        const currentPrice = liveCoin ? liveCoin.current_price : item.price;
        const change24hPerc = liveCoin ? liveCoin.price_change_percentage_24h : 0;
        const prevPrice = currentPrice / (1 + change24hPerc / 100 || 1);
        const totalCoinValue = (item.amount * currentPrice).toFixed(2);
        const totalCoinPrevValue = (item.amount * prevPrice).toFixed(2);
        const coinPL = (totalCoinValue - totalCoinPrevValue).toFixed(2);

        totalValue += parseFloat(totalCoinValue);
        totalPrevValue += parseFloat(totalCoinPrevValue);

        tableHTML += `
          <tr>
            <td>
              <img src="${item.image}" alt="${item.name}" width="24" height="24" class="me-2">
              ${item.name} (${item.symbol.toUpperCase()})
            </td>
            <td>${item.amount}</td>
            <td>$${currentPrice.toFixed(2)}</td>
            <td>$${totalCoinValue}</td>
            <td class="${change24hPerc >= 0 ? 'text-success' : 'text-danger'}">
              ${change24hPerc.toFixed(2)}%
            </td>
            <td class="${coinPL >= 0 ? 'text-success' : 'text-danger'}">
              $${coinPL}
            </td>
            <td>
              <button class="btn btn-sm btn-success me-1" onclick="sellFromPortfolio(${index})">Sell</button>
              <button class="btn btn-sm btn-danger" onclick="removeFromPortfolio(${index})">Remove</button>
            </td>
          </tr>
        `;
      });

      tableHTML += `
            </tbody>
          </table>
        </div>
      `;

      portfolioContainer.innerHTML = tableHTML;

      // --- Update dashboard values ---
      document.getElementById("dash-portfolio-value").textContent = `$${totalValue.toFixed(2)}`;
      let totalChangePerc = 0;
      if (totalPrevValue > 0) {
        totalChangePerc = ((totalValue - totalPrevValue) / totalPrevValue) * 100;
      }
      document.getElementById("dash-change").textContent = `${totalChangePerc.toFixed(2)}%`;
      document.getElementById("dash-change").className = `fw-bold ${totalChangePerc >= 0 ? 'text-success' : 'text-danger'}`;
      document.getElementById("dash-watchlist").textContent = `${portfolio.length} Coins`;
    });
}


// --- Remove from portfolio ---
function removeFromPortfolio(index) {
  let portfolio = getPortfolio();
  portfolio.splice(index, 1);
  savePortfolio(portfolio);
  renderPortfolio();
}

// --- Buy coin and add to portfolio ---

buyBtn.addEventListener("click", () => {
  const selected = coinSelector.value;
  const amount = parseFloat(document.getElementById("coinAmount").value);

  if (!selected || isNaN(amount) || amount <= 0) {
    Swal.fire({
      icon: "error",
      title: "Invalid Input",
      text: "Please select a coin and enter a valid amount."
    });
    return;
  }

  const coin = JSON.parse(selected);
  const totalCost = coin.price * amount;
  let balance = getBalance();

  if (totalCost > balance) {
    Swal.fire({
      icon: 'error',
      title: 'Insufficient Balance',
      text: 'You do not have enough funds to complete this purchase.',
      timer: 2500,
      showConfirmButton: false
    });
    return;
  }

  // Deduct balance
  balance -= totalCost;
  saveBalance(balance);
  updateBalanceUI();

  // Update portfolio
  let portfolio = getPortfolio();
  const existing = portfolio.find(item => item.id === coin.id);

  if (existing) {
    
    existing.amount += amount;
    existing.price = coin.price; 
  } else {
    portfolio.push({ ...coin, amount });
  }

  savePortfolio(portfolio);
  renderPortfolio();

  
  coinSelector.value = "";
  document.getElementById("coinAmount").value = "";

  
  Swal.fire({
    icon: 'success',
    title: 'Purchase Successful',
    html: `You bought <strong>${amount} ${coin.symbol.toUpperCase()}</strong> for <strong>$${totalCost.toFixed(2)}</strong>`,
    showConfirmButton: true
  });
});


// --- Sell coin ---
async function sellFromPortfolio(index) {
  let portfolio = getPortfolio();
  const coin = portfolio[index];

  const { value: sellAmount } = await Swal.fire({
    title: `Sell ${coin.name}`,
    input: 'number',
    inputLabel: `Enter amount of ${coin.name} to sell:`,
    inputAttributes: { min: 0, step: 0.01 },
    inputValidator: (value) => {
      if (!value) return 'You need to enter a value';
      if (isNaN(value) || parseFloat(value) <= 0) return 'Enter a valid number';
      if (parseFloat(value) > coin.amount) return "You don't own that much";
    },
    showCancelButton: true,
    confirmButtonText: 'Sell',
    cancelButtonText: 'Cancel'
  });

  if (!sellAmount) return;

  const amountToSell = parseFloat(sellAmount);
  const currentPrice = coin.price;
  const revenue = amountToSell * currentPrice;

 
  let balance = getBalance();
  balance += revenue;
  saveBalance(balance);
  updateBalanceUI();

  
  coin.amount -= amountToSell;
  if (coin.amount <= 0) {
    portfolio.splice(index, 1);
  }
  savePortfolio(portfolio);
  renderPortfolio();

  Swal.fire({
    icon: 'success',
    title: 'Sold!',
    text: `You sold ${amountToSell} ${coin.symbol.toUpperCase()} for $${revenue.toFixed(2)}`,
    timer: 2500,
    showConfirmButton: false
  });
}


loadCoinOptions();
renderPortfolio();
updateBalanceUI();
setInterval(renderPortfolio, 60000);
  

  //  Blog

 function fetchCryptoNews() {
  const url = `https://newsapi.org/v2/everything?q=cryptocurrency&language=en&sortBy=publishedAt&pageSize=6&apiKey=c7dcc62b6ac34fafa87a382cf41f7208`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const newsContainer = document.getElementById("news-section1");

      data.articles.forEach(article => {
        newsContainer.innerHTML += `
          <div class="col-12 col-sm-10 col-md-6 col-lg-4">
            <div class="card h-100 shadow-sm">
              <img src="${article.urlToImage ? article.urlToImage : 'default.jpg'}" class="img-fluid object-fit-contain" alt="news-image">
              <div class="card-body">
                <h5 class="card-title">${article.title}</h5>
                <p class="card-text">${article.description?.slice(0, 6)}...</p>
                <a href="${article.url}" target="_blank" class="btn btn-sm btn-success">Read More</a>
              </div>
            </div>
          </div>
        `;
      });
    })
    .catch(error => {
      console.error("Error fetching news:", error);
    });
};



  document.addEventListener("DOMContentLoaded", fetchCryptoNews);


 // --- Sidebar Toggle for Mobile ---
// --- Sidebar Toggle for Mobile ---
const sidebarMenu = document.getElementById("sidebarMenu");
const sidebarToggle = document.getElementById("sidebarToggle");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const navLinks = document.querySelectorAll(".sidebar .nav-link");
const sections = document.querySelectorAll("section");

// Toggle sidebar
sidebarToggle.addEventListener("click", () => {
  sidebarMenu.classList.toggle("show");
  sidebarOverlay.classList.toggle("show");
});

sidebarOverlay.addEventListener("click", () => {
  sidebarMenu.classList.remove("show");
  sidebarOverlay.classList.remove("show");
});

// --- Show Section Function ---
function showSection(sectionId, push = true) {
  // Hide all sections
  sections.forEach(s => s.classList.remove("active"));

  // Show chosen section
  document.getElementById(sectionId).classList.add("active");

  // Update nav active state
  navLinks.forEach(l => l.classList.remove("active"));
  document.querySelector(`.nav-link[data-section="${sectionId}"]`)?.classList.add("active");

  // Save to localStorage
  localStorage.setItem("currentSection", sectionId);

  // Update URL
  if (push) history.pushState({ section: sectionId }, "", `#${sectionId}`);

  // Close sidebar on mobile
  if (window.innerWidth <= 991) {
    sidebarMenu.classList.remove("show");
    sidebarOverlay.classList.remove("show");
  }
}

// --- Navigation Switching ---
navLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const sectionId = link.getAttribute("data-section");
    showSection(sectionId);
  });
});

// --- On Page Load ---
window.addEventListener("DOMContentLoaded", () => {
  const hash = window.location.hash.substring(1);
  const saved = localStorage.getItem("currentSection");

  if (hash) {
    showSection(hash, false);
  } else if (saved) {
    showSection(saved, false);
  } else {
    // Default: first section
    const firstSection = sections[0].id;
    showSection(firstSection, false);
  }
});

// --- Handle Back/Forward Buttons ---
window.addEventListener("popstate", (e) => {
  const sectionId = e.state?.section || window.location.hash.substring(1);
  if (sectionId) showSection(sectionId, false);
});



  // ---user Profile Handling ---
  const userNameEl = document.getElementById("userName");
  const userAvatarEl = document.getElementById("userAvatar");

  const storedUser = JSON.parse(localStorage.getItem("user")) || null;

  if (storedUser) {
    userNameEl.textContent = storedUser.name || "User";
    if (storedUser.avatar) {
      userAvatarEl.src = storedUser.avatar;
    }
  }

  // Logging Out
  const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", () => {
  Swal.fire({
    icon: "warning",
    title: "Are you sure?",
    text: "You are about to log out",
    showCancelButton: true,
    confirmButtonText: "Yes, log out",
    cancelButtonText: "Cancel"
  }).then((result) => {
    if (result.isConfirmed) {
     
      localStorage.removeItem("loggedInUser");

    
      Swal.fire({
        icon: "success",
        title: "Logged Out",
        text: "✅ You have been logged out!",
        timer: 2000,
        showConfirmButton: false
      });

      
      setTimeout(() => {
        window.location.href = "/index.html"; 
      }, 2000);
    }
  });
});


// Delete profile
const deleteProfileBtn = document.getElementById("deleteProfileBtn");

deleteProfileBtn.addEventListener("click", () => {
  Swal.fire({
    title: 'Are you sure?',
    text: "This will permanently delete your profile!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!'
  }).then((result) => {
    if (result.isConfirmed) {
      
      const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
      if (loggedInUser) {
        
        let users = JSON.parse(localStorage.getItem("users")) || [];
        users = users.filter(u => u.email !== loggedInUser.email); 
        localStorage.setItem("users", JSON.stringify(users));

       
        localStorage.removeItem("loggedInUser");
      }

      Swal.fire(
        'Deleted!',
        'Your profile has been deleted.',
        'success'
      ).then(() => {
        window.location.href = "/index.html"; 
      });
    }
  });
});


  

 // --- Search Functionality ---
const searchInput = document.getElementById("searchInput");
const marketList = document.getElementById("market-list");
const marketSection = document.getElementById("market");

// Function to filter coins
function filterCoins(query) {
  const rows = marketList.querySelectorAll("tr"); 
  rows.forEach(row => {
    const name = row.children[1]?.textContent.toLowerCase() || "";   
    const id = row.children[2]?.textContent.toLowerCase() || "";     
    const symbol = row.children[3]?.textContent.toLowerCase() || ""; 

    if (name.includes(query) || symbol.includes(query) || id.includes(query)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}


searchInput.addEventListener("input", function () {
  const query = this.value.toLowerCase().trim();

  // Show Market section
  document.querySelectorAll("section").forEach(sec => sec.classList.remove("active"));
  marketSection.classList.add("active");


  document.querySelectorAll(".sidebar .nav-link").forEach(nav => nav.classList.remove("active"));
  document.querySelector('[data-section="market"]').classList.add("active");

  // Run filter
  filterCoins(query);
});

function updateDashboard() {
  const marketData = JSON.parse(localStorage.getItem("marketData")) || [];
  const portfolio = JSON.parse(localStorage.getItem("portfolio")) || [];

  // Portfolio value
  const portfolioValue = portfolio.reduce((sum, coin) => sum + (coin.holding * coin.price), 0);
  document.getElementById("dash-portfolio-value").textContent = `$${portfolioValue.toLocaleString()}`;
  document.getElementById("dash-watchlist").textContent = `${portfolio.length} Coins`;



  // Market overview (top 5 coins)
  const dashboardMarket = document.getElementById("dashboard-market");
  dashboardMarket.innerHTML = marketData.slice(0, 5).map(coin => `
    <tr>
      <td><img src="${coin.image}" width="20"> ${coin.name} (${coin.symbol.toUpperCase()})</td>
      <td>$${coin.current_price.toLocaleString()}</td>
      <td class="${coin.price_change_percentage_24h >= 0 ? 'text-success' : 'text-danger'}">
        ${coin.price_change_percentage_24h.toFixed(2)}%
      </td>
      <td>$${coin.market_cap.toLocaleString()}</td>
    </tr>
  `).join("");

  // Portfolio 
const dashboardPortfolio = document.getElementById("dashboard-portfolio");

if (!portfolio || portfolio.length === 0) {
  dashboardPortfolio.innerHTML = `
    <div class="col-12 text-center text-muted">
      <p>No coins in your portfolio yet.</p>
    </div>
  `;
} else {
  dashboardPortfolio.innerHTML = portfolio.map(coin => {
    const price = parseFloat(coin.price) || 0;
    const holding = parseFloat(coin.holding) || 0;
    const totalValue = (holding * price).toFixed(2);

    return `
      <div class="col-md-4 col-sm-6">
        <div class="card h-100 text-center shadow-sm border-0">
          <div class="card-body">
            <img src="${coin.image || 'default.png'}" width="40" class="mb-2">
            <h6>${coin.name || "Unknown"}</h6>
            <p class="mb-1">${holding} ${coin.symbol ? coin.symbol.toUpperCase() : ""}</p>
            <p class="fw-bold text-success">$${Number(totalValue).toLocaleString()}</p>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

}

document.addEventListener("DOMContentLoaded", () => {
  updateDashboard();
  fetchMarketData(); 
});



//  profile modal
document.getElementById("profileModal").addEventListener("show.bs.modal", () => {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (loggedInUser) {
    document.getElementById("editName").value = loggedInUser.name || "";
    document.getElementById("editEmail").value = loggedInUser.email || "";
    document.getElementById("editDepartment").value = loggedInUser.department || "";
    document.getElementById("editPhone").value = loggedInUser.phone || "";
    document.getElementById("editPassword").value = ""; 
  }
});



//Save Changes 
document.getElementById("profileForm").addEventListener("submit", (e) => {
  e.preventDefault(); 

  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")) || {};

  const updatedUser = {
    name: document.getElementById("editName").value,
    email: document.getElementById("editEmail").value,
    department: document.getElementById("editDepartment").value,
    password: document.getElementById("editPassword").value,
    avatar: loggedInUser?.avatar || "/asset/img/8.jpg"
  };

 
  localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));

  
  document.getElementById("userName").textContent = `Hi, ${updatedUser.name || "User"}!`;
 

  // Close modal
  const modal = bootstrap.Modal.getInstance(document.getElementById("profileModal"));
  modal.hide();

  Swal.fire({
  icon: "success",
  title: "Profile Updated",
  text: "Your updated details have been saved successfully!",
  timer: 2500
});

});

// Load user on page load
window.addEventListener("DOMContentLoaded", () => {
  const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (storedUser) {
    document.getElementById("userName").textContent = `Hi, ${storedUser.name || "User"}!`;
    if (storedUser.avatar) {
      document.getElementById("userAvatar").src = storedUser.avatar;
    }
  }
});

// Elements
const assetBalanceEl = document.getElementById("asset-balance");
const depositCoin = document.getElementById("depositCoin");
const depositAmount = document.getElementById("depositAmount");
const depositBtn = document.getElementById("depositBtn");
const depositDetails = document.getElementById("depositDetails");
const depositAddress = document.getElementById("depositAddress");
const depositQr = document.getElementById("depositQr");
const copyAddressBtn = document.getElementById("copyAddressBtn");

const withdrawCoin = document.getElementById("withdrawCoin");
const withdrawAddress = document.getElementById("withdrawAddress");
const withdrawAmount = document.getElementById("withdrawAmount");
const withdrawBtn = document.getElementById("withdrawBtn");



// Load balance
function loadAssetBalance() {
  const backendURL = "http://localhost:5000";

  fetch(`${backendURL}/api/create-deposit`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ coins, amount }),
})
    .then((res) => res.json())
    .then((data) => {
      const bal = data.balance || 0;
      assetBalanceEl.textContent = `$${bal.toFixed(2)}`;
    })
    .catch(() => (assetBalanceEl.textContent = "$0.00"));
}


// Load available coins for deposit


// Deposit
depositBtn.addEventListener("click", () => {
  const coin = depositCoin.value;
  const amount = parseFloat(depositAmount.value);
  

  if (!coin || isNaN(amount) || amount <= 0) {
    Swal.fire("Invalid input", "Select coin and amount", "error");
    return;
  }
     const backendURL = "http://localhost:5000";
  fetch(`${backendURL}/api/create-deposit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ coin, amount }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.pay_address) {
        depositAddress.value = data.pay_address;
        depositQr.src = data.qr_code || "";
        depositDetails.style.display = "block";
      } else {
        Swal.fire("Failed", "Could not generate deposit address.", "error");
      }
    })
    .catch(() =>
      Swal.fire("Error", "Could not connect to backend.", "error")
    );
});

// Copy address
copyAddressBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(depositAddress.value);
  Swal.fire("Copied!", "Address copied to clipboard", "success");
});

// Withdraw
withdrawBtn.addEventListener("click", () => {
  const coin = withdrawCoin.value;
  const address = withdrawAddress.value.trim();
  const amount = parseFloat(withdrawAmount.value);

  if (!coin || !address || isNaN(amount) || amount <= 0) {
    Swal.fire("Invalid input", "Please fill all fields", "error");
    return;
  }

  Swal.fire({
    icon: "info",
    title: "Confirm Withdrawal",
    html: `Withdraw <strong>${amount}$ worth of ${coin}</strong> to <code>${address}</code>?`,
    showCancelButton: true,
    confirmButtonText: "Yes, Withdraw",
  }).then((result) => {
    if (result.isConfirmed) {
      const backendURL = "http://localhost:5000";
      
      fetch(`${backendURL}/api/withdraw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coin, address, amount }),
      })
        .then((res) => res.json())
        .then((resp) => {
          Swal.fire(
            resp.success ? "Success" : "Error",
            resp.message,
            resp.success ? "success" : "error"
          );
          if (resp.success) loadAssetBalance();
        })
        .catch(() => Swal.fire("Failed", "Withdrawal failed", "error"));
    }
  });
});

loadAssetBalance();


// Initial load
loadAssetBalance();
