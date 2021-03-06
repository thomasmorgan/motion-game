var xs;
var ys;
var ts;
social_clicks = 0;
asocial_clicks = 0;
replays = 0;

$(document).ready(function() {
    $(".submit-button").click(function() {
        disable_buttons();
        save_input();
    });
    $(".replay-button").click(function() {
        disable_buttons();
        replays++;
        replay_motion(xs, ys, ts);
        setTimeout(enable_buttons, 5300);
    });
    $(".asocial-button").click(function() {
        disable_buttons();
        asocial_clicks++;
        replay_partial_motion(true_xs, true_ys, true_ts, visible_sections);
        setTimeout(enable_buttons, 5300);
    });
    $(".social-button").click(function() {
        disable_buttons();
        social_clicks++;
        period = 5000/(2*social_capacity + 1);
        replay_motion(social_xs, social_ys, social_ts, period);
        setTimeout(enable_buttons, 5300);
    });
});


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
    rect.attr("stroke-width", "5");
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
    $(".replay-button").prop("disabled",true);
    $(paper.canvas).off('click');
    rect.attr("stroke", "#000");
};

enable_buttons = function() {
    $(".asocial-button").prop("disabled",false);
    if (social_xs !== undefined) {
        $(".social-button").prop("disabled",false);
    }
    if (asocial_clicks > 0 & (social_clicks > 0 | social_xs === undefined)) {
        enable_drawing(true);
    }
    if (xs !== undefined) {
        $(".submit-button").prop("disabled",false);
        $(".replay-button").prop("disabled",false);
    }
};

enable_drawing = function(repeat) {
    if (repeat === undefined) { repeat = false; }
    x_offset = $(paper.canvas).offset().left;
    y_offset = $(paper.canvas).offset().top;
    rect.attr("stroke", "#119E1E");

    $(paper.canvas).click(function(click_location) {
        disable_buttons();
        rect.attr("stroke", "#119E1E");
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
                rect.attr("stroke", "#000");
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
    var foo = [];
    bump = Math.floor(Math.random()*(11-size));
    for (var i = 1; i <= size; i++) {
       foo.push(i+bump);
    }
    return foo;
};