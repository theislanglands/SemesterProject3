

    function cuSubmit(){
        
        var data = new FormData();
        var artFile;
        var audioFile;

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
                data.append(field.name, field.value);
                //console.log(field.type); 
                }
        
       
        
    

        }
    