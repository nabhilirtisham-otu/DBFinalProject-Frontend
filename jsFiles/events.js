/*
Performs filtering, table rendering, and auto-suggestion functionality
*/

async function loadEvents(){
    const sTerm = document.getElementById("searchTerm").value;      //Read search term input
    const sDate = document.getElementById("startDate").value;      //Read start date input
    const eDate = document.getElementById("endDate").value;      //Read end date input
    const cFilter = document.getElementById("cityFilter").value;      //Read city filter input

    const qParams = new URLSearchParams({q: sTerm, startDate: sDate, endDate: eDate, cFilter, limit: 100});      //URL query string object using filter values, limited to 100 results
    const response = await fetch(`${apiBase}/api/events?${qParams.toString()}`, {credentials: "include"});       //Send GET to backend with query parameters (cookies included)
    const tData = await response.json();                         //Convert JSON from server into JS object

    const tBody = document.querySelector("#eventDisplay tbody");        //Assign <tbody> in the table to a variable
    tBody.innherHTML = "";                                      //Clean table body

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

async function loadCities(){
    const response = await fetch(`${apiBase}/api/events`, {credentials:"include"});     //Request to fetch all events, including session cookies
    const eventData = await response.json();                                                 //Convert response to JS object

    const eventCities = [...new Set(data.events.map(e => e.city))];         //Extract city names from events and convert to an array
    const select = document.getElementById("cityFilter");           //Choose <select> dropdown menu for city filtering

    eventCities.forEach(city => {
        const option = document.createElement("option");                //Create a new <option> element in the dropdown
        option.value = city;                        //Set the <option> internal value to the name of city being iterated over
        option.textContent = city;                  //Set the <option> text display to the name of city being iterated over
        select.appendChild(opt)                     //Add the new <option> element into the dropdown list
    });
}

loadEvents();
loadCities();