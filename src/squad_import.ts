/* ───────── Импорт составов из текстового файла ─────────
   Формат файла (как в «Пример.txt» / «Динамо-2_Москва.txt»):

     Шинник Ярославль:
     66, Никита Янович, Вратарь, 23 (28 марта 2003 г.), Россия
     ...
     Тренерский штаб:
     Главный тренер — Денис Бояринцев, 48, Россия

   Медиа-лиги: «Имя Фамилия (ник) — Позиция».
   Номер может быть «—» или «-» (не известен). Заголовок клуба можно писать без двоеточия.            */

export type ParsedPlayer = { num: number | null; name: string; nick: string; pos: string; rawPos: string; born: string; age: number | null; nations: string[]; line: number };
export type ParsedStaff = { rawRole: string; role: string | null; name: string; age: number | null; nationality: string; line: number };
export type ParsedClub = { name: string; players: ParsedPlayer[]; staff: ParsedStaff[]; line: number };
export type ParseResult = { clubs: ParsedClub[]; warnings: string[] };

export const normName = (s: any) => String(s || '').toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]+/g, ' ').trim();

/* ── позиции ── */
const POS_MAP: Record<string, string> = {
  'вратарь': 'ВР',
  'центр защитник': 'ЦЗ', 'центральный защитник': 'ЦЗ', 'защитник': 'ЦЗ',
  'левый защитник': 'ЛЗ', 'правый защитник': 'ПЗ',
  'опорный полузащитник': 'ОП',
  'центр полузащитник': 'ЦП', 'центральный полузащитник': 'ЦП', 'полузащитник': 'ЦП',
  'атак полузащитник': 'АП', 'атакующий полузащитник': 'АП', 'оттянутый нап': 'АП', 'оттянутый нападающий': 'АП',
  'левый полузащитник': 'ЛВ', 'правый полузащитник': 'ПВ',
  'левый вингер': 'ЛВ', 'правый вингер': 'ПВ',
  'центральный нап': 'ЦФ', 'центральный нападающий': 'ЦФ', 'нападающий': 'ЦФ',
};
export const mapPos = (raw: string): string | null => POS_MAP[normName(raw)] || null;

/* ── должности штаба → роли приложения (прочие в приложении не поддерживаются) ── */
export function mapStaffRole(raw: string): string | null {
  const r = normName(raw);
  if (r.startsWith('главный тренер') || r.startsWith('и о главного тренера')) return 'head';
  if (r.startsWith('ассистент тренера')) return 'assistant';
  if (r.startsWith('тренер вратарей')) return 'gk';
  if (r.startsWith('тренер по физподготовке') || r.startsWith('фитнес тренер')) return 'fitness';
  if (r.startsWith('тренер нападающих')) return 'attack';
  if (r.startsWith('клубный доктор') || r.startsWith('глава медицинской службы') || r === 'врач' || r.startsWith('главный врач')) return 'doctor';
  return null;
}

/* ── даты ── */
const MONTHS: [string, number][] = [['янв', 1], ['фев', 2], ['мар', 3], ['апр', 4], ['мая', 5], ['май', 5], ['июн', 6], ['июл', 7], ['авг', 8], ['сен', 9], ['окт', 10], ['ноя', 11], ['дек', 12]];
export function parseDate(s: string): string {
  const m = normName(s).match(/^(\d{1,2}) ([а-я]+) (\d{4})/);
  if (!m) return '';
  const mon = MONTHS.find(([p]) => m[2].startsWith(p));
  if (!mon) return '';
  return `${m[3]}-${String(mon[1]).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}

const splitNations = (s: string) => s.split(/[,/]/).map(x => x.trim()).filter(Boolean);

const PLAYER_RE = /^(\d{1,3}|[-—–])\s*,\s*([^,]+?)\s*,\s*([^,]+?)\s*,\s*(\d{1,2})\s*\(([^)]*)\)\s*,\s*(.+)$/;
const MEDIA_RE = /^(.+?)\s+—\s+(Вратарь|Защитник|Полузащитник|Нападающий)\s*$/i;
const STAFF_RE = /^([^,—]+?)\s+—\s+([^,]+?)\s*,\s*(\d{1,2})\s*,\s*(.+)$/;

export function parseSquads(text: string): ParseResult {
  const lines = String(text || '').replace(/\r/g, '').split('\n');
  const warnings: string[] = [];
  const clubs: ParsedClub[] = [];
  let cur: ParsedClub | null = null;

  const kind = (l: string): 'player' | 'media' | 'staff' | 'staffhead' | 'other' => {
    const t = l.trim();
    if (!t) return 'other';
    if (/^тренерский штаб\s*:?$/i.test(t)) return 'staffhead';
    if (PLAYER_RE.test(t)) return 'player';
    if (MEDIA_RE.test(t)) return 'media';
    if (STAFF_RE.test(t)) return 'staff';
    return 'other';
  };
  const nextNonEmpty = (i: number) => { for (let j = i + 1; j < lines.length; j++) if (lines[j].trim()) return j; return -1; };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const t = raw.trim();
    if (!t) continue;
    const k = kind(t);
    if (k === 'staffhead') continue; // дальше строки штаба распознаются сами
    if (k === 'other') {
      // заголовок клуба: строка (с двоеточием или без), после которой идёт строка игрока/штаба
      const name = t.replace(/\s*:\s*$/, '').trim();
      const j = nextNonEmpty(i);
      const nk = j >= 0 ? kind(lines[j]) : 'other';
      if (name && !name.includes(',') && name.length <= 60 && (nk === 'player' || nk === 'media')) {
        cur = { name, players: [], staff: [], line: i + 1 };
        clubs.push(cur);
      }
      continue;
    }
    if (!cur) { warnings.push(`Строка ${i + 1} до первого клуба пропущена: «${t.slice(0, 60)}»`); continue; }
    if (k === 'player') {
      const m = t.match(PLAYER_RE)!;
      const nm = m[2].trim();
      const pos = mapPos(m[3]);
      if (!pos) warnings.push(`Строка ${i + 1}: неизвестная позиция «${m[3]}» (${nm}) — поставлен ЦП`);
      cur.players.push({
        num: /^\d+$/.test(m[1]) ? +m[1] : null, name: nm, nick: '', pos: pos || 'ЦП', rawPos: m[3].trim(),
        born: parseDate(m[5]), age: +m[4], nations: splitNations(m[6]), line: i + 1,
      });
    } else if (k === 'media') {
      const m = t.match(MEDIA_RE)!;
      const nm = m[1].match(/^(.*?)\s*\(([^)]*)\)\s*$/);
      const pos = mapPos(m[2])!;
      cur.players.push({ num: null, name: (nm ? nm[1] : m[1]).trim(), nick: nm ? nm[2].trim() : '', pos, rawPos: m[2], born: '', age: null, nations: ['Россия'], line: i + 1 });
    } else if (k === 'staff') {
      const m = t.match(STAFF_RE)!;
      cur.staff.push({ rawRole: m[1].trim(), role: mapStaffRole(m[1]), name: m[2].trim(), age: +m[3], nationality: splitNations(m[4]).join(' / '), line: i + 1 });
    }
  }
  return { clubs, warnings };
}

/* ───────── сопоставление клубов файла с командами базы ───────── */
const ALIASES: Record<string, string> = {
  // название в файле → название в базе
  'ска хабаровск': 'СКА-Хабаровск', 'ска хабаровск 2': 'СКА-Хабаровск-2',
  'победа нижний новгород': 'Победа НН', 'фк нижний новгород': 'Пари НН',
  'заря': 'Заря Луганск', 'фк заря': 'Заря Луганск', 'фк шахтер': 'Шахтер Донецк', 'фк шахтёр': 'Шахтер Донецк',
  'динамо владивосток': 'Динамо Владивосток', 'динамо санкт петербург': 'Динамо СПб', 'динамо вологда': 'Динамо Вологда',
  'динамо москва': 'Динамо Москва', 'динамо 2 москва': 'Динамо-2 Москва', 'динамо 2 махачкала': 'Динамо-2 Махачкала',
  'космос химки': 'Космос Долгопрудный', 'нефтяник избербаш': 'Нефтяник Ахтырский',
  'зенит 2 санкт петербург': 'Зенит-2', 'родина 3 москва': 'Родина-М',
  'волгарь астрахань': 'Волгарь', 'сибирь новосибирск': 'Сибирь', 'енисей 2 красноярск': 'Енисей-2', 'енисей красноярск': 'Енисей',
  'броуки': 'Броуки (Brokeboys)', 'broke boys': 'Броуки (Brokeboys)', '2drots': '2Drots', 'матч': 'Матч ТВ', 'фк матч': 'Матч ТВ',
  'синдекат': 'СиндЕкат', 'амкал': 'Амкал', 'фк апсны': 'Апсны', 'ска ростов': 'СКА Ростов', 'ска ростов на дону': 'СКА Ростов',
  'балтика 2 калининград': 'Балтика-БФУ', 'ростов 2': 'Ростов-2', 'фк ростов 2': 'Ростов-2', 'торпедо москва': 'Торпедо Москва',
};
const GENERIC = new Set(['фк', 'fc']);
const toks = (s: string) => normName(s).split(' ').filter(t => t && !GENERIC.has(t));

export type TeamLite = { id: string; name: string; comp?: string };
export type ClubMatch = { club: string; teamId: string | null; teamName: string | null; how: 'manual' | 'alias' | 'exact' | 'fuzzy' | 'none' | 'ambiguous'; candidates?: { id: string; name: string }[] };

export function matchClub(clubName: string, teams: TeamLite[], overrides: Record<string, string> = {}): ClubMatch {
  const byId = new Map(teams.map(t => [t.id, t]));
  if (Object.prototype.hasOwnProperty.call(overrides, clubName)) {
    const t = byId.get(overrides[clubName]);
    return t ? { club: clubName, teamId: t.id, teamName: t.name, how: 'manual' } : { club: clubName, teamId: null, teamName: null, how: 'none' };
  }
  const key = normName(clubName);
  const byName = (n: string) => teams.find(t => normName(t.name) === normName(n));
  const al = ALIASES[key];
  if (al) { const t = byName(al); if (t) return { club: clubName, teamId: t.id, teamName: t.name, how: 'alias' }; }
  const ex = teams.filter(t => normName(t.name) === key);
  if (ex.length === 1) return { club: clubName, teamId: ex[0].id, teamName: ex[0].name, how: 'exact' };
  // нечёткое: все слова названия из базы входят в название из файла, цифры совпадают точно
  const ft = toks(clubName), fset = new Set(ft);
  const fDigits = ft.filter(x => /^\d+$/.test(x)).sort().join(',');
  let best: TeamLite[] = [], bestN = 0;
  for (const t of teams) {
    const tt = toks(t.name);
    if (!tt.length) continue;
    if (tt.filter(x => /^\d+$/.test(x)).sort().join(',') !== fDigits) continue;
    if (!tt.every(x => fset.has(x))) continue;
    if (tt.length > bestN) { best = [t]; bestN = tt.length; } else if (tt.length === bestN) best.push(t);
  }
  if (best.length === 1) return { club: clubName, teamId: best[0].id, teamName: best[0].name, how: 'fuzzy' };
  if (best.length > 1) return { club: clubName, teamId: null, teamName: null, how: 'ambiguous', candidates: best.map(t => ({ id: t.id, name: t.name })) };
  return { club: clubName, teamId: null, teamName: null, how: 'none' };
}

/* ───────── применение ───────── */
const BASE_RATING = (comp = ''): number => comp === 'rpl' ? 76 : comp === 'fnl' ? 71 : comp.startsWith('2la') ? 66 : comp.startsWith('2lb') ? 60 : comp.startsWith('media') ? 67 : 63;
const hash = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
/** Стартовая оценка по уровню лиги (как у сгенерированных составов), ±4 от имени игрока. */
export const ratingFor = (comp: string | undefined, name: string) => BASE_RATING(comp) + (hash(normName(name)) % 9) - 4;

export type ImportOptions = {
  dry?: boolean;
  /** убрать из состава клуба игроков, которых нет в файле (они остаются в базе «без клуба») */
  replace?: boolean;
  /** импортировать тренерский штаб */
  staff?: boolean;
  overrides?: Record<string, string>;
  uid: () => string;
  roleTitle: (role: string) => string;
  defaultFormation?: string;
};
export type ClubReport = {
  club: string; teamId: string | null; team: string | null; how: ClubMatch['how'];
  candidates?: { id: string; name: string }[];
  players: number; added: number; updated: number; moved: number; unchanged: number; removed: number;
  staffSet: number; staffSkipped: string[]; skipped?: string;
};
export type ImportReport = {
  ok: true; dry: boolean; clubs: ClubReport[]; warnings: string[];
  totals: { clubs: number; matched: number; unmatched: number; players: number; added: number; updated: number; moved: number; removed: number; staffSet: number };
};

export function runImport(db: any, parsed: ParseResult, opt: ImportOptions): ImportReport {
  // при пробном запуске работаем на копиях, база не меняется
  const W = opt.dry
    ? { players: structuredClone(db.players || []), squads: structuredClone(db.squads || {}), staff: structuredClone(db.staff || []) }
    : db;
  if (!Array.isArray(W.players)) W.players = [];
  if (!W.squads || typeof W.squads !== 'object') W.squads = {};
  if (!Array.isArray(W.staff)) W.staff = [];
  const teams: TeamLite[] = db.teams || [];
  const teamById = new Map(teams.map(t => [t.id, t]));
  const warnings = [...parsed.warnings];
  const reports: ClubReport[] = [];

  // клубы, встретившиеся в файле дважды (или попавшие в одну команду), объединяем
  const merged = new Map<string, { names: string[]; players: ParsedPlayer[]; staff: ParsedStaff[] }>();
  const unmatched: ClubReport[] = [];
  for (const c of parsed.clubs) {
    const m = matchClub(c.name, teams, opt.overrides);
    const blank = (extra: Partial<ClubReport> = {}): ClubReport => ({ club: c.name, teamId: m.teamId, team: m.teamName, how: m.how, candidates: m.candidates, players: c.players.length, added: 0, updated: 0, moved: 0, unchanged: 0, removed: 0, staffSet: 0, staffSkipped: [], ...extra });
    if (!m.teamId) { unmatched.push(blank({ skipped: 'Команда не найдена в базе' })); continue; }
    const g = merged.get(m.teamId) || { names: [], players: [], staff: [] };
    if (g.names.length) warnings.push(`«${c.name}» и «${g.names[0]}» — одна команда «${m.teamName}»: данные объединены (при совпадении побеждает последняя запись)`);
    g.names.push(c.name);
    g.players.push(...c.players);
    g.staff.push(...c.staff);
    merged.set(m.teamId, g);
  }

  // игрок, указанный в файле у нескольких клубов (ФИО + дата рождения): остаётся там, где лига выше, при равенстве — у последнего
  const tier = (tid: string) => { const c = teamById.get(tid)?.comp || ''; return c === 'rpl' ? 0 : c === 'fnl' ? 1 : c.startsWith('2la') ? 2 : c.startsWith('2lb') ? 3 : c.startsWith('media') ? 4 : 5; };
  const owner = new Map<string, string>();
  for (const [tid, g] of merged) {
    for (const p of g.players) {
      if (!p.born) continue;
      const k = normName(p.name) + '|' + p.born;
      const cur = owner.get(k);
      if (!cur || tier(tid) <= tier(cur)) owner.set(k, tid);
    }
  }
  for (const [tid, g] of merged) {
    const keep: ParsedPlayer[] = [];
    for (const p of g.players) {
      const k = normName(p.name) + '|' + p.born;
      if (p.born && owner.get(k) !== tid) {
        warnings.push(`Игрок «${p.name}» (${p.born}) указан сразу в «${teamById.get(tid)?.name}» и «${teamById.get(owner.get(k)!)?.name}» — оставлен в «${teamById.get(owner.get(k)!)?.name}»`);
      } else keep.push(p);
    }
    g.players = keep;
  }

  const playerIndex = (): Map<string, any[]> => {
    const ix = new Map<string, any[]>();
    for (const p of W.players) { const k = normName(p.name); (ix.get(k) || ix.set(k, []).get(k)!).push(p); }
    return ix;
  };
  const ix = playerIndex();

  for (const [tid, g] of merged) {
    const t = teamById.get(tid)!;
    const rep: ClubReport = { club: g.names.join(' + '), teamId: tid, team: t.name, how: matchClub(g.names[0], teams, opt.overrides).how, players: 0, added: 0, updated: 0, moved: 0, unchanged: 0, removed: 0, staffSet: 0, staffSkipped: [] };
    // дубликаты внутри клуба: последняя запись побеждает
    const uniq = new Map<string, ParsedPlayer>();
    for (const p of g.players) uniq.set(normName(p.name) + '|' + p.born, p);
    const list = [...uniq.values()];
    rep.players = list.length;
    const squadIds: string[] = [];

    for (const fp of list) {
      const cands = ix.get(normName(fp.name)) || [];
      // ищем: сначала в этой же команде, потом по ФИО+дате рождения в другой, но не по одному ФИО (тёзки)
      let ex = cands.find(p => p.teamId === tid && (!fp.born || !p.born || p.born === fp.born))
        || (fp.born ? cands.find(p => p.born === fp.born) : undefined);
      const nation = fp.nations[0] || 'Россия';
      if (ex) {
        let changed = false;
        const set = (k: string, v: any) => { if (v !== undefined && v !== null && v !== '' && ex[k] !== v) { ex[k] = v; changed = true; } };
        set('pos', fp.pos); set('born', fp.born); set('nation', nation); set('num', fp.num); set('nick', fp.nick);
        if (fp.nations.length > 1 && JSON.stringify(ex.nations) !== JSON.stringify(fp.nations)) { ex.nations = fp.nations; changed = true; }
        if (ex.teamId !== tid) {
          const old = ex.teamId;
          warnings.push(`Игрок «${ex.name}» (${ex.born || 'дата рождения не указана'}) ${old ? 'числился в «' + (teamById.get(old)?.name || old) + '»' : 'был без клуба'} — переведён в «${t.name}»`);
          if (old && W.squads[old]) W.squads[old] = W.squads[old].filter((id: string) => id !== ex.id);
          ex.teamId = tid; rep.moved++; changed = true;
        } else if (changed) rep.updated++; else rep.unchanged++;
        if (changed && !opt.dry) ex.updatedAt = new Date().toISOString();
        squadIds.push(ex.id);
      } else {
        const p: any = {
          id: 'pl_' + opt.uid(), teamId: tid, name: fp.name, pos: fp.pos, born: fp.born, nation,
          playedForOtherNationalTeam: false, otherNationalTeam: '', realClub: '',
          style: '', achievements: [], stats2y: '', form: '', character: '', news: '',
          rating: ratingFor(t.comp, fp.name), verified: false, updatedAt: new Date().toISOString(),
          out: null, banLeft: 0, seasonYC: 0,
        };
        if (fp.num != null) p.num = fp.num;
        if (fp.nick) p.nick = fp.nick;
        if (fp.nations.length > 1) p.nations = fp.nations;
        W.players.push(p);
        (ix.get(normName(p.name)) || ix.set(normName(p.name), []).get(normName(p.name))!).push(p);
        squadIds.push(p.id);
        rep.added++;
      }
    }

    // итоговый состав: по порядку файла; остальные — либо убираем, либо оставляем в конце
    const inFile = new Set(squadIds);
    const prevIds: string[] = W.squads[tid] ? W.squads[tid] : W.players.filter((p: any) => p.teamId === tid).map((p: any) => p.id);
    const rest = prevIds.filter(id => !inFile.has(id));
    if (opt.replace) {
      for (const id of rest) {
        const p = W.players.find((x: any) => x.id === id);
        if (p && p.teamId === tid) p.teamId = null;
      }
      rep.removed = rest.length;
      W.squads[tid] = squadIds;
    } else {
      W.squads[tid] = [...squadIds, ...rest];
    }

    // тренерский штаб
    if (opt.staff !== false && g.staff.length) {
      const supported = g.staff.filter(s => s.role);
      for (const s of g.staff) if (!s.role) rep.staffSkipped.push(`${s.rawRole}: ${s.name}`);
      const roles = new Set(supported.map(s => s.role!));
      const prev = W.staff.filter((m: any) => m.teamId === tid && roles.has(m.role));
      const used = new Set<any>();
      const next: any[] = [];
      supported.forEach((s, i) => {
        // тот же человек на той же должности — сохраняем запись (id, портрет ИИ), обновляем только возраст и гражданство
        const ex = prev.find((m: any) => !used.has(m) && m.role === s.role && normName(m.name) === normName(s.name));
        if (ex) {
          used.add(ex);
          if (s.age) ex.age = s.age;
          if (s.nationality) ex.nationality = s.nationality;
          next.push(ex);
        } else {
          next.push({
            id: `staff_${tid}_${s.role}_${i}_${opt.uid()}`, name: s.name, role: s.role, roleTitle: opt.roleTitle(s.role!),
            teamId: tid, teamName: t.name,
            age: s.age || undefined, nationality: s.nationality || '', specialty: '', bio: '', brief: '',
            pending: true, verified: false,
            favoriteFormation: s.role === 'head' ? (opt.defaultFormation || '4-3-3') : undefined,
            style: s.role === 'head' ? 'possession' : undefined,
            styleTitle: s.role === 'head' ? 'Сбалансированный стиль' : undefined,
            updatedAt: new Date().toISOString(),
          });
        }
        rep.staffSet++;
      });
      W.staff = W.staff.filter((m: any) => !(m.teamId === tid && roles.has(m.role))).concat(next);
    }
    reports.push(rep);
  }

  const all = [...reports, ...unmatched];
  const sum = (k: keyof ClubReport) => reports.reduce((a, r) => a + (r[k] as number), 0);
  return {
    ok: true, dry: !!opt.dry, clubs: all, warnings,
    totals: { clubs: parsed.clubs.length, matched: reports.length, unmatched: unmatched.length, players: sum('players'), added: sum('added'), updated: sum('updated'), moved: sum('moved'), removed: sum('removed'), staffSet: sum('staffSet') },
  };
}
