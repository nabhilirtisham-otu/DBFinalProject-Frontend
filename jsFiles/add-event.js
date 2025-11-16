/*
Load venues and add events
*/

const apiBase = "http://localhost:3001";                //Backend API base URL

//Lod venus from backend and fill dropdown menu
async function loadVenues(){
    const response = await fetch(`${apiBase}/api/events/venues`, {credentials: "include"});     //GET request to backend for venues, sending sessions cookies as well
    const venueData = await response.json()                                 //Convert JSON response to JS object

    const select = document.getElementById("venue_id");         //Get <select> element with id venue_id (dropdown menu element)
    select.innerHTML="";                                        //Clean dropdown

    venueData.venues.forEach(v => {                             //Loop through each venue returned
        select.innerHTML += `<option value="${v.venue_id}">${v.venue_name} (${v.city})</option>`;       //Store venue id, display venue name and city
    });
}

