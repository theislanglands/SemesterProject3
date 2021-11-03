

    function ytSubmit(){

        const httpRequest = new XMLHttpRequest()
        const apiEndpoint = "ADDRESS";
        var metaDataJson;
    
        var data = new FormData();

        var linkInput = document.getElementById("ytlink").value; //get Data from form

        if(linkInput.includes(".be/")){ //if link is from "Share" btn
            linkInput = linkInput.match(/(?<=be\/)\w*/);
        }
        else if(linkInput.includes("watch?v=")){ //if link is from url (works if in playlist aswell)
            linkInput = linkInput.match(/(?<=v\=)\w*/);
        }

        //id to json
        metaDataJson = JSON.stringify({ "id": linkInput}); //create json object
        
        //send data to api

        httpRequest.open('POST', apiEndpoint, true);

        //Send the proper header information along with the request
        httpRequest.setRequestHeader('Content-type', 'application/json;charset=UTF-8');

        httpRequest.onreadystatechange = function() { //Call a function when the state changes.
            if(httpRequest.readyState == 4 && httpRequest.status == 200) {
                alert(httpRequest.responseText);
            }
        }
        httpRequest.send(metaDataJson);


        }
    