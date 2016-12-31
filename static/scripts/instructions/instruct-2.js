$(document).ready(function() {
    $("#next-button").click(function() {
        allow_exit();
        go_to_page("instructions/instruct-3");
    });
    $("#prev-button").click(function() {
        allow_exit();
        go_to_page("instructions/instruct-1");
    });
});

$(function () {

    var paper = new Raphael($(".canvas-div").get(0), 400, 400);
    var rect = paper.rect(0, 0, 400, 400);
    rect.attr("fill", "#eee");

    x_offset = $(".canvas-div").position().left;
    y_offset = $(".canvas-div").position().top;

    ready = true;

    $(".canvas-div").click(function(click_location) {
        if (ready === true) {
            ready = false;
            var circle = paper.circle(click_location.pageX - x_offset, click_location.pageY - y_offset, 10);
            circle.attr('fill', '#000');

            $(".canvas-div").mousemove(function( event ) {

                x_cor = event.pageX - x_offset;
                y_cor = event.pageY - y_offset;
                circle.attr({
                    cx: x_cor,
                    cy: y_cor
                });
            });

            setTimeout(
                function() {
                    $(".canvas-div").mousemove(function( event ) { });
                    circle.remove();
                    ready = true;
                },
                5000
            );
        }

    });
});