paint_circle = function(color) {
    if (color == "grey") {
        circle.attr("fill", "#eee");
    }
    if (color == "black") {
        circle.attr("fill", "#000");
    }
};

place_circle = function(x, y) {
    circle.attr({
        cx: x,
        cy: y
    });
};

replay_motion = function(xs, ys, ts, period) {
    period = typeof period !== 'undefined' ? period : 0;
    place_circle(x=xs[0], y=ys[0]);
    paint_circle("black");
    start_time = time_now();
    index = 1;
    draw_next_dot = function() {
        while (index + 1 < xs.length & (time_now() - start_time > ts[index + 1] & time_now() - start_time < 5000)) {
            index++;
        }
        place_circle(x=xs[index], y=ys[index]);
        if (time_now() - start_time < 5000) {
            setTimeout(draw_next_dot, period);
        } else {
            paint_circle("grey");
        }
    };
    draw_next_dot();
};

replay_partial_motion = function(xs, ys, ts, sections) {
    if ($.inArray(1, sections) > -1) {
        paint_canvas_grey();
    } else {
        paint_canvas_black();
    }
    for (i=2; i<11; i++) {
        if ($.inArray(i, sections) > -1) {
            setTimeout(
                paint_canvas_grey,
                (i-1)*500
            );
        } else {
            setTimeout(
                paint_canvas_black,
                (i-1)*500
            );
        }
    }
    setTimeout(
        function() {
            paint_circle("grey");
            paint_canvas_grey();
        },
        5000
    );
    replay_motion(xs, ys, ts);
};

time_now = function() {
    return new Date().getTime();
};

add_canvas = function() {
    paper = new Raphael($(".canvas-div").get(0), 400, 400);
    rect = paper.rect(0, 0, 400, 400);
    paint_canvas_grey();
    circle = paper.circle(50, 50, 10).attr({
        "stroke-width": 0,
    });
    paint_circle("grey");
};

paint_canvas_grey = function() {
    rect.attr("fill", "#eee");
};

paint_canvas_black = function() {
    rect.attr("fill", "#000");
};

disable_buttons = function() {
    $(".submit-button").prop("disabled",true);
    $(".asocial-button").prop("disabled",true);
    $(".social-button").prop("disabled",true);
    $(paper.canvas).off('click');
};

enable_buttons = function() {
    $(".asocial-button").prop("disabled",false);
    if (social_xs !== undefined) {
        $(".social-button").prop("disabled",false);
    }
    if (sections > 0 & (stutters > 0 | social_xs === undefined)) {
        enable_drawing(true);
    }
    if (xs !== undefined) {
        $(".submit-button").prop("disabled",false);
    }
};

enable_drawing = function(repeat) {
    if (repeat === undefined) { repeat = false; }
    x_offset = $(paper.canvas).offset().left;
    y_offset = $(paper.canvas).offset().top;

    $(paper.canvas).click(function(click_location) {
        disable_buttons();
        $(paper.canvas).off('click');
        $(paper.canvas).css('cursor', 'none');
        xs = [];
        ys = [];
        ts = [];
        place_circle(x=click_location.pageX - x_offset, y=click_location.pageY - y_offset);
        paint_circle("black");
        start_time = time_now();
        xs.push(click_location.pageX - x_offset);
        ys.push(click_location.pageY - y_offset);
        ts.push(0);

        $(paper.canvas).mousemove(function( event ) {
            x_cor = event.pageX - x_offset;
            y_cor = event.pageY - y_offset;
            place_circle(x=x_cor, y=y_cor);
            xs.push(x_cor);
            ys.push(y_cor);
            ts.push(time_now() - start_time);
        });

        setTimeout(
            function() {
                $(paper.canvas).off('mousemove');
                $(paper.canvas).css('cursor', 'auto');
                paint_circle("grey");
                enable_buttons();
                if (repeat === true) {
                    enable_drawing(true);
                }
            },
            5000
        );
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