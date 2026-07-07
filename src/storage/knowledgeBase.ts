import knowledgeBase from '../../data/knowledge-base.json'
import type { Locale } from '../i18n/types'

export interface AllergenScheduleEntry {
  days: number[]
  allergen: string
  product: string
  doses: string[]
}

export interface MenuDayEntry {
  day: number
  components: string[]
  allergenIntro: string | null
}

const kb = knowledgeBase as {
  principles: Record<string, unknown>
  allergenRules: Record<string, string>
  allergenSchedule: AllergenScheduleEntry[]
  dailyPlan: MenuDayEntry[]
}

export function getAllergenSchedule(): AllergenScheduleEntry[] {
  return kb.allergenSchedule
}

export function getAllergenRules(): Record<string, string> {
  return kb.allergenRules
}

export function getMenuDayEntry(day: number): MenuDayEntry | undefined {
  return kb.dailyPlan.find((entry) => entry.day === day)
}

export function findActiveAllergenBlock(menuDay: number): AllergenScheduleEntry | null {
  return kb.allergenSchedule.find((block) => block.days.includes(menuDay)) ?? null
}

export function getAllergenDayIndex(menuDay: number, block: AllergenScheduleEntry): number {
  return block.days.indexOf(menuDay) + 1
}

export interface GuidelineContent {
  whenToStart: string
  portionSize: string
  milkAndSolids: string
  healthyPlate: string
  varietyGoal: string
  textureTimeline: Record<string, string>
  forbidden: string[]
  allergenRules: Record<string, string>
}

const GUIDELINES: Record<Locale, GuidelineContent> = {
  uk: {
    whenToStart:
      'Близько 6 місяців; ознаки готовності: тримає голову, сидить з підтримкою, харчовий інтерес',
    portionSize: 'Чітких порцій немає; починати з маленьких, слідкувати за сигналами ситості',
    milkAndSolids: 'Прикорм у першій половині дня; за 30–60 хв до/після — половина порції ГВ/ШВ',
    healthyPlate: 'Білки, овочі, фрукти, вуглеводи; зернові в кожному прийомі при кількох прийомах',
    varietyGoal: 'Орієнтир ~100 різних продуктів до року; щодня нові продукти (крім днів введення алергенів)',
    textureTimeline: {
      '6': 'пюре',
      '7': 'давлене виделкою',
      '8': 'давлене з маленькими шматочками',
      '9': 'дрібні шматочки, поступово більші',
    },
    forbidden: [
      'Мед до 1 року (ботулізм)',
      'Сіль до 1 року',
      "Коров'яче молоко як напій до 1 року",
      'Соки до 3 років',
      'Сирі продукти тваринного походження до 5 років',
    ],
    allergenRules: kb.allergenRules,
  },
  en: {
    whenToStart:
      'Around 6 months; readiness signs: holds head, sits with support, shows food interest',
    portionSize: 'No fixed portions; start small and follow fullness cues',
    milkAndSolids: 'Solids in the first half of the day; breast/formula 30–60 min before or after',
    healthyPlate: 'Protein, vegetables, fruit, carbs; include grains when offering multiple meals',
    varietyGoal: 'Aim for ~100 different foods before age 1; offer new foods daily (except allergen intro days)',
    textureTimeline: {
      '6': 'smooth purée',
      '7': 'mashed with a fork',
      '8': 'mashed with small soft pieces',
      '9': 'small pieces, gradually larger',
    },
    forbidden: [
      'Honey before age 1 (botulism risk)',
      'Salt before age 1',
      'Cow’s milk as a drink before age 1',
      'Juice before age 3',
      'Raw animal products before age 5',
    ],
    allergenRules: {
      whenToIntroduce: 'From 6 months, in the first half of the day',
      onIntroDays: 'Other foods on the plan should already be familiar',
      consideredIntroduced: 'After 2–3 exposures with gradually increasing amount',
      restDay: 'No rest day required between doses',
      nextAllergen: '2–3 days after the previous one if no reaction',
      reactionPause: '14-day pause, then a small dose again (if reaction was not severe)',
    },
  },
  es: {
    whenToStart:
      'Alrededor de los 6 meses; señales: sostiene la cabeza, se sienta con apoyo, interés por la comida',
    portionSize: 'Sin porciones fijas; empezar con poco y seguir las señales de saciedad',
    milkAndSolids: 'Sólidos en la primera mitad del día; leche 30–60 min antes o después',
    healthyPlate: 'Proteína, verduras, fruta, carbohidratos; cereales en cada comida si hay varias tomas',
    varietyGoal: 'Objetivo ~100 alimentos distintos antes del año; nuevos alimentos a diario (salvo días de alérgenos)',
    textureTimeline: {
      '6': 'puré liso',
      '7': 'aplastado con tenedor',
      '8': 'aplastado con trozos pequeños',
      '9': 'trozos pequeños, cada vez mayores',
    },
    forbidden: [
      'Miel antes del año (botulismo)',
      'Sal antes del año',
      'Leche de vaca como bebida antes del año',
      'Zumos antes de los 3 años',
      'Productos animales crudos antes de los 5 años',
    ],
    allergenRules: {
      whenToIntroduce: 'Desde los 6 meses, en la primera mitad del día',
      onIntroDays: 'El resto de alimentos del plan deben ser ya conocidos',
      consideredIntroduced: 'Tras 2–3 exposiciones aumentando la cantidad',
      restDay: 'No hace falta día de descanso',
      nextAllergen: '2–3 días después del anterior si no hubo reacción',
      reactionPause: 'Pausa de 14 días, luego dosis pequeña de nuevo (si la reacción no fue grave)',
    },
  },
  de: {
    whenToStart:
      'Etwa mit 6 Monaten; Bereitschaft: hält den Kopf, sitzt mit Stütze, Interesse an Essen',
    portionSize: 'Keine festen Portionen; klein beginnen und Sättigungssignale beachten',
    milkAndSolids: 'Beikost am Vormittag; Milch 30–60 Min. davor oder danach',
    healthyPlate: 'Protein, Gemüse, Obst, Kohlenhydrate; Getreide bei mehreren Mahlzeiten',
    varietyGoal: 'Ziel ~100 verschiedene Lebensmittel im ersten Jahr; täglich Neues (außer Allergeneinführung)',
    textureTimeline: {
      '6': 'glattes Püree',
      '7': 'mit Gabel zerdrückt',
      '8': 'zerdrückt mit kleinen Stückchen',
      '9': 'kleine Stücke, allmählich größer',
    },
    forbidden: [
      'Honig vor dem 1. Lebensjahr (Botulismus)',
      'Salz vor dem 1. Lebensjahr',
      'Kuhmilch als Getränk vor dem 1. Lebensjahr',
      'Säfte vor dem 3. Lebensjahr',
      'Rohe tierische Produkte vor dem 5. Lebensjahr',
    ],
    allergenRules: {
      whenToIntroduce: 'Ab 6 Monaten, am Vormittag',
      onIntroDays: 'Andere Lebensmittel des Plans sollten schon bekannt sein',
      consideredIntroduced: 'Nach 2–3 Gaben mit steigender Menge',
      restDay: 'Kein Ruhetag nötig',
      nextAllergen: '2–3 Tage nach dem vorherigen, wenn keine Reaktion',
      reactionPause: '14 Tage Pause, dann wieder kleine Dosis (wenn Reaktion nicht schwer)',
    },
  },
}

export function getGuidelines(locale: Locale): GuidelineContent {
  return GUIDELINES[locale] ?? GUIDELINES.uk
}
