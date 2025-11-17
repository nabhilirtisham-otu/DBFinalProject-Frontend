/*
Fetch weather information, load weather logs, render weather table, fill dropdown menu, and filter table
*/

const apiBase = "http://localhost:3001";                //Backend API base URL

//Retrieve + save city weather from OpenWeather API, update UI
async function fetchCityWeather(){
    const weatherCity = document.getElementById("cityInput").value.trim();          //Read city input value
    if (!city) return showMessage("Please enter a city,", "error");             //Error message for empty input

    try {
        showLoadingScreen();

        const response = await fetch(`${apiBase}/api/weather/fetch/${encodeURIComponent(city)}`, {              //GET request for city weather, with session cookies
            credentials: "include"
        });
        const weatherData = await response.json();              //Convert JSON response to JS object
        if(!response.ok) {                                      //Error message display
            showMessage(weatherData.error || "Could not fetch weather information.", "error");
            return;
        }

        const savedWeatherData = weatherData.saved;                 //Extract saved WeatherLog row inserted by backend
        document.getElementById("lastFetched").innerHTML = 
        `<strong>Saved:</strong> ${savedWeatherData.city} - ${savedWeatherData.temperature}°C - ${savedWeatherData.description} at ${new Date(savedWeatherData.time_logged).toLocaleString()}`;         //Update UI with weather data
        await loadWeatherLogs();                        //Refresh log list and city dropdown list
        showMessage("Weather fetched and saved", "success");                    //Success message
    } catch (error) {                                   //Error handling and logging
        console.error("fetchCityWeather", error);
        showMessage("Server errorr in fetching weather", "error");
    } finally {
        hideLoadingScreen();
    }
}

let fullWeatherLogs = [];                               //Store all weather rows from backend

//Load weather logs, update table/city filter dropdown menu
async function loadWeatherLogs(){
    try {
        showLoadingScreen();
        const response = await fetch(`${apiBase}/api/weather/logs`, {credentials: "include"});          //GET request for weather logs, with session cookies
        const logData = await response.json();                          //Convert JSON response to JS object
        fullWeatherLogs = logData.logs;                     //Save weather logs globally
        renderWeatherTable(fullWeatherLogs);                //Fill table with weather logs
        populateCityFilter(fullWeatherLogs);                //Generate unique city list for dropdown filter
    } catch (error) {                                   //Error handling and logging
        console.error("loadWeatherLogs", error);
        showMessage("Failed to load weather logs", "error");
    } finally {
        hideLoadingScreen();
    }
}

//Display rows in table body
function renderWeatherTable(rows) {
    const tBody = document.querySelector("#weatherTable tbody");                //Select and clean weather table body
    tBody.innerHTML = "";

    rows.forEach(r => {                             //For each log entry
        const tRow = document.createElement("tr");          //Create table row
        tRow.innerHTML = `<td>${r.city}</td><td>${r.temperature}</td><td>${r.description}</td><td>${new Date(r.time_logged).toLocaleString()}</td>`;            //Fill table row with city, temp, desc, timestamp
        tBody.appendChild(tRow);                    //Append table row to table
    });
}

//Fill dropdown menu with unique cities
function populateCityFilter(rows){
    const filterCities = [...new Set(rows.map(r => r.city).filter(Boolean))];               //Extract and sanities city names, remove duplicates, turn set back into array
    const select = document.getElementById("cityFilter");                       //Select dropdown menu
    select.innerHTML = `<option value="">(all)</option>`;                       //Default "all cities" option
    filterCities.forEach(c => {
        const opt = document.createElement("option");               //Create <option> tag for every city
        opt.value = c;                                              //Set value and text content to city being iterated over
        opt.textContent = c;
        select.appendChild(opt);                                    //Append option to dropdown menu
    });
}

//Filter table with selected city
function filterLogs(){
    const filterCity = document.getElementById("cityFilter").value;             //Read city current selected from dropdown menu
    if(!city) renderWeatherTable(fullWeatherLogs);                      //If "all" option selected, show all rows
    else renderWeatherTable(fullWeatherLogs.filter(r => r.city === city));              //Otherwise, filter rows where row city matches the chosen city
}