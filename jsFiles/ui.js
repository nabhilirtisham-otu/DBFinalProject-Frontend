/*
Enables user interaction, controls visual behavior, holds UI helpers
*/

export function showMessage(msg, type="info"){                      //Function to display text
    const msgBox = document.getElementById("statusMessage");        //msgBox declaration

    if (!box){
        return console.warn("No #statusMessage element found.");    //Error handling
    }

    msgBox.textContent = msg;                                   //msgBox text is set to the message information provided
    msgBox.className = `message ${type}`;                       //msgBox class name is set to the provided type (used in CSS styling)

    setTimeout(() => {                                      //Timer running code after four seconds
        box.textContent = "";                               //Reset message box content
        box.className = "message";                          //Reset message box type style
    }, 4000);
}

export function showLoadingScreen(){                            //Loading screen display
    const loader = document.getElementById("loader") ;      //Retrieve loader element
    if (loader){
        loader.style.display = "block";                     //Set loader CSS display property as block
    }
}

export function hideLoadingScreen(){
    const loader = document.getElementById("loader") ;      //Retrieve loader element
    if (loader){
        loader.style.display = "none";                     //Hides loader element
    }
}

