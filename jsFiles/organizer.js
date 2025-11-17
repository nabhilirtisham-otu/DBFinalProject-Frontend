/*
Organizer event view and event manipulation buttons
*/

const apiBase = "http://localhost:3000";                        //Backend API base URL

//Function to load all events for the organizer
async function loadOrganizerEvents(){
    const response = await fetch(`${apiBase}/api/organizer/events`, {credentials: "include"});      //GET request (along with cookies) to backend to retrieve events
    const eventData = await response.json();                    //Convert event information from JSON to JS object

    const tBody = document.querySelector("#eventTable tbody");          //Prepares to append event information to the event table
    tBody.innerHTML="";                                         //Clean existing table rows

    eventData.events.forEach(ev => {                            //Add event information to the table, along with buttons to edit/delete events and manage tickets
        tBody.innherHTML += `
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
}

//Edit event information
function editEvent(eventID){
    window.location.href=`edit-event.html?id=${eventID}`;               //Switch to edit events page
}

//Manage tickets for an event
function manageTickets(eventID){
    window.location.href=`tickets.html?id=${eventID}`;                  //Switch to manage tickets page
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