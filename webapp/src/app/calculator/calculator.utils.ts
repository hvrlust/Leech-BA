export interface Customer {
  ba?: string;
  rsn?: string;
  ironman: string;
  enhancer?: number;
}

export enum SKILL {
  agility,
  firemaking,
  mining
}

export enum ROLE {
  att,
  def,
  col,
  heal
}

export class CalculatorUtils {
  public static PRICE_QUEEN = 12000000;
  public static PRICE_PARTHM = 5000000; // 6-9 bxp
  public static PRICE_PARTHM_POINTS = 6500000; // 6-9 bxp
  public static PRICE_FULL_HM_UNLOCK = 10000000;

// BXP
  public static MULTIPLIER = 1; // 2 if double xp weekend
  public static NMA = 102636; // normal mode agility xp
  public static NMF = 299355; // normal mode firemaking
  public static NMM = 119742; // normal mode mining

// base rates for each level @wave 1
  public static HMA = [0, 1143, 1147, 1150, 1154, 1157, 1161, 1165, 1169, 1172, 1176, 1176, 1176, // 1-13
    1176, 1176, 1176, 1176, 1176, 1176, 1176, 1176, 1176, 1176, 1176, 1176, // 14-24
    1176, 1176, 1176, 1176, 1176, 1827, 1830, 1834, 1838, 1843, 1847, 1851, // 25-36
    1831, 1901, 1971, 2041, 2111, 2181, 2251, 2321, 2391, 2461, 2531, 2601, 2671, // 37-49
    3370, 3475, 3580, 3685, 3790, 5012, 5012, 5012, 5012, 5012, 5203, 5203, // 50-61
    5203, 5203, 5203, 5357, 5457, 5557, 5657, 5756, 5856, 5911, 5965, 6020, 6074, // 62-74
    6129, 6183, 6237, 6292, 6346, 6400, 6400, 6400, 6400, 6400, 7396, 7506, 7616, // 75-87
    7725, 7835, 7944, 7944, 7944, 7944, 7944, 7944, 7944, 7991, 8054, 8116];
  public static HMF = [0, 3144, 3144, 3144, 3144, 3144, 3144, 3144, 3144, 3144, 3144, 3144, 3144, 3144, 3144, // levels 1-14
    5236, 5236, 5236, 5236, 5236, 5236, 5236, 5236, 5236, 5236, 5236, 5236, 5236, 5236, 5236, // 15-29
    10366, 10366, 10366, 10366, 10366, 10366, 10366, 10366, 10366, 10366, 10366, 10366, // 30-41
    14032, 14032, 14032, // 42-44
    15284, 15284, 15284, 15284, 15284, 15284, 15284, 15284, 15284, 15284, 15284, 15284, 15284, 15284, // 45-58
    15284, 15284, 15284, 15284, 15284, 15284, 15284, 15284, 15284, 15284, 15284, 15284, 15284, 15284, // 59-72
    15284, 15284, 15284, 15284, 15284, 15284, 15284, 15284, 15284, 15284, // 72-82
    21392, 21392, 21392, 21392, 21392, 21392, 21392, 21392, 21392, // 83-91
    21392, 21392, 21392, 21392, 21392, 21392, 21392, 21392]; // 92-99
  public static HMM = 0; // parseInt(117.237*level+97.273)

// Points/round - UPDATE IF NECESSARY
  public static POINTS_KINGP = 210; // points for a king
  public static POINTS_NM = {
    [ROLE.att]: 250,
    [ROLE.def]: 250,
    [ROLE.heal]: 250,
    [ROLE.col]: 250
  };
  public static POINTS_HM = { // 1-9 hm
    [ROLE.att]: 354,
    [ROLE.def]: 414,
    [ROLE.heal]: 408,
    [ROLE.col]: 294
  };
  public static POINTS_PHM = { // 6-9 hm
    [ROLE.att]: 233,
    [ROLE.def]: 264,
    [ROLE.heal]: 271,
    [ROLE.col]: 192
  };

  public static LEVEL_POINTS = {
    1: 0,
    2: 200,
    3: 500,
    4: 900,
    5: 1400
  };

  public static skillStringToEnum(skill: string): SKILL {
    if (skill === 'agility') {
      return SKILL.agility;
    } else if (skill === 'firemaking') {
      return SKILL.firemaking;
    } else if (skill === 'mining') {
      return SKILL.mining;
    }
  }
}

