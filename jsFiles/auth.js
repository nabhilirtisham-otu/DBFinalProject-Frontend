/*
Performs login, logout, and session check functionality.
*/

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
    const login = await login(email, password);         //Login by calling the login function and using the provided email and password

    if(result.message?.includes("Success")){
        window.location.href = "./dashboard.html";      //If login is a success, proceed to the dashboard page
    } else{
        document.getElementById("loginMsg").txtContent = "Invalid credentials. Please try again.";      //Otherwise, display an error message.
    }
});

async function logout(){                                //Logout function
    await fetch(`${apiBase}/api/auth/logout`,{          //Send the backend a logout request
        method: "POST",                                 //Post to change session state
        credentials: "include"                          //Send server session cookies
    });
    window.location.href = "login.html";                //Return to the login page after logout
}

async function requireAuth(){                           //Used on protected pages to authenticate user
    const response = await fetch(`${apiBase}/api/auth/session`, {       //Check if the current user session is valid
        credentials: "include"                          //Send server cookies to check user
    });

    if (response.status !== 200){                       //Check if the response is a success
        window.location.href = "index.html";            //If not, the user is sent back to login
    }
}