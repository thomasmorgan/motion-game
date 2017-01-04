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
        self.experiment_repeats = 1

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

    def data_check(self, participant):

        return True

    def bonus(self, participant):

        return 0.0


class MotionGenerational(DiscreteGenerational):

    __mapper_args__ = {"polymorphic_identity": "motion_generational"}

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
        motions = [
            {
                "xs": [26, 26, 26, 28, 31, 35, 39, 42, 45, 48, 50, 55, 57, 58, 62, 63, 65, 67, 69, 70, 71, 74, 74, 76, 78, 79, 82, 83, 86, 88, 90, 92, 95, 98, 101, 104, 106, 109, 112, 114, 117, 120, 123, 126, 129, 133, 136, 139, 143, 146, 149, 153, 156, 159, 162, 165, 168, 171, 173, 176, 179, 182, 185, 188, 191, 194, 197, 200, 203, 206, 209, 212, 215, 217, 220, 223, 225, 228, 229, 232, 234, 236, 239, 242, 244, 248, 251, 253, 256, 258, 261, 263, 266, 268, 271, 274, 277, 280, 283, 286, 289, 292, 295, 298, 300, 303, 305, 307, 309, 310, 314, 315, 318, 320, 321, 323, 325, 327, 330, 332, 334, 336, 338, 340, 341, 343, 345, 346, 347, 349, 350, 350, 351, 352, 352, 353, 353, 353, 353, 352, 350, 349, 347, 345, 344, 342, 342, 341, 340, 339, 339, 339, 339, 339, 339, 339, 339, 339, 339, 340, 341, 342, 343, 344, 344, 345, 346, 346, 347, 347, 348, 348, 348, 349, 349, 349, 349, 350, 350, 350, 350, 350, 350, 351, 351, 351, 351, 351, 351, 351, 350, 349, 347, 345, 341, 339, 336, 332, 328, 324, 320, 315, 311, 306, 301, 296, 291, 286, 281, 277, 271, 267, 263, 260, 257, 254, 251, 250, 248, 246, 244, 243, 241, 241, 240, 239, 238, 238, 237, 237, 237, 236, 236, 236, 236, 236, 236, 236, 236, 236, 236, 236, 236, 236, 236, 236, 236, 237, 239, 241, 242, 244, 249, 250, 253, 255, 258, 261, 264, 268, 270, 274, 276, 279, 283, 287, 290, 294, 297, 300, 303, 306, 309, 312, 315, 317, 320, 322, 325, 327, 330, 333, 335, 338, 341, 344, 346, 349, 352, 355, 356, 358, 360, 362, 363, 364, 364, 365, 365, 366, 366, 366, 366, 364, 362, 360, 357, 354, 350, 345, 340, 334, 323, 316, 308, 299, 290, 280, 270, 260, 250, 240, 230, 219, 209, 198, 190, 181, 173, 166, 158, 151, 144, 138, 135, 130, 125, 121, 118, 115, 114, 110, 109, 108, 106, 105, 104, 104, 102, 102, 101, 101, 100, 100, 100, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 101, 102, 104, 106, 107, 109, 112, 114, 117, 122, 124, 128, 132, 135, 139, 141, 145, 146, 149, 152, 153, 155, 156, 158, 159, 161, 162, 163, 165, 166, 167, 168, 169, 170, 171, 171, 172, 173, 174, 174, 175, 175, 176, 176, 176, 177, 177, 177, 177, 175, 173, 170, 167, 164, 161, 157, 154, 149, 145, 141, 136, 132, 128, 124, 121, 118, 115, 113, 111, 110, 106, 105, 103, 102, 100, 98, 96, 94, 93, 90, 88, 87, 86, 84, 83, 82],
                "ys": [375, 374, 373, 369, 366, 363, 360, 357, 354, 351, 350, 347, 345, 344, 341, 340, 339, 338, 336, 335, 333, 331, 330, 329, 327, 326, 324, 323, 321, 320, 318, 317, 314, 312, 310, 307, 304, 301, 298, 294, 291, 288, 284, 281, 278, 275, 272, 269, 265, 262, 259, 256, 252, 249, 246, 242, 238, 235, 231, 228, 224, 220, 216, 212, 209, 205, 201, 197, 193, 189, 185, 180, 176, 172, 168, 165, 161, 158, 155, 151, 148, 143, 140, 135, 132, 127, 124, 120, 116, 114, 110, 107, 104, 102, 99, 96, 93, 90, 87, 84, 81, 78, 75, 72, 69, 66, 63, 61, 58, 57, 54, 52, 50, 48, 46, 44, 42, 40, 38, 36, 35, 33, 31, 30, 29, 27, 26, 24, 23, 22, 22, 21, 20, 20, 20, 19, 19, 19, 21, 23, 25, 27, 30, 32, 35, 38, 40, 42, 45, 48, 51, 53, 57, 59, 62, 67, 70, 72, 74, 77, 79, 81, 83, 85, 86, 88, 88, 89, 91, 91, 92, 93, 93, 94, 95, 95, 96, 96, 97, 98, 99, 100, 100, 101, 101, 101, 102, 102, 103, 103, 103, 104, 104, 105, 105, 105, 105, 105, 105, 105, 104, 102, 99, 96, 93, 90, 86, 83, 80, 77, 74, 71, 68, 66, 64, 61, 58, 58, 56, 53, 51, 49, 45, 44, 42, 40, 39, 38, 37, 36, 36, 35, 35, 35, 35, 35, 36, 36, 37, 39, 41, 43, 47, 49, 52, 57, 60, 64, 68, 73, 79, 85, 95, 99, 105, 112, 120, 126, 133, 145, 152, 161, 165, 173, 181, 187, 193, 198, 204, 207, 212, 215, 219, 222, 225, 228, 231, 235, 238, 240, 243, 246, 248, 251, 254, 257, 259, 262, 265, 268, 269, 271, 273, 274, 275, 276, 276, 277, 277, 277, 277, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 278, 275, 273, 270, 266, 262, 257, 252, 246, 239, 232, 225, 217, 210, 202, 194, 187, 179, 172, 163, 155, 148, 140, 136, 130, 125, 119, 114, 111, 109, 102, 100, 98, 93, 89, 86, 84, 79, 77, 74, 71, 69, 67, 66, 65, 64, 64, 64, 63, 63, 63, 62, 63, 63, 65, 68, 71, 73, 76, 79, 84, 87, 90, 94, 100, 105, 110, 115, 121, 128, 135, 144, 151, 159, 169, 179, 187, 197, 206, 216, 224, 231, 239, 245, 250, 256, 261, 266, 276, 280, 286, 292, 298, 302, 304, 310, 311, 314, 318, 320, 323, 325, 328, 331, 334, 335, 337, 339, 341, 343, 343, 345, 346, 346, 347, 348, 348, 349, 350, 350, 351, 351, 351, 352, 352, 353, 353, 353, 353, 353, 352, 350, 348, 346, 343, 341, 338, 334, 331, 326, 322, 318, 314, 310, 306, 303, 299, 296, 294, 290, 287, 284, 281, 278, 276, 271, 268, 264, 260, 257, 255, 253, 250, 248, 246],
                "ts": [0, 263, 270, 278, 288, 294, 305, 309, 321, 328, 337, 342, 354, 360, 370, 377, 387, 392, 404, 408, 419, 424, 438, 440, 447, 455, 464, 471, 479, 487, 495, 503, 511, 519, 527, 535, 545, 553, 560, 570, 576, 587, 592, 603, 608, 620, 624, 636, 640, 648, 656, 665, 671, 680, 689, 696, 706, 712, 721, 728, 738, 743, 753, 761, 770, 776, 787, 792, 804, 808, 820, 824, 836, 839, 853, 855, 864, 872, 880, 888, 897, 904, 912, 920, 928, 937, 944, 957, 960, 972, 976, 989, 992, 1005, 1008, 1020, 1024, 1036, 1040, 1048, 1056, 1065, 1072, 1081, 1088, 1096, 1104, 1112, 1120, 1128, 1137, 1145, 1153, 1160, 1171, 1176, 1186, 1192, 1204, 1210, 1219, 1224, 1238, 1242, 1254, 1258, 1270, 1274, 1286, 1289, 1298, 1306, 1315, 1322, 1330, 1338, 1346, 1354, 1956, 1963, 1971, 1979, 1987, 1995, 2003, 2011, 2019, 2027, 2036, 2043, 2052, 2061, 2070, 2076, 2087, 2092, 2104, 2108, 2120, 2124, 2136, 2140, 2148, 2156, 2164, 2172, 2180, 2188, 2196, 2204, 2212, 2221, 2229, 2237, 2244, 2254, 2260, 2270, 2276, 2287, 2292, 2304, 2307, 2320, 2324, 2336, 2339, 2349, 2355, 2365, 2381, 2388, 2396, 2404, 2412, 2421, 2428, 2436, 2443, 2453, 2459, 2469, 2475, 2486, 2491, 2502, 2507, 2519, 2523, 2531, 2540, 2548, 2556, 2565, 2572, 2581, 2588, 2596, 2604, 2612, 2621, 2628, 2637, 2645, 2654, 2660, 2672, 2677, 2686, 2692, 2704, 2708, 2720, 2724, 2805, 2828, 2836, 2845, 2853, 2860, 2871, 2876, 2887, 2892, 2904, 2908, 2920, 2924, 2936, 2940, 2948, 2956, 2965, 2972, 2986, 2990, 2998, 3006, 3014, 3022, 3030, 3039, 3046, 3055, 3062, 3070, 3078, 3087, 3095, 3105, 3110, 3121, 3126, 3137, 3142, 3154, 3157, 3170, 3174, 3186, 3189, 3198, 3206, 3214, 3222, 3230, 3239, 3246, 3255, 3262, 3272, 3278, 3287, 3294, 3304, 3311, 3320, 3326, 3337, 3342, 3358, 3374, 3423, 3432, 3438, 3445, 3453, 3461, 3469, 3478, 3486, 3493, 3502, 3509, 3520, 3525, 3536, 3542, 3554, 3557, 3573, 3574, 3587, 3589, 3598, 3606, 3615, 3621, 3630, 3638, 3646, 3654, 3662, 3671, 3678, 3688, 3694, 3704, 3711, 3723, 3725, 3740, 3741, 3755, 3757, 3770, 3774, 3786, 3789, 3798, 3806, 3819, 3824, 3837, 3839, 3848, 3856, 3863, 3871, 3887, 3903, 3919, 3935, 4040, 4047, 4056, 4065, 4071, 4080, 4088, 4096, 4104, 4112, 4121, 4129, 4136, 4144, 4154, 4160, 4171, 4176, 4189, 4191, 4205, 4207, 4222, 4223, 4232, 4240, 4248, 4256, 4264, 4272, 4282, 4288, 4297, 4304, 4312, 4324, 4328, 4339, 4344, 4356, 4359, 4371, 4376, 4388, 4392, 4404, 4407, 4420, 4424, 4432, 4440, 4448, 4456, 4465, 4471, 4480, 4488, 4496, 4504, 4512, 4521, 4528, 4539, 4544, 4554, 4561, 4571, 4576, 4589, 4592, 4604, 4608, 4620, 4632, 4639, 4696, 4703, 4713, 4721, 4728, 4738, 4744, 4754, 4760, 4771, 4779, 4786, 4795, 4804, 4810, 4821, 4826, 4837, 4842, 4854, 4858, 4871, 4873, 4881, 4889, 4898, 4905, 4914, 4921, 4930, 4938, 4946, 4954, 4962, 4973, 4978, 4990, 4994]
            }
        ]
        TrueMotion(origin=self, contents=json.dumps(motions[0]))


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
            if random.random() < 0.1:
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

    def calculate_payoff(self):
        pass

    def calculate_fitness(self):
        pass

    def _what(self):
        return Info

    def update(self, infos):
        for info in infos:
            if isinstance(info, Motion):
                pass
            elif isinstance(info, Gene):
                self.mutate(info_in=info)
