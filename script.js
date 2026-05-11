

// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
let currentUser = null;
let isCalibrated = false;
let allUsersData = {}; // данные всех игроков



let activeGameTimers = {
    game: null,
    move: null
};


window.fullSession = window.fullSession || {
    startedAtIso: null,
    rounds: []   
};

// ОБРАБОТЧИК ЗАГРУЗКИ СТРАНИЦЫ
document.addEventListener("DOMContentLoaded", () => {
    const screens = {
        splash: document.getElementById('splash-screen'),
        auth: document.getElementById('auth-screen'),
        continue: document.getElementById('continue-screen'),
        mainMenu: document.getElementById('main-menu'),
        leaderboard: document.getElementById('leaderboard-screen'),
        game: document.getElementById('game-screen'),
        calibration: document.getElementById('calibration-screen')
    };
    const appHeader = document.getElementById('app-header');

    
    const usernameInput = document.getElementById('username-input');
    const loginBtn = document.getElementById('login-btn');

    
    const consentCheckbox = document.getElementById('consent-checkbox');
    const visionSelect = document.getElementById('vision-select');
    const declineBtn = document.getElementById('decline-btn');
   


    const continueBtn = document.getElementById('continue-btn');
    const restartBtn = document.getElementById('restart-btn');
    const changeUserBtn = document.getElementById('change-user-btn');
    const headerLogoutBtn = document.getElementById('header-logout-btn');
    const leaderboardBtn = document.getElementById('leaderboard-btn');
    const startGameCard = document.getElementById('start-game-card');
    const welcomeName = document.getElementById('welcome-name');
    const closeLeaderboardBtns = document.querySelectorAll('.window-close'); 
    const levelsBtn = document.getElementById('levels-dropdown-btn');
    const levelsContent = document.getElementById('levels-content');
    const levelButtons = document.querySelectorAll('.level-btn');

    // aйтрекинг
    const calibrationDot = document.getElementById('calibration-dot');
    const calibrationCounter = document.getElementById('calibration-counter');
    const startCalibrationCard = document.getElementById('start-calibration-card');


   
    const emergencyExitBtn = document.getElementById('emergency-exit');
    const exitToMenuBtn = document.getElementById('exit-to-menu-btn');
    const winModal = document.getElementById('win-modal');


    if (declineBtn) { 
        declineBtn.addEventListener('click', () => {
            alert("Вы отказались от участия. Эксперимент завершен. Пожалуйста, позовите следующего участника.");
            // sбрасываем форму и перезагружаем страницу 
            window.location.reload();
        });
 }




    // УПРАВЛЕНИЕ ЭКРАНАМИ
    function showScreen(screenName) {
        
        Object.values(screens).forEach(screen => screen.classList.add('hidden'));
        appHeader.classList.add('hidden');

        
        if (screens[screenName]) {
            screens[screenName].classList.remove('hidden');
        }

        
        if (screenName !== 'splash') {
            appHeader.classList.remove('hidden');
        }
    }

    // ЛОГИКА АВТОРИЗАЦИИ И МЕНЮ 
    function loadUsers() {
        allUsersData = JSON.parse(localStorage.getItem('gameUsers_FindShape')) || {};
    }

    function saveUsers() {
        localStorage.setItem('gameUsers_FindShape', JSON.stringify(allUsersData));
    }

    //function handleLogin() {
    //    const username = usernameInput.value.trim();
    //    if (!username) return alert("Пожалуйста, введите имя!");

    //    currentUser = username;
    //    localStorage.setItem('currentSessionUser', currentUser);

    //    if (allUsersData[username]) { // Если пользователь уже есть
    //        screens.continue.classList.remove('hidden'); // Показываем окно "Продолжить?"
    //        welcomeName.textContent = username;
    //    } else { // Новый пользователь
    //        allUsersData[username] = { level: 1, score: 0 };
    //        saveUsers();
    //        showScreen('mainMenu');
    //    }
    //}

    function handleLogin() {
        const username = usernameInput.value.trim();

        // проверка ввода ID 
        if (!username) return alert("Пожалуйста, введите ваш ID!");

        // проверка согласия 
        if (!consentCheckbox.checked) {
            return alert("Для участия в эксперименте необходимо дать согласие на обработку данных.Если вы не согласны, нажмите 'ОТКАЗАТЬСЯ'."); 
        }

        const visionStatus = visionSelect.value; 

        currentUser = username;
        localStorage.setItem('currentSessionUser', currentUser);

        // сохранение данные эксперимента в глобальную сессию 
        window.fullSession.participantId = currentUser;
        window.fullSession.visionCorrection = visionStatus;
        window.fullSession.consentGiven = true;

        if (allUsersData[username]) { 
            screens.continue.classList.remove('hidden');
            welcomeName.textContent = username;

            
            allUsersData[username].vision = visionStatus;
            saveUsers();
        } else { 
            allUsersData[username] = {
                level: 1,
                score: 0,
                vision: visionStatus 
            };
            saveUsers();
            showScreen('mainMenu');
        }
    }



    //function logoutUser() {
    //    currentUser = null;
    //    localStorage.removeItem('currentSessionUser');
    //    isCalibrated = false;
    //    if (window.webgazer && typeof webgazer.end === 'function') {
    //        webgazer.end();
    //    }
    //    showScreen('auth');
    //}


    
    function logoutUser() {
        
        if (window.webgazer && typeof webgazer.end === 'function') {
            webgazer.end();
        }
        
        localStorage.removeItem('currentSessionUser');
        
        window.location.reload();
    }



    

    //  АЙТРЕКИНГ
    let clicksNeeded = 10;
    function startCalibration() {
        if (typeof webgazer === 'undefined') return alert('Библиотека WebGazer не загрузилась.');
        screens.calibration.classList.remove('hidden');
        clicksNeeded = 10;
        calibrationCounter.textContent = `Осталось кликов: ${clicksNeeded}`;
        webgazer.showVideoPreview(true).begin();
    }

    calibrationDot.addEventListener('click', () => {
        clicksNeeded--;
        calibrationCounter.textContent = `Осталось кликов: ${clicksNeeded}`;
        if (clicksNeeded > 0) {
            const x = Math.floor(Math.random() * (window.innerWidth - 100)) + 50;
            const y = Math.floor(Math.random() * (window.innerHeight - 100)) + 50;
            calibrationDot.style.left = `${x}px`;
            calibrationDot.style.top = `${y}px`;
        } else {
            endCalibration();
        }
    });

    function endCalibration() {
        screens.calibration.classList.add('hidden');
        isCalibrated = true;
        webgazer.showVideoPreview(false).showPredictionPoints(true);
        alert("Калибровка завершена!");
        webgazer.setGazeListener((data, clock) => {
            if (!data) return;
            
        });
    }

   
    screens.splash.addEventListener('click', () => showScreen('auth'));
    loginBtn.addEventListener('click', handleLogin);
    usernameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleLogin(); });

    continueBtn.addEventListener('click', () => showScreen('mainMenu'));
    restartBtn.addEventListener('click', () => {
        allUsersData[currentUser] = { level: 1, score: 0 };
        saveUsers();
        showScreen('mainMenu');
    });

    changeUserBtn.addEventListener('click', logoutUser);
    headerLogoutBtn.addEventListener('click', logoutUser);

    startCalibrationCard.addEventListener('click', startCalibration);

    startGameCard.addEventListener('click', () => {
        if (!isCalibrated) return alert("Сначала нужно откалибровать айтрекер!");
        showScreen('game');
        startGame(showScreen); 
    });

    // Рейтинг
    leaderboardBtn.addEventListener('click', () => {

        loadUsers(); 

        
        const leaderboardBody = document.getElementById('leaderboard-body');
        leaderboardBody.innerHTML = '';
        const sortedPlayers = Object.values(allUsersData).sort((a, b) => b.score - a.score);
        if (sortedPlayers.length === 0) {
            leaderboardBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Пока пусто...</td></tr>';
        } else {
            sortedPlayers.forEach((player, i) => {
               
                const playerName = Object.keys(allUsersData).find(key => allUsersData[key] === player);
                leaderboardBody.innerHTML += `<tr><td>${i + 1}</td><td>${playerName}</td><td>${player.level}</td><td>${player.score}</td></tr>`;
            });
        }
        screens.leaderboard.classList.remove('hidden');
    });

    //closeLeaderboardBtns.forEach(btn => btn.addEventListener('click', (e) => {
    //    // Закрываем родительское окно, в котором находится кнопка
    //    e.target.closest('.screen-center').classList.add('hidden');


    //    //screens.leaderboard.classList.add('hidden');
    //    //screens.continue.classList.add('hidden'); // И другие модальные окна
    //}));


   
    closeLeaderboardBtns.forEach(btn => btn.addEventListener('click', (e) => {
        
        const modalWindow = e.target.closest('.screen-center');
        if (modalWindow) {
            modalWindow.classList.add('hidden');
        }
    }));





   
    emergencyExitBtn.addEventListener('click', function () {
        if (confirm('Выйти в меню?')) {
            if (activeGameTimers.game) clearInterval(activeGameTimers.game);
            if (activeGameTimers.move) clearInterval(activeGameTimers.move);
            loadUsers(); 
            showScreen('mainMenu');
        }
    });

    exitToMenuBtn.addEventListener('click', function () {
        if (activeGameTimers.game) clearInterval(activeGameTimers.game);
        if (activeGameTimers.move) clearInterval(activeGameTimers.move);
        winModal.classList.add('hidden');
        loadUsers();
        showScreen('mainMenu');
    });







    // Выпадающее меню уровней
    levelsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        levelsContent.classList.toggle('show');
    });
    window.addEventListener('click', () => {
        if (levelsContent.classList.contains('show')) {
            levelsContent.classList.remove('show');
        }
    });
    levelButtons.forEach(button => {
        button.addEventListener('click', function () {
            if (!currentUser) return alert("Сначала войдите в игру!");
            const selectedLevel = parseInt(this.getAttribute('data-level'));
            allUsersData[currentUser].level = selectedLevel;
            saveUsers();
            levelsContent.classList.remove('show');
            alert(`Уровень изменен на ${selectedLevel}. Нажмите "Играть".`);
        });
    });


    // ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ 
    loadUsers(); // загрузка данных игроков
    showScreen('splash'); 
    appHeader.classList.add('hidden');




    
    //const savedUser = localStorage.getItem('currentSessionUser');
    //if (savedUser && allUsersData[savedUser]) {
    //    currentUser = savedUser;
    //    showScreen('mainMenu');
    //} else {
    //    showScreen('splash');
    //    appHeader.classList.add('hidden');
    //}
});



function analyzeGazeLog(log, options = {}) {
    const fixationGapMs = options.fixationGapMs ?? 140;

    const targetFigureIds = new Set(
        options.targetFigureIds ??
        log
            .filter(e => e.event === 'correct_click' && e.figureId)
            .map(e => e.figureId)
    );

    const gaze = log
        .filter(e => typeof e.x === 'number' && typeof e.y === 'number' && typeof e.time === 'number')
        .sort((a, b) => a.time - b.time);

    const clicks = log.filter(e => e.event === 'correct_click' || e.event === 'incorrect_click');

    if (gaze.length === 0) {
        return {
            samples: 0,
            clicks: clicks.length,
            correctClicks: clicks.filter(e => e.event === 'correct_click').length,
            incorrectClicks: clicks.filter(e => e.event === 'incorrect_click').length,
            ttffMs: null,
            targetDwellMs: 0,
            avgTargetFixationMs: 0,
            hitRate: 0,
            uniqueFiguresViewed: 0,
            perFigure: {}
        };
    }

    const firstTime = gaze[0].time;
    const lastTime = gaze[gaze.length - 1].time;

    const fixations = [];
    let current = null;

    for (const sample of gaze) {
        const id = sample.gazedFigureId || null;

        if (
            !current ||
            current.id !== id ||
            (sample.time - current.lastTime) > fixationGapMs
        ) {
            if (current) fixations.push(current);
            current = {
                id,
                startTime: sample.time,
                lastTime: sample.time,
                samples: 1,
                color: sample.gazedFigureColor || null,
                shape: sample.gazedFigureShape || null,
                target: !!(id && targetFigureIds.has(id))
            };
        } else {
            current.lastTime = sample.time;
            current.samples += 1;
        }
    }

    if (current) fixations.push(current);

    const figureFixations = fixations.filter(f => f.id !== null);
    const targetFixations = figureFixations.filter(f => f.target);

    const dwellByFigure = {};
    for (const f of figureFixations) {
        const duration = (f.lastTime - f.startTime) + fixationGapMs;
        if (!dwellByFigure[f.id]) {
            dwellByFigure[f.id] = {
                figureId: f.id,
                color: f.color,
                shape: f.shape,
                dwellMs: 0,
                fixationCount: 0,
                isTarget: f.target
            };
        }
        dwellByFigure[f.id].dwellMs += duration;
        dwellByFigure[f.id].fixationCount += 1;
    }

    const hitSamples = gaze.filter(g => g.gazedFigureId && targetFigureIds.has(g.gazedFigureId)).length;
    const viewedFigureIds = [...new Set(gaze.map(g => g.gazedFigureId).filter(Boolean))];

    const ttffSample = targetFixations.length ? targetFixations[0] : null;
    const ttffMs = ttffSample ? (ttffSample.startTime - firstTime) : null;

    const targetDwellMs = targetFixations.reduce(
        (sum, f) => sum + ((f.lastTime - f.startTime) + fixationGapMs),
        0
    );

    const avgTargetFixationMs = targetFixations.length
        ? targetDwellMs / targetFixations.length
        : 0;

    return {
        samples: gaze.length,
        gazeStartTime: firstTime,
        gazeEndTime: lastTime,
        gazeSpanMs: lastTime - firstTime,
        clicks: clicks.length,
        correctClicks: clicks.filter(e => e.event === 'correct_click').length,
        incorrectClicks: clicks.filter(e => e.event === 'incorrect_click').length,
        ttffMs,
        targetDwellMs,
        avgTargetFixationMs,
        hitRate: gaze.length ? hitSamples / gaze.length : 0,
        targetSamples: hitSamples,
        wrongSamples: gaze.filter(g => g.gazedFigureId && !targetFigureIds.has(g.gazedFigureId)).length,
        uniqueFiguresViewed: viewedFigureIds.length,
        viewedFigureIds,
        targetFigureIds: [...targetFigureIds],
        targetFixationCount: targetFixations.length,
        wrongFixationCount: figureFixations.length - targetFixations.length,
        perFigure: Object.values(dwellByFigure).sort((a, b) => b.dwellMs - a.dwellMs)
    };


  


}











function startGame(showScreenCallback) { 

    let lastGazePosition = { x: 0, y: 0 }; 



    if (!window.fullSession.startedAtIso) {
        window.fullSession.startedAtIso = new Date().toISOString();
    }

    
    let gazeDataLog = []; // Массив для сбора всех данных о взгляде
    let gameStartTime = performance.now(); // Время начала уровня
    

    // время уровня (общая сессия уровня)
    const levelStartPerf = performance.now();

    // время текущего раунда
    let roundStartPerf = performance.now();

    //метрики
    const sessionStartPerf = performance.now();

    let firstHitMs = null;                 //  время до первого попадания
    let hitTimesMs = [];                   // времена попаданий (timeSinceStart) для расчёта интервалов
    let hitIntervalsMs = [];               // интервалы между попаданиями

    // для (3) и (4) посмотрел на цель -> ушёл, не кликнув
    let targetLookEpisode = null;          // {figureId, startPerf}
    let leftTargetWithoutClickCount = 0;   // (4)
    let leftTargetWithoutClickDurations = []; // (3)


    // временные метки для текущего раунда  
    let roundTimeStart = 0;
    let lastTargetHitTime = 0;




    function resetPetrRoundMetrics() {
        firstHitMs = null;
        hitTimesMs = [];
        hitIntervalsMs = [];

        targetLookEpisode = null;
        leftTargetWithoutClickCount = 0;
        leftTargetWithoutClickDurations = [];
    }


    // какие цели были кликнуты чтобы отличать уже удалённые
    let clickedTargetIds = new Set();

    
    // текущее время с начала раунда (мс)
    function msSinceRoundStart() {
        return performance.now() - roundStartPerf;
    }

    //  заканчиваем эпизод "смотрел на цель"
    function closeTargetEpisodeIfOpen(reason = "left") {
        if (!targetLookEpisode) return;

        const dur = performance.now() - targetLookEpisode.startPerf;

        
        leftTargetWithoutClickCount += 1;
        leftTargetWithoutClickDurations.push(dur);

        targetLookEpisode = null;
    }
   






    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    function playSound(type) {
        if (audioCtx.state === 'suspended') audioCtx.resume(); 

        var osc = audioCtx.createOscillator(); 
        var gain = audioCtx.createGain(); 

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        var now = audioCtx.currentTime;

        if (type === 'pop') {

            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        }
        else if (type === 'error') {

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.2);
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        }
        else if (type === 'win') {

            osc.type = 'square';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.setValueAtTime(600, now + 0.1);
            osc.frequency.setValueAtTime(1000, now + 0.2);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
        }
    }

    var currentUser = localStorage.getItem('currentSessionUser');
   


    var gameField = document.getElementById('game-field');
    var taskText = document.getElementById('task-text');
    var timeDisplay = document.getElementById('time-display');
    var scoreDisplay = document.getElementById('score-display');
    var roundDisplay = document.getElementById('round-display');
    var levelMessage = document.getElementById('level-message');
    var playerNameDisplay = document.getElementById('player-name-display');
    var emergencyExitBtn = document.getElementById('emergency-exit');
    var winModal = document.getElementById('win-modal');
    var finalScoreSpan = document.getElementById('final-score');
    var nextLevelBtn = document.getElementById('next-level-btn');
    var exitToMenuBtn = document.getElementById('exit-to-menu-btn');
    var winTitle = document.querySelector('.window-title');
    const finishGameBtn = document.getElementById('finish-game-btn');

    var gameColors = {
        'fuchsia': '#FF00FF',
        'pastelBlue': '#34e5f6',
        'turquoise': '#63FFCF',
        'pastelGreen': '#77DD77',
        'pastelYellow': '#FDFD96'
    };

    var colorNames = {
        'fuchsia': 'РОЗОВЫЙ',
        'pastelBlue': 'ГОЛУБОЙ',
        'turquoise': 'БИРЮЗОВЫЙ',
        'pastelGreen': 'ЗЕЛЕНЫЙ',
        'pastelYellow': 'ЖЕЛТЫЙ'
    };

    var shapeNames = {
        'square': 'КВАДРАТ',
        'circle': 'КРУГ',
        'triangle': 'ТРЕУГОЛЬН',
        'rectangle': 'ПРЯМОУГОЛЬН'
    };

    let currentlyHighlighted = null; 


    



    if (finishGameBtn) {
        finishGameBtn.addEventListener('click', () => {
           
            alert("Результаты сохранены. Система будет перезагружена для следующего участника.");

          
            window.location.reload();
        });
    }




    
    if (window.webgazer && isCalibrated) {
        webgazer.setGazeListener(function (data, elapsedTime) {
            if (!data) return;


           
            lastGazePosition = { x: data.x, y: data.y };

            const elementUnderGaze = document.elementFromPoint(data.x, data.y);
            if (!elementUnderGaze) return;

           




           
            const figureUnderGaze = document.elementFromPoint(data.x, data.y)?.closest('.game-figure');

           
            if (figureUnderGaze && figureUnderGaze !== currentlyHighlighted) {
                
                if (currentlyHighlighted) {
                    currentlyHighlighted.style.boxShadow = '';
                }
               
                figureUnderGaze.style.boxShadow = '0 0 20px 10px yellow';
                currentlyHighlighted = figureUnderGaze;
            }
            
            else if (!figureUnderGaze && currentlyHighlighted) {
                currentlyHighlighted.style.boxShadow = '';
                currentlyHighlighted = null;
            }
            


            // Находим, на какой фигуре сейчас взгляд
            const allFigures = document.querySelectorAll('.game-figure');
            let gazedFigure = null;
            for (const figure of allFigures) {
                const rect = figure.getBoundingClientRect();
                if (data.x >= rect.left && data.x <= rect.right && data.y >= rect.top && data.y <= rect.bottom) {
                    gazedFigure = figure;
                    break;
                }
            }



            // (3)(4) Наведение взглядом на цель и уход с цели =====
            if (gameActive) {
                const fig = gazedFigure; 
                const isTargetNow = fig ? isFigureCorrect(fig) : false;

                if (isTargetNow) {
                    
                    if (!targetLookEpisode || targetLookEpisode.figureId !== fig.id) {
                        
                        if (targetLookEpisode) closeTargetEpisodeIfOpen("switch_target");

                        targetLookEpisode = {
                            figureId: fig.id,
                            startPerf: performance.now()
                        };
                    }
                } else {
                   
                    if (targetLookEpisode) {
                        closeTargetEpisodeIfOpen("left_target");
                    }
                }
            }
           







           
            gazeDataLog.push({
                x: Math.round(data.x),
                y: Math.round(data.y),
                time: Math.round(elapsedTime),
                gazedFigureId: gazedFigure ? gazedFigure.id : null,
                gazedFigureColor: gazedFigure ? gazedFigure.dataset.color : null,
                gazedFigureShape: gazedFigure ? gazedFigure.dataset.shape : null
            });
        });
    }
   





    
    var savedUsers = JSON.parse(localStorage.getItem('gameUsers_FindShape')) || {};
    if (!savedUsers[currentUser]) savedUsers[currentUser] = { level: 1, score: 0 };

    var currentScore = savedUsers[currentUser].score;
    var currentLevel = savedUsers[currentUser].level;

    if (currentLevel > 3) currentLevel = 3;//11:39

    var gameTimer = null;
    var moveTimer = null;
    var timeLeft = 0;
    var currentRound = 1;
    var maxRounds = 4;
    const ROUND_TIME_SECONDS = 70;//19.04

    var targetColorKey = '';
    var targetShapeKey = '';
    var currentTaskMode = 'color';

    var remainingTargets = 0;
    var gameActive = false;
    var placedFigures = [];
    var activeFiguresElements = [];// Массив для хранения ссылок на движущиеся фигуры

    
    //var draggedFigure = null;
    //var collectionContainer = null;// Переменная для панели с коллекцией (для уровня 3)  

    playerNameDisplay.textContent = currentUser + " (Ур. " + currentLevel + ")";
    scoreDisplay.textContent = currentScore;


    
    




    // СТАРТ
    startRound();
    

    function startRound() {
        gameActive = true;


        gameStartTime = performance.now();////

        roundStartPerf = performance.now();


        roundTimeStart = performance.now(); // Фиксируем время старта раунда
        lastTargetHitTime = performance.now(); // Инициализируем время для первого интервала



        resetPetrRoundMetrics();   


        
        targetLookEpisode = null;



        levelMessage.style.display = 'none';
        gameField.innerHTML = '';
        placedFigures = [];
        activeFiguresElements = [];
       /* draggedFigure = null;*/  
        collectionContainer = null;

        if (moveTimer) clearInterval(moveTimer);

        //timeLeft = 80 - (currentRound * 10);
        //timeDisplay.textContent = timeLeft;
        timeLeft = ROUND_TIME_SECONDS;
        timeDisplay.textContent = timeLeft;



        roundDisplay.textContent = currentRound;

        var colorKeys = Object.keys(gameColors); 
        var shapeKeys = Object.keys(shapeNames);
        targetColorKey = '';
        targetShapeKey = '';


       
       


        // раунды
        if (currentLevel === 1 || currentLevel === 3) {
            if (currentRound === 1) {
                currentTaskMode = 'color';
                targetColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
                taskText.textContent = 'НАЙДИ ЦВЕТ: ' + colorNames[targetColorKey];
                taskText.style.color = gameColors[targetColorKey];
            } else if (currentRound === 2) {
                currentTaskMode = 'color';
                targetColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
                taskText.textContent = 'НАЙДИ ЦВЕТ: ' + colorNames[targetColorKey] + ' !КЛИКАЙ ДВА РАЗА!';
                taskText.style.color = 'red';
            } else if (currentRound === 3) {
                currentTaskMode = 'shape';
                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
                taskText.textContent = 'НАЙДИ ФОРМУ: ' + shapeNames[targetShapeKey];
                taskText.style.color = 'red';
            } else {
                currentTaskMode = 'both';
                targetColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
                taskText.textContent = 'НАЙДИ: ' + colorNames[targetColorKey] + ' ' + shapeNames[targetShapeKey];
                taskText.style.color = 'red';
            }
        }
        else if (currentLevel === 2 ) {
            if (currentRound === 1 || currentRound === 2) {
                currentTaskMode = 'color';
                targetColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
                /* targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];*/
                taskText.textContent = 'НАЙДИ: ' + colorNames[targetColorKey] + ' ' + 'ЦВЕТ';
                taskText.style.color = gameColors[targetColorKey];
            } else if (currentRound === 3) {
                currentTaskMode = 'shape';
                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];

                taskText.textContent = 'ЖМИ БУКВЫ ДЛЯ ФОРМЫ: ' + shapeNames[targetShapeKey] + ' ' + '(НЕ ВЕРЬ НАДПИСЯМ)';
                taskText.style.color = 'red';

            } else {
                currentTaskMode = 'shape';
                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
                taskText.textContent = 'ЛОВИ ФОРМУ: ' + shapeNames[targetShapeKey];
                taskText.style.color = 'red';
            }
        }
       
      


        taskText.style.textShadow = "1px 1px 0 #000";

        var totalFigures = 20 + (currentRound * 5);
        if (currentLevel === 3) totalFigures = 20;

        remainingTargets = 0;//счетчик целей

        for (var i = 0; i < totalFigures; i++) {
            createFigure(colorKeys, shapeKeys);
        }

        //if (currentLevel === 3 && currentRound === 4) {
        //    setTimeout(revealMemoryTarget, 300);
        //}///////////


        if (remainingTargets === 0) {
            createFigure(colorKeys, shapeKeys, true);
        }

        //if (gameTimer) clearInterval(gameTimer);
        //gameTimer = setInterval(function () {
        //    timeLeft--;
        //    timeDisplay.textContent = timeLeft;
        //    if (timeLeft <= 0) {
        //        endGameLoss();
        //    }
        //}, 1000);

        if (activeGameTimers.game) clearInterval(activeGameTimers.game); 
        activeGameTimers.game = setInterval(function () { 
            timeLeft--;
            timeDisplay.textContent = timeLeft;
            if (timeLeft <= 0) {
                endGameLoss();
            }
        }, 1000);


        //(currentLevel === 2 && (currentRound === 2 || currentRound === 4)) ||
        //    (currentLevel === 3 && currentRound === 4)  


        if ((currentLevel === 2 ) &&
            (currentRound === 2 || currentRound === 4)) {
            startMovementLoop();
        }
    }

    function createFigure(colorKeys, shapeKeys, forceTarget) {
        if (forceTarget === undefined) forceTarget = false;
        //if (currentLevel === 3) {
        //    figure.setAttribute('draggable', 'false');
        //    figure.draggable = false;
        //}


        var figure = document.createElement('div');

       
        figure.id = 'figure-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
       


        figure.className = 'game-figure'; 

        figure.classList.add('game-figure');
        var randomShape = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
        var randomColor = colorKeys[Math.floor(Math.random() * colorKeys.length)];

        var thisShape = randomShape;
        var thisColor = randomColor;

        if (forceTarget) {
            if (currentTaskMode === 'color') thisColor = targetColorKey;
            if (currentTaskMode === 'shape') thisShape = targetShapeKey;
            if (currentTaskMode === 'both') {
                thisColor = targetColorKey;
                thisShape = targetShapeKey;
            }
        }

        // Проверка цели
        var isTarget = false;
        if (currentTaskMode === 'color' && thisColor === targetColorKey) isTarget = true;
        else if (currentTaskMode === 'shape' && thisShape === targetShapeKey) isTarget = true;
        else if (currentTaskMode === 'both' && thisColor === targetColorKey && thisShape === targetShapeKey) isTarget = true;

        if (isTarget) remainingTargets++;

        var size = Math.floor(Math.random() * 50) + 40;
        var x, y;
        var overlap = false;// Флаг наложения
        var attempts = 0;//счетчик попыток

        var minX = 0;
        var maxX = gameField.clientWidth - size;
        //чтоб не вылезала на 3 
        //if (currentLevel === 3) {  11:41

        //    minX = (gameField.clientWidth * 0.20) + 30;
        //    maxX = (gameField.clientWidth * 0.80) - size - 30;
        //}

        do {
            overlap = false;
            x = Math.floor(Math.random() * (maxX - minX)) + minX;//случ координаты
            y = Math.floor(Math.random() * (gameField.clientHeight - size));
            var margin = 5;//отсуп между фигурами

            for (var k = 0; k < placedFigures.length; k++) {
                var existing = placedFigures[k];
                if (x < existing.x + existing.size + margin &&
                    x + size + margin > existing.x &&
                    y < existing.y + existing.size + margin &&
                    y + size + margin > existing.y) {
                    overlap = true;
                    break;
                }
            }
            attempts++;
        } while (overlap && attempts < 100);

        if (overlap && !isTarget) return;

        placedFigures.push({ x: x, y: y, size: (thisShape === 'rectangle' ? size * 1.5 : size) });

        figure.style.position = 'absolute';
        figure.style.left = x + 'px';
        figure.style.top = y + 'px';
        figure.style.width = size + 'px';
        figure.style.height = size + 'px';
        figure.style.backgroundColor = gameColors[thisColor];

        if (currentLevel === 2 || currentLevel === 3) {  
            figure.style.cursor = 'pointer';
        }
           

        figure.style.transition = 'transform 0.1s';
        figure.style.zIndex = '10';
        figure.style.display = 'flex';
        figure.style.justifyContent = 'center';
        figure.style.alignItems = 'center';
        figure.style.textAlign = 'center';
        if (thisShape === 'rectangle') {
            figure.style.fontSize = (size / 10) + 'px';
        } else if (thisShape === 'circle' || thisShape === 'square') {
            figure.style.fontSize = (size / 8) + 'px';
        }

        /* figure.style.fontSize = '10px';*/
        figure.style.fontWeight = 'bold';
        figure.style.fontFamily = 'Press Start 2P, sans-serif';

        figure.dataset.color = thisColor;
        figure.dataset.shape = thisShape;

        //if (currentLevel === 2) {
        //    var textContent = '';
        //    var textColor = 'navy';
        //    if (currentRound === 1 || currentRound === 2) {
        //        textContent = shapeNames[thisShape];
        //        /*textColor = (thisColor === 'fuchsia' || thisColor === 'pastelGreen') ? 'white' : 'navy';*/
        //    } else {
        //        var confusingKeys = shapeKeys.filter(function (k) { return k !== thisShape; });
        //        var randomWrongKey = confusingKeys[Math.floor(Math.random() * confusingKeys.length)];
        //        textContent = shapeNames[randomWrongKey];
        //        textColor = 'navy';
        //        figure.style.textShadow = '1px 1px 1px white';
        //    }
        //    figure.innerText = textContent;
        //    figure.style.color = textColor;
        //}


        if (currentLevel === 2 ) { 
            var textContent = '';
            var textColor = 'black';
            var keyboardKey = ''; // переменная для буквы

            if (currentRound === 1 || currentRound === 2) {
                textContent = shapeNames[thisShape];
                textColor = (thisColor === 'fuchsia' || thisColor === 'pastelGreen') ? 'white' : 'navy';
            } else if (currentRound === 3) {

                var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
                keyboardKey = alphabet[Math.floor(Math.random() * alphabet.length)];


                figure.dataset.key = keyboardKey;
                var confusingKeys = shapeKeys.filter(function (k) { return k !== thisShape; });
                var randomWrongKey = confusingKeys[Math.floor(Math.random() * confusingKeys.length)];
                textContent = shapeNames[randomWrongKey];

                textColor = 'navy';
                figure.style.textShadow = '1px 1px 1px white';
            } else {

                var confusingKeys = shapeKeys.filter(function (k) { return k !== thisShape; });
                var randomWrongKey = confusingKeys[Math.floor(Math.random() * confusingKeys.length)];
                textContent = shapeNames[randomWrongKey];
                textColor = 'navy';
                figure.style.textShadow = '1px 1px 1px white';
            }


            figure.style.color = textColor;


            if (currentRound === 3) {

                figure.style.flexDirection = 'column';
                figure.style.lineHeight = '1.1';
                figure.innerHTML = '<span style="color: red; font-size: 1.2em; border: 1px solid red; border-radius: 3px; padding: 0 2px; background: white;">' + keyboardKey + '</span><br>' + textContent;
            } else {
                figure.innerText = textContent;
            }
        }


        //(currentLevel === 2 && (currentRound === 2 || currentRound === 4)) ||
        //    (currentLevel === 3 && currentRound === 4) 

        if ((currentLevel === 2 ) &&
            (currentRound === 2 || currentRound === 4)) {

            figure.dx = (Math.random() - 0.5) * 4;//смещение в джвижении
            figure.dy = (Math.random() - 0.5) * 4;
            activeFiguresElements.push(figure);
        }

        //if (currentLevel === 3 && currentRound === 3) {
        //    figure.classList.add('blinking-figure');
        //    figure.style.animationDelay = (Math.random() * 2) + 's';//чтоб не все одновременно
        //} 19.04

        // форма
        if (thisShape === 'circle') {
            figure.style.borderRadius = '50%';
        } else if (thisShape === 'triangle') {
            figure.style.backgroundColor = 'transparent';
            figure.style.width = '0';
            figure.style.height = '0';
            figure.style.borderLeft = (size / 2) + 'px solid transparent';
            figure.style.borderRight = (size / 2) + 'px solid transparent';
            figure.style.borderBottom = size + 'px solid ' + gameColors[thisColor];


            if (currentLevel === 2 ) { 
                var span = document.createElement('span');
                if (currentRound === 3) {
                    span.innerHTML = figure.innerHTML;
                    figure.innerHTML = '';

                    span.style.top = (size * 0.5) + 'px';

                    span.style.lineHeight = '1';
                } else {

                    span.innerText = textContent;
                    span.style.top = (size * 0.65) + 'px';
                }
                span.style.color = figure.style.color;
                span.style.textShadow = figure.style.textShadow;
                span.style.position = 'absolute';


                span.style.width = (size * 2) + 'px';
                span.style.left = (-size) + 'px';

                span.style.textAlign = 'center';

                span.style.fontSize = (size / 11) + 'px';
                figure.innerText = '';
                figure.appendChild(span);
            }
        } else if (thisShape === 'rectangle') {
            figure.style.width = (size * 1.5) + 'px';
        }

        //наложения фигур
        figure.addEventListener('mouseenter', function () {
            figure.style.zIndex = '100';
            figure.style.transform = 'scale(1.1)';
        });
        figure.addEventListener('mouseleave', function () {
            figure.style.zIndex = '10';
            figure.style.transform = 'scale(1)';
        });

       
        if (currentLevel === 1 || currentLevel === 2 || currentLevel === 3) {

            // ЛОГИКА КЛИКА (УРОВНИ 1 и 2) ---

            // СПЕЦИАЛЬНЫЙ СЛУЧАЙ: 1 УРОВЕНЬ 2 РАУНД - ДВОЙНОЙ КЛИК ---
            if ((currentLevel === 1 ||currentLevel === 3 )&& currentRound === 2) {

                // Двойной клик - засчитываем
                figure.addEventListener('dblclick', function (e) {
                    if (!gameActive) return;
                    e.stopPropagation();
                    if (isFigureCorrect(figure)) {
                        handleCorrect(figure);
                    } else {
                        handleIncorrect();
                    }
                });

                // Одиночный клик - подсказка
                figure.addEventListener('click', function (e) {
                    e.stopPropagation();
                    
                    figure.style.transform = 'rotate(10deg)';
                    setTimeout(function () { figure.style.transform = 'rotate(-10deg)'; }, 100);
                    setTimeout(function () { figure.style.transform = 'rotate(0deg)'; }, 200);
                });

            }

            else {
                figure.addEventListener('click', function (e) {
                    if (!gameActive) return;
                    e.stopPropagation();//остановка всплытия события

                    if ((currentLevel === 2 ) && currentRound === 3) { 

                        figure.style.transform = 'translateX(5px)';
                        setTimeout(function () { figure.style.transform = 'translateX(0)'; }, 100);
                        return;
                    }
                    if (isFigureCorrect(figure)) {
                        handleCorrect(figure);
                    } else {
                        handleIncorrect();
                    }
                });
            }
            //figure.addEventListener('click', function (e) {
            //    if (!gameActive) return;
            //    e.stopPropagation();//остановка всплытия события

            //    if (currentLevel === 2 && currentRound === 3) {

            //        figure.style.transform = 'translateX(5px)';
            //        setTimeout(function () { figure.style.transform = 'translateX(0)'; }, 100);
            //        return; 
            //    }
            //    if (isFigureCorrect(figure)) {
            //        handleCorrect(figure);
            //    } else {
            //        handleIncorrect();
            //    }
            //});
        }

        gameField.appendChild(figure);
    }

    function isFigureCorrect(figureElement) {
        var clickedColor = figureElement.dataset.color;
        var clickedShape = figureElement.dataset.shape;

        if (currentTaskMode === 'color' && clickedColor === targetColorKey) return true;
        if (currentTaskMode === 'shape' && clickedShape === targetShapeKey) return true;
        if (currentTaskMode === 'both' && clickedColor === targetColorKey && clickedShape === targetShapeKey) return true;

        return false;
    }

    //трофеи
    function addToCollection(figureElement) {
        if (!collectionContainer) return;

        var mini = figureElement.cloneNode(true);//кллон
        var shape = mini.dataset.shape;
        var colorCode = gameColors[mini.dataset.color];

        mini.style = '';
        mini.className = 'mini-figure';
        //mini.classList.remove('blinking-figure', 'dragging');
        //mini.removeAttribute('draggable');  19.04

        if (shape === 'triangle') {
            mini.style.width = '0';
            mini.style.height = '0';
            mini.style.backgroundColor = 'transparent';
            mini.style.borderLeft = '10px solid transparent';
            mini.style.borderRight = '10px solid transparent';
            mini.style.borderBottom = '20px solid ' + colorCode;
            mini.style.margin = '5px';
        }
        else if (shape === 'rectangle') {
            mini.style.width = '35px';
            mini.style.height = '20px';
            mini.style.backgroundColor = colorCode;
            mini.style.margin = '5px';
        }
        else {
            mini.style.width = '25px';
            mini.style.height = '25px';
            mini.style.backgroundColor = colorCode;
            mini.style.margin = '5px';
            if (shape === 'circle') mini.style.borderRadius = '50%';
        }

        collectionContainer.appendChild(mini);
    }

    function handleCorrect(figureElement) {
        playSound('pop'); // Добавить в начало функции

        
        const timeToSuccess = performance.now() - gameStartTime;
        console.log(`Успешный клик! Время до клика: ${timeToSuccess.toFixed(0)} мс.`);
        gazeDataLog.push({
            event: 'correct_click',
            figureId: figureElement.id,
            timeSinceStart: timeToSuccess
        });


        // Внутри функции клика по фигуре:
        const now = performance.now();
        const timeSinceLastHit = (now - lastTargetHitTime) / 1000; // Секунд с прошлого клика
        const timeFromStart = (now - roundTimeStart) / 1000; // Секунд от начала раунда

        // Если это была ПЕРВАЯ фигура в раунде
        let currentRound = window.fullSession.rounds[window.fullSession.rounds.length - 1];

        if (currentRound) {
            if (!currentRound.firstHitTime) {
                currentRound.firstHitTime = timeFromStart; // Время до первой цели
            }
            // Добавляем интервал между целями в массив
            if (!currentRound.intervals) currentRound.intervals = [];
            currentRound.intervals.push(timeSinceLastHit.toFixed(3));
        }

        lastTargetHitTime = now; // Сбрасываем для следующей фигуры






        // ===== (1)(2) попадания по целям =====
        const hitMs = msSinceRoundStart();
        if (firstHitMs === null) firstHitMs = hitMs;

        hitTimesMs.push(hitMs);
        if (hitTimesMs.length >= 2) {
            const n = hitTimesMs.length;
            hitIntervalsMs.push(hitTimesMs[n - 1] - hitTimesMs[n - 2]);
        }
        

        // отметим цель как кликнутую
        clickedTargetIds.add(figureElement.id);

        // если прямо сейчас открыт эпизод взгляда на эту же цель,
        // то это НЕ "ушёл без клика", поэтому отменим последнее добавление
        if (targetLookEpisode && targetLookEpisode.figureId === figureElement.id) {
            // эпизод закончился кликом -> не считаем как "ушёл"
            // поэтому откатываем то, что closeTargetEpisodeIfOpen мог бы записать
            // Просто закрываем эпизод без увеличения счётчиков:
            targetLookEpisode = null;

            // Важно: мы НЕ увеличиваем leftTargetWithoutClickCount здесь
        }



        currentScore += 10;
        scoreDisplay.textContent = currentScore;
        remainingTargets--;

        //// ищем индекс фигуры в массиве движущихся фигур
        var idx = activeFiguresElements.indexOf(figureElement);
        if (idx > -1) activeFiguresElements.splice(idx, 1);

        //if (currentLevel === 3) {
        //    addToCollection(figureElement);
        //}  19.04

        figureElement.style.transform = 'scale(0)';
        setTimeout(function () {
            figureElement.remove();
        }, 100);

        saveProgress();

        if (remainingTargets <= 0) {
            handleRoundWin();
        }

    }

    function handleIncorrect() {
        playSound('error');

        
        const timeToFailure = performance.now() - gameStartTime;
        console.log(`Ошибочный клик! Время до клика: ${timeToFailure.toFixed(0)} мс.`);
        gazeDataLog.push({
            event: 'incorrect_click',
            timeSinceStart: timeToFailure
        });




        currentScore -= 5;
        if (currentScore < 0) currentScore = 0;
        scoreDisplay.textContent = currentScore;
        saveProgress();
        timeDisplay.style.color = 'red';
        setTimeout(function () { timeDisplay.style.color = 'navy'; }, 300);

    }

    //function setupDropZoneEvents(zone) {   19.04
    //    zone.addEventListener('dragover', function (e) {
    //        e.preventDefault();//убираем стандратное поеведегине браузера

    //        if (draggedFigure) {
    //            if (isFigureCorrect(draggedFigure)) {
    //                zone.classList.remove('invalid-hover');
    //                zone.classList.add('valid-hover');
    //                zone.innerHTML = 'БРОСАЙ!';
    //            } else {
    //                zone.classList.remove('valid-hover');
    //                zone.classList.add('invalid-hover');
    //                zone.innerHTML = 'НЕ ТА<br>ФИГУРА';
    //            }
    //        }
    //    });

    //    zone.addEventListener('dragleave', function () {
    //        zone.classList.remove('valid-hover');
    //        zone.classList.remove('invalid-hover');
    //        zone.innerHTML = 'ПЕРЕТАЩИ<br>СЮДА<br>▼';
    //    });

    //    zone.addEventListener('drop', function (e) {
    //        e.preventDefault();
    //        zone.classList.remove('valid-hover');
    //        zone.classList.remove('invalid-hover');
    //        zone.innerHTML = 'ПЕРЕТАЩИ<br>СЮДА<br>▼';

    //        if (draggedFigure) {
    //            if (isFigureCorrect(draggedFigure)) {
    //                handleCorrect(draggedFigure);
    //            } else {
    //                handleIncorrect();
    //            }
    //            draggedFigure = null;
    //        }
    //    });
    //}

    //каждые 20 милоисекунд меняют координаты
    function startMovementLoop() {
        activeGameTimers.move = setInterval(function () {
            if (!gameActive) return;

            var w = gameField.clientWidth;
            var h = gameField.clientHeight;

            // Строгие границы с учетом панелей (20% слева и справа)
            var minX = 0;
            var maxX = w;

            if (currentLevel === 3) {
                minX = (w * 0.20) + 5;
                maxX = (w * 0.80) - 5;
            }

            for (var i = 0; i < activeFiguresElements.length; i++) {
                var fig = activeFiguresElements[i];
                //if (fig.classList.contains('dragging')) continue;//если тащим не двигаем  19.04

                var currentX = parseFloat(fig.style.left);
                var currentY = parseFloat(fig.style.top);
                var figW = parseFloat(fig.style.width);
                var figH = parseFloat(fig.style.height);

                if (fig.style.height === '0px') {
                    figH = parseFloat(fig.style.borderBottomWidth);
                    figW = parseFloat(fig.style.borderLeftWidth) * 2;
                }

                currentX += fig.dx;// сдвигаем фигуру по осям X и Y
                currentY += fig.dy;

                // проверка границ как двд
                if (currentX <= minX || currentX + figW >= maxX) {
                    fig.dx = -fig.dx;//отскок
                    if (currentX <= minX) currentX = minX;
                    if (currentX + figW >= maxX) currentX = maxX - figW;
                }

                if (currentY <= 0 || currentY + figH >= h) {
                    fig.dy = -fig.dy;
                    if (currentY <= 0) currentY = 0;
                    if (currentY + figH >= h) currentY = h - figH;
                }

                fig.style.left = currentX + 'px';
                fig.style.top = currentY + 'px';
            }
        }, 20);
    }

    function handleRoundWin() {
        playSound('win');
        if (activeGameTimers.move) clearInterval(activeGameTimers.move);
        if (activeGameTimers.game) clearInterval(activeGameTimers.game);
        /*clearInterval(gameTimer);*/
        gameActive = false;


        // время раунда (мс)
        const roundDurationMs = Math.round(performance.now() - roundStartPerf);

         //соберём запись раунда (12 штук)
        const roundRecord = {
            user: currentUser,
            level: currentLevel,
            round: currentRound,
            roundDurationMs: roundDurationMs,

            
            timeToFirstHitMs: firstHitMs ? Math.round(firstHitMs) : null,
            hitIntervalsMs,              
            avgHitIntervalMs: hitIntervalsMs.length
                ? Math.round(hitIntervalsMs.reduce((a, b) => a + b, 0) / hitIntervalsMs.length)
                : null,
            hoverNoClickCount: leftTargetWithoutClickCount
           
           
        };


       


        // сохраняем в общий массив
        window.fullSession.rounds.push(roundRecord);

       
        gazeDataLog.push({ event: "round_record", ...roundRecord });

        console.log("ROUND RECORD:", roundRecord);




        if (currentRound < maxRounds) {
            levelMessage.textContent = 'РАУНД ' + currentRound + ' ПРОЙДЕН!';
            levelMessage.style.display = 'block';

            setTimeout(function () {
                currentRound++;
                startRound();
            }, 2000);
        } else {
            finishLevel();
        }
    }



    document.addEventListener('keydown', function (e) {
        if (gameActive && (currentLevel === 2 ) && currentRound === 3) { //19.04 2:18

            var pressedKey = e.key.toUpperCase();
            var allFigures = document.querySelectorAll('.game-figure');

            var correctFigureFound = null;
            var wrongFigureFound = null;


            for (var i = 0; i < allFigures.length; i++) {
                var fig = allFigures[i];


                if (fig.classList.contains('caught')) continue;


                if (fig.dataset.key === pressedKey) {


                    if (isFigureCorrect(fig)) {
                        correctFigureFound = fig;
                        break;
                    } else {

                        wrongFigureFound = fig;
                    }
                }
            }


            if (correctFigureFound) {

                handleCorrect(correctFigureFound);
            } else if (wrongFigureFound) {

                handleIncorrect();
            }

        }
    });

    


    function finishLevel() {
        var isLevelUp = (currentLevel < 3);
        saveProgress(isLevelUp);

        finalScoreSpan.textContent = currentScore;

        // расчет метрик
        if (targetLookEpisode) closeTargetEpisodeIfOpen("level_end");

        const sessionDurationMs = performance.now() - sessionStartPerf;
        const totalRoundTime = (sessionDurationMs / 1000).toFixed(3); //////

        // Берем все интервалы + время до первой фигуры и делим на общее кол-во
        const totalHits = hitIntervalsMs.length + (firstHitMs ? 1 : 0);
        const averageSpeed = totalHits > 0 ? (sessionDurationMs / 1000 / totalHits).toFixed(3) : 0;


        const avgHitIntervalMs = hitIntervalsMs.length
            ? hitIntervalsMs.reduce((a, b) => a + b, 0) / hitIntervalsMs.length
            : null;

        const avgHoverNoClickMs = leftTargetWithoutClickDurations.length
            ? leftTargetWithoutClickDurations.reduce((a, b) => a + b, 0) / leftTargetWithoutClickDurations.length
            : null;

        const petrMetrics = {
            user: currentUser,
            level: currentLevel,
            timeToFirstHitMs: firstHitMs,
            totalRoundTime: parseFloat(totalRoundTime), // (5) Общее время сессии
            averageSpeed: parseFloat(averageSpeed),      // (Скорость поиска)
            hitIntervalsMs: [...hitIntervalsMs],
            avgHitIntervalMs: avgHitIntervalMs,
            hoverNoClickCount: leftTargetWithoutClickCount,
            hoverNoClickDurationsMs: [...leftTargetWithoutClickDurations],
            avgHoverNoClickMs: avgHoverNoClickMs,
            totalSessionTimeMs: Math.round(sessionDurationMs)
        };

        // Сохраняем эти метрики в общий лог сессии
        if (window.fullSession && window.fullSession.rounds) {
            window.fullSession.rounds.push(petrMetrics);
        }

        console.log("Метрики Петра записаны:", petrMetrics);

        
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(gazeDataLog, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `level_${currentLevel}_gaze_log.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();

        
        if (currentLevel < 3) {
            
            var nextLvl = currentLevel + 1;
            winTitle.textContent = "Уровень " + currentLevel + " пройден!";
            nextLevelBtn.textContent = "Перейти на " + nextLvl + " уровень >>";
            nextLevelBtn.style.display = 'inline-block';

            nextLevelBtn.onclick = function () {
                winModal.classList.add('hidden');
                winModal.style.display = 'none';

                // Сбрасываем метрики для следующего уровня
                firstHitMs = null;
                hitIntervalsMs = [];
                leftTargetWithoutClickCount = 0;
                leftTargetWithoutClickDurations = [];
                sessionStartPerf = performance.now();

                currentLevel = nextLvl;
                currentRound = 1;
                startGame(showScreenCallback);
            };
        } else {
           
            winTitle.textContent = "ПОЗДРАВЛЯЕМ!";
            document.querySelector('.window-content p').textContent = "Вы прошли всё исследование! Данные сохранены.";
            nextLevelBtn.style.display = 'none';

            // скачивание fullsession
            const dataStr2 = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(window.fullSession, null, 2));
            const a2 = document.createElement('a');
            a2.setAttribute("href", dataStr2);
            a2.setAttribute("download", `FULL_SESSION_METRICS_${currentUser}.json`);
            document.body.appendChild(a2);
            a2.click();
            a2.remove();

            
            setTimeout(() => {
                const surveyModal = document.getElementById('survey-modal');
                if (surveyModal) {
                    winModal.classList.add('hidden');
                    winModal.style.display = 'none';
                    surveyModal.classList.remove('hidden');
                    surveyModal.style.display = 'flex';
                }
            }, 2000); 
        }

        winModal.classList.remove('hidden');
        winModal.style.display = 'flex';
    }





    function endGameLoss() {
        if (activeGameTimers.move) clearInterval(activeGameTimers.move);
        clearInterval(activeGameTimers.game);
        gameActive = false;
        alert("Время вышло! Попробуем этот раунд заново.");
        startRound();
    }

    function saveProgress(levelUp) {
        if (levelUp === undefined) levelUp = false;

        var data = JSON.parse(localStorage.getItem('gameUsers_FindShape'));
        if (data && data[currentUser]) {
            data[currentUser].score = currentScore;
            if (levelUp) {
                data[currentUser].level = currentLevel + 1;
            }
            localStorage.setItem('gameUsers_FindShape', JSON.stringify(data));
        }
    }

    //emergencyExitBtn.addEventListener('click', function () {
    //    if (confirm('Выйти в меню?')) {
    //        /*sessionStorage.setItem('returnFromGame', 'true');*/
    //        clearInterval(gameTimer); // Останавливаем таймеры
    //        showScreenCallback('mainMenu'); // Возвращаемся в меню
    //    }
    //});

    //exitToMenuBtn.addEventListener('click', function () {
    //   /* sessionStorage.setItem('returnFromGame', 'true');*/
    //    clearInterval(gameTimer); // Останавливаем таймеры
    //    showScreenCallback('mainMenu'); // Возвращаемся в меню
    //});

}
