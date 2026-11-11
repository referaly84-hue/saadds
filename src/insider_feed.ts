/**
 * Инсайдерская Telegram-лента («Карп», «Нобель», «КБ Спартак», «Мутко против», «Дай ударить», «ЭСК РФС»)
 * Околофутбольный хайп РПЛ: судейские скандалы, трансферные слухи, инсайды из раздевалок,
 * реакции, комментарии и нейросетевая генерация эксклюзивов через Gemini 3.8 Flash.
 */

import { GoogleGenAI } from '@google/genai';

export interface TelegramChannel {
  id: 'karp' | 'nobel' | 'spartak' | 'mutko' | 'dai_udarit' | 'rfs';
  name: string;
  handle: string;
  avatarBg: string;
  avatarIcon: string;
  badge: string;
  verified: boolean;
  subscribers: string;
  description: string;
}

export interface InsiderComment {
  id: string;
  author: string;
  clubBadge?: string;
  text: string;
  time: string;
  likes: number;
}

export interface InsiderPost {
  id: string;
  channelId: TelegramChannel['id'];
  channelName: string;
  channelHandle: string;
  avatarBg: string;
  avatarIcon: string;
  tag: 'Инсайд' | 'Трансферы' | 'Судейство' | 'Скандал' | 'ЭСК РФС' | 'Матч' | 'Раздевалка' | 'Эксклюзив' | 'Жеребьёвка' | 'Официально' | 'Трансляция';
  tagColor?: string;
  title?: string;
  content: string; // rich HTML/Telegram format
  mediaBadge?: string;
  createdAt: number;
  timeLabel: string;
  views: number;
  forwards: number;
  reactions: Record<string, number>;
  userReactions?: string[];
  comments: InsiderComment[];
  relatedFixtureId?: string;
  relatedTeam?: string;
  isAiGenerated?: boolean;
  isHot?: boolean;
  isPinned?: boolean;
}

export const TELEGRAM_CHANNELS: Record<TelegramChannel['id'], TelegramChannel> = {
  karp: {
    id: 'karp',
    name: 'Инсайды от Карпа',
    handle: '@karpinside',
    avatarBg: 'linear-gradient(135deg, #ea580c, #c2410c)',
    avatarIcon: '💣',
    badge: 'Инсайдер №1',
    verified: true,
    subscribers: '148.5K',
    description: 'Иван Карпов. Главные инсайды и трансферные бомбы российского футбола. Никакой цензуры.'
  },
  nobel: {
    id: 'nobel',
    name: 'Nobel | Нобель Арустамян',
    handle: '@nobel_arustamyan',
    avatarBg: 'linear-gradient(135deg, #701a75, #4a044e)',
    avatarIcon: '🍷',
    badge: 'Эксклюзивы',
    verified: true,
    subscribers: '185.2K',
    description: 'Эксклюзивные интервью, трансферы между Россией и Европой, инсайды из Италии и Ближнего Востока.'
  },
  spartak: {
    id: 'spartak',
    name: 'КБ Телега | Шоу Спартака',
    handle: '@kb_spartak_show',
    avatarBg: 'linear-gradient(135deg, #dc2626, #991b1b)',
    avatarIcon: '🔴⚪',
    badge: 'Красно-белые',
    verified: true,
    subscribers: '94.3K',
    description: 'Главный рупор спартаковских болельщиков. Судейский произвол, страсти в клубе и эмоции без фильтров.'
  },
  mutko: {
    id: 'mutko',
    name: 'Мутко против',
    handle: '@mutkoproiv',
    avatarBg: 'linear-gradient(135deg, #1e3a8a, #0f172a)',
    avatarIcon: '🕵️‍♂️',
    badge: 'Расследования',
    verified: true,
    subscribers: '112.0K',
    description: 'Кабинеты РФС, судейские скандалы, закрытые документы, бюджеты клубов и трансферные махинации.'
  },
  dai_udarit: {
    id: 'dai_udarit',
    name: 'Дай ударить',
    handle: '@dai_udarit',
    avatarBg: 'linear-gradient(135deg, #ca8a04, #a16207)',
    avatarIcon: '⚡',
    badge: 'Околофутбол',
    verified: true,
    subscribers: '76.4K',
    description: 'Жара в микст-зоне, стычки в раздевалках, яркие цитаты и вирусные моменты туров РПЛ.'
  },
  rfs: {
    id: 'rfs',
    name: 'Пресс-служба РФС и ЭСК',
    handle: '@rfs_official',
    avatarBg: 'linear-gradient(135deg, #0284c7, #0369a1)',
    avatarIcon: '⚖️',
    badge: 'Официально РФС',
    verified: true,
    subscribers: '210.1K',
    description: 'Официальные решения Экспертно-судейской комиссии (ЭСК РФС), назначения арбитров и вердикты.'
  }
};

/** Форматирование времени относительно сейчас */
export function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return 'только что';
  if (mins < 60) return `${mins} мин назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч назад`;
  const days = Math.floor(hours / 24);
  return `${days} д назад`;
}

/** Первичная инициализация постов если лента пуста */
export function getInitialInsiderPosts(): InsiderPost[] {
  const now = Date.now();
  return [
    {
      id: 'post_init_1',
      channelId: 'karp',
      channelName: TELEGRAM_CHANNELS.karp.name,
      channelHandle: TELEGRAM_CHANNELS.karp.handle,
      avatarBg: TELEGRAM_CHANNELS.karp.avatarBg,
      avatarIcon: TELEGRAM_CHANNELS.karp.avatarIcon,
      tag: 'Инсайд',
      tagColor: '#ea580c',
      title: '💣 ИНСАЙД! Раздевалка «Спартака» на пороге бунта после спорного судейства',
      content: `<b>ИНСАЙД! Боссы красно-белых в ярости от судейства в последних матчах.</b><br><br>
Карп докладывает: после финального свистка в раздевалке «Спартака» состоялся жесткий разговор на повышенных тонах. Капитан команды и ветераны призвали руководство клуба официально подать протест в ЭСК РФС на действия судейской бригады.<br><br>
По моей информации, в клубном офисе на Тушино уже готовят видеоподборку из 4 спорных эпизодов, включая неназначенный пенальти на 84-й минуте и отмененный гол из-за спорного офсайда.<br><br>
<i>«Если ЭСК РФС не даст правовую оценку этому беспределу, мы потребуем отстранения главного арбитра до конца первого круга»</i>, — передает наш источник из руководства москвичей.<br><br>
#Спартак #ЭСК #Судейство #Карп`,
      createdAt: now - 18 * 60 * 1000,
      timeLabel: '18 мин назад',
      views: 18450,
      forwards: 532,
      reactions: { '🔥': 412, '🤡': 84, '🤬': 295, '👍': 140 },
      isHot: true,
      comments: [
        { id: 'c1', author: 'Красно-белый сектор', clubBadge: 'Спартак', text: 'Каждый тур одно и то же! Сколько можно терпеть судейский произвол?!', time: '14 мин назад', likes: 45 },
        { id: 'c2', author: 'Питерский десант', clubBadge: 'Зенит', text: 'Опять Спартаку судьи помешали в пустые ворота попасть 😂 Карп как всегда раздувает', time: '11 мин назад', likes: 23 },
        { id: 'c3', author: 'Армеец', clubBadge: 'ЦСКА', text: 'Посмотрим, что скажет ЭСК. Но момент с наступлением был очевидным фолом', time: '5 мин назад', likes: 12 }
      ]
    },
    {
      id: 'post_init_2',
      channelId: 'nobel',
      channelName: TELEGRAM_CHANNELS.nobel.name,
      channelHandle: TELEGRAM_CHANNELS.nobel.handle,
      avatarBg: TELEGRAM_CHANNELS.nobel.avatarBg,
      avatarIcon: TELEGRAM_CHANNELS.nobel.avatarIcon,
      tag: 'Трансферы',
      tagColor: '#9333ea',
      title: '🍷 Эксклюзив: Итальянские клубы следят за звездами РПЛ',
      content: `<b>Эксклюзив 🍷: По моим данным из Милана и Болоньи</b><br><br>
Скауты двух клубов итальянской Серии А («Болонья» и «Фиорентина») получили детальные отчеты по молодым российским полузащитникам.<br><br>
Переговоры пока находятся на стадии предварительного сбора информации, однако интерес вполне предметный: за игроками пристально наблюдали в 3 последних турах чемпионата России.<br><br>
Ориентировочная сумма возможного предложения зимой — от <b>€7.5M до €10M</b> плюс процент от дальнейшей перепродажи. В руководстве клуба подтвердили, что не будут чинить препятствий при достойном предложении из Европы.<br><br>
#Нобель #Эксклюзив #СерияА #Трансферы`,
      createdAt: now - 65 * 60 * 1000,
      timeLabel: '1 ч назад',
      views: 24100,
      forwards: 610,
      reactions: { '🍷': 380, '🔥': 290, '❤️': 180, '👏': 115 },
      comments: [
        { id: 'c4', author: 'Алексей С.', text: 'Очень круто, если наши ребята уедут в Серию А к Мотте или Итальяно!', time: '40 мин назад', likes: 18 }
      ]
    },
    {
      id: 'post_init_3',
      channelId: 'rfs',
      channelName: TELEGRAM_CHANNELS.rfs.name,
      channelHandle: TELEGRAM_CHANNELS.rfs.handle,
      avatarBg: TELEGRAM_CHANNELS.rfs.avatarBg,
      avatarIcon: TELEGRAM_CHANNELS.rfs.avatarIcon,
      tag: 'ЭСК РФС',
      tagColor: '#0284c7',
      title: '⚖️ Официально: Повестка заседания ЭСК РФС по итогам тура',
      content: `<b>Экспертно-судейская комиссия при президенте РФС информирует о регистрации обращений клубов:</b><br><br>
На очередном заседании под председательством главы судейского департамента комиссия рассмотрит следующие ключевые эпизоды:<br><br>
1. <b>Матч тура:</b> Эпизод на 78-й минуте — правильность назначения 11-метрового удара в ворота гостей.<br>
2. <b>Матч в Москве:</b> Отмена взятия ворот на 42-й минуте после вмешательства VAR и фиксации геометрического офсайда.<br>
3. <b>Эпизод с прямой красной карточкой</b> за грубую игру на 90+3-й минуте.<br><br>
Заседание членов комиссии с участием международных экспертов состоится сегодня. Окончательный вердикт и протокол заседания будут опубликованы в системе.<br><br>
#РФС #ЭСК #Судейство #Официально`,
      createdAt: now - 120 * 60 * 1000,
      timeLabel: '2 ч назад',
      views: 31200,
      forwards: 890,
      reactions: { '⚖️': 520, '👀': 410, '🤡': 190, '🍿': 340 },
      isPinned: true,
      comments: [
        { id: 'c5', author: 'FanZone', text: 'Ждем вердикта по пенальти! ВАР 5 минут чертил линии', time: '1 ч назад', likes: 34 }
      ]
    },
    {
      id: 'post_init_4',
      channelId: 'mutko',
      channelName: TELEGRAM_CHANNELS.mutko.name,
      channelHandle: TELEGRAM_CHANNELS.mutko.handle,
      avatarBg: TELEGRAM_CHANNELS.mutko.avatarBg,
      avatarIcon: TELEGRAM_CHANNELS.mutko.avatarIcon,
      tag: 'Скандал',
      tagColor: '#dc2626',
      title: '🕵️‍♂️ «Мутко против»: Инсайд о гонорарах судей и полиграфе',
      content: `<b>По нашим данным из кулуаров Дома футбола на Таганке:</b><br><br>
Руководство департамента судейства провело закрытое совещание с арбитрами Премьер-Лиги. За допущенные результативные ошибки в текущем сезоне два судьи уже переведены на матчи Первой Лиги до конца календарного года.<br><br>
Кроме того, в случае подтверждения вердиктом ЭСК грубой ошибки по пенальти главный арбитр матча рискует пропустить не менее двух туров без сохранения гонорара за вызов на VAR.<br><br>
<i>«Дисциплина будет предельно жесткой. Никаких поблажек за авторитет»</i>, — заявляют в судейском комитете.<br><br>
#РФС #Судьи #Скандал #МуткоПротив`,
      createdAt: now - 210 * 60 * 1000,
      timeLabel: '3.5 ч назад',
      views: 19800,
      forwards: 420,
      reactions: { '🕵️‍♂️': 310, '🤡': 95, '🔥': 204, '👍': 112 },
      comments: [
        { id: 'c6', author: 'Сергей Николаевич', text: 'Полиграф надо возвращать, как раньше! Тогда ошибок сразу станет меньше', time: '2 ч назад', likes: 29 }
      ]
    },
    {
      id: 'post_init_5',
      channelId: 'dai_udarit',
      channelName: TELEGRAM_CHANNELS.dai_udarit.name,
      channelHandle: TELEGRAM_CHANNELS.dai_udarit.handle,
      avatarBg: TELEGRAM_CHANNELS.dai_udarit.avatarBg,
      avatarIcon: TELEGRAM_CHANNELS.dai_udarit.avatarIcon,
      tag: 'Раздевалка',
      tagColor: '#ca8a04',
      title: '⚡ Жара в подтрибунке: игроки едва не сошлись стенка на стенку',
      content: `<b>Очевидцы сообщают о жаркой потасовке в подтрибунном помещении сразу после матча!</b><br><br>
Защитник хозяев поля на повышенных тонах предъявил форварду соперника за симуляцию в штрафной площади на последних секундах.<br><br>
Охране стадиона и тренерам по физподготовке пришлось разнимать сцепившихся футболистов. Инцидент занесен инспектором матча в рапорт, контрольно-дисциплинарный комитет (КДК РФС) может открыть дело по неспортивному поведению.<br><br>
#Околофутбол #Раздевалка #ДайУдарить #РПЛ`,
      createdAt: now - 320 * 60 * 1000,
      timeLabel: '5 ч назад',
      views: 14200,
      forwards: 380,
      reactions: { '⚡': 280, '🍿': 250, '🔥': 190, '🥊': 140 },
      comments: []
    }
  ];
}

/** Генерация инсайда после матча на основе реальных событий */
export function generatePostMatchInsider(db: any, f: any, m: any): InsiderPost | null {
  if (!f || f.status !== 'done') return null;

  const now = Date.now();
  const HName = f.homeName || (db.teams.find((t: any) => t.id === f.home)?.name) || f.home;
  const AName = f.awayName || (db.teams.find((t: any) => t.id === f.away)?.name) || f.away;
  const hg = f.hg ?? 0;
  const ag = f.ag ?? 0;
  const totalGoals = hg + ag;

  // Ищем события: пенальти, красные карточки, спорные моменты
  const events = m?.events || [];
  const redCards = events.filter((e: any) => e.type === 'red');
  const penalties = events.filter((e: any) => e.type === 'penalty' || (e.note && e.note.includes('пенальти')) || e.desc?.includes('пенальти'));
  const disallowed = events.filter((e: any) => e.desc?.includes('отмен') || e.note?.includes('отмен') || e.desc?.includes('ВАР'));

  // Сценарий 1: Красная карточка или пенальти -> судейский скандал Карпа или Спартака
  if (redCards.length > 0 || penalties.length > 0 || disallowed.length > 0) {
    const isSpartakMatch = HName.includes('Спартак') || AName.includes('Спартак');
    const channelId = isSpartakMatch ? 'spartak' : (Math.random() > 0.5 ? 'karp' : 'mutko');
    const ch = TELEGRAM_CHANNELS[channelId];

    let dramaDesc = '';
    if (redCards.length > 0) {
      const rc = redCards[0];
      dramaDesc = `Прямое удаление на ${rc.minute || '80-й'}-й минуте вызвало бурю негодования на скамейке запасных! Представители клуба заявили о намерении опротестовать решение судьи в ЭСК РФС.`;
    } else if (penalties.length > 0) {
      dramaDesc = `Назначенный пенальти решил исход встречи (${hg}:${ag}), однако повторы оставляют огромные вопросы к главному арбитру и VAR-бригаде. Защитник играл в мяч!`;
    } else {
      dramaDesc = `Отмененный гол после долгого черчения офсайдных линий вызвал шок на трибунах. Клуб уже запросил запись переговоров главного судьи с комнатой VAR.`;
    }

    return {
      id: `post_match_${f.id}_${Date.now()}`,
      channelId: ch.id,
      channelName: ch.name,
      channelHandle: ch.handle,
      avatarBg: ch.avatarBg,
      avatarIcon: ch.avatarIcon,
      tag: 'Судейство',
      tagColor: '#dc2626',
      title: `⚡ СКАНДАЛ ПОСЛЕ МАТЧА «${HName}» — «${AName}» (${hg}:${ag})!`,
      content: `<b>«${HName}» — «${AName}» (${hg}:${ag}): Судейский триллер отправляется на экспертизу в ЭСК РФС!</b><br><br>
${dramaDesc}<br><br>
По горячим следам в подтрибунном тоннеле официальные лица проигравшей стороны заявили о подаче официальной жалобы. Руководство требует разобрать работу арбитра и отменить санкции к игроку.<br><br>
<i>«Мы не позволим решать судьбу очков кабинетными методами!»</i> — звучит из раздевалки.<br><br>
#РПЛ #Судейство #ЭСК #${HName.replace(/\s+/g, '')} #${AName.replace(/\s+/g, '')}`,
      createdAt: now,
      timeLabel: 'только что',
      views: Math.floor(8000 + Math.random() * 12000),
      forwards: Math.floor(180 + Math.random() * 400),
      reactions: { '🔥': 280, '🤬': 190, '🤡': 95, '👀': 150 },
      comments: [
        { id: `c_${Date.now()}_1`, author: 'Болельщик со стажем', text: 'Судью срочно на ковер в ЭСК! Чистейший беспредел!', time: 'только что', likes: 14 }
      ],
      relatedFixtureId: f.id,
      relatedTeam: HName,
      isHot: true
    };
  }

  // Сценарий 2: Разгром (3+ разница мячей) -> Инсайд Карпа об отставке или премиальных
  if (Math.abs(hg - ag) >= 3) {
    const loser = hg < ag ? HName : AName;
    const winner = hg > ag ? HName : AName;
    const ch = TELEGRAM_CHANNELS.karp;

    return {
      id: `post_match_${f.id}_${Date.now()}`,
      channelId: 'karp',
      channelName: ch.name,
      channelHandle: ch.handle,
      avatarBg: ch.avatarBg,
      avatarIcon: ch.avatarIcon,
      tag: 'Инсайд',
      tagColor: '#ea580c',
      title: `💣 РАЗГРОМ! «${winner}» уничтожает «${loser}» ${hg}:${ag} — тренер под угрозой!`,
      content: `<b>ИНСАЙД 💣: Кресло главного тренера «${loser}» раскалилось до предела после фиаско ${hg}:${ag}!</b><br><br>
Карп докладывает: совет директоров «${loser}» назначил экстренное совещание на утро. В клубе крайне недовольны физической формой команды и тактическим провалом.<br><br>
Если в следующем туре не будет набрано 3 очка, тренеру грозит досрочное расторжение контракта с неустойкой. Агенты уже начали предлагать кандидатов на замену.<br><br>
В то же время игроки «${winner}» получат двойные премиальные за яркую победу над принципиальным соперником.<br><br>
#Инсайд #${winner.replace(/\s+/g, '')} #${loser.replace(/\s+/g, '')} #Карп`,
      createdAt: now,
      timeLabel: 'только что',
      views: Math.floor(9500 + Math.random() * 15000),
      forwards: Math.floor(250 + Math.random() * 500),
      reactions: { '🔥': 320, '🤡': 140, '👏': 210, '😱': 180 },
      comments: [],
      relatedFixtureId: f.id,
      isHot: true
    };
  }

  // Сценарий 3: Яркий игрок матча (MotM) -> Эксклюзив Нобеля о трансфере
  if (f.motm?.name && totalGoals >= 2) {
    const ch = TELEGRAM_CHANNELS.nobel;
    return {
      id: `post_match_${f.id}_${Date.now()}`,
      channelId: 'nobel',
      channelName: ch.name,
      channelHandle: ch.handle,
      avatarBg: ch.avatarBg,
      avatarIcon: ch.avatarIcon,
      tag: 'Трансферы',
      tagColor: '#9333ea',
      title: `🍷 Нобель: Феерия ${f.motm.name} привлекла зарубежных скаутов`,
      content: `<b>Эксклюзив 🍷: Герой матча ${f.motm.name} на радарах европейских клубов</b><br><br>
После блестящей игры в матче «${HName}» — «${AName}» (${hg}:${ag}, оценка ${f.motm.rating || 8.5}) на трибунах присутствовали представители европейских клубов.<br><br>
По моей информации, за развитием игрока уже несколько месяцев следят скауты из чемпионатов Турции и Португалии. Зимой возможен официальный оффер.<br><br>
Сам футболист сосредоточен на выступлении за свой клуб в РПЛ, но амбиции попробовать силы в еврокубках не скрывает.<br><br>
#Трансферы #Нобель #РПЛ`,
      createdAt: now,
      timeLabel: 'только что',
      views: Math.floor(7000 + Math.random() * 9000),
      forwards: Math.floor(120 + Math.random() * 300),
      reactions: { '🍷': 290, '❤️': 180, '🔥': 220, '👍': 140 },
      comments: [],
      relatedFixtureId: f.id
    };
  }

  return null;
}

/** Генерация случайного вброса инсайда (периодический таймер или кнопка "Вброс инсайда") */
export function generateRandomInsiderDrop(db: any): InsiderPost {
  const now = Date.now();
  const teams = db.teams || [];
  const pickTeam = () => (teams[Math.floor(Math.random() * teams.length)]?.name) || 'ЦСКА';
  const t1 = pickTeam();
  let t2 = pickTeam();
  while (t2 === t1 && teams.length > 1) t2 = pickTeam();

  const scenarios = [
    {
      ch: 'karp',
      tag: 'Инсайд',
      tagColor: '#ea580c',
      title: `💣 ИНСАЙД! «${t1}» ведет переговоры о подписании лидера из Латинской Америки`,
      content: `<b>Карп докладывает: селекционный отдел «${t1}» согласовал шорт-лист зимних трансферов.</b><br><br>
Приоритетная цель — 23-летний атакующий полузащитник из Бразилии с опытом игры в Кубке Либертадорес. Сумма трансфера оценивается в €6.5M плюс €1.5M бонусами за достижения.<br><br>
Игроку предложен долгосрочный контракт на 4 года с зарплатой около €1.8M в год. Конкуренцию россиянам составляет клуб из Мексики, но предложение «${t1}» на данный момент выгоднее по условиям.<br><br>
#Инсайд #Трансферы #${t1.replace(/\s+/g, '')} #Карп`
    },
    {
      ch: 'mutko',
      tag: 'Скандал',
      tagColor: '#dc2626',
      title: `🕵️‍♂️ Финансовый аудит: в «${t1}» раскрыли выплаты агентских комиссионных`,
      content: `<b>По нашим данным из закрытого финансового отчета лиги:</b><br><br>
«${t1}» потратил свыше 180 миллионов рублей на агентские выплаты за прошедшее трансферное окно. Руководство клуба проводит внутреннюю ревизию целесообразности данных трат.<br><br>
Один из ключевых трансферов сопровождался комиссией посредников в размере 22% от суммы сделки, что вызвало вопросы у наблюдательного совета.<br><br>
#МуткоПротив #Финансы #${t1.replace(/\s+/g, '')}`
    },
    {
      ch: 'spartak',
      tag: 'Инсайд',
      tagColor: '#dc2626',
      title: `🔴⚪ СРОЧНО: В клубе готовят заявление по графику матчей и судейству`,
      content: `<b>Красно-белые намерены поднять вопрос о беспристрастности назначений судей на собрании клубов РПЛ!</b><br><br>
В клубе недовольны, что на ключевые выездные встречи систематически назначаются арбитры с низкой оценкой инспекторов.<br><br>
<i>«Мы хотим видеть честный спорт на футбольном поле, а не цирк с миллиметровыми офсайдными линиями»</i>, — заявляют в кулуарах клуба.<br><br>
#Спартак #РПЛ #Судейство`
    },
    {
      ch: 'nobel',
      tag: 'Эксклюзив',
      tagColor: '#9333ea',
      title: `🍷 Нобель: Представители «${t1}» провели встречу в Стамбуле по трансферу`,
      content: `<b>Эксклюзив 🍷: Делегация «${t1}» встретилась с известным турецким агентом</b><br><br>
Обсуждался возможный трансфер флангового защитника. Клуб готов активировать опцию выкупа за €4.8M уже в ближайшее трансферное окно.<br><br>
Стороны сблизили позиции по личным условиям футболиста. Финальный раунд переговоров запланирован на следующую неделю.<br><br>
#Нобель #Эксклюзив #Трансферы`
    },
    {
      ch: 'dai_udarit',
      tag: 'Раздевалка',
      tagColor: '#ca8a04',
      title: `⚡ Эксклюзивные кадры: как в «${t1}» отпраздновали победу в раздевалке`,
      content: `<b>Танцы, музыка на полную громкость и обливание минералкой!</b><br><br>
Футболисты «${t1}» устроили настоящий праздник после напряженного матча. Главный тренер зашел в раздевалку и пообещал команде три выходных дня при условии сохранения победной серии.<br><br>
Атмосфера в коллективе на пике!<br><br>
#ДайУдарить #Раздевалка #${t1.replace(/\s+/g, '')}`
    }
  ];

  const pick = scenarios[Math.floor(Math.random() * scenarios.length)];
  const ch = (TELEGRAM_CHANNELS as any)[pick.ch] || TELEGRAM_CHANNELS.karp;

  return {
    id: `post_drop_${now}_${Math.random().toString(36).slice(2, 6)}`,
    channelId: ch.id,
    channelName: ch.name,
    channelHandle: ch.handle,
    avatarBg: ch.avatarBg,
    avatarIcon: ch.avatarIcon,
    tag: pick.tag as any,
    tagColor: pick.tagColor,
    title: pick.title,
    content: pick.content,
    createdAt: now,
    timeLabel: 'только что',
    views: Math.floor(6000 + Math.random() * 10000),
    forwards: Math.floor(100 + Math.random() * 300),
    reactions: { '🔥': 210, '👍': 140, '🤡': 45, '❤️': 95 },
    comments: [],
    relatedTeam: t1,
    isHot: Math.random() > 0.5
  };
}

/** Генерация уникального инсайдерского поста через Gemini 3.8 Flash */
export async function generateAIInsiderPost(
  db: any,
  options: {
    channelId?: TelegramChannel['id'];
    topic?: string;
    customPrompt?: string;
    teamName?: string;
  }
): Promise<InsiderPost> {
  const channelId = options.channelId || 'karp';
  const ch = TELEGRAM_CHANNELS[channelId] || TELEGRAM_CHANNELS.karp;
  const apiKey = process.env.GEMINI_API_KEY || '';

  // Свежий контекст команд из базы
  const teamsList = (db.teams || []).map((t: any) => t.name).slice(0, 16).join(', ');
  const recentFixtures = (db.fixtures || [])
    .filter((f: any) => f.status === 'done')
    .slice(-5)
    .map((f: any) => `${f.homeName || f.home} ${f.hg}:${f.ag} ${f.awayName || f.away}`)
    .join('; ');

  let channelStylePrompt = '';
  if (channelId === 'karp') {
    channelStylePrompt = `Ты — Иван Карпов (@karpinside), самый дерзкий и цитируемый футбольный инсайдер России. Фирменный стиль:
- Начинай с «ИНСАЙД 💣» или «Карп докладывает:»
- Используй живой, напористый журналистский язык, детали переговоров, суммы контрактов в евро/рублях, инсайды от агентов и функционеров.
- Хэштеги в конце: #Инсайд #Карп #РПЛ`;
  } else if (channelId === 'nobel') {
    channelStylePrompt = `Ты — Нобель Арустамян (@nobel_arustamyan), авторитетный футбольный журналист и инсайдер европейского уровня. Фирменный стиль:
- Начинай с «Эксклюзив 🍷» или «По моим данным из Италии/Европы...»
- Интеллигентный, взвешенный тон, глубокое знание европейского рынка, цитаты директоров и агентов.
- Хэштеги: #Нобель #Эксклюзив #Трансферы`;
  } else if (channelId === 'spartak') {
    channelStylePrompt = `Ты — автор культового телеграм-канала фанатов Спартака (@kb_spartak_show). Фирменный стиль:
- Страсть, эмоции на грани, красно-белый патриотизм, острая критика судейства («Опять засудили!», «В ЭСК подавать срочно!») или воспевание гладиаторов.
- Хэштеги: #Спартак #КрасноБелые #Судейство`;
  } else if (channelId === 'mutko') {
    channelStylePrompt = `Ты — автор расследовательского канала «Мутко против» (@mutkoproiv). Фирменный стиль:
- Документы, инсайды из кабинетов РФС на Таганке, регламенты, полиграф, зарплаты и скрытые пункты контрактов.
- Серьезный тон расследователя. Хэштеги: #МуткоПротив #РФС #Расследование`;
  } else if (channelId === 'rfs') {
    channelStylePrompt = `Ты — официальный представитель пресс-службы РФС и Экспертно-судейской комиссии (ЭСК РФС). Фирменный стиль:
- Официальный, строгий юридический стиль с упоминанием правил ИФАБ, протоколов заседаний комиссии, председателя Милорада Мажича и решений по спорным эпизодам.
- Хэштеги: #РФС #ЭСК #Судейство #Официально`;
  } else {
    channelStylePrompt = `Ты — спортивный обозреватель популярного канала «Дай ударить» (@dai_udarit). Яркие цитаты из микст-зоны, атмосфера раздевалок, стычки и эмоции.`;
  }

  const prompt = `Сгенерируй короткий, реалистичный и вирусный пост для Telegram-канала в стиле российского футбола (РПЛ).
Канал: ${ch.name} (${ch.handle}).
${channelStylePrompt}

Контекст лиги:
Команды РПЛ: ${teamsList}
Последние сыгранные матчи: ${recentFixtures || 'Идет регулярный чемпионат'}
Тема поста: ${options.customPrompt || options.topic || 'Околофутбольный инсайд, судейский скандал с обращением в ЭСК РФС или трансферный слух'}

Требования к формату:
- Заголовок (1 строка)
- Основной текст с HTML-тегами <b>для жирного шрифта</b> и <i>для цитат</i>, абзацы через тег <br><br>.
- Длина: 3-5 коротких абзацев (как в реальном Telegram-посте).
- Включи эмодзи, характерные для этого автора.
- В конце 3-5 хэштегов.

Ответь строго в формате JSON:
{
  "title": "Заголовок поста",
  "content": "Текст поста с тегами <b>, <i>, <br><br>",
  "tag": "Инсайд | Трансферы | Судейство | Скандал | ЭСК РФС | Раздевалка | Эксклюзив"
}`;

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

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const raw = (response.text || '').trim();
      const parsed = JSON.parse(raw);

      return {
        id: `post_ai_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        channelId: ch.id,
        channelName: ch.name,
        channelHandle: ch.handle,
        avatarBg: ch.avatarBg,
        avatarIcon: ch.avatarIcon,
        tag: parsed.tag || 'Инсайд',
        tagColor: ch.id === 'spartak' ? '#dc2626' : (ch.id === 'nobel' ? '#9333ea' : '#ea580c'),
        title: parsed.title,
        content: parsed.content,
        createdAt: Date.now(),
        timeLabel: 'только что',
        views: Math.floor(10000 + Math.random() * 15000),
        forwards: Math.floor(250 + Math.random() * 450),
        reactions: { '🔥': 340, '🤡': 65, '❤️': 210, '👍': 180 },
        comments: [],
        isAiGenerated: true,
        isHot: true
      };
    } catch (err) {
      console.error('Ошибка вызова Gemini для инсайда, используем качественный шаблон:', err);
    }
  }

  // Резервный качественный генератор если API ключ еще не подключен
  const fallback = generateRandomInsiderDrop(db);
  fallback.channelId = ch.id;
  fallback.channelName = ch.name;
  fallback.channelHandle = ch.handle;
  fallback.avatarBg = ch.avatarBg;
  fallback.avatarIcon = ch.avatarIcon;
  fallback.isAiGenerated = true;
  return fallback;
}

/** Генерация постов в Telegram-ленту инсайдов во время прямой трансляции жеребьёвки */
export function generateDrawInsiderPost(db: any, eventType: string, payload: any): InsiderPost | null {
  const now = Date.now();
  const id = `post_draw_${now}_${Math.random().toString(36).slice(2, 6)}`;

  if (eventType === 'draw_start') {
    const tTitle = payload?.tournament === 'media_cup'
      ? 'Кубка Медиалиги (MFL)'
      : payload?.tournament === 'cup_regions'
      ? 'FONBET Кубка России (Путь Регионов)'
      : 'FONBET Кубка России (Путь РПЛ)';

    return {
      id,
      channelId: 'rfs',
      channelName: TELEGRAM_CHANNELS.rfs.name,
      channelHandle: TELEGRAM_CHANNELS.rfs.handle,
      avatarBg: TELEGRAM_CHANNELS.rfs.avatarBg,
      avatarIcon: TELEGRAM_CHANNELS.rfs.avatarIcon,
      tag: 'Жеребьёвка',
      tagColor: '#0284c7',
      title: `🏆 ОФИЦИАЛЬНО: Стартовала жеребьёвка ${tTitle}!`,
      content: `<b>В эфире студия Останкино! Стартовала официальная церемония жеребьёвки ${tTitle}.</b><br><br>
Ведущий Роман Нагучев и звёздные гости студии (Андрей Тихонов, Герман El Classico) открывают церемонию. Лототрон заряжен шарами с названиями клубов, корзины посева утверждены техническим комитетом.<br><br>
Следите за прямым эфиром и обновлениями в режиме реального времени!<br><br>
#Жеребьёвка #КубокРоссии #МатчТВ #РФС`,
      createdAt: now,
      timeLabel: 'только что',
      views: Math.floor(22000 + Math.random() * 8000),
      forwards: Math.floor(450 + Math.random() * 250),
      reactions: { '🔥': 820, '👏': 540, '🏆': 610, '👍': 320 },
      comments: [
        { id: `c_d1`, author: 'Болельщик ЦСКА', text: 'Главное без группы смерти! Ждём соперников! 🔥', time: 'только что', likes: 24 },
        { id: `c_d2`, author: 'КБ Фанат', text: 'Верим в лёгкий жребий для красно-белых 🔴⚪', time: 'только что', likes: 18 }
      ],
      isHot: true
    };
  }

  if (eventType === 'warmup') {
    const { speaker, role, text } = payload;
    return {
      id,
      channelId: 'dai_udarit',
      channelName: TELEGRAM_CHANNELS.dai_udarit.name,
      channelHandle: TELEGRAM_CHANNELS.dai_udarit.handle,
      avatarBg: TELEGRAM_CHANNELS.dai_udarit.avatarBg,
      avatarIcon: TELEGRAM_CHANNELS.dai_udarit.avatarIcon,
      tag: 'Инсайд',
      tagColor: '#ca8a04',
      title: `🎙 Пре-шоу жеребьёвки: «${speaker}» в прямом эфире!`,
      content: `<b>Слушаем студию МАТЧ ТВ перед открытием лототрона!</b><br><br>
<b>${speaker}</b> (${role}):<br>
<i>«${text}»</i><br><br>
Напряжение в Останкино зашкаливает. Представители клубов на нервах следят за каждым движением возле чаши с шарами.<br><br>
#МатчТВ #Жеребьёвка #Инсайд`,
      createdAt: now,
      timeLabel: 'только что',
      views: Math.floor(16000 + Math.random() * 5000),
      forwards: Math.floor(220 + Math.random() * 180),
      reactions: { '🔥': 410, '🍿': 320, '👍': 190 },
      comments: [],
      isHot: false
    };
  }

  if (eventType === 'ball') {
    const { teamName, slot, commentator, guest, isDerby } = payload;

    // Для топ-клубов и дерби публикуем через Карпа или Спартак
    if (isDerby || ['Спартак', 'Зенит', 'ЦСКА', 'Динамо', 'Локомотив', 'Краснодар'].includes(teamName)) {
      const isSpartakRelated = teamName === 'Спартак' || (slot && slot.includes('Спартак'));
      const ch = isSpartakRelated ? TELEGRAM_CHANNELS.spartak : TELEGRAM_CHANNELS.karp;

      return {
        id,
        channelId: ch.id,
        channelName: ch.name,
        channelHandle: ch.handle,
        avatarBg: ch.avatarBg,
        avatarIcon: ch.avatarIcon,
        tag: isDerby ? 'Скандал' : 'Жеребьёвка',
        tagColor: isDerby ? '#dc2626' : '#ea580c',
        title: isDerby
          ? `🔥 ВНИМАНИЕ! ДЕРБИ! ${teamName} отправлен в ${slot}!`
          : `💣 ИНСАЙД ИЗ ОСТАНКИНО: ${teamName} попал в ${slot}!`,
        content: `<b>Шар с клубом «${teamName}» раскрыт в прямом эфире!</b><br><br>
📍 <b>Назначение:</b> ${slot}<br>
🎙 <b>Комментарий студии:</b> «${commentator}»<br>
${guest ? `⭐ <b>Эксперт:</b> «${guest}»<br><br>` : '<br>'}
${isDerby ? '🚨 <b>ОГНИЩЕ! В группе образовалось принципиальное дерби!</b> В руководствах клубов уже хватаются за головы — лёгкой прогулки точно не будет!<br><br>' : 'Жребий продолжает перемешивать сетку турнира. Болельщики в чатах трансляции уже считают расклады.<br><br>'}
#Жеребьёвка #${teamName.replace(/\s+/g, '')} #КубокРоссии`,
        createdAt: now,
        timeLabel: 'только что',
        views: Math.floor(28000 + Math.random() * 12000),
        forwards: Math.floor(650 + Math.random() * 400),
        reactions: isDerby ? { '🔥': 1420, '😱': 890, '🤬': 430, '🍿': 780 } : { '🔥': 540, '👏': 310, '👍': 240 },
        comments: [
          { id: `c_b1`, author: `Фанат (${teamName})`, text: `${teamName} вперёд! Всех разорвём в этой группе! 🏆`, time: 'только что', likes: 45 }
        ],
        isHot: true
      };
    }

    // Обычный шар публикуем от пресс-службы РФС
    return {
      id,
      channelId: 'rfs',
      channelName: TELEGRAM_CHANNELS.rfs.name,
      channelHandle: TELEGRAM_CHANNELS.rfs.handle,
      avatarBg: TELEGRAM_CHANNELS.rfs.avatarBg,
      avatarIcon: TELEGRAM_CHANNELS.rfs.avatarIcon,
      tag: 'Жеребьёвка',
      tagColor: '#0284c7',
      title: `🎱 Жеребьёвка: «${teamName}» распределён в ${slot}`,
      content: `<b>Официальный результат открытия шара из лототрона:</b><br><br>
Клуб <b>«${teamName}»</b> отправляется в слот: <b>${slot}</b>.<br><br>
🎙 <i>«${commentator}»</i><br>
${guest ? `⭐ <i>«${guest}»</i><br><br>` : '<br>'}
Церемония продолжается в прямом эфире.<br><br>
#Жеребьёвка #РФС #FONBETКубокРоссии`,
      createdAt: now,
      timeLabel: 'только что',
      views: Math.floor(19000 + Math.random() * 6000),
      forwards: Math.floor(210 + Math.random() * 150),
      reactions: { '👏': 380, '👍': 290, '🔥': 410 },
      comments: [],
      isHot: false
    };
  }

  if (eventType === 'finish') {
    const { tournamentName, summary } = payload;
    return {
      id,
      channelId: 'rfs',
      channelName: TELEGRAM_CHANNELS.rfs.name,
      channelHandle: TELEGRAM_CHANNELS.rfs.handle,
      avatarBg: TELEGRAM_CHANNELS.rfs.avatarBg,
      avatarIcon: TELEGRAM_CHANNELS.rfs.avatarIcon,
      tag: 'Официально',
      tagColor: '#16a34a',
      title: `🏆 ИТОГИ ЖЕРЕБЬЁВКИ «${(tournamentName || 'КУБКА').toUpperCase()}»!`,
      content: `<b>Церемония жеребьёвки турнира «${tournamentName}» успешно завершена!</b><br><br>
📋 <b>Официальные составы сформированных групп и пар:</b><br>
${(summary || '').replace(/\n/g, '<br>')}<br><br>
Официальный календарь матчей и расписание туров утверждены департаментом соревнований РФС и внесены в базу данных турнира.<br><br>
#РФС #КубокРоссии #Жеребьёвка #Официально`,
      createdAt: now,
      timeLabel: 'только что',
      views: Math.floor(35000 + Math.random() * 15000),
      forwards: Math.floor(920 + Math.random() * 600),
      reactions: { '🔥': 1850, '👏': 1420, '🏆': 1630, '❤️': 890 },
      comments: [
        { id: `c_f1`, author: 'Футбольный эксперт', text: 'Сетка получилась просто термоядерная! Ждём начала матчей! 🚀', time: 'только что', likes: 67 }
      ],
      isHot: true
    };
  }

  return null;
}
