// Obj used as a singleton to store
const config = {
    choice: "city-name"  // Default choice
};

const appid = "b08376140a2fb62b5b1db55a4797a065";
const openapiUrl = "https://api.openweathermap.org/data/2.5/onecall";
const geoapiUrl = "http://api.openweathermap.org/geo/1.0/direct";
const geoapiReverseUrl = "http://api.openweathermap.org/geo/1.0/reverse";
const restcountriesUrl = "https://restcountries.com/v2/alpha/";

const navBtns = document.querySelectorAll(".menu__nav__btn");
const menus = document.querySelectorAll(".menu__content__bar");
window.onload = init;

const citySpan = document.getElementById("city");
        countrySpan = document.getElementById("country"),
        weatherSpan = document.getElementById("weather-cond"),
        desciptionSpan = document.getElementById("desciption"),
        tempratureSpan = document.getElementById("temprature"),
        humiditySpan = document.getElementById("humidity"),
        pressureSpan = document.getElementById("pressure"),
        windSpeedSpan = document.getElementById("wind-speed"),
        windDirectionSpan = document.getElementById("wind-direction"),
        timeSpan = document.getElementById("time");

function init() {
    navBtns.forEach(item=>{
        item.addEventListener("click", e=>{
            setActive(e.target.value);
        });
    });

    document.forms[0].addEventListener("submit", cityNameHandleSubmit);
    document.forms[1].addEventListener("submit", coordinatesHandleSubmit);
    document.forms[2].addEventListener("submit", currentPositionHandleSubmit);
}

/**
 * Sets given option as active
 * @param {"city-name" | "coordinates" | "curr-location"} option target option to set active
 */
function setActive(option) {
    navBtns.forEach(item=>{
        // Set button styles
        if (item.value === option) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
        // Show corresponding menu
        menus.forEach(item=>{
            if(item.id === option) {
                item.classList.remove("hidden");
            } else {
                item.classList.add("hidden");
            }
        })
    });
}

/**
 * City Name form submit handler
 * @param {SubmitEvent} e form submission event
 */
function cityNameHandleSubmit(e) {
    e.preventDefault();
    const cityName = e.target[0].value.trim();

    getCityCoords(cityName)
    .then(coordinatesData => {
        const {lat, lon} = coordinatesData;
        getWeatherForCoords(lat, lon)
        .then(weatherData=>{
            displayData({...weatherData, ...coordinatesData});
        })
        .catch(err=>{console.error(err)});
    })
    .catch(err=>{console.error(err)});
}

/**
 * Coordinates form submit handler
 * @param {SubmitEvent} e form submission event
 */
function coordinatesHandleSubmit(e) {
    e.preventDefault();
    const [lat, lon] = e.target;
    getCityName(lat.value, lon.value)
    .then(cityData=>{
        getWeatherForCoords(lat.value, lon.value).then(weatherData=>{
            displayData({...weatherData, ...cityData});
        })
        .catch(err=>{console.error(err)});
    })
    .catch(err=>{console.error(err)});
}

/**
 * Current Position form submit handler
 * @param {SubmitEvent} e form submission event
 */
function currentPositionHandleSubmit(e) {
    e.preventDefault();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position=>{
            const {latitude, longitude} = position.coords;
            getCityName(latitude, longitude)
            .then(coordinatesData=>{
                getWeatherForCoords(latitude, longitude)
                .then(weatherData=>{
                    displayData({...weatherData, ...coordinatesData});
                })
                .catch(err=>{console.error(err)});
            })
            .catch(err=>{console.error(err)});
        });
    } else {
        console.error("Navigation is not supported in your browser");
    }
}

/**
 * Returns coordinates of a city
 * @param {string} cityName name of the city
 */
async function getCityCoords(cityName) {
    const query = {
        q: cityName,
        appid,
        limit: 5,
        units: "metric"
    };
    const response = await fetch(geoapiUrl + '?' + new URLSearchParams(query).toString());
    const data = await response.json();
    return data[0];
}

/**
 * Display data on page
 * @param {Object} data target data to display
 */
function displayData(data) {
    getCountryFullName(data["country"]).then(countryName=>{
        citySpan.textContent = data.name;
        countrySpan.textContent = countryName;
        weatherSpan.textContent = data.current.weather[0].main;
        desciptionSpan.textContent = data.current.weather[0].description;
        // TODO: add min, max, feels_like temprature
        tempratureSpan.textContent = data.current.temp;
        humiditySpan.textContent = data.current.humidity;
        pressureSpan.textContent = data.current.pressure;
        windSpeedSpan.textContent = data.current.wind_speed;
        windDirectionSpan.textContent = `${data.current.wind_deg}° (${getDirection(data.current.wind_deg)})`
        timeSpan.textContent = new Date(data.current.dt * 1000).toLocaleString();
        document.getElementById("results-bar").classList.remove("hidden");
    });
}

/**
 * Returns weather for given coordinates
 * @param {number} lat latitude
 * @param {number} lon longtitude
 */
async function getWeatherForCoords(lat, lon) {
    const query = {
        lat,
        lon,
        appid,
        units: "metric",
        exclude: "alerts",
    };
    const response = await fetch(openapiUrl + '?' + new URLSearchParams(query).toString());
    const data = await response.json();
    console.log(data);
    return data;
}

/**
 * Returns country full name
 * @param {string} code country code
 */
async function getCountryFullName(code) {
    const response = await fetch(restcountriesUrl+code);
    const data = await response.json();
    return data["name"];
}

/**
 * Returns city name based on lat and log
 * @param {number} lat latitude
 * @param {number} lon longtitude
 */
async function getCityName(lat, lon) {
    const query = {
        appid,
        limit: 5,
        lat: lat,
        lon: lon,
        units: "metric",
    };
    const response = await fetch(geoapiReverseUrl + '?' + new URLSearchParams(query).toString());
    const data = await response.json();
    return data[0];
}

/**
 * Returns direction of a wind based on degree
 * @param {number} degree degree of wind
 */
function getDirection(degree) {
    return {
        1 :"North",
        2: "North-East",
        3: "East",
        4: "South-East",
        5: "South",
        6: "South-West",
        7: "West",
        8: "North-West",
        9: "North"
    }[Math.round(degree / 45) + 1];
}
