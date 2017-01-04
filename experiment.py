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
from psiturk.psiturk_config import PsiturkConfig
from dallinger import config as dalcon
config = dalcon.experiment_configuration
cfg = PsiturkConfig()


class MotionGame(Experiment):

    def __init__(self, session):
        super(MotionGame, self).__init__(session)
        self.task = "The Motion Game"
        self.verbose = False
        self.experiment_repeats = 1

        self.initial_recruitment_size = config.generation_size

        self.trials = config.trials

        if not self.networks():
            self.setup()
        self.save()

    def setup(self):
        super(MotionGame, self).setup()
        for net in self.networks():
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

    def data_check(self, participant):

        return True

    def bonus(self, participant):

        return 0.0


class MotionGenerational(DiscreteGenerational):

    __mapper_args__ = {"polymorphic_identity": "motion_generational"}

    def add_node(self, node):
        super(MotionGenerational, self).add_node(node=node)
        node.receive()


class MotionSource(Source):
    """ A source that initializes the genes of the first generation """

    __mapper_args__ = {"polymorphic_identity": "motion_source"}

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

        Motion(origin=self, contents="init_motion")


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
        if config.allow_learning:
            if random.random() < 0.5:
                return max([int(self.contents) + random.sample([-1, 1], 1)[0], 1])
            else:
                return self.contents
        else:
            return 0


class Motion(Meme):
    """ A description of a motion """

    __mapper_args__ = {"polymorphic_identity": "motion"}


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

    def update(self, infos):
        for info in infos:
            if isinstance(info, Gene):
                self.mutate(info_in=info)

    def calculate_payoff(self):
        pass

    def calculate_fitness(self):
        pass

    def _what(self):
        return Info
