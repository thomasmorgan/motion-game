""" The Motion Game! """

from dallinger.experiments import Experiment
from dallinger.nodes import Agent, Source
from dallinger.models import Info, Participant, Network
from dallinger.networks import DiscreteGenerational
from dallinger.information import Gene, Meme
import random
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.sql.expression import cast
from sqlalchemy import Integer
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


class MotionGame(Experiment):

    def __init__(self, session):
        super(MotionGame, self).__init__(session)
        self.task = "The Motion Game"
        self.verbose = False
        self.experiment_repeats = config.get("trials")
        self.known_classes["Motion"] = Motion

        self.initial_recruitment_size = config.get("generation_size")
        self.trials = config.get("trials")

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
            source = GeneticSource(network=net)
            source.create_infos()
            source = MotionSource(network=net)
            source.create_infos()

    def create_network(self):
        """Return a new network."""
        return MotionGenerational(generations=config.get("generations"),
                                  generation_size=config.get("generation_size"),
                                  initial_source=True)

    def create_node(self, participant, network):
        """Create a node for a participant."""
        return MotionAgent(network=network, participant=participant)

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
                assert len([i for i in infos if isinstance(i, Motion)]) == 1

                # check numbers of genes
                assert len([i for i in infos if isinstance(i, Gene)]) == 2
                assert len([i for i in infos if isinstance(i, SocialGene)]) == 1
                assert len([i for i in infos if isinstance(i, AsocialGene)]) == 1

                # check numbers of received infos
                received_infos = node.received_infos()
                assert len([i for i in received_infos if isinstance(i, TrueMotion)]) == 1
                if node.generation == 0:
                    assert len([i for i in received_infos if isinstance(i, Motion)]) == 1
                else:
                    assert len([i for i in received_infos if isinstance(i, Motion)]) == 2

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
        nets = [n.id for n in Network.query.all()]
        total_points = sum([max(n.points - 20, 0) for n in participant.nodes() if n.network_id in nets])
        return round(min(float(total_points)/(20*len(nets)), 1.00)*config.get("max_bonus"), 2)

    def attention_check(self, participant):
        nets = [n.id for n in Network.query.filter_by(role="catch").all()]
        points = [n.points for n in participant.nodes() if n.network_id in nets]
        return not any([p < 20 for p in points])


class MotionGenerational(DiscreteGenerational):

    __mapper_args__ = {"polymorphic_identity": "motion_generational"}

    def __init__(self, generations, generation_size, initial_source):
        """Endow the network with some persistent properties."""

        # Follows the super, except max_size is calculated differently
        # because motion_generation networks have 2 sources, not 1.
        super(MotionGenerational, self).__init__(
            generations=generations,
            generation_size=generation_size,
            initial_source=initial_source
        )
        self.max_size = repr(generations * generation_size + 2)

    def add_node(self, node):
        """Add a node to the network."""

        #The super handles the flow of genes and social information,
        #in addition the extra code sends participants the true motion.

        super(MotionGenerational, self).add_node(node=node)
        source = self.nodes(type=MotionSource)[0]
        source.connect(node)
        source.transmit(to_whom=node)
        if node.generation > 0:
            prev_agents = MotionAgent.query\
                .filter_by(failed=False,
                           network_id=self.id,
                           generation=(node.generation - 1))\
                .all()
            parent = random.sample(prev_agents, 1)[0]
            parent.connect(whom=node)
            parent.transmit(what=Motion, to_whom=node)
        node.receive()


class MotionSource(Source):
    """ A source that initializes the genes of the first generation """

    __mapper_args__ = {"polymorphic_identity": "motion_source"}

    def _what(self):
        """Send a true motion."""
        return TrueMotion

    def create_infos(self):
        """The motion used is defined by the network id."""
        from motions import motions
        TrueMotion(origin=self, contents=json.dumps(motions[self.network_id - 1]))


class GeneticSource(Source):
    """ A source that initializes the genes of the first generation """

    __mapper_args__ = {"polymorphic_identity": "genetic_source"}

    def _what(self):
        """Send all infos (only genes available)."""
        return Info

    def create_infos(self):
        """Create initial genes, values drawn from config file."""
        if config.get("allow_social"):
            SocialGene(origin=self, contents=config.get("seed_social"))
        else:
            SocialGene(origin=self, contents=1)

        if self.network.role == "catch":
            AsocialGene(origin=self, contents=10)
        elif config.get("allow_asocial"):
            AsocialGene(origin=self, contents=config.get("seed_asocial"))
        else:
            AsocialGene(origin=self, contents=0)


class AsocialGene(Gene):
    """ A gene that controls how much asocial info you get """

    __mapper_args__ = {"polymorphic_identity": "asocial_gene"}

    def _mutated_contents(self):
        """Asocial gene does not mutate."""
        if config.get("allow_asocial"):
            if random.random() < 0:
                return min(max([int(self.contents) + random.sample([-1, 1], 1)[0], 1]), 10)
            else:
                return self.contents
        else:
            return 0


class SocialGene(Gene):
    """ A gene that controls how much social info you get """

    __mapper_args__ = {"polymorphic_identity": "social_gene"}

    def _mutated_contents(self):
        """Social gene mutates by incrementing or decrementing by 1."""
        if config.get("allow_social"):
            if random.random() < 0.5:
                return max([int(self.contents) + random.sample([-1, 1], 1)[0], 1])
            else:
                return self.contents
        else:
            return 0


class Motion(Meme):
    """ A description of a motion """

    __mapper_args__ = {"polymorphic_identity": "motion"}


class TrueMotion(Motion):
    """ A descrition of a true motion """

    __mapper_args__ = {"polymorphic_identity": "true_motion"}


class MotionAgent(Agent):

    __mapper_args__ = {"polymorphic_identity": "motion_agent"}

    @hybrid_property
    def generation(self):
        return int(self.property2)

    @generation.setter
    def generation(self, generation):
        self.property2 = repr(generation)

    @generation.expression
    def generation(self):
        return cast(self.property2, Integer)

    @hybrid_property
    def error(self):
        return int(self.property3)

    @error.setter
    def error(self, error):
        self.property3 = repr(error)

    @error.expression
    def error(self):
        return cast(self.property3, Integer)

    @hybrid_property
    def points(self):
        try:
            return int(self.property4)
        except:
            return None

    @points.setter
    def points(self, points):
        self.property4 = repr(points)

    @points.expression
    def points(self):
        return cast(self.property4, Integer)

    def calculate_fitness(self):
        """Calculate the fitness of the node."""

        # For each node you get the submitted motion and caluclate its
        # distance from the true motion at intervals of 100ms
        # Error is the sum of these distances.
        # At each measurement the participant gains (100-error) points.
        # absolute max points is 5100
        # Fitness is the square of all points earned minus the cost of the social gene

        motion = self.infos(type=Motion)[0]
        contents = json.loads(motion.contents)

        xs = contents["xs"]
        ys = contents["ys"]
        ts = contents["ts"]

        dat = json.loads(motion.property1)

        true_xs = dat["true_xs"]
        true_ys = dat["true_ys"]
        true_ts = dat["true_ts"]

        total_error = 0
        points = 0

        for i in range(0, 5001, 100):
            try:
                ii = next(t[0] for t in enumerate(ts) if t[1] > i) - 1
            except:
                ii = -1
            x = xs[ii]
            y = ys[ii]

            try:
                ii = next(t[0] for t in enumerate(true_ts) if t[1] > i) - 1
            except:
                ii = -1
            true_x = true_xs[ii]
            true_y = true_ys[ii]

            error = int(pow(float(pow((x-true_x), 2) + pow((y-true_y), 2)), 0.5))
            total_error += error
            if error < 150:
                points += 1

        social = int(self.infos(type=SocialGene)[0].contents)

        self.error = total_error
        self.points = points
        self.fitness = pow(max(points - social*config.get("social_cost"), 0), 2)

    def _what(self):
        """Transmit all infos - genes and submitted motion."""
        return Gene

    def update(self, infos):
        """Mutate genes."""
        for info in infos:
            if isinstance(info, Gene):
                self.mutate(info_in=info)

extra_routes = Blueprint(
    'extra_routes', __name__,
    template_folder='templates',
    static_folder='static')


@extra_routes.route("/points/<int:participant_id>", methods=["GET"])
def current_points(participant_id):

    nodes = MotionAgent.query.filter_by(participant_id=participant_id).all()
    total_points = sum([n.points for n in nodes if n.points is not None])

    data = {"status": "success",
            "points": total_points}
    return Response(json.dumps(data), status=200, mimetype='application/json')
