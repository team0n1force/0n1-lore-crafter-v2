export interface PowerEvolution {
  name: string
  description: string
}

export interface PowerType {
  bodyType: string
  foundation: string
  corePower: {
    name: string
    description: string
  }
  evolutionOptions: PowerEvolution[]
  additionalPower?: {
    name: string
    description: string
    keyAspects: string[]
  }
}

export const powerTypes: PowerType[] = [
  {
    bodyType: "Citrine",
    foundation: "Elemental Control",
    corePower: {
      name: "Elemental Harmony",
      description:
        "Citrines have mastery over the fundamental elements of nature, such as Earth, Fire, Water, and Air. They can command and manipulate these elements to reshape their environment, control the weather, and create barriers or offensive attacks.",
    },
    evolutionOptions: [
      {
        name: "Terramancer",
        description: "Specialists in manipulating earth and stone, shaping landscapes and creating barriers.",
      },
      {
        name: "Aquamorph",
        description: "Mastery over water, capable of controlling its form from liquid to solid (ice) and vapor.",
      },
      {
        name: "Flameweaver",
        description: "Commanders of fire, creating and manipulating flames for both attack and defense.",
      },
    ],
  },
  {
    bodyType: "Jasper",
    foundation: "Physical Enhancements and Abilities",
    corePower: {
      name: "Earth Resonance",
      description:
        "Jaspers are deeply connected to the physical world and can enhance their bodies to become stronger, more durable, and more agile. They can tap into the Earth's energies to increase their physical power or merge with the terrain to become nearly invulnerable.",
    },
    evolutionOptions: [
      {
        name: "Juggernaut",
        description: "Extreme physical resilience, capable of withstanding immense damage and continuing to fight.",
      },
      {
        name: "Berserker",
        description: "Tap into primal fury, enhancing strength and speed for short bursts of overwhelming power.",
      },
      {
        name: "Totem Guardian",
        description: "Bond with animal spirits, gaining enhanced senses and physical abilities.",
      },
    ],
  },
  {
    bodyType: "Azurite",
    foundation: "Energy Manipulation",
    corePower: {
      name: "Energy Synchronization",
      description:
        "Azurites can harness and control various forms of energy, including electrical, kinetic, and thermal energy. They can absorb energy from their environment, store it, and release it in powerful attacks or use it to enhance their own physical capabilities.",
    },
    evolutionOptions: [
      {
        name: "Electromancer",
        description:
          "Specialists in controlling and generating electrical energy, capable of creating lightning or powering technology.",
      },
      {
        name: "Biokinetic",
        description: "Manipulate life energy, enhancing their healing abilities or draining energy from others.",
      },
      {
        name: "Pyrokinetic",
        description: "Control and generate heat and fire, turning their bodies into living furnaces.",
      },
    ],
  },
  {
    bodyType: "Type-01",
    foundation: "Technological Manipulation",
    corePower: {
      name: "Nanotech Engineering",
      description:
        "Type-01 beings are masters of nanotechnology, capable of creating, repairing, and enhancing technology at a microscopic level. They can manipulate nanites to heal, create objects, or augment their bodies with advanced cybernetics.",
    },
    evolutionOptions: [
      {
        name: "Nanoforger",
        description: "Capable of crafting complex tools, weapons, or structures using nanites.",
      },
      {
        name: "Cyber-Enhancer",
        description: "Upgrade their bodies or others with nanotech, improving physical and mental abilities.",
      },
      {
        name: "Technomancer",
        description: "Control and manipulate technology, integrating with computers and machines effortlessly.",
      },
    ],
  },
  {
    bodyType: "Obsidian",
    foundation: "Spatial Manipulation",
    corePower: {
      name: "Shadowcrafting",
      description:
        "Obsidians have the ability to manipulate the fabric of space, particularly in low-light conditions. They can blend into shadows, become intangible, or create solid constructs from shadow material. Their control over space allows them to bend reality within these shadows, making them formidable opponents in darkness.",
    },
    evolutionOptions: [
      {
        name: "Voidwalker",
        description: "Ability to phase through shadows, becoming invisible and intangible in darkness.",
      },
      {
        name: "Shadowforger",
        description: "Create weapons and armor from solidified shadows, enhancing their combat prowess.",
      },
      {
        name: "Nightstalker",
        description: "Amplify their senses and strength in the dark, becoming faster and more agile.",
      },
    ],
  },
  {
    bodyType: "Ash",
    foundation: "Temporal & Evolutionary Manipulation",
    corePower: {
      name: "Temporal Echoes",
      description:
        "Ash types can manipulate the flow of time and evolution, allowing them to influence time in localized areas. They can slow down or speed up time, heal by reverting injuries, or even manipulate the aging process. They can also tap into the evolutionary potential of themselves or others, accelerating growth or mutations.",
    },
    evolutionOptions: [
      {
        name: "Chronomancer",
        description: "Control the flow of time, allowing for short time loops or accelerated movements.",
      },
      {
        name: "Temporal Healer",
        description: "Revert injuries or conditions by rewinding the affected area's timeline.",
      },
      {
        name: "Aging Master",
        description: "Accelerate the aging process in enemies or objects, causing them to degrade rapidly.",
      },
    ],
  },
  {
    bodyType: "Water",
    foundation: "Elemental Control",
    corePower: {
      name: "Tidal Dominion",
      description:
        "Water types are the undisputed masters of water in all its forms. Beyond simple hydrokinetics, they can command entire bodies of water, summon storms, and control the seas. Their power is not just limited to water manipulation but extends to dominating any environment that contains water, making them nearly unbeatable in such settings.",
    },
    evolutionOptions: [
      {
        name: "Hydromancer",
        description: "Control water in all its forms, capable of creating floods, ice barriers, or steam clouds.",
      },
      {
        name: "Aquamorph",
        description: "Shape their bodies or environment with water, becoming fluid or creating water-based weapons.",
      },
      {
        name: "Stormcaller",
        description: "Command storms and oceanic forces, summoning waves, hurricanes, and lightning.",
      },
    ],
  },
  {
    bodyType: "Pearlescent",
    foundation: "Celestial Powers",
    corePower: {
      name: "Light Refraction",
      description:
        "Pearlescent types can manipulate cosmic energies, particularly light, bending it around their bodies to become invisible or create dazzling illusions. They can draw power from the stars, using celestial energy to enhance their abilities, create shields, or launch powerful light-based attacks.",
    },
    evolutionOptions: [
      {
        name: "Invisible",
        description: "Perfect the art of light refraction to become undetectable by sight or sensors.",
      },
      {
        name: "Illusionist",
        description: "Create complex and convincing illusions using light manipulation.",
      },
      {
        name: "Radiance Master",
        description: "Harness and focus light into powerful beams or shields, using them for both offense and defense.",
      },
    ],
  },
  {
    bodyType: "Kabuki",
    foundation: "Spiritual Manipulation",
    corePower: {
      name: "Mind Sculpting",
      description:
        "Kabuki types have the power to influence the spiritual and mental realms. They can manipulate minds, create and project illusions, and delve into the dream world. Their abilities also allow them to see beyond the physical, predicting events and shaping reality through spiritual means.",
    },
    evolutionOptions: [
      {
        name: "Dreamweaver",
        description:
          "Create intricate dreamscapes that can influence reality, affecting both the physical and spiritual worlds.",
      },
      {
        name: "Mindbender",
        description: "Control and manipulate the thoughts and emotions of others, inducing fear, love, or confusion.",
      },
      {
        name: "Oracle",
        description:
          "Use their spiritual connection to foresee future events, guiding decisions with their predictions.",
      },
    ],
  },
  {
    bodyType: "Tiger Skin",
    foundation: "Physical Enhancements and Abilities",
    corePower: {
      name: "Primal Fury",
      description:
        "Tiger Skin types channel primal energy to enhance their physical attributes to superhuman levels. They can generate and control fire and heat, using it to boost their attacks or create defensive barriers.",
    },
    evolutionOptions: [
      {
        name: "Berserker",
        description: "Tap into a state of heightened power and rage, becoming nearly unstoppable in combat.",
      },
      {
        name: "Pyrokinetic",
        description: "Control fire, creating intense flames or using heat to strengthen their physical form.",
      },
      {
        name: "Ember Lord",
        description: "Control and manipulate embers and ashes, creating weapons or traps from smoldering remains.",
      },
    ],
    additionalPower: {
      name: "Feral Command",
      description:
        "A primal ability that grants Tiger Skin types dominion over the beasts and wilds. Characters with this power can communicate with, control, and even summon animals, particularly predatory creatures like big cats, wolves, and other apex predators. This power also enhances their own instincts and physical traits, such as heightened senses, speed, and agility, making them formidable hunters. In the heat of battle, they can enter a state where they channel the strength, speed, and ferocity of a tiger, turning into a living embodiment of nature's raw power.",
      keyAspects: [
        "Animal Communication: The ability to understand and communicate with animals, often forming strong bonds with them. This power extends to commanding these animals in battle or using them for reconnaissance.",
        "Summoning Predators: Summon and control powerful beasts to fight alongside or protect the character, particularly those with a natural affinity for hunting.",
        "Enhanced Instincts: The character's natural instincts are significantly heightened, allowing them to sense danger, track prey, and react with the speed and precision of a predator.",
        "Predatory Transformation: In moments of extreme danger or rage, the character can partially transform, adopting physical traits of a tiger, such as enhanced claws, fangs, or even a partial shift into a more beast-like form.",
        "Natural Stealth: This power also allows the character to move silently and blend into natural surroundings, becoming nearly undetectable in the wilderness.",
      ],
    },
  },
]

// Helper function to get power type by body type
export function getPowerByBodyType(bodyType: string): PowerType | undefined {
  // Normalize the body type for comparison
  const normalizedBodyType = bodyType.toLowerCase().trim()

  return powerTypes.find((power) => power.bodyType.toLowerCase().trim() === normalizedBodyType)
}

// Helper function to get a default power type if body type is not found
export function getDefaultPowerType(): PowerType {
  return powerTypes[0] // Return Citrine as default
}

// Helper function to get all body types
export function getAllBodyTypes(): string[] {
  return powerTypes.map((power) => power.bodyType)
}
