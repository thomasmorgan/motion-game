var social_xs;
var social_ys;
var social_ts;
var trial = 0;

$(document).ready(function() {
    add_canvas();
    get_experiment_parameters();
    create_agent();
    handle_true_motion = false;
    handle_social_information = false;
    $(document).keypress(function(event) {
        if (event.which == 13) {
            if (handle_true_motion === true) {
                
            } else if (handle_social_information === true) {
                replay_motion(social_capacity);
            }
        }
    });
    $(".submit-button").prop("disabled",true);
    $(".submit-button").click(function() {
        $(".submit-button").prop("disabled",true);
        save_input();
        create_agent();
    });
});

get_experiment_parameters = function () {
    reqwest({
        url: "/experiment/trials",
        method: 'get',
        type: 'json',
        success: function (resp) {
            trials = resp.trials;
            $(".trials").html(trials);
        },
        error: function (err) {
            create_agent();
        }
    });
};

// make a new node
create_agent = function() {
    reqwest({
        url: "/node/" + participant_id,
        method: 'post',
        type: 'json',
        success: function (resp) {
            my_node_id = resp.node.id;
            get_infos();
            trial++;
            $(".trial").html(trial);
        },
        error: function (err) {
            allow_exit();
            go_to_page("questionnaire");
        }
    });
};

// what is my memory and curiosity?
get_infos = function() {
    reqwest({
        url: "/node/" + my_node_id + "/infos",
        method: 'get',
        type: 'json',
        success: function (resp) {
            infos = resp.infos;
            for (i = 0; i < infos.length; i++) {
                info = infos[i];
                if (info.type == "asocial_gene") {
                    asocial_capacity = parseInt(info.contents, 10);
                } else if (info.type == "social_gene") {
                    social_capacity = parseInt(info.contents, 10);
                }
            }
            get_received_infos();
        },
        error: function (err) {
            create_agent();
        }
    });
};

// what is my memory and curiosity?
get_received_infos = function() {
    reqwest({
        url: "/node/" + my_node_id + "/received_infos",
        method: 'get',
        type: 'json',
        success: function (resp) {
            received_infos = resp.infos;
            for (i = 0; i < received_infos.length; i++) {
                info = received_infos[i];
                if (info.type == "true_motion") {
                    j = JSON.parse(info.contents);
                    true_xs = j["xs"];
                    true_ys = j["ys"];
                    true_ts = j["ts"];
                } else if (info.type == "motion") {
                    j = JSON.parse(info.contents);
                    social_xs = j["xs"];
                    social_ys = j["ys"];
                    social_ts = j["ts"];

                }
            }
            show_asocial_information();
        },
        error: function (err) {
            create_agent();
        }
    });
};

show_asocial_information = function() {
    $(".title").html("Watch the motion of the dot and then reproduce it.");
    $(".instructions").html("Press ENTER to see a section of the true motion.");
    $(document).keypress(function(event) {
        if (event.which == 13) {
            $(document).off('keypress');
            $(".instructions").html("Now playing a section of the true motion.");
            xs = true_xs;
            ys = true_ys;
            ts = true_ts;
            replay_partial_motion(random_sections(asocial_capacity));

            setTimeout(
                function() {
                    if (social_xs !== undefined) {
                        show_social_information();
                    } else {
                        request_input();
                    }
                }, 5500
            );
        }
    });
};

show_social_information = function() {
    $(".instructions").html("Press ENTER to see the previous participant's input.");
    $(document).keypress(function(event) {
        if (event.which == 13) {
            $(document).off('keypress');
            $(".instructions").html("Now playing the previous participant's input.");
            xs = social_xs;
            ys = social_ys;
            ts = social_ts;
            period = 5000/(2*social_capacity + 1);
            replay_motion(period);

            setTimeout(
                function() {
                    request_input();
                }, 5500
            );
        }
    });
};

request_input = function() {
    $(".instructions").html("Click on the canvas and move your cursor to recreate the motion of the dot.");
    enable_drawing(true);
};

drawing_complete = function() {
    $(".submit-button").prop("disabled",false);
};

save_input = function() {
    input = {
        xs: xs,
        ys: ys,
        ts: ts
    };
    input = JSON.stringify(input);

    dat = {
        true_xs: true_xs,
        true_ys: true_ys,
        true_ts: true_ts,
        social_xs: social_xs,
        social_ys: social_ys,
        social_ts: social_ts,
        trial: trial
    };
    dat = JSON.stringify(dat);

    reqwest({
        url: "/info/" + my_node_id,
        method: 'post',
        data: {
            contents: input,
            property1: dat,
            info_type: 'Motion'
        },
        error: function (err) {
            create_agent();
        }
    });
};
