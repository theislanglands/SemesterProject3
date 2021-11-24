//const httpRequest = new XMLHttpRequest()
var apiEndpoint = 'http://127.0.0.1:8000/add_custom';

window.onload = () => {
    var maxArtSize = 2; //in MB
    var maxAudioSize = 128; //in GB
    addSizeListener("art", scaleBytes(maxArtSize, 2));
    addSizeListener("audio", scaleBytes(maxAudioSize, 3));
}

window.addEventListener("load", e => {
    document.getElementById('is_collection').addEventListener('click', e => {
        showCollectionFields();
    });
});

function scaleBytes(x, scale) {
    for (var i = 0; i < scale; i++) {
        x = x * 1024; // scale a clean integer MB to its value in bytes
    }
    return x;
}

function addSizeListener(id, size) {
    element = document.getElementById(id); //get element
    element.onchange = function () { //set onchange on the element
        if (this.files[0].size > size) { //get size of file, and check if its greater than maximum size
            alert("File is too big for " + id + "!"); //alert user
            this.value = ""; //reset value fo element
        }
    }
}

function showCollectionFields() {
    let elements = document.getElementsByClassName("col");

    for (let i = 0; i < elements.length; i++) {
        if (document.getElementById("is_collection").checked) {
            elements[i].disabled = false;
        } else {
            elements[i].disabled = true;
        }
    }
}

function cuSubmit() {
    // håndterer submit knappen
    let artFile;
    let audioFile;
    const metaDataJson = {};

    // Retrieve values from form
    metaDataJson['name'] = document.getElementById("name").value;
    metaDataJson['artist'] = document.getElementById("artist").value;
    metaDataJson['release_year'] = document.getElementById("release_year").value;
    metaDataJson['part of collection'] = document.getElementById("is_collection").checked;
    metaDataJson['collection_name'] = document.getElementById("collection_name").value;
    metaDataJson['track_nr'] = document.getElementById("track_nr").value;
    metaDataJson['total_track_count'] = document.getElementById("total_track_count").value;

    // create json - string from metadata
    let jsonFile = JSON.stringify(metaDataJson)

    // creating FormData() object to post
    const data = new FormData();
    data.append('metadata', jsonFile);
    data.append('artwork', document.getElementById('artfile').files[0])
    data.append('mp3file', document.getElementById('audiofile').files[0])
    /*
       The FormData interface provides a way to easily construct a set of key/value pairs representing form fields and their values, which can then be easily sent using the XMLHttpRequest. send() method.
       It uses the same format a form would use if the encoding type were set to "multipart/form-data" .14 Sep 2021
    */

    console.log(data.get('metadata'));
    console.log(data.get('artwork'));
    console.log(data.get('mp3file'));

    //send formdata to api

    //sending post request with fetch api interface and printing result
    //headers: {'Content-Type': 'multipart/form-data'},

    fetch(apiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        body: data,


    })
        .then(response => response.json())
        .then(result => {
            console.log('Success:', result);
        })
        .catch(error => {
            //console.error('Error:', error);
        });
}

/*
Snakkede med niels i webtech om vores upload fil 'problem' han kom op med flg idé
https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
https://stackoverflow.com/questions/36067767/how-do-i-upload-a-file-with-the-js-fetch-api
 */


// GAMLE EKSPERIMENTER

/*
var urllink = apiEndpoint + linkInput;
console.log(urllink);
$.ajax({
        method: "post",
        url: urllink,

        success: function (result) {
            $('body').append(result)
        },

        error: function () {
            alert("error something went wrong");
        }
    });
}


/*

httpRequest.open('POST', apiEndpoint, true); //open request to api

//Send the proper header information along with the request
httpRequest.setRequestHeader('Content-type', 'application/json;charset=UTF-8');

httpRequest.onreadystatechange = function () { //Call a function when the state changes.
    if (httpRequest.readyState == 4 && httpRequest.status == 200) {
        alert(httpRequest.responseText);
    }
}

//add 2 files (art and audio)
httpRequest.send(metaDataJson, audioFile, artFile);
*/

/*
Gammel løsning

let all = document.querySelectorAll("#customAudioForm input");
// Receives files from form: artwork & audio mp3
for (let field of all) {
    if (field.type === "file") {
        var file = document.getElementById(field.getAttribute("id")).files[0];
        if (file != null) {
            artFile = file;
        } else {
            audioFile = file;
        }
    }
}
 */
