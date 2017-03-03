from dallinger.config import get_config
config = get_config()


def hausdorff(xs, ys, ts, true_xs, true_ys, true_ts):

    # calculate the location of the dot at evenly spaced intervals
    ts_2 = range(0, 5000, config.get("hausdorff_interval"))
    xs_2 = []
    ys_2 = []
    true_xs_2 = []
    true_ys_2 = []

    for t in ts_2:
        index = len(ts) - 1 - [time <= t for time in ts][::-1].index(True)
        xs_2.append(xs[index])
        ys_2.append(ys[index])

        index = len(true_ts) - 1 - [time <= t for time in true_ts][::-1].index(True)
        true_xs_2.append(true_xs[index])
        true_ys_2.append(true_ys[index])

    # calculate the *average* hausdorff distance
    hausdorff = 0
    for x, y, t in zip(xs_2, ys_2, ts_2):
        closest = int(round(min([pow(pow(x-tx, 2) + pow(y-ty, 2) + pow((t-tt)/config.get("ms_per_px"), 2), 0.5) for tx, ty, tt in zip(true_xs_2, true_ys_2, ts_2)])))
        hausdorff += closest
    hausdorff = int(round(float(hausdorff)/(float(len(xs_2)))))

    # work out length of user input and true length
    length = 0
    for i in range(len(xs)-1):
        length += pow(pow(xs[i+1]-xs[i], 2) + pow(ys[i+1]-ys[i], 2), 0.5)
    true_length = 0
    for i in range(len(true_xs)-1):
        true_length += pow(pow(true_xs[i+1]-true_xs[i], 2) + pow(true_ys[i+1]-true_ys[i], 2), 0.5)

    # increase error if lengths are divergent
    hausdorff = float(hausdorff)*(max([length, true_length])/float(min([length, true_length])))

    # arbitrary scaling
    hausdorff = int(round(hausdorff*4))

    return hausdorff
