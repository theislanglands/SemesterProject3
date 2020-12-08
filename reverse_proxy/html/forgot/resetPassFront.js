window.onload = () => {
    var btn = document.getElementById('send');
    var pass = document.getElementById('password');
    var confPass = document.getElementById('confirmPassword');
    var div = document.getElementById('response');
    // eslint-disable-next-line no-unused-vars
    var msg = '';
    btn.addEventListener('click', function () {
        const sendUrl = 'https://localhost/gmail/resetPassword_form';
        const specs = {
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'Access-Control-Allow-Methods': 'POST, OPTIONS, GET'
            },
            body: 'password=' + encodeURIComponent(pass.value)
        };
        if (pass.value === confPass.value) {
            fetch(sendUrl, specs)
                .then((res) => {
                    return res.json();
                })
                .then((data) => {
                    div.innerText = data.msg;
                    btn.disabled = data.success;
                })
                .catch((error) => console.log(error));
        } else {
            div.innerText = "The two password aren't identical, try again";
        }
    });
};
