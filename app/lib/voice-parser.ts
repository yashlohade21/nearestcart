// Voice parser for Hindi/Hinglish/English deal descriptions
// Regex-based — no AI/LLM dependency, works fully offline

export interface ParsedDeal {
  farmerName?: string;
  buyerName?: string;
  productName?: string;
  quantity?: number;
  unit?: string;
  buyRate?: number;
  sellRate?: number;
}

// Unit aliases → normalized
const unitMap: Record<string, string> = {
  kg: "kg", kilo: "kg", किलो: "kg", "किलोग्राम": "kg",
  quintal: "quintal", क्विंटल: "quintal", qtl: "quintal",
  ton: "ton", टन: "ton", tonne: "ton",
  bag: "bag", बोरी: "bag", bori: "bag",
  crate: "crate", क्रेट: "crate", peti: "crate", पेटी: "crate",
  dozen: "dozen", दर्जन: "dozen",
  piece: "piece", पीस: "piece",
};

const unitPattern = Object.keys(unitMap).join("|");
const numPattern = "[\\d,]+\\.?\\d*";

function parseNum(s: string): number {
  return parseFloat(s.replace(/,/g, "")) || 0;
}

function extractUnit(text: string): string | undefined {
  const re = new RegExp(`(${unitPattern})`, "i");
  const m = text.match(re);
  if (m) return unitMap[m[1].toLowerCase()] || m[1];
  return undefined;
}

export function parseDealFromSpeech(text: string): ParsedDeal {
  const result: ParsedDeal = {};
  const t = text.trim();

  // ── Buy pattern ──
  // "[name] se [qty] [unit] [product] [rate] mein liya/kharida"
  // Hindi: "[name] से [qty] [unit] [product] [rate] में लिया/खरीदा"
  const buyPatterns = [
    // Hinglish: "Ramesh se 500 quintal cotton 6200 mein liya"
    new RegExp(
      `(\\S+(?:\\s+\\S+)?)\\s+(?:se|से)\\s+(${numPattern})\\s+(${unitPattern})\\s+(\\S+(?:\\s+\\S+)?)\\s+(${numPattern})\\s+(?:mein|में|me|per|par)\\s+(?:liya|kharida|खरीदा|लिया|lia|liyaa)`,
      "i"
    ),
    // "Bought [qty] [unit] [product] from [name] at [rate]"
    new RegExp(
      `(?:bought|buy|kharida|खरीदा)\\s+(${numPattern})\\s+(${unitPattern})\\s+(\\S+(?:\\s+\\S+)?)\\s+(?:from|se|से)\\s+(\\S+(?:\\s+\\S+)?)\\s+(?:at|@|per|par)\\s+(${numPattern})`,
      "i"
    ),
    // "[name] se [qty] [product] [rate] mein liya" (no explicit unit)
    new RegExp(
      `(\\S+(?:\\s+\\S+)?)\\s+(?:se|से)\\s+(${numPattern})\\s+(\\S+(?:\\s+\\S+)?)\\s+(${numPattern})\\s+(?:mein|में|me|per|par)\\s+(?:liya|kharida|खरीदा|लिया|lia|liyaa)`,
      "i"
    ),
  ];

  for (const pat of buyPatterns) {
    const m = t.match(pat);
    if (m) {
      if (pat === buyPatterns[1]) {
        // "Bought qty unit product from name at rate"
        result.quantity = parseNum(m[1]);
        result.unit = unitMap[m[2].toLowerCase()] || m[2];
        result.productName = m[3].trim();
        result.farmerName = m[4].trim();
        result.buyRate = parseNum(m[5]);
      } else if (pat === buyPatterns[2]) {
        // No explicit unit
        result.farmerName = m[1].trim();
        result.quantity = parseNum(m[2]);
        result.productName = m[3].trim();
        result.buyRate = parseNum(m[4]);
      } else {
        // "Name se qty unit product rate mein liya"
        result.farmerName = m[1].trim();
        result.quantity = parseNum(m[2]);
        result.unit = unitMap[m[3].toLowerCase()] || m[3];
        result.productName = m[4].trim();
        result.buyRate = parseNum(m[5]);
      }
      break;
    }
  }

  // ── Sell pattern ──
  // "[name] ko [rate] mein becha/sold"
  // Hindi: "[name] को [rate] में बेचा"
  const sellPatterns = [
    // "Balaji ko 6500 mein becha"
    new RegExp(
      `(\\S+(?:\\s+\\S+)?)\\s+(?:ko|को)\\s+(${numPattern})\\s+(?:mein|में|me|per|par)\\s+(?:becha|sold|बेचा|beca)`,
      "i"
    ),
    // "Sold to [name] at [rate]"
    new RegExp(
      `(?:sold|sell|becha|बेचा)\\s+(?:to)?\\s*(\\S+(?:\\s+\\S+)?)\\s+(?:at|@|ko|को|per|par)\\s+(${numPattern})`,
      "i"
    ),
  ];

  for (const pat of sellPatterns) {
    const m = t.match(pat);
    if (m) {
      result.buyerName = m[1].trim();
      result.sellRate = parseNum(m[2]);
      break;
    }
  }

  // ── Fallback: try to extract standalone numbers if no patterns matched ──
  if (!result.quantity && !result.buyRate && !result.sellRate) {
    const numbers = t.match(/[\d,]+\.?\d*/g)?.map(parseNum).filter((n) => n > 0);
    if (numbers && numbers.length >= 2) {
      // Heuristic: largest is quantity, next are rates
      const sorted = [...numbers].sort((a, b) => b - a);
      result.quantity = sorted[0];
      result.buyRate = sorted[1];
      if (sorted[2]) result.sellRate = sorted[2];
    }
  }

  // If we have quantity but no unit, try to extract one from the full text
  if (result.quantity && !result.unit) {
    result.unit = extractUnit(t);
  }

  return result;
}
