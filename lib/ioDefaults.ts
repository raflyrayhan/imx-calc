import { Instrument } from "./type";
import { findByCode, findByFullType, guessFromTag, applyCatalog } from "./catalogs";

export function applyIODefaults(ins: Instrument): Instrument {
  // 1) Direct by code
  if (ins.instrumentCode) {
    const e = findByCode(ins.instrumentCode);
    if (e) return applyCatalog(e, ins);
  }
  // 2) Fuzzy by full type name
  const byType = findByFullType(ins.instrumentType);
  if (byType) return applyCatalog(byType, ins);

  // 3) Guess from tag
  const guessed = guessFromTag(ins.tag);
  if (guessed) {
    const e = findByCode(guessed);
    if (e) return applyCatalog(e, ins);
  }
  return ins;
}
