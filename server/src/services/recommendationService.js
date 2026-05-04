const dayPatterns = [
  ["Lundi", "Mardi", "Mercredi", "Vendredi", "Samedi", "Dimanche"],
  ["Lundi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
  ["Mardi", "Mercredi", "Jeudi", "Samedi", "Dimanche", "Lundi"]
];

const durationByIntensity = {
  Progressive: ["35-45 min", "40-50 min", "30-40 min"],
  Moderee: ["45-60 min", "50-60 min", "40-55 min"],
  Elevee: ["60-75 min", "55-70 min", "65-80 min"]
};

const summaryTemplates = {
  active: [
    "{name} attaque une semaine {intensityLower} avec {frequency} seances centrees sur {goalLower}, en alternant effort, technique et recuperation.",
    "{name} peut progresser avec {frequency} seances bien dosees: priorite a {goalLower}, controle du rythme et suivi des sensations.",
    "Plan ajuste pour {name}: {frequency} seances, intensite {intensityLower}, et progression mesurable autour de {goalLower}."
  ],
  renewal: [
    "{name} doit renouveler son abonnement; je propose une reprise {intensityLower} courte, technique et facile a relancer.",
    "Abonnement a verifier pour {name}. En attendant, ce plan reste {intensityLower}, avec des seances propres et progressives.",
    "{name} reprend sur une base {intensityLower}: volume controle, exercices simples et objectif {goalLower} sans surcharge."
  ]
};

const commonRecoveryTips = [
  "Dormir 7h minimum lors des jours d'entrainement.",
  "Garder une journee sans charge lourde apres les seances jambes.",
  "Mettre a jour le score de progression toutes les deux semaines.",
  "Noter l'energie ressentie apres chaque seance pour ajuster la charge.",
  "Ajouter 8 a 10 minutes de mobilite quand les courbatures restent fortes."
];

const nextReviewPool = [
  "Reevaluation conseillee apres 14 jours de suivi.",
  "Controle du programme apres 2 semaines ou 6 seances terminees.",
  "Ajustement recommande apres la prochaine mesure de progression.",
  "Revoir les charges et la recuperation dans 10 a 14 jours."
];

const recoverySessions = [
  {
    titles: ["recuperation active", "mobilite et respiration", "reset articulaire"],
    duration: ["25-35 min", "20-30 min", "30-40 min"],
    exercises: {
      Progressive: [
        ["Mobilite hanches/epaules", "Respiration 4-6", "Marche ou velo leger", "Etirements guides"],
        ["Auto-massage rapide", "Dead bug lent 2x10", "Velo doux 15 min", "Stretching global"]
      ],
      Moderee: [
        ["Flow mobilite 12 min", "Zone 2 velo 18 min", "Gainage doux 2x30 sec", "Retour au calme"],
        ["Marche inclinee facile", "Ouverture thoracique", "Respiration nasale", "Etirements hanches"]
      ],
      Elevee: [
        ["Mobilite dynamique", "Rameur technique 12 min", "Core controle 3 tours", "Etirements actifs"],
        ["Velo zone 2 20 min", "Band pull-apart 3x15", "Copenhagen court 2x20 sec", "Respiration"]
      ]
    },
    videoQueries: [
      "mobility routine gym recovery",
      "active recovery workout stretching",
      "foam rolling mobility routine gym"
    ],
    recovery: true
  }
];

const exerciseBank = {
  "Perte de poids": {
    baseFrequency: 4,
    focus: ["cardio metabolique", "circuit full body", "core solide", "mobilite active"],
    nutrition: [
      "Prioriser la regularite, l'hydratation et un leger deficit calorique controle.",
      "Construire les repas autour des proteines, legumes et glucides doses autour des seances.",
      "Garder une hydratation stable et limiter les snacks liquides riches en calories."
    ],
    sessions: [
      {
        titles: ["cardio incline + core", "tapis incline et gainage", "cardio progressif"],
        exercises: {
          Progressive: [
            ["Marche inclinee 12 min", "Squat goblet 3x10", "Tirage poulie 3x10", "Planche 3x25 sec"],
            ["Velo elliptique 12 min", "Step-up bas 3x10", "Rowing assis 3x10", "Dead bug 3x12"]
          ],
          Moderee: [
            ["Tapis incline 15 min", "Squat goblet 4x10", "Tirage vertical 4x10", "Planche 4x30 sec"],
            ["Rameur 8x45 sec", "Fentes statiques 3x12", "Pompes inclinees 3x12", "Mountain climber 3x30 sec"]
          ],
          Elevee: [
            ["Intervalles tapis 10x45 sec", "Squat 4x8", "Renegade row 4x8", "Core anti-rotation 4x12"],
            ["Rameur sprint 12x30 sec", "Thruster haltere 4x10", "Traction assistee 4x8", "Planche dynamique 4x35 sec"]
          ]
        },
        videoQueries: [
          "incline treadmill fat loss workout beginner",
          "gym core workout for fat loss",
          "low impact cardio gym workout"
        ]
      },
      {
        titles: ["circuit full body technique", "full body brule-graisse", "circuit force cardio"],
        exercises: {
          Progressive: [
            ["Presse a cuisses 3x12", "Pompes inclinees 3x8", "Rowing assis 3x10", "Velo 10 min"],
            ["Goblet squat 3x10", "Chest press 3x10", "Tirage horizontal 3x10", "Marche rapide 8 min"]
          ],
          Moderee: [
            ["Circuit 4 tours", "Presse 12 reps", "Rowing 12 reps", "Assault bike 45 sec"],
            ["Souleve terre kettlebell 4x10", "Push press leger 4x8", "Tirage TRX 4x10", "Sled push 6 allees"]
          ],
          Elevee: [
            ["Circuit 5 tours", "Kettlebell swing 15 reps", "Burpees adaptes 10 reps", "Farmer walk 30 m"],
            ["EMOM 18 min", "Bike sprint", "Wall ball", "Core rotation cable"]
          ]
        },
        videoQueries: [
          "full body circuit workout gym fat loss",
          "metabolic conditioning gym workout",
          "beginner full body gym circuit"
        ]
      },
      {
        titles: ["bas du corps metabolique", "jambes + cardio controle", "lower body conditioning"],
        exercises: {
          Progressive: [
            ["Leg curl 3x12", "Hip thrust 3x12", "Step-up 3x10", "Marche inclinee 10 min"],
            ["Presse legere 3x12", "Fentes assistees 3x10", "Mollets debout 3x14", "Velo doux 12 min"]
          ],
          Moderee: [
            ["Squat goblet 4x10", "Hip thrust 4x10", "Leg curl 4x12", "Rameur 8 min"],
            ["Presse 4x12", "Fentes marchees 3x12", "Souleve roumain 3x10", "Bike intervals 8x30 sec"]
          ],
          Elevee: [
            ["Squat 5x5", "Hip thrust 5x8", "Walking lunge 4x14", "Sled push 8 allees"],
            ["Deadlift trap bar 4x6", "Bulgarian split squat 4x8", "Leg curl 4x10", "Rameur sprint 10x30 sec"]
          ]
        },
        videoQueries: [
          "lower body gym workout fat loss",
          "glutes legs conditioning workout",
          "sled push fat loss workout gym"
        ]
      },
      {
        titles: ["HIIT low impact", "intervalles propres", "cardio intelligent"],
        exercises: {
          Progressive: [
            ["Velo 6x1 min", "Repos 75 sec", "Battle rope technique 3x20 sec", "Etirements"],
            ["Elliptique 8x45 sec", "Step-up 3x10", "Farmer carry leger", "Respiration"]
          ],
          Moderee: [
            ["Rameur 10x45 sec", "Repos 45 sec", "Med ball slam 4x10", "Gainage lateral 3x30 sec"],
            ["Bike sprint 12x30 sec", "Kettlebell deadlift 4x12", "TRX row 4x10", "Planche 4x30 sec"]
          ],
          Elevee: [
            ["Assault bike 15x20 sec", "Repos 40 sec", "Sled push lourd", "Core finisher"],
            ["Rameur 500 m x4", "Burpee technique", "Farmer walk lourd", "Mobility cooldown"]
          ]
        },
        videoQueries: [
          "low impact HIIT gym workout",
          "rowing machine interval workout fat loss",
          "assault bike interval workout gym"
        ]
      },
      {
        titles: ["boxing cardio", "cardio boxing technique", "sacs + gainage"],
        exercises: {
          Progressive: [
            ["Shadow boxing 5x1 min", "Corde sans impact 3x45 sec", "Squat poids corps 3x12", "Planche 3x20 sec"],
            ["Sac leger 6x1 min", "Pas chasses 3x45 sec", "Rowing elastique 3x12", "Stretching epaules"]
          ],
          Moderee: [
            ["Sac 8x90 sec", "Corde 6x45 sec", "Med ball rotation 4x10", "Gainage 4x30 sec"],
            ["Combos 10 rounds", "Squat goblet 4x10", "Face pull 4x12", "Velo retour 8 min"]
          ],
          Elevee: [
            ["Sac 12x2 min", "Corde rapide 8x45 sec", "Sled push 6 allees", "Core explosif 4 tours"],
            ["Rounds intensifs 10x2 min", "Battle rope 6x30 sec", "Farmer walk", "Cooldown actif"]
          ]
        },
        videoQueries: [
          "cardio boxing workout gym beginner",
          "heavy bag workout fat loss",
          "boxing conditioning workout"
        ]
      }
    ]
  },
  "Prise de masse": {
    baseFrequency: 5,
    focus: ["hypertrophie", "force technique", "progression charge", "volume controle"],
    nutrition: [
      "Augmenter progressivement les apports proteines et calories avec suivi du poids.",
      "Ajouter une collation proteinee autour de l'entrainement et suivre les charges chaque semaine.",
      "Viser des repas complets et une progression lente du poids pour limiter la prise de gras."
    ],
    sessions: [
      {
        titles: ["push hypertrophie", "pectoraux epaules triceps", "push progression"],
        exercises: {
          Progressive: [
            ["Chest press 3x10", "Developpe halteres 3x10", "Elevation laterale 3x12", "Extension triceps 3x12"],
            ["Pompes inclinees 3x8", "Machine epaules 3x10", "Ecartes cable 3x12", "Corde triceps 3x12"]
          ],
          Moderee: [
            ["Developpe couche 4x8", "Developpe incline 4x10", "Elevation laterale 4x14", "Dips assistes 3x10"],
            ["Chest press 4x10", "Shoulder press 4x8", "Cable fly 4x12", "Triceps barre 4x10"]
          ],
          Elevee: [
            ["Developpe couche 5x5", "Incline haltere 4x8", "Dips lestes 4x8", "Extension triceps 4x12"],
            ["Top set bench", "Back-off 3x8", "Shoulder press lourd 4x6", "Lateral raise drop set"]
          ]
        },
        videoQueries: [
          "push day hypertrophy workout gym",
          "bench press technique hypertrophy",
          "chest shoulders triceps workout"
        ]
      },
      {
        titles: ["pull dos biceps", "tirage puissant", "pull hypertrophie"],
        exercises: {
          Progressive: [
            ["Tirage vertical 3x10", "Rowing assis 3x10", "Face pull 3x12", "Curl haltere 3x12"],
            ["Lat pulldown 3x10", "Rowing machine 3x12", "Reverse fly 3x12", "Curl cable 3x12"]
          ],
          Moderee: [
            ["Tractions assistees 4x8", "Rowing barre 4x8", "Tirage poulie 4x10", "Curl incline 3x12"],
            ["Lat pulldown 4x10", "Rowing un bras 4x10", "Face pull 4x14", "Curl marteau 4x10"]
          ],
          Elevee: [
            ["Tractions 5 series", "Rowing barre 5x6", "Tirage lourd 4x8", "Curl barre 4x8"],
            ["Deadlift technique 4x5", "Chest supported row 4x8", "Pullover cable 4x12", "Curl drop set"]
          ]
        },
        videoQueries: [
          "pull day hypertrophy back biceps workout",
          "lat pulldown rowing technique gym",
          "back workout for muscle growth gym"
        ]
      },
      {
        titles: ["jambes progression", "lower body hypertrophie", "quadriceps ischios"],
        exercises: {
          Progressive: [
            ["Presse a cuisses 3x12", "Leg curl 3x12", "Hip thrust 3x10", "Mollets 3x14"],
            ["Goblet squat 3x10", "Fente assistee 3x10", "Leg extension 3x12", "Gainage 3x25 sec"]
          ],
          Moderee: [
            ["Squat 4x8", "Souleve roumain 4x10", "Presse 4x12", "Mollets 4x15"],
            ["Hack squat 4x10", "Hip thrust 4x8", "Leg curl 4x12", "Fente marchee 3x12"]
          ],
          Elevee: [
            ["Squat 5x5", "Souleve roumain 5x6", "Presse lourde 4x10", "Mollets pause 5x12"],
            ["Front squat 4x6", "Hip thrust lourd 5x6", "Bulgarian split squat 4x8", "Leg curl drop set"]
          ]
        },
        videoQueries: [
          "leg day hypertrophy workout gym",
          "squat Romanian deadlift technique",
          "glutes quads hamstrings workout gym"
        ]
      },
      {
        titles: ["epaules bras", "deltoides et bras", "upper accessories"],
        exercises: {
          Progressive: [
            ["Shoulder press machine 3x10", "Elevation laterale 3x12", "Curl cable 3x12", "Triceps corde 3x12"],
            ["Landmine press 3x10", "Reverse fly 3x12", "Curl marteau 3x12", "Extension overhead 3x12"]
          ],
          Moderee: [
            ["Shoulder press 4x8", "Lateral raise 4x14", "Curl barre 4x10", "Skull crusher 3x10"],
            ["Arnold press 4x10", "Cable lateral 4x12", "Curl incline 4x10", "Rope pushdown 4x12"]
          ],
          Elevee: [
            ["OHP 5x5", "Elevation laterale mecanique", "Curl barre lourd 4x8", "Dips triceps 4x8"],
            ["Shoulder press lourd 4x6", "Rear delt row 4x12", "Curl superset", "Triceps superset"]
          ]
        },
        videoQueries: [
          "shoulder arms hypertrophy workout gym",
          "lateral raise technique delts",
          "biceps triceps workout gym"
        ]
      },
      {
        titles: ["full body lourd", "force totale", "base force"],
        exercises: {
          Progressive: [
            ["Deadlift kettlebell 3x10", "Chest press 3x10", "Tirage assis 3x10", "Farmer carry 3x25 m"],
            ["Presse 3x12", "Developpe halteres 3x10", "Lat pulldown 3x10", "Planche 3x25 sec"]
          ],
          Moderee: [
            ["Trap bar deadlift 4x6", "Bench press 4x8", "Rowing 4x8", "Farmer carry 4x30 m"],
            ["Squat 4x8", "Overhead press 4x8", "Tirage vertical 4x10", "Pallof press 3x12"]
          ],
          Elevee: [
            ["Deadlift 5x3", "Bench 5x5", "Rowing lourd 5x6", "Loaded carry 5 tours"],
            ["Squat top set", "Pull-up charge", "OHP 5x5", "Core lourd 4 tours"]
          ]
        },
        videoQueries: [
          "full body strength workout gym",
          "compound lifts technique workout",
          "muscle gain full body gym workout"
        ]
      }
    ]
  },
  "Condition physique": {
    baseFrequency: 4,
    focus: ["endurance", "mobilite", "force generale", "core training"],
    nutrition: [
      "Stabiliser les repas, privilegier la recuperation et les glucides autour des seances.",
      "Garder des repas simples et suffisamment hydrates pour soutenir l'endurance.",
      "Associer proteines, glucides de qualite et sommeil regulier pour mieux recuperer."
    ],
    sessions: [
      {
        titles: ["endurance base", "zone 2 propre", "cardio durable"],
        exercises: {
          Progressive: [
            ["Velo zone 2 20 min", "Squat poids corps 3x12", "Rowing elastique 3x12", "Respiration 3 min"],
            ["Marche inclinee 18 min", "Step-up 3x10", "Pallof press 3x10", "Etirements"]
          ],
          Moderee: [
            ["Rameur zone 2 25 min", "Goblet squat 4x10", "Tirage poulie 4x10", "Planche 4x30 sec"],
            ["Bike 30 min", "Fentes 3x12", "Pompes 3x10", "Dead bug 3x12"]
          ],
          Elevee: [
            ["Rameur 35 min rythme stable", "Squat 4x8", "Tractions 4x8", "Core anti-rotation 4x12"],
            ["Bike tempo 40 min", "Sled push 6 allees", "Farmer walk", "Mobility cooldown"]
          ]
        },
        videoQueries: [
          "zone 2 cardio gym workout",
          "endurance workout gym beginner",
          "rowing machine endurance workout"
        ]
      },
      {
        titles: ["force generale", "full body solide", "renforcement complet"],
        exercises: {
          Progressive: [
            ["Presse 3x12", "Chest press 3x10", "Tirage vertical 3x10", "Dead bug 3x12"],
            ["Goblet squat 3x10", "Pompes inclinees 3x8", "Rowing assis 3x10", "Farmer carry leger"]
          ],
          Moderee: [
            ["Squat goblet 4x10", "Developpe halteres 4x8", "Rowing 4x10", "Planche 4x35 sec"],
            ["Trap bar deadlift 4x6", "Push press 4x8", "Tirage poulie 4x10", "Carry 4x30 m"]
          ],
          Elevee: [
            ["Squat 5x5", "Bench 4x6", "Rowing barre 4x8", "Core lourd 4 tours"],
            ["Deadlift 4x5", "Overhead press 4x6", "Tractions 4x8", "Farmer walk lourd"]
          ]
        },
        videoQueries: [
          "full body functional strength workout gym",
          "general strength workout gym",
          "functional fitness gym workout"
        ]
      },
      {
        titles: ["mobilite dynamique", "amplitude et controle", "mobility strength"],
        exercises: {
          Progressive: [
            ["World greatest stretch", "Squat pause 3x8", "Band pull-apart 3x15", "Marche 10 min"],
            ["Mobilite hanches 8 min", "Step-down controle 3x8", "Scapula row 3x12", "Respiration"]
          ],
          Moderee: [
            ["Flow mobilite 12 min", "Cossack squat 3x8", "Landmine press 3x10", "Carry unilateral 3x30 m"],
            ["Hip airplanes assistes", "Goblet squat tempo 4x8", "Face pull 4x12", "Sled light"]
          ],
          Elevee: [
            ["Mobility flow avance", "Front squat tempo 4x6", "Turkish get-up 4x3", "Carry lourd unilateral"],
            ["Cossack squat charge 4x6", "Overhead carry", "Ring row controle", "Cooldown long"]
          ]
        },
        videoQueries: [
          "gym mobility routine strength",
          "dynamic mobility workout gym",
          "mobility strength workout"
        ]
      },
      {
        titles: ["core training", "gainage intelligent", "centre du corps"],
        exercises: {
          Progressive: [
            ["Dead bug 3x12", "Planche 3x25 sec", "Pallof press 3x10", "Velo 8 min"],
            ["Bird dog 3x10", "Side plank 3x20 sec", "Cable chop leger 3x10", "Marche"]
          ],
          Moderee: [
            ["Pallof press 4x12", "Hanging knee raise 4x8", "Planche lateral 4x30 sec", "Rameur 10 min"],
            ["Cable chop 4x12", "Dead bug charge 3x10", "Farmer carry 4x30 m", "Bike intervals"]
          ],
          Elevee: [
            ["Ab wheel 5x8", "Cable anti-rotation 4x12", "Farmer carry lourd", "Rameur sprint 8x30 sec"],
            ["Toes to bar progression", "Suitcase carry lourd", "Plank drag 4x10", "Bike finisher"]
          ]
        },
        videoQueries: [
          "core workout gym anti rotation",
          "abs core workout for athletes gym",
          "pallof press core workout"
        ]
      },
      {
        titles: ["conditioning mix", "athletic circuit", "capacite cardio force"],
        exercises: {
          Progressive: [
            ["Circuit 3 tours", "Step-up", "TRX row", "Velo 2 min", "Stretching"],
            ["Rameur 5 min", "Squat goblet 3x10", "Battle rope 3x20 sec", "Respiration"]
          ],
          Moderee: [
            ["Circuit 4 tours", "Kettlebell deadlift", "Push press leger", "Rameur 400 m"],
            ["Sled push 5 allees", "TRX row 4x10", "Med ball slam 4x10", "Planche"]
          ],
          Elevee: [
            ["Circuit 5 tours", "Sled push", "Pull-up", "Bike sprint", "Carry lourd"],
            ["EMOM 20 min", "Rameur", "Thruster", "Toes raise", "Mobility cooldown"]
          ]
        },
        videoQueries: [
          "athletic conditioning workout gym",
          "functional conditioning circuit gym",
          "hybrid cardio strength workout gym"
        ]
      }
    ]
  }
};

const normalizeGoal = (goal) => {
  if (!goal) return "Condition physique";
  const lower = goal.toLowerCase();
  if (lower.includes("poids") || lower.includes("perte")) return "Perte de poids";
  if (lower.includes("masse") || lower.includes("muscle")) return "Prise de masse";
  return "Condition physique";
};

const levelIntensity = (level, progressScore) => {
  const score = Number(progressScore ?? 0);
  const normalized = String(level ?? "").toLowerCase();

  if (normalized.includes("avance") || score >= 70) return "Elevee";
  if (normalized.includes("inter") || score >= 40) return "Moderee";
  return "Progressive";
};

const hashString = (value) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const createRng = (seed) => {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let result = Math.imul(state ^ (state >>> 15), 1 | state);
    result ^= result + Math.imul(result ^ (result >>> 7), 61 | result);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
};

const pick = (items, rng) => items[Math.floor(rng() * items.length)];

const shuffle = (items, rng) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

const rotate = (items, amount) => {
  if (!items.length) return items;
  const offset = amount % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
};

const fillTemplate = (template, values) =>
  Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), template);

const sessionDuration = (intensity, rng) => pick(durationByIntensity[intensity] || durationByIntensity.Progressive, rng);

const intensityKey = (intensity) => {
  if (intensity === "Elevee") return "Elevee";
  if (intensity === "Moderee") return "Moderee";
  return "Progressive";
};

const resolveExercises = (session, intensity, rng) => {
  const variants = session.exercises[intensityKey(intensity)] || session.exercises.Progressive || [];
  return [...pick(variants, rng)];
};

const youtubeSearchUrl = (query) => `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

const buildYoutubeRecommendations = (goal, sessions, rng) =>
  shuffle(sessions, rng)
    .slice(0, Math.min(4, sessions.length))
    .map((session) => {
      const query = pick(session.videoQueries, rng);
      return {
        title: `${session.day} - ${session.title}`,
        source: "YouTube",
        query,
        url: youtubeSearchUrl(query),
        reason: `Selectionnee pour completer la seance ${session.day.toLowerCase()} et l'objectif ${goal.toLowerCase()}.`
      };
    });

const buildWeek = ({ config, goal, intensity, weeklyFrequency, generationIndex, rng }) => {
  const workoutTemplates = rotate(shuffle(config.sessions, rng), generationIndex % config.sessions.length);
  const days = rotate(dayPatterns[generationIndex % dayPatterns.length], generationIndex).slice(0, weeklyFrequency);
  const recoverySlot = weeklyFrequency >= 4 ? 1 + Math.floor(rng() * Math.min(2, weeklyFrequency - 1)) : -1;
  let workoutCursor = 0;

  return days.map((day, index) => {
    const useRecovery = index === recoverySlot;
    const session = useRecovery ? pick(recoverySessions, rng) : workoutTemplates[workoutCursor % workoutTemplates.length];
    if (!useRecovery) workoutCursor += 1;

    const title = pick(session.titles, rng);
    return {
      day,
      title,
      duration: session.duration ? pick(session.duration, rng) : sessionDuration(intensity, rng),
      exercises: resolveExercises(session, intensity, rng),
      videoQueries: session.videoQueries,
      focus: useRecovery ? "Recuperation" : pick(config.focus, rng),
      recovery: Boolean(session.recovery)
    };
  });
};

export const generateTrainingRecommendation = (member) => {
  const goal = normalizeGoal(member.objective);
  const config = exerciseBank[goal];
  const attendanceCount = member.attendance?.filter((item) => item.status !== "ABSENT").length ?? 0;
  const progressScore = Number(member.progressScore ?? 0);
  const generationIndex = member.recommendations?.length ?? 0;
  const seedSource = [
    member.id,
    member.firstName,
    member.objective,
    progressScore,
    attendanceCount,
    generationIndex,
    Date.now(),
    Math.random()
  ].join("-");
  const seed = hashString(seedSource);
  const rng = createRng(seed);
  const consistencyBoost = attendanceCount >= 8 ? 1 : attendanceCount <= 2 ? -1 : 0;
  const weeklyFrequency = Math.max(3, Math.min(6, config.baseFrequency + consistencyBoost));
  const intensity = levelIntensity(member.level, progressScore);
  const hasActiveSubscription = member.subscriptions?.some((item) => item.status === "ACTIVE" && new Date(item.endDate) >= new Date());
  const firstName = member.firstName || "Ce membre";
  const focusTag = config.focus[generationIndex % config.focus.length];
  const weeklyStructure = buildWeek({ config, goal, intensity, weeklyFrequency, generationIndex, rng });
  const summaryPool = hasActiveSubscription ? summaryTemplates.active : summaryTemplates.renewal;
  const summary = `${fillTemplate(summaryPool[generationIndex % summaryPool.length], {
    name: firstName,
    frequency: weeklyFrequency,
    intensityLower: intensity.toLowerCase(),
    goalLower: goal.toLowerCase()
  })} Focus prioritaire: ${focusTag}.`;

  return {
    goal,
    summary,
    weeklyFrequency,
    intensity,
    plan: {
      variationId: seed.toString(36).toUpperCase(),
      profile: {
        level: member.level,
        progressScore,
        objective: member.objective,
        weightKg: member.weightKg,
        heightCm: member.heightCm
      },
      focusTag,
      weeklyStructure,
      youtubeVideos: buildYoutubeRecommendations(goal, weeklyStructure, rng),
      recovery: shuffle(commonRecoveryTips, rng).slice(0, 3),
      nutrition: pick(config.nutrition, rng),
      nextReview: pick(nextReviewPool, rng)
    }
  };
};
