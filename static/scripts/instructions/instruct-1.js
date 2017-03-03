visible_sections = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
true_xs = [13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 12, 12, 12, 12, 12, 12, 12, 12, 12, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 13, 15, 16, 18, 20, 26, 29, 33, 37, 41, 46, 50, 55, 59, 64, 68, 74, 79, 85, 91, 98, 103, 110, 117, 122, 128, 133, 138, 144, 149, 154, 159, 164, 168, 172, 176, 180, 186, 191, 196, 201, 207, 213, 219, 224, 231, 236, 242, 247, 252, 257, 262, 267, 272, 273, 278, 284, 287, 305, 309, 313, 318, 321, 325, 327, 330, 334, 336, 339, 342, 344, 347, 350, 351, 353, 355, 357, 359, 361, 363, 364, 366, 368, 369, 371, 372, 373, 374, 374, 375, 376, 376, 376, 377, 377, 377, 377, 378, 378, 378, 378, 378, 378, 378, 379, 380, 381, 382, 382, 383, 384, 384, 384, 384, 385, 385, 385, 385, 385, 385, 386, 386, 386, 386, 387, 387, 387, 387, 387, 387, 387, 387, 387, 387, 387, 387, 387, 387, 387, 387, 387, 387, 387, 387, 387, 387, 386, 386, 386, 386, 386, 385, 385, 385, 384, 384, 384, 384, 384, 384, 383, 383, 383, 383, 383, 383, 383, 383, 383, 382, 382, 382, 382, 382, 382, 382, 382, 382, 382, 381, 380, 379, 376, 373, 371, 368, 365, 362, 357, 354, 350, 346, 341, 336, 332, 327, 322, 317, 313, 307, 303, 298, 294, 289, 284, 280, 275, 271, 266, 262, 258, 255, 251, 247, 244, 240, 237, 233, 229, 226, 223, 220, 217, 214, 211, 208, 205, 202, 200, 197, 194, 193, 191, 190, 189, 187, 186, 186, 186, 186, 186, 186, 186, 186, 186, 186, 186, 187, 188, 189, 191, 193, 194, 197, 199, 201, 204, 206, 209, 212, 215, 218, 221, 223, 226, 228, 231, 234, 236, 239, 241, 244, 247, 250, 253, 256, 260, 263, 266, 270, 273, 276, 279, 282, 286, 289, 292, 296, 299, 302, 305, 308, 312, 315, 319, 321, 325, 328, 329, 334, 335, 338, 340, 342, 344, 346, 347, 349, 351, 352, 353, 354, 355, 356, 358, 358, 359, 359, 360, 361, 361, 362, 363, 363, 364, 364, 365, 366, 367];
true_ys = [23, 25, 28, 32, 37, 42, 49, 55, 62, 68, 74, 81, 83, 91, 93, 98, 102, 105, 108, 114, 116, 119, 123, 128, 130, 133, 137, 139, 142, 145, 146, 149, 150, 152, 154, 156, 157, 159, 161, 162, 164, 166, 168, 170, 171, 173, 175, 178, 180, 182, 184, 185, 186, 188, 188, 189, 190, 190, 191, 191, 192, 192, 193, 193, 194, 194, 195, 196, 196, 197, 197, 197, 198, 198, 199, 199, 199, 199, 199, 198, 198, 197, 197, 197, 197, 197, 197, 197, 197, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 209, 211, 211, 212, 213, 213, 214, 214, 215, 215, 215, 215, 215, 215, 215, 215, 215, 215, 215, 214, 214, 213, 212, 211, 210, 210, 209, 208, 208, 207, 206, 205, 202, 201, 201, 200, 200, 198, 198, 197, 197, 196, 196, 195, 195, 194, 194, 193, 193, 193, 192, 192, 192, 192, 192, 192, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 191, 192, 194, 196, 198, 202, 206, 211, 217, 222, 228, 235, 240, 245, 247, 252, 260, 262, 266, 270, 273, 278, 283, 285, 287, 290, 293, 296, 298, 300, 303, 305, 307, 310, 313, 316, 318, 321, 324, 325, 327, 329, 331, 333, 334, 336, 337, 338, 340, 341, 342, 344, 345, 346, 348, 349, 351, 353, 354, 355, 356, 357, 358, 358, 358, 359, 359, 359, 360, 360, 361, 361, 362, 362, 363, 364, 364, 365, 365, 365, 365, 365, 365, 365, 365, 365, 365, 365, 365, 365, 364, 363, 361, 360, 358, 357, 355, 354, 352, 350, 348, 346, 344, 342, 339, 336, 334, 331, 328, 325, 322, 319, 316, 313, 309, 306, 302, 299, 295, 291, 288, 285, 282, 279, 276, 273, 269, 265, 261, 257, 253, 248, 244, 241, 238, 235, 230, 226, 222, 218, 214, 210, 208, 202, 198, 194, 192, 187, 185, 181, 180, 176, 173, 170, 167, 164, 161, 158, 155, 151, 148, 145, 143, 140, 137, 134, 130, 127, 124, 121, 117, 114, 110, 106, 103, 99, 96, 93, 90, 87, 84, 81, 79, 77, 74, 71, 69, 67, 64, 62, 60, 58, 56, 53, 52, 49, 48, 46, 44, 43, 41, 40, 39, 38, 37, 36, 35, 34, 34, 33, 32, 32, 31, 31, 31, 30, 30, 30, 30, 30, 30, 30, 30, 30, 31, 31, 31, 31, 31, 31];
true_ts = [0, 242, 249, 257, 266, 274, 282, 290, 298, 307, 313, 323, 330, 339, 345, 355, 361, 369, 377, 385, 393, 401, 409, 417, 425, 433, 441, 450, 457, 466, 473, 482, 490, 497, 507, 514, 523, 530, 539, 546, 554, 561, 570, 577, 586, 593, 602, 609, 617, 625, 634, 641, 650, 657, 665, 673, 682, 691, 698, 706, 713, 723, 730, 739, 746, 756, 761, 769, 777, 786, 793, 802, 809, 818, 825, 1118, 1126, 1134, 1141, 1150, 1158, 1166, 1174, 1181, 1191, 1199, 1207, 1214, 1224, 1230, 1240, 1247, 1258, 1263, 1274, 1279, 1290, 1295, 1303, 1311, 1320, 1327, 1336, 1343, 1351, 1359, 1368, 1375, 1383, 1391, 1400, 1407, 1415, 1423, 1431, 1440, 1448, 1457, 1463, 1474, 1480, 1489, 1495, 1503, 1511, 1519, 1527, 1538, 1543, 1551, 1559, 1569, 1575, 1583, 1624, 1631, 1641, 1647, 1658, 1663, 1674, 1679, 1689, 1695, 1704, 1711, 1720, 1727, 1736, 1743, 1752, 1759, 1768, 1775, 1784, 1791, 1799, 1808, 1815, 1823, 1831, 1839, 1848, 1857, 1863, 1873, 1879, 1889, 1984, 2008, 2015, 2024, 2041, 2048, 2057, 2079, 2394, 2402, 2409, 2417, 2425, 2433, 2442, 2449, 2458, 2465, 2475, 2481, 2491, 2498, 2507, 2513, 2524, 2530, 2539, 2545, 2553, 2561, 2570, 2577, 2586, 2593, 2602, 2609, 2617, 2625, 2634, 2642, 2650, 2658, 2666, 2673, 2681, 2690, 2697, 2707, 2713, 2725, 2729, 2739, 2745, 2753, 2761, 2769, 2777, 2786, 2793, 2802, 2809, 2817, 2825, 2834, 2841, 2849, 2857, 2866, 2874, 2882, 2890, 2897, 2907, 2913, 2923, 2930, 2939, 2945, 2953, 2961, 2970, 2977, 2985, 2993, 3001, 3009, 3018, 3476, 3483, 3491, 3499, 3507, 3515, 3523, 3532, 3540, 3547, 3556, 3563, 3573, 3579, 3589, 3596, 3603, 3611, 3619, 3627, 3635, 3643, 3652, 3659, 3668, 3675, 3683, 3691, 3700, 3707, 3715, 3725, 3732, 3740, 3748, 3757, 3764, 3773, 3779, 3789, 3795, 3803, 3811, 3819, 3828, 3836, 3843, 3851, 3859, 3867, 3875, 3884, 3892, 3900, 3907, 3916, 3924, 3931, 3940, 3948, 3957, 3963, 3973, 3979, 3990, 3995, 4003, 4011, 4019, 4027, 4036, 4043, 4051, 4059, 4068, 4075, 4083, 4091, 4100, 4107, 4115, 4124, 4132, 4141, 4147, 4157, 4164, 4174, 4179, 4189, 4197, 4207, 4213, 4223, 4229, 4237, 4245, 4253, 4261, 4269, 4278, 4286, 4293, 4302, 4309, 4318, 4325, 4334, 4341, 4350, 4357, 4365, 4374, 4382, 4390, 4398, 4407, 4413, 4423, 4431, 4437, 4445, 4453, 4461, 4469, 4477, 4485, 4493, 4502, 4509, 4517, 4525, 4534, 4541, 4549, 4557, 4566, 4574, 4582, 4591, 4598, 4608, 4614, 4623, 4629, 4639, 4645, 4653, 4661, 4670];
social_xs = undefined;
social_ys = undefined;
social_ts = undefined;

$(document).ready(function() {
    $("#next-button").click(function() {
        allow_exit();
        go_to_page("instructions/instruct-2");
    });
    reqwest({
        url: "/experiment/max_error",
        method: 'get',
        type: 'json',
        success: function (resp) {
            max_error = resp.max_error;
        }
    });
    reqwest({
        url: "/experiment/ms_per_px",
        method: 'get',
        type: 'json',
        success: function (resp) {
            ms_per_px = resp.ms_per_px;
        }
    });
    reqwest({
        url: "/experiment/bonus_denominator",
        method: 'get',
        type: 'json',
        success: function (resp) {
            bonus_denominator = resp.bonus_denominator;
        },
        error: function (err) {
            create_agent();
        }
    });
    $("#next-button").prop("disabled",true);
    $(".submit-button").prop("disabled",true);
    $(".replay-button").prop("disabled",true);
    add_canvas();
});

save_input = function() {
    input = {
        xs: xs,
        ys: ys,
        ts: ts,
        true_xs: true_xs,
        true_ys: true_ys,
        true_ts: true_ts
    };
    input = JSON.stringify(input);

    reqwest({
        url: "/hausdorff",
        method: 'get',
        data: {
            input: input,
        },
        success: function (resp) {
            hausdorff = resp.hausdorff;
            error = hausdorff;
            points = Math.max(0, 100-Math.round(hausdorff/5));

            bonus = Math.max(Math.min(((points)/bonus_denominator)*2.50, 2.50), 0.00).toFixed(2);
            $(".bonus").html("At this level of performance your bonus would be $" + bonus + ".");
            if (points < 70) {
                $(".feedback").html("You scored " + points + "/100. Please try again.");
            } else {
                $(".feedback").html("You scored " + points + "/100. Use the Next button to continue or keep practicing.");
                $("#next-button").prop("disabled",false);
            }
            enable_buttons();
        },
        error: function (err) {
            create_agent();
        }
    });
};