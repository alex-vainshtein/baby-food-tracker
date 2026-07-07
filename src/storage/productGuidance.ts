import type { FoodCategory } from '../types'
import type { Locale } from '../i18n/types'

export interface ProductGuidance {
  description: string
  recommendation: string
}

const TEXTURE: Record<Locale, Record<6 | 7 | 8 | 9, string>> = {
  uk: {
    6: 'пюре',
    7: 'давлене виделкою',
    8: 'давлене з маленькими шматочками',
    9: 'дрібні шматочки, поступово більші',
  },
  en: {
    6: 'smooth purée',
    7: 'mashed with a fork',
    8: 'mashed with small soft pieces',
    9: 'small pieces, gradually larger',
  },
  es: {
    6: 'puré suave',
    7: 'aplastado con tenedor',
    8: 'aplastado con trozos pequeños',
    9: 'trozos pequeños, cada vez más grandes',
  },
  de: {
    6: 'feines Püree',
    7: 'mit der Gabel zerdrückt',
    8: 'zerdrückt mit kleinen Stückchen',
    9: 'kleine Stücke, nach und nach größer',
  },
}

const CATEGORY: Record<
  Locale,
  Record<FoodCategory, { description: string; tip: string }>
> = {
  uk: {
    meat: {
      description: "М'ясо — важливе джерело заліза та білка для прикорму.",
      tip: 'Добре проварюйте або запікайте, зніміть жилки. Починайте з невеликої порції.',
    },
    fish: {
      description: 'Риба дає омега-3 та білок; обирайте ніжні сорти без дрібних кісток.',
      tip: 'Ретельно перевіряйте на кісточки. Краще запікати або тушкувати.',
    },
    vegetable: {
      description: 'Овочі — основа здорового прикорму, багато клітковини та вітамінів.',
      tip: 'Готуйте на парі або відварюйте до м’якості. Комбінуйте з олією для засвоєння.',
    },
    fruit: {
      description: 'Фрукти — солодкий десерт без доданого цукру.',
      tip: 'Обирайте стиглі плоди. Цитрусові та ягоди — після того, як дитина звикла до основних продуктів.',
    },
    grain: {
      description: 'Крупи дають енергію та залізо, особливо в комбінації з м’ясом або бобовими.',
      tip: 'Каша на воді або з частиною звичного молока (ГВ/ШВ). Без цукру та солі.',
    },
    legume: {
      description: 'Бобові — рослинний білок і залізо.',
      tip: 'Добре проварюйте до повної м’якості. Можна пюре або додавати в овочеві страви.',
    },
    dairy: {
      description: 'Молочні продукти в стравах (не як основний напій до 1 року).',
      tip: 'Йогурт без цукру, сир, молоко в каші — поступово, невеликими порціями.',
    },
    fat: {
      description: 'Корисні жири потрібні для мозку та засвоєння вітамінів.',
      tip: 'Додавайте ½–1 ч.л. оливкової або іншої олії до готової страви.',
    },
    allergen: {
      description: 'Продукт-потенційний алерген — вводьте обережно та регулярно.',
      tip: 'Перша половина дня. Починайте з дуже малої дози, 2–3 дні поспіль. Решта продуктів у цей день — уже знайомі.',
    },
  },
  en: {
    meat: {
      description: 'Meat provides iron and protein essential for complementary feeding.',
      tip: 'Cook thoroughly, remove gristle. Start with a small portion.',
    },
    fish: {
      description: 'Fish offers omega-3 and protein; choose mild, boneless fillets.',
      tip: 'Check carefully for bones. Bake or steam rather than fry.',
    },
    vegetable: {
      description: 'Vegetables are the foundation of a healthy plate — fibre and vitamins.',
      tip: 'Steam or boil until soft. Add a little oil to help absorb vitamins.',
    },
    fruit: {
      description: 'Fruit is a natural sweet treat without added sugar.',
      tip: 'Use ripe fruit. Citrus and berries after basic foods are well accepted.',
    },
    grain: {
      description: 'Grains provide energy and iron, especially paired with meat or legumes.',
      tip: 'Porridge with water or mixed with breast/formula milk. No sugar or salt.',
    },
    legume: {
      description: 'Legumes are a plant-based source of protein and iron.',
      tip: 'Cook until very soft. Purée or mix into vegetable dishes.',
    },
    dairy: {
      description: 'Dairy in meals (not as the main drink before age 1).',
      tip: 'Unsweetened yogurt, cheese, milk in porridge — introduce gradually.',
    },
    fat: {
      description: 'Healthy fats support brain development and vitamin absorption.',
      tip: 'Add ½–1 tsp olive or other oil to the finished meal.',
    },
    allergen: {
      description: 'A potential allergen — introduce carefully and keep offering regularly.',
      tip: 'Morning feeding. Start with a tiny amount for 2–3 days. Other foods that day should already be familiar.',
    },
  },
  es: {
    meat: {
      description: 'La carne aporta hierro y proteína esenciales en la alimentación complementaria.',
      tip: 'Cocina bien, quita nervios. Empieza con porciones pequeñas.',
    },
    fish: {
      description: 'El pescado aporta omega-3 y proteína; elige filetes suaves sin espinas.',
      tip: 'Revisa bien las espinas. Hornea o cocina al vapor.',
    },
    vegetable: {
      description: 'Las verduras son la base de un plato saludable.',
      tip: 'Cocina al vapor hasta que estén tiernas. Añade un poco de aceite.',
    },
    fruit: {
      description: 'La fruta es un postre natural sin azúcar añadido.',
      tip: 'Usa fruta madura. Cítricos y bayas cuando acepte bien otros alimentos.',
    },
    grain: {
      description: 'Los cereales dan energía y hierro.',
      tip: 'Papilla con agua o leche materna/fórmula. Sin azúcar ni sal.',
    },
    legume: {
      description: 'Las legumbres aportan proteína vegetal e hierro.',
      tip: 'Cocina hasta que estén muy tiernas. Puré o mezcla con verduras.',
    },
    dairy: {
      description: 'Lácteos en comidas (no como bebida principal antes del año).',
      tip: 'Yogur sin azúcar, queso, leche en papillas — introduce poco a poco.',
    },
    fat: {
      description: 'Las grasas saludables ayudan al cerebro y la absorción de vitaminas.',
      tip: 'Añade ½–1 cucharadita de aceite de oliva a la comida.',
    },
    allergen: {
      description: 'Posible alérgeno — introdúcelo con cuidado y ofrécelo con regularidad.',
      tip: 'Por la mañana. Empieza con cantidad mínima 2–3 días. El resto del día — alimentos ya conocidos.',
    },
  },
  de: {
    meat: {
      description: 'Fleisch liefert Eisen und Protein für die Beikost.',
      tip: 'Gründlich garen, Sehnen entfernen. Mit kleinen Portionen beginnen.',
    },
    fish: {
      description: 'Fisch liefert Omega-3 und Protein; milde, grätenarme Sorten wählen.',
      tip: 'Gründlich auf Gräten prüfen. Backen oder dämpfen.',
    },
    vegetable: {
      description: 'Gemüse ist die Basis einer gesunden Mahlzeit.',
      tip: 'Dämpfen oder kochen bis weich. Etwas Öl zum Vitaminaufbau.',
    },
    fruit: {
      description: 'Obst ist ein natürlicher Genuss ohne zugesetzten Zucker.',
      tip: 'Reifes Obst verwenden. Zitrus und Beeren nach guter Gewöhnung.',
    },
    grain: {
      description: 'Getreide liefert Energie und Eisen.',
      tip: 'Brei mit Wasser oder Muttermilch/Pre-Nahrung. Ohne Zucker und Salz.',
    },
    legume: {
      description: 'Hülsenfrüchte liefern pflanzliches Protein und Eisen.',
      tip: 'Sehr weich kochen. Pürieren oder mit Gemüse mischen.',
    },
    dairy: {
      description: 'Milchprodukte in Mahlzeiten (nicht als Hauptgetränk vor dem 1. Lebensjahr).',
      tip: 'Naturjoghurt, Käse, Milch im Brei — langsam einführen.',
    },
    fat: {
      description: 'Gesunde Fette unterstützen Gehirn und Vitaminaufnahme.',
      tip: '½–1 TL Olivenöl über das fertige Essen geben.',
    },
    allergen: {
      description: 'Mögliches Allergen — vorsichtig und regelmäßig anbieten.',
      tip: 'Vormittags einführen. Winzige Menge 2–3 Tage. Rest des Tages — bekannte Lebensmittel.',
    },
  },
}

function ageBucket(ageMonths: number | null): 6 | 7 | 8 | 9 {
  if (ageMonths === null || ageMonths < 7) return 6
  if (ageMonths < 8) return 7
  if (ageMonths < 9) return 8
  return 9
}

const RECOMMEND: Record<Locale, (age: number | null, texture: string) => string> = {
  uk: (age, texture) =>
    age !== null
      ? `На віці ${age} міс текстура: ${texture}.`
      : `Орієнтовна текстура з 6 міс: ${TEXTURE.uk[6]}. Додайте дату народження для точнішої поради.`,
  en: (age, texture) =>
    age !== null
      ? `At ${age} months, texture: ${texture}.`
      : `Typical texture from 6 months: ${TEXTURE.en[6]}. Add date of birth for age-specific tips.`,
  es: (age, texture) =>
    age !== null
      ? `A los ${age} meses, textura: ${texture}.`
      : `Textura típica desde los 6 meses: ${TEXTURE.es[6]}. Añade la fecha de nacimiento.`,
  de: (age, texture) =>
    age !== null
      ? `Mit ${age} Monaten, Konsistenz: ${texture}.`
      : `Typische Konsistenz ab 6 Monaten: ${TEXTURE.de[6]}. Geburtsdatum hinzufügen.`,
}

export function getTextureLabel(ageMonths: number | null, locale: Locale): string {
  return TEXTURE[locale][ageBucket(ageMonths)]
}

export function getProductGuidance(
  category: FoodCategory,
  isAllergen: boolean,
  ageMonths: number | null,
  locale: Locale,
): ProductGuidance {
  const cat = isAllergen ? 'allergen' : category
  const base = CATEGORY[locale][cat] ?? CATEGORY[locale][category]
  const bucket = ageBucket(ageMonths)
  const texture = TEXTURE[locale][bucket]
  const recommend = RECOMMEND[locale](ageMonths, texture)

  let description = base.description

  return {
    description,
    recommendation: `${recommend} ${base.tip}`,
  }
}
