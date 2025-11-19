//Helper function to return query parameter values
function getQueryParam(paraName){
    const queryParams = new URLSearchParams(window.location.search);        //Store and parse URL query string into key/value pairs
    return queryParams.get(paraName);                   //Retrieve value for specific query parameter
}

//Displays order data, tickets list, and payments list information
function renderOrder(order, tickets, payments){
     if (!order) {
        showMessage("Order details missing.", "error");
        return;
    }
    const orderInfo = document.getElementById("orderSummary");              //Find orderSummary box in HTML page and clean it
    orderInfo.innerHTML = "";

    const orderBox = document.createElement("div");                     //Container for order details
    orderBox.innerHTML =                                                //Display formatted order details (number, date, amoutn, and status)
        `<h3> Order #${order.order_id}</h3>
        <p><strong>Date: </strong>${new Date(order.order_date).toLocaleString()}</p>
        <p><strong>Amount: </strong>${formatCurrency(order.order_amount)}</p>
        <p><strong>Status: <strong>${order.order_status}</p>
    `;

    orderInfo.appendChild(orderBox);                                //Add order info to page

    const tHead = `<tr><th>Ticket ID</th><th>Event</th><th>Seat</th><th>Price</th><th>Status</th></tr>`;        //Table header display
    const tRows = tickets.map(tick => {                             //Seat label for each ticket (row and number) with fallbacks
        const seat = `${tick.row_num || ''}-${tick.seat_number || tick.seat_id || ''}`;
        return `<tr>
        <td>${tick.ticket_id}</td>
        <td>${tick.event_title || tick.event_id}</td>
        <td>${seat}</td>
        <td>${formatCurrency(tick.ticket_price)}</td>
        <td>${tick.ticket_status}</td>
        </tr>`;                                                     //Create and return HTML table row string for every ticket, combined into one HTML block
    }).join("");

    const ticketsTable = document.createElement("table");           //Create table
    ticketsTable.style.width = "100%";                              //Basic table styling
    ticketsTable.innerHTML = `<thead>${tHead}</thead><tbody>${tRows}</tbody>`;          //Insert header and rows into table
    orderInfo.appendChild(ticketsTable);                            //Add finished table to HTML page

    const paymentBox = document.createElement("div");               //Create section displaying payment method, amount, and status
        paymentBox.innerHTML =
        `<h4>Payment</h4>
        <p><strong>Method: </strong>${payments.payment_method}</p>
        <p><strong>Amount: </strong>${formatCurrency(payments.payment_amount)}</p>
        <p><strong>Status: </strong>${payments.payment_status}</p>
    `;

    orderInfo.appendChild(paymentBox);
}

//Loads order confirmation page
async function loadOrderConfirm(){

    const order_id = getQueryParam("id")                 //Fetch id query parameter
    if (!order_id){                                      //Error handling when no order ID provided
        showMessage("No order ID given", "error");
        return;
    }

    try{
        showLoadingScreen();
        const response = await fetch(`${apiBase}/api/orders/${order_id}`, {credentials: "include"});     //Send GET to backend (with cookies) for order information for user
        
        if (response.status === 401){               //Redirection for invalid session
            hideLoadingScreen();
            requireAuth();
            return;
        }

        const orderData = await response.json();        //Convert backend JSON to JS object
        if (!response.ok){                              //Error handling if information can't be retrieved
            showMessage("Could not fetch order information", "error");
            return;
        }
        if (!orderData.order) {
            console.error("Order data missing:", orderData);
            showMessage("Order not found.", "error");
            return;
        }

        renderOrder(orderData.order, orderData.tickets, orderData.payments[0]);            //Draw order, ticket, and payment information on UI
    } catch (error) {                                   //Error handling and logging
        console.error("loadOrderConfirm", error);
        showMessage("Server error while loading order", "error");
    } finally {
        hideLoadingScreen();
    }
}