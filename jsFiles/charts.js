/*
Chart visualization, with events grouped by status
*/

async function loadChart(){                     //Visualize chart
    const response = await fetch(`${apiBase}/api/events?limit=200`, {credentials:"include"});      //Send GET request to /api/events, along with session cookies
    const result = await response.json();           //Convert JSON server response to JS object

    const eventCounts = {};                             //Store event count (by status)
    result.events.forEach(e => {                    //Iterate over each event in the returned events
        eventCounts[e.event_status] = (eventCounts[e.event_status] || 0) + 1;       //Counts events belonging to each status - initial 0 or add 1
    });

    new Chart(document.getElementById("eventChart"), {      //Create new Chart.js chart
        type: "bar",                                        //Bar chart type
        data: {
            labels: Object.keys(eventCounts),               //Labels are event status names
            datasets: [{                                    //Describe one dataset
                label: "Events by Status",                  //Chart legend descriptive text
                data: Object.values(eventCounts)            //Assigns eventCounts counts as dataset values
            }]
        }
    });
}