var social_xs;
var social_ys;
var social_ts;

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
            replay_motion(social_capacity);

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
    enable_drawing();
};



create_event_listeners = function() {
    $(".left-img").on('click', function() {
        remove_event_listeners();
        show_payoff("left");
        log_decision("left");
        setTimeout(function(){ advance_to_next_trial(); }, 2000);
    });
    $(".right-img").on('click', function() {
        remove_event_listeners();
        show_payoff("right");
        log_decision("right");
        setTimeout(function(){ advance_to_next_trial(); }, 2000);
    });
    if (trial <= learning_capacity) {
        $('.check-button').show();
        $(".check-button").on('click', function() {
            remove_event_listeners();
            show_payoff("both");
            log_decision("check");
            setTimeout(function(){ advance_to_next_trial(); }, 2000);
        });
    } else {
        $('.check-button').hide();
    }
};

log_decision = function(decision) {
    if (decision == "left") {
        payoff = strategies.left.payoff;
    } else if (decision == "right") {
        payoff = strategies.right.payoff;
    } else {
        payoff = 0;
    }
    total_payoff = total_payoff + payoff;
    update_payoff_text();
    dat = {
        temperature: temperature,
        strategies: strategies,
        trial: trial,
        round: round,
        payoff: payoff
    };
    dat = JSON.stringify(dat);
    reqwest({
        url: "/info/" + my_node_id,
        method: 'post',
        data: {
            contents: decision,
            property1: dat,
            info_type: 'Decision'
        },
        error: function (err) {
            create_agent();
        }
    });
};

update_payoff_text = function() {
    $(".payoff-text").html(total_payoff);
};

remove_event_listeners = function () {
    $(".left-img").off('click');
    $(".right-img").off('click');
    $(".check-button").off('click');
};

show_payoff = function(which) {
    if (which == "both") {
        $(".left-td").html(strategies.left.payoff);
        $(".right-td").html(strategies.right.payoff);
    }
    else if (which == "left") {
        $(".left-td").html("X");
        $(".right-td").html("");
    }
    else if (which == "right") {
        $(".right-td").html("X");
        $(".left-td").html("");
    }
};

advance_to_next_trial = function() {
    trial += 1;
    if (trial > trials_per_round) {
        round += 1;
        if (round > rounds) {
            create_agent();
        } else {
            trial = 1;
            if(jQuery.inArray(round, rounds_to_change) !== -1) {
                change_left_strategy();
                change_right_strategy();
            }
        }
    }
    if (round <= rounds) {
        update_trial_text();
        pick_temperature();
        calculate_strategy_payoffs();
        update_ui();
        create_event_listeners();
    }
};
