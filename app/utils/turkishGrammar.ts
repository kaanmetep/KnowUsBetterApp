const VOWELS = "aeıioöuüAEIİOÖUÜ";

export const getTurkishPossessiveSuffix = (word: string) => {
  const normalized = word.trim();
  let lastVowel = "";

  for (let i = normalized.length - 1; i >= 0; i -= 1) {
    const ch = normalized[i];
    if (VOWELS.includes(ch)) {
      lastVowel = ch.toLowerCase();
      break;
    }
  }

  const suffixByVowel: Record<string, string> = {
    a: "ın",
    ı: "ın",
    o: "un",
    u: "un",
    e: "in",
    i: "in",
    ö: "ün",
    ü: "ün",
  };

  const suffix = suffixByVowel[lastVowel] || "ın";
  const lastChar = normalized[normalized.length - 1] || "";
  const needsBufferN = VOWELS.includes(lastChar);
  return `${needsBufferN ? "n" : ""}${suffix}`;
};

export const toTurkishPossessive = (word: string) =>
  `${word}'${getTurkishPossessiveSuffix(word)}`;
