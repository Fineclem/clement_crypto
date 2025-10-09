    const coinCarouselMap = {
    btc:   { api: 'bitcoin',  price: 'carousel-btc-price',  change: 'carousel-btc-change' },
    eth:   { api: 'ethereum', price: 'carousel-eth-price',  change: 'carousel-eth-change' },
    ada:   { api: 'cardano',  price: 'carousel-ada-price',  change: 'carousel-ada-change' },
    //  eth:   { api: 'cardano',  price: 'carousel-eth-price',  change: 'carousel-eth-change' },
    //  bnb:   { api: 'binancecoin',  price: 'carousel-bnb-price',  change: 'carousel-bnb-change' },
    xrp:   { api: 'ripple',   price: 'carousel-xrp-price',  change: 'carousel-xrp-change' }
    
  };

  function updateCarouselPrices() {
    fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=' + 
      Object.values(coinCarouselMap).map(c=>c.api).join(','), {cache:"reload"})
      .then(res=>res.json())
      .then(data=>{
        data.forEach(coin => {
          for(let sym in coinCarouselMap) {
            if(coin.id === coinCarouselMap[sym].api) {
              document.getElementById(coinCarouselMap[sym].price).textContent = 
                '$' + coin.current_price.toLocaleString(undefined, {maximumFractionDigits: 8});
              const changeElem = document.getElementById(coinCarouselMap[sym].change);
              const pct = coin.price_change_percentage_24h;
              changeElem.innerHTML = 
                (pct > 0 
                  ? '<span class="text-success"><i class="bi bi-caret-up-fill"></i> +' + pct.toFixed(2)
                  : '<span class="text-danger"><i class="bi bi-caret-down-fill"></i> ' + pct.toFixed(2))
                + '%</span>';
            }
          }
        });
      });
  }
  updateCarouselPrices();
  setInterval(updateCarouselPrices, 10000); 
    
  
  const symbols = {
    btc: 'bitcoin',
    eth: 'ethereum',
    ada: 'cardano',
    xrp: 'ripple',
    pi: 'pi-network'
  };

  function updateMarketSection() {
    fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=' 
      + Object.values(symbols).join(',')
      + '&order=market_cap_desc&per_page=10&page=1&sparkline=false')
      .then(res => res.json())
      .then(data => {
        data.forEach(coin => {
         
          let sym = Object.keys(symbols).find(k => symbols[k] === coin.id);
          if (!sym) return;
          // Update price
          const priceElem = document.getElementById('price-' + sym);
          if (priceElem)
            priceElem.textContent = '$' + coin.current_price.toLocaleString(undefined, {maximumFractionDigits: 8});
          // Update change and arrow
          const pct = coin.price_change_percentage_24h;
          const changeElem = document.getElementById('change-' + sym);
          if (changeElem) {
            const arrow = pct > 0
              ? '<i class="bi bi-caret-up-fill text-success"></i>'
              : pct < 0
              ? '<i class="bi bi-caret-down-fill text-danger"></i>'
              : '';
            changeElem.innerHTML = `${arrow} ${pct ? pct.toFixed(2) : '0.00'}%`;
            changeElem.className = 'change ' + (pct > 0 ? 'positive' : pct < 0 ? 'negative' : '');
          }
        });
      });
  }

  updateMarketSection();
  setInterval(updateMarketSection, 10000);