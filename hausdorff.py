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

    # calculate the velocity of the dot at these intervals
    ts_3 = ts_2[1:]
    xs_3 = [int((xs_2[i+1] - xs_2[i])*(1000.0/float(config.get("hausdorff_interval")))) for i in range(len(xs_2)-1)]
    ys_3 = [int((ys_2[i+1] - ys_2[i])*(1000.0/float(config.get("hausdorff_interval")))) for i in range(len(ys_2)-1)]
    true_xs_3 = [int((true_xs_2[i+1] - true_xs_2[i])*(1000.0/float(config.get("hausdorff_interval")))) for i in range(len(true_xs_2)-1)]
    true_ys_3 = [int((true_ys_2[i+1] - true_ys_2[i])*(1000.0/float(config.get("hausdorff_interval")))) for i in range(len(true_ys_2)-1)]

    # calculate the hausdorff distance
    hausdorff = 0
    for x, y, t in zip(xs_3, ys_3, ts_3):
        closest = int(round(min([pow(pow(x-tx, 2) + pow(y-ty, 2) + pow((t-tt)/config.get("ms_per_px"), 2), 0.5) for tx, ty, tt in zip(true_xs_3, true_ys_3, ts_3)])))
        hausdorff += closest
    hausdorff = int(round(float(hausdorff)/(float(len(xs_3)))))

    return hausdorff
