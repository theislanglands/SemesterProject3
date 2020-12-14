// eslint-disable-next-line no-unused-vars
window.addEventListener('load', (event) => {
    var button = document.getElementById('submit');
    var div = document.getElementById('response');
    var msg = '';
    button.addEventListener('click', function () {
        var input = document.getElementById('email');
        console.log(input.value);
        //Mock_URL='https://localhost/gmail/forgotPass'
        //KUBUNTU_URL='http://kubuntu.stream.stud-srv.sdu.dk/service02/forgotPass'
        let response = fetch('http://kubuntu.stream.stud-srv.sdu.dk/service02/forgotPass', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json'
            },
            body: JSON.stringify({ email: input.value })
        })
            .then((response) => {
                return JSON.stringify(response);
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
        console.log(response + ' IS connected');
        console.log(msg);
    });
});
