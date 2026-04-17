export const TSB_THRESHOLDS = {
  heavyLoad: -15,
  balancedMin: -5,
  balancedMax: 5,
  recovery: 10,
} as const;

export const WELLNESS_THRESHOLDS = {
  hrvMin: 30,
  hrvMax: 100,
  restingHrMin: 35,
  restingHrMax: 75,
  sleepMinHours: 5,
  sleepMaxHours: 10,
} as const;
