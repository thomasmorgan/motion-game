""" The Motion Game! """

from dallinger.experiments import Experiment
from dallinger.models import Participant, Network
from dallinger.config import get_config
config = get_config()
import json
from flask import Blueprint, Response


def extra_parameters():
    config.register('generation_size', int)
    config.register('generations', int)
    config.register('trials', int)
    config.register('social_cost', float)
    config.register('asocial_cost', float)
    config.register('allow_social', bool)
    config.register('allow_asocial', bool)
    config.register('seed_social', int)
    config.register('seed_asocial', int)
    config.register('max_bonus', float)
    config.register('bonus_denominator', int)
    config.register('max_error', int)
    config.register('ms_per_px', int)
    config.register('hausdorff_interval', int)


class MotionGame(Experiment):

    def __init__(self, session):
        super(MotionGame, self).__init__(session)
        import models
        self.models = models
        self.task = "The Motion Game"
        self.verbose = False
        self.experiment_repeats = config.get("trials")
        self.known_classes["Motion"] = self.models.Motion
        self.initial_recruitment_size = config.get("generation_size")
        self.trials = config.get("trials")
        self.bonus_denominator = config.get("bonus_denominator")
        self.max_error = config.get("max_error")
        self.ms_per_px = config.get("ms_per_px")

        if not self.networks():
            self.setup()
        self.save()

    def setup(self):
        """ Create the networks. """
        # each network has 2 sources, one for genes, one for the motion
        super(MotionGame, self).setup()
        for net in self.networks():
            if net.id in [1, 2]:
                net.role = "catch"
            source = self.models.GeneticSource(network=net)
            source.create_infos()
            source = self.models.MotionSource(network=net)
            source.create_infos()

    def create_network(self):
        """Return a new network."""
        return self.models.MotionGenerational(generations=config.get("generations"),
                                              generation_size=config.get("generation_size"),
                                              initial_source=True)

    def create_node(self, participant, network):
        """Create a node for a participant."""
        return self.models.MotionAgent(network=network, participant=participant)

    def recruit(self):
        """Recruit participants if necessary."""
        num_approved = len(Participant.query.filter_by(status="approved").all())
        if num_approved % config.get("generation_size") == 0 and num_approved < config.get("generations")*config.get("generation_size"):
            self.log("generation finished, recruiting another")
            self.recruiter().recruit_participants(n=config.get("generation_size"))

    def info_post_request(self, node, info):
        """Whenever a info is submitted, calculate the fitness of the node."""
        node.calculate_fitness()

    def data_check(self, participant):
        """Check participants data is ok."""
        try:
            # check number of nodes
            nodes = participant.nodes()
            assert len(nodes) == self.trials

            for node in nodes:
                # check all nodes have an error and a fitness
                assert isinstance(node.error, int)
                assert isinstance(node.fitness, float)

                infos = node.infos()

                # check number of motions
                assert len([i for i in infos if isinstance(i, self.models.Motion)]) == 1

                # check numbers of genes
                assert len([i for i in infos if isinstance(i, self.models.Gene)]) == 2
                assert len([i for i in infos if isinstance(i, self.models.SocialGene)]) == 1
                assert len([i for i in infos if isinstance(i, self.models.AsocialGene)]) == 1

                # check numbers of received infos
                received_infos = node.received_infos()
                assert len([i for i in received_infos if isinstance(i, self.models.TrueMotion)]) == 1
                if node.generation == 0:
                    assert len([i for i in received_infos if isinstance(i, self.models.Motion)]) == 1
                else:
                    assert len([i for i in received_infos if isinstance(i, self.models.Motion)]) == 2

            return True
        except:
            # If any of the checks fail, print the error and return False.
            import traceback
            traceback.print_exc()
            try:
                print nodes
                print node
                print infos
                print received_infos
                print node.generation
            except:
                pass
            return False

    def bonus(self, participant):
        """Calculate the bonus payment for participants."""
        total_points = sum([n.points for n in participant.nodes()])
        return round(min(float(total_points)/(config.bonus_denominator*self.trials), 1.00)*config.get("max_bonus"), 2)

    def attention_check(self, participant):
        nets = [n.id for n in Network.query.filter_by(role="catch").all()]
        points = [n.points for n in participant.nodes() if n.network_id in nets]
        return not any([p < 40 for p in points])


extra_routes = Blueprint(
    'extra_routes', __name__,
    template_folder='templates',
    static_folder='static')


@extra_routes.route("/points/<int:participant_id>", methods=["GET"])
def current_points(participant_id):

    import models
    nodes = models.MotionAgent.query.filter_by(participant_id=participant_id).all()
    total_points = sum([n.points for n in nodes if n.points is not None])
    data = {"status": "success",
            "points": total_points}
    return Response(json.dumps(data), status=200, mimetype='application/json')


@extra_routes.route("/hausdorff", methods=["GET"])
def get_hausdorff():
    from flask import request
    data = request.values["input"]
    contents = json.loads(data)

    xs = contents["xs"]
    ys = contents["ys"]
    ts = contents["ts"]
    true_xs = contents["true_xs"]
    true_ys = contents["true_ys"]
    true_ts = contents["true_ts"]

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
    xs_3 = [xs_2[i+1] - xs_2[i] for i in range(len(xs_2)-1)]
    ys_3 = [ys_2[i+1] - ys_2[i] for i in range(len(ys_2)-1)]
    true_xs_3 = [true_xs_2[i+1] - true_xs_2[i] for i in range(len(true_xs_2)-1)]
    true_ys_3 = [true_ys_2[i+1] - true_ys_2[i] for i in range(len(true_ys_2)-1)]

    # calculate the hausdorff distance
    hausdorff = 0
    for x, y, t in zip(xs_3, ys_3, ts_3):
        closest = int(round(min([pow(pow(x-tx, 2) + pow(y-ty, 2) + pow((t-tt)/config.get("ms_per_px"), 2), 0.5) for tx, ty, tt in zip(true_xs_3, true_ys_3, ts_3)])))
        if closest > hausdorff:
            hausdorff = closest

    data = {"status": "success",
            "hausdorff": hausdorff}
    return Response(json.dumps(data), status=200, mimetype='application/json')
