const apiBase = "http://localhost:3001";                //Store the URL of the backend server

async function login(email, password){                  //Send an HTTP request to the backend using Fetch API
    const response = await fetch(`${apiBase}/api/auth/login`, {     //Form the URL as http://localhost:3001/api/auth/login
        method: "POST",                                 //POST request type
        credentials: "include",                         //Include session cookies are included in the request
        headers: {"Content-Type": "application/json"},  //Request body will be sent as JSON
        body: JSON.stringify({email, password})         //Convert login information into JSON string to be read by backend
    });
    return response.json();                             //Convert JSON server response into a JS object
}

document.getElementById("loginForm")?.addEventListener("submit", async(e)=>{        //Add an event listener to the submit button in the login form
    e.preventDefault();                                 //Prevent a normal form submission from ocurring

    const email = document.getElementById("email").value;       //Read password and email inputs
    const password = document.getElementById("pwd").value;
    const login = await login(email, password);         //Login using the provided email and password

    
})