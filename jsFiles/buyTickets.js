const { Button } = require("bootstrap");

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

//Runs when user selects an event
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

//Display available tickets
async function loadAvailableTickets(eID){
    try{
        showLoadingScreen();                        //Show loading screen
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

//Display tickets in the ticket table
function renderTickets(tickets){
    const tBody = document.querySelector("#ticketsTable tbody");        //Select body of tickets table
    tBody.innerHTML="";                                                 //Clear old rows
    tickets.forEach(tick => {                                   //For every ticket
        const tRow = document.createElement("tr");              //Create a table row
        const checkboxTd = document.createElement("td");        //Create table data cell
        const checkbox = document.createElement("input");       //Create checkbox to let use select ticket
        checkbox.type = "checkbox"
        checkbox.value = tick.ticket_id;                        //Store ticket ID in checkbox value
        checkbox.addEventListener("change", onTicketToggle);    //Run onTicketToggle when ticket checkbox clicked
        checkboxTd.appendChild(checkbox);                       //Add child to checkbox data cell

        const seatTd = document.createElement("td");            //Create data cell for seat
        seatTd.textContent = `${tick.row_num || ''}-${tick.seat_number || tick.seat_id || ''}`;     //Display seat location or fallbacks

        const secTd = document.createElement("td");             //Create data cell for section and display section name
        secTd.textContent = tick.section_name || '';

        const priceTd = document.createElement("td");           //Create data cell for price and display price value (using formatter function)
        priceTd.textContent = formatCurrency(tick.ticket_price);

        const statusTd = document.createElement("td");          //Create data cell for ticket status and display status
        statusTd.textContent = tick.ticket_status;

        tRow.appendChild(checkboxTd);                           //Append all the data cells above to the table row
        tRow.appendChild(seatTd);
        tRow.appendChild(secTd);
        tRow.appendChild(priceTd);
        tRow.appendChild(statusTd);

        tBody.appendChild(tRow);                                //Append the final table row to the table body
    });
}

//Runs when a user selects a ticket
function onTicketToggle(eventTicket) {
    const etID = Number(eventTicket.target.value);          //Get ticket ID for corresponding event ticket
    if (eventTicket.target.checked) {                       //Add/remove ticket from selected tickets set
        selectedTicketIDs.add(etID);
    } else {
        selectedTicketIDs.delete(etID);
    }

    updateTotalDisplay();                                   //Recalculate total cost and enable/disable buy button
    toggleBuyButton();
}

//Updates running total cost display
function updateTotalDisplay(){
    const totalPrice = Array.from(selectedTicketIDs).reduce((sum, id) => {         //Convert selectedTicketIds to array
        const tick = currentTickets.find(x => x.ticked_id === id);                  //For every id, find associated ticket object
        return sum + (tick ? Number(tick.ticket_price) : 0);                        //Accumulate total ticket price
    }, 0);
    document.getElementById("totalAmount").textContent = formatCurrency(totalPrice);        //Update text in UI
}

//Disables/enables buy button
function toggleBuyButton(){                                 
    const buyBtn = document.getElementById("buyBtn");                   //Retrieve buy button element
    buyBtn.disabled = selectedTicketIDs.size === 0;                     //Disable/enable based on number of elements in selectedTicketIDs
}

async function buySelected() {
    if (selectedTicketIDs === 0) return;                    //User can't buy anything if no tickets are selected
    const selectedTickets = Array.from(selectedTicketIDs);          //Convert selected tickets set to array
    try {
        showLoadingScreen();
        const response = await fetch(`${apiBase}/api/orders`, {         //POST to send order information along with cookies
            method: "POST",
            credentials: "include",
            headers: {"Content-Type": "application/json"},              //Send selected tickets and payment method
            body: JSON.stringify({selectedTickets, payment_method: "Credit"})
        });

        if (response.status === 401){                       //Handle response error
            hideLoadingScreen();
            requireAuth();
            return;
        }

        const result = await response.json();
        if (!response.ok){                                  //Erorr message display if backend returns errors
            const message = result.error || result.message || "Purchase failed";
            showMessage(message, "error");
            return;
        }

        showMessage("Successful purchase!", "success");         //Redirect when purchase is success
        window.location.href = `order-confirm.html?id=${result.orderId}`;
    } catch (error) {                                       //Error handling and logging
        console.error("buySelected", error);
        showMessage("Server error during purchase", "error");
    } finally {
        hideLoadingScreen();
    }
}