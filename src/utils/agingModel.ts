export type DogSize = 'small' | 'medium' | 'large' | 'giant';
export type CatContext = 'indoor' | 'outdoor' | 'indoor_outdoor' | 'large_breed';

// Pet Aging Hub's practical, mutually exclusive size bands; these are not AAHA categories.
export const dogSizeBands: ReadonlyArray<{ size: DogSize; minKg: number; maxKgExclusive: number | null; zh: string; en: string }> = [
  { size: 'small', minKg: 0, maxKgExclusive: 10, zh: '小型犬', en: 'Small' },
  { size: 'medium', minKg: 10, maxKgExclusive: 25, zh: '中型犬', en: 'Medium' },
  { size: 'large', minKg: 25, maxKgExclusive: 40, zh: '大型犬', en: 'Large' },
  { size: 'giant', minKg: 40, maxKgExclusive: null, zh: '巨型犬', en: 'Giant' },
];

export function getDogSizeByWeight(kg: number): DogSize | null {
  if (!Number.isFinite(kg) || kg < 0) return null;
  return dogSizeBands.find(({ minKg, maxKgExclusive }) => kg >= minKg && (maxKgExclusive === null || kg < maxKgExclusive))?.size ?? null;
}

export function getDogSizeLabel(size: DogSize, lang: 'zh' | 'en'): string {
  const band = dogSizeBands.find((item) => item.size === size);
  if (!band) throw new Error(`Unknown dog size: ${size}`);
  const range = band.maxKgExclusive === null
    ? (lang === 'zh' ? `${band.minKg} kg 以上` : `≥${band.minKg} kg`)
    : band.minKg === 0
      ? (lang === 'zh' ? `${band.maxKgExclusive} kg 以下` : `<${band.maxKgExclusive} kg`)
      : `${band.minKg}–<${band.maxKgExclusive} kg`;
  return `${lang === 'zh' ? band.zh : band.en} (${range})`;
}

// Human-age equivalence is a separate educational comparison, not a life-stage guideline.
const dogConversion: Record<DogSize, { firstYear: number; secondYear: number; laterYears: number }> = {
  small: { firstYear: 15, secondYear: 24, laterYears: 4 },
  medium: { firstYear: 15, secondYear: 24, laterYears: 5 },
  large: { firstYear: 15, secondYear: 24, laterYears: 6 },
  giant: { firstYear: 12, secondYear: 22, laterYears: 7 },
};

export function estimateDogHumanAge(age: number, size: DogSize): number {
  if (!Number.isFinite(age) || age <= 0) return 0;
  const model = dogConversion[size];
  if (age <= 1) return Math.round(age * model.firstYear);
  if (age <= 2) return Math.round(model.firstYear + (age - 1) * (model.secondYear - model.firstYear));
  return Math.round(model.secondYear + (age - 2) * model.laterYears);
}

export function estimateCatHumanAge(age: number): number {
  if (!Number.isFinite(age) || age <= 0) return 0;
  if (age <= 1) return Math.round(age * 15);
  if (age <= 2) return Math.round(15 + (age - 1) * 9);
  return Math.round(24 + (age - 2) * 4);
}

export function getDogLifeStage(age: number, size: DogSize): 'puppy' | 'adult' | 'senior' {
  if (age <= 1) return 'puppy';
  return age < getDogSeniorAge(size) ? 'adult' : 'senior';
}

export function getDogSeniorAge(size: DogSize): number {
  const [minimum, maximum] = lifespanRanges.dog[size];
  return ((minimum + maximum) / 2) * 0.75;
}

export function getCatLifeStage(age: number): 'kitten' | 'youngAdult' | 'matureAdult' | 'senior' {
  if (age < 1) return 'kitten';
  if (age < 7) return 'youngAdult';
  if (age <= 10) return 'matureAdult';
  return 'senior';
}

// General site reference ranges, not official veterinary guideline values.
export const lifespanRanges = {
  dog: { small: [12, 15], medium: [11, 14], large: [10, 12], giant: [7, 10] },
  cat: { indoor: [12, 18], outdoor: [5, 7], indoor_outdoor: [10, 15], large_breed: [12, 15] },
} as const;

export function estimateLifespanRange(
  species: 'dog' | 'cat',
  category: keyof typeof lifespanRanges.dog | CatContext,
): [number, number] {
  const ranges = species === 'dog'
    ? lifespanRanges.dog[category as keyof typeof lifespanRanges.dog]
    : lifespanRanges.cat[category as CatContext];
  return [ranges[0], ranges[1]];
}
