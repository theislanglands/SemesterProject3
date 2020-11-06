window.addEventListener('load', (event) => {
    var button = document.getElementById('submit');
    var div = document.getElementById('response');
    var msg = '';
    button.addEventListener('click', function () {
        var input = document.getElementById('email');
        let response = fetch('http://localhost:8081/forgotPass', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json'
            },
            body: 'email=' + encodeURIComponent(input.value)
        })
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                div.innerText = data.msg;

                input.value = '';
                input.disabled = data.isSent;
            });
        console.log(msg);
    });
});
