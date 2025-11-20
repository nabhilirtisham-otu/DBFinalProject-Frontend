/*
Organizer event view and event manipulation buttons
*/

//Function to load all events for the organizer
async function loadOrganizerEvents(){
    try {
        showLoadingScreen();
        const response = await fetch(`${apiBase}/api/organizer/events`, {credentials: "include"});      //GET request (along with cookies) to backend to retrieve events

        if (response.status === 401){
            requireAuth();
            return;
        }

        if (response.status === 403){
            showMessage("You do not have permission to view organizer events.", "error");
            return;
        }

        if (!response.ok){
            showMessage("Could not load organizer events.", "error");
            return;
        }

        const eventData = await response.json();                    //Convert event information from JSON to JS object
        const events = eventData.events || [];

        const tBody = document.querySelector("#eventTableBody");          //Prepares to append event information to the event table
        tBody.innerHTML="";                                         //Clean existing table rows

        if (events.length === 0) {
            tBody.innerHTML = `<tr><td colspan="5">No events found yet.</td></tr>`;
            return;
        }

        events.forEach(ev => {                            //Add event information to the table, along with buttons to edit/delete events and manage tickets
            tBody.innerHTML += `
                <tr>
                    <td>${ev.title}</td>
                    <td>${ev.city}</td>
                    <td>${new Date(ev.start_time).toLocaleString()}</td>
                    <td>${ev.standard_price}</td>
                    <td>
                        <button onclick="editEvent(${ev.event_id})">Edit</button>
                        <button onclick="deleteEvent(${ev.event_id})">Delete</button>
                        <button onclick="manageTickets(${ev.event_id})">Tickets</button>
                    </td>
                </tr>`;
        });
    } catch (error){
        console.error("loadOrganizerEvents", error);
        showMessage("Server error while loading organizer events.", "error");
    } finally {
        hideLoadingScreen();
    }
}

//Edit event information
function editEvent(eventID){
    window.location.href=`edit-event.html?id=${eventID}`;               //Switch to edit events page
}

//Manage tickets for an event
function manageTickets(eventID){
    window.location.href=`tickets.html?event_id=${eventID}`;                  //Switch to manage tickets page
}

function viewOrderHistory(){
    window.location.href = "orders.html";
}

//Delete an event
async function deleteEvent(eventID){
    if (!confirm("Are you sure you want to delete this event?")) return;        //Confirmation message

    await fetch(`${apiBase}/api/organizer/events/${eventID}`, {             //Fetch DELETE request to backend to delete event
        method: "DELETE",
        credentials: "include"                                              //Send cookies along with request for authentication
    });

    loadOrganizerEvents();                                                  //Reload table UI
}