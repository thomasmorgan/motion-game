time_now = function() {
    return new Date().getTime();
};

replay_motion = function() {
    circle = paper.circle(xs[0], ys[0], 10);
    circle.attr('fill', '#000');
    start_time = time_now();
    index = 1;
    draw_next_dot = function() {
        setTimeout(
            function() {
                circle.attr({
                    cx: xs[index],
                    cy: ys[index]
                });
                if (index + 1 < xs.length) {
                    if (time_now() - start_time > ts[index + 1]) {
                        index = index + 1;
                    }
                    draw_next_dot();
                } else {
                    if (time_now() - start_time < 5000) {
                        draw_next_dot();
                    } else {
                        circle.remove();
                    }
                }
            }, 0
        );
    };
    draw_next_dot();
};

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

    paper = new Raphael($(".canvas-div").get(0), 400, 400);
    rect = paper.rect(0, 0, 400, 400);
    rect.attr("fill", "#eee");

    x_offset = $(".canvas-div").position().left;
    y_offset = $(".canvas-div").position().top;

    ready = true;

    $(".canvas-div").click(function(click_location) {
        if (ready === true) {
            ready = false;
            xs = [];
            ys = [];
            ts = [];
            circle = paper.circle(click_location.pageX - x_offset, click_location.pageY - y_offset, 10);
            circle.attr('fill', '#000');
            start_time = time_now();
            xs.push(click_location.pageX - x_offset);
            ys.push(click_location.pageY - y_offset);
            ts.push(0);

            $(".canvas-div").mousemove(function( event ) {
                x_cor = event.pageX - x_offset;
                y_cor = event.pageY - y_offset;
                circle.attr({
                    cx: x_cor,
                    cy: y_cor
                });
                xs.push(x_cor);
                ys.push(y_cor);
                ts.push(time_now() - start_time);
            });

            setTimeout(
                function() {
                    $(".canvas-div").off('mousemove');
                    circle.remove();
                    ready = true;
                    replay_motion();
                },
                5000
            );
        }

    });
});