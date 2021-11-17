window.addEventListener("load", e => {
    document.getElementById('addyoutubebtn').addEventListener('click', e => {
        ytSubmit();
    });

    function ytSubmit() {
        console.log("ytSubmit()");

        const httpRequest = new XMLHttpRequest();
        var apiEndpoint = 'http://127.0.0.1:8000/data/add_track/';
        var metaDataJson;

        var data = new FormData();

        var linkInput = document.getElementById("ytlink").value; //get Data from form

        // get youtube id from url via regex
        if (linkInput.includes(".be/")) { //if link is from "Share" btn
            linkInput = linkInput.match(/(?<=be\/)\w*/);
        } else if (linkInput.includes("watch?v=")) { //if link is from url (works if in playlist aswell)
            linkInput = linkInput.match(/(?<=v\=)\w*/);
        }

        //id to json
        //metaDataJson = JSON.stringify({"id": linkInput}); //create json object

        //send data to api
        var urllink = apiEndpoint + linkInput;
        

        $.ajax({
            method: "get",
            url: urllink,
            dataType: 'text',

            beforeSend: function(){
                document.getElementById('loader').style.display = "block";
            },
            
            success: function (result) {
                alert(result);
            },

            complete: function(){
                document.getElementById("loader").style.display = "none";
                
            }
            

        
/*
            success: function (result) {
                $('body').append(result)
            },

            error: function () {
                alert("error something went wrong");
            }   */
        });
    }
});

