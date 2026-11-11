/**
 * Экспертно-судейская комиссия при Президенте РФС (ЭСК РФС)
 * Рассмотрение спорных судейских решений в РПЛ и Кубке России:
 * - Обращения клубов по пенальти, красным карточкам, VAR и отмененным голам;
 * - VAR Кинозал: симуляция стоп-кадров, офсайдных линий и радиопереговоров арбитров;
 * - Заседание комиссии с голосованием членов (Милорад Мажич, Равшан Ирматов, Николай Иванов, Сергей Зуев);
 * - Роль Администратора/Председателя ЭСК: вынесение решающего вердикта;
 * - Официальный протокол РФС с печатью и снятием дисквалификаций игроков при ошибке судьи;
 * - Автоматический слив вердикта в инсайдерскую Telegram-ленту!
 */

import { GoogleGenAI } from '@google/genai';
import { generatePostMatchInsider, TELEGRAM_CHANNELS, type InsiderPost } from './insider_feed.ts';

export interface EskCase {
  id: string;
  protocolNum: string;
  date: string;
  tour: string;
  comp: string;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  minute: string;
  episodeType: 'penalty' | 'red_card' | 'disallowed_goal' | 'handball' | 'offside' | 'foul_dogso';
  episodeTitle: string;
  applicantClub: string;
  applicantComplaint: string;
  refereeName: string;
  varRefereeName: string;
  status: 'pending' | 'decided';
  varSimulation: {
    cameraAngle: string;
    stopFrameTime: string;
    varLinesApplied: boolean;
    infringementArea: string;
    refereeMicTranscript: Array<{ speaker: string; text: string }>;
  };
  hearing: {
    chairman: string;
    votingBoard: Array<{
      name: string;
      role: string;
      vote?: 'correct' | 'incorrect' | 'disputable';
      comment?: string;
    }>;
    adminVote?: 'correct' | 'incorrect' | 'disputable';
    finalVerdict?: 'correct' | 'incorrect' | 'disputable';
    verdictSummary?: string;
    officialRuleCitation?: string;
    consequences?: string;
    decidedAt?: number;
    decidedBy?: string;
  };
}

export const ESK_EXPERTS = [
  { name: 'Милорад Мажич', role: 'Руководитель Департамента судейства РФС' },
  { name: 'Равшан Ирматов', role: 'Инструктор ФИФА, член ЭСК РФС' },
  { name: 'Николай Иванов', role: 'Инспектор РПЛ, член ЭСК РФС' },
  { name: 'Сергей Зуев', role: 'Экс-арбитр ФИФА, член комиссии' }
];

export function getInitialEskCases(): EskCase[] {
  return [
    {
      id: 'esk_case_101',
      protocolNum: '№ 19-ЭСК/2026',
      date: '2026-08-16',
      tour: '5 тур',
      comp: 'rpl',
      matchId: 'fx_rpl_sample_1',
      homeTeam: 'Спартак',
      awayTeam: 'Зенит',
      homeScore: 1,
      awayScore: 2,
      minute: '78\'',
      episodeType: 'penalty',
      episodeTitle: 'Назначение 11-метрового удара в ворота ФК «Спартак»',
      applicantClub: 'Спартак',
      applicantComplaint: 'ФК «Спартак-Москва» обратился в комиссию с просьбой оценить обоснованность назначения пенальти. Клуб настаивает, что защитник играл исключительно в мяч, а контакт с нападающим носил остаточный характер после чистого отбора.',
      refereeName: 'Сергей Карасёв',
      varRefereeName: 'Павел Кукуян',
      status: 'pending',
      varSimulation: {
        cameraAngle: 'Камера 2 (Штрафная площадь, 16-метровая линия)',
        stopFrameTime: '77:42.15',
        varLinesApplied: true,
        infringementArea: 'Левый угол вратарской, контакт шипов с голеностопом',
        refereeMicTranscript: [
          { speaker: 'Главный судья', text: 'Вижу наступ в штрафной! Свищу точку!' },
          { speaker: 'VAR-центр', text: 'Серега, пауза! Проверяем фазу атаки и точку первого контакта. Дайте 3-й повтор с замедлением.' },
          { speaker: 'VAR-центр', text: 'Так, защитник сначала коснулся носка мяча или сразу в ногу? Контакт плотный, но мяч изменил траекторию.' },
          { speaker: 'Главный судья', text: 'Подтверждаете 11-метровый?' },
          { speaker: 'VAR-центр', text: 'Рекомендую просмотр на мониторе (On-Field Review), контакт неоднозначный.' }
        ]
      },
      hearing: {
        chairman: 'Милорад Мажич',
        votingBoard: [
          { name: 'Милорад Мажич', role: 'Руководитель Департамента судейства', vote: 'incorrect', comment: 'Защитник совершил своевременную попытку сыграть в мяч. Контакт не содержал признаков безрассудности.' },
          { name: 'Равшан Ирматов', role: 'Инструктор ФИФА', vote: 'incorrect', comment: 'Нападающий инициировал контакт, подставив ногу под уже стелющегося защитника. Ошибочный пенальти.' },
          { name: 'Николай Иванов', role: 'Член ЭСК', vote: 'disputable', comment: 'Эпизод на усмотрение арбитра в динамике, но для вмешательства VAR оснований было недостаточно.' },
          { name: 'Сергей Зуев', role: 'Экс-арбитр ФИФА', vote: 'incorrect', comment: 'Судье следовало продолжить игру.' }
        ]
      }
    },
    {
      id: 'esk_case_102',
      protocolNum: '№ 18-ЭСК/2026',
      date: '2026-08-14',
      tour: '5 тур',
      comp: 'rpl',
      matchId: 'fx_rpl_sample_2',
      homeTeam: 'Локомотив',
      awayTeam: 'ЦСКА',
      homeScore: 0,
      awayScore: 0,
      minute: '89\'',
      episodeType: 'red_card',
      episodeTitle: 'Удаление защитника за срыв перспективной атаки (Красная карточка)',
      applicantClub: 'Локомотив',
      applicantComplaint: 'ФК «Локомотив» просит признать ошибочным прямое удаление за так называемый фол последней надежды (DOGSO). На одной линии находился страхующий центральный защитник, контроль мяча нападающим не был очевиден.',
      refereeName: 'Владислав Безбородов',
      varRefereeName: 'Евгений Турбин',
      status: 'pending',
      varSimulation: {
        cameraAngle: 'Камера 1 (Основной панорамный план, тактическая сетка)',
        stopFrameTime: '88:51.04',
        varLinesApplied: true,
        infringementArea: 'Зона перед радиусом штрафной площади',
        refereeMicTranscript: [
          { speaker: 'Главный судья', text: 'Фол перед штрафной, чистый выход один на один, достаю красную!' },
          { speaker: 'VAR-центр', text: 'Проверяем критерии DOGSO: расстояние до ворот, направление движения и позиция второго защитника.' },
          { speaker: 'VAR-центр', text: 'Второй защитник находился в 3.2 метрах сбоку и успевал перекрыть створ. Решение пограничное.' }
        ]
      },
      hearing: {
        chairman: 'Милорад Мажич',
        votingBoard: [
          { name: 'Милорад Мажич', role: 'Руководитель Департамента судейства', vote: 'incorrect', comment: 'Не все 4 критерия DOGSO соблюдены. Следовало ограничиться предупреждением (желтая карточка).' },
          { name: 'Равшан Ирматов', role: 'Инструктор ФИФА', vote: 'incorrect', comment: 'Траектория движения мяча уходила к угловому флажку, контроль нападающего отсутствовал.' },
          { name: 'Николай Иванов', role: 'Член ЭСК', vote: 'correct', comment: 'Судья находился в идеальной позиции, нападающий имел очевидную возможность забить гол.' },
          { name: 'Сергей Зуев', role: 'Экс-арбитр ФИФА', vote: 'incorrect', comment: 'Красная карточка предъявлена необоснованно.' }
        ]
      }
    },
    {
      id: 'esk_case_100',
      protocolNum: '№ 17-ЭСК/2026',
      date: '2026-08-08',
      tour: '4 тур',
      comp: 'rpl',
      matchId: 'fx_rpl_sample_3',
      homeTeam: 'Краснодар',
      awayTeam: 'Динамо',
      homeScore: 1,
      awayScore: 1,
      minute: '34\'',
      episodeType: 'disallowed_goal',
      episodeTitle: 'Отмена взятия ворот из-за положения «вне игры»',
      applicantClub: 'Динамо',
      applicantComplaint: 'ФК «Динамо» обратился с жалобой на отмену гола на 34-й минуте. Клуб считает, что нападающий не перекрывал обзор вратарю и не находился в активном офсайде.',
      refereeName: 'Кирилл Левников',
      varRefereeName: 'Артем Любимов',
      status: 'decided',
      varSimulation: {
        cameraAngle: 'Камера 4 (Офсайдная линия по проекции плеча)',
        stopFrameTime: '33:18.40',
        varLinesApplied: true,
        infringementArea: 'Вратарская площадь, позиция вратаря',
        refereeMicTranscript: [
          { speaker: 'VAR-центр', text: 'Кирилл, проверяем гол. Игрок в пассивном офсайде находится прямо на линии взгляда голкипера.' },
          { speaker: 'Главный судья', text: 'Он двигался в сторону мяча?' },
          { speaker: 'VAR-центр', text: 'Да, совершил ложное движение телом, вратарь запоздал с прыжком. Рекомендуем отмену гола.' }
        ]
      },
      hearing: {
        chairman: 'Милорад Мажич',
        votingBoard: [
          { name: 'Милорад Мажич', role: 'Руководитель Департамента судейства', vote: 'correct', comment: 'Судья правильно отменил гол. Игрок атаки мешал вратарю среагировать на удар.' },
          { name: 'Равшан Ирматов', role: 'Инструктор ФИФА', vote: 'correct', comment: 'Полное соответствие Правилу 11 ИФАБ — влияние на соперника.' },
          { name: 'Николай Иванов', role: 'Член ЭСК', vote: 'correct', comment: 'Единогласная поддержка судейской бригады.' },
          { name: 'Сергей Зуев', role: 'Экс-арбитр ФИФА', vote: 'correct', comment: 'Вмешательство VAR было обязательным и корректным.' }
        ],
        adminVote: 'correct',
        finalVerdict: 'correct',
        verdictSummary: 'ЭСК РФС единогласно признает решение арбитра отменить гол ПРАВИЛЬНЫМ. Игрок атакующей команды, находясь в офсайде, закрывал обзор голкиперу.',
        officialRuleCitation: 'Правило 11.2 ИФАБ (Положение вне игры: очевидное препятствование возможности соперника сыграть в мяч).',
        consequences: 'Жалоба ФК «Динамо» отклонена в полном объеме. Судейская бригада получила положительную оценку инспектора.',
        decidedAt: Date.now() - 3 * 86400 * 1000,
        decidedBy: 'ЭСК РФС и Администратор'
      }
    }
  ];
}

/** Автоматическая проверка матча на спорные моменты для обращения в ЭСК */
export function checkControversialMomentsForEsk(db: any, f: any, m: any): EskCase | null {
  if (!f || f.status !== 'done') return null;

  const events = m?.events || [];
  const redCards = events.filter((e: any) => e.type === 'red');
  const penalties = events.filter((e: any) => e.type === 'penalty' || (e.note && e.note.includes('пенальти')));
  
  if (redCards.length === 0 && penalties.length === 0) return null;

  const HName = f.homeName || (db.teams.find((t: any) => t.id === f.home)?.name) || f.home;
  const AName = f.awayName || (db.teams.find((t: any) => t.id === f.away)?.name) || f.away;
  const isRed = redCards.length > 0;
  const ev = isRed ? redCards[0] : penalties[0];

  const applicant = isRed 
    ? (ev.side === 'away' ? AName : HName)
    : (ev.side === 'away' ? HName : AName);

  const num = (db.eskCases?.length || 0) + 1;
  const caseId = `esk_case_${f.id}_${Date.now()}`;

  const newCase: EskCase = {
    id: caseId,
    protocolNum: `№ ${20 + num}-ЭСК/2026`,
    date: f.date || new Date().toISOString().slice(0, 10),
    tour: f.round ? `${f.round} тур` : 'Кубок',
    comp: f.comp || 'rpl',
    matchId: f.id,
    homeTeam: HName,
    awayTeam: AName,
    homeScore: f.hg ?? 0,
    awayScore: f.ag ?? 0,
    minute: `${ev.minute || (isRed ? '82' : '74')}'`,
    episodeType: isRed ? 'red_card' : 'penalty',
    episodeTitle: isRed 
      ? `Прямое удаление игрока ФК «${applicant}» (${ev.minute || '82'}\')`
      : `Назначение 11-метрового удара в матче «${HName}» — «${AName}»`,
    applicantClub: applicant,
    applicantComplaint: isRed
      ? `ФК «${applicant}» обратился в Экспертно-судейскую комиссию при Президенте РФС с просьбой отменить красную карточку футболиста и аннулировать дисквалификацию, ссылаясь на отсутствие умысла и игры открытыми шипами.`
      : `ФК «${applicant}» направил жалобу в ЭСК РФС, настаивая на отсутствии нарушения правил в единоборстве в штрафной площади и ошибочном вмешательстве арбитра.`,
    refereeName: f.refereeName || 'Сергей Иванов',
    varRefereeName: f.varReferee || 'Виталий Мешков',
    status: 'pending',
    varSimulation: {
      cameraAngle: isRed ? 'Камера 1 (Крупный план единоборства)' : 'Камера 3 (16-метровая линия штрафной)',
      stopFrameTime: `${ev.minute || '78'}:12.00`,
      varLinesApplied: !isRed,
      infringementArea: isRed ? 'Борьба за мяч в центральном круге' : 'Штрафная площадь, контакт в ногах',
      refereeMicTranscript: [
        { speaker: 'Главный судья', text: isRed ? 'Прямая красная! Грубейший фол!' : 'Пенальти! Нарушение правил!' },
        { speaker: 'VAR-центр', text: 'Идет проверка эпизода. Показываем повтор в замедленном темпе...' },
        { speaker: 'Главный судья', text: 'Жду подтверждения решения.' },
        { speaker: 'VAR-центр', text: 'Эпизод крайне спорный, решение оставляем на усмотрение комиссии ЭСК.' }
      ]
    },
    hearing: {
      chairman: 'Милорад Мажич',
      votingBoard: [
        { name: 'Милорад Мажич', role: 'Руководитель Департамента судейства', vote: Math.random() > 0.5 ? 'incorrect' : 'correct', comment: 'Анализ эпизода показывает расхождение с рекомендациями УЕФА по интенсивности контакта.' },
        { name: 'Равшан Ирматов', role: 'Инструктор ФИФА', vote: Math.random() > 0.5 ? 'incorrect' : 'disputable', comment: 'Спорный момент, требующий детальной трактовки Правил игры.' },
        { name: 'Николай Иванов', role: 'Член ЭСК', vote: 'correct', comment: 'Судья находился в правильной позиции.' },
        { name: 'Сергей Зуев', role: 'Экс-арбитр ФИФА', vote: 'incorrect', comment: 'Оснований для столь строгого наказания не было.' }
      ]
    }
  };

  return newCase;
}

/** Вынесение окончательного вердикта по делу ЭСК РФС (Админ в роли главы ЭСК) */
export function resolveEskCase(
  db: any,
  caseId: string,
  adminVerdict: 'correct' | 'incorrect' | 'disputable',
  adminComment?: string,
  adminName: string = 'Администратор ЭСК'
): { eskCase: EskCase; insiderPost?: InsiderPost } {
  const eskCase = (db.eskCases || []).find((c: EskCase) => c.id === caseId);
  if (!eskCase) throw new Error('Дело ЭСК не найдено');

  eskCase.status = 'decided';
  eskCase.hearing.adminVote = adminVerdict;
  eskCase.hearing.decidedBy = adminName;
  eskCase.hearing.decidedAt = Date.now();

  // Подсчет голосов комиссии
  let correctVotes = eskCase.hearing.votingBoard.filter((v: { vote: 'correct' | 'incorrect' | 'disputable' }) => v.vote === 'correct').length;
  let incorrectVotes = eskCase.hearing.votingBoard.filter((v: { vote: 'correct' | 'incorrect' | 'disputable' }) => v.vote === 'incorrect').length;
  let disputableVotes = eskCase.hearing.votingBoard.filter((v: { vote: 'correct' | 'incorrect' | 'disputable' }) => v.vote === 'disputable').length;

  if (adminVerdict === 'correct') correctVotes += 2; // решающий голос председателя
  else if (adminVerdict === 'incorrect') incorrectVotes += 2;
  else disputableVotes += 2;

  const finalVerdict = incorrectVotes >= correctVotes ? 'incorrect' : (correctVotes >= disputableVotes ? 'correct' : 'disputable');
  eskCase.hearing.finalVerdict = finalVerdict;

  const isRefereeWrong = finalVerdict === 'incorrect';
  const episodeName = eskCase.episodeTitle;

  if (isRefereeWrong) {
    eskCase.hearing.verdictSummary = `ЭСК РФС большинством голосов признала решение арбитра ${eskCase.refereeName} ОШИБОЧНЫМ. Жалоба ФК «${eskCase.applicantClub}» УДОВЛЕТВОРЕНА.`;
    eskCase.hearing.officialRuleCitation = eskCase.episodeType === 'red_card' 
      ? 'Правило 12.3 ИФАБ — Дисциплинарные санкции (ошибочное определение DOGSO / отсутствие чрезмерной силы).'
      : 'Правило 12.1 ИФАБ — Ошибочная трактовка физического контакта в единоборстве.';
    eskCase.hearing.consequences = eskCase.episodeType === 'red_card'
      ? `Красная карточка игрока отменена, автоматическая дисквалификация аннулирована в протоколах соревнований. Арбитр ${eskCase.refereeName} отстранен на 1 тур РПЛ.`
      : `Арбитр ${eskCase.refereeName} получил неудовлетворительную оценку (7.9) за результативную ошибку, повлиявшую на исход встречи.`;

    // Реальное снятие дисквалификации с игрока в базе если это была красная карточка
    if (eskCase.episodeType === 'red_card') {
      const applicantTeam = db.teams?.find((t: any) => t.name === eskCase.applicantClub);
      if (applicantTeam) {
        const teamPlayers = (db.players || []).filter((p: any) => p.teamId === applicantTeam.id);
        const bannedPlayer = teamPlayers.find((p: any) => p.banLeft > 0 && (p.banReason?.includes('красн') || p.banReason?.includes('удален')));
        if (bannedPlayer) {
          bannedPlayer.banLeft = 0;
          bannedPlayer.banReason = '';
          bannedPlayer.banUntil = '';
          bannedPlayer.banLabel = '';
        }
      }
    }
  } else if (finalVerdict === 'correct') {
    eskCase.hearing.verdictSummary = `ЭСК РФС признала решение арбитра ${eskCase.refereeName} ПРАВИЛЬНЫМ. Судейская бригада действовала в строгом соответствии с Правилами игры.`;
    eskCase.hearing.officialRuleCitation = 'Правило 12 ИФАБ — Корректная фиксация нарушения и вынесение дисциплинарных санкций.';
    eskCase.hearing.consequences = `Жалоба ФК «${eskCase.applicantClub}» отклонена. Решение арбитра оставлено в силе.`;
  } else {
    eskCase.hearing.verdictSummary = `ЭСК РФС признала эпизод дискуссионным (50/50). Вмешательство VAR признано методически нецелесообразным, но санкции к судье не применяются.`;
    eskCase.hearing.officialRuleCitation = 'Протокол VAR ИФАБ — Принцип явной и очевидной ошибки.';
    eskCase.hearing.consequences = `Решение на поле оставлено в силе. Арбитрам даны методические разъяснения.`;
  }

  // Генерация сенсационного поста в Telegram-ленту от Карпа или РФС
  const rfsChannel = TELEGRAM_CHANNELS.rfs;
  const karpChannel = TELEGRAM_CHANNELS.karp;
  const channel = isRefereeWrong ? karpChannel : rfsChannel;

  const insiderPost: InsiderPost = {
    id: `post_esk_decision_${Date.now()}`,
    channelId: channel.id,
    channelName: channel.name,
    channelHandle: channel.handle,
    avatarBg: channel.avatarBg,
    avatarIcon: channel.avatarIcon,
    tag: 'ЭСК РФС',
    tagColor: isRefereeWrong ? '#dc2626' : '#0284c7',
    title: isRefereeWrong
      ? `💣 ЭСК РФС ПРИЗНАЛА ОШИБКУ СУДЬИ В МАТЧЕ «${eskCase.homeTeam}» — «${eskCase.awayTeam}»!`
      : `⚖️ Официально: ЭСК РФС поддержала арбитра ${eskCase.refereeName}`,
    content: isRefereeWrong
      ? `<b>БОМБА! ЭСК РФС встала на сторону «${eskCase.applicantClub}»!</b><br><br>
Комиссия под председательством Милорада Мажича детально изучила момент на ${eskCase.minute} минуте матча «${eskCase.homeTeam}» — «${eskCase.awayTeam}».<br><br>
<b>Вердикт:</b> Судья ${eskCase.refereeName} ошибся! ${eskCase.hearing.consequences}<br><br>
Карп докладывает: в судейском комитете подтвердили отстранение арбитра. Протокол заседания утвержден.<br><br>
#ЭСК #Судейство #РФС #${eskCase.applicantClub.replace(/\s+/g, '')} #Карп`
      : `<b>Официальное сообщение Экспертно-судейской комиссии при президенте РФС (${eskCase.protocolNum})</b><br><br>
Комиссия рассмотрела обращение ФК «${eskCase.applicantClub}» по матчу «${eskCase.homeTeam}» — «${eskCase.awayTeam}».<br><br>
<b>Решение:</b> Действия арбитра ${eskCase.refereeName} на ${eskCase.minute} минуте признаны полностью корректными и методически обоснованными. Жалоба клуба отклонена.<br><br>
#РФС #ЭСК #Официально #Судейство`,
    createdAt: Date.now(),
    timeLabel: 'только что',
    views: Math.floor(14000 + Math.random() * 8000),
    forwards: Math.floor(300 + Math.random() * 500),
    reactions: isRefereeWrong 
      ? { '🔥': 410, '🤡': 120, '👏': 350, '😱': 140 }
      : { '⚖️': 320, '👀': 190, '🤬': 140 },
    comments: [
      {
        id: `c_esk_${Date.now()}`,
        author: 'Юрист по спортивному праву',
        text: isRefereeWrong ? 'Справедливое решение! Ошибка была видна даже без зума VAR' : 'Ожидаемо, корпоративная солидарность судей сработала',
        time: 'только что',
        likes: 19
      }
    ],
    isHot: true
  };

  if (!Array.isArray(db.insiderPosts)) db.insiderPosts = [];
  db.insiderPosts.unshift(insiderPost);

  return { eskCase, insiderPost };
}

/** ИИ-анализ эпизода комиссией ЭСК через Gemini 3.8 Flash */
export async function generateAIEskAnalysis(
  db: any,
  caseId: string
): Promise<{ verdict: 'correct' | 'incorrect' | 'disputable'; analysis: string; rule: string }> {
  const eskCase = (db.eskCases || []).find((c: EskCase) => c.id === caseId);
  if (!eskCase) throw new Error('Дело не найдено');

  const apiKey = process.env.GEMINI_API_KEY || '';
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const prompt = `Ты — председатель Экспертно-судейской комиссии при Президенте РФС (ЭСК РФС), действующий совместно с главой департамента судейства Милорадом Мажичем.
Проанализируй спорный эпизод матча Российской Премьер-Лиги в строгом, авторитетном юридическо-судейском стиле РФС.

Данные эпизода:
- Матч: «${eskCase.homeTeam}» — «${eskCase.awayTeam}» (${eskCase.homeScore}:${eskCase.awayScore})
- Минута: ${eskCase.minute}
- Тип эпизода: ${eskCase.episodeType} (${eskCase.episodeTitle})
- Клуб-заявитель: ФК «${eskCase.applicantClub}»
- Претензия клуба: ${eskCase.applicantComplaint}
- Главный арбитр: ${eskCase.refereeName}
- VAR арбитр: ${eskCase.varRefereeName}
- Запись VAR-переговоров: ${JSON.stringify(eskCase.varSimulation.refereeMicTranscript)}

Сформулируй вердикт комиссии:
1. "verdict": "correct" (судья прав), "incorrect" (судья ошибся), или "disputable" (спорный эпизод 50/50).
2. "analysis": Развернутое юридическое обоснование на русском языке (3-4 предложения с использованием терминологии ИФАБ: интенсивность контакта, безрассудство, игра открытыми шипами, DOGSO, естественное положение руки, ракурс камеры, фаза атаки).
3. "rule": Пункт Правил игры ИФАБ (например, "Правило 12.1 ИФАБ — Нарушения правил и недисциплинированное поведение").

Ответь строго в формате JSON:
{
  "verdict": "correct" | "incorrect" | "disputable",
  "analysis": "...",
  "rule": "..."
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse((response.text || '').trim());
      return {
        verdict: parsed.verdict || 'incorrect',
        analysis: parsed.analysis || 'Решение арбитра признано ошибочным по совокупности критериев ИФАБ.',
        rule: parsed.rule || 'Правило 12 ИФАБ'
      };
    } catch (e) {
      console.error('Ошибка ИИ ЭСК:', e);
    }
  }

  // Резервный качественный ответ
  return {
    verdict: 'incorrect',
    analysis: `Комиссия отмечает, что в единоборстве на ${eskCase.minute} минуте контакт не содержал признаков чрезмерной силы или грубой неосторожности. Арбитр ошибочно оценил степень воздействия на соперника. Решение подлежит пересмотру.`,
    rule: 'Правило 12.2 ИФАБ — Оценка безрассудного поведения и единоборств'
  };
}
