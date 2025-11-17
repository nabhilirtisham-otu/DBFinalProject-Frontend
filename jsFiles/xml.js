/*
Display XML information in table format
*/

async function loadXMLEvents(){
    try{
        showLoadingScreen();
        const response = await fetch(`${apiBase}/api/xml/events`, {credentials: "include"});            //GET request for event information, with session cookies
        if(!response.ok){                               //Error message if event information retrieval unsuccessful
            throw new Error("Could not fetch XML.");
        }
        const eventText = await response.text();              //Read response body as plain text
        const textParser = new DOMParser();                 //Turn XML into searchable DOM trees
        const xmlText = textParser.parseFromString(eventText, "application/xml");               //Convert XML string into XML document object
        const events = xmlText.getElementsByTagName("event");               //Return NodeList containing all <event>s
        const tBody = document.querySelector("#xmlTable tbody");                //Select <tbody> of xmlTable
        tBody.innerHTML = "";                               //Clean xml table row

        for (let i= 0; i< events.length; i++) {                     //Loop through each <event> XML node
            const ev = events[i];                           //Select current event node
            const id = ev.getElementsByTagName("id")[0]?.textContent || "";                 //Find child elements, access textContent (with fallbacks)
            const title = ev.getElementsByTagName("title")[0]?.textContent || "";
            const venue = ev.getElementsByTagName("venue")[0]?.textContent || "";
            const city = ev.getElementsByTagName("city")[0]?.textContent || "";
            const start = ev.getElementsByTagName("start")[0]?.textContent || "";
            const end = ev.getElementsByTagName("end")[0]?.textContent || "";
            const price = ev.getElementsByTagName("price")[0]?.textContent || "";

            const tRow = document.createElement("tr");                      //Create new table row
            tRow.innerHTML = `<td>${id}</td><td>${title}</td><td>${venue}</td><td>${city}</td><td>${start}</td><td>${end}</td><td>${price}</td>`;               //Fill table row with cells using event data from above
            tBody.appendChild(tRow);                            //Add row to HTML page
        }
    } catch (error) {                                           //Error handling and logging
        console.error("loadXMLEvents", error);
        showMessage("Could not load XML events", "error");
    } finally {
        hideLoadingScreen();
    }
}