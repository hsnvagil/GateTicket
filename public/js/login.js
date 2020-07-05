let btnTogglePass = $('.btn-toggle-pass');
let submitBtn = $('#submit-btn');
const inputs = $('input');
for (const input of inputs) {
    $(input).on('keypress', function(event){
        if(event.which === 13){
            $(submitBtn).trigger('click');
        }
    })
}

btnTogglePass.on('click', () => {
    btnTogglePass.find('i').toggleClass('fa-eye fa-eye-slash');
    if (btnTogglePass.next('input').attr('type') == 'password') {
        btnTogglePass.next('input').attr('type', 'text');
    } else {
        btnTogglePass.next('input').attr('type', 'password');
    }
});

submitBtn.click(async () => {
    let element;
    let log = $('#login').val();
    let pass = $('#pass').val();
    const json = JSON.stringify({
        login: log,
        pass: pass
    });
    const result = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: json
    }).then(res => {
            return res.text();
    });

    if(result == 'success'){
        window.location.replace('/visitors');
    }
    else if(result == 'wrong username'){
        element = $('#login')[0];
        element.setCustomValidity('The username you’ve entered doesn’t match any account');
        element.reportValidity();
    }
    else if(result == 'wrong password'){
        element = $('#pass')[0];
        element.setCustomValidity('The password you’ve entered is incorrect');
        element.reportValidity();
    }
});