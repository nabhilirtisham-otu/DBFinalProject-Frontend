/*
Loads, displays, and allows for deletion of user Orders
*/

let navConfigured = false;

//Set variables to redirect users to appropriate pages/dashboards based on their role
async function configureOrdersNav() {
    if (navConfigured) return;

    try {
        const response = await fetch(`${apiBase}/api/auth/session`, { credentials: "include" });
        if (!response.ok) return;

        const session = await response.json();
        const isOrganizer = session.user?.role === "Organizer";

        const eventsLink = document.getElementById("navEventsLink");
        const dashboardLink = document.getElementById("navDashboardLink");

        if (eventsLink) eventsLink.href = isOrganizer ? "orgevents.html" : "userevents.html";
        if (dashboardLink) dashboardLink.href = isOrganizer ? "orgDashboard.html" : "userDashboard.html";

        navConfigured = true;
    } catch (error) {
        console.error("configureOrdersNav", error);
    }
}

//Load and display user orders
async function loadOrders() {
    try{
        await configureOrdersNav();
        showLoadingScreen();

        const response = await fetch(`${apiBase}/api/orders`, { credentials: "include"});           //GET request for order information
        if (response.status === 401){                   //Error handling if response can't be fetched
            hideLoadingScreen();
            requireAuth();
            return;
        }

        if (!response.ok) {
            showMessage("Could not load orders.", "error");
            return;
        }

        const orderData = await response.json();            //Convert order data JSON to JS object
        const tBody = document.querySelector("#ordersTable tbody");         //Select order table body in orders HTML page
        tBody.innerHTML = "";                                //Clean body content

        const orders = orderData.orders || [];

        if (!orders.length) {
            tBody.innerHTML = `<tr><td colspan="6">No orders yet.</td></tr>`;
            return;
        }

        orders.forEach(ord => {              //For every order in orderData (or fallback empty array)
            const tRow = document.createElement("tr");          //Create new table row element
            tRow.innerHTML =                                    //Display order ID, date, amount, status, and a linnk to the confirmation page
                `<td>${ord.order_id}</td>
                <td>${new Date(ord.order_date).toLocaleString()}</td>
                <td>${formatCurrency(ord.order_amount)}</td>
                <td>${ord.order_status}</td>
                <td><a href="order-confirm.html?id=${ord.order_id}">View Details</a></td>
                <td>
                    <button class="danger-btn" onclick="deleteOrder(${ord.order_id})">Delete</button>
                </td>
            `;
            tBody.appendChild(tRow);                        //Add table row to page table
        });
    } catch (error) {                                       //Error handling and logging
        console.error("loadOrders", error);
        showMessage("Could not load orders.", "error");
    } finally {
        hideLoadingScreen();
    }
}

//Delete user Order
async function deleteOrder(orderId){
    if (!confirm("Are you sure you want to delete this order? Tickets will become available again.")) return;

    try {
        showLoadingScreen();
        const response = await fetch(`${apiBase}/api/orders/${orderId}`, {
            method: "DELETE",
            credentials: "include"
        });

        if (response.status === 401) {
            hideLoadingScreen();
            requireAuth();
            return;
        }

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            const message = result.error || result.message || "Could not delete order.";
            showMessage(message, "error");
            return;
        }

        showMessage("Order deleted successfully.", "success");
        await loadOrders();
        window.dispatchEvent(new CustomEvent("orders:updated"));
    } catch (error) {
        console.error("deleteOrder", error);
        showMessage("Server error while deleting order.", "error");
    } finally {
        hideLoadingScreen();
    }
}