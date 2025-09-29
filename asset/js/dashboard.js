if(!localStorage.getItem("loggedInUser")){
  window.location.href = "/index.html"; 
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
async function fetchMarketData() {
  let res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&per_page=100&page=1");
  let data = await res.json();

  
  localStorage.setItem("marketData", JSON.stringify(data));

  let list = document.getElementById("market-list");
  list.innerHTML = "";

  data.forEach(c => {
    list.innerHTML += `
      <div class="col-sm-6 col-md-4 col-lg-3 coin-card">
        <div class="card h-100 shadow-sm">
          <div class="card-body text-center">
            <img src="${c.image}" width="40" class="mb-2">
            <h6 class="coin-name">${c.name}</h6>
            <h6 class="coin-name">${c.id}</h6>
            <p class="coin-symbol text-muted">${c.symbol.toUpperCase()}</p>
            <p>$${c.current_price.toLocaleString()}</p>
            <p class="${c.price_change_percentage_24h >= 0 ? 'text-success' : 'text-danger'}">
              ${c.price_change_percentage_24h.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>`;
      loader1.classList.add("d-none");
  });


  
  updateDashboard();
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
      portfolioContainer.innerHTML = "";
      let totalValue = 0;
      let totalPrevValue = 0; 

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

        portfolioContainer.innerHTML += `
          <div class="col-md-4">
            <div class="card h-100 shadow-sm">
              <img src="${item.image}" class="card-img-top" height="150">
              <div class="card-body">
                <h5>${item.name} (${item.symbol.toUpperCase()})</h5>
                <p>Amount: <strong>${item.amount}</strong></p>
                <p>Value: <strong>$${totalCoinValue}</strong></p>
                <p class="${change24hPerc >= 0 ? 'text-success' : 'text-danger'}">
                  24h Change: ${change24hPerc.toFixed(2)}%
                </p>
                <p class="${coinPL >= 0 ? 'text-success' : 'text-danger'}">
                  24h P/L: $${coinPL}
                </p>
                <button class="btn btn-sm btn-success me-2" onclick="sellFromPortfolio(${index})">Sell</button>
                <button class="btn btn-sm btn-danger" onclick="removeFromPortfolio(${index})">Remove</button>
              </div>
            </div>
          </div>`;
      });

     
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
              <img src="${article.urlToImage ? article.urlToImage : 'default.jpg'}" class="card-img-top object-fit-contain" alt="news-image">
              <div class="card-body">
                <h5 class="card-title">${article.title}</h5>
                <p class="card-text">${article.description?.slice(0, 9)}...</p>
                <a href="${article.url}" target="_blank" class="btn btn-sm btn-primary">Read More</a>
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
  const sidebarMenu = document.getElementById("sidebarMenu");
  const sidebarToggle = document.getElementById("sidebarToggle");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const navLinks = document.querySelectorAll(".sidebar .nav-link");
  const sections = document.querySelectorAll("section");

  sidebarToggle.addEventListener("click", () => {
    sidebarMenu.classList.toggle("show");
    sidebarOverlay.classList.toggle("show");
  });

  sidebarOverlay.addEventListener("click", () => {
    sidebarMenu.classList.remove("show");
    sidebarOverlay.classList.remove("show");
  });

  // --- Navigation Switching ---
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      const sectionId = link.getAttribute("data-section");
      sections.forEach(s => s.classList.remove("active"));
      document.getElementById(sectionId).classList.add("active");

      localStorage.setItem("currentSection", sectionId)

      
      if (window.innerWidth <= 991) {
        sidebarMenu.classList.remove("show");
        sidebarOverlay.classList.remove("show");
      }
    });
  });

  window.addEventListener("DOMContentLoaded", () => {
  const currentSection = localStorage.getItem("currentSection");

  if (currentSection) {
    sections.forEach(s => s.classList.remove("active"));
    navLinks.forEach(l => l.classList.remove("active"));

 
    document.getElementById(currentSection).classList.add("active");
    document.querySelector(`.nav-link[data-section="${currentSection}"]`).classList.add("active");
  } else {
    
    sections[0].classList.add("active");
    navLinks[0].classList.add("active");
  }
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
  const cards = marketList.querySelectorAll(".coin-card");
  cards.forEach(card => {
    const name = card.querySelector(".coin-name").textContent.toLowerCase();
    const symbol = card.querySelector(".coin-symbol").textContent.toLowerCase();

    if (name.includes(query) || symbol.includes(query)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
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

