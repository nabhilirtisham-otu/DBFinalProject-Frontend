/*
Display view information
*/

//Retrieves and displays view information
async function runView(){
    const view = document.getElementById("viewSelect").value;       //Read view selected by user

    const response = await fetch(`${apiBase}/api/views/${view}`, {     //Fetch view from backend with GET, along with sent cookies
        credentials: "include"
    });

    if (!response.ok) {
        alert("Error loading view: " + response.status);
        console.error("Fetch failed:", response.status);
        return;
    }

    const viewData = await response.json()                  //Convert JSON response to JS object

    if (!viewData.rows || viewData.rows.length === 0) {
        alert("No data returned for this view.");
        return;
    }

    const viewInfo = viewData.rows;                         //Extract rows from returned data

    if (viewInfo.length === 0) return;                      //If view is empty, exit function

    const tHead = document.querySelector("#viewTable thead");       //Store references to table head and body
    const tBody = document.querySelector("#viewTable tbody");

    tHead.innerHTML="";                         //Clean table head and body
    tBody.innerHTML="";

    const headers = Object.keys(viewInfo[0]);       //Get column names
    tHead.innerHTML = "<tr>" + headers.map(col => `<th>${col}</th>`).join("") + "</tr>";      //Create table row, loop over column names, create + merge HTML, insert into <thead>

    viewInfo.forEach(r => {                     //For every returned row
        const rowHTML = headers.map(col => `<td>${r[col]}</td>`).join("");      //Create <td>s containing every header's actual value
        tBody.innerHTML += `<tr>${rowHTML}</tr>`;           //Insert full row (containing all <td>s) into table
    });
}