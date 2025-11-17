/*
Performs city filtering and table rendering
*/

console.log("events.js loaded");

async function loadEvents(){
    const sTerm = document.getElementById("searchTerm").value;      //Read search term input
    const sDate = document.getElementById("startDate").value;      //Read start date input
    const eDate = document.getElementById("endDate").value;      //Read end date input
    const city = document.getElementById("cityFilter").value;      //Read city filter input

    const qParams = new URLSearchParams({q: sTerm, startDate: sDate, endDate: eDate, city, limit: 100});      //URL query string object using filter values, limited to 100 results
    const response = await fetch(`${apiBase}/api/events?${qParams.toString()}`, {credentials: "include"});       //Send GET to backend with query parameters (cookies included)
    const tData = await response.json();                         //Convert JSON from server into JS object

    const tBody = document.querySelector("#eventDisplay tbody");        //Assign <tbody> in the table to a variable
    tBody.innerHTML = "";                                      //Clean table body

    tData.events.forEach(ev => {                                //Insert event information into the event display table for every event object in the returned data
        const evRow = `<tr>
        <td>${ev.title}</td>
        <td>${ev.city}</td>
        <td>${new Date(ev.start_time).toLocaleString()}</td>
        <td>$${ev.standard_price}</td>
        </tr>`;
        tBody.innerHTML += evRow;
    });
}

async function loadCities() {
    console.log("loadCities() called");

    try {
        const response = await fetch(`${apiBase}/api/events/cities`, {
            credentials: "include"
        });

        const data = await response.json();   // <-- data is initialized here
        console.log("City API raw response:", data);
        console.log("cities array:", data.cities);

        const select = document.getElementById("cityFilter");

        // Reset dropdown
        select.innerHTML = `<option value="">Any City</option>`;

        data.cities.forEach(city => {
            console.log("Adding:", city);
            const option = document.createElement("option");
            option.value = city;
            option.textContent = city;
            select.appendChild(option);
        });

        console.log("Dropdown children:", select.children);

    } catch (err) {
        console.error("Error loading cities", err);
    }
}


document.addEventListener("DOMContentLoaded", async () => {
    await loadCities();
    await loadEvents();
});
