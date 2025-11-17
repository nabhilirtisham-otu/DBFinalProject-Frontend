const apiBase = "http://localhost:3001";                //Backend API base URL

let currentTickets = [];                                //Hold tickets returned by backend for chosen event
let selectedTicketIDs = new Set();                      //Hold checkboxes user checked (no duplication of IDs)

//Initial setup page for buying tickets
async function initBuyPage() {
    try {
        await loadEventDropdown();                      //Poplate dropdown with available events
        document.getElementById("eventSelect").addEventListener("change", onEventChange)        //After use selects event, perform onEventChange()
    } catch (error) {                                   //Error handling and logging
        console.error("initBuyPage", error);
        showMessage("Could not initialize buy page.", "error");
    }
}

//Load events into dropdown selection menu
async function loadEventDropdown(){
    try{
        showLoadingScreen();                            //Loading screen overlay
        const response = await fetch(`${apiBase}/api/events?limit=200`, {credentials: "include"});      //GET request (with cookies) to retrieve event information
        if (response.status === 401){                   //If backend determines user isn't authenticated, redirect to login
            hideLoadingScreen();
            requireAuth();
            return;
        }
        const data = await response.json();             //Convert backend JSON to JS object
        const select = document.getElementById("eventSelect");                  //Choose <select> element, inserts default placeholder option
        select.innerHTML = `<option value="">--- Select Event ---</option>`;
        (data.events || []).forEach(ev => {              //Loop through backend events
            const option = document.createElement("option");        //Create option node
            option.value = ev.event_id;                 //Set value to event ID
            option.textContent = `${ev.title} - ${ev.city} - ${new Date(ev.start_time).toLocaleString()}`;      //Show event title, city, and date
            select.appendChild(option);                 //Append option to dropdown menu
        });
    } catch (error){                                    //Error handling and logging
        console.error("loadEventDropdown", error);
        showMessage("Could not successfully load events.", "error");
    } finally {
        hideLoadingScreen();
    }
}

//Runs when use selects an event
async function onEventChange(event){
    const eID = event.target.value;                 //Extract selected event ID
    selectedTicketIDs = new Set();                  //Clear previously-selected tickets
    updateTotalDisplay();                           //Reset total price to 0
    toggleBuyButton();                              //Disable buy button
    if(!eID){                                       //If user chooses "--Select Event" (placeholder option), clear the table
        renderTickets([]);
        return;
    }
    await loadAvailableTickets(eID);                //Load ticket list from backend
}

async function loadAvailableTickets(eID){           //Show loading screen
    try{
        showLoadingScreen();
        const response = await fetch(`${apiBase}/api/tickets?event_id=${eID}&status=Available`, { credentials: "include"});     //Call backend to retrieve available tickets for the current event
        if (response.status === 401){               //Redirection if unauthorized
            hideLoadingScreen();
            requireAuth();
            return;
        }
        const ticketData = await response.json();           //Convert JSON response to JS object
        currentTickets = ticketData.tickets || [];          //Save tickets globally
        renderTickets(currentTickets);                      //Construct table rows using returned tickets for the event
    } catch (error){                                    //Error handling and logging
        console.error("loadAvailableTickets", error);
        showMessage("Could not successfully load tickets.", "error");
    } finally {
        hideLoadingScreen();
    }
}

function renderTickets(tickets){
    const tBody = document.querySelector("#ticketsTable tbody");
    tBody.innerHTML="";
}