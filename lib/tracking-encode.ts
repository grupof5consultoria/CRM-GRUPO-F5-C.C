/**
 * Zero-width character encoding for invisible tracking refs in WhatsApp messages.
 *
 * Encodes each character of the ref as 6 zero-width bits appended to the message.
 * The user sees nothing — the code is completely invisible.
 *
 * Supported chars: a-z, 0-9 (covers all cuid() characters)
 */

const CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";
const ZW0   = "\u200B"; // bit 0 (Zero Width Space)
const ZW1   = "\u200C"; // bit 1 (Zero Width Non-Joiner)
const SEP   = "\u200D"; // char separator (Zero Width Joiner)

export function encodeRefZW(ref: string): string {
  return ref
    .toLowerCase()
    .split("")
    .map(char => {
      const idx = CHARS.indexOf(char);
      if (idx === -1) return "";
      const bits = idx.toString(2).padStart(6, "0");
      return bits.split("").map(b => (b === "0" ? ZW0 : ZW1)).join("") + SEP;
    })
    .join("");
}

export function decodeRefZW(text: string): string | null {
  // Extract only zero-width characters
  const zwOnly = text.replace(/[^\u200B\u200C\u200D]/g, "");
  if (!zwOnly || zwOnly.length < 6) return null;

  const groups = zwOnly.split(SEP).filter(g => g.length === 6);
  if (groups.length < 8) return null; // cuid is at least 10 chars

  try {
    const decoded = groups
      .map(group => {
        const idx = parseInt(
          group.split("").map(c => (c === ZW1 ? "1" : "0")).join(""),
          2
        );
        return CHARS[idx] ?? "";
      })
      .join("");

    return decoded.length >= 8 ? decoded : null;
  } catch {
    return null;
  }
}
