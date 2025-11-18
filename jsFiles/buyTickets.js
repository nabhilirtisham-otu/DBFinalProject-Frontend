let currentTickets = [];                                // Tickets returned by backend
let selectedTicketIDs = new Set();                      // User-selected ticket IDs (no duplicates)


// ---------------------------
// Initial Page Setup
// ---------------------------
async function initBuyPage() {
    try {
        await loadEventDropdown();  
        document.getElementById("eventSelect")
            .addEventListener("change", onEventChange);
    } catch (error) {
        console.error("initBuyPage", error);
        showMessage("Could not initialize buy page.", "error");
    }
}


// ---------------------------
// Load Events into Dropdown
// ---------------------------
async function loadEventDropdown() {
    try {
        showLoadingScreen();
        const response = await fetch(`${apiBase}/api/events?limit=200`, { credentials: "include" });

        if (response.status === 401) {
            hideLoadingScreen();
            requireAuth();
            return;
        }

        const data = await response.json();
        const select = document.getElementById("eventSelect");

        select.innerHTML = `<option value="">--- Select Event ---</option>`;
        
        (data.events || []).forEach(ev => {
            const option = document.createElement("option");
            option.value = ev.event_id;
            option.textContent =
                `${ev.title} - ${ev.city} - ${new Date(ev.start_time).toLocaleString()}`;
            select.appendChild(option);
        });

    } catch (error) {
        console.error("loadEventDropdown", error);
        showMessage("Could not successfully load events.", "error");
    } finally {
        hideLoadingScreen();
    }
}


// ---------------------------
// When user selects an event
// ---------------------------
async function onEventChange(event) {
    const eID = event.target.value;

    selectedTicketIDs.clear();
    updateTotalDisplay();
    toggleBuyButton();

    if (!eID) {
        renderTickets([]);
        return;
    }

    await loadAvailableTickets(eID);
}


// ---------------------------
// Load Tickets for Event
// ---------------------------
async function loadAvailableTickets(eID) {
    try {
        showLoadingScreen();

        const response = await fetch(
            `${apiBase}/api/tickets?eID=${eID}&status=Available`,
            { credentials: "include" }
        );

        if (response.status === 401) {
            hideLoadingScreen();
            requireAuth();
            return;
        }

        const ticketData = await response.json();
        currentTickets = ticketData.tickets || [];
        renderTickets(currentTickets);

    } catch (error) {
        console.error("loadAvailableTickets", error);
        showMessage("Could not successfully load tickets.", "error");
    } finally {
        hideLoadingScreen();
    }
}


// ---------------------------
// Render Table of Tickets
// ---------------------------
function renderTickets(tickets) {
    const tBody = document.querySelector("#ticketsTable tbody");
    tBody.innerHTML = "";

    tickets.forEach(tick => {
        const tRow = document.createElement("tr");

        // Checkbox column
        const checkboxTd = document.createElement("td");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = tick.ticket_id;
        checkbox.addEventListener("change", onTicketToggle);
        checkboxTd.appendChild(checkbox);

        // Other columns
        const seatTd = document.createElement("td");
        seatTd.textContent = `${tick.row_num || ''}-${tick.seat_number || tick.seat_id || ''}`;

        const secTd = document.createElement("td");
        secTd.textContent = tick.section_name || '';

        const priceTd = document.createElement("td");
        priceTd.textContent = formatCurrency(tick.ticket_price);

        const statusTd = document.createElement("td");
        statusTd.textContent = tick.ticket_status;

        tRow.appendChild(checkboxTd);
        tRow.appendChild(seatTd);
        tRow.appendChild(secTd);
        tRow.appendChild(priceTd);
        tRow.appendChild(statusTd);

        tBody.appendChild(tRow);
    });
}


// ---------------------------
// When a ticket checkbox is clicked
// ---------------------------
function onTicketToggle(eventTicket) {
    const id = Number(eventTicket.target.value);

    if (eventTicket.target.checked)
        selectedTicketIDs.add(id);
    else
        selectedTicketIDs.delete(id);

    updateTotalDisplay();
    toggleBuyButton();
}


// ---------------------------
// Update Total Price
// ---------------------------
function updateTotalDisplay() {
    const total = Array.from(selectedTicketIDs).reduce((sum, id) => {
        const tick = currentTickets.find(t => t.ticket_id === id);
        return sum + (tick ? Number(tick.ticket_price) : 0);
    }, 0);

    const totalEl = document.getElementById("totalAmount");
    if (totalEl) totalEl.textContent = formatCurrency(total);
}


// ---------------------------
// Enable / Disable Buy Buttons
// ---------------------------
function toggleBuyButton() {
    const disabled = selectedTicketIDs.size === 0;

    const topBtn = document.getElementById("buyBtn");          // old/top button
    const bottomBtn = document.getElementById("buyBtnBottom"); // footer button

    if (topBtn) topBtn.disabled = disabled;
    if (bottomBtn) bottomBtn.disabled = disabled;
}


// ---------------------------
// Complete Purchase
// ---------------------------
async function buySelected() {
    if (selectedTicketIDs.size === 0) return;

    const selectedTickets = Array.from(selectedTicketIDs);

    try {
        showLoadingScreen();

        const response = await fetch(`${apiBase}/api/orders`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tickets: selectedTickets, payMethod: "Credit" })
        });

        if (response.status === 401) {
            hideLoadingScreen();
            requireAuth();
            return;
        }

        const result = await response.json();

        if (!response.ok) {
            const message = result.error || result.message || "Purchase failed";
            showMessage(message, "error");
            return;
        }

        showMessage("Successful purchase!", "success");
        window.location.href = `order-confirm.html?id=${result.oID}`;

    } catch (error) {
        console.error("buySelected", error);
        showMessage("Server error during purchase", "error");
    } finally {
        hideLoadingScreen();
    }
}