const apiBase = "http://localhost:3001";                    //Backend API base URL

const urlParams = new URLSearchParams;                      //Read query parameters from URL
const eID = urlParams.get("event_id");                      //Extract event ID from URL object

//Ticket retrieval and display
async function loadTickets(){
    const response = await fetch (`${apiBase}/api/tickets?event_id=${eID}`, {       //GET request (along with session cookies) for specified event information
        credentials: "include"
    });
    const ticketData = await response.json();                //Store server response in a JS object

    const tBody = document.getElementById("ticketList");        //<tbody> element inside tickets table
    tBody.innerHTML = "";                                   //Clean table

    ticketData.forEach(t => {                                //Loop through all tickets in the returned ticket data, populating table rows with information
        tBody.innerHTML += `
            <tr>
                <td>${t.ticket_id}</td>
                <td>${t.row_num}-${t.seat_number}</td>
                <td>${t.ticket_price}</td>
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
}

//Ticket creation button
document.getElementById("ticketForm").addEventListener("submit", async (e) =>{      //Add event listener to submit button
    e.preventDefault();                                     //Prevent default behavior (page refresh)

    const reqBody = {                                       //POST body sent to backend (event and seat id, ticket price)
        event_id: eID,
        seat_id: document.getElementById("seat_id").value,
        ticket_price: document.getElementById("ticket_price").value
    };

    await fetch (`${apiBase}/api/tickets`,{                 //POST request sent to backend including sessionc cookies and JSON body
        method: "POST",
        headers: {"Content-Type": "application/json"},
        credentials: "include",
        body: JSON.stringify(body)
    });

    loadTickets();                                          //Reload tickets list
});

//Update ticket information
async function updateTicket(tID){
    const newTicketPrice = prompt("Enter new ticket price:")        //Enter new ticket price
    const newTicketStatus = prompt("Enter new ticket status (available/reserved/sold):")    //Enter new ticket status

    await fetch(`${apiBase}/api/tickets/${tID}`, {          //PUT request to backend sending new ticket price and status
        method: "PUT",
        headers: {"Content-Type": "appplication/json"},
        credentials: "include",
        body: JSON.stringify({
            ticket_price: newTicketPrice,
            ticket_status: newTicketStatus
        })
    });

    loadTickets();                                          //Refresh ticket list with updated information
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