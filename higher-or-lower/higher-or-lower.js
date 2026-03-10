/* =============================================
   HIGHER-OR-LOWER.JS
   Lógica del juego Higher or Lower
   QUIÉN COÑO FALTA
   ============================================= */

/* ── CONFIGURACIÓN ── */
const HOL_CONFIG = {
  // Archivos de datos por liga
  leagueFiles: [
    { key: 'laliga',         file: 'laliga.json',         name: 'La Liga' },
    { key: 'premier-league', file: 'premier-league.json', name: 'Premier League' },
    { key: 'serie-a',        file: 'serie-a.json',        name: 'Serie A' },
    { key: 'bundesliga',     file: 'bundesliga.json',     name: 'Bundesliga' },
    { key: 'ligue-1',        file: 'ligue-1.json',        name: 'Ligue 1' },
  ],
  dataPath: '../data/higher-or-lower/',
  storageKey: 'hol_record',

  // Categorías de comparación (preparado para expandir)
  categories: {
    mv: {
      label: 'VALOR DE MERCADO',
      format: (v) => {
        if (v == null) return '?';
        if (v >= 1000000) return `${(v / 1000000).toFixed(1).replace('.0', '')} mill. €`;
        if (v >= 1000) return `${(v / 1000).toFixed(0)} mil €`;
        return `${v} €`;
      },
      field: 'mv',
    },
    /* ── Categorías futuras (descomentar cuando quieras añadir) ──
    h: {
      label: 'ALTURA',
      format: (v) => v ? `${v} cm` : '?',
      field: 'h',
    },
    apps: {
      label: 'PARTIDOS EN CARRERA',
      format: (v) => v != null ? v.toLocaleString('es-ES') : '?',
      field: 'apps',
    },
    goals: {
      label: 'GOLES EN CARRERA',
      format: (v) => v != null ? v.toLocaleString('es-ES') : '?',
      field: 'goals',
    },
    */
  },
};

/* ── ESTADO DEL JUEGO ── */
const HOL = {
  pool: [],           // Array de jugadores [{id, ...data}]
  usedIds: new Set(), // IDs ya usados en esta partida
  leftPlayer: null,
  rightPlayer: null,
  score: 0,
  record: 0,
  currentCategory: 'mv',
  isAnimating: false,
  gameOver: false,
};

/* ── ELEMENTOS DOM ── */
let DOM = {};

function cacheDom() {
  DOM = {
    loading:        document.getElementById('hol-loading'),
    game:           document.getElementById('hol-game'),
    scoreValue:     document.getElementById('hol-score-value'),
    recordValue:    document.getElementById('hol-record-value'),
    // Left panel
    leftBg:         document.getElementById('hol-left-bg'),
    leftName:       document.getElementById('hol-left-name'),
    leftClub:       document.getElementById('hol-left-club'),
    leftStatLabel:  document.getElementById('hol-left-stat-label'),
    leftStatValue:  document.getElementById('hol-left-stat-value'),
    leftPanel:      document.getElementById('hol-left-panel'),
    // Right panel
    rightBg:        document.getElementById('hol-right-bg'),
    rightName:      document.getElementById('hol-right-name'),
    rightClub:      document.getElementById('hol-right-club'),
    rightPanel:     document.getElementById('hol-right-panel'),
    rightStatLabel: document.getElementById('hol-right-stat-label'),
    rightStatValue: document.getElementById('hol-right-stat-value'),
    rightReveal:    document.getElementById('hol-right-reveal'),
    // Choices
    btnHigher:      document.getElementById('hol-btn-higher'),
    btnEqual:       document.getElementById('hol-btn-equal'),
    btnLower:       document.getElementById('hol-btn-lower'),
    choices:        document.getElementById('hol-choices'),
    // Game over
    gameoverScreen: document.getElementById('hol-gameover'),
    goScore:        document.getElementById('hol-go-score'),
    goRecord:       document.getElementById('hol-go-record'),
    playAgainBtn:   document.getElementById('hol-play-again'),
  };
}

/* ── CARGA DE DATOS ── */
async function loadData() {
  const allPlayers = {};
  let loaded = 0;

  for (const league of HOL_CONFIG.leagueFiles) {
    try {
      const url = `${HOL_CONFIG.dataPath}${league.file}`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      for (const [id, player] of Object.entries(data)) {
        allPlayers[id] = player;
      }
      loaded++;
      console.log(`✅ [HOL] ${league.name}: ${Object.keys(data).length} jugadores`);
    } catch (e) {
      console.warn(`⚠️ [HOL] No se pudo cargar ${league.file}:`, e.message);
    }
  }

  if (loaded === 0) {
    console.log('⚠️ [HOL] No hay archivos de liga, cargando datos demo…');
    return loadDemoData();
  }

  return allPlayers;
}

/** Datos demo embebidos para testing sin archivos de liga */
function loadDemoData() {
  return {
    "28003": { n:"Lionel Messi", p:"FWD", nat:"Argentina", b:"1987", h:"170", club:"Inter Miami", img:"https://img.a.transfermarkt.technology/portrait/header/28003-1710080339.jpg", apps:1077, goals:838, mv:15000000, teams:["Inter Miami","PSG","Barcelona"] },
    "8198":  { n:"Cristiano Ronaldo", p:"FWD", nat:"Portugal", b:"1985", h:"187", club:"Al-Nassr", img:"https://img.a.transfermarkt.technology/portrait/header/8198-1694609670.jpg", apps:1000, goals:900, mv:15000000, teams:["Al-Nassr","Man Utd","Juventus","Real Madrid"] },
    "132098":{ n:"Kylian Mbappé", p:"FWD", nat:"France", b:"1998", h:"178", club:"Real Madrid", img:"https://img.a.transfermarkt.technology/portrait/header/342229-1682683695.jpg", apps:450, goals:280, mv:180000000, teams:["Real Madrid","PSG","Monaco"] },
    "418560":{ n:"Erling Haaland", p:"FWD", nat:"Norway", b:"2000", h:"194", club:"Manchester City", img:"https://img.a.transfermarkt.technology/portrait/header/418560-1695029645.jpg", apps:310, goals:260, mv:200000000, teams:["Man City","Dortmund","RB Salzburg"] },
    "371998":{ n:"Vinícius Júnior", p:"FWD", nat:"Brazil", b:"2000", h:"176", club:"Real Madrid", img:"https://img.a.transfermarkt.technology/portrait/header/371998-1694609798.jpg", apps:300, goals:100, mv:200000000, teams:["Real Madrid","Flamengo"] },
    "580195":{ n:"Jude Bellingham", p:"MID", nat:"England", b:"2003", h:"186", club:"Real Madrid", img:"https://img.a.transfermarkt.technology/portrait/header/581678-1694609746.jpg", apps:260, goals:70, mv:150000000, teams:["Real Madrid","Dortmund","Birmingham"] },
    "357565":{ n:"Pedri", p:"MID", nat:"Spain", b:"2002", h:"174", club:"FC Barcelona", img:"https://img.a.transfermarkt.technology/portrait/header/901307-1694609789.jpg", apps:200, goals:30, mv:100000000, teams:["Barcelona","Las Palmas"] },
    "401923":{ n:"Lamine Yamal", p:"FWD", nat:"Spain", b:"2007", h:"180", club:"FC Barcelona", img:"https://img.a.transfermarkt.technology/portrait/header/941tried-1694609800.jpg", apps:80, goals:15, mv:150000000, teams:["Barcelona"] },
    "148455":{ n:"Mohamed Salah", p:"FWD", nat:"Egypt", b:"1992", h:"175", club:"Liverpool FC", img:"https://img.a.transfermarkt.technology/portrait/header/148455-1694609813.jpg", apps:700, goals:340, mv:35000000, teams:["Liverpool","Roma","Chelsea","Fiorentina","Basel"] },
    "192985":{ n:"Kevin De Bruyne", p:"MID", nat:"Belgium", b:"1991", h:"181", club:"Manchester City", img:"https://img.a.transfermarkt.technology/portrait/header/88755-1694609756.jpg", apps:630, goals:130, mv:30000000, teams:["Man City","Wolfsburg","Chelsea","Genk"] },
    "177003":{ n:"Luka Modrić", p:"MID", nat:"Croatia", b:"1985", h:"172", club:"Real Madrid", img:"https://img.a.transfermarkt.technology/portrait/header/27706-1694609762.jpg", apps:750, goals:80, mv:3000000, teams:["Real Madrid","Tottenham","Dinamo Zagreb"] },
    "427850":{ n:"Bukayo Saka", p:"FWD", nat:"England", b:"2001", h:"178", club:"Arsenal FC", img:"https://img.a.transfermarkt.technology/portrait/header/433177-1694609771.jpg", apps:260, goals:70, mv:140000000, teams:["Arsenal"] },
    "203460":{ n:"Marc-André ter Stegen", p:"GK", nat:"Germany", b:"1992", h:"187", club:"FC Barcelona", img:"https://img.a.transfermarkt.technology/portrait/header/74857-1694609834.jpg", apps:550, goals:0, mv:18000000, teams:["Barcelona","Mönchengladbach"] },
    "128223":{ n:"Robert Lewandowski", p:"FWD", nat:"Poland", b:"1988", h:"185", club:"FC Barcelona", img:"https://img.a.transfermarkt.technology/portrait/header/38253-1694609815.jpg", apps:900, goals:650, mv:10000000, teams:["Barcelona","Bayern","Dortmund","Lech Poznań"] },
    "68290":  { n:"Antoine Griezmann", p:"FWD", nat:"France", b:"1991", h:"176", club:"Atlético Madrid", img:"https://img.a.transfermarkt.technology/portrait/header/125037-1694609825.jpg", apps:800, goals:310, mv:12000000, teams:["Atlético","Barcelona","Real Sociedad"] },
  };
}

/* ── INICIALIZACIÓN ── */
async function initGame() {
  cacheDom();

  // Cargar récord
  HOL.record = parseInt(localStorage.getItem(HOL_CONFIG.storageKey) || '0', 10);
  DOM.recordValue.textContent = HOL.record;

  // Cargar datos
  const rawData = await loadData();

  // Convertir a array y filtrar jugadores con mv
  HOL.pool = Object.entries(rawData)
    .filter(([, p]) => p.mv != null && p.n)
    .map(([id, p]) => ({ id, ...p }));

  console.log(`🎮 [HOL] Pool listo: ${HOL.pool.length} jugadores`);

  if (HOL.pool.length < 2) {
    alert('No hay suficientes jugadores para jugar. Añade datos a data/higher-or-lower/');
    return;
  }

  // Ocultar loading, mostrar juego
  DOM.loading.classList.add('hidden');

  // Setup botones
  DOM.btnHigher.addEventListener('click', () => handleChoice('higher'));
  DOM.btnEqual.addEventListener('click',  () => handleChoice('equal'));
  DOM.btnLower.addEventListener('click',  () => handleChoice('lower'));
  DOM.playAgainBtn.addEventListener('click', restartGame);

  // Empezar
  startNewGame();
}

/* ── LÓGICA DEL JUEGO ── */

function startNewGame() {
  HOL.score = 0;
  HOL.usedIds.clear();
  HOL.gameOver = false;
  HOL.isAnimating = false;

  DOM.scoreValue.textContent = '0';
  DOM.gameoverScreen.classList.remove('active');

  // Elegir categoría (de momento solo mv)
  HOL.currentCategory = 'mv';

  // Elegir dos jugadores iniciales
  HOL.leftPlayer  = pickRandomPlayer();
  HOL.rightPlayer = pickRandomPlayer();

  renderLeft();
  renderRight();
  enableChoices();
}

function restartGame() {
  startNewGame();
}

/** Escoge un jugador aleatorio no usado en esta partida */
function pickRandomPlayer() {
  // Si ya usamos casi todos, resetear
  if (HOL.usedIds.size >= HOL.pool.length - 2) {
    HOL.usedIds.clear();
    // Mantener solo los dos actuales
    if (HOL.leftPlayer) HOL.usedIds.add(HOL.leftPlayer.id);
    if (HOL.rightPlayer) HOL.usedIds.add(HOL.rightPlayer.id);
  }

  let player;
  let attempts = 0;
  do {
    player = HOL.pool[Math.floor(Math.random() * HOL.pool.length)];
    attempts++;
  } while (HOL.usedIds.has(player.id) && attempts < 500);

  HOL.usedIds.add(player.id);
  return player;
}

/* ── RENDER ── */

function renderLeft() {
  const p = HOL.leftPlayer;
  const cat = HOL_CONFIG.categories[HOL.currentCategory];

  // Background image
  setPlayerBg(DOM.leftBg, p);

  // Info
  DOM.leftName.textContent = p.n;
  DOM.leftClub.textContent = p.club || (p.teams && p.teams[0]) || '';
  DOM.leftStatLabel.textContent = cat.label;
  DOM.leftStatValue.textContent = cat.format(getStatValue(p));

  // Reset animations
  DOM.leftPanel.classList.remove('sliding-out', 'sliding-in', 'flash-correct', 'flash-wrong');
}

function renderRight() {
  const p = HOL.rightPlayer;
  const cat = HOL_CONFIG.categories[HOL.currentCategory];

  // Background image
  setPlayerBg(DOM.rightBg, p);

  // Info
  DOM.rightName.textContent = p.n;
  DOM.rightClub.textContent = p.club || (p.teams && p.teams[0]) || '';

  // Stat (oculto al principio)
  DOM.rightStatLabel.textContent = cat.label;
  DOM.rightStatValue.textContent = cat.format(getStatValue(p));
  DOM.rightReveal.classList.remove('visible');

  // Reset
  DOM.rightPanel.classList.remove('sliding-out', 'sliding-in', 'flash-correct', 'flash-wrong');
}

function setPlayerBg(bgEl, player) {
  if (player.img) {
    bgEl.style.backgroundImage = `url(${player.img})`;
  } else {
    // Fallback: gradiente sutil
    bgEl.style.backgroundImage = 'linear-gradient(135deg, #1a2a3a 0%, #0f1a28 100%)';
  }
}

function getStatValue(player) {
  const field = HOL_CONFIG.categories[HOL.currentCategory].field;
  const val = player[field];
  if (field === 'h' && val) return parseFloat(val);
  return val != null ? Number(val) : null;
}

/* ── MANEJO DE RESPUESTA ── */

function handleChoice(choice) {
  if (HOL.isAnimating || HOL.gameOver) return;
  HOL.isAnimating = true;

  const leftVal  = getStatValue(HOL.leftPlayer);
  const rightVal = getStatValue(HOL.rightPlayer);

  // Determinar respuesta correcta
  let correctChoice;
  if (rightVal > leftVal)      correctChoice = 'higher';
  else if (rightVal === leftVal) correctChoice = 'equal';
  else                           correctChoice = 'lower';

  const isCorrect = (choice === correctChoice);

  // Revelar stat del derecho
  DOM.rightReveal.classList.add('visible');

  // Marcar botón elegido
  const btnMap = { higher: DOM.btnHigher, equal: DOM.btnEqual, lower: DOM.btnLower };
  disableChoices();
  btnMap[choice].classList.add(isCorrect ? 'correct-pick' : 'wrong-pick');

  // Flash en el panel
  DOM.rightPanel.classList.add(isCorrect ? 'flash-correct' : 'flash-wrong');

  if (isCorrect) {
    // Actualizar puntuación
    HOL.score++;
    DOM.scoreValue.textContent = HOL.score;

    // Tras un delay, hacer la transición de cadena
    setTimeout(() => chainTransition(), 1400);
  } else {
    // Game over
    setTimeout(() => triggerGameOver(), 1600);
  }
}

/** Transición de cadena: derecho → izquierdo, nuevo → derecho */
function chainTransition() {
  // Animate out
  DOM.leftPanel.classList.add('sliding-out');
  DOM.rightPanel.classList.add('sliding-out');

  setTimeout(() => {
    // Mover derecho a izquierdo
    HOL.leftPlayer = HOL.rightPlayer;
    HOL.rightPlayer = pickRandomPlayer();

    // Render nuevos datos
    renderLeft();
    renderRight();
    enableChoices();

    // Animate in
    DOM.leftPanel.classList.add('sliding-in');
    DOM.rightPanel.classList.add('sliding-in');

    HOL.isAnimating = false;
  }, 450);
}

function triggerGameOver() {
  HOL.gameOver = true;
  HOL.isAnimating = false;

  // Actualizar récord
  let isNewRecord = false;
  if (HOL.score > HOL.record) {
    HOL.record = HOL.score;
    localStorage.setItem(HOL_CONFIG.storageKey, String(HOL.record));
    isNewRecord = true;
  }
  DOM.recordValue.textContent = HOL.record;

  // Mostrar pantalla
  DOM.goScore.textContent = HOL.score;
  if (isNewRecord) {
    DOM.goRecord.innerHTML = `<span class="new-record">🏆 ¡NUEVO RÉCORD!</span>`;
  } else {
    DOM.goRecord.innerHTML = `Tu récord: <strong>${HOL.record}</strong>`;
  }

  DOM.gameoverScreen.classList.add('active');
}

/* ── UTILIDADES DE BOTONES ── */

function enableChoices() {
  [DOM.btnHigher, DOM.btnEqual, DOM.btnLower].forEach(btn => {
    btn.classList.remove('disabled', 'correct-pick', 'wrong-pick');
    btn.disabled = false;
  });
}

function disableChoices() {
  [DOM.btnHigher, DOM.btnEqual, DOM.btnLower].forEach(btn => {
    btn.classList.add('disabled');
    btn.disabled = true;
  });
}

/* ── ARRANQUE ── */
document.addEventListener('DOMContentLoaded', initGame);
