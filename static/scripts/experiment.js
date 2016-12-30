if (!Date.now) {
    Date.now = function() {
        return new Date().getTime();
    };
}

function getTrajectoryIndex(timestamp) {
    var minIndex = 0;
    var maxIndex = this.length - 1;
    var currentIndex;
    var currentElement;

    while (minIndex <= maxIndex) {
        currentIndex = (minIndex + maxIndex) / 2 | 0;
        currentElement = this[currentIndex][2];

        if (currentElement < timestamp) {
            minIndex = currentIndex + 1;
        }
        else if (currentElement > timestamp) {
            maxIndex = currentIndex - 1;
        }
        else {
            return currentIndex;
        }
    }
    return maxIndex;
}

$(function () {

    refreshRate = 5;  // Hz
    waitTime = 1000.0/refreshRate;

    trajectory = [];
    began = false;
    completed = false;

    var paper = Raphael(0, 0, 400, 400);
    var rect = paper.rect(0, 0, 400, 400);
    rect.attr("fill", "#eee");
    var circle = paper.circle(200, 200, 10);
    circle.attr('fill', '#000');

    $(window).mousemove(function( event ) {
        if (began && !completed) {
            circle.attr({
                cx: event.pageX,
                cy: event.pageY
            });
            trajectory.push([event.pageX, event.pageY, Date.now()]);
        }
    });

    circle.drag(
        function () {
            began = true;
            $('body').css('cursor', 'none');
        },
        function () {
            return;
        },
        function () {
            completed = true;
            $('body').css('cursor', 'default');
            normalizeTimestamps(trajectory);
        }
    );

    normalizeTimestamps = function(trajectory) {
        start = trajectory[0][2];
        for (var i = 0; i < trajectory.length; i++) {
            trajectory[i][2] = trajectory[i][2] - start;
        }
    };

    replayTrajectory = function (trajectory, condition) {

        condition = condition || function () { return true; };

        function refreshDisplay(trajectory) {

            stamp = Date.now() - replayStart;
            console.log(stamp);
            console.log(trajectory);
            idx = getTrajectoryIndex.call(trajectory, stamp);
            console.log(idx);
            console.log("---");

            if (trajectory.length > 0) {

                if (condition(trajectory)) {
                    circle.attr({
                        cx: trajectory[idx][0],
                        cy: trajectory[idx][1]
                    });
                }
                setTimeout(function(){
                    refreshDisplay(trajectory);
                }, waitTime);
            }
        }
        replayStart = Date.now();
        refreshDisplay(trajectory);
    };

    $("#replay").click( function () {
        replayTrajectory(trajectory);
    });
});


$(document).ready(function() {
    //$(".payoff-p").hide();
    //get_experiment_parameters();
    //create_agent();
});

get_experiment_parameters = function () {
    reqwest({
        url: "/experiment/trials_per_round",
        method: 'get',
        type: 'json',
        success: function (resp) {
            trials_per_round = resp.trials_per_round;
            $(".trials_per_round").html(trials_per_round);
        },
        error: function (err) {
            console.log(err);
            create_agent();
        }
    });
    reqwest({
        url: "/experiment/rounds",
        method: 'get',
        type: 'json',
        success: function (resp) {
            rounds = resp.rounds;
            $(".rounds").html(rounds);
        },
        error: function (err) {
            console.log(err);
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
            get_genes();
        },
        error: function (err) {
            allow_exit();
            go_to_page("questionnaire");
        }
    });
};

// what is my memory and curiosity?
get_genes = function() {
    reqwest({
        url: "/node/" + my_node_id + "/infos",
        method: 'get',
        type: 'json',
        data: {
            info_type: "Gene"
        },
        success: function (resp) {
            infos = resp.infos;
            for (i = 0; i < infos.length; i++) {
                info = infos[i];
                if (info.type == "learning_gene") {
                    learning_capacity = parseInt(info.contents, 10);
                } else {
                    memory_capacity = parseInt(info.contents, 10);
                    rounds_to_change = [2, 3, 4, 5, 6, 7, 8, 9, 10];
                    for (j=0; j<Math.min(memory_capacity, 9); j++) {
                        rounds_to_change.splice(Math.floor(Math.random()*rounds_to_change.length), 1);
                    }
                }
            }
            start_first_round();
        },
        error: function (err) {
            create_agent();
        }
    });
};

start_first_round = function() {
    total_payoff = 0;
    round = 1;
    trial = 1;
    update_trial_text();
    pick_temperature();
    change_left_strategy();
    change_right_strategy();
    calculate_strategy_payoffs();
    update_ui();
    create_event_listeners();
};

update_trial_text = function() {
    $(".round").html(round);
    $(".trial").html(trial);
};

change_left_strategy = function() {
    index = Math.floor(Math.random()*available_strategies.length);
    strategies.left.name = available_strategies[index];
    available_strategies.splice(index, 1);
    strategies.left.image = "static/images/" + strategies.left.name + ".png";
    strategies.left.mean_1 = Math.random();
    strategies.left.mean_2 = Math.random();
    
};

change_right_strategy = function() {
    index = Math.floor(Math.random()*available_strategies.length);
    strategies.right.name = available_strategies[index];
    available_strategies.splice(index, 1);
    strategies.right.image = "static/images/" + strategies.right.name + ".png";
    strategies.right.mean_1 = Math.random();
    strategies.right.mean_2 = Math.random();
    
};

calculate_strategy_payoffs = function() {
    strategies.left.payoff = Math.round(
        scaled_normal_pdf(temperature.number/10.0, strategies.left.mean_1, 0.01) +
        scaled_normal_pdf(temperature.number/10.0, strategies.left.mean_2, 0.04)
    );
    strategies.right.payoff = Math.round(
        scaled_normal_pdf(temperature.number/10.0, strategies.right.mean_1, 0.01) +
        scaled_normal_pdf(temperature.number/10.0, strategies.right.mean_2, 0.04)
    );
};

update_ui = function() {
    $(".left-td").html("<img class='left-img' src=" + strategies.left.image + "></img>");
    $(".right-td").html("<img class='right-img' src=" + strategies.right.image + "></img>");
    $(".thermometer-div").html("<img src=" + temperature.image + "></img>");
    $(".temp-description").html(temperature.name);

    if (trial <= learning_capacity) {
        $(".trial-instruct").html("You can choose one of the options and earn its payoff,<br>or you can check both options to see their payoffs without earning anything.");
        $(".trial-instruct-lower").html("Click on the images to choose an option, or click the 'check' button to check both strategies without earning a payoff.");
    } else {
        $(".trial-instruct").html("You must choose one of the options and earn its payoff,<br>you cannot check both options on this trial.");
        $(".trial-instruct-lower").html("Click on the images to choose an option.");
    }
};

pick_temperature = function() {
    num = Math.floor(Math.random()*11);
    temperature.number = num;
    temperature.name = temperatures[num];
    temperature.image = "static/images/" + temperature.number + ".png";
};

normal_pdf = function(x, u, v) {
    exponent = -(Math.pow((x-u),2)/(2*v));
    denominator = Math.pow((2*v*Math.PI), 0.5);
    return (1/denominator)*Math.exp(exponent);
};

scaled_normal_pdf = function(x, u, v) {
    density = normal_pdf(x, u, v);
    max_density = normal_pdf(u, u, v);
    return (density/max_density)*10;
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
