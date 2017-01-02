replay_motion = function(period) {
    period = typeof period !== 'undefined' ? period : 0;
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
                    while (time_now() - start_time > ts[index + 1]) {
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
            }, period
        );
    };
    draw_next_dot();
};

replay_partial_motion = function(sections) {
    if ($.inArray(1, sections) > -1) {
        rect.attr("fill", "#eee");
    } else {
        rect.attr("fill", "#000");
    }
    for (i=2; i<11; i++) {
        if ($.inArray(i, sections) > -1) {
            setTimeout(
                function() {
                    rect.attr("fill", "#eee");
                },
            (i-1)*500);
        } else {
            setTimeout(
                function() {
                    rect.attr("fill", "#000");
                },
            (i-1)*500);
        }
    }
    setTimeout(
        function() {
            circle.attr("fill", "#eee");
            rect.attr("fill", "#eee");
        },
    5000);
    replay_motion();
};

time_now = function() {
    return new Date().getTime();
};

add_canvas = function() {
    paper = new Raphael($(".canvas-div").get(0), 400, 400);
    rect = paper.rect(0, 0, 400, 400);
    rect.attr("fill", "#eee");
};

enable_drawing = function() {
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
                },
                5000
            );
        }

    });
};

random_sections = function(size) {
    arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var shuffled = arr.slice(0), i = arr.length, temp, index;
    while (i--) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(0, size);
};