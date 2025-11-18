/*
Load venues and add events
*/

//Load venues from backend and fill dropdown menu
async function loadVenues() {
    const res = await fetch(`${apiBase}/api/organizer/events/venues`, {
        credentials: "include"
    });

    if (!res.ok) {
        console.error("Could not load venues, status:", res.status);
        return;
    }

    const data = await res.json();
    const select = document.getElementById("eventVenue");

    // Clear old options
    select.innerHTML = "";

    data.venues.forEach(v => {
        const option = document.createElement("option");
        option.value = v.venue_id;
        option.textContent = v.venue_name;
        select.appendChild(option);
    });
}


//Send event data to backend to create new event
document.getElementById("eventForm").addEventListener("submit", async (e) => {      //Add submit event listener to eventForm form
    e.preventDefault();                                         //Prevent default form submission

    const reqBody = {                                           //Request body: event venue ID, title, description, start/end times, price, and status
        venue_id: document.getElementById("eventVenue").value,
        title: document.getElementById("title").value,
        event_description: document.getElementById("event_description").value,
        start_time: document.getElementById("start_time").value,
        end_time: document.getElementById("end_time").value,
        standard_price: document.getElementById("standard_price").value,
        event_status: document.getElementById("event_status").value
    };

    await fetch(`${apiBase}/api/events`, {               //Send POST request to backend providing event information, along with session cookies
        method: "POST",
        headers: { "Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify(reqBody)
    });

    window.location.href="orgDashboard.html";                   //Redirect to dashboard and reload page
});