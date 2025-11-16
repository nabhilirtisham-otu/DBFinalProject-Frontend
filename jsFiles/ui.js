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
})