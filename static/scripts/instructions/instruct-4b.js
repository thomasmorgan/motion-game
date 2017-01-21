xs = [27,27,27,27,27,27,27,26,26,26,26,26,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,25,26,26,26,26,27,27,27,27,27,27,27,28,29,30,31,33,34,35,37,39,41,42,44,46,48,51,53,58,61,65,70,74,76,82,86,89,94,97,99,102,106,112,115,118,121,126,128,131,135,138,141,145,150,153,157,161,164,168,172,177,181,185,190,195,200,205,211,216,221,225,230,234,238,241,244,247,250,251,253,254,255,256,257,257,257,257,257,256,255,253,251,249,248,245,245,242,241,239,237,235,232,231,228,225,223,221,218,215,212,209,206,203,199,195,192,189,185,182,180,177,175,172,171,169,167,166,165,164,163,162,161,160,159,159,158,158,157,157,157,157,157,157,157,157,158,159,162,164,168,171,175,179,184,189,194,199,204,209,214,218,224,229,234,236,244,248,253,259,265,271,276,282,288,293,298,300,304,311,315,318,320,324,327,329,331,332,333,334,335,335,335,336,336,336,337,337,338,339,339,340,340,340,341,341,341,341,341,341,341,341,341,341,341,340,340,339,338,338,338,337,337,337,337,337,337,337,337,337,337,337,337,337,337,337,337,337,337,337,337,337,338,338,338,338,338,338,338,338];
ys = [33,34,35,37,39,41,44,46,50,52,58,62,66,70,75,79,84,90,95,101,107,114,121,127,135,142,148,155,160,163,168,172,176,179,182,185,187,190,193,195,198,200,203,206,207,209,211,212,213,214,214,214,215,215,215,215,215,215,215,215,215,215,215,215,215,215,215,215,215,216,216,217,217,218,218,219,219,219,219,219,220,220,221,221,222,222,223,223,223,223,223,223,223,223,223,223,223,224,224,224,224,224,224,224,224,224,224,224,224,223,222,221,220,218,216,215,213,210,208,205,202,199,198,195,193,191,186,185,183,179,176,174,172,169,166,163,161,157,154,153,149,147,145,143,142,139,138,137,136,136,135,135,134,134,134,134,134,134,134,134,134,134,134,135,136,137,138,139,140,142,142,144,145,147,148,150,152,154,157,159,161,164,166,170,174,175,179,182,185,186,188,191,192,194,196,197,199,200,202,204,205,206,207,208,208,209,209,209,209,209,209,209,209,209,209,209,209,209,209,209,208,208,207,206,206,206,205,205,205,205,205,205,205,205,205,205,205,205,205,205,205,205,205,205,205,205,205,205,205,204,202,198,194,188,182,176,169,160,153,146,139,131,124,118,107,101,95,89,83,77,72,70,64,61,58,56,54,53,51,50,49,48,47,45,43,41,40,39,38,37,36,36,36];
ts = [0,705,712,721,728,738,744,754,760,772,775,789,791,804,807,822,826,838,841,854,857,865,873,882,889,898,905,914,925,929,938,945,955,961,970,977,986,993,1004,1009,1019,1025,1037,1041,1049,1057,1066,1073,1082,1089,1098,1105,1114,1129,1202,1222,1922,1928,1937,1943,1955,1959,1970,1975,1986,1991,1999,2007,2015,2023,2031,2039,2048,2055,2064,2072,2080,2089,2096,2105,2112,2121,2128,2138,2144,2156,2159,2172,2176,2188,2191,2204,2207,2220,2223,2232,2240,2248,2255,2264,2271,2280,2288,2296,2306,2312,2322,2328,2338,2344,2356,2359,2372,2375,2388,2392,2403,2407,2416,2423,2432,2439,2448,2455,2464,2471,2480,2489,2496,2505,2512,2522,2528,2538,2544,2555,2560,2572,2575,2588,2592,2606,2607,2615,2623,2639,2640,2647,2656,2664,2673,2682,2688,2696,2705,2714,2721,2730,2738,2746,2755,2762,2772,2778,2788,2793,2806,2809,2821,2825,2840,2841,2855,2857,2865,2873,2882,2890,2898,2907,2913,2925,2929,2937,2945,2954,2961,2970,2978,2988,2994,3006,3010,3022,3025,3038,3041,3053,3057,3066,3073,3082,3089,3098,3105,3114,3123,3130,3138,3146,3156,3162,3172,3178,3188,3194,3205,3209,3222,3225,3238,3241,3254,3257,3266,3273,3282,3289,3298,3305,3314,3322,3330,3338,3346,3356,3372,3378,3389,3394,3405,3409,3421,3425,3437,3441,3454,3457,3466,4148,4155,4164,4171,4180,4188,4196,4205,4212,4222,4228,4241,4243,4258,4259,4275,4288,4291,4304,4307,4316,4323,4332,4339,4348,4355,4364,4372,4380,4389,4395,4404,4411,4421,4427,4438,4443,4453,4459,4470,4475,4483,4499,4515];

$(document).ready(function() {
    $("#next-button").prop("disabled",true);
    $(".submit-button").prop("disabled",true);
    $(".submit-button").click(function() {
        $(paper.canvas).off('click');
        $(".submit-button").prop("disabled",true);
        $(".instructions").html("Great, if this were a real trial your response would be saved and you would move onto the next trial. " +
            "Please click the NEXT button below.");
        $("#next-button").prop("disabled",false);
    });
    $("#next-button").click(function() {
        allow_exit();
        go_to_page("instructions/instruct-5");
    });
    $("#prev-button").click(function() {
        allow_exit();
        go_to_page("instructions/instruct-4");
    });

    add_canvas();

    $(".instructions").html("First, press ENTER to see a section of the true motion.");
    $(document).keypress(function(event) {
        if (event.which == 13) {
            $(document).off('keypress');
            $(".instructions").html("Now playing a section of the true motion.");
            replay_partial_motion(random_sections(5));

            setTimeout(
                function() {
                    show_social_information();
                }, 5500
            );
        }
    });
});

show_social_information = function() {
    $(".instructions").html("OK, now press ENTER to see the previous participant's input.");
    $(document).keypress(function(event) {
        if (event.which == 13) {
            $(document).off('keypress');
            $(".instructions").html("Now playing the previous participant's input.");
            period = 5000/(2*5 + 1);
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
    $(".instructions").html("Great, now click on the canvas and move your cursor to recreate the motion of the dot.");
    enable_drawing(true);
};

drawing_complete = function() {
    $(".instructions").html("Excellent, if you are happy with your input click the submit button below. If not, click the canvas to have another go. You can keep trying until you are happy - only your submitted response will count towards your bonus.");
    $(".submit-button").prop("disabled",false);
};
