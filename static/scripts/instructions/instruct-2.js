$(document).ready(function() {
    $("#next-button").click(function() {
        allow_exit();
        go_to_page("instructions/instruct-3");
    });
    $("#prev-button").click(function() {
        allow_exit();
        go_to_page("instructions/instruct-1");
    });
    add_canvas();
    enable_drawing();
});