/*
Global UI helper functions
*/

(function () {                  //Keep internal variables private and global namespace clean
    const defaultTimeout = 4000;            //Default message timout of 4 seconds
    window.showMessage = function (message, type="info", timeout=defaultTimeout) {          //Global function to show message
        let messageBox = document.getElementById("statusMessage");          //Find statusMessage <div> box to display message
        if (!messageBox) {                                      //Create a message box if not found
            messageBox = document.createElement("div");
            messageBox.id = "statusMessage";
            messageBox.className = "message";
            messageBox.style.position = "fixed";                //Box positioning settings
            messageBox.style.top = "10px";
            messageBox.style.right = "10px";
            messageBox.style.zIndex = 9999;
            document.body.appendChild(messageBox);              //Add message box to page
        }

        messageBox.textContent = message;               //Set message box content and type using passed-in parameters
        messageBox.className = `message ${type}`;
        clearTimeout(messageBox._timeoutId);            //Cancel existing hide-timers

        messageBox._timeoutId = setTimeout(() => {      //Time to hide message, then clean text and reset message box class
            messageBox.textContent = "";
            messageBox.className = "message";
        }, timeout);
    };

    window.showLoadingScreen = function () {
        let loader = document.getElementById("globalLoader");       //Search for loading overlay (pre-existing)
        if (!loader){                                               //Create loader if not existing, definie its content, append to document, make it visible
            loader = document.createElement("div");
            loader.id = "globalLoader";
            loader.innerHTML = `<div style="position:fixed;left:0;top:0;width:100%height:100%;display:flex;align-items:center;justify-content:center;background:rgba(255, 255, 255, 0.6);z-index:9998"
                <div style="padding:20px;border-radius:8px;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.2)">Loading...</div>
                </div>`;
            document.body.appendChild(loader);
        }
        loader.style.display = "block";
    };

    
})