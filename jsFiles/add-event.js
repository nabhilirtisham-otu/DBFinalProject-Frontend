/*
Load venues and add events
*/

const apiBase = "http://localhost:3000";                //Backend API base URL

//Load venues from backend and fill dropdown menu
async function loadVenues(){
    const response = await fetch(`${apiBase}/api/events/venues`, {credentials: "include"});     //GET request to backend for venues, sending sessions cookies as well
    const venueData = await response.json()                                 //Convert JSON response to JS object

    const select = document.getElementById("venue_id");         //Get <select> element with id venue_id (dropdown menu element)
    select.innerHTML="";                                        //Clean dropdown

    venueData.venues.forEach(v => {                             //Loop through each venue returned
        select.innerHTML += `<option value="${v.venue_id}">${v.venue_name} (${v.city})</option>`;       //Store venue id, display venue name and city
    });
}

//Send event data to backend to create new event
document.getElementById("eventForm").addEventListener("submit", async (e) => {      //Add submit event listener to eventForm form
    e.preventDefault();                                         //Prevent default form submission

    const reqBody = {                                           //Request body: event venue ID, title, description, start/end times, price, and status
        venue_id: document.getElementById("venue_id").value,
        title: document.getElementById("title").value,
        event_description: document.getElementById("event_description").value,
        start_time: document.getElementById("start_time").value,
        end_time: document.getElementById("end_time").value,
        standard_price: document.getElementById("standard_price").value,
        event_status: document.getElementById("event_status").value
    };

    await fetch(`${apiBase}/api/events/venues`, {               //Send POST request to backend providing event information, along with session cookies
        method: "POST",
        headers: { "Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify(reqBody)
    });

    window.location.href="orgDashboard.html";                   //Redirect to dashboard and reload page
});