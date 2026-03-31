const API_KEY = "c14d2cf26c6126be5bf6a88093bde4d4";

const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");

// EVENTS
searchBtn.addEventListener("click", getWeather);
cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") getWeather();
});

// ---------------- UI ----------------
function showLoader() {
  document.getElementById("loader").style.display = "block";
}

function hideLoader() {
  document.getElementById("loader").style.display = "none";
}

function showError(msg) {
  document.getElementById("error").textContent = msg;
}

function clearError() {
  document.getElementById("error").textContent = "";
}

// ---------------- AUTO LOCATION ----------------
window.onload = getLocationWeather;

function getLocationWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      showLoader();

      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );

        const data = await res.json();

        if (data.cod !== 200) throw new Error();

        hideLoader();
        displayWeather(data);
        getForecast(data.name);

      } catch {
        hideLoader();
        showError("Location fetch failed ❌");
      }
    });
  } else {
    showError("Geolocation not supported ❌");
  }
}

// ---------------- SEARCH ----------------
async function getWeather() {
  const city = cityInput.value.trim();

  if (!city) {
    showError("Enter a city ❗");
    return;
  }

  showLoader();

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );

    const data = await res.json();

    if (data.cod !== 200) {
      throw new Error(data.message);
    }

    hideLoader();
    displayWeather(data);
    getForecast(city);

  } catch {
    hideLoader();
    showError("City not found ❌");
  }
}

// ---------------- DISPLAY CURRENT WEATHER ----------------
function displayWeather(data) {
  clearError();

  const condition = data.weather[0].main.toLowerCase();

  document.getElementById("weatherIcon").src =
    `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

  document.getElementById("temp").textContent =
    `${Math.round(data.main.temp)}°C`;

  document.getElementById("desc").textContent =
    data.weather[0].description;

  document.getElementById("location").textContent =
    `${data.name}, ${data.sys.country}`;

  // Background change
  document.body.className = "";
  if (condition.includes("rain")) {
    document.body.classList.add("rainy");
  } else if (condition.includes("clear")) {
    document.body.classList.add("sunny");
  } else {
    document.body.classList.add("cloudy");
  }

  // Highlights
  document.getElementById("humidity").textContent =
    `${data.main.humidity}%`;

  document.getElementById("wind").textContent =
    (data.wind.speed * 3.6).toFixed(1) + " km/h";

  document.getElementById("pressure").textContent =
    `${data.main.pressure} hPa`;

  document.getElementById("clouds").textContent =
    `${data.clouds.all}%`;

  document.getElementById("sunrise").textContent =
    new Date(data.sys.sunrise * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  document.getElementById("sunset").textContent =
    new Date(data.sys.sunset * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
}

// ---------------- FORECAST ----------------
async function getForecast(city) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
    );

    const data = await res.json();

    displayForecast(data);
  } catch {
    showError("Forecast failed ❌");
  }
}

function displayForecast(data) {
  const forecastDiv = document.getElementById("forecast");
  forecastDiv.innerHTML = "";

  const daily = data.list.filter((item) =>
    item.dt_txt.includes("12:00:00")
  );

  // 5 days
  daily.slice(0, 5).forEach((day) => {
    forecastDiv.innerHTML += `
      <div class="forecast-card">
        <p>${new Date(day.dt_txt).toLocaleDateString()}</p>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
        <p>${Math.round(day.main.temp)}°C</p>
      </div>
    `;
  });

  // Tomorrow highlight
  if (daily[1]) {
    const tomorrow = daily[1];
    document.getElementById("tomorrow").innerHTML = `
      <h3>${new Date(tomorrow.dt_txt).toDateString()}</h3>
      <p>${tomorrow.weather[0].description}</p>
      <p>${Math.round(tomorrow.main.temp)}°C</p>
    `;
  }

  drawChart(daily);
}

// ---------------- CHART ----------------
let chart;

function drawChart(daily) {
  const ctx = document.getElementById("weatherChart");

  const labels = daily.map((d) =>
    new Date(d.dt_txt).toLocaleDateString()
  );

  const temps = daily.map((d) => d.main.temp);

  if (chart) chart.destroy(); // fix overlapping charts

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Temperature °C",
          data: temps,
          borderWidth: 2,
          tension: 0.3,
        },
      ],
    },
  });
}