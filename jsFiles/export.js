/*
Logic to export files as CSVs and PDFs
*/

const apiBase = "http://localhost:3000";                    //Backend API base URL

//Download CSV file
function downloadCSV(){
    const APIUrl = `${apiBase}/api/export/events.csv`;              //Final API URL
    showLoadingScreen();
    fetch(APIUrl, {credentials: "include"}).then(async (res) => {               //GET request to API with session cookies
        if(!res.ok) throw new Error("Could not get CSV.");              //Error message if unsuccessful
        const blob = await res.blob();                      //Convert raw response into Blob, which allow CSV file downloads
        const link = document.createElement("a");              //Create <a> element (hyperlink) allowing file download
        link.href = URL.createObjectURL(blob);              //Convert Blob to in-browser URL
        link.download = "events.csv";                       //Set download file name
        document.body.appendChild(link);                    //Add <a> to webpage
        link.click();                                       //Trigger browser download
        link.remove();                                      //Remove <a> from webpage
    }).catch((error) => {                                   //Error handling and logging
        console.error("downloadCSV", error);
        showMessage("Could not download CSV", "error");
    }).finally(() => hideLoadingScreen());
}

//Download PDF file
function downloadPDF(){
    const APIUrl = `${apiBase}/api/export/events.pdf`;              //Final API URL
    showLoadingScreen();
    fetch(APIUrl, {credentials: "include"}).then(async (res) => {               //GET request to API with session cookies
        if(!res.ok) throw new Error("Could not get PDF.");              //Error message if unsuccessful
        const blob = await res.blob();                      //Convert raw response into Blob, which allow PDF file downloads
        const link = document.createElement("a");              //Create <a> element (hyperlink) allowing file download
        link.href = URL.createObjectURL(blob);              //Convert Blob to in-browser URL
        link.download = "events.pdf";                       //Set download file name
        document.body.appendChild(link);                    //Add <a> to webpage
        link.click();                                       //Trigger browser download
        link.remove();                                      //Remove <a> from webpage
    }).catch((error) => {                                   //Error handling and logging
        console.error("downloadPDF", error);
        showMessage("Could not download PDF", "error");
    }).finally(() => hideLoadingScreen());
}