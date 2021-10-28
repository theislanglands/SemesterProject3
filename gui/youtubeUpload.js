

    function ytSubmit(){
    
        var data = new FormData();

        var linkInput = document.getElementById("ytlink").value; //get Data from form
    

        //send data to apid
        //check if yt id, playlist
        
        //song: https://www.youtube.com/watch?v=3TokaT9MPLM
        //playlist: https://www.youtube.com/watch?v=5abamRO41fE&list=PLS7pGaPiTpwU4ZnP9tV99h7EH28vW7Uo9
            //https://www.youtube.com/watch?v=XEEasR7hVhA&list=PLS7pGaPiTpwU4ZnP9tV99h7EH28vW7Uo9&index=2
        //shared: https://youtu.be/JNSCDu9Em3I

        if(linkInput.includes(".be/")){ //if link is from "Share" btn
            linkInput = linkInput.match(/(?<=be\/)\w*/);
        }
        else if(linkInput.includes("watch?v=")){ //if link is from url (works if in playlist aswell)
            linkInput = linkInput.match(/(?<=v\=)\w*/);
        }

        data.append("link", linkInput); //input link in dataform
        
        //send data to api
        alert(data.get("link"));

       

        }
    