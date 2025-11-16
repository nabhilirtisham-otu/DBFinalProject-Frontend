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

export function liveFieldValidation(inputID, validationFunc){
    const field = document.getElementById(inputID);              //Retrieve input field element
    if (!inID) return;                                          //Error handling

    field.addEventListener("input", () => {                     //Triggers every time user types in input
        if (validationFunc(field.value)) {                      //Check field value according to the validation function
            field.classList.remove("error");                    //If successful, remove error CSS class and add valid CSS class
            field.classList.add("valid");
        } else {
            field.classList.add("error");                       //Opposite of above
            field.classList.remove("valid");
        }
    });
}

export function autoSuggest(inputID, inValues = []){        //Enable autocomplete suggestions
    const input = document.getElementById(inputID);

    if (!input) return;                             //Error handling
    const datalistID = `${inputID}_list`;           //Create ID to attach <datalist> to provided field
    let list = document.getElementById(datalistID)      //Check if datalist element exists
    
    if (!list){                                     //If not
        list = document.createElement("datalist");      //Create new <datalist>
        list.id = datalistID;                           //Attach generated ID to it
        document.body.appendChild(list);                //Add to DOM
        input.setAttribute("list", datalistID);         //Link input field to datalist for suggestions
    }
    list.innerHTML="";                                  //Clear old suggestions

    inValues.forEach(v => {                                 //Loop through suggestion values
        const option = document.createElement("option");        //Create new <option>
        option.value = v;                                   //Set option value as the value being iterated over
        list.appendChild(option);                           //Add option to datalist
    });
}

export function disableButton(bID){                         //Disable button
    const btn = document.getElementById(bID);               //Find button using ID, assign to btn
    if (btn){                                               //Disable button
        btn.disabled = true;
    }
}

export function enableButton(bID){                         //Enable button
    const btn = document.getElementById(bID);               //Find button using ID, assign to btn
    if (btn){                                               //Enable button
        btn.disabled = false;
    }
}