// eslint-disable-next-line no-unused-vars
window.addEventListener('load', (event) => {
    var button = document.getElementById('submit');
    var div = document.getElementById('response');
    var msg = '';
    button.addEventListener('click', function () {
        var input = document.getElementById('email');
        // eslint-disable-next-line no-unused-vars
        let response = fetch('https://localhost/gmail/forgotPass', {
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
            })
            // eslint-disable-next-line no-unused-vars
            .catch((error) => {
                console.log('some error happened');
            });
        console.log(msg);
    });
});
