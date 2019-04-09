function field_focus(field, email) {
    if (field.value == email) {
        field.value = '';
    }
}

function field_blur(field, email) {
    if (field.value == '') {
        field.value = email;
    }
}

$(document).ready(function () {
    $('.box').hide().fadeIn(1000);
});

$('a').click(function (event) {
    event.preventDefault();
});