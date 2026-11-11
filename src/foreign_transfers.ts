// @ts-nocheck
// src/foreign_transfers.ts
import { GoogleGenAI } from "@google/genai";
var FOREIGN_CLUBS = [
  // Tier 1: Топ-клубы мира (для звезд и игроков с рейтингом 80+)
  { id: "real_madrid", name: "\u0420\u0435\u0430\u043B \u041C\u0430\u0434\u0440\u0438\u0434", country: "\u0418\u0441\u043F\u0430\u043D\u0438\u044F", flag: "\u{1F1EA}\u{1F1F8}", league: "\u041B\u0430 \u041B\u0438\u0433\u0430", tier: 1, primaryColor: "#ffffff", secondaryColor: "#00529f" },
  { id: "barcelona", name: "\u0411\u0430\u0440\u0441\u0435\u043B\u043E\u043D\u0430", country: "\u0418\u0441\u043F\u0430\u043D\u0438\u044F", flag: "\u{1F1EA}\u{1F1F8}", league: "\u041B\u0430 \u041B\u0438\u0433\u0430", tier: 1, primaryColor: "#004d98", secondaryColor: "#a50044" },
  { id: "mancity", name: "\u041C\u0430\u043D\u0447\u0435\u0441\u0442\u0435\u0440 \u0421\u0438\u0442\u0438", country: "\u0410\u043D\u0433\u043B\u0438\u044F", flag: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}", league: "\u041F\u0440\u0435\u043C\u044C\u0435\u0440-\u043B\u0438\u0433\u0430", tier: 1, primaryColor: "#6cabdd", secondaryColor: "#1c2c5b" },
  { id: "arsenal", name: "\u0410\u0440\u0441\u0435\u043D\u0430\u043B", country: "\u0410\u043D\u0433\u043B\u0438\u044F", flag: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}", league: "\u041F\u0440\u0435\u043C\u044C\u0435\u0440-\u043B\u0438\u0433\u0430", tier: 1, primaryColor: "#ef0107", secondaryColor: "#063672" },
  { id: "liverpool", name: "\u041B\u0438\u0432\u0435\u0440\u043F\u0443\u043B\u044C", country: "\u0410\u043D\u0433\u043B\u0438\u044F", flag: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}", league: "\u041F\u0440\u0435\u043C\u044C\u0435\u0440-\u043B\u0438\u0433\u0430", tier: 1, primaryColor: "#c8102e", secondaryColor: "#00b2a9" },
  { id: "chelsea", name: "\u0427\u0435\u043B\u0441\u0438", country: "\u0410\u043D\u0433\u043B\u0438\u044F", flag: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}", league: "\u041F\u0440\u0435\u043C\u044C\u0435\u0440-\u043B\u0438\u0433\u0430", tier: 1, primaryColor: "#034694", secondaryColor: "#dba111" },
  { id: "psg", name: "\u041F\u0421\u0416", country: "\u0424\u0440\u0430\u043D\u0446\u0438\u044F", flag: "\u{1F1EB}\u{1F1F7}", league: "\u041B\u0438\u0433\u0430 1", tier: 1, primaryColor: "#004170", secondaryColor: "#da291c" },
  { id: "bayern", name: "\u0411\u0430\u0432\u0430\u0440\u0438\u044F \u041C\u044E\u043D\u0445\u0435\u043D", country: "\u0413\u0435\u0440\u043C\u0430\u043D\u0438\u044F", flag: "\u{1F1E9}\u{1F1EA}", league: "\u0411\u0443\u043D\u0434\u0435\u0441\u043B\u0438\u0433\u0430", tier: 1, primaryColor: "#dc052d", secondaryColor: "#0066b2" },
  { id: "inter", name: "\u0418\u043D\u0442\u0435\u0440 \u041C\u0438\u043B\u0430\u043D", country: "\u0418\u0442\u0430\u043B\u0438\u044F", flag: "\u{1F1EE}\u{1F1F9}", league: "\u0421\u0435\u0440\u0438\u044F \u0410", tier: 1, primaryColor: "#001489", secondaryColor: "#000000" },
  // Tier 2: Крепкие европейские клубы (рейтинг 74–82)
  { id: "atalanta", name: "\u0410\u0442\u0430\u043B\u0430\u043D\u0442\u0430", country: "\u0418\u0442\u0430\u043B\u0438\u044F", flag: "\u{1F1EE}\u{1F1F9}", league: "\u0421\u0435\u0440\u0438\u044F \u0410", tier: 2, primaryColor: "#1e73be", secondaryColor: "#000000" },
  { id: "leverkusen", name: "\u0411\u0430\u0439\u0435\u0440 04", country: "\u0413\u0435\u0440\u043C\u0430\u043D\u0438\u044F", flag: "\u{1F1E9}\u{1F1EA}", league: "\u0411\u0443\u043D\u0434\u0435\u0441\u043B\u0438\u0433\u0430", tier: 2, primaryColor: "#e32221", secondaryColor: "#000000" },
  { id: "dortmund", name: "\u0411\u043E\u0440\u0443\u0441\u0441\u0438\u044F \u0414\u043E\u0440\u0442\u043C\u0443\u043D\u0434", country: "\u0413\u0435\u0440\u043C\u0430\u043D\u0438\u044F", flag: "\u{1F1E9}\u{1F1EA}", league: "\u0411\u0443\u043D\u0434\u0435\u0441\u043B\u0438\u0433\u0430", tier: 2, primaryColor: "#fde100", secondaryColor: "#000000" },
  { id: "roma", name: "\u0420\u043E\u043C\u0430", country: "\u0418\u0442\u0430\u043B\u0438\u044F", flag: "\u{1F1EE}\u{1F1F9}", league: "\u0421\u0435\u0440\u0438\u044F \u0410", tier: 2, primaryColor: "#8e1f2f", secondaryColor: "#f0bc42" },
  { id: "lazio", name: "\u041B\u0430\u0446\u0438\u043E", country: "\u0418\u0442\u0430\u043B\u0438\u044F", flag: "\u{1F1EE}\u{1F1F9}", league: "\u0421\u0435\u0440\u0438\u044F \u0410", tier: 2, primaryColor: "#87d8f7", secondaryColor: "#ffffff" },
  { id: "fiorentina", name: "\u0424\u0438\u043E\u0440\u0435\u043D\u0442\u0438\u043D\u0430", country: "\u0418\u0442\u0430\u043B\u0438\u044F", flag: "\u{1F1EE}\u{1F1F9}", league: "\u0421\u0435\u0440\u0438\u044F \u0410", tier: 2, primaryColor: "#4f2d7f", secondaryColor: "#ffffff" },
  { id: "sociedad", name: "\u0420\u0435\u0430\u043B \u0421\u043E\u0441\u044C\u0435\u0434\u0430\u0434", country: "\u0418\u0441\u043F\u0430\u043D\u0438\u044F", flag: "\u{1F1EA}\u{1F1F8}", league: "\u041B\u0430 \u041B\u0438\u0433\u0430", tier: 2, primaryColor: "#0067b1", secondaryColor: "#ffffff" },
  { id: "villarreal", name: "\u0412\u0438\u043B\u044C\u044F\u0440\u0440\u0435\u0430\u043B", country: "\u0418\u0441\u043F\u0430\u043D\u0438\u044F", flag: "\u{1F1EA}\u{1F1F8}", league: "\u041B\u0430 \u041B\u0438\u0433\u0430", tier: 2, primaryColor: "#ffe500", secondaryColor: "#0055a5" },
  { id: "monaco", name: "\u041C\u043E\u043D\u0430\u043A\u043E", country: "\u0424\u0440\u0430\u043D\u0446\u0438\u044F", flag: "\u{1F1EB}\u{1F1F7}", league: "\u041B\u0438\u0433\u0430 1", tier: 2, primaryColor: "#e2001a", secondaryColor: "#ffffff" },
  { id: "marseille", name: "\u041C\u0430\u0440\u0441\u0435\u043B\u044C", country: "\u0424\u0440\u0430\u043D\u0446\u0438\u044F", flag: "\u{1F1EB}\u{1F1F7}", league: "\u041B\u0438\u0433\u0430 1", tier: 2, primaryColor: "#2fa5dc", secondaryColor: "#ffffff" },
  { id: "benfica", name: "\u0411\u0435\u043D\u0444\u0438\u043A\u0430", country: "\u041F\u043E\u0440\u0442\u0443\u0433\u0430\u043B\u0438\u044F", flag: "\u{1F1F5}\u{1F1F9}", league: "\u041F\u0440\u0438\u043C\u0435\u0439\u0440\u0430", tier: 2, primaryColor: "#e30613", secondaryColor: "#ffffff" },
  { id: "sporting", name: "\u0421\u043F\u043E\u0440\u0442\u0438\u043D\u0433 \u041B\u0438\u0441\u0441\u0430\u0431\u043E\u043D", country: "\u041F\u043E\u0440\u0442\u0443\u0433\u0430\u043B\u0438\u044F", flag: "\u{1F1F5}\u{1F1F9}", league: "\u041F\u0440\u0438\u043C\u0435\u0439\u0440\u0430", tier: 2, primaryColor: "#008057", secondaryColor: "#ffffff" },
  { id: "porto", name: "\u041F\u043E\u0440\u0442\u0443", country: "\u041F\u043E\u0440\u0442\u0443\u0433\u0430\u043B\u0438\u044F", flag: "\u{1F1F5}\u{1F1F9}", league: "\u041F\u0440\u0438\u043C\u0435\u0439\u0440\u0430", tier: 2, primaryColor: "#003882", secondaryColor: "#ffffff" },
  // Tier 3: Высокобюджетные и амбициозные лиги (Турция, Саудовская Аравия, Нидерланды)
  { id: "galatasaray", name: "\u0413\u0430\u043B\u0430\u0442\u0430\u0441\u0430\u0440\u0430\u0439", country: "\u0422\u0443\u0440\u0446\u0438\u044F", flag: "\u{1F1F9}\u{1F1F7}", league: "\u0421\u0443\u043F\u0435\u0440\u043B\u0438\u0433\u0430", tier: 3, primaryColor: "#a90432", secondaryColor: "#fdb912" },
  { id: "fenerbahce", name: "\u0424\u0435\u043D\u0435\u0440\u0431\u0430\u0445\u0447\u0435", country: "\u0422\u0443\u0440\u0446\u0438\u044F", flag: "\u{1F1F9}\u{1F1F7}", league: "\u0421\u0443\u043F\u0435\u0440\u043B\u0438\u0433\u0430", tier: 3, primaryColor: "#002d72", secondaryColor: "#fff000" },
  { id: "besiktas", name: "\u0411\u0435\u0448\u0438\u043A\u0442\u0430\u0448", country: "\u0422\u0443\u0440\u0446\u0438\u044F", flag: "\u{1F1F9}\u{1F1F7}", league: "\u0421\u0443\u043F\u0435\u0440\u043B\u0438\u0433\u0430", tier: 3, primaryColor: "#000000", secondaryColor: "#ffffff" },
  { id: "alhilal", name: "\u0410\u043B\u044C-\u0425\u0438\u043B\u044F\u043B\u044C", country: "\u0421\u0430\u0443\u0434\u043E\u0432\u0441\u043A\u0430\u044F \u0410\u0440\u0430\u0432\u0438\u044F", flag: "\u{1F1F8}\u{1F1E6}", league: "Saudi Pro League", tier: 3, primaryColor: "#0055a5", secondaryColor: "#ffffff" },
  { id: "alnassr", name: "\u0410\u043B\u044C-\u041D\u0430\u0441\u0440", country: "\u0421\u0430\u0443\u0434\u043E\u0432\u0441\u043A\u0430\u044F \u0410\u0440\u0430\u0432\u0438\u044F", flag: "\u{1F1F8}\u{1F1E6}", league: "Saudi Pro League", tier: 3, primaryColor: "#fcee21", secondaryColor: "#003a70" },
  { id: "ajax", name: "\u0410\u044F\u043A\u0441", country: "\u041D\u0438\u0434\u0435\u0440\u043B\u0430\u043D\u0434\u044B", flag: "\u{1F1F3}\u{1F1F1}", league: "\u042D\u0440\u0435\u0434\u0438\u0432\u0438\u0437\u0438", tier: 3, primaryColor: "#d2122e", secondaryColor: "#ffffff" },
  { id: "psv", name: "\u041F\u0421\u0412 \u042D\u0439\u043D\u0434\u0445\u043E\u0432\u0435\u043D", country: "\u041D\u0438\u0434\u0435\u0440\u043B\u0430\u043D\u0434\u044B", flag: "\u{1F1F3}\u{1F1F1}", league: "\u042D\u0440\u0435\u0434\u0438\u0432\u0438\u0437\u0438", tier: 3, primaryColor: "#ed1c24", secondaryColor: "#ffffff" },
  { id: "feyenoord", name: "\u0424\u0435\u0439\u0435\u043D\u043E\u043E\u0440\u0434", country: "\u041D\u0438\u0434\u0435\u0440\u043B\u0430\u043D\u0434\u044B", flag: "\u{1F1F3}\u{1F1F1}", league: "\u042D\u0440\u0435\u0434\u0438\u0432\u0438\u0437\u0438", tier: 3, primaryColor: "#e30613", secondaryColor: "#000000" },
  { id: "celtic", name: "\u0421\u0435\u043B\u0442\u0438\u043A", country: "\u0428\u043E\u0442\u043B\u0430\u043D\u0434\u0438\u044F", flag: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}", league: "\u041F\u0440\u0435\u043C\u044C\u0435\u0440\u0448\u0438\u043F", tier: 3, primaryColor: "#008542", secondaryColor: "#ffffff" },
  { id: "flamengo", name: "\u0424\u043B\u0430\u043C\u0435\u043D\u0433\u043E", country: "\u0411\u0440\u0430\u0437\u0438\u043B\u0438\u044F", flag: "\u{1F1E7}\u{1F1F7}", league: "\u0421\u0435\u0440\u0438\u044F \u0410", tier: 3, primaryColor: "#c3281e", secondaryColor: "#000000" }
];
function getForeignClubBadgeSvg(club) {
  const p = club.primaryColor || "#1e3a8a";
  const s = club.secondaryColor || "#ffffff";
  const initials = club.name.split(" ").map((w) => w[0]).join("").slice(0, 3).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="g_${club.id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${p}"/>
        <stop offset="100%" stop-color="${s}"/>
      </linearGradient>
    </defs>
    <path d="M50 5 L88 20 C88 60 50 95 50 95 C50 95 12 60 12 20 Z" fill="url(#g_${club.id})" stroke="#1f2937" stroke-width="3"/>
    <path d="M50 15 L78 27 C78 55 50 82 50 82 C50 82 22 55 22 27 Z" fill="${p}" opacity="0.85"/>
    <circle cx="50" cy="45" r="20" fill="${s}" opacity="0.25"/>
    <text x="50" y="52" font-family="system-ui, sans-serif" font-weight="900" font-size="18" fill="#ffffff" text-anchor="middle" letter-spacing="1">${initials}</text>
    <text x="50" y="72" font-family="system-ui, sans-serif" font-weight="700" font-size="8" fill="#facc15" text-anchor="middle">${club.country.toUpperCase()}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
var genAIClient = null;
function getGenAI() {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return genAIClient;
}
async function createForeignOfferWithAI(params) {
  const { player: player2, club, performanceReason, matchRating, matchId } = params;
  const rating = Number(player2.rating || matchRating || 72);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  let candidates = FOREIGN_CLUBS;
  if (rating >= 80) {
    candidates = FOREIGN_CLUBS.filter((c) => c.tier === 1 || c.tier === 2);
  } else if (rating >= 75) {
    candidates = FOREIGN_CLUBS.filter((c) => c.tier === 2 || c.tier === 3);
  } else {
    candidates = FOREIGN_CLUBS.filter((c) => c.tier === 3 || c.tier === 2);
  }
  if (!candidates.length) candidates = FOREIGN_CLUBS;
  const targetClub = candidates[Math.floor(Math.random() * candidates.length)];
  const ai = getGenAI();
  if (ai) {
    try {
      const prompt = `\u0422\u044B \u2014 \u043C\u0435\u0436\u0434\u0443\u043D\u0430\u0440\u043E\u0434\u043D\u044B\u0439 \u0444\u0443\u0442\u0431\u043E\u043B\u044C\u043D\u044B\u0439 \u0441\u043A\u0430\u0443\u0442 \u0438 \u0441\u043F\u043E\u0440\u0442\u0438\u0432\u043D\u044B\u0439 \u0434\u0438\u0440\u0435\u043A\u0442\u043E\u0440 \u0432\u0435\u0434\u0443\u0449\u0438\u0445 \u0435\u0432\u0440\u043E\u043F\u0435\u0439\u0441\u043A\u0438\u0445 \u0438 \u043C\u0438\u0440\u043E\u0432\u044B\u0445 \u043A\u043B\u0443\u0431\u043E\u0432.
\u0424\u0443\u0442\u0431\u043E\u043B\u0438\u0441\u0442 \u0438\u0437 \u0447\u0435\u043C\u043F\u0438\u043E\u043D\u0430\u0442\u0430 \u0420\u043E\u0441\u0441\u0438\u0438 \u043F\u0440\u043E\u0434\u0435\u043C\u043E\u043D\u0441\u0442\u0440\u0438\u0440\u043E\u0432\u0430\u043B \u0432\u043F\u0435\u0447\u0430\u0442\u043B\u044F\u044E\u0449\u0443\u044E \u0438\u0433\u0440\u0443 \u0438 \u043F\u043E\u043F\u0430\u043B \u043D\u0430 \u0440\u0430\u0434\u0430\u0440\u044B \u0437\u0430\u0440\u0443\u0431\u0435\u0436\u043D\u044B\u0445 \u0441\u043A\u0430\u0443\u0442\u043E\u0432:
- \u0418\u043C\u044F \u0438\u0433\u0440\u043E\u043A\u0430: ${player2.name}
- \u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u0440\u043E\u0441\u0441\u0438\u0439\u0441\u043A\u0438\u0439 \u043A\u043B\u0443\u0431: ${club.name}
- \u0410\u043C\u043F\u043B\u0443\u0430: ${player2.pos}
- \u0411\u0430\u0437\u043E\u0432\u044B\u0439 \u0440\u0435\u0439\u0442\u0438\u043D\u0433: ${rating}
- \u041F\u043E\u0432\u043E\u0434 \u0434\u043B\u044F \u0438\u043D\u0442\u0435\u0440\u0435\u0441\u0430 \u0441\u043A\u0430\u0443\u0442\u043E\u0432: ${performanceReason} (\u043E\u0446\u0435\u043D\u043A\u0430 \u0432 \u043C\u0430\u0442\u0447\u0435: ${matchRating || rating})
- \u041F\u043E\u0442\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u044B\u0439 \u0437\u0430\u0440\u0443\u0431\u0435\u0436\u043D\u044B\u0439 \u043F\u043E\u043A\u0443\u043F\u0430\u0442\u0435\u043B\u044C: ${targetClub.name} (${targetClub.country}, ${targetClub.league})

\u0421\u0433\u0435\u043D\u0435\u0440\u0438\u0440\u0443\u0439 \u0441\u0442\u0440\u043E\u0433\u043E \u0432 \u0444\u043E\u0440\u043C\u0430\u0442\u0435 JSON \u0442\u0440\u0430\u043D\u0441\u0444\u0435\u0440\u043D\u043E\u0435 \u043F\u0440\u0435\u0434\u043B\u043E\u0436\u0435\u043D\u0438\u0435:
{
  "type": "sale" \u0438\u043B\u0438 "loan",
  "feeAmount": \u0447\u0438\u0441\u043B\u043E \u0432 \u043C\u0438\u043B\u043B\u0438\u043E\u043D\u0430\u0445 \u0435\u0432\u0440\u043E (\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, 8.5 \u0434\u043B\u044F \u043F\u043E\u043A\u0443\u043F\u043A\u0438 \u0438\u043B\u0438 1.5 \u0434\u043B\u044F \u0430\u0440\u0435\u043D\u0434\u044B),
  "feeDescription": "\u0441\u0442\u0440\u043E\u043A\u0430 \u0441 \u0444\u043E\u0440\u043C\u0430\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435\u043C \u0441\u0443\u043C\u043C\u044B, \u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440 '\u20AC8.5 \u043C\u043B\u043D' \u0438\u043B\u0438 '\u20AC1.2 \u043C\u043B\u043D \u0437\u0430 \u0430\u0440\u0435\u043D\u0434\u0443 \u0441 \u043F\u0440\u0430\u0432\u043E\u043C \u0432\u044B\u043A\u0443\u043F\u0430 \u0437\u0430 \u20AC7 \u043C\u043B\u043D'",
  "wage": "\u0437\u0430\u0440\u043F\u043B\u0430\u0442\u0430 \u0438\u0433\u0440\u043E\u043A\u0430, \u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440 '\u20AC1.6 \u043C\u043B\u043D \u0432 \u0433\u043E\u0434'",
  "durationYears": \u0447\u0438\u0441\u043B\u043E \u043E\u0442 1 \u0434\u043E 5,
  "scoutReport": "\u0440\u0430\u0437\u0432\u0435\u0440\u043D\u0443\u0442\u044B\u0439 \u0441\u043A\u0430\u0443\u0442\u0441\u043A\u0438\u0439 \u043A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439 (2-3 \u043F\u0440\u0435\u0434\u043B\u043E\u0436\u0435\u043D\u0438\u044F) \u043D\u0430 \u0440\u0443\u0441\u0441\u043A\u043E\u043C \u044F\u0437\u044B\u043A\u0435: \u043F\u043E\u0447\u0435\u043C\u0443 \u043A\u043B\u0443\u0431 \u0433\u043E\u0442\u043E\u0432 \u0437\u0430\u043F\u043B\u0430\u0442\u0438\u0442\u044C \u0442\u0430\u043A\u0438\u0435 \u0434\u0435\u043D\u044C\u0433\u0438, \u043A\u0430\u043A\u0438\u0435 \u0441\u0438\u043B\u044C\u043D\u044B\u0435 \u0441\u0442\u043E\u0440\u043E\u043D\u044B \u043F\u043E\u0434\u043C\u0435\u0442\u0438\u043B\u0438 \u0441\u043A\u0430\u0443\u0442\u044B \u0438 \u0432 \u043A\u0430\u043A\u0443\u044E \u0442\u0430\u043A\u0442\u0438\u0447\u0435\u0441\u043A\u0443\u044E \u0441\u0445\u0435\u043C\u0443 \u043F\u043B\u0430\u043D\u0438\u0440\u0443\u044E\u0442 \u0432\u0441\u0442\u0440\u043E\u0438\u0442\u044C \u0444\u0443\u0442\u0431\u043E\u043B\u0438\u0441\u0442\u0430"
}`;
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          systemInstruction: "\u041E\u0442\u0432\u0435\u0447\u0430\u0439 \u0442\u043E\u043B\u044C\u043A\u043E \u0432\u0430\u043B\u0438\u0434\u043D\u044B\u043C JSON \u0431\u0435\u0437 markdown \u043E\u0431\u0435\u0440\u0442\u043E\u043A."
        }
      });
      const text = response.text || "";
      const parsed = JSON.parse(text);
      if (parsed && parsed.feeAmount) {
        const feeNum = parseFloat(parsed.feeAmount) || rating * 0.15;
        return {
          id: "fo_" + Math.random().toString(36).substring(2, 9),
          pid: player2.id,
          playerName: player2.name,
          pos: player2.pos,
          playerRating: rating,
          clubId: club.id,
          clubName: club.name,
          buyerClub: targetClub.name,
          buyerCountry: targetClub.country,
          buyerLeague: targetClub.league,
          buyerFlag: targetClub.flag,
          buyerLogo: getForeignClubBadgeSvg(targetClub),
          type: parsed.type === "loan" ? "loan" : "sale",
          fee: parsed.feeDescription || `\u20AC${feeNum.toFixed(1)} \u043C\u043B\u043D`,
          feeAmount: feeNum,
          wage: parsed.wage || `\u20AC${(feeNum * 0.2).toFixed(1)} \u043C\u043B\u043D/\u0433\u043E\u0434`,
          durationYears: parsed.durationYears || (parsed.type === "loan" ? 1 : 4),
          loanTerm: parsed.type === "loan" ? "\u0410\u0440\u0435\u043D\u0434\u0430 \u043D\u0430 1 \u0441\u0435\u0437\u043E\u043D" : void 0,
          scoutReport: parsed.scoutReport || `\u0421\u043A\u0430\u0443\u0442\u044B \xAB${targetClub.name}\xBB \u0432\u044B\u0441\u043E\u043A\u043E \u043E\u0446\u0435\u043D\u0438\u043B\u0438 \u0438\u0433\u0440\u0443 \u0444\u0443\u0442\u0431\u043E\u043B\u0438\u0441\u0442\u0430 \u0438 \u0432\u0438\u0434\u044F\u0442 \u0432 \u043D\u0435\u043C \u0443\u0441\u0438\u043B\u0435\u043D\u0438\u0435 \u043E\u0441\u043D\u043E\u0432\u043D\u043E\u0433\u043E \u0441\u043E\u0441\u0442\u0430\u0432\u0430.`,
          triggerReason: performanceReason,
          matchId,
          date: now,
          status: "pending"
        };
      }
    } catch (err) {
      console.warn("[AI Studio] Gemini foreign scout generation fallback:", err);
    }
  }
  const isLoan = Math.random() < 0.35;
  let baseFee = (rating - 60) * 0.65 + Math.random() * 4;
  if (targetClub.tier === 1) baseFee *= 1.8;
  if (targetClub.tier === 3) baseFee *= 0.85;
  baseFee = Math.max(1.2, Math.round(baseFee * 10) / 10);
  const feeAmount = isLoan ? Math.max(0.6, Math.round(baseFee * 0.2 * 10) / 10) : baseFee;
  const feeStr = isLoan ? `\u20AC${feeAmount.toFixed(1)} \u043C\u043B\u043D (\u0430\u0440\u0435\u043D\u0434\u0430 \u0441 \u043E\u043F\u0446\u0438\u0435\u0439 \u0432\u044B\u043A\u0443\u043F\u0430 \u0437\u0430 \u20AC${(feeAmount * 5).toFixed(1)} \u043C\u043B\u043D)` : `\u20AC${feeAmount.toFixed(1)} \u043C\u043B\u043D`;
  const scoutComments = [
    `\u0410\u043D\u0430\u043B\u0438\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0434\u0435\u043F\u0430\u0440\u0442\u0430\u043C\u0435\u043D\u0442 \xAB${targetClub.name}\xBB \u043E\u0442\u043C\u0435\u0442\u0438\u043B \u0432\u044B\u0434\u0430\u044E\u0449\u0438\u0439\u0441\u044F \u0442\u0430\u0439\u043C\u0438\u043D\u0433, \u0445\u043B\u0430\u0434\u043D\u043E\u043A\u0440\u043E\u0432\u0438\u0435 \u0438 \u0432\u043B\u0438\u044F\u043D\u0438\u0435 \u043D\u0430 \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u0432 \u043D\u0435\u0434\u0430\u0432\u043D\u0438\u0445 \u043C\u0430\u0442\u0447\u0430\u0445. \u041A\u043B\u0443\u0431 \u0433\u043E\u0442\u043E\u0432 \u043A \u043D\u0435\u043C\u0435\u0434\u043B\u0435\u043D\u043D\u043E\u043C\u0443 \u043E\u0444\u043E\u0440\u043C\u043B\u0435\u043D\u0438\u044E \u0441\u0434\u0435\u043B\u043A\u0438.`,
    `\u0413\u043B\u0430\u0432\u043D\u044B\u0439 \u0442\u0440\u0435\u043D\u0435\u0440 \xAB${targetClub.name}\xBB \u043B\u0438\u0447\u043D\u043E \u0437\u0430\u043F\u0440\u043E\u0441\u0438\u043B \u0443\u0441\u0438\u043B\u0435\u043D\u0438\u0435 \u043D\u0430 \u043F\u043E\u0437\u0438\u0446\u0438\u044E ${player2.pos}. \u0424\u0443\u0442\u0431\u043E\u043B\u0438\u0441\u0442 \u0438\u0434\u0435\u0430\u043B\u044C\u043D\u043E \u043F\u043E\u0434\u0445\u043E\u0434\u0438\u0442 \u043F\u043E\u0434 \u0432\u044B\u0441\u043E\u043A\u0438\u0439 \u043F\u0440\u0435\u0441\u0441\u0438\u043D\u0433 \u0438 \u0431\u044B\u0441\u0442\u0440\u044B\u0439 \u043F\u0435\u0440\u0435\u0445\u043E\u0434 \u0432 \u0430\u0442\u0430\u043A\u0443.`,
    `\u0421\u043A\u0430\u0443\u0442\u044B \u0437\u0430\u0444\u0438\u043A\u0441\u0438\u0440\u043E\u0432\u0430\u043B\u0438 \u0432\u044B\u0441\u043E\u043A\u0443\u044E \u0438\u043D\u0442\u0435\u043D\u0441\u0438\u0432\u043D\u043E\u0441\u0442\u044C \u0435\u0434\u0438\u043D\u043E\u0431\u043E\u0440\u0441\u0442\u0432 \u0438 \u0442\u0430\u043A\u0442\u0438\u0447\u0435\u0441\u043A\u0443\u044E \u0437\u0440\u0435\u043B\u043E\u0441\u0442\u044C. \xAB${targetClub.name}\xBB \u0432\u0438\u0434\u0438\u0442 \u0432 \u0438\u0433\u0440\u043E\u043A\u0435 \u043F\u0440\u044F\u043C\u0443\u044E \u0437\u0430\u043C\u0435\u043D\u0443 \u0443\u0445\u043E\u0434\u044F\u0449\u0435\u043C\u0443 \u043B\u0438\u0434\u0435\u0440\u0443 \u043A\u043E\u043C\u0430\u043D\u0434\u044B.`,
    `\u0412\u043F\u0435\u0447\u0430\u0442\u043B\u044F\u044E\u0449\u0435\u0435 \u0432\u044B\u0441\u0442\u0443\u043F\u043B\u0435\u043D\u0438\u0435 \u043F\u0440\u0438\u0432\u043B\u0435\u043A\u043B\u043E \u0432\u043D\u0438\u043C\u0430\u043D\u0438\u0435 \u0435\u0432\u0440\u043E\u043F\u0435\u0439\u0441\u043A\u0438\u0445 \u043A\u043B\u0443\u0431\u043E\u0432: \xAB${targetClub.name}\xBB \u043E\u043F\u0435\u0440\u0435\u0436\u0430\u0435\u0442 \u043A\u043E\u043D\u043A\u0443\u0440\u0435\u043D\u0442\u043E\u0432 \u0438 \u0434\u0435\u043B\u0430\u0435\u0442 \u043E\u0444\u0438\u0446\u0438\u0430\u043B\u044C\u043D\u043E\u0435 \u043F\u0440\u0435\u0434\u043B\u043E\u0436\u0435\u043D\u0438\u0435.`
  ];
  const scoutReport = scoutComments[Math.floor(Math.random() * scoutComments.length)];
  return {
    id: "fo_" + Math.random().toString(36).substring(2, 9),
    pid: player2.id,
    playerName: player2.name,
    pos: player2.pos,
    playerRating: rating,
    clubId: club.id,
    clubName: club.name,
    buyerClub: targetClub.name,
    buyerCountry: targetClub.country,
    buyerLeague: targetClub.league,
    buyerFlag: targetClub.flag,
    buyerLogo: getForeignClubBadgeSvg(targetClub),
    type: isLoan ? "loan" : "sale",
    fee: feeStr,
    feeAmount,
    wage: `\u20AC${Math.max(0.4, feeAmount * 0.18).toFixed(1)} \u043C\u043B\u043D/\u0433\u043E\u0434`,
    durationYears: isLoan ? 1 : 4,
    loanTerm: isLoan ? "\u0410\u0440\u0435\u043D\u0434\u0430 \u043D\u0430 1 \u0441\u0435\u0437\u043E\u043D" : void 0,
    scoutReport,
    triggerReason: performanceReason,
    matchId,
    date: now,
    status: "pending"
  };
}
async function checkForeignInterestAfterMatch(db2, match, fixture) {
  if (!db2 || !match || !fixture) return [] as any[];
  if (!db2.foreignOffers) db2.foreignOffers = [];
  if (!db2.transfers) db2.transfers = [];
  const createdOffers: any[] = [];
  const ratings = match.ratings || {};
  const motm = match.motm;
  const candidatePids = [];
  if (motm && motm.pid) {
    candidatePids.push({
      pid: motm.pid,
      rating: motm.rating || 8,
      reason: `\u041F\u0440\u0438\u0437\u043D\u0430\u043D \u043B\u0443\u0447\u0448\u0438\u043C \u0438\u0433\u0440\u043E\u043A\u043E\u043C \u043C\u0430\u0442\u0447\u0430 (MOTM) \u0441 \u0440\u0435\u0439\u0442\u0438\u043D\u0433\u043E\u043C ${motm.rating || 8}`
    });
  }
  for (const [pid, rate] of Object.entries(ratings)) {
    const numRate = typeof rate === "number" ? rate : rate?.rating || 0;
    if (numRate >= 7.4 && !candidatePids.some((c) => c.pid === pid)) {
      candidatePids.push({
        pid,
        rating: numRate,
        reason: `\u0412\u044B\u0434\u0430\u044E\u0449\u0438\u0439\u0441\u044F \u0438\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u044C\u043D\u044B\u0439 \u043F\u0435\u0440\u0444\u043E\u0440\u043C\u0430\u043D\u0441 \u0441 \u043E\u0446\u0435\u043D\u043A\u043E\u0439 ${numRate.toFixed(1)}`
      });
    }
  }
  for (const ev of match.events || []) {
    if (ev.type === "goal" && ev.pids?.[0]) {
      const pid = ev.pids[0];
      if (!candidatePids.some((c) => c.pid === pid)) {
        candidatePids.push({
          pid,
          rating: 7.2,
          reason: `\u0410\u0432\u0442\u043E\u0440 \u0437\u0430\u0431\u0438\u0442\u043E\u0433\u043E \u0433\u043E\u043B\u0430 \u0432 \u043C\u0430\u0442\u0447\u0435 ${fixture.round ? fixture.round + "-\u0433\u043E \u0442\u0443\u0440\u0430" : ""}`
        });
      }
    }
  }
  for (const candidate of candidatePids.slice(0, 2)) {
    const p = (db2.players || []).find((x) => x.id === candidate.pid);
    if (!p || !p.teamId) continue;
    const clb = (db2.teams || []).find((t) => t.id === p.teamId);
    if (!clb) continue;
    const alreadyPending = db2.foreignOffers.some((o) => o.pid === p.id && o.status === "pending");
    if (alreadyPending) continue;
    if (Math.random() < 0.75) {
      try {
        const offer = await createForeignOfferWithAI({
          player: p,
          club: clb,
          performanceReason: candidate.reason,
          matchRating: candidate.rating,
          matchId: fixture.id
        });
        db2.foreignOffers.push(offer);
        createdOffers.push(offer);
        db2.transfers.push({
          id: "tr_" + offer.id,
          pid: offer.pid,
          playerName: offer.playerName,
          pos: offer.pos,
          from: clb.id,
          fromName: clb.name,
          to: null,
          toName: offer.buyerClub,
          isForeign: true,
          buyerCountry: offer.buyerCountry,
          buyerFlag: offer.buyerFlag,
          type: offer.type,
          fee: offer.fee,
          feeAmount: offer.feeAmount,
          date: offer.date.slice(0, 10),
          status: "pending",
          clubApproval: "pending",
          adminApproval: "approved",
          note: offer.scoutReport,
          foreignOfferId: offer.id
        });
      } catch (err) {
        console.error("\u041E\u0448\u0438\u0431\u043A\u0430 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u0437\u0430\u0440\u0443\u0431\u0435\u0436\u043D\u043E\u0433\u043E \u0442\u0440\u0430\u043D\u0441\u0444\u0435\u0440\u043D\u043E\u0433\u043E \u043E\u0444\u0444\u0435\u0440\u0430:", err);
      }
    }
  }
  return createdOffers;
}
function respondToForeignOffer(db2, offerId, action, clubId, comment) {
  if (!db2.foreignOffers) db2.foreignOffers = [];
  const offer = db2.foreignOffers.find((o) => o.id === offerId);
  if (!offer || offer.status !== "pending") {
    throw new Error("\u041F\u0440\u0435\u0434\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E \u0438\u043B\u0438 \u0443\u0436\u0435 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u0430\u043D\u043E");
  }
  if (offer.clubId !== clubId) {
    throw new Error("\u042D\u0442\u043E \u043F\u0440\u0435\u0434\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u0430\u0434\u0440\u0435\u0441\u043E\u0432\u0430\u043D\u043E \u0434\u0440\u0443\u0433\u043E\u043C\u0443 \u043A\u043B\u0443\u0431\u0443");
  }
  const p = (db2.players || []).find((x) => x.id === offer.pid);
  const seller = (db2.teams || []).find((t) => t.id === clubId);
  const tr = (db2.transfers || []).find((x) => x.foreignOfferId === offerId || x.id === "tr_" + offerId);
  if (action === "accept") {
    offer.status = "accepted";
    if (tr) {
      tr.status = "approved";
      tr.clubApproval = "approved";
    }
    if (db2.squads && db2.squads[clubId]) {
      db2.squads[clubId] = db2.squads[clubId].filter((id) => id !== offer.pid);
    }
    if (p) {
      p.teamId = null;
      if (offer.type === "loan") {
        p.loanTo = offer.buyerClub;
        p.loanTerm = offer.loanTerm || "\u0410\u0440\u0435\u043D\u0434\u0430 \u043D\u0430 1 \u0441\u0435\u0437\u043E\u043D";
      } else {
        p.realClub = offer.buyerClub;
        p.foreignClub = offer.buyerClub;
        p.status = "sold_abroad";
      }
    }
    const feeEuros = Math.round((offer.feeAmount || 1) * 1e6);
    let sellOnPayout = 0;
    let sellOnClubObj: any = null;
    if (p && p.sellOnPercent && p.sellOnPercent > 0 && p.sellOnClubId && p.sellOnClubId !== seller?.id) {
      sellOnClubObj = (db2.teams || []).find((t: any) => t.id === p.sellOnClubId);
      if (sellOnClubObj) {
        sellOnPayout = Math.round(feeEuros * (Number(p.sellOnPercent) / 100));
      }
    }
    const netSellerIncome = Math.max(0, feeEuros - sellOnPayout);

    if (seller) {
      const prevBudget = seller.budget || 0;
      seller.budget = prevBudget + netSellerIncome;
      if (!Array.isArray(db2.budgetHistory)) db2.budgetHistory = [];
      db2.budgetHistory.push({
        id: "bh_" + Math.random().toString(36).substring(2, 9),
        teamId: seller.id,
        teamName: seller.name,
        amount: netSellerIncome,
        prevBudget,
        newBudget: seller.budget,
        type: offer.type === "loan" ? "foreign_loan_income" : "foreign_sale_income",
        typeLabel: offer.type === "loan" ? "Аренда за рубеж" : "Продажа за рубеж",
        description: `${offer.type === "loan" ? "Аренда" : "Продажа"}: ${offer.playerName} в «${offer.buyerClub}» (${offer.buyerCountry}) (+€${netSellerIncome.toLocaleString("ru-RU")}${sellOnPayout > 0 ? `, за вычетом sell-on ${p.sellOnPercent}% в «${sellOnClubObj?.name}»: -€${sellOnPayout.toLocaleString("ru-RU")}` : ""})`,
        date: new Date().toISOString()
      });
    }

    if (sellOnPayout > 0 && sellOnClubObj) {
      const prevSoc = sellOnClubObj.budget || 0;
      sellOnClubObj.budget = prevSoc + sellOnPayout;
      if (!Array.isArray(db2.budgetHistory)) db2.budgetHistory = [];
      db2.budgetHistory.push({
        id: "bh_" + Math.random().toString(36).substring(2, 9),
        teamId: sellOnClubObj.id,
        teamName: sellOnClubObj.name,
        amount: sellOnPayout,
        prevBudget: prevSoc,
        newBudget: sellOnClubObj.budget,
        type: "sell_on_clause",
        typeLabel: "Выплата по Sell-on clause",
        description: `Пункт о перепродаже (${p.sellOnPercent}%): зарубежная продажа ${offer.playerName} в «${offer.buyerClub}» (+€${sellOnPayout.toLocaleString("ru-RU")})`,
        date: new Date().toISOString()
      });
    }
    return {
      success: true,
      action: "accepted",
      offer,
      newBudget: seller?.budget,
      message: `\u0422\u0440\u0430\u043D\u0441\u0444\u0435\u0440 \u043E\u0444\u043E\u0440\u043C\u043B\u0435\u043D! ${offer.playerName} \u043F\u0435\u0440\u0435\u0445\u043E\u0434\u0438\u0442 \u0432 \xAB${offer.buyerClub}\xBB (${offer.buyerCountry}). \u0412 \u0431\u044E\u0434\u0436\u0435\u0442 \u043A\u043B\u0443\u0431\u0430 \u043F\u043E\u0441\u0442\u0443\u043F\u0438\u043B\u043E \u20AC${feeEuros.toLocaleString("ru-RU")}.`
    };
  } else {
    offer.status = "rejected";
    if (tr) {
      tr.status = "rejected";
      tr.clubApproval = "rejected";
      tr.rejectReason = comment || "\u041E\u0442\u043A\u043B\u043E\u043D\u0435\u043D\u043E \u0432\u043B\u0430\u0434\u0435\u043B\u044C\u0446\u0435\u043C \u043A\u043B\u0443\u0431\u0430";
    }
    return {
      success: true,
      action: "rejected",
      offer,
      message: `\u0412\u044B \u043E\u0442\u043A\u043B\u043E\u043D\u0438\u043B\u0438 \u043F\u0440\u0435\u0434\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \xAB${offer.buyerClub}\xBB \u043F\u043E \u0438\u0433\u0440\u043E\u043A\u0443 ${offer.playerName}.`
    };
  }
}

export { checkForeignInterestAfterMatch, respondToForeignOffer, createForeignOfferWithAI, FOREIGN_CLUBS };
