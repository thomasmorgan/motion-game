$(document).ready(function() {
    $("#begin-button").click(function() {
        allow_exit();
        go_to_page("experiment");
    });
    $("#prev-button").click(function() {
        allow_exit();
        go_to_page("instructions/instruct-4b");
    });

    reqwest({
        url: "/experiment/trials",
        method: 'get',
        type: 'json',
        success: function (resp) {
            trials = resp.trials;
            $(".trials").html(trials);
        }
    });
});