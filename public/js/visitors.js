let selectedId = 0;
let selectedName;
let selectedSurname;
let selectedPhone;
let selectedPhoto;
let selectedGates;
let gateHtml = false;


$(document).ready(function () {
    $('.third-button').on('click', function () {
        $('.animated-icon3').toggleClass('open');
    });
});

$(document).ready(function () {
    $('tbody tr').contextmenu(function (e) {
        e.preventDefault();
        let top = event.pageY + "px";
        let left = event.pageX + "px";

        $(".custom-menu").finish().toggle(100).css({
            top: top,
            left: left
        });
        const selectedIndex = $('tbody tr').index(this);
        const _this = $('tbody tr').eq(selectedIndex);
        selectedId = _this.find("#td-id").text();
        selectedName = _this.find("#td-name").text();
        selectedSurname = _this.find("#td-surname").text();
        selectedPhone = _this.find("#td-phone").text();
        selectedPhoto = _this.find("#td-photo").find('img').attr('src');
        selectedGates = _this.find("#td-gates").text();
        return false;
    });
});

$(document).bind("mousedown", function (e) {
    if (!$(e.target).parents(".custom-menu").length > 0) {
        $(".custom-menu").hide(100);
    }
});


$(".custom-menu li").click(function () {
    switch ($(this).attr("data-action")) {
        case "edit":
            editVisitor();
            break;
        case "remove":
            removeVisitor();
            break;
        case "pass":
            passVisitor();
            break;
    }

    $(".custom-menu").hide(100);
});

function removeVisitor() {
    fetch(`/visitors?id=${selectedId}`, {
        method: 'DELETE'
    }).then(response => {
        if (response.ok) {
            window.location.reload();
        }
    });
}

function passVisitor() {
    if (selectedGates.length <= 0) {
        alert("visitor's gate empty");
        return;
    }
    window.open(`/pass?id=${selectedId}`);
}


$('#logout').click(function () {
    fetch('/logout', {
        method: 'POST'
    }).then(response => {
        if (response.ok) {
            window.location.replace('/login');
        }
    })
});

function editVisitor() {
    $('#modal-title').text('Edit visitor');
    $('#visitor-name, #visitor-surname, #visitor-phone, #gates-input').focusin();
    $('#visitor-name').val(selectedName);
    $('#visitor-surname').val(selectedSurname);
    $('#visitor-phone').val(selectedPhone);
    $('#gates-input').val(selectedGates);
    $('#the-form').find('label').text(selectedPhoto.split('/').pop());
    $('#add-visitor-modal').modal('show');
    gateHtml = false;
}

$("button[data-number=1]").click(function () {
    $('#add-visitor-modal').modal('hide');
});

$("#float").click(() => {
    $('#modal-title').text('Add visitor');
    $('#visitor-name, #visitor-surname, #visitor-phone, #gates-input').val('');
    $('#visitor-name, #visitor-surname, #visitor-phone').focusout();
    $('#the-form').find('label').text('Choose file');
    $('#add-visitor-modal').modal('show');
    gateHtml = false;
})


$('#add-gate-modal-btn').click(async function () {
    if (gateHtml == false) {
        await fetch("/visitors/gates", {
            method: "GET"
        }).then(result => result.json()).then(json => {
            $('#select-gates-body').html(' ');
            if (json.length <= 0) {
                $('#select-gates-body').append(`<div class='text-center'><p>gates are empty</p></div>`)
            } else {
                for (const element of json) {
                    $('#select-gates-body').append(
                        `<div class="custom-control custom-switch">
                        <input type="checkbox" onclick='add()' class="custom-control-input" id="${element.id}">
                        <label class="custom-control-label" for="${element.id}">${element.name}</label>
                    </div>`);
                }
            }
        });
    }
    if ($('#modal-title').text() == 'Edit visitor') {
        const gates = $('#gates-input').val();
        const switchs = $('#select-gates-body .custom-switch').find('input').toArray();
        switchs.forEach(element => {
            if (gates.includes(element.getAttribute('id'))) {
                element.setAttribute('checked', true);
            }
        });
    }

    gateHtml = true;
    $('#visitor-add-gate-modal').modal('show');
});

function add() {
    const gates = [];
    const switchs = $('#select-gates-body .custom-switch').find('input').toArray();
    switchs.forEach(element => {
        if (element.checked) {
            gates.push(element.getAttribute("id"));
        }
    });
    $('#gates-input').val(gates);
}

async function addNewVisitor() {
    let imgUploadSuccess = false;
    let form = document.getElementById("the-form");
    let data = new FormData(form);
    const vImgPath = await fetch('/fileUpload', {
        method: 'POST',
        body: data
    }).then(resp => {
        if (resp.ok)
            return resp.text();
    }).then((resp) => {
        imgUploadSuccess = true;
        return resp;
    });

    if (!imgUploadSuccess) {
        console.log("img -error");
        return;
    }

    const vName = $('#visitor-name').val();
    const vSurname = $('#visitor-surname').val();
    const vPhone = $('#visitor-phone').val();
    const vGates = $('#gates-input').val();

    const json = JSON.stringify({
        name: vName,
        surname: vSurname,
        phone: vPhone,
        gates: vGates,
        photo: vImgPath
    });
    fetch('/visitors', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: json
    }).then(response => {
        if (response.ok) {
            window.location.reload();
        }
    });
}

async function editCurrentVisitor() {
    let filesLength = document.getElementById('file-id').files.length;
    let vImgPath = selectedPhoto;
    if (filesLength > 0) {
        let imgUploadSuccess = false;
        let form = document.getElementById("the-form");
        let data = new FormData(form);
        vImgPath = await fetch('/fileUpload', {
                method: 'POST',
                body: data
            })
            .then(resp => {
                if (resp.ok)
                    return resp.text()
            })
            .then((resp) => {
                imgUploadSuccess = true;
                return resp;
            });

        if (!imgUploadSuccess) {
            console.log("img -error");
            return;
        }
    }
    const json = JSON.stringify({
        name: $('#visitor-name').val(),
        surname: $('#visitor-surname').val(),
        phone: $('#visitor-phone').val(),
        gates: $('#gates-input').val(),
        photo: vImgPath
    });

    const result = await fetch(`/visitors?id=${selectedId}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: json
    });
    if (result.ok) {
        $('#add-visitor-modal').modal('hide');
        window.location.reload();
    }
}


$("button[data-number=2]").click(function () {
    $('#visitor-add-gate-modal').modal('hide');
});

$('#save-btn').click(async function () {
    const inputs = $('.md-form input:lt(3)').toArray();
    let c = 0;
    inputs.forEach(element => {
        if ($(element).val().length < 1) {
            element.setCustomValidity('Please fill out this field');
            element.reportValidity();
            c++;
        }
    })
    let filesLength = document.getElementById('file-id').files.length;
    if ($('#modal-title').text() == 'Edit visitor') {
        filesLength = 1;
    }
    if (filesLength <= 0) {
        document.getElementById('file-id').setCustomValidity('Please add image');
        document.getElementById('file-id').reportValidity();
    }
    if (c != 0 || filesLength <= 0) {
        return;
    }

    if ($('#modal-title').text() == 'Add visitor') {
        await addNewVisitor();
    } else {
        await editCurrentVisitor();
    }
})
