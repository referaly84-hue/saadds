// @ts-nocheck
// src/awards.ts
function computeMatchRatings(m, f, HName, AName) {
  if (!m || !m.stats || !m.stats.players) return [];
  const homeWin = f.hg > f.ag;
  const awayWin = f.ag > f.hg;
  const draw = f.hg === f.ag;
  const ratings = [];
  for (const [pid, s] of Object.entries(m.stats.players)) {
    if (!s || (s.min || 0) < 10) continue;
    const isHome = s.side === "home";
    const won = isHome ? homeWin : awayWin;
    const lost = isHome ? awayWin : homeWin;
    const teamName = isHome ? HName : AName;
    const oppName = isHome ? AName : HName;
    const pos = m.ctx?.pos?.[pid] || "\u041F\u0417";
    let r = 6;
    if (s.min >= 75) r += 0.2;
    if (won) r += 0.4;
    else if (lost) r -= 0.3;
    if (pos === "\u0412\u0420" || pos === "\u0417\u0410\u0429") {
      r += (s.g || 0) * 1.5;
    } else {
      r += (s.g || 0) * 1.15;
    }
    r += (s.a || 0) * 0.75;
    r += (s.xg || 0) * 0.4;
    if (s.sh > 3) r += 0.2;
    if (pos === "\u0412\u0420") {
      r += (s.sv || 0) * 0.35;
      if (s.cs) r += 0.9;
      const goalsConceded = isHome ? f.ag : f.hg;
      if (goalsConceded > 2) r -= (goalsConceded - 2) * 0.4;
    }
    if (pos === "\u0417\u0410\u0429") {
      r += (s.tk || 0) * 0.25;
      if (s.cs && s.min >= 60) r += 0.6;
    }
    if (s.yc) r -= 0.4;
    if (s.rc) r -= 2;
    if ((s.ff || 0) > 3) r -= 0.2;
    if ((s.fa || 0) > 3) r += 0.2;
    const finalRating = Math.max(4, Math.min(10, +r.toFixed(1)));
    let highlight = "";
    if (s.g >= 3) highlight = `\u0425\u0435\u0442-\u0442\u0440\u0438\u043A (${s.g} \u0433\u043E\u043B\u0430)`;
    else if (s.g === 2) highlight = `\u0414\u0443\u0431\u043B\u044C \u0432 \u043C\u0430\u0442\u0447\u0435`;
    else if (s.g === 1 && s.a >= 1) highlight = `\u0413\u043E\u043B + \u0433\u043E\u043B\u0435\u0432\u0430\u044F \u043F\u0435\u0440\u0435\u0434\u0430\u0447\u0430`;
    else if (s.g === 1) highlight = `\u0417\u0430\u0431\u0438\u0442\u044B\u0439 \u043C\u044F\u0447`;
    else if (s.a >= 2) highlight = `\u0410\u0441\u0441\u0438\u0441\u0442\u0435\u043D\u0442\u0441\u043A\u0438\u0439 \u0434\u0443\u0431\u043B\u044C (${s.a} \u043F\u0430\u0441\u0430)`;
    else if (s.a === 1) highlight = `\u0413\u043E\u043B\u0435\u0432\u0430\u044F \u043F\u0435\u0440\u0435\u0434\u0430\u0447\u0430`;
    else if (pos === "\u0412\u0420" && s.sv >= 5) highlight = `${s.sv} \u043A\u043B\u044E\u0447\u0435\u0432\u044B\u0445 \u0441\u0435\u0439\u0432\u043E\u0432`;
    else if (pos === "\u0412\u0420" && s.cs) highlight = `\u0421\u0443\u0445\u043E\u0439 \u043C\u0430\u0442\u0447`;
    else if (pos === "\u0417\u0410\u0429" && s.tk >= 4) highlight = `${s.tk} \u0443\u0441\u043F\u0435\u0448\u043D\u044B\u0445 \u043E\u0442\u0431\u043E\u0440\u0430`;
    else highlight = `\u041D\u0430\u0434\u0435\u0436\u043D\u0430\u044F \u0438\u0433\u0440\u0430 \u0432 \u043E\u0441\u043D\u043E\u0432\u0435 (${s.min}')`;
    ratings.push({
      pid,
      name: s.n || "\u0418\u0433\u0440\u043E\u043A",
      pos,
      teamId: s.t,
      teamName,
      side: s.side,
      rating: finalRating,
      min: s.min,
      goals: s.g || 0,
      assists: s.a || 0,
      saves: s.sv || 0,
      tackles: s.tk || 0,
      shots: s.sh || 0,
      xg: s.xg || 0,
      cleanSheet: s.cs || 0,
      yc: s.yc || 0,
      rc: s.rc || 0,
      highlight
    });
  }
  ratings.sort((a, b) => b.rating - a.rating || b.goals + b.assists - (a.goals + a.assists) || b.min - a.min);
  return ratings;
}
function getMatchMotm(m, f, HName, AName, coachHome, coachAway) {
  const ratings = computeMatchRatings(m, f, HName, AName);
  if (!ratings.length) return null;
  const best = ratings[0];
  const isHome = best.side === "home";
  const coach = isHome ? coachHome : coachAway;
  const oppCoach = isHome ? coachAway : coachHome;
  const myTeam = best.teamName;
  const oppTeam = isHome ? AName : HName;
  const won = isHome && f.hg > f.ag || !isHome && f.ag > f.hg;
  const draw = f.hg === f.ag;
  let headline = `\xAB${best.name}: \u0437\u0430\u043B\u043E\u0433 \u0443\u0441\u043F\u0435\u0445\u0430 \u2014 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0435 \u043F\u043B\u0430\u043D\u0430 \u043D\u0430 \u0438\u0433\u0440\u0443\xBB`;
  let quote = "";
  let tacticsComment = "";
  let mood = won ? "euphoric" : draw ? "calm" : "frustrated";
  if (best.goals >= 2) {
    headline = `\xAB${best.name}: \u043F\u043E\u0441\u0432\u044F\u0449\u0430\u044E \u044D\u0442\u043E\u0442 \u0434\u0443\u0431\u043B\u044C \u043D\u0430\u0448\u0438\u043C \u043F\u0440\u0435\u0434\u0430\u043D\u043D\u044B\u043C \u0431\u043E\u043B\u0435\u043B\u044C\u0449\u0438\u043A\u0430\u043C!\xBB`;
    quote = `\u042D\u043C\u043E\u0446\u0438\u0438 \u0444\u0430\u043D\u0442\u0430\u0441\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0435! \u041C\u044F\u0447 \u0441\u0435\u0433\u043E\u0434\u043D\u044F \u043E\u0442\u043B\u0438\u0447\u043D\u043E \u0441\u043B\u0443\u0448\u0430\u043B\u0441\u044F, \u043F\u0430\u0440\u0442\u043D\u0435\u0440\u044B \u0432\u044B\u043A\u0430\u0442\u044B\u0432\u0430\u043B\u0438 \u043F\u0435\u0440\u0435\u0434\u0430\u0447\u0438 \u043F\u0440\u044F\u043C\u043E \u043F\u043E\u0434 \u0443\u0434\u0430\u0440. \u041C\u044B \u043F\u0440\u043E\u0432\u0435\u043B\u0438 \u043A\u043E\u043B\u043E\u0441\u0441\u0430\u043B\u044C\u043D\u0443\u044E \u0440\u0430\u0431\u043E\u0442\u0443 \u043D\u0430 \u043F\u0440\u0435\u0434\u043C\u0430\u0442\u0447\u0435\u0432\u044B\u0445 \u0442\u0440\u0435\u043D\u0438\u0440\u043E\u0432\u043A\u0430\u0445, \u0438 \u044D\u0442\u043E \u0434\u0430\u043B\u043E \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442.`;
  } else if (best.goals === 1 && won) {
    headline = `\xAB${best.name}: \u043C\u043E\u0439 \u0433\u043E\u043B \u2014 \u044D\u0442\u043E \u0437\u0430\u0441\u043B\u0443\u0433\u0430 \u0432\u0441\u0435\u0439 \u043A\u043E\u043C\u0430\u043D\u0434\u044B\xBB`;
    quote = `\u0421\u0430\u043C\u043E\u0435 \u0433\u043B\u0430\u0432\u043D\u043E\u0435 \u0441\u0435\u0433\u043E\u0434\u043D\u044F \u2014 \u0442\u0440\u0438 \u043E\u0447\u043A\u0430 \u0432 \u043A\u043E\u043F\u0438\u043B\u043A\u0443 \u043A\u043B\u0443\u0431\u0430. \u0417\u043D\u0430\u043B\u0438, \u0447\u0442\u043E ${oppTeam} \u0431\u0443\u0434\u0435\u0442 \u0431\u0438\u0442\u044C\u0441\u044F \u0437\u0430 \u043A\u0430\u0436\u0434\u044B\u0439 \u043C\u0435\u0442\u0440 \u043F\u043E\u043B\u044F, \u043D\u043E \u043C\u044B \u0432\u044B\u0434\u0435\u0440\u0436\u0430\u043B\u0438 \u0442\u0435\u043C\u043F \u0438 \u0440\u0435\u0430\u043B\u0438\u0437\u043E\u0432\u0430\u043B\u0438 \u0441\u0432\u043E\u0439 \u0448\u0430\u043D\u0441.`;
  } else if (best.pos === "\u0412\u0420" && (best.saves >= 4 || best.cleanSheet)) {
    headline = `\xAB${best.name}: \u043A\u043E\u0433\u0434\u0430 \u0437\u0430\u0449\u0438\u0442\u043D\u0438\u043A\u0438 \u0441\u0442\u0440\u0430\u0445\u0443\u044E\u0442, \u043B\u043E\u0432\u0438\u0442\u044C \u043A\u0443\u0440\u0430\u0436 \u043D\u0430\u043C\u043D\u043E\u0433\u043E \u043B\u0435\u0433\u0447\u0435\xBB`;
    quote = `\u0422\u044F\u0436\u0435\u043B\u0435\u0439\u0448\u0438\u0439 \u043C\u0430\u0442\u0447 \u0434\u043B\u044F \u0432\u0440\u0430\u0442\u0430\u0440\u044F. \u041D\u0430\u043F\u0430\u0434\u0430\u044E\u0449\u0438\u0435 \u0441\u043E\u043F\u0435\u0440\u043D\u0438\u043A\u0430 \u043F\u043E\u0441\u0442\u043E\u044F\u043D\u043D\u043E \u043D\u0430\u0433\u0440\u0443\u0436\u0430\u043B\u0438 \u0448\u0442\u0440\u0430\u0444\u043D\u0443\u044E \u0438 \u043E\u043F\u0430\u0441\u043D\u043E \u0431\u0438\u043B\u0438 \u0438\u0437 \u043B\u044E\u0431\u044B\u0445 \u043F\u043E\u0437\u0438\u0446\u0438\u0439. \u0420\u0430\u0434, \u0447\u0442\u043E \u0432\u044B\u0440\u0443\u0447\u0438\u043B \u043F\u0430\u0440\u043D\u0435\u0439 \u0438 \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u043B \u0432\u043E\u0440\u043E\u0442\u0430 \u0432 \u043D\u0435\u043F\u0440\u0438\u043A\u043E\u0441\u043D\u043E\u0432\u0435\u043D\u043D\u043E\u0441\u0442\u0438.`;
  } else if (best.assists >= 1) {
    headline = `\xAB${best.name}: \u0432\u0441\u043A\u0440\u044B\u0432\u0430\u0442\u044C \u0442\u0430\u043A\u0443\u044E \u043F\u043B\u043E\u0442\u043D\u0443\u044E \u043E\u0431\u043E\u0440\u043E\u043D\u0443 \u0432\u0441\u0435\u0433\u0434\u0430 \u043F\u0440\u0438\u044F\u0442\u043D\u043E\xBB`;
    quote = `\u0422\u0440\u0435\u043D\u0435\u0440 \u043F\u0435\u0440\u0435\u0434 \u0432\u044B\u0445\u043E\u0434\u043E\u043C \u043D\u0430 \u043F\u043E\u043B\u0435 \u043F\u0440\u044F\u043C\u043E \u0441\u043A\u0430\u0437\u0430\u043B: \u0438\u0449\u0438 \u0441\u0432\u043E\u0431\u043E\u0434\u043D\u044B\u0435 \u043A\u043E\u0440\u0438\u0434\u043E\u0440\u044B \u043C\u0435\u0436\u0434\u0443 \u043B\u0438\u043D\u0438\u044F\u043C\u0438. \u0423\u0432\u0438\u0434\u0435\u043B \u0440\u044B\u0432\u043E\u043A \u043F\u0430\u0440\u0442\u043D\u0435\u0440\u0430, \u0432\u043B\u043E\u0436\u0438\u043B \u043C\u044F\u0447 \u0432 \u043D\u043E\u0433\u0443 \u2014 \u043E\u0441\u0442\u0430\u043B\u044C\u043D\u043E\u0435 \u0431\u044B\u043B\u043E \u0434\u0435\u043B\u043E\u043C \u0442\u0435\u0445\u043D\u0438\u043A\u0438.`;
  } else if (won) {
    headline = `\xAB${best.name}: \u043C\u044B \u0434\u043E\u043A\u0430\u0437\u0430\u043B\u0438, \u0447\u0442\u043E \u0441\u0438\u043B\u044C\u043D\u0435\u0435 \u0438 \u0433\u043E\u0442\u043E\u0432\u044B \u0431\u043E\u0440\u043E\u0442\u044C\u0441\u044F \u0437\u0430 \u0441\u0430\u043C\u044B\u0435 \u0432\u044B\u0441\u043E\u043A\u0438\u0435 \u043C\u0435\u0441\u0442\u0430\xBB`;
    quote = `\u041F\u043E\u0431\u0435\u0434\u0430 \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u0430\u0441\u044C \u0442\u0440\u0443\u0434\u043E\u0432\u043E\u0439. \u041C\u044B \u043D\u0435 \u0443\u0441\u0442\u0443\u043F\u0438\u043B\u0438 \u043D\u0438 \u0432 \u043E\u0434\u043D\u043E\u043C \u0435\u0434\u0438\u043D\u043E\u0431\u043E\u0440\u0441\u0442\u0432\u0435 \u0438 \u043F\u0435\u0440\u0435\u0442\u0435\u0440\u043F\u0435\u043B\u0438 \u0432\u0441\u0435 \u043F\u043E\u043F\u044B\u0442\u043A\u0438 \u0441\u043E\u043F\u0435\u0440\u043D\u0438\u043A\u0430 \u043F\u0435\u0440\u0435\u043B\u043E\u043C\u0438\u0442\u044C \u0438\u0433\u0440\u0443.`;
  } else {
    headline = `\xAB${best.name}: \u0440\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442 \u043E\u0441\u0442\u0430\u0432\u043B\u044F\u0435\u0442 \u043E\u0441\u0430\u0434\u043E\u043A, \u043D\u043E \u043C\u044B \u0441\u0434\u0435\u043B\u0430\u043B\u0438 \u0432\u0441\u0451 \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0435\xBB`;
    quote = `\u0425\u043E\u0442\u0435\u043B\u043E\u0441\u044C \u0431\u043E\u043B\u044C\u0448\u0435\u0433\u043E, \u0438\u0433\u0440\u0430 \u0434\u0430\u0432\u0430\u043B\u0430\u0441\u044C, \u043D\u043E \u0440\u0435\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u044F \u043D\u0435\u043C\u043D\u043E\u0433\u043E \u043F\u043E\u0434\u0432\u0435\u043B\u0430. \u0421\u0434\u0435\u043B\u0430\u0435\u043C \u0432\u044B\u0432\u043E\u0434\u044B \u0438 \u0432 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u043C \u0442\u0443\u0440\u0435 \u0432\u044B\u0439\u0434\u0435\u043C \u0435\u0449\u0451 \u0431\u043E\u043B\u0435\u0435 \u0437\u0430\u0440\u044F\u0436\u0435\u043D\u043D\u044B\u043C\u0438.`;
  }
  if (coach) {
    if (coach.style === "bus") {
      tacticsComment = `\xAB\u0423\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0430 ${coach.name} \u0431\u044B\u043B\u0430 \u043F\u0440\u0435\u0434\u0435\u043B\u044C\u043D\u043E \u043F\u043E\u043D\u044F\u0442\u043D\u0430: \u0441\u044B\u0433\u0440\u0430\u0442\u044C \u0441\u0442\u0440\u043E\u0433\u043E, \u043A\u043E\u043C\u043F\u0430\u043A\u0442\u043D\u043E \u0443 \u0441\u0432\u043E\u0435\u0439 \u0448\u0442\u0440\u0430\u0444\u043D\u043E\u0439 \u0438 \u043F\u0435\u0440\u0435\u043A\u0440\u044B\u0442\u044C \u0432\u0441\u0435 \u0441\u0432\u043E\u0431\u043E\u0434\u043D\u044B\u0435 \u0437\u043E\u043D\u044B. \u041C\u044B "\u043F\u043E\u0441\u0442\u0430\u0432\u0438\u043B\u0438 \u0430\u0432\u0442\u043E\u0431\u0443\u0441", \u043A\u043E\u0433\u0434\u0430 \u044D\u0442\u043E \u0442\u0440\u0435\u0431\u043E\u0432\u0430\u043B\u043E\u0441\u044C, \u0438 \u043D\u0435 \u0434\u0430\u043B\u0438 \u0441\u043E\u043F\u0435\u0440\u043D\u0438\u043A\u0443 \u043D\u0438\u0447\u0435\u0433\u043E \u0441\u043E\u0437\u0434\u0430\u0442\u044C\xBB.`;
    } else if (coach.style === "attack") {
      tacticsComment = `\xAB${coach.name} \u0441 \u043F\u0435\u0440\u0432\u044B\u0445 \u043C\u0438\u043D\u0443\u0442 \u0437\u0430\u0440\u044F\u0436\u0430\u043B \u043D\u0430\u0441 \u043D\u0430 \u0430\u0442\u0430\u043A\u0443. \u041D\u0430\u043C \u043D\u0435 \u0440\u0430\u0437\u0440\u0435\u0448\u0430\u043B\u0438 \u043F\u0440\u0438\u0436\u0438\u043C\u0430\u0442\u044C\u0441\u044F \u043D\u0430\u0437\u0430\u0434 \u0434\u0430\u0436\u0435 \u043F\u0440\u0438 \u043A\u043E\u043C\u0444\u043E\u0440\u0442\u043D\u043E\u043C \u0441\u0447\u0451\u0442\u0435 \u2014 \u0442\u0440\u0435\u0431\u043E\u0432\u0430\u043B\u0438 \u0431\u0435\u0436\u0430\u0442\u044C \u0432\u043F\u0435\u0440\u0451\u0434, \u0431\u0438\u0442\u044C \u0438 \u043F\u0440\u0435\u0441\u0441\u0438\u043D\u0433\u043E\u0432\u0430\u0442\u044C \u0434\u043E \u0444\u0438\u043D\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u0441\u0432\u0438\u0441\u0442\u043A\u0430\xBB.`;
    } else if (coach.style === "press") {
      tacticsComment = `\xAB\u041F\u0440\u0435\u0441\u0441\u0438\u043D\u0433 \u043E\u0442\u043D\u044F\u043B \u043C\u043D\u043E\u0433\u043E \u0441\u0438\u043B, \u043D\u043E \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0430 \u0442\u0440\u0435\u043D\u0435\u0440\u0430 \u0441\u0440\u0430\u0431\u043E\u0442\u0430\u043B\u0430 \u043D\u0430 100%. \u041C\u044B \u0431\u0443\u043A\u0432\u0430\u043B\u044C\u043D\u043E \u0437\u0430\u0434\u0443\u0448\u0438\u043B\u0438 ${oppTeam} \u0432 \u0446\u0435\u043D\u0442\u0440\u0435 \u043F\u043E\u043B\u044F \u0438 \u0437\u0430\u0441\u0442\u0430\u0432\u0438\u043B\u0438 \u0438\u0445 \u043E\u0448\u0438\u0431\u0430\u0442\u044C\u0441\u044F\xBB.`;
    } else if (coach.style === "possession") {
      tacticsComment = `\xAB\u041C\u044B \u0432\u043B\u0430\u0434\u0435\u043B\u0438 \u043C\u044F\u0447\u043E\u043C \u0438 \u0434\u0438\u043A\u0442\u043E\u0432\u0430\u043B\u0438 \u0441\u0432\u043E\u0439 \u0440\u0438\u0442\u043C. ${coach.name} \u0443\u0447\u0438\u0442 \u043D\u0430\u0441 \u0442\u0435\u0440\u043F\u0435\u043D\u0438\u044E \u2014 \u0440\u0430\u0441\u0448\u0430\u0442\u044B\u0432\u0430\u0442\u044C \u0447\u0443\u0436\u0438\u0435 \u043E\u0431\u043E\u0440\u043E\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0440\u0435\u0434\u0443\u0442\u044B \u043A\u043E\u0440\u043E\u0442\u043A\u0438\u043C \u043F\u0430\u0441\u043E\u043C \u0434\u043E \u0432\u0435\u0440\u043D\u043E\u0433\u043E \u043C\u043E\u043C\u0435\u043D\u0442\u0430\xBB.`;
    } else {
      tacticsComment = `\xAB\u041F\u043B\u0430\u043D \u043D\u0430 \u043A\u043E\u043D\u0442\u0440\u0430\u0442\u0430\u043A\u0438 \u0441\u0440\u0430\u0431\u043E\u0442\u0430\u043B \u0432\u0435\u043B\u0438\u043A\u043E\u043B\u0435\u043F\u043D\u043E. \u0422\u0440\u0435\u043D\u0435\u0440 \u0440\u0430\u0437\u043E\u0431\u0440\u0430\u043B \u0441\u043B\u0430\u0431\u044B\u0435 \u0437\u043E\u043D\u044B \u0441\u043E\u043F\u0435\u0440\u043D\u0438\u043A\u0430, \u0438 \u043D\u0430\u0448\u0438 \u0431\u044B\u0441\u0442\u0440\u044B\u0435 \u0432\u044B\u043F\u0430\u0434\u044B \u0441\u0442\u0430\u043B\u0438 \u0434\u043B\u044F \u043D\u0438\u0445 \u043F\u043E\u043B\u043D\u043E\u0439 \u043D\u0435\u043E\u0436\u0438\u0434\u0430\u043D\u043D\u043E\u0441\u0442\u044C\u044E\xBB.`;
    }
  } else {
    tacticsComment = `\xAB\u0422\u0440\u0435\u043D\u0435\u0440\u0441\u043A\u0438\u0439 \u0448\u0442\u0430\u0431 \u0438\u0434\u0435\u0430\u043B\u044C\u043D\u043E \u043F\u043E\u0434\u0433\u043E\u0442\u043E\u0432\u0438\u043B \u043D\u0430\u0441 \u0442\u0430\u043A\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u043A \u044D\u0442\u043E\u0439 \u0438\u0433\u0440\u0435\xBB.`;
  }
  return {
    pid: best.pid,
    name: best.name,
    pos: best.pos,
    teamId: best.teamId,
    teamName: best.teamName,
    rating: best.rating,
    interview: {
      headline,
      quote,
      tacticsComment,
      mood
    }
  };
}
function buildTeamOfRound(roundLabelText, comp, fixtures, matchesMap, teamsMap) {
  const roundFixtures = fixtures.filter((f) => f.comp === comp && (f.label === roundLabelText || `${f.round}-\u0439 \u0442\u0443\u0440` === roundLabelText || String(f.round) === roundLabelText) && f.status === "done");
  if (!roundFixtures.length) return null;
  const allRatings = [];
  for (const f of roundFixtures) {
    const m = matchesMap[f.id];
    if (!m || !m.stats) continue;
    const H = teamsMap[f.home]?.name || f.home;
    const A = teamsMap[f.away]?.name || f.away;
    const list = computeMatchRatings(m, f, H, A);
    for (const r of list) {
      r.teamLogo = teamsMap[r.teamId]?.logo;
      allRatings.push(r);
    }
  }
  if (allRatings.length < 11) return null;
  const gks = allRatings.filter((p) => p.pos === "\u0412\u0420").sort((a, b) => b.rating - a.rating);
  const defs = allRatings.filter((p) => p.pos === "\u0417\u0410\u0429").sort((a, b) => b.rating - a.rating);
  const mids = allRatings.filter((p) => p.pos === "\u041F\u0417").sort((a, b) => b.rating - a.rating);
  const fwds = allRatings.filter((p) => p.pos === "\u041D\u0410\u041F").sort((a, b) => b.rating - a.rating);
  const pickedGk = gks[0] || allRatings[0];
  const pickedDefs = defs.slice(0, 4);
  const pickedMids = mids.slice(0, 3);
  const pickedFwds = fwds.slice(0, 3);
  const usedPids = /* @__PURE__ */ new Set([pickedGk.pid, ...pickedDefs.map((p) => p.pid), ...pickedMids.map((p) => p.pid), ...pickedFwds.map((p) => p.pid)]);
  const remaining = allRatings.filter((p) => !usedPids.has(p.pid)).sort((a, b) => b.rating - a.rating);
  while (pickedDefs.length < 4 && remaining.length) {
    const p = remaining.shift();
    pickedDefs.push(p);
    usedPids.add(p.pid);
  }
  while (pickedMids.length < 3 && remaining.length) {
    const p = remaining.shift();
    pickedMids.push(p);
    usedPids.add(p.pid);
  }
  while (pickedFwds.length < 3 && remaining.length) {
    const p = remaining.shift();
    pickedFwds.push(p);
    usedPids.add(p.pid);
  }
  const starting11 = [pickedGk, ...pickedDefs, ...pickedMids, ...pickedFwds];
  const bestOfAll = [...starting11].sort((a, b) => b.rating - a.rating)[0];
  const winningFx = [...roundFixtures].sort((a, b) => Math.abs(b.hg - b.ag) - Math.abs(a.hg - a.ag))[0];
  const winTeamId = winningFx ? winningFx.hg >= winningFx.ag ? winningFx.home : winningFx.away : roundFixtures[0]?.home;
  const winTeam = teamsMap[winTeamId];
  return {
    title: `\u0421\u0431\u043E\u0440\u043D\u0430\u044F ${roundLabelText}`,
    periodLabel: roundLabelText,
    comp,
    formation: "4-3-3",
    playerOfThePeriod: bestOfAll,
    coachOfThePeriod: {
      name: winTeam?.coach?.name || "\u0413\u043B\u0430\u0432\u043D\u044B\u0439 \u0442\u0440\u0435\u043D\u0435\u0440",
      teamName: winTeam?.name || "\u041A\u043E\u043C\u0430\u043D\u0434\u0430 \u0442\u0443\u0440\u0430",
      teamLogo: winTeam?.logo,
      reason: `\u0422\u0430\u043A\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0442\u0440\u0438\u0443\u043C\u0444 \u0438 \u0434\u043E\u043C\u0438\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u043D\u0430\u0434 \u0441\u043E\u043F\u0435\u0440\u043D\u0438\u043A\u043E\u043C \u0432 \u0442\u0443\u0440\u0435`
    },
    lineup: {
      gk: pickedGk,
      def: pickedDefs,
      mid: pickedMids,
      fwd: pickedFwds
    },
    bench: remaining.slice(0, 5)
  };
}
function buildTeamOfMonth(yearMonth, comp, fixtures, matchesMap, teamsMap) {
  const monthNames = {
    "01": "\u042F\u043D\u0432\u0430\u0440\u044C",
    "02": "\u0424\u0435\u0432\u0440\u0430\u043B\u044C",
    "03": "\u041C\u0430\u0440\u0442",
    "04": "\u0410\u043F\u0440\u0435\u043B\u044C",
    "05": "\u041C\u0430\u0439",
    "06": "\u0418\u044E\u043D\u044C",
    "07": "\u0418\u044E\u043B\u044C",
    "08": "\u0410\u0432\u0433\u0443\u0441\u0442",
    "09": "\u0421\u0435\u043D\u0442\u044F\u0431\u0440\u044C",
    "10": "\u041E\u043A\u0442\u044F\u0431\u0440\u044C",
    "11": "\u041D\u043E\u044F\u0431\u0440\u044C",
    "12": "\u0414\u0435\u043A\u0430\u0431\u0440\u044C"
  };
  const [y, mStr] = yearMonth.split("-");
  const label = `${monthNames[mStr] || mStr} ${y}`;
  const monthFx = fixtures.filter((f) => f.comp === comp && (f.date || "").startsWith(yearMonth) && f.status === "done");
  if (!monthFx.length) return null;
  const playerStats = {};
  for (const f of monthFx) {
    const m = matchesMap[f.id];
    if (!m || !m.stats) continue;
    const H = teamsMap[f.home]?.name || f.home;
    const A = teamsMap[f.away]?.name || f.away;
    const list = computeMatchRatings(m, f, H, A);
    for (const r of list) {
      const cur = playerStats[r.pid] ||= {
        pid: r.pid,
        name: r.name,
        pos: r.pos,
        teamId: r.teamId,
        teamName: r.teamName,
        ratings: [],
        goals: 0,
        assists: 0,
        saves: 0,
        tackles: 0,
        shots: 0,
        xg: 0,
        cleanSheets: 0,
        matches: 0
      };
      cur.ratings.push(r.rating);
      cur.goals += r.goals;
      cur.assists += r.assists;
      cur.saves += r.saves;
      cur.tackles += r.tackles;
      cur.shots += r.shots;
      cur.xg += r.xg;
      cur.cleanSheets += r.cleanSheet;
      cur.matches += 1;
    }
  }
  const allRatings = Object.values(playerStats).map((p) => {
    const avgRating = +(p.ratings.reduce((a, b) => a + b, 0) / p.ratings.length).toFixed(2);
    const weightedRating = +(avgRating + Math.min(0.3, p.matches * 0.05)).toFixed(1);
    return {
      pid: p.pid,
      name: p.name,
      pos: p.pos,
      teamId: p.teamId,
      teamName: p.teamName,
      teamLogo: teamsMap[p.teamId]?.logo,
      side: "home",
      rating: weightedRating,
      min: p.matches * 90,
      goals: p.goals,
      assists: p.assists,
      saves: p.saves,
      tackles: p.tackles,
      shots: p.shots,
      xg: +p.xg.toFixed(2),
      cleanSheet: p.cleanSheets,
      yc: 0,
      rc: 0,
      highlight: `${p.matches} \u043C\u0430\u0442\u0447\u0435\u0439, ${p.goals ? p.goals + " \u0433. " : ""}${p.assists ? p.assists + " \u043F\u0430\u0441. " : ""}${p.cleanSheets ? p.cleanSheets + " \u0441\u0443\u0445\u0438\u0445" : ""}`.trim() || "\u0421\u0442\u0430\u0431\u0438\u043B\u044C\u043D\u0430\u044F \u0438\u0433\u0440\u0430"
    };
  }).sort((a, b) => b.rating - a.rating);
  if (allRatings.length < 11) return null;
  const gks = allRatings.filter((p) => p.pos === "\u0412\u0420");
  const defs = allRatings.filter((p) => p.pos === "\u0417\u0410\u0429");
  const mids = allRatings.filter((p) => p.pos === "\u041F\u0417");
  const fwds = allRatings.filter((p) => p.pos === "\u041D\u0410\u041F");
  const pickedGk = gks[0] || allRatings[0];
  const pickedDefs = defs.slice(0, 4);
  const pickedMids = mids.slice(0, 3);
  const pickedFwds = fwds.slice(0, 3);
  const starting11 = [pickedGk, ...pickedDefs, ...pickedMids, ...pickedFwds];
  const bestOfAll = [...starting11].sort((a, b) => b.rating - a.rating)[0];
  const topTeam = teamsMap[bestOfAll.teamId];
  return {
    title: `\u0421\u0431\u043E\u0440\u043D\u0430\u044F \u043C\u0435\u0441\u044F\u0446\u0430 \xB7 ${label}`,
    periodLabel: label,
    comp,
    formation: "4-3-3",
    playerOfThePeriod: bestOfAll,
    coachOfThePeriod: {
      name: topTeam?.coach?.name || "\u0413\u043B\u0430\u0432\u043D\u044B\u0439 \u0442\u0440\u0435\u043D\u0435\u0440 \u043C\u0435\u0441\u044F\u0446\u0430",
      teamName: topTeam?.name || bestOfAll.teamName,
      teamLogo: topTeam?.logo,
      reason: `\u0421\u0435\u0440\u0438\u044F \u043F\u043E\u0431\u0435\u0434 \u0438 \u0431\u0435\u0437\u0443\u043F\u0440\u0435\u0447\u043D\u0430\u044F \u0442\u0430\u043A\u0442\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u0444\u043E\u0440\u043C\u0430 \u043F\u043E\u0434\u043E\u043F\u0435\u0447\u043D\u044B\u0445 \u0432 \u0442\u0435\u0447\u0435\u043D\u0438\u0435 \u043C\u0435\u0441\u044F\u0446\u0430`
    },
    lineup: {
      gk: pickedGk,
      def: pickedDefs,
      mid: pickedMids,
      fwd: pickedFwds
    },
    bench: allRatings.slice(11, 16)
  };
}

export { computeMatchRatings, getMatchMotm, buildTeamOfRound, buildTeamOfMonth };
