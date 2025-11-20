# DBFinalProject-Frontend

TickIt is the front-end for our database final project. It is a static HTML, CSS, and vanilla JS site that calls the backend API at `http://127.0.0.1:3000` for authentication, ticket purchasing, weather logging, exports, and organizer workflows.

## Repository Layout
- `cssFiles/` - CSS styling
- `jsFiles/` - page logic (auth, dashboard, charts, exports, etc.)
- `images/` - marketing/dashboard images
- `libs/` - third-party browser libraries (Chart.js build used by the dashboard)
- `*.html` - individual guest/user/organizer pages
- `.vscode/` - editor settings (Live Server target, formatter preferences)

## Prerequisites
- Git for cloning repository
- Node.js 18+ and npm
- Backend running at `http://127.0.0.1:3000` (see DBFinalProject backend repo)
- Chart.js 4.x inside `libs/chart.min.js`

## Required Libraries and Assets
1. `libs/chart.min.js`
   ```powershell
   mkdir libs -Force
   Invoke-WebRequest https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js -OutFile libs/chart.min.js
   ```
2. `images/`

## Detailed Setup Instructions
1. **Clone Repository**
   ```powershell
   git clone https://github.com/<your-org>/DBFinalProject-Frontend.git
   cd DBFinalProject-Frontend
   ```
2. **Create Expected Folders (skip if cloned repo)**
   ```powershell
   mkdir cssFiles, jsFiles, images, libs
   ```
   Copy CSS, JS, image, and library files into directories.
3. **Install tooling to serve the static files**
   ```powershell
   npm install
   ```
4. **Configure API base URL**  
   Update `jsFiles/config.js` if backend doesn't run on `http://127.0.0.1:3000`:
   ```javascript
   // jsFiles/config.js
   const apiBase = "http://127.0.0.1:3000"; // change host or port to match your backend
   ```
5. **Start backend API** so all `/api/...` calls succeed.
7. **Serve front-end**
   ```powershell
   http-server . -p 8080
   ```
   Visit `http://127.0.0.1:8080/login.html` (or any of the other pages) in the browser. Because cookies are scoped to the host, keep both the front-end server and backend on the same host (`127.0.0.1` in this example).
8. **Log in and verify**
   Use credentials seeded by backend and test:
   - `userDashboard.html` - confirms Chart.js renders w/ real API data
   - `userevents.html` + `tickets.html` - verifies fetch requests and cookie handling.
   - `userexport.html` + `orgexport.html` - download CSV and PDF data through backend.