""" The Motion Game! """

from dallinger.experiments import Experiment
from dallinger.nodes import Agent, Source
from dallinger.models import Info, Participant
from dallinger.networks import DiscreteGenerational
from dallinger.information import Gene, Meme
import random
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.sql.expression import cast
from sqlalchemy import Integer
from dallinger import config as dalcon
import json
config = dalcon.experiment_configuration


class MotionGame(Experiment):

    def __init__(self, session):
        super(MotionGame, self).__init__(session)
        self.task = "The Motion Game"
        self.verbose = False
        self.experiment_repeats = 10
        self.known_classes["Motion"] = Motion

        self.initial_recruitment_size = config.generation_size
        self.trials = config.trials

        if not self.networks():
            self.setup()
        self.save()

    def setup(self):
        super(MotionGame, self).setup()
        for net in self.networks():
            source = GeneticSource(network=net)
            source.create_infos()
            source = MotionSource(network=net)
            source.create_infos()

    def create_network(self):
        """Return a new network."""
        return MotionGenerational(generations=config.generations,
                                  generation_size=config.generation_size,
                                  initial_source=True)

    def create_node(self, participant, network):
        """Create a node for a participant."""
        return MotionAgent(network=network, participant=participant)

    def recruit(self):
        """Recruit participants if necessary."""
        num_approved = len(Participant.query.filter_by(status="approved").all())
        if num_approved % config.generation_size == 0 and num_approved < config.generations*config.generation_size:
            self.log("generation finished, recruiting another")
            self.recruiter().recruit_participants(n=config.generation_size)

    def info_post_request(self, node, info):
        node.calculate_fitness()

    def data_check(self, participant):

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
            import traceback
            traceback.print_exc()
            return False

    def bonus(self, participant):

        total_error = sum([n.error for n in participant.nodes()])

        return max(round(1.0 - float(total_error)/(10000.0*config.trials), 2), 0.00)


class MotionGenerational(DiscreteGenerational):

    __mapper_args__ = {"polymorphic_identity": "motion_generational"}

    def __init__(self, generations, generation_size, initial_source):
        """Endow the network with some persistent properties."""
        self.property1 = repr(generations)
        self.property2 = repr(generation_size)
        self.property3 = repr(initial_source)
        self.max_size = repr(generations * generation_size + 2)

    def add_node(self, node):
        super(MotionGenerational, self).add_node(node=node)
        source = self.nodes(type=MotionSource)[0]
        source.connect(node)
        source.transmit(to_whom=node)
        node.receive()


class MotionSource(Source):
    """ A source that initializes the genes of the first generation """

    __mapper_args__ = {"polymorphic_identity": "motion_source"}

    def _what(self):
        return TrueMotion

    def create_infos(self):
        from motions import motions
        TrueMotion(origin=self, contents=json.dumps(motions[self.network_id - 1]))


class GeneticSource(Source):
    """ A source that initializes the genes of the first generation """

    __mapper_args__ = {"polymorphic_identity": "genetic_source"}

    def _what(self):
        return Info

    def create_infos(self):
        if config.allow_social:
            SocialGene(origin=self, contents=config.seed_social)
        else:
            SocialGene(origin=self, contents=1)

        if config.allow_asocial:
            AsocialGene(origin=self, contents=config.seed_asocial)
        else:
            AsocialGene(origin=self, contents=0)


class AsocialGene(Gene):
    """ A gene that controls how much asocial info you get """

    __mapper_args__ = {"polymorphic_identity": "asocial_gene"}

    def _mutated_contents(self):
        if config.allow_asocial:
            if random.random() < 0:
                return max([int(self.contents) + random.sample([-1, 1], 1)[0], 1])
            else:
                return self.contents
        else:
            return 0


class SocialGene(Gene):
    """ A gene that controls how much social info you get """

    __mapper_args__ = {"polymorphic_identity": "social_gene"}

    def _mutated_contents(self):
        if config.allow_social:
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

    def calculate_fitness(self):
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
            points += max(100-error, 0)

        self.error = total_error
        self.fitness = pow(points, 2)

    def _what(self):
        return Info

    def update(self, infos):
        for info in infos:
            if isinstance(info, Motion):
                pass
            elif isinstance(info, Gene):
                self.mutate(info_in=info)
