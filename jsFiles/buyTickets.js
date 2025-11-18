let currentTickets = [];                                // Tickets returned by backend
let selectedTicketIDs = new Set();                      // User-selected ticket IDs (no duplicates)

function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

async function initBuyPage() {
    try {
        await loadEventDropdown();

        const selectEl = document.getElementById("eventSelect");
        selectEl.addEventListener("change", onEventChange);

        // If coming from events.html with ?event_id=...
        const preselectedID = getQueryParam("event_id");
        if (preselectedID) {
            selectEl.value = preselectedID;

            // Only proceed if that value actually exists in the dropdown
            if (selectEl.value === preselectedID) {
                await onEventChange({ target: selectEl });
            }
        }
    } catch (error) {
        console.error("initBuyPage", error);
        showMessage("Could not initialize buy page.", "error");
    }
}

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

    // Load BOTH event details and available tickets
    await Promise.all([
        loadEventDetails(eID),
        loadAvailableTickets(eID)
    ]);
}

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

function onTicketToggle(eventTicket) {
    const id = Number(eventTicket.target.value);

    if (eventTicket.target.checked)
        selectedTicketIDs.add(id);
    else
        selectedTicketIDs.delete(id);

    updateTotalDisplay();
    toggleBuyButton();
}

function updateTotalDisplay() {
    const total = Array.from(selectedTicketIDs).reduce((sum, id) => {
        const tick = currentTickets.find(t => t.ticket_id === id);
        return sum + (tick ? Number(tick.ticket_price) : 0);
    }, 0);

    const totalEl = document.getElementById("totalAmount");
    if (totalEl) totalEl.textContent = formatCurrency(total);
}

function toggleBuyButton() {
    const disabled = selectedTicketIDs.size === 0;

    const topBtn = document.getElementById("buyBtn");          // old/top button (if present)
    const bottomBtn = document.getElementById("buyBtnBottom"); // footer button

    if (topBtn) topBtn.disabled = disabled;
    if (bottomBtn) bottomBtn.disabled = disabled;
}


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
        window.location.href = `order-confirm.html?id=${result.oID}`;

    } catch (error) {
        console.error("buySelected", error);
        showMessage("Server error during purchase", "error");
    } finally {
        hideLoadingScreen();
    }
}
