// Obj used as a singleton to store
const config = {
    choice: "city-name"  // Default choice
}
const appid = "b08376140a2fb62b5b1db55a4797a065";
const openapiUrl = "https://api.openweathermap.org/data/2.5/onecall";
const geoapiUrl = "http://api.openweathermap.org/geo/1.0/direct";

const navBtns = document.querySelectorAll(".menu__nav__btn");
const menus = document.querySelectorAll(".menu__content__bar");
window.onload = init;

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
 * @param {SubmitEvent} e
 */
function cityNameHandleSubmit(e) {
    e.preventDefault();
    const q = e.target[0].value.trim();
    const query = {
        q,
        appid,
        units: 'metric',
        limit: 5
    }

    fetch(geoapiUrl + '?' + new URLSearchParams(query).toString())
    .then(response=>response.json()).then(data=>{
        // Extracting only necessary fields
        const {lat, lon} = data[0];
        return {lat, lon}
    }).then(coords=>{
        const query = {
            lat: coords.lat,
            lon: coords.lon,
            exclude: 'alerts,daily,hourly,minutely',
            units: 'metric',
            appid,
        }
        fetch(openapiUrl + '?' + new URLSearchParams(query).toString())
        .then(response=>response.json())
        .then(data=>{console.log(data)});
    }).catch(e=>{
        console.error(e);
        console.log("Unexpected error happened");
    });
}

/**
 * Coordinates form submit handler
 * @param {SubmitEvent} e
 */
function coordinatesHandleSubmit(e) {
    e.preventDefault();

}

/**
 * Current Position form submit handler
 * @param {SubmitEvent} e
 */
function currentPositionHandleSubmit(e) {
    e.preventDefault();

}
