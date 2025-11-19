/*
Edit details for an existing event.
*/

const urlParameters = new URLSearchParams(window.location.search);      //Return and convert URL query string into a readable object
const eID = urlParameters.get("id");                //Retrieve event ID from URL query string object

//Fetch event data and fill form
async function loadEvent(){
    const response = await fetch(`${apiBase}/api/organizer/events/${eID}`,      //GET request, along with session cookies, to retrieve event information
        {credentials: "include"
    });

    const eventData = await response.json();            //Convert server response into JSON
    const eventInfo = eventData.event;                  //Extract specific event object from eventData JSON

    document.getElementById("title").value = eventInfo.title;                           //Populate form fields with event information (title, description, etc.)
    document.getElementById("event_description").value = eventInfo.event_description;
    document.getElementById("start_time").value = eventInfo.start_time.replace(' ', 'T').substring(0, 16);       //Matches SQL format to HTML format
    document.getElementById("end_time").value = eventInfo.end_time.replace(' ', 'T');
    document.getElementById("standard_price").value = eventInfo.standard_price;
    document.getElementById("event_status").value = eventInfo.event_status;
}

//Load venues from backend and fill dropdown menu
async function loadVenues(){
    const response = await fetch(`${apiBase}/api/events/venues/all`, {credentials: "include"});     //GET request to backend for venues, sending sessions cookies as well
    const venueData = await response.json();                                 //Convert JSON response to JS object

    const select = document.getElementById("venue_id");         //Get <select> element with id venue_id (dropdown menu element)

    select.innerHTML = "";
    venueData.venues.forEach(v => {                             //Loop through each venue returned
        select.innerHTML += `<option value="${v.venue_id}">${v.venue_name} (${v.city})</option>`;       //Store venue id, display venue name and city
    });
}

//Send event data to backend to edit an event
document.getElementById("editForm").addEventListener("submit", async (e) => {           //Add submit event listener to editForm form
    e.preventDefault();                                         //Prevent default form submission

    const venue_id = document.getElementById("venue_id").value;
    const title = document.getElementById("title").value.trim();
    const event_description = document.getElementById("event_description").value.trim();
    const start_time = document.getElementById("start_time").value;
    const end_time = document.getElementById("end_time").value;
    const standard_price = Number(document.getElementById("standard_price").value);
    const event_status = document.getElementById("event_status").value;

    if (!venue_id || !title || !event_description || !start_time || !end_time || Number.isNaN(standard_price)) {
        showMessage("Please fill all fields before submitting.", "error");
        return;
    }

    if (standard_price < 0) {
        showMessage("Standard price cannot be negative.", "error");
        return;
    }

    const reqBody = {                                           //Request body: event venue ID, title, description, start/end times, price, and status
        venue_id,
        title,
        event_description,
        start_time,
        end_time,
        standard_price,
        event_status
    };

    await fetch(`${apiBase}/api/organizer/events/${eID}`, {               //Send PUT request to backend providing event information, along with session cookies
        method: "PUT",
        headers: { "Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify(reqBody)
    });

    window.location.href="orgDashboard.html";                   //Redirect to dashboard and reload page
});
