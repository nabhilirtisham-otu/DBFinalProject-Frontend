/*
Performs login, logout, and session check functionality.
*/

async function login(email, password){                  //Send an HTTP request to the backend using Fetch API
    const response = await fetch(`${apiBase}/api/auth/login`, {     //Form the URL as http://localhost:3001/api/auth/login
        method: "POST",                                 //POST request type
        credentials: "include",                         //Include session cookies are included in the request
        headers: {"Content-Type": "application/json"},  //Request body will be sent as JSON
        body: JSON.stringify({email, password})         //Convert login information into JSON string to be read by backend
    });
    if (!response.ok) return { error: "Network error" };        //Error handling
    return response.json();                             //Convert JSON server response into a JS object
}

document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userName = document.getElementById("userName").value;
    const email = document.getElementById("email").value;
    const pwd = document.getElementById("pwd").value;
    const userRole = document.querySelector("input[name='role']:checked")?.value;

    const response = await fetch(`${apiBase}/api/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, email, pwd, userRole })
    });

    const msgBox = document.getElementById("registerMsg");

    if (!response.ok) {
        const data = await response.json();
        msgBox.textContent = data.message || "Registration failed.";
        msgBox.style.color = "red";
        return;
    }

    msgBox.textContent = "Registration successful! Redirecting to login…";
    msgBox.style.color = "green";
    setTimeout(() => window.location.href = "login.html", 1500);
});


document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("pwd").value;
    const doLogin = await login(email, password);

    const msgBox = document.getElementById("loginMsg");

    if (!doLogin || !doLogin.user) {
        msgBox.textContent = "Invalid credentials. Please try again.";
        return;
    }

    // role-based redirect
    if (doLogin.user.role === "Organizer") {
        window.location.href = "./orgDashboard.html";
    } else {
        window.location.href = "./userDashboard.html";
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
        window.location.href = "login.html";            //If not, the user is sent back to login
    }
}