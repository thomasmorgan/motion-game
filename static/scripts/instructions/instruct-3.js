$(document).ready(function() {
    $("#next-button").click(function() {
        allow_exit();
        go_to_page("instructions/instruct-4");
    });
    $("#prev-button").click(function() {
        allow_exit();
        go_to_page("instructions/instruct-2");
    });
});

$(function () {
    var paper = new Raphael($(".canvas-div").get(0), 400, 400);
    var rect = paper.rect(0, 0, 400, 400);
    rect.attr("fill", "#eee");
});