/*
Load venues and add events
*/

//Load venues from backend and fill dropdown menu
async function loadVenues() {
    try {
        showLoadingScreen();
        const res = await fetch(`${apiBase}/api/events/venues/all`, {
            credentials: "include"
        });

        if (res.status === 401) {
            requireAuth();
            return;
        }

        if (!res.ok) {
            console.error("Could not load venues, status:", res.status);
            showMessage("Could not load venues.", "error");
            return;
        }

        const data = await res.json();
        const select = document.getElementById("eventVenue");

        // Clear old options
        select.innerHTML = "";

        (data.venues || []).forEach(v => {
            const option = document.createElement("option");
            option.value = v.venue_id;
            option.textContent = v.venue_name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("loadVenues", error);
        showMessage("Server error while loading venues.", "error");
    } finally {
        hideLoadingScreen();
    }
}


//Send event data to backend to create new event
document.getElementById("eventForm").addEventListener("submit", async (e) => {      //Add submit event listener to eventForm form
    e.preventDefault();                                         //Prevent default form submission

    const venue_id = Number(document.getElementById("eventVenue").value);
    const title = document.getElementById("title").value.trim();
    const event_description = document.getElementById("event_description").value.trim();
    const start_time = document.getElementById("start_time").value;
    const end_time = document.getElementById("end_time").value;
    const standard_price = Number(document.getElementById("standard_price").value);
    const event_status = document.getElementById("event_status").value;

    if (!venue_id || !title || !event_description || !start_time || !end_time || Number.isNaN(standard_price)) {
        showMessage("Please fill all fields before submitting.", "error");
        return;
    }

    if (standard_price < 0) {
        showMessage("Standard price cannot be negative.", "error");
        return;
    }

    const normalizeDateTime = (value) => {
        if (!value) return null;
        if (value.length === 16) return `${value}:00`; // add seconds when missing
        return value;
    };

    const reqBody = {                                           //Request body: event venue ID, title, description, start/end times, price, and status
        venue_id,
        title,
        event_description,
        start_time: normalizeDateTime(start_time),
        end_time: normalizeDateTime(end_time),
        standard_price,
        event_status
    };

    try {
        showLoadingScreen();
        const result = await createEventWithFallback(reqBody);
        if (result === "AUTH_REQUIRED") return;
        if (!result?.success) return;

        showMessage("Event created successfully.", "success");
        window.location.href="orgDashboard.html";                   //Redirect to dashboard and reload page
    } catch (error) {
        console.error("create event", error);
        showMessage("Server error while creating event.", "error");
    } finally {
        hideLoadingScreen();
    }
});

async function createEventWithFallback(reqBody){
    const attemptEndpoints = [
        { url: `${apiBase}/api/organizer/events`, allowFallbackStatuses: [404, 405, 500, 501, 502, 503, 504] },
        { url: `${apiBase}/api/events`, allowFallbackStatuses: [] }
    ];

    for (let i = 0; i < attemptEndpoints.length; i++) {
        const { url, allowFallbackStatuses } = attemptEndpoints[i];

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(reqBody)
            });

            const payload = await readJsonOrText(response);

            if (response.status === 401) {
                requireAuth();
                return "AUTH_REQUIRED";
            }

            if (response.ok) return { success: true, payload };

            const message = payload.error || payload.message || `Failed to create event (status ${response.status}).`;
            console.error(`create event error via ${url}`, message, payload);

            if (allowFallbackStatuses.includes(response.status) && i < attemptEndpoints.length - 1) {
                continue;       // try next endpoint
            }

            showMessage(message, "error");
            return { success: false };
        } catch (error) {
            console.error(`create event request failed via ${url}`, error);
            if (i === attemptEndpoints.length - 1) {
                showMessage("Network error while creating event.", "error");
                return { success: false };
            }
        }
    }

    showMessage("Unable to create event.", "error");
    return { success: false };
}

async function readJsonOrText(response) {
    try {
        return await response.json();
    } catch (_) {
        const text = await response.text().catch(() => "");
        return text ? { message: text } : {};
    }
}
