async function loadOrderHistory(limit = 5) {
    const tBody = document.getElementById("orderHistoryBody");
    const emptyMessage = document.getElementById("orderHistoryEmpty");
    if (!tBody) return;

    tBody.innerHTML = "";
    if (emptyMessage) emptyMessage.textContent = "Loading recent orders...";

    try {
        const response = await fetch(`${apiBase}/api/orders`, { credentials: "include" });

        if (response.status === 401) {
            requireAuth();
            return;
        }

        if (!response.ok) {
            if (emptyMessage) emptyMessage.textContent = "Could not load order history.";
            return;
        }

        const data = await response.json();
        const orders = (data.orders || []).slice(0, limit);

        if (!orders.length) {
            if (emptyMessage) emptyMessage.textContent = "No orders yet. Purchases will appear here.";
            return;
        }

        if (emptyMessage) emptyMessage.textContent = "";
        orders.forEach(ord => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${ord.order_id}</td>
                <td>${formatDate(ord.order_date)}</td>
                <td>${formatCurrencyLocal(ord.order_amount)}</td>
                <td>${ord.order_status}</td>
            `;
            tBody.appendChild(row);
        });
    } catch (error) {
        console.error("loadOrderHistory", error);
        if (emptyMessage) emptyMessage.textContent = "Server error while loading orders.";
    }
}

function formatCurrencyLocal(value) {
    const num = Number(value) || 0;
    return num.toLocaleString(undefined, { style: "currency", currency: "CAD" });
}

function formatDate(dateValue) {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString();
}

window.addEventListener("orders:updated", () => loadOrderHistory());
