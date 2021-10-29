
    window.onload = () => {
        
        var maxArtSize = 2; //in MB
        var maxAudioSize = 128; //in GB
        addSizeListener("art", scaleBytes(maxArtSize, 2));
        addSizeListener("audio", scaleBytes(maxAudioSize, 3));
        
    }

    function scaleBytes(x, scale){
        for(var i = 0; i < scale; i++){
            x = x*1024; // scale a clean integer MB to its value in bytes 
        }
        return x;
    }

    function addSizeListener(id, size){
        element = document.getElementById(id); //get element
        element.onchange = function() { //set onchange on the element
            if(this.files[0].size > size){ //get size of file, and check if its greater than maximum size
            alert("File is too big for " + id + "!"); //alert user
            this.value = ""; //reset value fo element
            };
        };
    }

    function cuSubmit(){

        const httpRequest = new XMLHttpRequest()
        const apiEndpoint = "ADDRESS";
        var artFile;
        var audioFile;
        var metaDataJson = {};

        var all = document.querySelectorAll("#customAudioForm input");
            
            for (let field of all) {
                if(field.type == "file"){

                    var file = document.getElementById(field.getAttribute("id")).files[0];
                    if(file != null){
                        if(field.name == "art"){
                            artFile = file;
                        } else{
                            audioFile = file;
                            
                        }
                    }

                }
                
                metaDataJson[field.name] = field.value;
                
                }
                
        //send data to api
        
        httpRequest.open('POST', apiEndpoint, true); //open request to api

        //Send the proper header information along with the request
        httpRequest.setRequestHeader('Content-type', 'application/json;charset=UTF-8');

        httpRequest.onreadystatechange = function() { //Call a function when the state changes.
            if(httpRequest.readyState == 4 && httpRequest.status == 200) {
                alert(httpRequest.responseText);
            }
        }
        //add 2 files (art and audio)
        httpRequest.send(metaDataJson);
    



        }
