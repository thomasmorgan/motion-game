var social_xs;
var social_ys;
var social_ts;
var trial = 0;

$(document).ready(function() {
    add_canvas();
    disable_buttons();
    get_experiment_parameters();
    create_agent();
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
            trial++;
            asocial_clicks = 0;
            social_clicks = 0;
            replays = 0;
            xs = undefined;
            ys = undefined;
            ts = undefined;
            $(".trial").html(trial);
            get_points();
        },
        error: function (err) {
            allow_exit();
            go_to_page("questionnaire");
        }
    });
};

get_points = function() {
    reqwest({
        url: "/points/" + participant_id,
        method: 'get',
        type: 'json',
        success: function (resp) {
            points = resp.points;
            if (trial == 1) {
                $(".current_bonus").html("0.00");
                $(".projected_bonus").html("?.??");
            } else {
                current_bonus = (Math.min(Math.max(points - 20*(trials), 0.00)/(20*(trials)), 1.00)*2.50).toFixed(2);
                $(".current_bonus").html(current_bonus);
                projected_bonus = (Math.min(Math.max(points - 20*(trial-1), 0.00)/(20*(trial-1)), 1.00)*2.50).toFixed(2);
                $(".projected_bonus").html(projected_bonus);
            }
            get_infos();
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
        trial: trial,
        social_clicks: social_clicks,
        asocial_clicks: asocial_clicks,
        replays: replays
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
