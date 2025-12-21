const API_KEY = "c14d2cf26c6126be5bf6a88093bde4d4";

const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");

searchBtn.addEventListener("click", getWeather);
cityInput.addEventListener("keydown", e => {
  if (e.key === "Enter") getWeather();
});

async function getWeather() {
  const city = cityInput.value.trim();
  const unit = document.getElementById("unitSelect").value;

  if (!city) {
    alert("Enter a city name first!");
    return;
  }

  try {
    document.getElementById("temp").textContent = "Loading...";

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${unit}`
    );

    if (!response.ok) throw new Error("City not found");

    const data = await response.json();

    // Left section
    document.getElementById("weatherIcon").style.background =
      `url(https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png) center/contain no-repeat`;

    document.getElementById("temp").textContent =
      `${Math.round(data.main.temp)}°${unit === "metric" ? "C" : "F"}`;

    document.getElementById("desc").textContent =
      data.weather[0].description;

    document.getElementById("location").textContent =
      `${data.name}, ${data.sys.country}`;

    // Highlights
    document.getElementById("humidity").textContent =
      `${data.main.humidity}%`;

    const windSpeed =
      unit === "metric"
        ? (data.wind.speed * 3.6).toFixed(1) + " km/h"
        : data.wind.speed + " mph";

    document.getElementById("wind").textContent = windSpeed;

    document.getElementById("pressure").textContent =
      `${data.main.pressure} hPa`;

    document.getElementById("clouds").textContent =
      `${data.clouds.all}%`;

    const sunrise = new Date(data.sys.sunrise * 1000)
      .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const sunset = new Date(data.sys.sunset * 1000)
      .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    document.getElementById("sunrise").textContent = sunrise;
    document.getElementById("sunset").textContent = sunset;

  } catch (error) {
    alert(error.message);
  }
}
