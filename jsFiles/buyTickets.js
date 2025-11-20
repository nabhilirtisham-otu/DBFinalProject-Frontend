/*
Functions to load pages/dropdown menus, render event details + tickets,
and buy tickets.
*/

let currentTickets = [];                                //Tickets returned by backend
let selectedTicketIDs = new Set();                      //User-selected ticket IDs (no duplicates)

//Retrieve query parameters from the URL
function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

//Load the initial ticket buying page
async function initBuyPage() {
    try {
        await loadEventDropdown();

        const selectEl = document.getElementById("eventSelect");
        selectEl.addEventListener("change", onEventChange);

        //If coming from events.html with ?event_id=...
        const preselectedID = getQueryParam("event_id");
        if (preselectedID) {
            selectEl.value = preselectedID;

            //Only proceed if that value actually exists in the dropdown
            if (selectEl.value === preselectedID) {
                await onEventChange({ target: selectEl });
            }
        }
    } catch (error) {
        console.error("initBuyPage", error);
        showMessage("Could not initialize buy page.", "error");
    }
}

//Load event dropdown men u
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

//Triggers functions when an event status changes (i.e. a ticket is bought for an event)
async function onEventChange(event) {
    const eID = event.target.value;

    selectedTicketIDs.clear();
    updateTotalDisplay();
    toggleBuyButton();

    if (!eID) {
        renderTickets([]);
        renderEventDetails(null, null);
        return;
    }

    //Load BOTH event details and available tickets
    await Promise.all([
        loadEventDetails(eID),
        loadAvailableTickets(eID)
    ]);
}

//Load event details in the event details card
async function loadEventDetails(eID) {
    try {
        const response = await fetch(`${apiBase}/api/events/${eID}`, {
            credentials: "include"
        });

        if (response.status === 401) {
            requireAuth();
            return;
        }

        const data = await response.json();
        renderEventDetails(data.event, data.ticketCounts);

    } catch (error) {
        console.error("loadEventDetails", error);
        showMessage("Could not load event details.", "error");
    }
}

//Visually displays event details in the event details card
function renderEventDetails(event, ticketCounts) {
    const box = document.getElementById("eventDetails");
    if (!box) return;

    if (!event) {
        box.innerHTML = "<p>Select an event to see details.</p>";
        return;
    }

    let ticketsSummary = "";
    if (Array.isArray(ticketCounts) && ticketCounts.length) {
        const parts = ticketCounts.map(
            tc => `${tc.ticket_status}: ${tc.tcount}`
        );
        ticketsSummary = `<p><strong>Tickets:</strong> ${parts.join(", ")}</p>`;
    }

    box.innerHTML = `
        <h3>${event.title}</h3>
        <p><strong>Venue:</strong> ${event.venue_name || ""} (${event.city || ""})</p>
        <p><strong>Start:</strong> ${
            event.start_time ? new Date(event.start_time).toLocaleString() : ""
        }</p>
        ${event.end_time ? `<p><strong>End:</strong> ${new Date(event.end_time).toLocaleString()}</p>` : ""}
        <p><strong>Status:</strong> ${event.event_status || ""}</p>
        <p><strong>Description:</strong> ${event.event_description || "No description provided."}</p>
        ${ticketsSummary}
    `;
}

//Fetch and load available tickets
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

//Visually display the available tickets
function renderTickets(tickets) {
    const tBody = document.querySelector("#ticketsTable tbody");
    tBody.innerHTML = "";

    tickets.forEach(tick => {
        const tRow = document.createElement("tr");

        //Checkbox column
        const checkboxTd = document.createElement("td");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = tick.ticket_id;
        checkbox.addEventListener("change", onTicketToggle);
        checkboxTd.appendChild(checkbox);

        //Other columns
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

//Tracks selected tickets
function onTicketToggle(eventTicket) {
    const id = Number(eventTicket.target.value);

    if (eventTicket.target.checked)
        selectedTicketIDs.add(id);
    else
        selectedTicketIDs.delete(id);

    updateTotalDisplay();
    toggleBuyButton();
}

//Update running total cost counter
function updateTotalDisplay() {
    const total = Array.from(selectedTicketIDs).reduce((sum, id) => {
        const tick = currentTickets.find(t => t.ticket_id === id);
        return sum + (tick ? Number(tick.ticket_price) : 0);
    }, 0);

    const totalEl = document.getElementById("totalAmount");
    if (totalEl) totalEl.textContent = formatCurrency(total);
}

//Toggles "buy" button (i.e. can't be pressed when tickets aren't selected)
function toggleBuyButton() {
    const disabled = selectedTicketIDs.size === 0;

    const topBtn = document.getElementById("buyBtn");
    const bottomBtn = document.getElementById("buyBtnBottom");

    if (topBtn) topBtn.disabled = disabled;
    if (bottomBtn) bottomBtn.disabled = disabled;
}

//Buys the selected tickets (POST request), redirects user to confirmatino page
async function buySelected() {
    if (selectedTicketIDs.size === 0) return;

    const selectedTickets = Array.from(selectedTicketIDs);
    console.log("selectedTickets:", selectedTickets);


    try {
        showLoadingScreen();

        const response = await fetch(`${apiBase}/api/orders`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            tickets: selectedTickets,
            payMethod: "Credit"})
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

        let createdOrderID = extractOrderID(result);

        if (!createdOrderID) {
            console.warn("Purchase succeeded but order id missing from response:", result);
            createdOrderID = await fetchLatestOrderID();
        }

        if (!createdOrderID) {
            showMessage("Order created, but confirmation details could not be opened automatically. Please review via Orders page.", "warning");
            return;
        }

        window.location.href = `order-confirm.html?id=${createdOrderID}`;

    } catch (error) {
        console.error("buySelected", error);
        showMessage("Server error during purchase", "error");
    } finally {
        hideLoadingScreen();
    }
}

//Extracts order ID
function extractOrderID(result) {
    if (!result || typeof result !== "object") return undefined;

    return (
        result.order_id ||
        result.orderId ||
        result.order?.order_id ||
        result.order?.id ||
        result.order?.order?.order_id ||
        result.order?.order?.id ||
        (Array.isArray(result.order) ? result.order[0]?.order_id : undefined) ||
        (Array.isArray(result.orders) ? result.orders[0]?.order_id : undefined)
    );
}

//Returns the latest order ID
async function fetchLatestOrderID() {
    try {
        const response = await fetch(`${apiBase}/api/orders`, { credentials: "include" });
        if (response.status === 401) {
            requireAuth();
            return undefined;
        }
        if (!response.ok) return undefined;

        const data = await response.json();
        const orders = Array.isArray(data.orders) ? data.orders.slice() : [];
        if (!orders.length) return undefined;

        orders.sort((a, b) => {
            const dateDiff = new Date(b.order_date).getTime() - new Date(a.order_date).getTime();
            if (!Number.isNaN(dateDiff) && dateDiff !== 0) return dateDiff;
            return (b.order_id || 0) - (a.order_id || 0);
        });

        return orders[0]?.order_id;
    } catch (error) {
        console.error("fetchLatestOrderID", error);
        return undefined;
    }
}