// ESTADO DEL JUEGO
let currentMode = null;
let allMatches = [];
let currentMatchIndex = 0;
let currentMatch = null;
let currentPlayerIndex = null;
let revealedPlayers = new Set();
let currentGuess = [];
let playerAttempts = {}; // Contador de intentos por jugador
let playerGuessHistory = {}; // Historial de intentos del wordle por jugador

// Estadísticas
let stats = {
    matchesCompleted: 0,
    playersGuessed: 0,
    totalAttempts: 0,
    currentStreak: 0,
    bestStreak: 0
};

// CARGAR DATOS DESDE JSON
async function loadMatchData(mode) {
    try {
        let files = [];
        
        // Determinar qué archivos cargar según el modo
        switch(mode) {
            case 'liga':
                files = ['data/liga.json'];
                break;
            case 'champions':
                files = ['data/champions.json'];
                break;
            case 'historico':
                files = ['data/historico.json'];
                break;
            case 'random':
                files = ['data/liga.json', 'data/champions.json', 'data/historico.json'];
                break;
        }
        
        // Cargar todos los archivos
        const promises = files.map(file => 
            fetch(file)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error cargando ${file}`);
                    }
                    return response.json();
                })
        );
        
        const results = await Promise.all(promises);
        
        // Combinar todos los partidos
        allMatches = results.flat();
        
        // Mezclar siempre para que aparezcan en orden aleatorio
        allMatches = shuffleArray(allMatches);
        
        return allMatches.length > 0;
    } catch (error) {
        console.error('Error cargando datos:', error);
        alert('Error al cargar los datos. Asegúrate de que los archivos JSON estén en la carpeta /data/');
        return false;
    }
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// INICIAR JUEGO
async function startGame(mode) {
    currentMode = mode;
    document.getElementById('mode-selection').style.display = 'none';
    document.getElementById('loading').style.display = 'block';
    
    // Cargar datos desde JSON
    const loaded = await loadMatchData(mode);
    
    if (!loaded || allMatches.length === 0) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('mode-selection').style.display = 'flex';
        return;
    }
    
    currentMatchIndex = 0;
    document.getElementById('loading').style.display = 'none';
    loadMatch();
}

function loadMatch() {
    if (currentMatchIndex >= allMatches.length) {
        alert('¡Has completado todos los partidos de este modo!');
        returnHome();
        return;
    }
    
    currentMatch = allMatches[currentMatchIndex];
    revealedPlayers = new Set();
    playerAttempts = {};
    playerGuessHistory = {};
    
    // Mostrar información del partido
    document.getElementById('competition').textContent = currentMatch.competition;
    document.getElementById('home-team').textContent = currentMatch.homeTeam;
    document.getElementById('away-team').textContent = currentMatch.awayTeam;
    document.getElementById('score').textContent = currentMatch.score;
    document.getElementById('date').textContent = currentMatch.date;
    document.getElementById('playing-team').textContent = `ALINEACIÓN: ${currentMatch.playingTeam}`;
    
    // Actualizar badges si existen en el JSON
    if (currentMatch.homeBadge) {
        document.getElementById('home-badge').textContent = currentMatch.homeBadge;
    }
    if (currentMatch.awayBadge) {
        document.getElementById('away-badge').textContent = currentMatch.awayBadge;
    }
    
    renderFormation();
    updateRevealedCount();
    
    document.getElementById('game').style.display = 'block';
}

function renderFormation() {
    const formationContainer = document.getElementById('formation');
    formationContainer.innerHTML = '';
    
    const formation = currentMatch.formation;
    
    formation.forEach((line, lineIndex) => {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'line';
        
        line.forEach((player, playerIndex) => {
            const globalIndex = formation.slice(0, lineIndex).reduce((sum, l) => sum + l.length, 0) + playerIndex;
            const isRevealed = revealedPlayers.has(globalIndex);
            
            // Player card container
            const playerCard = document.createElement('div');
            playerCard.className = 'player-card';
            if (isRevealed) {
                playerCard.classList.add('revealed');
            }
            
            // Jersey
            const jersey = document.createElement('div');
            jersey.className = `jersey ${player.position === 'GK' ? 'goalkeeper' : ''}`;
            jersey.textContent = player.number || '';
            jersey.onclick = () => openGuessModal(globalIndex);
            
            // Nombre del jugador
            const nameContainer = document.createElement('div');
            nameContainer.className = 'player-name-container';
            
            if (isRevealed) {
                // Mostrar nombre revelado
                const revealedName = document.createElement('div');
                revealedName.className = 'revealed-name';
                revealedName.textContent = player.name;
                nameContainer.appendChild(revealedName);
            } else {
                // Crear guiones negros individuales
                for (let i = 0; i < player.name.length; i++) {
                    const char = player.name[i];
                    const slot = document.createElement('div');
                    
                    if (char === ' ') {
                        slot.className = 'name-slot space';
                    } else {
                        slot.className = 'name-slot';
                    }
                    
                    nameContainer.appendChild(slot);
                }
            }
            
            playerCard.appendChild(jersey);
            playerCard.appendChild(nameContainer);
            
            lineDiv.appendChild(playerCard);
        });
        
        formationContainer.appendChild(lineDiv);
    });
}

function openGuessModal(playerIndex) {
    if (revealedPlayers.has(playerIndex)) return;
    
    currentPlayerIndex = playerIndex;
    currentGuess = [];
    
    // Inicializar contador de intentos si no existe
    if (!playerAttempts[playerIndex]) {
        playerAttempts[playerIndex] = 0;
    }
    
    // Inicializar historial si no existe
    if (!playerGuessHistory[playerIndex]) {
        playerGuessHistory[playerIndex] = [];
    }
    
    const player = getPlayerByIndex(playerIndex);
    const fullName = player.name.toUpperCase(); // Nombre con espacios y tildes para visualización
    const normalizedName = normalizeText(player.name); // Nombre sin tildes para lógica
    
    // Crear grid de letras
    const guessGrid = document.getElementById('guess-grid');
    guessGrid.innerHTML = '';
    
    for (let i = 0; i < 6; i++) {
        const row = document.createElement('div');
        row.className = 'guess-row';
        
        let cellIndex = 0;
        for (let j = 0; j < fullName.length; j++) {
            const cell = document.createElement('div');
            
            if (fullName[j] === ' ') {
                // Crear celda de espacio
                cell.className = 'letter-cell space-cell';
                cell.id = `cell-${i}-${j}-space`;
            } else {
                // Crear celda normal
                cell.className = 'letter-cell';
                cell.id = `cell-${i}-${cellIndex}`;
                cellIndex++;
            }
            
            row.appendChild(cell);
        }
        
        guessGrid.appendChild(row);
    }
    
    // Restaurar intentos previos
    const history = playerGuessHistory[playerIndex];
    for (let i = 0; i < history.length; i++) {
        const attempt = history[i];
        
        // Rellenar las celdas con las letras
        for (let j = 0; j < attempt.guess.length; j++) {
            const cell = document.getElementById(`cell-${i}-${j}`);
            if (cell) {
                cell.textContent = attempt.guess[j];
                cell.classList.add(attempt.status[j]);
                cell.classList.add('flip');
            }
        }
    }
    
    // Establecer currentRow basado en el historial
    currentRow = history.length;
    
    // Resetear teclado y aplicar estado previo
    resetKeyboard();
    
    // Restaurar estado del teclado
    for (const attempt of history) {
        updateKeyboard(attempt.guess.split(''), attempt.status);
    }
    
    document.getElementById('guess-modal').classList.add('active');
}

function getPlayerByIndex(index) {
    let count = 0;
    for (const line of currentMatch.formation) {
        for (const player of line) {
            if (count === index) return player;
            count++;
        }
    }
    return null;
}

// LÓGICA DEL WORDLE
let currentRow = 0;

// Función para normalizar texto (quitar tildes)
function normalizeText(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
}

function handleKeyPress(key) {
    const player = getPlayerByIndex(currentPlayerIndex);
    const targetName = normalizeText(player.name.replace(/\s/g, ''));
    
    if (key === 'Enter') {
        if (currentGuess.length === targetName.length) {
            checkGuess();
        }
        return;
    }
    
    if (key === 'Delete') {
        if (currentGuess.length > 0) {
            currentGuess.pop();
            updateCurrentRow();
        }
        return;
    }
    
    if (currentGuess.length < targetName.length) {
        currentGuess.push(key);
        updateCurrentRow();
    }
}

function updateCurrentRow() {
    const player = getPlayerByIndex(currentPlayerIndex);
    const targetLength = normalizeText(player.name.replace(/\s/g, '')).length;
    
    for (let i = 0; i < targetLength; i++) {
        const cell = document.getElementById(`cell-${currentRow}-${i}`);
        cell.textContent = currentGuess[i] || '';
        cell.className = 'letter-cell';
    }
}

function checkGuess() {
    const player = getPlayerByIndex(currentPlayerIndex);
    const targetName = normalizeText(player.name.replace(/\s/g, ''));
    const guessWord = currentGuess.join('');
    
    if (guessWord === targetName) {
        // CORRECTO
        // Guardar el intento correcto en el historial
        const correctStatus = new Array(targetName.length).fill('correct');
        if (!playerGuessHistory[currentPlayerIndex]) {
            playerGuessHistory[currentPlayerIndex] = [];
        }
        playerGuessHistory[currentPlayerIndex].push({
            guess: guessWord,
            status: correctStatus
        });
        
        animateCorrectGuess();
        setTimeout(() => {
            revealPlayer(currentPlayerIndex);
            closeGuessModal();
            updateStats(true);
        }, 1500);
        return;
    }
    
    // Marcar letras
    const targetArray = targetName.split('');
    const guessArray = guessWord.split('');
    const letterStatus = new Array(targetName.length).fill('absent');
    const usedTargetIndices = new Set();
    
    // Primero marcar correctas
    for (let i = 0; i < guessArray.length; i++) {
        if (guessArray[i] === targetArray[i]) {
            letterStatus[i] = 'correct';
            usedTargetIndices.add(i);
        }
    }
    
    // Luego marcar presentes
    for (let i = 0; i < guessArray.length; i++) {
        if (letterStatus[i] === 'correct') continue;
        
        for (let j = 0; j < targetArray.length; j++) {
            if (usedTargetIndices.has(j)) continue;
            if (guessArray[i] === targetArray[j]) {
                letterStatus[i] = 'present';
                usedTargetIndices.add(j);
                break;
            }
        }
    }
    
    // Animar celdas
    for (let i = 0; i < guessArray.length; i++) {
        const cell = document.getElementById(`cell-${currentRow}-${i}`);
        setTimeout(() => {
            cell.classList.add('flip');
            cell.classList.add(letterStatus[i]);
        }, i * 100);
    }
    
    // Actualizar teclado
    setTimeout(() => {
        updateKeyboard(guessArray, letterStatus);
    }, guessArray.length * 100);
    
    // Guardar intento en el historial
    if (!playerGuessHistory[currentPlayerIndex]) {
        playerGuessHistory[currentPlayerIndex] = [];
    }
    playerGuessHistory[currentPlayerIndex].push({
        guess: guessWord,
        status: letterStatus
    });
    
    currentRow++;
    currentGuess = [];
    
    // Incrementar contador de intentos
    if (!playerAttempts[currentPlayerIndex]) {
        playerAttempts[currentPlayerIndex] = 0;
    }
    playerAttempts[currentPlayerIndex]++;
    
    // Si agotó los intentos
    if (currentRow >= 6) {
        setTimeout(() => {
            revealPlayer(currentPlayerIndex);
            closeGuessModal();
            updateStats(false);
        }, 1000);
    }
}

function animateCorrectGuess() {
    const player = getPlayerByIndex(currentPlayerIndex);
    const targetLength = normalizeText(player.name.replace(/\s/g, '')).length;
    
    for (let i = 0; i < targetLength; i++) {
        const cell = document.getElementById(`cell-${currentRow}-${i}`);
        setTimeout(() => {
            cell.classList.add('flip');
            cell.classList.add('correct');
        }, i * 100);
    }
    
    createConfetti();
}

function updateKeyboard(guessArray, letterStatus) {
    for (let i = 0; i < guessArray.length; i++) {
        const letter = guessArray[i];
        const status = letterStatus[i];
        const key = document.querySelector(`[data-key="${letter}"]`);
        
        if (!key) continue;
        
        if (status === 'correct') {
            key.classList.remove('present', 'absent');
            key.classList.add('correct');
        } else if (status === 'present' && !key.classList.contains('correct')) {
            key.classList.remove('absent');
            key.classList.add('present');
        } else if (status === 'absent' && !key.classList.contains('correct') && !key.classList.contains('present')) {
            key.classList.add('absent');
        }
    }
}

function resetKeyboard() {
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        key.classList.remove('correct', 'present', 'absent');
    });
    currentRow = 0;
}

function revealPlayer(playerIndex) {
    revealedPlayers.add(playerIndex);
    
    // Limpiar historial de intentos del jugador revelado
    delete playerGuessHistory[playerIndex];
    delete playerAttempts[playerIndex];
    
    renderFormation();
    updateRevealedCount();
}

function revealPlayerFromModal() {
    if (currentPlayerIndex !== null) {
        revealPlayer(currentPlayerIndex);
        closeGuessModal();
        updateStats(false);
    }
}

function updateRevealedCount() {
    const total = currentMatch.formation.reduce((sum, line) => sum + line.length, 0);
    document.getElementById('revealed-count').textContent = revealedPlayers.size;
}

function closeGuessModal() {
    document.getElementById('guess-modal').classList.remove('active');
    currentPlayerIndex = null;
}

// NAVEGACIÓN
function nextMatch() {
    if (revealedPlayers.size === 11) {
        stats.matchesCompleted++;
        saveStats();
    }
    
    currentMatchIndex++;
    loadMatch();
}

function giveUp() {
    if (confirm('¿Seguro que quieres revelar todos los jugadores?')) {
        const total = currentMatch.formation.reduce((sum, line) => sum + line.length, 0);
        for (let i = 0; i < total; i++) {
            revealedPlayers.add(i);
        }
        renderFormation();
        updateRevealedCount();
        
        stats.currentStreak = 0;
        saveStats();
    }
}

function returnHome() {
    document.getElementById('game').style.display = 'none';
    document.getElementById('mode-selection').style.display = 'flex';
    currentMode = null;
    allMatches = [];
}

// ESTADÍSTICAS
function updateStats(correct) {
    stats.totalAttempts++;
    if (correct) {
        stats.playersGuessed++;
        stats.currentStreak++;
        if (stats.currentStreak > stats.bestStreak) {
            stats.bestStreak = stats.currentStreak;
        }
    } else {
        stats.currentStreak = 0;
    }
    saveStats();
}

function loadStats() {
    const saved = localStorage.getItem('footballStats');
    if (saved) {
        stats = JSON.parse(saved);
    }
    displayStats();
}

function saveStats() {
    localStorage.setItem('footballStats', JSON.stringify(stats));
    displayStats();
}

function displayStats() {
    document.getElementById('stat-matches').textContent = stats.matchesCompleted;
    document.getElementById('stat-players').textContent = stats.playersGuessed;
    
    const successRate = stats.totalAttempts > 0 
        ? Math.round((stats.playersGuessed / stats.totalAttempts) * 100) 
        : 0;
    document.getElementById('stat-success').textContent = successRate + '%';
    
    document.getElementById('stat-streak').textContent = stats.currentStreak;
    document.getElementById('stat-best-streak').textContent = stats.bestStreak;
}

function resetStats() {
    if (confirm('¿Seguro que quieres resetear todas las estadísticas?')) {
        stats = {
            matchesCompleted: 0,
            playersGuessed: 0,
            totalAttempts: 0,
            currentStreak: 0,
            bestStreak: 0
        };
        saveStats();
    }
}

// CONFIGURACIÓN
function toggleSettings() {
    const modal = document.getElementById('settings-modal');
    modal.classList.toggle('active');
}

function toggleContrast() {
    document.body.classList.toggle('high-contrast');
    const toggle = document.getElementById('contrast-toggle');
    toggle.classList.toggle('active');
    
    const isActive = toggle.classList.contains('active');
    localStorage.setItem('highContrast', isActive);
}

function loadSettings() {
    const highContrast = localStorage.getItem('highContrast') === 'true';
    if (highContrast) {
        document.body.classList.add('high-contrast');
        document.getElementById('contrast-toggle').classList.add('active');
    }
}

// CONFETI
function createConfetti() {
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = ['#4ade80', '#fbbf24', '#4a9eff'][Math.floor(Math.random() * 3)];
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 3000);
        }, i * 30);
    }
}

// EVENT LISTENERS
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    loadSettings();
    
    // Teclado
    document.querySelectorAll('.key').forEach(key => {
        key.addEventListener('click', () => {
            const keyValue = key.getAttribute('data-key');
            handleKeyPress(keyValue);
        });
    });
    
    // Teclado físico
    document.addEventListener('keydown', (e) => {
        if (!document.getElementById('guess-modal').classList.contains('active')) return;
        
        if (e.key === 'Enter') {
            handleKeyPress('Enter');
        } else if (e.key === 'Backspace') {
            handleKeyPress('Delete');
        } else if (/^[a-zA-ZñÑ]$/.test(e.key)) {
            handleKeyPress(e.key.toUpperCase());
        }
    });
    
    // Botones
    document.getElementById('next-match-btn').addEventListener('click', nextMatch);
    document.getElementById('give-up-btn').addEventListener('click', giveUp);
    document.getElementById('home-btn').addEventListener('click', returnHome);
    document.getElementById('back-btn').addEventListener('click', closeGuessModal);
    document.getElementById('reveal-btn-modal').addEventListener('click', revealPlayerFromModal);
});
