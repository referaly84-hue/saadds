// @ts-nocheck
// src/cup2026.ts
var CUP_FINAL_VENUE = {
  stadium: "\u0411\u0421\u0410 \xAB\u041B\u0443\u0436\u043D\u0438\u043A\u0438\xBB (\u043D\u0435\u0439\u0442\u0440\u0430\u043B\u044C\u043D\u043E\u0435 \u043F\u043E\u043B\u0435, \u0433. \u041C\u043E\u0441\u043A\u0432\u0430)",
  city: "\u041C\u043E\u0441\u043A\u0432\u0430",
  neutralField: true
};
var DEFAULT_REG_WEEKS = [
  { tue: "2026-07-21", wed: "2026-07-22", thu: "2026-07-23" },
  // Раунд 1
  { tue: "2026-08-04", wed: "2026-08-05", thu: "2026-08-06" },
  // Раунд 2
  { tue: "2026-08-18", wed: "2026-08-19", thu: "2026-08-20" },
  // Раунд 3
  { tue: "2026-09-15", wed: "2026-09-16", thu: "2026-09-17" },
  // Раунд 4 (старт Первой лиги)
  { tue: "2026-09-29", wed: "2026-09-30", thu: "2026-10-01" },
  // Раунд 5
  { tue: "2026-10-27", wed: "2026-10-28", thu: "2026-10-29" }
  // Раунд 6
];
var DEFAULT_RPL_WEEKS = [
  { tue: "2026-07-28", wed: "2026-07-29", thu: "2026-07-30" },
  // Тур 1
  { tue: "2026-08-11", wed: "2026-08-12", thu: "2026-08-13" },
  // Тур 2
  { tue: "2026-08-25", wed: "2026-08-26", thu: "2026-08-27" },
  // Тур 3
  { tue: "2026-09-22", wed: "2026-09-23", thu: "2026-09-24" },
  // Тур 4
  { tue: "2026-10-20", wed: "2026-10-21", thu: "2026-10-22" },
  // Тур 5
  { tue: "2026-11-03", wed: "2026-11-04", thu: "2026-11-05" }
  // Тур 6
];
function addDaysStr(d, n) {
  const x = new Date(d + "T12:00:00Z");
  x.setUTCDate(x.getUTCDate() + n);
  return x.toISOString().slice(0, 10);
}
// Если для раунда нет даты — берём следующую неделю после последней известной (а не жёсткие даты 2026 года)
function weekOrNext(list, idx, fallbackList) {
  if (list && list[idx]) return list[idx];
  if (list && list.length) {
    const last = list[list.length - 1];
    const k = idx - (list.length - 1);
    return { tue: addDaysStr(last.tue, 14 * k), wed: addDaysStr(last.wed, 14 * k), thu: addDaysStr(last.thu, 14 * k) };
  }
  return fallbackList[idx];
}
function scheduleMidweekFixtures(pairs, weekDates, season, roundNum, roundTitle, uidFn) {
  const fixtures = [];
  const n = pairs.length;
  pairs.forEach(([homeTeam, awayTeam], idx) => {
    let date = weekDates.wed;
    let time = "17:30";
    if (n === 8) {
      if (idx < 2) {
        date = weekDates.tue;
        time = idx === 0 ? "16:00" : "18:30";
      } else if (idx < 6) {
        date = weekDates.wed;
        time = ["14:00", "16:30", "18:30", "20:00"][idx - 2];
      } else {
        date = weekDates.thu;
        time = idx === 6 ? "16:00" : "18:30";
      }
    } else if (n >= 14 && n <= 18) {
      if (idx < 4) {
        date = weekDates.tue;
        time = ["15:00", "17:00", "19:00", "20:45"][idx % 4];
      } else if (idx < 12) {
        date = weekDates.wed;
        time = ["14:00", "15:00", "16:30", "17:30", "18:30", "19:30", "20:00", "20:45"][(idx - 4) % 8];
      } else {
        date = weekDates.thu;
        time = ["15:00", "17:00", "19:00", "20:45"][(idx - 12) % 4];
      }
    } else if (n === 4) {
      if (idx === 0) {
        date = weekDates.tue;
        time = "18:00";
      } else if (idx === 1 || idx === 2) {
        date = weekDates.wed;
        time = idx === 1 ? "17:30" : "20:00";
      } else {
        date = weekDates.thu;
        time = "18:00";
      }
    } else {
      const slot = idx % 3;
      date = slot === 0 ? weekDates.tue : slot === 1 ? weekDates.wed : weekDates.thu;
      time = ["15:00", "17:30", "19:30", "20:30"][Math.floor(idx / 3) % 4];
    }
    fixtures.push({
      id: uidFn(),
      season,
      comp: "cup",
      cupPath: "regions_qual",
      qualRound: roundNum,
      round: 100 + roundNum,
      label: roundTitle,
      date,
      time,
      home: typeof homeTeam === "string" ? homeTeam : homeTeam.id,
      away: typeof awayTeam === "string" ? awayTeam : awayTeam.id,
      status: "scheduled",
      hg: null,
      ag: null,
      pos: 0
    });
  });
  return fixtures;
}
function drawNextRegionsRound(cupState, completedRoundNum, completedRoundFixtures, uidFn) {
  const nextRound = completedRoundNum + 1;
  if (nextRound > 6) return [];
  const winners = completedRoundFixtures.map((f) => {
    if (f.hg > f.ag) return f.home;
    if (f.ag > f.hg) return f.away;
    if (f.pen) return f.pen.winner === "home" ? f.home : f.away;
    return f.home;
  });
  const weekDates = weekOrNext(cupState.regWeeks, nextRound - 1, DEFAULT_REG_WEEKS);
  const pairs = [];
  let roundTitle = `\u041F\u0443\u0442\u044C \u0440\u0435\u0433\u0438\u043E\u043D\u043E\u0432 \xB7 ${nextRound}-\u0439 \u043E\u0442\u0431\u043E\u0440\u043E\u0447\u043D\u044B\u0439 \u0440\u0430\u0443\u043D\u0434`;
  if (nextRound === 2) {
    const incoming = cupState.regionsPools.round2Incoming || [];
    roundTitle = "\u041F\u0443\u0442\u044C \u0440\u0435\u0433\u0438\u043E\u043D\u043E\u0432 \xB7 2-\u0439 \u043E\u0442\u0431\u043E\u0440\u043E\u0447\u043D\u044B\u0439 \u0440\u0430\u0443\u043D\u0434";
    for (let i = 0; i < winners.length; i++) {
      const opp = incoming[i] || winners[(i + 1) % winners.length];
      pairs.push([winners[i], opp]);
    }
  } else if (nextRound === 3) {
    const incoming = cupState.regionsPools.round3Incoming || [];
    roundTitle = "\u041F\u0443\u0442\u044C \u0440\u0435\u0433\u0438\u043E\u043D\u043E\u0432 \xB7 3-\u0439 \u043E\u0442\u0431\u043E\u0440\u043E\u0447\u043D\u044B\u0439 \u0440\u0430\u0443\u043D\u0434";
    for (let i = 0; i < winners.length; i++) {
      const opp = incoming[i] || winners[(i + 1) % winners.length];
      pairs.push([winners[i], opp]);
    }
  } else if (nextRound === 4) {
    roundTitle = "\u041F\u0443\u0442\u044C \u0440\u0435\u0433\u0438\u043E\u043D\u043E\u0432 \xB7 4-\u0439 \u0440\u0430\u0443\u043D\u0434 (\u0441\u0442\u0430\u0440\u0442 \u041F\u0435\u0440\u0432\u043E\u0439 \u043B\u0438\u0433\u0438)";
    const fnl = [...cupState.regionsPools.fnlIncoming || []].sort(() => Math.random() - 0.5);
    const numQualMatches = Math.min(winners.length, fnl.length);
    for (let i = 0; i < numQualMatches; i++) {
      pairs.push([winners[i], fnl[i]]);
    }
    for (let j = numQualMatches; j < fnl.length - 1; j += 2) {
      pairs.push([fnl[j], fnl[j + 1]]);
    }
  } else if (nextRound === 5) {
    roundTitle = "\u041F\u0443\u0442\u044C \u0440\u0435\u0433\u0438\u043E\u043D\u043E\u0432 \xB7 5-\u0439 \u043E\u0442\u0431\u043E\u0440\u043E\u0447\u043D\u044B\u0439 \u0440\u0430\u0443\u043D\u0434";
    const shuffledWinners = [...winners].sort(() => Math.random() - 0.5);
    for (let i = 0; i < shuffledWinners.length - 1; i += 2) {
      pairs.push([shuffledWinners[i], shuffledWinners[i + 1]]);
    }
  } else if (nextRound === 6) {
    roundTitle = "\u041F\u0443\u0442\u044C \u0440\u0435\u0433\u0438\u043E\u043D\u043E\u0432 \xB7 6-\u0439 \u043E\u0442\u0431\u043E\u0440\u043E\u0447\u043D\u044B\u0439 \u0440\u0430\u0443\u043D\u0434";
    const shuffledWinners = [...winners].sort(() => Math.random() - 0.5);
    for (let i = 0; i < shuffledWinners.length - 1; i += 2) {
      pairs.push([shuffledWinners[i], shuffledWinners[i + 1]]);
    }
  }
  const prevRoundInfo = cupState.regionsQualRounds.find((r) => r.round === completedRoundNum);
  if (prevRoundInfo) prevRoundInfo.completed = true;
  const nextRoundInfo = cupState.regionsQualRounds.find((r) => r.round === nextRound);
  if (nextRoundInfo) nextRoundInfo.drawn = true;
  return scheduleMidweekFixtures(pairs, weekDates, cupState.season, nextRound, roundTitle, uidFn);
}
function initCup2026(season: any, rplTeams: any, fnlTeams: any, secondLeagueTeams: any, mediaTeams: any, uidFn: any, calendarDates: any = undefined) {
  const fixtures = [];
  const rplDates = calendarDates?.rplWeeks || DEFAULT_RPL_WEEKS;
  const regDates = calendarDates?.regWeeks || DEFAULT_REG_WEEKS;
  const shuffledRpl = [...rplTeams].sort(() => Math.random() - 0.5);
  const groupIds = ["A", "B", "C", "D"];
  const rplGroups = {};
  const groupRoundPairs = {};
  groupIds.forEach((gid, gi) => {
    const gTeams = shuffledRpl.slice(gi * 4, (gi + 1) * 4).map((t) => t.id);
    rplGroups[gid] = {
      id: gid,
      name: `\u0413\u0440\u0443\u043F\u043F\u0430 ${gid}`,
      teams: gTeams,
      table: gTeams.map((tid, idx) => {
        const teamObj = rplTeams.find((t) => t.id === tid);
        return {
          id: tid,
          name: teamObj?.name || tid,
          pos: idx + 1,
          p: 0,
          w: 0,
          d: 0,
          l: 0,
          gf: 0,
          ga: 0,
          gd: 0,
          pts: 0,
          zone: idx < 2 ? "top" : idx === 2 ? "playoff" : "bad",
          zoneLabel: idx < 2 ? "1/8 \u041F\u0443\u0442\u0438 \u0420\u041F\u041B" : idx === 2 ? "\u0412 \u041F\u0443\u0442\u044C \u0440\u0435\u0433\u0438\u043E\u043D\u043E\u0432" : "\u0412\u044B\u043B\u0435\u0442 \u0438\u0437 \u0442\u0443\u0440\u043D\u0438\u0440\u0430"
        };
      })
    };
    groupRoundPairs[gid] = [
      [[0, 1], [2, 3]],
      // 1 тур
      [[0, 2], [3, 1]],
      // 2 тур
      [[3, 0], [1, 2]],
      // 3 тур
      [[1, 0], [3, 2]],
      // 4 тур
      [[2, 0], [1, 3]],
      // 5 тур
      [[0, 3], [2, 1]]
      // 6 тур
    ];
  });
  for (let roundIdx = 0; roundIdx < 6; roundIdx++) {
    const dates = weekOrNext(rplDates, roundIdx, DEFAULT_RPL_WEEKS);
    const roundMatches = [];
    for (const gid of groupIds) {
      const pairs = groupRoundPairs[gid][roundIdx];
      const gTeams = rplGroups[gid].teams;
      for (const [hIdx, aIdx] of pairs) {
        roundMatches.push({ home: gTeams[hIdx], away: gTeams[aIdx], gid });
      }
    }
    const shuffledRoundMatches = [...roundMatches].sort(() => Math.random() - 0.5);
    const slotSchedule = [
      { date: dates.tue, time: "17:30" },
      { date: dates.tue, time: "20:00" },
      { date: dates.wed, time: "15:00" },
      { date: dates.wed, time: "17:30" },
      { date: dates.wed, time: "19:30" },
      { date: dates.wed, time: "20:45" },
      { date: dates.thu, time: "17:30" },
      { date: dates.thu, time: "20:00" }
    ];
    shuffledRoundMatches.forEach((m, slotIdx) => {
      const schedule = slotSchedule[slotIdx] || { date: dates.wed, time: "18:00" };
      fixtures.push({
        id: uidFn(),
        season,
        comp: "cup",
        cupPath: "rpl_group",
        groupId: m.gid,
        round: roundIdx + 1,
        label: `\u041F\u0443\u0442\u044C \u0420\u041F\u041B \xB7 ${roundIdx + 1}-\u0439 \u0442\u0443\u0440`,
        date: schedule.date,
        time: schedule.time,
        home: m.home,
        away: m.away,
        status: "scheduled",
        hg: null,
        ag: null,
        pos: 0
      });
    });
  }
  const earlyTeams = [...mediaTeams, ...secondLeagueTeams].sort(() => Math.random() - 0.5);
  const r1Count = earlyTeams.length >= 32 ? 32 : Math.floor(earlyTeams.length / 2) * 2;
  const r1Teams = earlyTeams.slice(0, r1Count);
  const r2Incoming = earlyTeams.slice(r1Count, r1Count + 16).map((t) => typeof t === "string" ? t : t.id);
  const r3Incoming = earlyTeams.slice(r1Count + 16, r1Count + 32).map((t) => typeof t === "string" ? t : t.id);
  const fnlIncoming = [...fnlTeams].map((t) => typeof t === "string" ? t : t.id);
  const r1Pairs = [];
  for (let i = 0; i < r1Teams.length - 1; i += 2) {
    r1Pairs.push([r1Teams[i], r1Teams[i + 1]]);
  }
  const r1Fixtures = scheduleMidweekFixtures(
    r1Pairs,
    regDates[0],
    season,
    1,
    "\u041F\u0443\u0442\u044C \u0440\u0435\u0433\u0438\u043E\u043D\u043E\u0432 \xB7 1-\u0439 \u043E\u0442\u0431\u043E\u0440\u043E\u0447\u043D\u044B\u0439 \u0440\u0430\u0443\u043D\u0434",
    uidFn
  );
  fixtures.push(...r1Fixtures);
  const cupState = {
    season,
    stage: "groups_and_qual",
    calBase: calendarDates?.calBase || "2026-07-18",
    finalDate: addDaysStr(calendarDates?.calBase || "2026-07-18", 323),
    finalVenue: CUP_FINAL_VENUE,
    rplGroups,
    rplWeeks: rplDates,
    regWeeks: regDates,
    regionsQualRounds: [
      { round: 1, title: "1-\u0439 \u0440\u0430\u0443\u043D\u0434 (\u041C\u0435\u0434\u0438\u0430\u043B\u0438\u0433\u0430 \u0438 2-\u044F \u043B\u0438\u0433\u0430)", completed: false, drawn: true },
      { round: 2, title: "2-\u0439 \u0440\u0430\u0443\u043D\u0434 (\u041E\u0442\u0431\u043E\u0440 2-\u0439 \u043B\u0438\u0433\u0438)", completed: false, drawn: false },
      { round: 3, title: "3-\u0439 \u0440\u0430\u0443\u043D\u0434 (\u0412\u044B\u0445\u043E\u0434 \u043D\u0430 \u041F\u0435\u0440\u0432\u0443\u044E \u043B\u0438\u0433\u0443)", completed: false, drawn: false },
      { round: 4, title: "4-\u0439 \u0440\u0430\u0443\u043D\u0434 (\u0412\u0441\u0442\u0443\u043F\u0430\u044E\u0442 18 \u043A\u043B\u0443\u0431\u043E\u0432 \u041F\u0435\u0440\u0432\u043E\u0439 \u043B\u0438\u0433\u0438)", completed: false, drawn: false },
      { round: 5, title: "5-\u0439 \u0440\u0430\u0443\u043D\u0434 \u041F\u0443\u0442\u0438 \u0440\u0435\u0433\u0438\u043E\u043D\u043E\u0432", completed: false, drawn: false },
      { round: 6, title: "6-\u0439 \u0440\u0430\u0443\u043D\u0434 \u041F\u0443\u0442\u0438 \u0440\u0435\u0433\u0438\u043E\u043D\u043E\u0432 (\u0412\u044B\u0445\u043E\u0434 \u0432 \u0432\u0435\u0441\u0435\u043D\u043D\u0438\u0439 \u043F\u043B\u0435\u0439-\u043E\u0444\u0444)", completed: false, drawn: false }
    ],
    regionsPools: {
      round2Incoming: r2Incoming,
      round3Incoming: r3Incoming,
      fnlIncoming
    },
    playoff: {
      rplBracket: { r16: [], qf: [], sf: [] },
      regionsBracket: { r16: [], qf: [], sf: [], final: [] },
      superFinal: null
    }
  };
  return { cupState, fixtures };
}
function recalculateCupGroups(cupState, fixtures) {
  if (!cupState || !cupState.rplGroups) return;
  const cupFx = fixtures.filter((f) => f.comp === "cup" && f.cupPath === "rpl_group" && f.status === "done");
  for (const gid of ["A", "B", "C", "D"]) {
    const grp = cupState.rplGroups[gid];
    if (!grp) continue;
    const stats = {};
    for (const tid of grp.teams) {
      stats[tid] = { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
    }
    const gMatches = cupFx.filter((f) => f.groupId === gid);
    for (const f of gMatches) {
      const h = stats[f.home], a = stats[f.away];
      if (!h || !a) continue;
      h.p += 1;
      a.p += 1;
      h.gf += f.hg;
      h.ga += f.ag;
      a.gf += f.ag;
      a.ga += f.hg;
      h.gd = h.gf - h.ga;
      a.gd = a.gf - a.ga;
      if (f.hg > f.ag) {
        h.w += 1;
        h.pts += 3;
        a.l += 1;
      } else if (f.ag > f.hg) {
        a.w += 1;
        a.pts += 3;
        h.l += 1;
      } else {
        h.d += 1;
        a.d += 1;
        if (f.pen) {
          if (f.pen.winner === "home" || f.pen.hg > f.pen.ag) {
            h.pts += 2;
            a.pts += 1;
          } else {
            a.pts += 2;
            h.pts += 1;
          }
        } else {
          h.pts += 1;
          a.pts += 1;
        }
      }
    }
    const sorted = grp.teams.map((tid) => {
      const s = stats[tid] || { p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
      const teamRow = grp.table.find((r) => r.id === tid);
      return {
        id: tid,
        name: teamRow?.name || tid,
        pos: 1,
        ...s,
        zone: "top",
        zoneLabel: ""
      };
    }).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
    sorted.forEach((r, idx) => {
      r.pos = idx + 1;
      if (idx < 2) {
        r.zone = "top";
        r.zoneLabel = "1/8 \u041F\u0443\u0442\u0438 \u0420\u041F\u041B";
      } else if (idx === 2) {
        r.zone = "playoff";
        r.zoneLabel = "\u0412 \u041F\u0443\u0442\u044C \u0440\u0435\u0433\u0438\u043E\u043D\u043E\u0432";
      } else {
        r.zone = "bad";
        r.zoneLabel = "\u0412\u044B\u043B\u0435\u0442";
      }
    });
    grp.table = sorted;
  }
}

export function getCupFinalVenue(): string { return CUP_FINAL_VENUE || "Лужники (Москва)"; }
export { initCup2026, recalculateCupGroups, drawNextRegionsRound, CUP_FINAL_VENUE };
