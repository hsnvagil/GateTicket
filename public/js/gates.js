let selectedId = 0;
let selectedName;
let selectedComment;

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
        const index = $('tbody tr').index(this);
        selectedId = $('tbody tr').eq(index).find("#td-id").text();
        selectedName = $('tbody tr').eq(index).find('#td-name').text();
        selectedComment = $('tbody tr').eq(index).find('#td-comment').text();
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
            editGate();
            break;
        case "remove":
            removeGate();
            break;
    }

    $(".custom-menu").hide(100);
});

function removeGate() {
    fetch(`/gates?id=${selectedId}`, {
        method: 'DELETE'
    }).then(response => {
        if (response.ok) {
            window.location.reload();
        }
    });
}


$('#logout').click(function () {
    fetch('/logout', {
        method: 'POST'
    }).then(response => {
        if (response.ok) {
            window.location.replace('/login');
        }
    });
});

function editGate() {
    $('#e-gate-name, #e-gate-comment').focusin();
    $('#e-gate-name').val(selectedName);
    $('#e-gate-comment').val(selectedComment);  
    $('#modal-edit-gate').modal('show');
};

$('#e-save-btn').click(async function () {
    const name = $('#e-gate-name').val();
    const comment = $('#e-gate-comment').val();
    if (name.length <= 0) {
        $('#e-gate-name')[0].setCustomValidity('Please fill out this field');
        $('#e-gate-name')[0].reportValidity();
        return;
    } else if (comment.length <= 0) {
        $('#e-gate-comment')[0].setCustomValidity('Please fill out this field');
        $('#e-gate-comment')[0].reportValidity();
        return;
    }
    const json = JSON.stringify({
        name: name,
        comment: comment
    });
    const result = await fetch(`/gates?id=${selectedId}`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: json
    });
    if (result.ok) {
        $('#modal-edit-gate').modal('hide');
        window.location.reload();
    }

})

$('#save-btn').click(async function () {
    const gateName = $('#gate-name').val();
    const gateCom = $('#gate-comment').val();

    if (gateName.length <= 0) {
        $('#gate-name')[0].setCustomValidity('Please fill out this field');
        $('#gate-name')[0].reportValidity();
        return;
    } else if (gateCom.length <= 0) {
        $('#gate-comment')[0].setCustomValidity('Please fill out this field');
        $('#gate-comment')[0].reportValidity();
        return;
    }
    const gate = {
        name: gateName,
        comment: gateCom
    };
    const json = JSON.stringify(gate);
    const result = await fetch('/gates', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: json
    });
    if (result.ok) {
        $('.close').trigger('click');
        window.location.reload();
    }
})