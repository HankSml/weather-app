var apiKey = "50fa27860ffaf97937b89839d76643a8";
var cityList = [];

// stores cityList in localStorage
function storeCities() {
    localStorage.setItem("cities", JSON.stringify(cityList));
}


    // adds last searched city to list-group as button for user to select city
function createSearchHistory(){
    $(".cityList").empty();
    cityList.forEach(function(city) {
        $(".cityList").prepend($(`<button class="list-group-item list-group-item-action cityButton" data-city="${city}">${city}</button>`));
    })
}

// loads cityList from local storage and calls api to get data for last searched city if it exists
function load() {
    var storedCities = JSON.parse(localStorage.getItem("cities"));

    if (storedCities !== null) {
        cityList = storedCities;
    }
    createSearchHistory();

    if (cityList) {
        var thisCity = cityList[cityList.length - 1]
        getCurrentWeather(thisCity, apiKey);
        getForecast(thisCity, apiKey);
    }
}


// gets current forecast for selected city and calls uv index function
function getCurrentWeather(thisCity, apiKey) {
    var weatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${thisCity}&units=imperial&appid=${apiKey}`;
    var cityLat;
    var cityLong;

    $.ajax({
        url: weatherURL,
        method: "GET"
    }).then(function (data) {
        $(".cityCurrent").append(
            `<div class="row ml-1">
                <h3 class="mr-3">${data.name} (${(new Date(1000 * data.dt).getUTCMonth()) + 1}/${(new Date(1000 * data.dt).getUTCDate()) - 1}/${new Date(1000 * data.dt).getUTCFullYear()})</h3>
                <img src="http://openweathermap.org/img/w/${data.weather[0].icon}.png">
            </div>`
        )
        $(".cityCurrent").append(`<p>Temperature: ${data.main.temp} &degF</p>`)
        $(".cityCurrent").append(`<p>Wind: ${data.wind.speed} mph</p>`)
        $(".cityCurrent").append(`<p>Humidity: ${data.main.humidity} %</p>`)
        cityLat = data.coord.lat;
        cityLong = data.coord.lon;
        getUVI(apiKey, cityLat, cityLong);
    })

}

// gets 5 day forecast for selected city
function getForecast(thisCity, apiKey) {
    var forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${thisCity}&units=imperial&appid=${apiKey}`;

    $.ajax({
        url: forecastURL,
        method: "GET"
    }).then(function (data) {
        for (i = 0; i < data.list.length; i++) {
            if (data.list[i].dt_txt.search("15:00:00") != -1) {
                var forecastDate = data.list[i];
                $(".forecast").append(
                    `<div class="card shadow m-4">
                        <div class="card-body">
                            <h4 class="card-title">${(new Date(1000 * forecastDate.dt).getUTCMonth()) + 1}/${new Date(1000 * forecastDate.dt).getUTCDate()}/${new Date(1000 * forecastDate.dt).getUTCFullYear()}</h4>
                            <div class="card-text">
                                <img src="http://openweathermap.org/img/w/${forecastDate.weather[0].icon}.png">
                                <p class="card-text">Temp: ${forecastDate.main.temp} &degF</p>
                                <p class="card-text">Humidity: ${forecastDate.main.humidity} %</p>
                            </div>
                        </div>
                    </div>`
                );
            }
        }

    })
}

// called within getCurrentWeather() to get uv index for selected city
function getUVI(apiKey, cityLat, cityLong) {
    var uvURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${cityLat}&lon=${cityLong}&appid=${apiKey}`;

    $.ajax({
        url: uvURL,
        method: "GET"
    }).then(function (data) {
        $(".cityCurrent").append(`<p>UV Index: <span class="badge badge-danger p-2">${data.value}</span></p>`);
    })
}

// main function that clears divs and calls current and 5-day forecasts for city
function displayCityWeather() {
    var thisCity = $(this).attr("data-city");

    $(".cityCurrent").empty();
    getCurrentWeather(thisCity, apiKey);

    $(".forecast").empty();
    getForecast(thisCity, apiKey);
    
}

function displaySubmitCityWeather() {
    var thisCity = $("#citySearchInput").val().trim();

    $(".cityCurrent").empty();
    getCurrentWeather(thisCity, apiKey);

    $(".forecast").empty();
    getForecast(thisCity, apiKey);
    
}
// submit event that loads new data
$("form").on("submit", function(event) {
    event.preventDefault();
    var newCity = $("#citySearchInput").val().trim();
    cityList.push(newCity);
    createSearchHistory();
    storeCities();
    displaySubmitCityWeather();
    $("#citySearchInput").val("");
})

// calls main on page load function
load();

// click event for search history that calls displayCityWeather()
$(".cityList").on("click", ".cityButton", displayCityWeather);
