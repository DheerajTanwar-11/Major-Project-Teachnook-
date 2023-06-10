const wrapper = document.querySelector(".wrapper"),
	inputPart = document.querySelector(".input-part"),
	infoTxt = inputPart.querySelector(".info-txt"),
	inputField = inputPart.querySelector("input"),
	locationBtn = inputPart.querySelector("button"),
	weatherPart = wrapper.querySelector(".weather-part"),
	wIcon = weatherPart.querySelector("img"),
	arrowBack = wrapper.querySelector("header i");

let api;

inputField.addEventListener("keyup", (e) => {
	if (e.key == "Enter" && inputField.value != "") {
		requestApi(inputField.value);
	}
});

locationBtn.addEventListener("click", () => {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(onSuccess, onError);
	} else {
		alert("Your browser not support geolocation api");
	}
});

function requestApi(city) {
	api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=dea3a4acfb3677295649557530d0054c`;
	fetchData();
}

function onSuccess(position) {
	const { latitude, longitude } = position.coords;
	api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=dea3a4acfb3677295649557530d0054c`;
	fetchData();
}

function onError(error) {
	infoTxt.innerText = error.message;
	infoTxt.classList.add("error");
}

//New fetch Data
function fetchData() {
	infoTxt.innerText = "Getting weather details...";
	infoTxt.classList.add("pending");

	// Fetch current weather data from OpenWeatherMap
	fetch(api)
		.then((res) => res.json())
		.then((result) => {
			weatherDetails(result);
			const city = result.name;

			// Fetch forecast data from WeatherBit
			const forecastApi = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&days=7&key=d9b36db6f704416da8e3430eebd06488`;
			console.log("Forecast API: ", forecastApi);
			return fetch(forecastApi);
		})
		.then((res) => res.json())
		.then((forecastResult) => {
			console.log("Forecast Result:", forecastResult);
			const next7Days = parseForecastData(forecastResult);
			console.log("Next 7 Days: ", next7Days);
			updateForecastCards(next7Days);
			console.log(forecastResult);
		})
		.catch(() => {
			infoTxt.innerText = "Something went wrong";
			infoTxt.classList.replace("pending", "error");
		});
}

function parseForecastData(forecastData) {
	const next7Days = forecastData.data.map((data) => {
		const date = new Date(data.valid_date);
		const dayName = getDayName(date);
		const temperature = Math.round(data.temp);
		const { description, code } = data.weather;

		return {
			dayName,
			temperature,
			description,
			code,
		};
	});

	return next7Days;
}

//function to get dayName
function getDayName(date) {
	const daysOfWeek = [
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	];
	return daysOfWeek[date.getDay()];
}

//function to get weather icon
function getWeatherIcon(weatherCondition) {
	if (weatherCondition == 800) {
		return "Assets/clear.svg";
	} else if (weatherCondition >= 200 && weatherCondition <= 233) {
		return "Assets/storm.svg";
	} else if (weatherCondition >= 600 && weatherCondition <= 623) {
		return "Assets/snow.svg";
	} else if (weatherCondition >= 721 && weatherCondition <= 751) {
		return "Assets/haze.svg";
	} else if (weatherCondition >= 801 && weatherCondition <= 804) {
		return "Assets/cloud.svg";
	} else if (
		(weatherCondition >= 500 && weatherCondition <= 522) ||
		(weatherCondition >= 300 && weatherCondition <= 302)
	) {
		return "Assets/rain.svg";
	}
}

//Fun to get current weather details
function weatherDetails(info) {
	if (info.cod == "404") {
		infoTxt.classList.replace("pending", "error");
		infoTxt.innerText = `${inputField.value} isn't a valid city name`;
	} else {
		const city = info.name;
		const currentDate = new Date();
		const country = info.sys.country;
		const { description, id } = info.weather[0];
		const { temp, feels_like, humidity } = info.main;
		const windSpeed = info.wind.speed;

		if (id == 800) {
			wIcon.src = "Assets/clear.svg";
		} else if (id >= 200 && id <= 232) {
			wIcon.src = "Assets/storm.svg";
		} else if (id >= 600 && id <= 622) {
			wIcon.src = "Assets/snow.svg";
		} else if (id >= 701 && id <= 781) {
			wIcon.src = "Assets/haze.svg";
		} else if (id >= 801 && id <= 804) {
			wIcon.src = "Assets/cloud.svg";
		} else if ((id >= 500 && id <= 531) || (id >= 300 && id <= 321)) {
			wIcon.src = "Assets/rain.svg";
		}

		weatherPart.querySelector(".temp .numb").innerText = Math.floor(temp);
		weatherPart.querySelector(".weather").innerText = description;
		weatherPart.querySelector(
			".location span"
		).innerText = `${city}, ${country}`;
		weatherPart.querySelector(".date-time").innerText =
			currentDate.toLocaleString();
		weatherPart.querySelector(".temp .numb-2").innerText =
			Math.floor(feels_like);
		weatherPart.querySelector(".humidity span").innerText = `${humidity}%`;
		weatherPart.querySelector(
			".wind-speed span"
		).innerText = `${windSpeed} m/s`;
		infoTxt.classList.remove("pending", "error");
		infoTxt.innerText = "";
		inputField.value = "";
		wrapper.classList.add("active");
	}
}

// Function to update forecast card
function updateForecastCards(next7Days) {
	const forecastCards = document.querySelectorAll(".day");

	forecastCards.forEach((card, index) => {
		const dayNameElement = card.querySelector(".day-name");
		const temperatureElement = card.querySelector(
			".day-temp .day-temp-numb"
		);
		const weatherCode = next7Days[index].code;
		const iconUrl = getWeatherIcon(weatherCode);

		dayNameElement.textContent = next7Days[index].dayName;
		temperatureElement.textContent = next7Days[index].temperature;
		card.querySelector(".day img").src = iconUrl;
	});
}

arrowBack.addEventListener("click", () => {
	wrapper.classList.remove("active");
});
