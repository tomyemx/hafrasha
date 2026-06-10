import type { ProduceCategory } from './types'

// ===== קטלוג גידולים נפוצים =====
// ה-category קובע את גבול שנת המעשר; tree=true פותח את שאלת נטע רבעי/ערלה.
// השיוך ההלכתי (פרי עץ מול ירק) נקבע לפי ההלכה ולא לפי הבוטניקה —
// למשל בננה, אבטיח, מלון ותות-שדה הם "ירק" לעניין מעשרות.

export interface ProduceItem {
  id: string
  name: string
  category: ProduceCategory
  tree: boolean
  note?: string
}

export const CATEGORY_LABEL: Record<ProduceCategory, string> = {
  tree: 'פירות אילן',
  vegetable: 'ירקות',
  grain: 'תבואה (דגן)',
  legume: 'קטניות',
  etrog: 'אתרוג',
}

export const PRODUCE: ProduceItem[] = [
  // --- פירות אילן ---
  { id: 'apple', name: 'תפוח', category: 'tree', tree: true },
  { id: 'pear', name: 'אגס', category: 'tree', tree: true },
  { id: 'grape', name: 'ענבים', category: 'tree', tree: true },
  { id: 'fig', name: 'תאנה', category: 'tree', tree: true },
  { id: 'pomegranate', name: 'רימון', category: 'tree', tree: true },
  { id: 'olive', name: 'זית', category: 'tree', tree: true },
  { id: 'date', name: 'תמר', category: 'tree', tree: true },
  { id: 'plum', name: 'שזיף', category: 'tree', tree: true },
  { id: 'peach', name: 'אפרסק', category: 'tree', tree: true },
  { id: 'apricot', name: 'משמש', category: 'tree', tree: true },
  { id: 'cherry', name: 'דובדבן', category: 'tree', tree: true },
  { id: 'avocado', name: 'אבוקדו', category: 'tree', tree: true },
  { id: 'mango', name: 'מנגו', category: 'tree', tree: true },
  { id: 'lemon', name: 'לימון', category: 'tree', tree: true },
  { id: 'orange', name: 'תפוז', category: 'tree', tree: true },
  { id: 'clementine', name: 'קלמנטינה', category: 'tree', tree: true },
  { id: 'grapefruit', name: 'אשכולית', category: 'tree', tree: true },
  { id: 'walnut', name: 'אגוז מלך', category: 'tree', tree: true },
  { id: 'almond', name: 'שקד', category: 'tree', tree: true },
  { id: 'carob', name: 'חרוב', category: 'tree', tree: true },
  { id: 'persimmon', name: 'אפרסמון (פרסימון)', category: 'tree', tree: true },
  { id: 'guava', name: 'גויאבה', category: 'tree', tree: true },
  { id: 'loquat', name: 'שסק', category: 'tree', tree: true },
  { id: 'mulberry', name: 'תות עץ', category: 'tree', tree: true },

  // --- ירקות (לרבות "פירות" שדינם ירק) ---
  { id: 'tomato', name: 'עגבנייה', category: 'vegetable', tree: false },
  { id: 'cucumber', name: 'מלפפון', category: 'vegetable', tree: false },
  { id: 'pepper', name: 'פלפל', category: 'vegetable', tree: false },
  { id: 'eggplant', name: 'חציל', category: 'vegetable', tree: false },
  { id: 'zucchini', name: 'קישוא', category: 'vegetable', tree: false },
  { id: 'pumpkin', name: 'דלעת', category: 'vegetable', tree: false },
  { id: 'onion', name: 'בצל', category: 'vegetable', tree: false },
  { id: 'garlic', name: 'שום', category: 'vegetable', tree: false },
  { id: 'carrot', name: 'גזר', category: 'vegetable', tree: false },
  { id: 'lettuce', name: 'חסה', category: 'vegetable', tree: false },
  { id: 'cabbage', name: 'כרוב', category: 'vegetable', tree: false },
  { id: 'cauliflower', name: 'כרובית', category: 'vegetable', tree: false },
  { id: 'broccoli', name: 'ברוקולי', category: 'vegetable', tree: false },
  { id: 'spinach', name: 'תרד', category: 'vegetable', tree: false },
  { id: 'parsley', name: 'פטרוזיליה', category: 'vegetable', tree: false },
  { id: 'cilantro', name: 'כוסברה', category: 'vegetable', tree: false },
  { id: 'mint', name: 'נענע', category: 'vegetable', tree: false },
  { id: 'beet', name: 'סלק', category: 'vegetable', tree: false },
  { id: 'radish', name: 'צנון', category: 'vegetable', tree: false },
  { id: 'potato', name: 'תפוח אדמה', category: 'vegetable', tree: false },
  { id: 'sweetpotato', name: 'בטטה', category: 'vegetable', tree: false },
  { id: 'watermelon', name: 'אבטיח', category: 'vegetable', tree: false, note: 'דינו כירק לעניין מעשרות' },
  { id: 'melon', name: 'מלון', category: 'vegetable', tree: false, note: 'דינו כירק לעניין מעשרות' },
  { id: 'strawberry', name: 'תות שדה', category: 'vegetable', tree: false, note: 'דינו כירק לעניין מעשרות' },
  { id: 'banana', name: 'בננה', category: 'vegetable', tree: false, note: 'דינה כירק לעניין מעשרות' },
  { id: 'pineapple', name: 'אננס', category: 'vegetable', tree: false, note: 'דינו כירק לעניין מעשרות' },

  // --- קטניות ---
  { id: 'bean', name: 'שעועית', category: 'legume', tree: false },
  { id: 'chickpea', name: 'חומוס (גרגירי)', category: 'legume', tree: false },
  { id: 'lentil', name: 'עדשים', category: 'legume', tree: false },
  { id: 'pea', name: 'אפונה', category: 'legume', tree: false },
  { id: 'fava', name: 'פול', category: 'legume', tree: false },

  // --- תבואה ---
  { id: 'wheat', name: 'חיטה', category: 'grain', tree: false },
  { id: 'barley', name: 'שעורה', category: 'grain', tree: false },
  { id: 'oat', name: 'שיבולת שועל', category: 'grain', tree: false },
  { id: 'corn', name: 'תירס', category: 'grain', tree: false },

  // --- מיוחד ---
  { id: 'etrog', name: 'אתרוג', category: 'etrog', tree: true, note: 'דין מיוחד — לעניין מעשר הולך אחר הלקיטה, ולעניין ערלה אחר החנטה' },
]

export function findProduce(id: string): ProduceItem | undefined {
  return PRODUCE.find((p) => p.id === id)
}
