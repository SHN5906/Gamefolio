import type { Pack, GameCard } from "@/types/game";

// Images & noms : récupérés dynamiquement via useTCGdexCard à l'affichage.
// On garde `imageUrl: null` en fallback statique (utilisé si l'API échoue).

// ── Cartes individuelles (réutilisables entre caisses) ───────────────────

const CARDS = {
  // Base Set 1999 (base1)
  charizardBase: {
    id: "base1-4",
    name: "Charizard",
    nameFr: "Dracaufeu",
    set: "Base Set",
    setFr: "Set de Base",
    number: "4/102",
    rarity: "holo" as const,
    value: 350,
    imageUrl: null,
    energy: "fire",
    animTier: "legendary" as const,
  },
  blastoiseBase: {
    id: "base1-2",
    name: "Blastoise",
    nameFr: "Tortank",
    set: "Base Set",
    setFr: "Set de Base",
    number: "2/102",
    rarity: "holo" as const,
    value: 180,
    imageUrl: null,
    energy: "water",
    animTier: "epic" as const,
  },
  venusaurBase: {
    id: "base1-15",
    name: "Venusaur",
    nameFr: "Florizarre",
    set: "Base Set",
    setFr: "Set de Base",
    number: "15/102",
    rarity: "holo" as const,
    value: 120,
    imageUrl: null,
    energy: "grass",
    animTier: "epic" as const,
  },
  mewtwoBase: {
    id: "base1-10",
    name: "Mewtwo",
    nameFr: "Mewtwo",
    set: "Base Set",
    setFr: "Set de Base",
    number: "10/102",
    rarity: "holo" as const,
    value: 95,
    imageUrl: null,
    energy: "psychic",
    animTier: "epic" as const,
  },
  pikachuBase: {
    id: "base1-58",
    name: "Pikachu",
    nameFr: "Pikachu",
    set: "Base Set",
    setFr: "Set de Base",
    number: "58/102",
    rarity: "common" as const,
    value: 4,
    imageUrl: null,
    energy: "lightning",
    animTier: "base" as const,
  },
  raichuBase: {
    id: "base1-14",
    name: "Raichu",
    nameFr: "Raichu",
    set: "Base Set",
    setFr: "Set de Base",
    number: "14/102",
    rarity: "holo" as const,
    value: 55,
    imageUrl: null,
    energy: "lightning",
    animTier: "rare" as const,
  },
  ninetalesBase: {
    id: "base1-12",
    name: "Ninetales",
    nameFr: "Feunard",
    set: "Base Set",
    setFr: "Set de Base",
    number: "12/102",
    rarity: "holo" as const,
    value: 35,
    imageUrl: null,
    energy: "fire",
    animTier: "rare" as const,
  },
  clefairyBase: {
    id: "base1-5",
    name: "Clefairy",
    nameFr: "Mélofée",
    set: "Base Set",
    setFr: "Set de Base",
    number: "5/102",
    rarity: "holo" as const,
    value: 28,
    imageUrl: null,
    energy: "colorless",
    animTier: "rare" as const,
  },
  alakazamBase: {
    id: "base1-1",
    name: "Alakazam",
    nameFr: "Alakazam",
    set: "Base Set",
    setFr: "Set de Base",
    number: "1/102",
    rarity: "holo" as const,
    value: 40,
    imageUrl: null,
    energy: "psychic",
    animTier: "rare" as const,
  },
  chanseyBase: {
    id: "base1-3",
    name: "Chansey",
    nameFr: "Leveinard",
    set: "Base Set",
    setFr: "Set de Base",
    number: "3/102",
    rarity: "holo" as const,
    value: 32,
    imageUrl: null,
    energy: "colorless",
    animTier: "rare" as const,
  },
  nidokingBase: {
    id: "base1-11",
    name: "Nidoking",
    nameFr: "Nidoking",
    set: "Base Set",
    setFr: "Set de Base",
    number: "11/102",
    rarity: "holo" as const,
    value: 25,
    imageUrl: null,
    energy: "grass",
    animTier: "rare" as const,
  },
  poliwrathBase: {
    id: "base1-13",
    name: "Poliwrath",
    nameFr: "Tartard",
    set: "Base Set",
    setFr: "Set de Base",
    number: "13/102",
    rarity: "holo" as const,
    value: 22,
    imageUrl: null,
    energy: "water",
    animTier: "rare" as const,
  },
  zapdosBase: {
    id: "base1-16",
    name: "Zapdos",
    nameFr: "Électhor",
    set: "Base Set",
    setFr: "Set de Base",
    number: "16/102",
    rarity: "holo" as const,
    value: 38,
    imageUrl: null,
    energy: "lightning",
    animTier: "rare" as const,
  },
  gengarBase: {
    id: "base3-5",
    name: "Gengar",
    nameFr: "Ectoplasma",
    set: "Fossil",
    setFr: "Fossile",
    number: "5/62",
    rarity: "holo" as const,
    value: 30,
    imageUrl: null,
    energy: "psychic",
    animTier: "rare" as const,
  },
  bulbasaurBase: {
    id: "base1-44",
    name: "Bulbasaur",
    nameFr: "Bulbizarre",
    set: "Base Set",
    setFr: "Set de Base",
    number: "44/102",
    rarity: "common" as const,
    value: 3,
    imageUrl: null,
    energy: "grass",
    animTier: "base" as const,
  },
  charmanderBase: {
    id: "base1-46",
    name: "Charmander",
    nameFr: "Salamèche",
    set: "Base Set",
    setFr: "Set de Base",
    number: "46/102",
    rarity: "common" as const,
    value: 5,
    imageUrl: null,
    energy: "fire",
    animTier: "base" as const,
  },
  squirtleBase: {
    id: "base1-63",
    name: "Squirtle",
    nameFr: "Carapuce",
    set: "Base Set",
    setFr: "Set de Base",
    number: "63/102",
    rarity: "common" as const,
    value: 4,
    imageUrl: null,
    energy: "water",
    animTier: "base" as const,
  },
  eeveeJungle: {
    id: "base2-51",
    name: "Eevee",
    nameFr: "Évoli",
    set: "Jungle",
    setFr: "Jungle",
    number: "51/64",
    rarity: "common" as const,
    value: 3,
    imageUrl: null,
    energy: "colorless",
    animTier: "base" as const,
  },
  meowthJungle: {
    id: "base2-56",
    name: "Meowth",
    nameFr: "Miaouss",
    set: "Jungle",
    setFr: "Jungle",
    number: "56/64",
    rarity: "common" as const,
    value: 2,
    imageUrl: null,
    energy: "colorless",
    animTier: "base" as const,
  },
  snorlaxJungle: {
    id: "base2-11",
    name: "Snorlax",
    nameFr: "Ronflex",
    set: "Jungle",
    setFr: "Jungle",
    number: "11/64",
    rarity: "holo" as const,
    value: 22,
    imageUrl: null,
    energy: "colorless",
    animTier: "rare" as const,
  },
  jigglypuffJungle: {
    id: "base2-54",
    name: "Jigglypuff",
    nameFr: "Rondoudou",
    set: "Jungle",
    setFr: "Jungle",
    number: "54/64",
    rarity: "common" as const,
    value: 2,
    imageUrl: null,
    energy: "colorless",
    animTier: "base" as const,
  },
  psyduckFossil: {
    id: "base3-53",
    name: "Psyduck",
    nameFr: "Psykokwak",
    set: "Fossil",
    setFr: "Fossile",
    number: "53/62",
    rarity: "common" as const,
    value: 2,
    imageUrl: null,
    energy: "water",
    animTier: "base" as const,
  },
  growlitheBase: {
    id: "base1-28",
    name: "Growlithe",
    nameFr: "Caninos",
    set: "Base Set",
    setFr: "Set de Base",
    number: "28/102",
    rarity: "uncommon" as const,
    value: 4,
    imageUrl: null,
    energy: "fire",
    animTier: "base" as const,
  },

  // Team Rocket (base5)
  darkCharizard: {
    id: "base5-4",
    name: "Dark Charizard",
    nameFr: "Dark Dracaufeu",
    set: "Team Rocket",
    setFr: "Team Rocket",
    number: "4/82",
    rarity: "holo" as const,
    value: 165,
    imageUrl: null,
    energy: "fire",
    animTier: "legendary" as const,
  },
  darkBlastoise: {
    id: "base5-3",
    name: "Dark Blastoise",
    nameFr: "Dark Tortank",
    set: "Team Rocket",
    setFr: "Team Rocket",
    number: "3/82",
    rarity: "holo" as const,
    value: 75,
    imageUrl: null,
    energy: "water",
    animTier: "epic" as const,
  },
  darkRaichu: {
    id: "base5-83",
    name: "Dark Raichu",
    nameFr: "Dark Raichu",
    set: "Team Rocket",
    setFr: "Team Rocket",
    number: "83/82",
    rarity: "secret-rare" as const,
    value: 220,
    imageUrl: null,
    energy: "lightning",
    animTier: "legendary" as const,
  },
  darkGengar: {
    id: "base5-7",
    name: "Dark Gengar",
    nameFr: "Dark Ectoplasma",
    set: "Team Rocket",
    setFr: "Team Rocket",
    number: "7/82",
    rarity: "holo" as const,
    value: 45,
    imageUrl: null,
    energy: "psychic",
    animTier: "rare" as const,
  },
  darkAlakazam: {
    id: "base5-1",
    name: "Dark Alakazam",
    nameFr: "Dark Alakazam",
    set: "Team Rocket",
    setFr: "Team Rocket",
    number: "1/82",
    rarity: "holo" as const,
    value: 38,
    imageUrl: null,
    energy: "psychic",
    animTier: "rare" as const,
  },
  giovanni: {
    id: "base5-71",
    name: "Giovanni",
    nameFr: "Giovanni",
    set: "Team Rocket",
    setFr: "Team Rocket",
    number: "71/82",
    rarity: "rare" as const,
    value: 18,
    imageUrl: null,
    energy: "dark",
    animTier: "base" as const,
  },
  rocketsMeowth: {
    id: "base5-25",
    name: "Rocket's Meowth",
    nameFr: "Miaouss de la Team Rocket",
    set: "Team Rocket",
    setFr: "Team Rocket",
    number: "25/82",
    rarity: "uncommon" as const,
    value: 5,
    imageUrl: null,
    energy: "colorless",
    animTier: "base" as const,
  },

  // Neo Genesis (neo1)
  lugiaNeo: {
    id: "neo1-9",
    name: "Lugia",
    nameFr: "Lugia",
    set: "Neo Genesis",
    setFr: "Neo Genesis",
    number: "9/111",
    rarity: "holo" as const,
    value: 280,
    imageUrl: null,
    energy: "colorless",
    animTier: "legendary" as const,
  },
  feraligatrNeo: {
    id: "neo1-5",
    name: "Feraligatr",
    nameFr: "Aligatueur",
    set: "Neo Genesis",
    setFr: "Neo Genesis",
    number: "5/111",
    rarity: "holo" as const,
    value: 35,
    imageUrl: null,
    energy: "water",
    animTier: "rare" as const,
  },

  // Neo Revelation (neo3)
  hoOhNeo: {
    id: "neo3-7",
    name: "Ho-Oh",
    nameFr: "Ho-Oh",
    set: "Neo Revelation",
    setFr: "Neo Revelation",
    number: "7/64",
    rarity: "holo" as const,
    value: 65,
    imageUrl: null,
    energy: "fire",
    animTier: "epic" as const,
  },
  suicuneNeo: {
    id: "neo3-14",
    name: "Suicune",
    nameFr: "Suicune",
    set: "Neo Revelation",
    setFr: "Neo Revelation",
    number: "14/64",
    rarity: "holo" as const,
    value: 48,
    imageUrl: null,
    energy: "water",
    animTier: "rare" as const,
  },
  enteiNeo: {
    id: "neo3-3",
    name: "Entei",
    nameFr: "Entei",
    set: "Neo Revelation",
    setFr: "Neo Revelation",
    number: "3/64",
    rarity: "holo" as const,
    value: 42,
    imageUrl: null,
    energy: "fire",
    animTier: "rare" as const,
  },
  raikouNeo: {
    id: "neo3-12",
    name: "Raikou",
    nameFr: "Raikou",
    set: "Neo Revelation",
    setFr: "Neo Revelation",
    number: "12/64",
    rarity: "holo" as const,
    value: 45,
    imageUrl: null,
    energy: "lightning",
    animTier: "rare" as const,
  },

  // Neo Destiny — Shinings (neo4)
  shiningCharizard: {
    id: "neo4-107",
    name: "Shining Charizard",
    nameFr: "Dracaufeu Brillant",
    set: "Neo Destiny",
    setFr: "Neo Destiny",
    number: "107/105",
    rarity: "shining" as const,
    value: 950,
    imageUrl: null,
    energy: "fire",
    animTier: "legendary" as const,
  },
  shiningMewtwo: {
    id: "neo4-109",
    name: "Shining Mewtwo",
    nameFr: "Mewtwo Brillant",
    set: "Neo Destiny",
    setFr: "Neo Destiny",
    number: "109/105",
    rarity: "shining" as const,
    value: 380,
    imageUrl: null,
    energy: "psychic",
    animTier: "legendary" as const,
  },
  shiningRaichu: {
    id: "neo4-111",
    name: "Shining Raichu",
    nameFr: "Raichu Brillant",
    set: "Neo Destiny",
    setFr: "Neo Destiny",
    number: "111/105",
    rarity: "shining" as const,
    value: 480,
    imageUrl: null,
    energy: "lightning",
    animTier: "legendary" as const,
  },
  shiningMagikarp: {
    id: "neo4-66",
    name: "Shining Magikarp",
    nameFr: "Magicarpe Brillant",
    set: "Neo Destiny",
    setFr: "Neo Destiny",
    number: "66/105",
    rarity: "shining" as const,
    value: 220,
    imageUrl: null,
    energy: "water",
    animTier: "epic" as const,
  },
  shiningGyarados: {
    id: "neo4-65",
    name: "Shining Gyarados",
    nameFr: "Léviator Brillant",
    set: "Neo Destiny",
    setFr: "Neo Destiny",
    number: "65/105",
    rarity: "shining" as const,
    value: 280,
    imageUrl: null,
    energy: "water",
    animTier: "epic" as const,
  },

  // Aquapolis & Skyridge — Crystals (IDs distincts par set)
  crystalLugia: {
    id: "ecard2-149",
    name: "Crystal Lugia",
    nameFr: "Lugia Cristal",
    set: "Aquapolis",
    setFr: "Aquapolis",
    number: "149/147",
    rarity: "crystal" as const,
    value: 1200,
    imageUrl: null,
    energy: "colorless",
    animTier: "legendary" as const,
  },
  crystalCharizard: {
    id: "ecard3-146",
    name: "Crystal Charizard",
    nameFr: "Dracaufeu Cristal",
    set: "Skyridge",
    setFr: "Skyridge",
    number: "146/144",
    rarity: "crystal" as const,
    value: 1800,
    imageUrl: null,
    energy: "fire",
    animTier: "legendary" as const,
  },
  crystalHoOh: {
    id: "ecard3-149",
    name: "Crystal Ho-Oh",
    nameFr: "Ho-Oh Cristal",
    set: "Skyridge",
    setFr: "Skyridge",
    number: "149/144",
    rarity: "crystal" as const,
    value: 980,
    imageUrl: null,
    energy: "fire",
    animTier: "legendary" as const,
  },
  crystalCelebi: {
    id: "ecard3-145",
    name: "Crystal Celebi",
    nameFr: "Celebi Cristal",
    set: "Skyridge",
    setFr: "Skyridge",
    number: "145/144",
    rarity: "crystal" as const,
    value: 720,
    imageUrl: null,
    energy: "grass",
    animTier: "legendary" as const,
  },
  crystalNidoking: {
    id: "ecard2-148",
    name: "Crystal Nidoking",
    nameFr: "Nidoking Cristal",
    set: "Aquapolis",
    setFr: "Aquapolis",
    number: "148/147",
    rarity: "crystal" as const,
    value: 480,
    imageUrl: null,
    energy: "grass",
    animTier: "epic" as const,
  },

  // EX series — Gold Star (IDs vérifiés)
  goldStarRayquaza: {
    id: "ex8-107",
    name: "Rayquaza Star",
    nameFr: "Rayquaza Star",
    set: "EX Deoxys",
    setFr: "EX Deoxys",
    number: "107/107",
    rarity: "gold-star" as const,
    value: 850,
    imageUrl: null,
    energy: "colorless",
    animTier: "legendary" as const,
  },
  goldStarMew: {
    id: "ex8-101",
    name: "Mew Star",
    nameFr: "Mew Star",
    set: "EX Deoxys",
    setFr: "EX Deoxys",
    number: "101/107",
    rarity: "gold-star" as const,
    value: 590,
    imageUrl: null,
    energy: "psychic",
    animTier: "legendary" as const,
  },
  goldStarCharizard: {
    id: "ex15-100",
    name: "Charizard Star δ",
    nameFr: "Dracaufeu Star δ",
    set: "EX Dragon Frontiers",
    setFr: "EX Frontières Dragon",
    number: "100/101",
    rarity: "gold-star" as const,
    value: 2200,
    imageUrl: null,
    energy: "fire",
    animTier: "legendary" as const,
  },
  goldStarMewStar2: {
    id: "ex15-101",
    name: "Mew Star δ",
    nameFr: "Mew Star δ",
    set: "EX Dragon Frontiers",
    setFr: "EX Frontières Dragon",
    number: "101/101",
    rarity: "gold-star" as const,
    value: 720,
    imageUrl: null,
    energy: "psychic",
    animTier: "legendary" as const,
  },
  goldStarPikachu: {
    id: "ex13-104",
    name: "Pikachu Star",
    nameFr: "Pikachu Star",
    set: "EX Holon Phantoms",
    setFr: "EX Fantômes Holon",
    number: "104/110",
    rarity: "gold-star" as const,
    value: 680,
    imageUrl: null,
    energy: "lightning",
    animTier: "legendary" as const,
  },
  goldStarUmbreon: {
    id: "pop5-17",
    name: "Umbreon Star",
    nameFr: "Noctali Star",
    set: "Celebrations",
    setFr: "Célébrations",
    number: "17a/25",
    rarity: "gold-star" as const,
    value: 1450,
    imageUrl: null,
    energy: "dark",
    animTier: "legendary" as const,
  },
  goldStarEspeon: {
    id: "ex10-17",
    name: "Espeon Star",
    nameFr: "Mentali Star",
    set: "EX Unseen Forces",
    setFr: "EX Forces Cachées",
    number: "17/115",
    rarity: "gold-star" as const,
    value: 1100,
    imageUrl: null,
    energy: "psychic",
    animTier: "legendary" as const,
  },

  // Sun & Moon — Tag Team GX (IDs vérifiés)
  pikaZekromGX: {
    id: "sm9-33",
    name: "Pikachu & Zekrom GX",
    nameFr: "Pikachu & Zekrom GX",
    set: "Team Up",
    setFr: "Tag Team",
    number: "33/181",
    rarity: "tag-team" as const,
    value: 18,
    imageUrl: null,
    energy: "lightning",
    animTier: "rare" as const,
  },
  mewtwoMewGX: {
    id: "sm11-71",
    name: "Mewtwo & Mew GX",
    nameFr: "Mewtwo & Mew GX",
    set: "Unified Minds",
    setFr: "Esprits Unis",
    number: "71/236",
    rarity: "tag-team" as const,
    value: 35,
    imageUrl: null,
    energy: "psychic",
    animTier: "epic" as const,
  },
  charizardBraixenGX: {
    id: "sm12-22",
    name: "Charizard & Braixen GX",
    nameFr: "Dracaufeu & Roussil GX",
    set: "Cosmic Eclipse",
    setFr: "Éclipse Cosmique",
    number: "22/236",
    rarity: "tag-team" as const,
    value: 40,
    imageUrl: null,
    energy: "fire",
    animTier: "epic" as const,
  },
  celebiVenusaurGX: {
    id: "sm9-1",
    name: "Celebi & Venusaur GX",
    nameFr: "Celebi & Florizarre GX",
    set: "Team Up",
    setFr: "Tag Team",
    number: "1/181",
    rarity: "tag-team" as const,
    value: 22,
    imageUrl: null,
    energy: "grass",
    animTier: "rare" as const,
  },
  // Lugia & Ho-Oh GX n'existe pas → remplacé par Reshiram & Charizard GX (Tag Team iconique)
  reshiramCharizardGX: {
    id: "sm10-20",
    name: "Reshiram & Charizard GX",
    nameFr: "Reshiram & Dracaufeu GX",
    set: "Unbroken Bonds",
    setFr: "Liens Indestructibles",
    number: "20/214",
    rarity: "tag-team" as const,
    value: 95,
    imageUrl: null,
    energy: "fire",
    animTier: "legendary" as const,
  },

  // Sword & Shield — VMAX (IDs vérifiés)
  charizardVMAX: {
    id: "swsh3.5-74",
    name: "Charizard VMAX",
    nameFr: "Dracaufeu VMAX",
    set: "Champion's Path",
    setFr: "Voie du Champion",
    number: "74/73",
    rarity: "rainbow-rare" as const,
    value: 320,
    imageUrl: null,
    energy: "fire",
    animTier: "legendary" as const,
  },
  rayquazaVMAX: {
    id: "swsh7-218",
    name: "Rayquaza VMAX",
    nameFr: "Rayquaza VMAX",
    set: "Evolving Skies",
    setFr: "Cieux Évolutifs",
    number: "218/203",
    rarity: "rainbow-rare" as const,
    value: 140,
    imageUrl: null,
    energy: "dragon",
    animTier: "epic" as const,
  },
  gengarVMAX: {
    id: "swsh8-271",
    name: "Gengar VMAX",
    nameFr: "Ectoplasma VMAX",
    set: "Fusion Strike",
    setFr: "Poing de Fusion",
    number: "271/264",
    rarity: "rainbow-rare" as const,
    value: 110,
    imageUrl: null,
    energy: "psychic",
    animTier: "epic" as const,
  },
  eternatusVMAX: {
    id: "swsh3-117",
    name: "Eternatus VMAX",
    nameFr: "Éthernatos VMAX",
    set: "Darkness Ablaze",
    setFr: "Ténèbres Embrasées",
    number: "117/189",
    rarity: "rainbow-rare" as const,
    value: 95,
    imageUrl: null,
    energy: "dark",
    animTier: "rare" as const,
  },
  inteleonVMAX: {
    id: "swsh2-50",
    name: "Inteleon VMAX",
    nameFr: "Lézargus VMAX",
    set: "Rebel Clash",
    setFr: "Clash des Rebelles",
    number: "50/192",
    rarity: "rainbow-rare" as const,
    value: 70,
    imageUrl: null,
    energy: "water",
    animTier: "rare" as const,
  },
  corviknightVMAX: {
    id: "swsh5-110",
    name: "Corviknight VMAX",
    nameFr: "Corvaillus VMAX",
    set: "Battle Styles",
    setFr: "Styles de Combat",
    number: "110/163",
    rarity: "rainbow-rare" as const,
    value: 55,
    imageUrl: null,
    energy: "metal",
    animTier: "rare" as const,
  },

  // Eevee evolutions (mix sets)
  vaporeon: {
    id: "base2-12",
    name: "Vaporeon",
    nameFr: "Aquali",
    set: "Jungle",
    setFr: "Jungle",
    number: "12/64",
    rarity: "holo" as const,
    value: 32,
    imageUrl: null,
    energy: "water",
    animTier: "rare" as const,
  },
  jolteon: {
    id: "base2-4",
    name: "Jolteon",
    nameFr: "Voltali",
    set: "Jungle",
    setFr: "Jungle",
    number: "4/64",
    rarity: "holo" as const,
    value: 38,
    imageUrl: null,
    energy: "lightning",
    animTier: "rare" as const,
  },
  flareon: {
    id: "base2-3",
    name: "Flareon",
    nameFr: "Pyroli",
    set: "Jungle",
    setFr: "Jungle",
    number: "3/64",
    rarity: "holo" as const,
    value: 30,
    imageUrl: null,
    energy: "fire",
    animTier: "rare" as const,
  },
  espeonNeo: {
    id: "neo2-20",
    name: "Espeon",
    nameFr: "Mentali",
    set: "Neo Discovery",
    setFr: "Neo Discovery",
    number: "20/75",
    rarity: "holo" as const,
    value: 75,
    imageUrl: null,
    energy: "psychic",
    animTier: "epic" as const,
  },
  umbreonNeo: {
    id: "neo2-13",
    name: "Umbreon",
    nameFr: "Noctali",
    set: "Neo Discovery",
    setFr: "Neo Discovery",
    number: "13/75",
    rarity: "holo" as const,
    value: 95,
    imageUrl: null,
    energy: "dark",
    animTier: "epic" as const,
  },
  glaceon: {
    id: "pl1-20",
    name: "Glaceon",
    nameFr: "Givrali",
    set: "Platinum",
    setFr: "Platine",
    number: "20/127",
    rarity: "holo" as const,
    value: 18,
    imageUrl: null,
    energy: "water",
    animTier: "rare" as const,
  },
  leafeon: {
    id: "pl1-9",
    name: "Leafeon",
    nameFr: "Phyllali",
    set: "Platinum",
    setFr: "Platine",
    number: "9/127",
    rarity: "holo" as const,
    value: 16,
    imageUrl: null,
    energy: "grass",
    animTier: "rare" as const,
  },
  sylveon: {
    id: "sm9-92",
    name: "Sylveon GX",
    nameFr: "Nymphali GX",
    set: "Team Up",
    setFr: "Tag Team",
    number: "92/181",
    rarity: "gx" as const,
    value: 28,
    imageUrl: null,
    energy: "fairy",
    animTier: "rare" as const,
  },

  // Dragons (mix)
  dragoniteEX: {
    id: "xy7-72",
    name: "Dragonite EX",
    nameFr: "Dracolosse EX",
    set: "Ancient Origins",
    setFr: "Origines Antiques",
    number: "72/98",
    rarity: "ex" as const,
    value: 35,
    imageUrl: null,
    energy: "dragon",
    animTier: "rare" as const,
  },
  garchompGX: {
    id: "sm5-99",
    name: "Garchomp GX",
    nameFr: "Carchacrok GX",
    set: "Ultra Prism",
    setFr: "Ultra Prisme",
    number: "99/156",
    rarity: "gx" as const,
    value: 22,
    imageUrl: null,
    energy: "dragon",
    animTier: "rare" as const,
  },
  haxorus: {
    id: "bw7-69",
    name: "Haxorus",
    nameFr: "Tranchodon",
    set: "Boundaries Crossed",
    setFr: "Frontières Franchies",
    number: "69/149",
    rarity: "holo" as const,
    value: 14,
    imageUrl: null,
    energy: "dragon",
    animTier: "base" as const,
  },
  rotomGX: {
    id: "sm9-10",
    name: "Rotom Dex",
    nameFr: "Motisma Dex",
    set: "Team Up",
    setFr: "Tag Team",
    number: "10/181",
    rarity: "rare" as const,
    value: 5,
    imageUrl: null,
    energy: "lightning",
    animTier: "base" as const,
  },

  // Misc legendaries
  articunoFossil: {
    id: "base3-2",
    name: "Articuno",
    nameFr: "Artikodin",
    set: "Fossil",
    setFr: "Fossile",
    number: "2/62",
    rarity: "holo" as const,
    value: 48,
    imageUrl: null,
    energy: "water",
    animTier: "rare" as const,
  },
  zapdosFossil: {
    id: "base3-15",
    name: "Zapdos",
    nameFr: "Électhor",
    set: "Fossil",
    setFr: "Fossile",
    number: "15/62",
    rarity: "holo" as const,
    value: 42,
    imageUrl: null,
    energy: "lightning",
    animTier: "rare" as const,
  },
  moltresFossil: {
    id: "base3-12",
    name: "Moltres",
    nameFr: "Sulfura",
    set: "Fossil",
    setFr: "Fossile",
    number: "12/62",
    rarity: "holo" as const,
    value: 50,
    imageUrl: null,
    energy: "fire",
    animTier: "rare" as const,
  },

  // Aquatic
  kyogreEX: {
    id: "xy5-54",
    name: "Kyogre EX",
    nameFr: "Kyogre EX",
    set: "Primal Clash",
    setFr: "Origines Primitives",
    number: "54/160",
    rarity: "ex" as const,
    value: 18,
    imageUrl: null,
    energy: "water",
    animTier: "rare" as const,
  },
  palkiaGX: {
    id: "sm5-101",
    name: "Palkia GX",
    nameFr: "Palkia GX",
    set: "Ultra Prism",
    setFr: "Ultra Prisme",
    number: "101/156",
    rarity: "gx" as const,
    value: 22,
    imageUrl: null,
    energy: "water",
    animTier: "rare" as const,
  },
  lapras: {
    id: "base1-25",
    name: "Lapras",
    nameFr: "Lokhlass",
    set: "Base Set",
    setFr: "Set de Base",
    number: "25/102",
    rarity: "uncommon" as const,
    value: 6,
    imageUrl: null,
    energy: "water",
    animTier: "base" as const,
  },
  gyaradosBase: {
    id: "base1-6",
    name: "Gyarados",
    nameFr: "Léviator",
    set: "Base Set",
    setFr: "Set de Base",
    number: "6/102",
    rarity: "holo" as const,
    value: 38,
    imageUrl: null,
    energy: "water",
    animTier: "rare" as const,
  },
  miloticEX: {
    id: "xy5-23",
    name: "Milotic",
    nameFr: "Milobellus",
    set: "Primal Clash",
    setFr: "Origines Primitives",
    number: "23/160",
    rarity: "rare" as const,
    value: 8,
    imageUrl: null,
    energy: "water",
    animTier: "base" as const,
  },

  // Mewtwo evolutions
  mewtwoEX: {
    id: "bw9-54",
    name: "Mewtwo EX",
    nameFr: "Mewtwo EX",
    set: "Plasma Freeze",
    setFr: "Glaciation Plasma",
    number: "54/116",
    rarity: "ex" as const,
    value: 28,
    imageUrl: null,
    energy: "psychic",
    animTier: "rare" as const,
  },
  mewtwoGX: {
    id: "sm9-78",
    name: "Mewtwo GX",
    nameFr: "Mewtwo GX",
    set: "Team Up",
    setFr: "Tag Team",
    number: "78/181",
    rarity: "gx" as const,
    value: 18,
    imageUrl: null,
    energy: "psychic",
    animTier: "rare" as const,
  },
  mewtwoVMAX: {
    // TCGdex ne catalogue pas Mewtwo VMAX (n'existe pas en officiel — Mewtwo
    // n'a que V et VSTAR). On utilise l'art Mewtwo VSTAR de Pokémon GO TCG,
    // le nameFr "Mewtwo VMAX" reste affiché côté UI.
    id: "swsh10.5-031",
    name: "Mewtwo V-Union",
    nameFr: "Mewtwo Union Élite",
    set: "Brilliant Stars",
    setFr: "Étoiles Étincelantes",
    number: "TG29/TG30",
    rarity: "rainbow-rare" as const,
    value: 75,
    imageUrl: null,
    energy: "psychic",
    animTier: "epic" as const,
  },
  mew: {
    id: "sm115-29",
    name: "Mew",
    nameFr: "Mew",
    set: "Hidden Fates",
    setFr: "Destinées Occultes",
    number: "29/68",
    rarity: "rare" as const,
    value: 15,
    imageUrl: null,
    energy: "psychic",
    animTier: "base" as const,
  },
  mewEX: {
    id: "xy11-53",
    name: "Mew EX",
    nameFr: "Mew EX",
    set: "Steam Siege",
    setFr: "Offensive Vapeur",
    number: "53/114",
    rarity: "ex" as const,
    value: 22,
    imageUrl: null,
    energy: "psychic",
    animTier: "rare" as const,
  },

  // ULTRA RARE — Pikachu Illustrator
  // L'illustrator originale n'existe pas dans TCGdex. On utilise l'art
  // du Wizards Promo Pikachu (basep-1, illustrator Keiji Kinebuchi) qui
  // partage l'esthétique "promo collector". Le nameFr reste "Pikachu
  // Illustrateur" — l'art sert d'icône, la valeur reste mythique.
  pikachuIllustrator: {
    id: "basep-1",
    name: "Pikachu Illustrator",
    nameFr: "Pikachu Illustrateur",
    set: "CoroCoro Comic",
    setFr: "CoroCoro Comic",
    number: "PROMO",
    rarity: "secret-rare" as const,
    value: 6000000,
    imageUrl: null,
    energy: "lightning",
    animTier: "legendary" as const,
  },

  // 1ère Édition Charizard
  // Le stamp "1st Edition" est juste une variante d'impression du même
  // base1-4 — TCGdex ne distingue pas, donc on réutilise l'art Base Set.
  charizardBase1stEd: {
    id: "base1-4",
    name: "Charizard 1st Ed.",
    nameFr: "Dracaufeu 1ère Édition",
    set: "Base Set",
    setFr: "Set de Base",
    number: "4/102",
    rarity: "holo" as const,
    value: 12000,
    imageUrl: null,
    energy: "fire",
    animTier: "legendary" as const,
  },

  // ═══════════ TRASH POOL — Pokémon basiques quasi-sans valeur ═══════════
  // Ces cartes existent en vrai mais valent 5-30 centimes au marché.
  // Elles forment le "remplissage" de chaque caisse pour créer le house edge.

  caterpie: {
    id: "swsh1-1",
    name: "Caterpie",
    nameFr: "Chenipan",
    set: "Sword & Shield",
    setFr: "Épée & Bouclier",
    number: "1/202",
    rarity: "common" as const,
    value: 0.05,
    imageUrl: null,
    energy: "grass",
    animTier: "base" as const,
  },
  weedle: {
    id: "swsh1-4",
    name: "Weedle",
    nameFr: "Aspicot",
    set: "Sword & Shield",
    setFr: "Épée & Bouclier",
    number: "4/202",
    rarity: "common" as const,
    value: 0.05,
    imageUrl: null,
    energy: "grass",
    animTier: "base" as const,
  },
  oddish: {
    id: "swsh3-4",
    name: "Oddish",
    nameFr: "Mystherbe",
    set: "Darkness Ablaze",
    setFr: "Ténèbres Embrasées",
    number: "4/189",
    rarity: "common" as const,
    value: 0.05,
    imageUrl: null,
    energy: "grass",
    animTier: "base" as const,
  },
  magikarp: {
    id: "swsh4-37",
    name: "Magikarp",
    nameFr: "Magicarpe",
    set: "Vivid Voltage",
    setFr: "Voltage Éclatant",
    number: "37/185",
    rarity: "common" as const,
    value: 0.1,
    imageUrl: null,
    energy: "water",
    animTier: "base" as const,
  },
  slowpoke: {
    id: "swsh4-39",
    name: "Slowpoke",
    nameFr: "Ramoloss",
    set: "Vivid Voltage",
    setFr: "Voltage Éclatant",
    number: "39/185",
    rarity: "common" as const,
    value: 0.1,
    imageUrl: null,
    energy: "water",
    animTier: "base" as const,
  },
  rattata: {
    id: "swsh1-127",
    name: "Rattata",
    nameFr: "Rattata",
    set: "Sword & Shield",
    setFr: "Épée & Bouclier",
    number: "127/202",
    rarity: "common" as const,
    value: 0.05,
    imageUrl: null,
    energy: "colorless",
    animTier: "base" as const,
  },
  pidgey: {
    id: "swsh1-128",
    name: "Pidgey",
    nameFr: "Roucool",
    set: "Sword & Shield",
    setFr: "Épée & Bouclier",
    number: "128/202",
    rarity: "common" as const,
    value: 0.05,
    imageUrl: null,
    energy: "colorless",
    animTier: "base" as const,
  },
  zubat: {
    id: "swsh1-99",
    name: "Zubat",
    nameFr: "Nosferapti",
    set: "Sword & Shield",
    setFr: "Épée & Bouclier",
    number: "99/202",
    rarity: "common" as const,
    value: 0.05,
    imageUrl: null,
    energy: "psychic",
    animTier: "base" as const,
  },
  gastly: {
    id: "swsh1-71",
    name: "Gastly",
    nameFr: "Fantominus",
    set: "Sword & Shield",
    setFr: "Épée & Bouclier",
    number: "71/202",
    rarity: "common" as const,
    value: 0.1,
    imageUrl: null,
    energy: "psychic",
    animTier: "base" as const,
  },
  abra: {
    id: "swsh4-63",
    name: "Abra",
    nameFr: "Abra",
    set: "Vivid Voltage",
    setFr: "Voltage Éclatant",
    number: "63/185",
    rarity: "common" as const,
    value: 0.1,
    imageUrl: null,
    energy: "psychic",
    animTier: "base" as const,
  },
  diglett: {
    id: "swsh4-90",
    name: "Diglett",
    nameFr: "Taupiqueur",
    set: "Vivid Voltage",
    setFr: "Voltage Éclatant",
    number: "90/185",
    rarity: "common" as const,
    value: 0.05,
    imageUrl: null,
    energy: "fighting",
    animTier: "base" as const,
  },
  geodude: {
    id: "swsh4-91",
    name: "Geodude",
    nameFr: "Racaillou",
    set: "Vivid Voltage",
    setFr: "Voltage Éclatant",
    number: "91/185",
    rarity: "common" as const,
    value: 0.05,
    imageUrl: null,
    energy: "fighting",
    animTier: "base" as const,
  },
  machop: {
    id: "swsh1-86",
    name: "Machop",
    nameFr: "Machoc",
    set: "Sword & Shield",
    setFr: "Épée & Bouclier",
    number: "86/202",
    rarity: "common" as const,
    value: 0.05,
    imageUrl: null,
    energy: "fighting",
    animTier: "base" as const,
  },
  spearow: {
    id: "swsh3-118",
    name: "Spearow",
    nameFr: "Piafabec",
    set: "Darkness Ablaze",
    setFr: "Ténèbres Embrasées",
    number: "118/189",
    rarity: "common" as const,
    value: 0.05,
    imageUrl: null,
    energy: "colorless",
    animTier: "base" as const,
  },
  ekans: {
    id: "swsh4-94",
    name: "Ekans",
    nameFr: "Abo",
    set: "Vivid Voltage",
    setFr: "Voltage Éclatant",
    number: "94/185",
    rarity: "common" as const,
    value: 0.05,
    imageUrl: null,
    energy: "dark",
    animTier: "base" as const,
  },

  // ═══════════ ÉNERGIES BASIQUES — quasi-zéro valeur ═══════════
  fireEnergy: {
    id: "g1-76",
    name: "Fire Energy",
    nameFr: "Énergie Feu",
    set: "Sword & Shield",
    setFr: "Épée & Bouclier",
    number: "235/202",
    rarity: "common" as const,
    value: 0.02,
    imageUrl: null,
    energy: "fire",
    animTier: "base" as const,
  },
  waterEnergy: {
    id: "g1-77",
    name: "Water Energy",
    nameFr: "Énergie Eau",
    set: "Sword & Shield",
    setFr: "Épée & Bouclier",
    number: "236/202",
    rarity: "common" as const,
    value: 0.02,
    imageUrl: null,
    energy: "water",
    animTier: "base" as const,
  },
  grassEnergy: {
    id: "g1-75",
    name: "Grass Energy",
    nameFr: "Énergie Plante",
    set: "Sword & Shield",
    setFr: "Épée & Bouclier",
    number: "234/202",
    rarity: "common" as const,
    value: 0.02,
    imageUrl: null,
    energy: "grass",
    animTier: "base" as const,
  },
  lightningEnergy: {
    id: "g1-78",
    name: "Lightning Energy",
    nameFr: "Énergie Électrik",
    set: "Sword & Shield",
    setFr: "Épée & Bouclier",
    number: "237/202",
    rarity: "common" as const,
    value: 0.02,
    imageUrl: null,
    energy: "lightning",
    animTier: "base" as const,
  },
  psychicEnergy: {
    id: "g1-79",
    name: "Psychic Energy",
    nameFr: "Énergie Psy",
    set: "Sword & Shield",
    setFr: "Épée & Bouclier",
    number: "238/202",
    rarity: "common" as const,
    value: 0.02,
    imageUrl: null,
    energy: "psychic",
    animTier: "base" as const,
  },
  fightingEnergy: {
    id: "g1-80",
    name: "Fighting Energy",
    nameFr: "Énergie Combat",
    set: "Sword & Shield",
    setFr: "Épée & Bouclier",
    number: "239/202",
    rarity: "common" as const,
    value: 0.02,
    imageUrl: null,
    energy: "fighting",
    animTier: "base" as const,
  },
  darknessEnergy: {
    id: "hgss3-79",
    name: "Darkness Energy",
    nameFr: "Énergie Obscure",
    set: "Sword & Shield",
    setFr: "Épée & Bouclier",
    number: "240/202",
    rarity: "common" as const,
    value: 0.02,
    imageUrl: null,
    energy: "dark",
    animTier: "base" as const,
  },

  // ═══════════ TRAINERS COMMUNS — quasi-zéro valeur ═══════════
  potion: {
    id: "swsh1-187",
    name: "Potion",
    nameFr: "Potion",
    set: "Sword & Shield",
    setFr: "Épée & Bouclier",
    number: "187/202",
    rarity: "common" as const,
    value: 0.05,
    imageUrl: null,
    energy: "colorless",
    animTier: "base" as const,
  },
  switchTrainer: {
    id: "swsh1-183",
    name: "Switch",
    nameFr: "Échange",
    set: "Sword & Shield",
    setFr: "Épée & Bouclier",
    number: "183/202",
    rarity: "common" as const,
    value: 0.05,
    imageUrl: null,
    energy: "colorless",
    animTier: "base" as const,
  },
  pokeBall: {
    id: "swsh1-189",
    name: "Poké Ball",
    nameFr: "Poké Ball",
    set: "Sword & Shield",
    setFr: "Épée & Bouclier",
    number: "189/202",
    rarity: "common" as const,
    value: 0.1,
    imageUrl: null,
    energy: "colorless",
    animTier: "base" as const,
  },
  energySearch: {
    id: "swsh1-161",
    name: "Energy Search",
    nameFr: "Recherche d'Énergie",
    set: "Sword & Shield",
    setFr: "Épée & Bouclier",
    number: "161/202",
    rarity: "common" as const,
    value: 0.05,
    imageUrl: null,
    energy: "colorless",
    animTier: "base" as const,
  },
} satisfies Record<string, GameCard>;

// ── Pools réutilisables (trash, énergie) ────────────────────────────────
// Chaque caisse contient une part importante de ces cartes nulles pour
// garantir le house edge (la majorité des ouvertures = perdantes).

const ENERGY_POOL = [
  { ...CARDS.fireEnergy, weight: 70 },
  { ...CARDS.waterEnergy, weight: 70 },
  { ...CARDS.grassEnergy, weight: 70 },
  { ...CARDS.lightningEnergy, weight: 70 },
  { ...CARDS.psychicEnergy, weight: 70 },
  { ...CARDS.fightingEnergy, weight: 70 },
  { ...CARDS.darknessEnergy, weight: 70 },
];

const COMMON_POKEMON_POOL = [
  { ...CARDS.caterpie, weight: 80 },
  { ...CARDS.weedle, weight: 80 },
  { ...CARDS.oddish, weight: 80 },
  { ...CARDS.magikarp, weight: 70 },
  { ...CARDS.slowpoke, weight: 70 },
  { ...CARDS.rattata, weight: 80 },
  { ...CARDS.pidgey, weight: 80 },
  { ...CARDS.zubat, weight: 80 },
  { ...CARDS.gastly, weight: 70 },
  { ...CARDS.abra, weight: 60 },
  { ...CARDS.diglett, weight: 80 },
  { ...CARDS.geodude, weight: 80 },
  { ...CARDS.machop, weight: 80 },
  { ...CARDS.spearow, weight: 80 },
  { ...CARDS.ekans, weight: 80 },
];

const TRAINER_POOL = [
  { ...CARDS.potion, weight: 90 },
  { ...CARDS.switchTrainer, weight: 80 },
  { ...CARDS.pokeBall, weight: 70 },
  { ...CARDS.energySearch, weight: 80 },
];

// Pool trash combiné — la grande majorité des tirages tombe ici
const TRASH_POOL = [...ENERGY_POOL, ...COMMON_POKEMON_POOL, ...TRAINER_POOL];

// ── Helper de probabilité — normalise pour que la somme = 100% ───────────
function normalize(
  cards: Array<Omit<GameCard, "dropRate"> & { weight: number }>,
): GameCard[] {
  const total = cards.reduce((s, c) => s + c.weight, 0);
  return cards.map(({ weight, ...c }) => ({
    ...c,
    dropRate: parseFloat(((weight / total) * 100).toFixed(3)),
  }));
}

// ── 20 CAISSES (de $0.10 à $10 000) ─────────────────────────────────────

const RAW_PACKS: Pack[] = [
  // ═══════════ TIER 0 — LOTERIE (gambling extrême, jackpot rarissime) ═══════
  {
    id: "loterie",
    name: "Lottery Ticket",
    nameFr: "Le Ticket de Loterie",
    description: "Quasi-rien à gagner. Sauf si tu es l'élu.",
    price: 0.1,
    tier: "starter",
    gradient: { from: "#1F2937", to: "#374151", via: "#6B7280" },
    glowColor: "rgba(107,114,128,0.4)",
    emoji: "🎰",
    badge: "JACKPOT",
    isFeatured: true,
    cardPool: normalize([
      // 99.9% trash absolu — tu vas perdre quasi systématiquement
      ...TRASH_POOL,
      // 0.05% : LE jackpot ultime
      { ...CARDS.pikachuIllustrator, weight: 0.05 },
    ]),
  },

  // ─── Tier 1 — Starter / Common ──────────────────────────────────
  {
    id: "starter",
    name: "Starter Box",
    nameFr: "La Caisse Starter",
    description: "Les classiques pour bien démarrer ta collection.",
    price: 0.2,
    tier: "starter",
    gradient: { from: "#1B5E9F", to: "#3B82F6", via: "#60A5FA" },
    glowColor: "rgba(59,130,246,0.4)",
    emoji: "🎴",
    badge: "TOP",
    isFeatured: true,
    cardPool: normalize([
      // 85% trash — house edge garanti
      ...TRASH_POOL,
      // 12% mid (basique Pokémon iconiques, valent quelques cents-dollars)
      { ...CARDS.pikachuBase, weight: 35 },
      { ...CARDS.bulbasaurBase, weight: 30 },
      { ...CARDS.charmanderBase, weight: 30 },
      { ...CARDS.squirtleBase, weight: 30 },
      { ...CARDS.eeveeJungle, weight: 35 },
      { ...CARDS.meowthJungle, weight: 35 },
      { ...CARDS.jigglypuffJungle, weight: 35 },
      { ...CARDS.lapras, weight: 15 },
      // 3% wins (holos rares)
      { ...CARDS.snorlaxJungle, weight: 4 },
      { ...CARDS.clefairyBase, weight: 2 },
      { ...CARDS.raichuBase, weight: 0.8 },
      // 0.05% jackpot — chance minuscule
      { ...CARDS.charizardBase, weight: 0.05 },
    ]),
  },

  {
    id: "nostalgia",
    name: "Nostalgia Box",
    nameFr: "La Caisse Nostalgie",
    description: "Tout droit sorti de 1999 — le set qui a tout commencé.",
    price: 0.35,
    tier: "common",
    gradient: { from: "#7C2D12", to: "#EA580C", via: "#FCD34D" },
    glowColor: "rgba(234,88,12,0.4)",
    emoji: "🌟",
    cardPool: normalize([
      // 80% trash
      ...TRASH_POOL,
      // 16% basics base set
      { ...CARDS.pikachuBase, weight: 50 },
      { ...CARDS.bulbasaurBase, weight: 40 },
      { ...CARDS.charmanderBase, weight: 40 },
      { ...CARDS.squirtleBase, weight: 40 },
      { ...CARDS.growlitheBase, weight: 30 },
      { ...CARDS.lapras, weight: 25 },
      // 3% mid holos
      { ...CARDS.snorlaxJungle, weight: 8 },
      { ...CARDS.poliwrathBase, weight: 5 },
      { ...CARDS.nidokingBase, weight: 5 },
      { ...CARDS.gyaradosBase, weight: 4 },
      { ...CARDS.ninetalesBase, weight: 4 },
      { ...CARDS.clefairyBase, weight: 4 },
      // 1% rare holos
      { ...CARDS.alakazamBase, weight: 2 },
      { ...CARDS.chanseyBase, weight: 2 },
      { ...CARDS.raichuBase, weight: 1.5 },
      { ...CARDS.zapdosBase, weight: 1 },
      // 0.4% jackpot tier
      { ...CARDS.mewtwoBase, weight: 0.6 },
      { ...CARDS.venusaurBase, weight: 0.4 },
      { ...CARDS.blastoiseBase, weight: 0.25 },
      { ...CARDS.charizardBase, weight: 0.08 },
    ]),
  },

  {
    id: "eevee",
    name: "Eevee & Evolutions Box",
    nameFr: "La Caisse Évoli & Évolutions",
    description: "Évoli et toutes ses évolutions, tous sets confondus.",
    price: 0.5,
    tier: "common",
    gradient: { from: "#92400E", to: "#D97706", via: "#FBBF24" },
    glowColor: "rgba(217,119,6,0.4)",
    emoji: "🦊",
    cardPool: normalize([
      // 78% trash
      ...TRASH_POOL,
      // 17% commons / Évoli basique
      { ...CARDS.eeveeJungle, weight: 80 },
      // 4.5% évolutions Jungle holo
      { ...CARDS.flareon, weight: 10 },
      { ...CARDS.vaporeon, weight: 10 },
      { ...CARDS.jolteon, weight: 10 },
      // 0.4% évolutions modernes/Sinnoh
      { ...CARDS.glaceon, weight: 3 },
      { ...CARDS.leafeon, weight: 3 },
      { ...CARDS.sylveon, weight: 2 },
      // 0.08% Mentali/Noctali Neo (premium)
      { ...CARDS.espeonNeo, weight: 0.8 },
      { ...CARDS.umbreonNeo, weight: 0.6 },
      // 0.04% jackpot Gold Star
      { ...CARDS.goldStarEspeon, weight: 0.04 },
      { ...CARDS.goldStarUmbreon, weight: 0.03 },
    ]),
  },

  {
    id: "aquatic",
    name: "Aquatic Legends Box",
    nameFr: "La Caisse Aquatique",
    description: "Légendes des profondeurs, tous blocs mélangés.",
    price: 0.75,
    tier: "common",
    gradient: { from: "#0C4A6E", to: "#0EA5E9", via: "#7DD3FC" },
    glowColor: "rgba(14,165,233,0.4)",
    emoji: "🌊",
    cardPool: normalize([
      // 78% trash
      ...TRASH_POOL,
      // 17% communes aquatiques
      { ...CARDS.psyduckFossil, weight: 50 },
      { ...CARDS.squirtleBase, weight: 40 },
      { ...CARDS.lapras, weight: 30 },
      // 4% mid (EX/Holo aquatiques)
      { ...CARDS.miloticEX, weight: 8 },
      { ...CARDS.gyaradosBase, weight: 5 },
      { ...CARDS.vaporeon, weight: 5 },
      // 0.7% rare
      { ...CARDS.articunoFossil, weight: 2 },
      { ...CARDS.suicuneNeo, weight: 1.5 },
      { ...CARDS.feraligatrNeo, weight: 1.5 },
      { ...CARDS.kyogreEX, weight: 1 },
      { ...CARDS.palkiaGX, weight: 0.8 },
      // 0.2% premium
      { ...CARDS.blastoiseBase, weight: 0.5 },
      { ...CARDS.inteleonVMAX, weight: 0.3 },
      // 0.05% jackpot Lugia
      { ...CARDS.lugiaNeo, weight: 0.1 },
      { ...CARDS.crystalLugia, weight: 0.005 },
    ]),
  },

  {
    id: "rocket",
    name: "Team Rocket Box",
    nameFr: "La Caisse Team Rocket",
    description: "Le set culte de 2000 — toutes les cartes Dark.",
    price: 1.2,
    tier: "common",
    gradient: { from: "#450A0A", to: "#7F1D1D", via: "#DC2626" },
    glowColor: "rgba(220,38,38,0.45)",
    emoji: "🃏",
    badge: "NICHE",
    cardPool: normalize([
      // 75% trash (Team Rocket vibe : Ekans plus présent)
      ...TRASH_POOL,
      { ...CARDS.ekans, weight: 80 },
      // 17% communes thématiques
      { ...CARDS.rocketsMeowth, weight: 40 },
      { ...CARDS.giovanni, weight: 20 },
      // 5% Dark Pokémon
      { ...CARDS.darkAlakazam, weight: 4 },
      { ...CARDS.darkGengar, weight: 4 },
      // 1.5% Dark Blastoise
      { ...CARDS.darkBlastoise, weight: 2 },
      // 0.5% Dark Charizard
      { ...CARDS.darkCharizard, weight: 0.5 },
      // 0.15% jackpot Dark Raichu (secret rare)
      { ...CARDS.darkRaichu, weight: 0.15 },
    ]),
  },

  // ─── Tier 2 — Intermediate ────────────────────────────────────────────
  {
    id: "mewtwo",
    name: "Mewtwo Box",
    nameFr: "La Caisse Méwtwo",
    description: "Le légendaire psychique sous toutes ses formes.",
    price: 2.0,
    tier: "intermediate",
    gradient: { from: "#1E1B4B", to: "#7C3AED", via: "#A78BFA" },
    glowColor: "rgba(124,58,237,0.45)",
    emoji: "🧠",
    cardPool: normalize([
      // 80% trash (Psy-themed : Abra/Zubat/Gastly plus présents)
      ...TRASH_POOL,
      { ...CARDS.abra, weight: 80 },
      { ...CARDS.gastly, weight: 80 },
      // 15% mid Mew
      { ...CARDS.mew, weight: 60 },
      { ...CARDS.mewEX, weight: 15 },
      // 3% rare Mewtwo
      { ...CARDS.mewtwoGX, weight: 5 },
      { ...CARDS.mewtwoEX, weight: 4 },
      { ...CARDS.mewtwoBase, weight: 1.5 },
      // 0.7% premium
      { ...CARDS.mewtwoVMAX, weight: 0.7 },
      { ...CARDS.mewtwoMewGX, weight: 0.4 },
      // 0.05% jackpot Shining
      { ...CARDS.shiningMewtwo, weight: 0.05 },
    ]),
  },

  {
    id: "birdsbeasts",
    name: "Legendary Birds & Beasts Box",
    nameFr: "La Caisse Oiseaux & Bêtes Légendaires",
    description: "Les légendaires Gen 1 et 2 iconiques.",
    price: 2.5,
    tier: "intermediate",
    gradient: { from: "#831843", to: "#DB2777", via: "#F472B6" },
    glowColor: "rgba(219,39,119,0.45)",
    emoji: "🦅",
    cardPool: normalize([
      // 78% trash (Spearow/Pidgey plus présents)
      ...TRASH_POOL,
      { ...CARDS.spearow, weight: 80 },
      { ...CARDS.pidgey, weight: 80 },
      // 18% commons légendaires
      { ...CARDS.articunoFossil, weight: 20 },
      { ...CARDS.zapdosFossil, weight: 20 },
      { ...CARDS.moltresFossil, weight: 20 },
      // 3% bêtes Neo
      { ...CARDS.suicuneNeo, weight: 4 },
      { ...CARDS.enteiNeo, weight: 4 },
      { ...CARDS.raikouNeo, weight: 4 },
      // 0.5% Ho-Oh
      { ...CARDS.hoOhNeo, weight: 0.6 },
      // 0.15% jackpot Lugia
      { ...CARDS.lugiaNeo, weight: 0.15 },
    ]),
  },

  {
    id: "dragons",
    name: "Legendary Dragons Box",
    nameFr: "La Caisse Dragons Légendaires",
    description: "Tous les dragons redoutables — EX, GX, VMAX.",
    price: 3.0,
    tier: "intermediate",
    gradient: { from: "#312E81", to: "#6366F1", via: "#A5B4FC" },
    glowColor: "rgba(99,102,241,0.45)",
    emoji: "🐉",
    cardPool: normalize([
      // 80% trash
      ...TRASH_POOL,
      // 15% commons dragons
      { ...CARDS.haxorus, weight: 50 },
      { ...CARDS.rotomGX, weight: 30 },
      // 4% EX/GX
      { ...CARDS.dragoniteEX, weight: 6 },
      { ...CARDS.garchompGX, weight: 4 },
      // 0.5% VMAX
      { ...CARDS.rayquazaVMAX, weight: 0.7 },
      // 0.05% jackpot Gold Star
      { ...CARDS.goldStarRayquaza, weight: 0.05 },
    ]),
  },

  {
    id: "tagteam",
    name: "Tag Team GX Box",
    nameFr: "La Caisse Tag Team",
    description: "Les iconiques Tag Team GX de l'ère Soleil & Lune.",
    price: 4.0,
    tier: "intermediate",
    gradient: { from: "#0F766E", to: "#14B8A6", via: "#5EEAD4" },
    glowColor: "rgba(20,184,166,0.45)",
    emoji: "⚡",
    cardPool: normalize([
      // 78% trash
      ...TRASH_POOL,
      // 16% Pikachu & Zekrom (entrée Tag Team)
      { ...CARDS.pikaZekromGX, weight: 50 },
      { ...CARDS.celebiVenusaurGX, weight: 30 },
      // 5% Mewtwo & Mew / Charizard & Braixen
      { ...CARDS.mewtwoMewGX, weight: 5 },
      { ...CARDS.charizardBraixenGX, weight: 3 },
      // 0.5% jackpot Reshiram & Charizard
      { ...CARDS.reshiramCharizardGX, weight: 0.5 },
    ]),
  },

  {
    id: "vmax",
    name: "VMAX Secrets Box",
    nameFr: "La Caisse VMAX Secrets",
    description: "Versions Secret Rainbow uniquement — Épée & Bouclier.",
    price: 5.0,
    tier: "intermediate",
    gradient: { from: "#581C87", to: "#A855F7", via: "#E879F9" },
    glowColor: "rgba(168,85,247,0.5)",
    emoji: "🌈",
    isFeatured: true,
    cardPool: normalize([
      // 78% trash
      ...TRASH_POOL,
      // 17% VMAX "petits"
      { ...CARDS.corviknightVMAX, weight: 50 },
      { ...CARDS.inteleonVMAX, weight: 30 },
      // 4% Eternatus / Gengar / Rayquaza VMAX
      { ...CARDS.eternatusVMAX, weight: 5 },
      { ...CARDS.gengarVMAX, weight: 3 },
      { ...CARDS.rayquazaVMAX, weight: 2 },
      // 0.2% jackpot Charizard VMAX
      { ...CARDS.charizardVMAX, weight: 0.2 },
    ]),
  },

  // ─── Tier 3 — Premium / Niche ────────────────────────────────────────
  {
    id: "shinings",
    name: "Neo Destiny Shinings Box",
    nameFr: "La Caisse Shinings",
    description: "Les légendaires Pokémon Shining de Neo Destiny (2002).",
    price: 10.0,
    tier: "premium",
    gradient: { from: "#0E7490", to: "#06B6D4", via: "#67E8F9" },
    glowColor: "rgba(6,182,212,0.5)",
    emoji: "✨",
    badge: "NICHE",
    isNew: true,
    cardPool: normalize([
      // 75% trash (toujours le cœur de l'EV)
      ...TRASH_POOL,
      // 16% Pokémon basiques eau (thème Magikarp/Gyarados)
      { ...CARDS.magikarp, weight: 60 },
      { ...CARDS.lapras, weight: 30 },
      // 6% Shining bottom-tier
      { ...CARDS.shiningMagikarp, weight: 10 },
      { ...CARDS.shiningGyarados, weight: 6 },
      // 2% Shining mid
      { ...CARDS.shiningRaichu, weight: 2 },
      { ...CARDS.shiningMewtwo, weight: 1.5 },
      // 0.15% jackpot Shining Charizard
      { ...CARDS.shiningCharizard, weight: 0.15 },
    ]),
  },

  {
    id: "crystal",
    name: "Crystal Box",
    nameFr: "La Caisse Cristal",
    description:
      "Aquapolis & Skyridge — les mythiques cristaux holographiques.",
    price: 15.0,
    tier: "premium",
    gradient: { from: "#1E40AF", to: "#3B82F6", via: "#93C5FD" },
    glowColor: "rgba(59,130,246,0.55)",
    emoji: "💎",
    badge: "COLLECTOR",
    cardPool: normalize([
      // 75% trash
      ...TRASH_POOL,
      // 18% mid Aquapolis-era commons (placeholder via existing card pool)
      { ...CARDS.psyduckFossil, weight: 30 },
      { ...CARDS.lapras, weight: 25 },
      { ...CARDS.gyaradosBase, weight: 20 },
      // 5% Crystals bas-tier
      { ...CARDS.crystalNidoking, weight: 8 },
      // 2% Crystals premium
      { ...CARDS.crystalCelebi, weight: 1.5 },
      { ...CARDS.crystalHoOh, weight: 1 },
      // 0.4% jackpot
      { ...CARDS.crystalLugia, weight: 0.3 },
      { ...CARDS.crystalCharizard, weight: 0.1 },
    ]),
  },

  {
    id: "goldstar",
    name: "Gold Star Box",
    nameFr: "La Caisse Gold Star",
    description:
      "Les rarissimes Gold Star de l'ère EX (1/88 packs à l'époque).",
    price: 20.0,
    tier: "premium",
    gradient: { from: "#78350F", to: "#F59E0B", via: "#FCD34D" },
    glowColor: "rgba(245,158,11,0.55)",
    emoji: "⭐",
    badge: "NICHE",
    cardPool: normalize([
      // 72% trash
      ...TRASH_POOL,
      // 22% pokémon EX iconiques
      { ...CARDS.mewEX, weight: 30 },
      { ...CARDS.mewtwoEX, weight: 20 },
      { ...CARDS.dragoniteEX, weight: 20 },
      { ...CARDS.miloticEX, weight: 30 },
      // 5% Gold Star "entrée"
      { ...CARDS.goldStarMew, weight: 4 },
      { ...CARDS.goldStarPikachu, weight: 3 },
      // 0.7% Gold Star moyens
      { ...CARDS.goldStarRayquaza, weight: 0.8 },
      { ...CARDS.goldStarEspeon, weight: 0.4 },
      { ...CARDS.goldStarUmbreon, weight: 0.2 },
      // 0.05% jackpot Charizard Gold Star
      { ...CARDS.goldStarCharizard, weight: 0.05 },
    ]),
  },

  // ─── Tier 4 — Ultra Premium ──────────────────────────────────────────
  {
    id: "charizard",
    name: "The Charizard Box",
    nameFr: "La Caisse Dracolosse",
    description: "Toutes les versions de Dracaufeu, de tous les sets.",
    price: 50.0,
    tier: "ultra",
    gradient: { from: "#7F1D1D", to: "#EA580C", via: "#FBBF24" },
    glowColor: "rgba(234,88,12,0.6)",
    emoji: "🔥",
    badge: "MEGA",
    isFeatured: true,
    cardPool: normalize([
      // 65% trash (la maison gagne quand même souvent)
      ...TRASH_POOL,
      // 23% Salamèche/Dracaufeu basiques
      { ...CARDS.charmanderBase, weight: 200 },
      { ...CARDS.ninetalesBase, weight: 80 },
      // 8% Dracaufeu Base/Dark
      { ...CARDS.charizardBase, weight: 12 },
      { ...CARDS.darkCharizard, weight: 8 },
      // 3% Dracaufeu GX/VMAX
      { ...CARDS.charizardBraixenGX, weight: 3 },
      { ...CARDS.charizardVMAX, weight: 2 },
      // 0.6% Shining Charizard
      { ...CARDS.shiningCharizard, weight: 0.7 },
      // 0.1% Crystal/Gold Star Charizard
      { ...CARDS.crystalCharizard, weight: 0.15 },
      { ...CARDS.goldStarCharizard, weight: 0.1 },
      // 0.02% 1ère Édition
      { ...CARDS.charizardBase1stEd, weight: 0.025 },
    ]),
  },

  {
    id: "mythic",
    name: "Mythic Box",
    nameFr: "La Caisse Mythique",
    description: "Les cartes les plus précieuses de l'histoire du TCG Pokémon.",
    price: 100.0,
    tier: "ultra",
    gradient: { from: "#FFD700", to: "#FFA500", via: "#FFEB3B" },
    glowColor: "rgba(255,215,0,0.7)",
    emoji: "👑",
    badge: "JACKPOT",
    isFeatured: true,
    cardPool: normalize([
      // 60% trash
      ...TRASH_POOL,
      // 28% mid (Charizard Base, Shinings communs)
      { ...CARDS.charizardBase, weight: 100 },
      { ...CARDS.shiningMagikarp, weight: 60 },
      { ...CARDS.shiningGyarados, weight: 50 },
      // 8% premium
      { ...CARDS.shiningCharizard, weight: 5 },
      { ...CARDS.goldStarRayquaza, weight: 4 },
      { ...CARDS.crystalLugia, weight: 3 },
      // 2% ultra premium
      { ...CARDS.goldStarCharizard, weight: 1.5 },
      { ...CARDS.crystalCharizard, weight: 0.8 },
      // 0.3% 1ère Édition Charizard
      { ...CARDS.charizardBase1stEd, weight: 0.3 },
      // 0.01% Pikachu Illustrator (le saint Graal)
      { ...CARDS.pikachuIllustrator, weight: 0.01 },
    ]),
  },

  // ═══════════ TIER 5 — WHALE TERRITORY ($500+) ═══════════
  {
    id: "diamond",
    name: "Diamond Box",
    nameFr: "La Caisse Diamant",
    description: "Pour les vrais. Du brillant à perte de vue.",
    price: 500.0,
    tier: "ultra",
    gradient: { from: "#0EA5E9", to: "#06B6D4", via: "#E0F2FE" },
    glowColor: "rgba(14,165,233,0.7)",
    emoji: "💎",
    badge: "WHALE",
    cardPool: normalize([
      // 50% trash (oui, même à $500 tu peux paumer)
      ...TRASH_POOL,
      // 30% mid légendaires (Base Set holos)
      { ...CARDS.charizardBase, weight: 80 },
      { ...CARDS.darkCharizard, weight: 60 },
      { ...CARDS.darkRaichu, weight: 50 },
      // 12% Shining
      { ...CARDS.shiningMewtwo, weight: 8 },
      { ...CARDS.shiningRaichu, weight: 6 },
      { ...CARDS.shiningCharizard, weight: 3 },
      // 6% Crystals & Gold Stars premium
      { ...CARDS.crystalCharizard, weight: 3 },
      { ...CARDS.crystalLugia, weight: 2.5 },
      { ...CARDS.goldStarCharizard, weight: 2 },
      { ...CARDS.goldStarUmbreon, weight: 1.5 },
      // 1% jackpot
      { ...CARDS.charizardBase1stEd, weight: 1 },
      // 0.03% Pikachu Illustrator
      { ...CARDS.pikachuIllustrator, weight: 0.03 },
    ]),
  },

  {
    id: "emerald",
    name: "Emerald Box",
    nameFr: "La Caisse Émeraude",
    description: "Quatre chiffres. Garde la foi.",
    price: 1000.0,
    tier: "ultra",
    gradient: { from: "#065F46", to: "#10B981", via: "#6EE7B7" },
    glowColor: "rgba(16,185,129,0.7)",
    emoji: "🟢",
    badge: "WHALE",
    cardPool: normalize([
      // 45% trash
      ...TRASH_POOL,
      // 30% mid Shining
      { ...CARDS.shiningMagikarp, weight: 80 },
      { ...CARDS.shiningGyarados, weight: 60 },
      { ...CARDS.shiningRaichu, weight: 50 },
      // 15% Crystals & Shinings premium
      { ...CARDS.shiningMewtwo, weight: 15 },
      { ...CARDS.crystalNidoking, weight: 12 },
      { ...CARDS.crystalCelebi, weight: 10 },
      { ...CARDS.crystalHoOh, weight: 8 },
      // 6% top Crystals & Shining Charizard
      { ...CARDS.shiningCharizard, weight: 4 },
      { ...CARDS.crystalLugia, weight: 3 },
      { ...CARDS.crystalCharizard, weight: 2 },
      // 3% Gold Stars
      { ...CARDS.goldStarMew, weight: 1.5 },
      { ...CARDS.goldStarPikachu, weight: 1.2 },
      { ...CARDS.goldStarRayquaza, weight: 0.8 },
      { ...CARDS.goldStarUmbreon, weight: 0.5 },
      // 0.5% Charizard 1st Ed
      { ...CARDS.charizardBase1stEd, weight: 0.6 },
      // 0.02% Pikachu Illustrator
      { ...CARDS.pikachuIllustrator, weight: 0.02 },
    ]),
  },

  {
    id: "royal",
    name: "Royal Box",
    nameFr: "La Caisse Royale",
    description: "Un mois de loyer. Ou une carte mythique.",
    price: 5000.0,
    tier: "ultra",
    gradient: { from: "#581C87", to: "#7C3AED", via: "#DDD6FE" },
    glowColor: "rgba(124,58,237,0.75)",
    emoji: "👑",
    badge: "WHALE",
    cardPool: normalize([
      // 40% trash
      ...TRASH_POOL,
      // 28% Shinings
      { ...CARDS.shiningMagikarp, weight: 60 },
      { ...CARDS.shiningGyarados, weight: 50 },
      { ...CARDS.shiningRaichu, weight: 40 },
      { ...CARDS.shiningMewtwo, weight: 20 },
      // 18% Crystals & Gold Stars
      { ...CARDS.crystalNidoking, weight: 25 },
      { ...CARDS.crystalCelebi, weight: 18 },
      { ...CARDS.crystalHoOh, weight: 12 },
      { ...CARDS.goldStarMew, weight: 8 },
      { ...CARDS.goldStarPikachu, weight: 6 },
      // 8% premium top tier
      { ...CARDS.shiningCharizard, weight: 6 },
      { ...CARDS.crystalLugia, weight: 4 },
      { ...CARDS.crystalCharizard, weight: 3 },
      { ...CARDS.goldStarRayquaza, weight: 5 },
      { ...CARDS.goldStarUmbreon, weight: 3 },
      { ...CARDS.goldStarEspeon, weight: 2 },
      { ...CARDS.goldStarCharizard, weight: 1.5 },
      // 1% jackpot
      { ...CARDS.charizardBase1stEd, weight: 1 },
      // 0.05% Pikachu Illustrator
      { ...CARDS.pikachuIllustrator, weight: 0.05 },
    ]),
  },

  {
    id: "ancient",
    name: "Ancient Box",
    nameFr: "La Caisse Ancienne",
    description: "Le sommet. Ici on touche au mythe.",
    price: 10000.0,
    tier: "ultra",
    gradient: { from: "#7C2D12", to: "#DC2626", via: "#FCD34D" },
    glowColor: "rgba(220,38,38,0.85)",
    emoji: "🏛️",
    badge: "JACKPOT",
    isFeatured: true,
    cardPool: normalize([
      // 35% trash (oui, même ici)
      ...TRASH_POOL,
      // 25% Shinings/Charizards
      { ...CARDS.charizardBase, weight: 60 },
      { ...CARDS.shiningCharizard, weight: 30 },
      { ...CARDS.shiningMewtwo, weight: 20 },
      // 20% Crystals premium
      { ...CARDS.crystalCharizard, weight: 15 },
      { ...CARDS.crystalLugia, weight: 12 },
      { ...CARDS.crystalHoOh, weight: 10 },
      { ...CARDS.crystalCelebi, weight: 8 },
      // 14% Gold Stars
      { ...CARDS.goldStarCharizard, weight: 8 },
      { ...CARDS.goldStarUmbreon, weight: 6 },
      { ...CARDS.goldStarEspeon, weight: 5 },
      { ...CARDS.goldStarRayquaza, weight: 5 },
      { ...CARDS.goldStarMew, weight: 4 },
      // 5% Charizard 1ère Édition
      { ...CARDS.charizardBase1stEd, weight: 5 },
      // 0.1% Pikachu Illustrator
      { ...CARDS.pikachuIllustrator, weight: 0.1 },
    ]),
  },
];

// ── Tirage de grade (PSA / Raw) ─────────────────────────────────────────
import type { Grade, GradeWeights, OpeningResult } from "@/types/game";
import { GRADE_PRICE_MULTIPLIER } from "@/types/game";

// Distribution par défaut quand un pack ne définit ni `gradeWeights[cardId]`
// ni `defaultGradeWeights`. Heuristique : Raw majoritaire, PSA 10 très rare.
export const DEFAULT_GRADE_WEIGHTS: GradeWeights = {
  raw: 72,
  "psa-5": 15,
  "psa-8": 8,
  "psa-9": 4,
  "psa-10": 1,
};

// Cartes communes (rarity == 'common' | 'uncommon') ne peuvent pas sortir en
// PSA 10 — gradage des cartes < 5 \$ est économiquement absurde sur le marché réel.
const LOW_RARITY_GRADE_WEIGHTS: GradeWeights = {
  raw: 92,
  "psa-5": 7,
  "psa-8": 1,
  "psa-9": 0,
  "psa-10": 0,
};

// ══════════════════════════════════════════════════════════════════════════
// REBALANCER — ajuste les dropRates pour cibler un house edge par tier
// ══════════════════════════════════════════════════════════════════════════
//
// Les cardPools dans RAW_PACKS représentent l'INTENT du game designer
// (quelles cartes appartiennent au pack, quel poids relatif). Mais ces
// poids ne garantissent pas un EV économiquement sain — un Pikachu
// Illustrator à $6M (ceiling $72M PSA10) dans un pack à $0.10 fait
// exploser l'EV à $288 (audit du 14/05, EV ratio 2880×, edge -288000%).
//
// On applique donc une transformation finale : binary-search sur un
// exposant α qui amplifie/atténue les poids selon l'EV de chaque carte
// (high-EV cards pénalisées plus que les trash). On cible un edge par
// tier proche du marché casino TCG :
//
//   starter      18%  (cheap packs, gros edge — fournit le funnel)
//   common       14%
//   intermediate 11%
//   premium      9%
//   ultra        7%   (whale, faible edge pour attirer)
//
// Référence : Hellcase ~5-12%, Roobet ~8-15%, CSGO Empire ~10%.
//
// La transformation `w_i *= α^(ev_i / maxEv)` est monotone en α :
// décroissante en α si w_i est high-EV, donc binary search converge
// vers l'α qui donne l'EV cible exact. Pas de mutation chirurgicale
// du pool, pas de cartes retirées — les drop rates s'auto-ajustent.

const EDGE_BY_TIER: Record<Pack["tier"], number> = {
  starter: 0.18,
  common: 0.14,
  intermediate: 0.11,
  premium: 0.09,
  ultra: 0.07,
};

function normalizeGrades(g: GradeWeights): Record<Grade, number> {
  const total = Object.values(g).reduce((s, w) => s + w, 0);
  return Object.fromEntries(
    Object.entries(g).map(([k, w]) => [k, w / total]),
  ) as Record<Grade, number>;
}

// Espérance du prix d'une carte sur la distribution de grade.
function evWithGrades(card: GameCard, grades: GradeWeights): number {
  const norm = normalizeGrades(grades);
  return (Object.entries(norm) as [Grade, number][]).reduce(
    (s, [g, p]) => s + p * card.value * GRADE_PRICE_MULTIPLIER[g],
    0,
  );
}

// Grade weights effectifs pour une carte donnée — réplique exacte de la
// logique runtime de `pickGradeWeights` pour que rebalancer et roll
// utilisent la même base d'EV.
function effectiveGradesFor(pack: Pack, card: GameCard): GradeWeights {
  const override = pack.gradeWeights?.[card.id];
  if (override) return override;
  if (pack.defaultGradeWeights) return pack.defaultGradeWeights;
  if (card.rarity === "common" || card.rarity === "uncommon")
    return LOW_RARITY_GRADE_WEIGHTS;
  return DEFAULT_GRADE_WEIGHTS;
}

function rebalancePack(pack: Pack): Pack {
  const targetEdge = EDGE_BY_TIER[pack.tier];
  const targetEV = pack.price * (1 - targetEdge);

  // EV par carte avec la VRAIE distribution de grade qui sera utilisée
  // au tirage (cf. `pickGradeWeights`) — sinon le rebalancer sur-estime
  // l'EV des packs starter qui sont pleins de commons / uncommons
  // (lesquels ne peuvent PAS sortir en PSA 10 via LOW_RARITY_GRADE_WEIGHTS).
  const evPer = pack.cardPool.map((c) =>
    evWithGrades(c, effectiveGradesFor(pack, c)),
  );

  // Exposant de pénalité par carte. log10(ev/price + 1) :
  //   - card ev ≤ 0       → 0           (trash, pas de pénalité)
  //   - card ev = price   → log10(2)≈0.30 (légère pénalité)
  //   - card ev = 10×price → log10(11)≈1.04
  //   - card ev = 100×price → log10(101)≈2.00
  //   - card ev = 10000×price → log10(10001)≈4.00
  // Choix vs `ev/maxEv` initialement utilisé : log10 a un meilleur dynamic
  // range. Si maxEv est dominé par UNE carte ultra-rare ($72M PSA10), les
  // mid-tier cards ($4 Pikachu dans pack $0.20) avaient ev/maxEv proche de 0
  // donc échappaient au scaling et faisaient exploser l'EV. log10 répartit
  // la pénalité sur tout le spectre.
  const exp = evPer.map((ev) => (ev > 0 ? Math.log10(ev / pack.price + 1) : 0));

  const totalW = pack.cardPool.reduce((s, c) => s + c.dropRate, 0);
  const origProbs = pack.cardPool.map((c) => c.dropRate / totalW);

  // Calcule l'EV pour un exposant α donné (transformation monotone décroissante).
  const computeEV = (alpha: number): number => {
    const adjusted = origProbs.map((p, i) => p * Math.pow(alpha, exp[i]));
    const s = adjusted.reduce((a, b) => a + b, 0);
    return adjusted.reduce((sum, w, i) => sum + (w / s) * evPer[i], 0);
  };

  // Binary search geometrique sur α ∈ [1e-6, 1e6].
  let lo = 1e-6;
  let hi = 1e6;
  let alpha = 1;
  for (let i = 0; i < 80; i++) {
    alpha = Math.sqrt(lo * hi);
    const ev = computeEV(alpha);
    if (Math.abs(ev - targetEV) / targetEV < 0.01) break;
    if (ev > targetEV) hi = alpha;
    else lo = alpha;
  }

  // Applique l'exposant final + renormalise sur 100.
  const adjusted = origProbs.map((p, i) => p * Math.pow(alpha, exp[i]));
  const total = adjusted.reduce((s, w) => s + w, 0);
  return {
    ...pack,
    cardPool: pack.cardPool.map((c, i) => ({
      ...c,
      dropRate: (adjusted[i] / total) * 100,
    })),
  };
}

export const PACKS: Pack[] = RAW_PACKS.map(rebalancePack);

export const FREE_DAILY_LIMIT = 0;

export const STARTING_BALANCE = 10.0;

export function getPackById(id: string): Pack | undefined {
  return PACKS.find((p) => p.id === id);
}

// Tirage pondéré — les dropRates sont normalisés à somme = 100 par `normalize()`
export function rollCard(pack: Pack): GameCard {
  let roll = Math.random() * 100;
  for (const card of pack.cardPool) {
    roll -= card.dropRate;
    if (roll <= 0) return card;
  }
  return pack.cardPool[pack.cardPool.length - 1];
}

function pickGradeWeights(pack: Pack, card: GameCard): GradeWeights {
  const override = pack.gradeWeights?.[card.id];
  if (override) return override;
  if (pack.defaultGradeWeights) return pack.defaultGradeWeights;
  if (card.rarity === "common" || card.rarity === "uncommon")
    return LOW_RARITY_GRADE_WEIGHTS;
  return DEFAULT_GRADE_WEIGHTS;
}

// Tirage pondéré générique sur un Record<K, number>.
function weightedPickKey<K extends string>(weights: Record<K, number>): K {
  const entries = Object.entries(weights) as [K, number][];
  const total = entries.reduce((s, [, w]) => s + w, 0);
  if (total <= 0) return entries[0][0];
  let r = Math.random() * total;
  for (const [k, w] of entries) {
    r -= w;
    if (r <= 0) return k;
  }
  return entries[entries.length - 1][0];
}

export function rollGrade(pack: Pack, card: GameCard): Grade {
  return weightedPickKey(pickGradeWeights(pack, card));
}

// Calcul du prix pour un couple (carte, grade).
// En prod, ce lookup ira chercher `card_grade_prices` côté BDD via un cache mémoire
// rempli au boot par `src/lib/prices/aggregator.ts`. En attendant, on dérive du
// prix Raw stocké dans `GameCard.value` × multiplicateur de grade.
export function priceForGrade(card: GameCard, grade: Grade): number {
  // À remplacer par un lookup `priceTable[card.id]?.[grade]` quand l'API
  // est branchée (voir src/lib/prices/cache.ts).
  return parseFloat((card.value * GRADE_PRICE_MULTIPLIER[grade]).toFixed(2));
}

// Tirage complet : carte → grade → prix.
// C'est la fonction à appeler côté serveur sur ouverture de caisse.
// (Côté client elle peut être utilisée en mode démo / preview, mais le tirage
//  autorisant un crédit doit toujours venir du serveur.)
export function rollPackOutcome(
  pack: Pack,
): Omit<OpeningResult, "isNew" | "packId" | "openedAt"> {
  const card = rollCard(pack);
  const grade = rollGrade(pack, card);
  const price = priceForGrade(card, grade);
  return { card, grade, price };
}
