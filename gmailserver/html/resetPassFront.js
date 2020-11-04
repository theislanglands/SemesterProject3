window.onload = () => {
    var btn = document.getElementById('send');
    var pass = document.getElementById('password');
    var confPass = document.getElementById('confirmPassword');
    btn.addEventListener('click', function () {
        const sendUrl = 'http://localhost:8081/resetPassword_form?';
        const data = {
            password: pass.value,
            confirmPassword: confPass.value
        };
        const specs = {
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            body: 'password=' + encodeURIComponent(pass.value)
        };
        fetch(sendUrl, specs)
            .then((data) => {
                return data.json();
            })
            .then((res) => {
                console.log(res);
            })
            .catch((error) => console.log(error));
    });
};
