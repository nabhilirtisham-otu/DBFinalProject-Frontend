const apiBase = "http://localhost:3001";                //Backend API base URL

//Load and display user orders
async function loadOrders() {
    try{
        showLoadingScreen();

        const response = await fetch(`${apiBase}/api/orders`, { credentials: "include"});           //GET request for order information
        if (response.status === 401){                   //Error handling if response can't be fetched
            hideLoadingScreen();
            requireAuth();
            return;
        }

        const orderData = await response.json();            //Convert order data JSON to JS object
        const tBody = document.querySelector("#ordersTable tbody");         //Select order table body in orders HTML page
        tBody.innerHTML = ""                                //Clean body content

        (orderData.orders || []).forEach(ord => {              //For every order in orderData (or fallback empty array)
            const tRow = document.createElement("tr");          //Create new table row element
            tRow.innerHTML =                                    //Display order ID, date, amount, status, and a linnk to the confirmation page
                `<td>${ord.order_id}</td>
                <td>${new Date(ord.order_date).toLocaleString()}</td>
                <td>${formatCurrency(ord.order_amount)}</td>
                <td>${ord.order_status}</td>
                <td><a href="order-confirm.html?id=${ord.order_id}">View Details</a></td>
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