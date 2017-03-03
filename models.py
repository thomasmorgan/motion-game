from dallinger.nodes import Agent, Source
from dallinger.models import Info
from dallinger.networks import DiscreteGenerational
from dallinger.information import Gene, Meme
import random
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.sql.expression import cast
from sqlalchemy import Integer
from dallinger.config import get_config
config = get_config()
import json


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

        # load the two trajectories
        motion = self.infos(type=Motion)[0]
        contents = json.loads(motion.contents)

        xs = contents["xs"]
        ys = contents["ys"]
        ts = contents["ts"]

        dat = json.loads(motion.property1)

        true_xs = dat["true_xs"]
        true_ys = dat["true_ys"]
        true_ts = dat["true_ts"]

        import hausdorff
        hd = hausdorff.hausdorff(xs, ys, ts, true_xs, true_ys, true_ts)

        # save the results
        self.error = hd
        self.points = int(round(max(0, 100-round(hd/4))))
        social = int(self.infos(type=SocialGene)[0].contents)
        self.fitness = pow(max(self.points - social*config.get("social_cost"), 0), 2)

    def _what(self):
        """Transmit all infos - genes and submitted motion."""
        return Gene

    def update(self, infos):
        """Mutate genes."""
        for info in infos:
            if isinstance(info, Gene):
                self.mutate(info_in=info)
