const urlParams = new URLSearchParams(window.location.search);                      //Read query parameters from URL
const eID = urlParams.get("event_id");                      //Extract event ID from URL object
let eventLoaded = false;

async function initTicketsPage(){
    if (!eID){
        showMessage("Missing event information.", "error");
        return;
    }

    await Promise.all([
        loadEventDetails(),
        loadTickets()
    ]);
}

//Ticket retrieval and display
async function loadTickets(){
    try {
        const response = await fetch (`${apiBase}/api/tickets?event_id=${eID}`, {       //GET request (along with session cookies) for specified event information
            credentials: "include"
        });

        if (response.status === 401) {
            requireAuth();
            return;
        }

        if (!response.ok) {
            showMessage("Could not load tickets.", "error");
            return;
        }

        const ticketData = await response.json();                //Store server response in a JS object
        const tickets = Array.isArray(ticketData) ? ticketData : (ticketData.tickets || []);

        const tBody = document.getElementById("ticketList");        //<tbody> element inside tickets table
        if (!tBody) return;
        tBody.innerHTML = "";                                   //Clean table

        if (!tickets.length) {
            tBody.innerHTML = `<tr><td colspan="6">No tickets found for this event.</td></tr>`;
            return;
        }

        tickets.forEach(t => {                                //Loop through all tickets in the returned ticket data, populating table rows with information
            const seatLabel = `${t.row_num ?? ""}-${t.seat_number ?? ""}`.replace(/^-/, "").replace(/-$/, "");
            tBody.innerHTML += `
                <tr>
                    <td>${t.ticket_id}</td>
                    <td>${seatLabel}</td>
                    <td>${formatCurrency(t.ticket_price)}</td>
                    <td>${t.ticket_status}</td>
                    <td>
                        <button onclick="updateTicket(${t.ticket_id})">Edit</button>
                    </td>
                    <td>
                        <button onclick="deleteTicket(${t.ticket_id})">Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("loadTickets", error);
        showMessage("Server error while loading tickets.", "error");
    }
}

async function loadEventDetails(){
    if (eventLoaded) return;
    try {
        const response = await fetch(`${apiBase}/api/events/${eID}`, { credentials: "include" });

        if (response.status === 401) {
            requireAuth();
            return;
        }

        if (!response.ok) {
            showMessage("Could not load event details.", "error");
            return;
        }

        const data = await response.json();
        const eventInfo = data.event;

        const titleEl = document.getElementById("eventTitle");
        const metaEl = document.getElementById("eventMeta");

        if (eventInfo && titleEl && metaEl) {
            titleEl.textContent = eventInfo.title || "Selected Event";
            const cityPart = eventInfo.city ? `, ${eventInfo.city}` : "";
            const startPart = eventInfo.start_time ? new Date(eventInfo.start_time).toLocaleString() : "";
            metaEl.textContent = `${eventInfo.venue_name || "Unknown venue"}${cityPart} - ${startPart}`;
        }

        eventLoaded = true;
    } catch (error) {
        console.error("loadEventDetails", error);
        showMessage("Server error while loading event info.", "error");
    }
}

//Ticket creation button
document.getElementById("ticketForm").addEventListener("submit", async (e) =>{      //Add event listener to submit button
    e.preventDefault();                                     //Prevent default behavior (page refresh)

    const seatID = Number(document.getElementById("seat_id").value);
    const seatPrice = Number(document.getElementById("seat_price").value);

    if (!seatID || Number.isNaN(seatPrice)) {
        showMessage("Please enter valid seat and price values.", "error");
        return;
    }

    const reqBody = {                                       //POST body sent to backend (event and seat id, ticket price)
        event_id: Number(eID),
        seat_id: seatID,
        ticket_price: seatPrice
    };

    try {
        const response = await fetch (`${apiBase}/api/tickets`,{                 //POST request sent to backend including session cookies and JSON body
            method: "POST",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify(reqBody)
        });

        if (response.status === 401) {
            requireAuth();
            return;
        }

        const result = await response.json().catch(async () => {
            const text = await response.text().catch(() => "");
            return text ? { message: text } : {};
        });

        if (!response.ok) {
            const message = result.error || result.message || "Could not add ticket.";
            showMessage(message, "error");
            return;
        }

        showMessage("Ticket added successfully.", "success");
        document.getElementById("ticketForm").reset();
        loadTickets();                                          //Reload tickets list
    } catch (error) {
        console.error("createTicket", error);
        showMessage("Server error while creating ticket.", "error");
    }
});

//Update ticket information
async function updateTicket(tID){
    const newTicketPriceInput = prompt("Enter new ticket price:");        //Enter new ticket price
    if (newTicketPriceInput === null) return;
    const newTicketPrice = Number(newTicketPriceInput);
    if (Number.isNaN(newTicketPrice) || newTicketPrice <= 0) {
        showMessage("Invalid price entered.", "error");
        return;
    }

    const newTicketStatus = prompt("Enter new ticket status (available/reserved/sold):");    //Enter new ticket status
    if (newTicketStatus === null) return;
    const cleanedStatus = newTicketStatus.trim();
    if (!cleanedStatus) {
        showMessage("Ticket status cannot be empty.", "error");
        return;
    }

    try {
        const response = await fetch(`${apiBase}/api/tickets/${tID}`, {          //PUT request to backend sending new ticket price and status
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify({
                ticket_price: newTicketPrice,
                ticket_status: cleanedStatus
            })
        });

        const result = await response.json().catch(async () => {
            const text = await response.text().catch(() => "");
            return text ? { message: text } : {};
        });

        if (!response.ok) {
            const message = result.error || result.message || "Could not update ticket.";
            showMessage(message, "error");
            return;
        }

        showMessage("Ticket updated successfully.", "success");
        loadTickets();                                          //Refresh ticket list with updated information
    } catch (error) {
        console.error("updateTicket", error);
        showMessage("Server error while updating ticket.", "error");
    }
}

//Delete ticket
async function deleteTicket(tID){
    if (!confirm("Are you sure you want to delete this ticket?")) return;       //Confirmation message

    await fetch (`${apiBase}/api/tickets/${tID}`, {         //DELETE request to backend along with session cookies
        method: "DELETE",
        credentials: "include"
    });

    loadTickets();                                          //Refresh ticket list with updated information
}
