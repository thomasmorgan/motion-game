var social_xs;
var social_ys;
var social_ts;
var trial = 0;

$(document).ready(function() {
    add_canvas();
    disable_buttons();
    get_experiment_parameters();
    create_agent();
    
    $(".submit-button").click(function() {
        disable_buttons();
        save_input();
    });
    $(".asocial-button").click(function() {
        disable_buttons();
        sections++;
        replay_partial_motion(true_xs, true_ys, true_ts, visible_sections);
        setTimeout(enable_buttons, 5300);
    });
    $(".social-button").click(function() {
        disable_buttons();
        socials++;
        period = 5000/(2*social_capacity + 1);
        replay_motion(social_xs, social_ys, social_ts, period);
        setTimeout(enable_buttons, 5300);
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
            sections = 0;
            stutters = 0;
            xs = undefined;
            ys = undefined;
            ts = undefined;
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
                    $(".asocial-button").prop("disabled",false);
                    visible_sections = random_sections(asocial_capacity);
                } else if (info.type == "motion") {
                    j = JSON.parse(info.contents);
                    social_xs = j["xs"];
                    social_ys = j["ys"];
                    social_ts = j["ts"];
                    $(".social-button").prop("disabled",false);
                }
            }
        },
        error: function (err) {
            create_agent();
        }
    });
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
        success: function (err) {
            create_agent();
        },
        error: function (err) {
            create_agent();
        }
    });
};
