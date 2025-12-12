document.addEventListener("DOMContentLoaded", function () {

    // 1. ПРОВЕРКА АВТОРИЗАЦИИ
    var currentUser = localStorage.getItem('currentSessionUser');
    if (!currentUser) {
        alert("Сначала войдите в игру!");
        window.location.href = 'index.html';
        return;
    }

    // --- ЭЛЕМЕНТЫ DOM ---
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

    // --- НАСТРОЙКИ ---
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

    // --- СОСТОЯНИЕ ---
    var savedUsers = JSON.parse(localStorage.getItem('gameUsers_FindShape')) || {};
    if (!savedUsers[currentUser]) savedUsers[currentUser] = { level: 1, score: 0 };

    var currentScore = savedUsers[currentUser].score;
    var currentLevel = savedUsers[currentUser].level;

    if (currentLevel > 3) currentLevel = 3;

    var gameTimer = null;
    var moveTimer = null;
    var timeLeft = 0;
    var currentRound = 1;
    var maxRounds = 4;

    var targetColorKey = '';
    var targetShapeKey = '';
    var currentTaskMode = 'color';

    var remainingTargets = 0;
    var gameActive = false;
    var placedFigures = [];
    var activeFiguresElements = [];// Массив для хранения ссылок на движущиеся фигуры

    // Для Drag&Drop
    var draggedFigure = null;
    var collectionContainer = null;// Переменная для панели с коллекцией (для уровня 3)

    playerNameDisplay.textContent = currentUser + " (Ур. " + currentLevel + ")";
    scoreDisplay.textContent = currentScore;

    // СТАРТ
    startRound();

    // --- ФУНКЦИИ ИГРЫ ---

    function startRound() {
        gameActive = true;
        levelMessage.style.display = 'none';
        gameField.innerHTML = '';
        placedFigures = [];
        activeFiguresElements = [];
        draggedFigure = null;
        collectionContainer = null;

        if (moveTimer) clearInterval(moveTimer);

        timeLeft = 80 - (currentRound * 10);//задаем таймер
        timeDisplay.textContent = timeLeft;
        roundDisplay.textContent = currentRound;

        var colorKeys = Object.keys(gameColors); // Получаем массив ключей цветов: 
        var shapeKeys = Object.keys(shapeNames);
        targetColorKey = '';
        targetShapeKey = '';


        if (currentLevel === 3) {
            var dropZoneElement = document.createElement('div');
            dropZoneElement.id = 'drop-zone';
            dropZoneElement.innerHTML = 'ПЕРЕТАЩИ<br>СЮДА<br>▼';
            gameField.appendChild(dropZoneElement);
            setupDropZoneEvents(dropZoneElement);  // Настраиваем обработчики событий для этой зоны

            collectionContainer = document.createElement('div');
            collectionContainer.id = 'collected-items';
            collectionContainer.innerHTML = '<div id="collection-title">СОБРАНО</div>';
            gameField.appendChild(collectionContainer);
        }

        // раунды
        if (currentLevel === 1) {
            if (currentRound === 1 || currentRound === 2) {
                currentTaskMode = 'color';
                targetColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
                taskText.textContent = 'НАЙДИ ЦВЕТ: ' + colorNames[targetColorKey];
                taskText.style.color = gameColors[targetColorKey];
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
        else if (currentLevel === 2) {
            if (currentRound === 1 || currentRound === 2) {
                currentTaskMode = 'color';
                targetColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
               /* targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];*/
                taskText.textContent = 'НАЙДИ: ' + colorNames[targetColorKey]+' '+ 'ЦВЕТ';
                taskText.style.color = gameColors[targetColorKey];
            } else if (currentRound === 3) {
                currentTaskMode = 'shape';
                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
                taskText.textContent = 'НАЙДИ ФОРМУ: ' + shapeNames[targetShapeKey] + ' (Не верь надписям!)';
                taskText.style.color = 'red';
            } else {
                currentTaskMode = 'shape';
                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
                taskText.textContent = 'ЛОВИ ФОРМУ: ' + shapeNames[targetShapeKey];
                taskText.style.color = 'red';
            }
        }
        else if (currentLevel === 3) {
            if (currentRound === 1) {
                currentTaskMode = 'color';
                targetColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
                taskText.textContent = 'ПЕРЕТАЩИ:' + colorNames[targetColorKey];
                taskText.style.color = gameColors[targetColorKey];
            }
            else if (currentRound === 2) {
                currentTaskMode = 'shape';
                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];;
                taskText.textContent = 'ПЕРЕТАЩИ:' + shapeNames[targetShapeKey];
                taskText.style.color = 'red';
            }
            else if (currentRound === 3) {
                currentTaskMode = 'color';
                targetColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
                taskText.textContent = 'ЛОВИ ПРИЗРАКОВ: ' + colorNames[targetColorKey];
                taskText.style.color = gameColors[targetColorKey];
            }
            else {
                currentTaskMode = 'shape';
                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
                taskText.textContent = 'ПОЙМАЙ И ПЕРЕТАЩИ: ' + shapeNames[targetShapeKey];
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

        if (remainingTargets === 0) {
            createFigure(colorKeys, shapeKeys, true);
        }

        if (gameTimer) clearInterval(gameTimer);
        gameTimer = setInterval(function () {
            timeLeft--;
            timeDisplay.textContent = timeLeft;
            if (timeLeft <= 0) {
                endGameLoss();
            }
        }, 1000);

        if ((currentLevel === 2 && (currentRound === 2 || currentRound === 4)) ||
            (currentLevel === 3 && currentRound === 4)) {
            startMovementLoop();
        }
    }

    function createFigure(colorKeys, shapeKeys, forceTarget) {
        if (forceTarget === undefined) forceTarget = false;

        var figure = document.createElement('div');
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
        if (currentLevel === 3) {
            
            minX = (gameField.clientWidth * 0.20) + 30 ;
            maxX = (gameField.clientWidth * 0.80) - size -30;
        }

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

        if (currentLevel === 3) {
            figure.style.cursor = 'grab';
        } else {
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

        if (currentLevel === 2) {
            var textContent = '';
            var textColor = 'navy';
            if (currentRound === 1 || currentRound === 2) {
                textContent = shapeNames[thisShape];
                /*textColor = (thisColor === 'fuchsia' || thisColor === 'pastelGreen') ? 'white' : 'navy';*/
            } else {
                var confusingKeys = shapeKeys.filter(function (k) { return k !== thisShape; });
                var randomWrongKey = confusingKeys[Math.floor(Math.random() * confusingKeys.length)];
                textContent = shapeNames[randomWrongKey];
                textColor = 'navy';
                figure.style.textShadow = '1px 1px 1px white';
            }
            figure.innerText = textContent;
            figure.style.color = textColor;
        }

       
        if ((currentLevel === 2 && (currentRound === 2 || currentRound === 4)) ||
            (currentLevel === 3 && currentRound === 4)) {

            figure.dx = (Math.random() - 0.5) * 4;//смещение в джвижении
            figure.dy = (Math.random() - 0.5) * 4;
            activeFiguresElements.push(figure);
        }

        if (currentLevel === 3 && currentRound === 3) {
            figure.classList.add('blinking-figure');
            figure.style.animationDelay = (Math.random() * 2) + 's';//чтоб не все одновременно
        }

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

            if (currentLevel === 2) {
                var span = document.createElement('span');
                span.innerText = textContent;
                span.style.color = figure.style.color;
                span.style.textShadow = figure.style.textShadow;
                span.style.position = 'absolute';
                // шире область текста чтобы слово влезло
                span.style.width = (size * 2) + 'px';
                span.style.left = (-size) + 'px';

                span.style.textAlign = 'center';
                span.style.top = (size * 0.65) + 'px';
                span.style.fontSize = (size / 11) + 'px';

                figure.innerText = '';
                figure.appendChild(span);
                //span.style.left = (-size / 2) + 'px';
                //span.style.width = size + 'px';
                //span.style.textAlign = 'center';
                //span.style.top = (size * 0.6) + 'px';
                //span.style.fontSize = '8px';
                //figure.innerText = '';
                //figure.appendChild(span);
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

        // драг дроп
        if (currentLevel === 3) {
            figure.setAttribute('draggable', true);
            figure.addEventListener('dragstart', function (e) {
                draggedFigure = figure;
                figure.classList.add('dragging');
                figure.classList.remove('blinking-figure');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', '');
            });

            figure.addEventListener('dragend', function () {
                draggedFigure = null;
                figure.classList.remove('dragging');
                if (currentLevel === 3 && currentRound === 3 && document.body.contains(figure)) {
                    figure.classList.add('blinking-figure');
                }
            });

            figure.addEventListener('click', function (e) {
                figure.style.transform = 'translateX(5px)';
                setTimeout(function () { figure.style.transform = 'translateX(-5px)'; }, 50);
                setTimeout(function () { figure.style.transform = 'translateX(0)'; }, 100);
            });

        } else {
            figure.addEventListener('click', function (e) {
                if (!gameActive) return;
                e.stopPropagation();//остановка всплытия события

                if (isFigureCorrect(figure)) {
                    handleCorrect(figure);
                } else {
                    handleIncorrect();
                }
            });
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
        mini.classList.remove('blinking-figure', 'dragging');
        mini.removeAttribute('draggable');

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
        currentScore += 10;
        scoreDisplay.textContent = currentScore;
        remainingTargets--;

        //// ищем индекс фигуры в массиве движущихся фигур
        var idx = activeFiguresElements.indexOf(figureElement);
        if (idx > -1) activeFiguresElements.splice(idx, 1);

        if (currentLevel === 3) {
            addToCollection(figureElement);
        }

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
        currentScore -= 5;
        if (currentScore < 0) currentScore = 0;
        scoreDisplay.textContent = currentScore;
        saveProgress();
        timeDisplay.style.color = 'red';
        setTimeout(function () { timeDisplay.style.color = 'navy'; }, 300);
    }

    function setupDropZoneEvents(zone) {
        zone.addEventListener('dragover', function (e) {
            e.preventDefault();//убираем стандратное поеведегине браузера

            if (draggedFigure) {
                if (isFigureCorrect(draggedFigure)) {
                    zone.classList.remove('invalid-hover');
                    zone.classList.add('valid-hover');
                    zone.innerHTML = 'БРОСАЙ!';
                } else {
                    zone.classList.remove('valid-hover');
                    zone.classList.add('invalid-hover');
                    zone.innerHTML = 'НЕ ТА<br>ФИГУРА';
                }
            }
        });

        zone.addEventListener('dragleave', function () {
            zone.classList.remove('valid-hover');
            zone.classList.remove('invalid-hover');
            zone.innerHTML = 'ПЕРЕТАЩИ<br>СЮДА<br>▼';
        });

        zone.addEventListener('drop', function (e) {
            e.preventDefault();
            zone.classList.remove('valid-hover');
            zone.classList.remove('invalid-hover');
            zone.innerHTML = 'ПЕРЕТАЩИ<br>СЮДА<br>▼';

            if (draggedFigure) {
                if (isFigureCorrect(draggedFigure)) {
                    handleCorrect(draggedFigure);
                } else {
                    handleIncorrect();
                }
                draggedFigure = null;
            }
        });
    }

    //каждые 20 милоисекунд меняют координаты
    function startMovementLoop() {
        moveTimer = setInterval(function () {
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
                if (fig.classList.contains('dragging')) continue;//если тащим не двигаем

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
        if (moveTimer) clearInterval(moveTimer);
        clearInterval(gameTimer);
        gameActive = false;

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

    function finishLevel() {
        var isLevelUp = (currentLevel < 3);
        saveProgress(isLevelUp);

        finalScoreSpan.textContent = currentScore;

        if (currentLevel < 3) {
            var nextLvl = currentLevel + 1;
            winTitle.textContent = "Уровень " + currentLevel + " пройден!";
            nextLevelBtn.textContent = "Перейти на " + nextLvl + " уровень >>";
            nextLevelBtn.style.display = 'inline-block';
            nextLevelBtn.onclick = function () {
                window.location.reload();
            };
        } else {
            winTitle.textContent = "ПОЗДРАВЛЯЕМ!";
            document.querySelector('.window-content p').textContent = "Вы прошли ВСЮ игру!";
            nextLevelBtn.style.display = 'none';
        }

        winModal.classList.remove('hidden');
        winModal.style.display = 'flex';
    }

    function endGameLoss() {
        if (moveTimer) clearInterval(moveTimer);
        clearInterval(gameTimer);
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

    emergencyExitBtn.addEventListener('click', function () {
        if (confirm('Выйти в меню?')) {
            sessionStorage.setItem('returnFromGame', 'true');
            window.location.href = 'index.html';
        }
    });

    exitToMenuBtn.addEventListener('click', function () {
        sessionStorage.setItem('returnFromGame', 'true');
        window.location.href = 'index.html';
    });
});















































































//document.addEventListener("DOMContentLoaded", function () {

//    // 1. ПРОВЕРКА АВТОРИЗАЦИИ
//    var currentUser = localStorage.getItem('currentSessionUser');
//    if (!currentUser) {
//        alert("Сначала войдите в игру!");
//        window.location.href = 'index.html';
//        return;
//    }

//    // --- ЭЛЕМЕНТЫ DOM ---
//    var gameField = document.getElementById('game-field');
//    var taskText = document.getElementById('task-text');
//    var timeDisplay = document.getElementById('time-display');
//    var scoreDisplay = document.getElementById('score-display');
//    var roundDisplay = document.getElementById('round-display');
//    var levelMessage = document.getElementById('level-message');
//    var playerNameDisplay = document.getElementById('player-name-display');
//    var emergencyExitBtn = document.getElementById('emergency-exit');
//    var winModal = document.getElementById('win-modal');
//    var finalScoreSpan = document.getElementById('final-score');
//    var nextLevelBtn = document.getElementById('next-level-btn');
//    var exitToMenuBtn = document.getElementById('exit-to-menu-btn');
//    var winTitle = document.querySelector('.window-title');

//    // --- НАСТРОЙКИ ---
//    var gameColors = {
//        'fuchsia': '#FF00FF',
//        'pastelBlue': '#34e5f6',
//        'turquoise': '#63FFCF',
//        'pastelGreen': '#77DD77',
//        'pastelYellow': '#FDFD96'
//    };

//    var colorNames = {
//        'fuchsia': 'ЯРКО-РОЗОВЫЙ',
//        'pastelBlue': 'ГОЛУБОЙ',
//        'turquoise': 'БИРЮЗОВЫЙ',
//        'pastelGreen': 'ЗЕЛЕНЫЙ',
//        'pastelYellow': 'ЖЕЛТЫЙ'
//    };

//    var shapeNames = {
//        'square': 'КВАДРАТ',
//        'circle': 'КРУГ',
//        'triangle': 'ТРЕУГОЛ',
//        'rectangle': 'ПРЯМОУГ'
//    };

//    // --- СОСТОЯНИЕ ---
//    var savedUsers = JSON.parse(localStorage.getItem('gameUsers_FindShape')) || {};
//    if (!savedUsers[currentUser]) savedUsers[currentUser] = { level: 1, score: 0 };

//    var currentScore = savedUsers[currentUser].score;
//    var currentLevel = savedUsers[currentUser].level;

//    if (currentLevel > 3) currentLevel = 3;

//    var gameTimer = null;
//    var moveTimer = null;
//    var timeLeft = 0;
//    var currentRound = 1;
//    var maxRounds = 4;

//    var targetColorKey = '';
//    var targetShapeKey = '';
//    var currentTaskMode = 'color'; // 'color', 'shape', 'both', 'any'

//    var remainingTargets = 0;
//    var gameActive = false;
//    var placedFigures = [];
//    var activeFiguresElements = [];

//    // Для Drag&Drop
//    var draggedFigure = null;
//    var collectionContainer = null; // Ссылка на панель сбора

//    playerNameDisplay.textContent = currentUser + " (Ур. " + currentLevel + ")";
//    scoreDisplay.textContent = currentScore;

//    // СТАРТ
//    startRound();

//    // --- ФУНКЦИИ ИГРЫ ---

//    function startRound() {
//        gameActive = true;
//        levelMessage.style.display = 'none';
//        gameField.innerHTML = '';
//        placedFigures = [];
//        activeFiguresElements = [];
//        draggedFigure = null;
//        collectionContainer = null;

//        if (moveTimer) clearInterval(moveTimer);

//        timeLeft = 80 - (currentRound * 10);
//        timeDisplay.textContent = timeLeft;
//        roundDisplay.textContent = currentRound;

//        var colorKeys = Object.keys(gameColors);
//        var shapeKeys = Object.keys(shapeNames);
//        targetColorKey = '';
//        targetShapeKey = '';

//        // --- ИНИЦИАЛИЗАЦИЯ ИНТЕРФЕЙСА УРОВНЯ 3 ---
//        if (currentLevel === 3) {
//            // 1. Создаем ЗОНУ СБРОСА (Справа)
//            var dropZoneElement = document.createElement('div');
//            dropZoneElement.id = 'drop-zone';
//            dropZoneElement.innerHTML = 'ПЕРЕТАЩИ<br>СЮДА<br>▼';
//            gameField.appendChild(dropZoneElement);
//            setupDropZoneEvents(dropZoneElement);

//            // 2. Создаем ПАНЕЛЬ КОЛЛЕКЦИИ (Слева)
//            collectionContainer = document.createElement('div');
//            collectionContainer.id = 'collected-items';
//            collectionContainer.innerHTML = '<div id="collection-title">ТРОФЕИ</div>';
//            gameField.appendChild(collectionContainer);
//        }

//        // --- ЛОГИКА ЗАДАНИЙ ---
//        if (currentLevel === 1) {
//            if (currentRound === 1 || currentRound === 2) {
//                currentTaskMode = 'color';
//                targetColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
//                taskText.textContent = 'НАЙДИ ЦВЕТ: ' + colorNames[targetColorKey];
//                taskText.style.color = gameColors[targetColorKey];
//            } else if (currentRound === 3) {
//                currentTaskMode = 'shape';
//                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//                taskText.textContent = 'НАЙДИ ФОРМУ: ' + shapeNames[targetShapeKey];
//                taskText.style.color = 'navy';
//            } else {
//                currentTaskMode = 'both';
//                targetColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
//                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//                taskText.textContent = 'НАЙДИ: ' + colorNames[targetColorKey] + ' ' + shapeNames[targetShapeKey];
//                taskText.style.color = gameColors[targetColorKey];
//            }
//        }
//        else if (currentLevel === 2) {
//            if (currentRound === 1 || currentRound === 2) {
//                currentTaskMode = 'both';
//                targetColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
//                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//                taskText.textContent = 'НАЙДИ: ' + colorNames[targetColorKey] + ' ' + shapeNames[targetShapeKey];
//                taskText.style.color = gameColors[targetColorKey];
//            } else if (currentRound === 3) {
//                currentTaskMode = 'shape';
//                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//                taskText.textContent = 'НАЙДИ ФОРМУ: ' + shapeNames[targetShapeKey] + ' (Не верь надписям!)';
//                taskText.style.color = 'navy';
//            } else {
//                currentTaskMode = 'shape';
//                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//                taskText.textContent = 'ЛОВИ ФОРМУ: ' + shapeNames[targetShapeKey];
//                taskText.style.color = 'red';
//            }
//        }
//        else if (currentLevel === 3) {
//            // === УРОВЕНЬ 3 (DRAG & DROP) ===
//            if (currentRound === 1) {
//                currentTaskMode = 'color';
//                targetColorKey = 'fuchsia';
//                taskText.textContent = 'ПЕРЕТАЩИ: ЯРКО-РОЗОВЫЕ';
//                taskText.style.color = gameColors['fuchsia'];
//            }
//            else if (currentRound === 2) {
//                currentTaskMode = 'shape';
//                targetShapeKey = 'circle';
//                taskText.textContent = 'ПЕРЕТАЩИ: КРУГИ';
//                taskText.style.color = 'navy';
//            }
//            else if (currentRound === 3) {
//                // Раунд 3: МИГАНИЕ. Перетащить ЛЮБЫЕ (или все)
//                currentTaskMode = 'any'; // Любая фигура подходит
//                taskText.textContent = 'ЛОВИ ПРИЗРАКОВ! (ТЯНИ ВСЁ)';
//                taskText.style.color = '#8800ff';
//            }
//            else {
//                // Раунд 4: ДВИЖЕНИЕ + ФОРМА
//                currentTaskMode = 'shape';
//                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//                taskText.textContent = 'ПОЙМАЙ И ПЕРЕТАЩИ: ' + shapeNames[targetShapeKey];
//                taskText.style.color = 'red';
//            }
//        }

//        taskText.style.textShadow = "1px 1px 0 #000";

//        var totalFigures = 20 + (currentRound * 5);
//        if (currentLevel === 3) totalFigures = 18;

//        // В 3 раунде 3 уровня (призраки) их должно быть много, чтобы было весело
//        if (currentLevel === 3 && currentRound === 3) totalFigures = 25;

//        remainingTargets = 0;

//        for (var i = 0; i < totalFigures; i++) {
//            createFigure(colorKeys, shapeKeys);
//        }

//        if (remainingTargets === 0) {
//            createFigure(colorKeys, shapeKeys, true);
//        }

//        if (gameTimer) clearInterval(gameTimer);
//        gameTimer = setInterval(function () {
//            timeLeft--;
//            timeDisplay.textContent = timeLeft;
//            if (timeLeft <= 0) {
//                endGameLoss();
//            }
//        }, 1000);

//        // --- ЗАПУСК ДВИЖЕНИЯ ---
//        // Ур 2: Раунд 2 и 4
//        // Ур 3: Раунд 4
//        if ((currentLevel === 2 && (currentRound === 2 || currentRound === 4)) ||
//            (currentLevel === 3 && currentRound === 4)) {
//            startMovementLoop();
//        }
//    }

//    function createFigure(colorKeys, shapeKeys, forceTarget) {
//        if (forceTarget === undefined) forceTarget = false;

//        var figure = document.createElement('div');
//        var randomShape = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//        var randomColor = colorKeys[Math.floor(Math.random() * colorKeys.length)];

//        var thisShape = randomShape;
//        var thisColor = randomColor;

//        if (forceTarget) {
//            if (currentTaskMode === 'color') thisColor = targetColorKey;
//            if (currentTaskMode === 'shape') thisShape = targetShapeKey;
//            if (currentTaskMode === 'both') {
//                thisColor = targetColorKey;
//                thisShape = targetShapeKey;
//            }
//            // Для 'any' любая фигура подходит, форсировать не надо
//        }

//        // Проверка цели
//        var isTarget = false;
//        if (currentTaskMode === 'any') isTarget = true;
//        else if (currentTaskMode === 'color' && thisColor === targetColorKey) isTarget = true;
//        else if (currentTaskMode === 'shape' && thisShape === targetShapeKey) isTarget = true;
//        else if (currentTaskMode === 'both' && thisColor === targetColorKey && thisShape === targetShapeKey) isTarget = true;

//        if (isTarget) remainingTargets++;

//        var size = Math.floor(Math.random() * 50) + 40;
//        var x, y;
//        var overlap = false;
//        var attempts = 0;

//        // --- РАСЧЕТ ГРАНИЦ ДЛЯ СПАУНА ---
//        var minX = 0;
//        var maxX = gameField.clientWidth - size;

//        // На 3 уровне слева панель (15%) и справа зона (25%)
//        if (currentLevel === 3) {
//            minX = (gameField.clientWidth * 0.15) + 10; // Отступ слева
//            maxX = (gameField.clientWidth * 0.75) - size - 10; // Отступ справа
//        }

//        do {
//            overlap = false;
//            // Генерируем X в безопасной зоне
//            x = Math.floor(Math.random() * (maxX - minX)) + minX;
//            y = Math.floor(Math.random() * (gameField.clientHeight - size));
//            var margin = 5;

//            for (var k = 0; k < placedFigures.length; k++) {
//                var existing = placedFigures[k];
//                if (x < existing.x + existing.size + margin &&
//                    x + size + margin > existing.x &&
//                    y < existing.y + existing.size + margin &&
//                    y + size + margin > existing.y) {
//                    overlap = true;
//                    break;
//                }
//            }
//            attempts++;
//        } while (overlap && attempts < 100);

//        if (overlap && !isTarget) return;

//        placedFigures.push({ x: x, y: y, size: (thisShape === 'rectangle' ? size * 1.5 : size) });

//        figure.style.position = 'absolute';
//        figure.style.left = x + 'px';
//        figure.style.top = y + 'px';
//        figure.style.width = size + 'px';
//        figure.style.height = size + 'px';
//        figure.style.backgroundColor = gameColors[thisColor];

//        if (currentLevel === 3) {
//            figure.style.cursor = 'grab';
//        } else {
//            figure.style.cursor = 'pointer';
//        }

//        figure.style.transition = 'transform 0.1s';
//        figure.style.zIndex = '10';
//        figure.style.display = 'flex';
//        figure.style.justifyContent = 'center';
//        figure.style.alignItems = 'center';
//        figure.style.textAlign = 'center';
//        figure.style.fontSize = '10px';
//        figure.style.fontWeight = 'bold';
//        figure.style.fontFamily = 'Press Start 2P, sans-serif';

//        figure.dataset.color = thisColor;
//        figure.dataset.shape = thisShape;

//        // --- ТЕКСТ (ТОЛЬКО УРОВЕНЬ 2) ---
//        if (currentLevel === 2) {
//            var textContent = '';
//            var textColor = 'black';
//            if (currentRound === 1 || currentRound === 2) {
//                textContent = shapeNames[thisShape];
//                textColor = (thisColor === 'fuchsia' || thisColor === 'pastelGreen') ? 'white' : 'navy';
//            } else {
//                var confusingKeys = shapeKeys.filter(function (k) { return k !== thisShape; });
//                var randomWrongKey = confusingKeys[Math.floor(Math.random() * confusingKeys.length)];
//                textContent = shapeNames[randomWrongKey];
//                textColor = 'navy';
//                figure.style.textShadow = '1px 1px 1px white';
//            }
//            figure.innerText = textContent;
//            figure.style.color = textColor;
//        }

//        // --- ДОБАВЛЕНИЕ В ДВИЖЕНИЕ ---
//        // Ур 2: Раунд 2, 4
//        // Ур 3: Раунд 4
//        if ((currentLevel === 2 && (currentRound === 2 || currentRound === 4)) ||
//            (currentLevel === 3 && currentRound === 4)) {

//            figure.dx = (Math.random() - 0.5) * 4;
//            figure.dy = (Math.random() - 0.5) * 4;
//            activeFiguresElements.push(figure);
//        }

//        // --- МИГАНИЕ (УРОВЕНЬ 3, РАУНД 3) ---
//        if (currentLevel === 3 && currentRound === 3) {
//            figure.classList.add('blinking-figure'); // Добавляем класс анимации из CSS
//            // Делаем разную задержку анимации, чтобы они мигали не синхронно
//            figure.style.animationDelay = (Math.random() * 2) + 's';
//        }

//        // --- ФОРМА ---
//        if (thisShape === 'circle') {
//            figure.style.borderRadius = '50%';
//        } else if (thisShape === 'triangle') {
//            figure.style.backgroundColor = 'transparent';
//            figure.style.width = '0';
//            figure.style.height = '0';
//            figure.style.borderLeft = (size / 2) + 'px solid transparent';
//            figure.style.borderRight = (size / 2) + 'px solid transparent';
//            figure.style.borderBottom = size + 'px solid ' + gameColors[thisColor];

//            if (currentLevel === 2) {
//                var span = document.createElement('span');
//                span.innerText = textContent;
//                span.style.color = figure.style.color;
//                span.style.textShadow = figure.style.textShadow;
//                span.style.position = 'absolute';
//                span.style.left = (-size / 2) + 'px';
//                span.style.width = size + 'px';
//                span.style.textAlign = 'center';
//                span.style.top = (size * 0.6) + 'px';
//                span.style.fontSize = '8px';
//                figure.innerText = '';
//                figure.appendChild(span);
//            }
//        } else if (thisShape === 'rectangle') {
//            figure.style.width = (size * 1.5) + 'px';
//        }

//        figure.addEventListener('mouseenter', function () {
//            figure.style.zIndex = '100';
//            figure.style.transform = 'scale(1.1)';
//        });
//        figure.addEventListener('mouseleave', function () {
//            figure.style.zIndex = '10';
//            figure.style.transform = 'scale(1)';
//        });

//        // --- ЛОГИКА DRAG & DROP ДЛЯ 3 УРОВНЯ ---
//        if (currentLevel === 3) {
//            figure.setAttribute('draggable', true);

//            figure.addEventListener('dragstart', function (e) {
//                draggedFigure = figure;
//                figure.classList.add('dragging');

//                // Если фигура мигала, убираем мигание пока тащим, чтобы не исчезла в руках
//                figure.classList.remove('blinking-figure');

//                e.dataTransfer.effectAllowed = 'move';
//                e.dataTransfer.setData('text/plain', '');
//            });

//            figure.addEventListener('dragend', function () {
//                draggedFigure = null;
//                figure.classList.remove('dragging');

//                // Если не сбросили успешно, возвращаем мигание (если это 3 раунд)
//                if (currentLevel === 3 && currentRound === 3 && document.body.contains(figure)) {
//                    figure.classList.add('blinking-figure');
//                }
//            });

//            // Эффект "нельзя кликать"
//            figure.addEventListener('click', function (e) {
//                figure.style.transform = 'translateX(5px)';
//                setTimeout(function () { figure.style.transform = 'translateX(-5px)'; }, 50);
//                setTimeout(function () { figure.style.transform = 'translateX(0)'; }, 100);
//            });

//        } else {
//            // КЛИК (Ур 1 и 2)
//            figure.addEventListener('click', function (e) {
//                if (!gameActive) return;
//                e.stopPropagation();

//                if (isFigureCorrect(figure)) {
//                    handleCorrect(figure);
//                } else {
//                    handleIncorrect();
//                }
//            });
//        }

//        gameField.appendChild(figure);
//    }

//    function isFigureCorrect(figureElement) {
//        var clickedColor = figureElement.dataset.color;
//        var clickedShape = figureElement.dataset.shape;

//        if (currentTaskMode === 'any') return true;
//        if (currentTaskMode === 'color' && clickedColor === targetColorKey) return true;
//        if (currentTaskMode === 'shape' && clickedShape === targetShapeKey) return true;
//        if (currentTaskMode === 'both' && clickedColor === targetColorKey && clickedShape === targetShapeKey) return true;

//        return false;
//    }

//    function addToCollection(figureElement) {
//        if (!collectionContainer) return;

//        // Создаем клон для коллекции (чисто визуальный)
//        var mini = figureElement.cloneNode(true);

//        // Сбрасываем стили позиционирования
//        mini.style.position = 'relative';
//        mini.style.left = 'auto';
//        mini.style.top = 'auto';
//        mini.style.width = '30px';
//        mini.style.height = '30px';
//        mini.style.margin = '2px';
//        mini.style.opacity = '1';
//        mini.style.transform = 'none';
//        mini.style.zIndex = '1';
//        mini.classList.remove('blinking-figure');
//        mini.classList.remove('dragging');
//        mini.removeAttribute('draggable');

//        // Коррекция для прямоугольника
//        if (mini.dataset.shape === 'rectangle') {
//            mini.style.width = '45px';
//        }
//        // Коррекция для треугольника (бордеры)
//        if (mini.dataset.shape === 'triangle') {
//            mini.style.borderLeftWidth = '15px';
//            mini.style.borderRightWidth = '15px';
//            mini.style.borderBottomWidth = '30px';
//        }

//        // Добавляем класс для доп стилей из CSS
//        mini.classList.add('mini-figure');

//        collectionContainer.appendChild(mini);
//    }

//    function handleCorrect(figureElement) {
//        currentScore += 10;
//        scoreDisplay.textContent = currentScore;
//        remainingTargets--;

//        // Удаляем из массива движения, если она там была
//        var idx = activeFiguresElements.indexOf(figureElement);
//        if (idx > -1) activeFiguresElements.splice(idx, 1);

//        // ДОБАВЛЯЕМ В КОЛЛЕКЦИЮ (Только для 3 уровня)
//        if (currentLevel === 3) {
//            addToCollection(figureElement);
//        }

//        figureElement.style.transform = 'scale(0)';
//        setTimeout(function () {
//            figureElement.remove();
//        }, 100);

//        saveProgress();

//        if (remainingTargets <= 0) {
//            handleRoundWin();
//        }
//    }

//    function handleIncorrect() {
//        currentScore -= 5;
//        if (currentScore < 0) currentScore = 0;
//        scoreDisplay.textContent = currentScore;
//        saveProgress();
//        timeDisplay.style.color = 'red';
//        setTimeout(function () { timeDisplay.style.color = 'navy'; }, 300);
//    }

//    // --- DROP ZONE ---
//    function setupDropZoneEvents(zone) {
//        zone.addEventListener('dragover', function (e) {
//            e.preventDefault();

//            if (draggedFigure) {
//                if (isFigureCorrect(draggedFigure)) {
//                    zone.classList.remove('invalid-hover');
//                    zone.classList.add('valid-hover');
//                    zone.innerHTML = 'БРОСАЙ!';
//                } else {
//                    zone.classList.remove('valid-hover');
//                    zone.classList.add('invalid-hover');
//                    zone.innerHTML = 'НЕ ТА<br>ФИГУРА';
//                }
//            }
//        });

//        zone.addEventListener('dragleave', function () {
//            zone.classList.remove('valid-hover');
//            zone.classList.remove('invalid-hover');
//            zone.innerHTML = 'ПЕРЕТАЩИ<br>СЮДА<br>▼';
//        });

//        zone.addEventListener('drop', function (e) {
//            e.preventDefault();
//            zone.classList.remove('valid-hover');
//            zone.classList.remove('invalid-hover');
//            zone.innerHTML = 'ПЕРЕТАЩИ<br>СЮДА<br>▼';

//            if (draggedFigure) {
//                if (isFigureCorrect(draggedFigure)) {
//                    handleCorrect(draggedFigure);
//                } else {
//                    handleIncorrect();
//                }
//                draggedFigure = null;
//            }
//        });
//    }

//    function startMovementLoop() {
//        moveTimer = setInterval(function () {
//            if (!gameActive) return;

//            var w = gameField.clientWidth;
//            var h = gameField.clientHeight;

//            // Границы для движения на 3 уровне меньше (из-за боковых панелей)
//            var minX = 0;
//            var maxX = w;

//            if (currentLevel === 3) {
//                minX = (w * 0.15) + 5;
//                maxX = (w * 0.75) - 5;
//            }

//            for (var i = 0; i < activeFiguresElements.length; i++) {
//                var fig = activeFiguresElements[i];
//                // Если фигуру сейчас тащат мышкой, не двигаем её программно!
//                if (fig.classList.contains('dragging')) continue;

//                var currentX = parseFloat(fig.style.left);
//                var currentY = parseFloat(fig.style.top);
//                var figW = parseFloat(fig.style.width);
//                var figH = parseFloat(fig.style.height);

//                if (fig.style.height === '0px') {
//                    figH = parseFloat(fig.style.borderBottomWidth);
//                    figW = parseFloat(fig.style.borderLeftWidth) * 2;
//                }

//                currentX += fig.dx;
//                currentY += fig.dy;

//                // Проверка границ с учетом панелей
//                if (currentX <= minX || currentX + figW >= maxX) {
//                    fig.dx = -fig.dx;
//                    if (currentX <= minX) currentX = minX;
//                    if (currentX + figW >= maxX) currentX = maxX - figW;
//                }

//                if (currentY <= 0 || currentY + figH >= h) {
//                    fig.dy = -fig.dy;
//                    if (currentY <= 0) currentY = 0;
//                    if (currentY + figH >= h) currentY = h - figH;
//                }

//                fig.style.left = currentX + 'px';
//                fig.style.top = currentY + 'px';
//            }
//        }, 20);
//    }

//    function handleRoundWin() {
//        if (moveTimer) clearInterval(moveTimer);
//        clearInterval(gameTimer);
//        gameActive = false;

//        if (currentRound < maxRounds) {
//            levelMessage.textContent = 'РАУНД ' + currentRound + ' ПРОЙДЕН!';
//            levelMessage.style.display = 'block';

//            setTimeout(function () {
//                currentRound++;
//                startRound();
//            }, 2000);
//        } else {
//            finishLevel();
//        }
//    }

//    function finishLevel() {
//        var isLevelUp = (currentLevel < 3);
//        saveProgress(isLevelUp);

//        finalScoreSpan.textContent = currentScore;

//        if (currentLevel < 3) {
//            var nextLvl = currentLevel + 1;
//            winTitle.textContent = "Уровень " + currentLevel + " пройден!";
//            nextLevelBtn.textContent = "Перейти на " + nextLvl + " уровень >>";
//            nextLevelBtn.style.display = 'inline-block';
//            nextLevelBtn.onclick = function () {
//                window.location.reload();
//            };
//        } else {
//            winTitle.textContent = "ПОЗДРАВЛЯЕМ!";
//            document.querySelector('.window-content p').textContent = "Вы прошли ВСЮ игру!";
//            nextLevelBtn.style.display = 'none';
//        }

//        winModal.classList.remove('hidden');
//        winModal.style.display = 'flex';
//    }

//    function endGameLoss() {
//        if (moveTimer) clearInterval(moveTimer);
//        clearInterval(gameTimer);
//        gameActive = false;
//        alert("Время вышло! Попробуем этот раунд заново.");
//        startRound();
//    }

//    function saveProgress(levelUp) {
//        if (levelUp === undefined) levelUp = false;

//        var data = JSON.parse(localStorage.getItem('gameUsers_FindShape'));
//        if (data && data[currentUser]) {
//            data[currentUser].score = currentScore;
//            if (levelUp) {
//                data[currentUser].level = currentLevel + 1;
//            }
//            localStorage.setItem('gameUsers_FindShape', JSON.stringify(data));
//        }
//    }

//    emergencyExitBtn.addEventListener('click', function () {
//        if (confirm('Выйти в меню?')) {
//            sessionStorage.setItem('returnFromGame', 'true');
//            window.location.href = 'index.html';
//        }
//    });

//    exitToMenuBtn.addEventListener('click', function () {
//        sessionStorage.setItem('returnFromGame', 'true');
//        window.location.href = 'index.html';
//    });
//});












































//document.addEventListener("DOMContentLoaded", function () {

//    // 1. ПРОВЕРКА АВТОРИЗАЦИИ
//    var currentUser = localStorage.getItem('currentSessionUser');
//    if (!currentUser) {
//        alert("Сначала войдите в игру!");
//        window.location.href = 'index.html';
//        return;
//    }

//    // --- ЭЛЕМЕНТЫ DOM ---
//    var gameField = document.getElementById('game-field');
//    var taskText = document.getElementById('task-text');
//    var timeDisplay = document.getElementById('time-display');
//    var scoreDisplay = document.getElementById('score-display');
//    var roundDisplay = document.getElementById('round-display');
//    var levelMessage = document.getElementById('level-message');
//    var playerNameDisplay = document.getElementById('player-name-display');
//    var emergencyExitBtn = document.getElementById('emergency-exit');
//    var winModal = document.getElementById('win-modal');
//    var finalScoreSpan = document.getElementById('final-score');
//    var nextLevelBtn = document.getElementById('next-level-btn');
//    var exitToMenuBtn = document.getElementById('exit-to-menu-btn');
//    var winTitle = document.querySelector('.window-title');

//    // --- НАСТРОЙКИ ---
//    var gameColors = {
//        'fuchsia': '#FF00FF',
//        'pastelBlue': '#34e5f6',
//        'turquoise': '#63FFCF',
//        'pastelGreen': '#77DD77',
//        'pastelYellow': '#FDFD96'
//    };

//    var colorNames = {
//        'fuchsia': 'ЯРКО-РОЗОВЫЙ',
//        'pastelBlue': 'ГОЛУБОЙ',
//        'turquoise': 'БИРЮЗОВЫЙ',
//        'pastelGreen': 'ЗЕЛЕНЫЙ',
//        'pastelYellow': 'ЖЕЛТЫЙ'
//    };

//    var shapeNames = {
//        'square': 'КВАДРАТ',
//        'circle': 'КРУГ',
//        'triangle': 'ТРЕУГОЛ',
//        'rectangle': 'ПРЯМОУГ'
//    };

//    // --- СОСТОЯНИЕ ---
//    var savedUsers = JSON.parse(localStorage.getItem('gameUsers_FindShape')) || {};
//    if (!savedUsers[currentUser]) savedUsers[currentUser] = { level: 1, score: 0 };

//    var currentScore = savedUsers[currentUser].score;
//    var currentLevel = savedUsers[currentUser].level;

//    if (currentLevel > 3) currentLevel = 3;

//    var gameTimer = null;
//    var moveTimer = null;
//    var timeLeft = 0;
//    var currentRound = 1;
//    var maxRounds = 4;

//    var targetColorKey = '';
//    var targetShapeKey = '';
//    var currentTaskMode = 'color';

//    var remainingTargets = 0;
//    var gameActive = false;
//    var placedFigures = [];
//    var activeFiguresElements = [];

//    // Для Drag&Drop
//    var draggedFigure = null;

//    playerNameDisplay.textContent = currentUser + " (Ур. " + currentLevel + ")";
//    scoreDisplay.textContent = currentScore;

//    // СТАРТ
//    startRound();

//    // --- ФУНКЦИИ ИГРЫ ---

//    function startRound() {
//        gameActive = true;
//        levelMessage.style.display = 'none';
//        gameField.innerHTML = '';
//        placedFigures = [];
//        activeFiguresElements = [];
//        draggedFigure = null;

//        if (moveTimer) clearInterval(moveTimer);

//        timeLeft = 80 - (currentRound * 10);
//        timeDisplay.textContent = timeLeft;
//        roundDisplay.textContent = currentRound;

//        var colorKeys = Object.keys(gameColors);
//        var shapeKeys = Object.keys(shapeNames);
//        targetColorKey = '';
//        targetShapeKey = '';

//        // --- СОЗДАНИЕ ЗОНЫ ДЛЯ 3 УРОВНЯ ---
//        var dropZoneElement = null;
//        if (currentLevel === 3) {
//            dropZoneElement = document.createElement('div');
//            dropZoneElement.id = 'drop-zone';
//            dropZoneElement.innerHTML = 'ПЕРЕТАЩИ<br>СЮДА<br>▼';
//            gameField.appendChild(dropZoneElement);
//            setupDropZoneEvents(dropZoneElement);
//        }

//        // --- ЛОГИКА ЗАДАНИЙ ---
//        if (currentLevel === 1) {
//            if (currentRound === 1 || currentRound === 2) {
//                currentTaskMode = 'color';
//                targetColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
//                taskText.textContent = 'НАЙДИ ЦВЕТ: ' + colorNames[targetColorKey];
//                taskText.style.color = gameColors[targetColorKey];
//            } else if (currentRound === 3) {
//                currentTaskMode = 'shape';
//                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//                taskText.textContent = 'НАЙДИ ФОРМУ: ' + shapeNames[targetShapeKey];
//                taskText.style.color = 'navy';
//            } else {
//                currentTaskMode = 'both';
//                targetColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
//                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//                taskText.textContent = 'НАЙДИ: ' + colorNames[targetColorKey] + ' ' + shapeNames[targetShapeKey];
//                taskText.style.color = gameColors[targetColorKey];
//            }
//        }
//        else if (currentLevel === 2) {
//            if (currentRound === 1 || currentRound === 2) {
//                currentTaskMode = 'both';
//                targetColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
//                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//                taskText.textContent = 'НАЙДИ: ' + colorNames[targetColorKey] + ' ' + shapeNames[targetShapeKey];
//                taskText.style.color = gameColors[targetColorKey];
//            } else if (currentRound === 3) {
//                currentTaskMode = 'shape';
//                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//                taskText.textContent = 'НАЙДИ ФОРМУ: ' + shapeNames[targetShapeKey] + ' (Не верь надписям!)';
//                taskText.style.color = 'navy';
//            } else {
//                currentTaskMode = 'shape';
//                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//                taskText.textContent = 'ЛОВИ ФОРМУ: ' + shapeNames[targetShapeKey];
//                taskText.style.color = 'red';
//            }
//        }
//        else if (currentLevel === 3) {
//            if (currentRound === 1) {
//                currentTaskMode = 'color';
//                targetColorKey = 'fuchsia';
//                taskText.textContent = 'ПЕРЕТАЩИ: ЯРКО-РОЗОВЫЕ';
//                taskText.style.color = gameColors['fuchsia'];
//            } else if (currentRound === 2) {
//                currentTaskMode = 'shape';
//                targetShapeKey = 'circle';
//                taskText.textContent = 'ПЕРЕТАЩИ: КРУГИ';
//                taskText.style.color = 'navy';
//            } else {
//                currentTaskMode = 'color';
//                targetColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
//                taskText.textContent = 'ПЕРЕТАЩИ: ' + colorNames[targetColorKey];
//                taskText.style.color = gameColors[targetColorKey];
//            }
//        }

//        taskText.style.textShadow = "1px 1px 0 #000";

//        var totalFigures = 20 + (currentRound * 5);
//        if (currentLevel === 3) totalFigures = 18;
//        remainingTargets = 0;

//        for (var i = 0; i < totalFigures; i++) {
//            createFigure(colorKeys, shapeKeys);
//        }

//        if (remainingTargets === 0) {
//            createFigure(colorKeys, shapeKeys, true);
//        }

//        if (gameTimer) clearInterval(gameTimer);
//        gameTimer = setInterval(function () {
//            timeLeft--;
//            timeDisplay.textContent = timeLeft;
//            if (timeLeft <= 0) {
//                endGameLoss();
//            }
//        }, 1000);

//        if (currentLevel === 2 && (currentRound === 2 || currentRound === 4)) {
//            startMovementLoop();
//        }
//    }

//    function createFigure(colorKeys, shapeKeys, forceTarget) {
//        if (forceTarget === undefined) forceTarget = false;

//        var figure = document.createElement('div');
//        var randomShape = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//        var randomColor = colorKeys[Math.floor(Math.random() * colorKeys.length)];

//        var thisShape = randomShape;
//        var thisColor = randomColor;

//        if (forceTarget) {
//            if (currentTaskMode === 'color') thisColor = targetColorKey;
//            if (currentTaskMode === 'shape') thisShape = targetShapeKey;
//            if (currentTaskMode === 'both') {
//                thisColor = targetColorKey;
//                thisShape = targetShapeKey;
//            }
//        }

//        var isTarget = false;
//        if (currentTaskMode === 'color') {
//            if (thisColor === targetColorKey) isTarget = true;
//        } else if (currentTaskMode === 'shape') {
//            if (thisShape === targetShapeKey) isTarget = true;
//        } else if (currentTaskMode === 'both') {
//            if (thisColor === targetColorKey && thisShape === targetShapeKey) isTarget = true;
//        }

//        if (isTarget) remainingTargets++;

//        var size = Math.floor(Math.random() * 50) + 40;
//        var x, y;
//        var overlap = false;
//        var attempts = 0;

//        // --- ГРАНИЦЫ ---
//        var maxW = gameField.clientWidth;
//        if (currentLevel === 3) {
//            // Исправлено: 75% ширины минус буфер 30px, чтобы точно не наезжать на линию
//            maxW = (gameField.clientWidth * 0.75) - 30;
//        }

//        do {
//            overlap = false;
//            // Теперь используем maxW в формуле
//            x = Math.floor(Math.random() * (maxW - size));
//            y = Math.floor(Math.random() * (gameField.clientHeight - size));
//            var margin = 5;

//            for (var k = 0; k < placedFigures.length; k++) {
//                var existing = placedFigures[k];
//                if (x < existing.x + existing.size + margin &&
//                    x + size + margin > existing.x &&
//                    y < existing.y + existing.size + margin &&
//                    y + size + margin > existing.y) {
//                    overlap = true;
//                    break;
//                }
//            }
//            attempts++;
//        } while (overlap && attempts < 100);

//        if (overlap && !isTarget) return;

//        placedFigures.push({ x: x, y: y, size: (thisShape === 'rectangle' ? size * 1.5 : size) });

//        figure.style.position = 'absolute';
//        figure.style.left = x + 'px';
//        figure.style.top = y + 'px';
//        figure.style.width = size + 'px';
//        figure.style.height = size + 'px';
//        figure.style.backgroundColor = gameColors[thisColor];

//        if (currentLevel === 3) {
//            figure.style.cursor = 'grab';
//        } else {
//            figure.style.cursor = 'pointer';
//        }

//        figure.style.transition = 'transform 0.1s';
//        figure.style.zIndex = '10';
//        figure.style.display = 'flex';
//        figure.style.justifyContent = 'center';
//        figure.style.alignItems = 'center';
//        figure.style.textAlign = 'center';
//        figure.style.fontSize = '10px';
//        figure.style.fontWeight = 'bold';
//        figure.style.fontFamily = 'Press Start 2P, sans-serif';

//        figure.dataset.color = thisColor;
//        figure.dataset.shape = thisShape;

//        // --- ТЕКСТ (УРОВЕНЬ 2) ---
//        var textContent = '';
//        if (currentLevel === 2) {
//            var textColor = 'black';
//            if (currentRound === 1 || currentRound === 2) {
//                textContent = shapeNames[thisShape];
//                textColor = (thisColor === 'fuchsia' || thisColor === 'pastelGreen') ? 'white' : 'navy';
//            } else {
//                var confusingKeys = shapeKeys.filter(function (k) { return k !== thisShape; });
//                var randomWrongKey = confusingKeys[Math.floor(Math.random() * confusingKeys.length)];
//                textContent = shapeNames[randomWrongKey];
//                textColor = 'navy';
//                figure.style.textShadow = '1px 1px 1px white';
//            }
//            figure.innerText = textContent;
//            figure.style.color = textColor;
//        }

//        if (currentLevel === 2 && (currentRound === 2 || currentRound === 4)) {
//            figure.dx = (Math.random() - 0.5) * 4;
//            figure.dy = (Math.random() - 0.5) * 4;
//            activeFiguresElements.push(figure);
//        }

//        if (thisShape === 'circle') {
//            figure.style.borderRadius = '50%';
//        } else if (thisShape === 'triangle') {
//            figure.style.backgroundColor = 'transparent';
//            figure.style.width = '0';
//            figure.style.height = '0';
//            figure.style.borderLeft = (size / 2) + 'px solid transparent';
//            figure.style.borderRight = (size / 2) + 'px solid transparent';
//            figure.style.borderBottom = size + 'px solid ' + gameColors[thisColor];

//            if (currentLevel === 2) {
//                var span = document.createElement('span');
//                span.innerText = textContent;
//                span.style.color = figure.style.color;
//                span.style.textShadow = figure.style.textShadow;
//                span.style.position = 'absolute';
//                span.style.left = (-size / 2) + 'px';
//                span.style.width = size + 'px';
//                span.style.textAlign = 'center';
//                span.style.top = (size * 0.6) + 'px';
//                span.style.fontSize = '8px';
//                figure.innerText = '';
//                figure.appendChild(span);
//            }
//        } else if (thisShape === 'rectangle') {
//            figure.style.width = (size * 1.5) + 'px';
//        }

//        figure.addEventListener('mouseenter', function () {
//            figure.style.zIndex = '100';
//            figure.style.transform = 'scale(1.1)';
//        });
//        figure.addEventListener('mouseleave', function () {
//            figure.style.zIndex = '10';
//            figure.style.transform = 'scale(1)';
//        });

//        // --- ЛОГИКА DRAG & DROP ДЛЯ 3 УРОВНЯ ---
//        if (currentLevel === 3) {
//            figure.setAttribute('draggable', true);

//            figure.addEventListener('dragstart', function (e) {
//                draggedFigure = figure;
//                figure.classList.add('dragging');
//                e.dataTransfer.effectAllowed = 'move';
//                e.dataTransfer.setData('text/plain', '');
//            });

//            figure.addEventListener('dragend', function () {
//                draggedFigure = null;
//                figure.classList.remove('dragging');
//            });

//            figure.addEventListener('click', function (e) {
//                figure.style.transform = 'translateX(5px)';
//                setTimeout(function () { figure.style.transform = 'translateX(-5px)'; }, 50);
//                setTimeout(function () { figure.style.transform = 'translateX(0)'; }, 100);
//            });

//        } else {
//            figure.addEventListener('click', function (e) {
//                if (!gameActive) return;
//                e.stopPropagation();

//                if (isFigureCorrect(figure)) {
//                    handleCorrect(figure);
//                } else {
//                    handleIncorrect();
//                }
//            });
//        }

//        gameField.appendChild(figure);
//    }

//    // --- ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ПРОВЕРКИ ---
//    function isFigureCorrect(figureElement) {
//        var clickedColor = figureElement.dataset.color;
//        var clickedShape = figureElement.dataset.shape;

//        if (currentTaskMode === 'color' && clickedColor === targetColorKey) return true;
//        if (currentTaskMode === 'shape' && clickedShape === targetShapeKey) return true;
//        if (currentTaskMode === 'both' && clickedColor === targetColorKey && clickedShape === targetShapeKey) return true;

//        return false;
//    }

//    function handleCorrect(figureElement) {
//        currentScore += 10;
//        scoreDisplay.textContent = currentScore;
//        remainingTargets--;

//        if (currentLevel === 2 && (currentRound === 2 || currentRound === 4)) {
//            var idx = activeFiguresElements.indexOf(figureElement);
//            if (idx > -1) activeFiguresElements.splice(idx, 1);
//        }

//        figureElement.style.transform = 'scale(0)';
//        setTimeout(function () {
//            figureElement.remove();
//        }, 100);

//        saveProgress();

//        if (remainingTargets <= 0) {
//            handleRoundWin();
//        }
//    }

//    function handleIncorrect() {
//        currentScore -= 5;
//        if (currentScore < 0) currentScore = 0;
//        scoreDisplay.textContent = currentScore;
//        saveProgress();
//        timeDisplay.style.color = 'red';
//        setTimeout(function () { timeDisplay.style.color = 'navy'; }, 300);
//    }

//    // --- НАСТРОЙКА ЗОНЫ СБРОСА (DROP ZONE) ---
//    function setupDropZoneEvents(zone) {
//        zone.addEventListener('dragover', function (e) {
//            e.preventDefault();

//            // Проверка во время перетаскивания (для подсветки)
//            if (draggedFigure) {
//                if (isFigureCorrect(draggedFigure)) {
//                    // Правильная фигура
//                    zone.classList.remove('invalid-hover');
//                    zone.classList.add('valid-hover');
//                    zone.innerHTML = 'БРОСАЙ!';
//                } else {
//                    // Неправильная фигура
//                    zone.classList.remove('valid-hover');
//                    zone.classList.add('invalid-hover');
//                    zone.innerHTML = 'НЕ ТА<br>ФИГУРА';
//                }
//            }
//        });

//        zone.addEventListener('dragleave', function () {
//            // Сброс стиля при выходе
//            zone.classList.remove('valid-hover');
//            zone.classList.remove('invalid-hover');
//            zone.innerHTML = 'ПЕРЕТАЩИ<br>СЮДА<br>▼';
//        });

//        zone.addEventListener('drop', function (e) {
//            e.preventDefault();
//            zone.classList.remove('valid-hover');
//            zone.classList.remove('invalid-hover');
//            zone.innerHTML = 'ПЕРЕТАЩИ<br>СЮДА<br>▼';

//            if (draggedFigure) {
//                if (isFigureCorrect(draggedFigure)) {
//                    handleCorrect(draggedFigure);
//                } else {
//                    handleIncorrect();
//                }
//                draggedFigure = null;
//            }
//        });
//    }

//    function startMovementLoop() {
//        moveTimer = setInterval(function () {
//            if (!gameActive) return;

//            var w = gameField.clientWidth;
//            var h = gameField.clientHeight;

//            for (var i = 0; i < activeFiguresElements.length; i++) {
//                var fig = activeFiguresElements[i];

//                var currentX = parseFloat(fig.style.left);
//                var currentY = parseFloat(fig.style.top);
//                var figW = parseFloat(fig.style.width);
//                var figH = parseFloat(fig.style.height);

//                if (fig.style.height === '0px') {
//                    figH = parseFloat(fig.style.borderBottomWidth);
//                    figW = parseFloat(fig.style.borderLeftWidth) * 2;
//                }

//                currentX += fig.dx;
//                currentY += fig.dy;

//                if (currentX <= 0 || currentX + figW >= w) {
//                    fig.dx = -fig.dx;
//                    if (currentX <= 0) currentX = 0;
//                    if (currentX + figW >= w) currentX = w - figW;
//                }

//                if (currentY <= 0 || currentY + figH >= h) {
//                    fig.dy = -fig.dy;
//                    if (currentY <= 0) currentY = 0;
//                    if (currentY + figH >= h) currentY = h - figH;
//                }

//                fig.style.left = currentX + 'px';
//                fig.style.top = currentY + 'px';
//            }
//        }, 20);
//    }

//    function handleRoundWin() {
//        if (moveTimer) clearInterval(moveTimer);
//        clearInterval(gameTimer);
//        gameActive = false;

//        if (currentRound < maxRounds) {
//            levelMessage.textContent = 'РАУНД ' + currentRound + ' ПРОЙДЕН!';
//            levelMessage.style.display = 'block';

//            setTimeout(function () {
//                currentRound++;
//                startRound();
//            }, 2000);
//        } else {
//            finishLevel();
//        }
//    }

//    function finishLevel() {
//        var isLevelUp = (currentLevel < 3);
//        saveProgress(isLevelUp);

//        finalScoreSpan.textContent = currentScore;

//        if (currentLevel < 3) {
//            var nextLvl = currentLevel + 1;
//            winTitle.textContent = "Уровень " + currentLevel + " пройден!";
//            nextLevelBtn.textContent = "Перейти на " + nextLvl + " уровень >>";
//            nextLevelBtn.style.display = 'inline-block';
//            nextLevelBtn.onclick = function () {
//                window.location.reload();
//            };
//        } else {
//            winTitle.textContent = "ПОЗДРАВЛЯЕМ!";
//            document.querySelector('.window-content p').textContent = "Вы прошли ВСЮ игру!";
//            nextLevelBtn.style.display = 'none';
//        }

//        winModal.classList.remove('hidden');
//        winModal.style.display = 'flex';
//    }

//    function endGameLoss() {
//        if (moveTimer) clearInterval(moveTimer);
//        clearInterval(gameTimer);
//        gameActive = false;
//        alert("Время вышло! Попробуем этот раунд заново.");
//        startRound();
//    }

//    function saveProgress(levelUp) {
//        if (levelUp === undefined) levelUp = false;

//        var data = JSON.parse(localStorage.getItem('gameUsers_FindShape'));
//        if (data && data[currentUser]) {
//            data[currentUser].score = currentScore;
//            if (levelUp) {
//                data[currentUser].level = currentLevel + 1;
//            }
//            localStorage.setItem('gameUsers_FindShape', JSON.stringify(data));
//        }
//    }

//    emergencyExitBtn.addEventListener('click', function () {
//        if (confirm('Выйти в меню?')) {
//            sessionStorage.setItem('returnFromGame', 'true');
//            window.location.href = 'index.html';
//        }
//    });

//    exitToMenuBtn.addEventListener('click', function () {
//        sessionStorage.setItem('returnFromGame', 'true');
//        window.location.href = 'index.html';
//    });
//});


















































//document.addEventListener("DOMContentLoaded", function () {

//    // 1. ПРОВЕРКА АВТОРИЗАЦИИ
//    var currentUser = localStorage.getItem('currentSessionUser');
//    if (!currentUser) {
//        alert("Сначала войдите в игру!");
//        window.location.href = 'index.html';
//        return;
//    }

//    // --- ЭЛЕМЕНТЫ DOM ---
//    var gameField = document.getElementById('game-field');
//    var taskText = document.getElementById('task-text');
//    var timeDisplay = document.getElementById('time-display');
//    var scoreDisplay = document.getElementById('score-display');
//    var roundDisplay = document.getElementById('round-display');
//    var levelMessage = document.getElementById('level-message');
//    var playerNameDisplay = document.getElementById('player-name-display');
//    var emergencyExitBtn = document.getElementById('emergency-exit');
//    var winModal = document.getElementById('win-modal');
//    var finalScoreSpan = document.getElementById('final-score');
//    var nextLevelBtn = document.getElementById('next-level-btn');
//    var exitToMenuBtn = document.getElementById('exit-to-menu-btn');
//    var winTitle = document.querySelector('.window-title');

//    // --- НАСТРОЙКИ ---
//    var gameColors = {
//        'fuchsia': '#FF00FF',
//        'pastelBlue': '#34e5f6',
//        'turquoise': '#63FFCF',
//        'pastelGreen': '#77DD77',
//        'pastelYellow': '#FDFD96'
//    };

//    var colorNames = {
//        'fuchsia': 'ЯРКО-РОЗОВЫЙ',
//        'pastelBlue': 'ГОЛУБОЙ',
//        'turquoise': 'БИРЮЗОВЫЙ',
//        'pastelGreen': 'ЗЕЛЕНЫЙ',
//        'pastelYellow': 'ЖЕЛТЫЙ'
//    };

//    var shapeNames = {
//        'square': 'КВАДРАТ',
//        'circle': 'КРУГ',
//        'triangle': 'ТРЕУГ.',
//        'rectangle': 'ПРЯМОУГ.'
//    };

//    // --- СОСТОЯНИЕ ---
//    var savedUsers = JSON.parse(localStorage.getItem('gameUsers_FindShape')) || {};
//    if (!savedUsers[currentUser]) savedUsers[currentUser] = { level: 1, score: 0 };

//    var currentScore = savedUsers[currentUser].score;
//    var currentLevel = savedUsers[currentUser].level;

//    // ТЕПЕРЬ У НАС ЕСТЬ 3 УРОВЕНЬ
//    if (currentLevel > 3) currentLevel = 3;

//    var gameTimer = null;
//    var moveTimer = null;
//    var timeLeft = 0;
//    var currentRound = 1;
//    var maxRounds = 4;

//    var targetColorKey = '';
//    var targetShapeKey = '';
//    var currentTaskMode = 'color';

//    var remainingTargets = 0;
//    var gameActive = false;
//    var placedFigures = [];
//    var activeFiguresElements = [];

//    // Для Drag&Drop
//    var draggedFigure = null; // Какую фигуру тащим

//    playerNameDisplay.textContent = currentUser + " (Ур. " + currentLevel + ")";
//    scoreDisplay.textContent = currentScore;

//    // СТАРТ
//    startRound();

//    // --- ФУНКЦИИ ИГРЫ ---

//    function startRound() {
//        gameActive = true;
//        levelMessage.style.display = 'none';
//        gameField.innerHTML = '';
//        placedFigures = [];
//        activeFiguresElements = [];
//        draggedFigure = null;

//        if (moveTimer) clearInterval(moveTimer);

//        timeLeft = 80 - (currentRound * 10);
//        timeDisplay.textContent = timeLeft;
//        roundDisplay.textContent = currentRound;

//        var colorKeys = Object.keys(gameColors);
//        var shapeKeys = Object.keys(shapeNames);
//        targetColorKey = '';
//        targetShapeKey = '';

//        // --- СОЗДАНИЕ ЗОНЫ ДЛЯ 3 УРОВНЯ ---
//        var dropZoneElement = null;
//        if (currentLevel === 3) {
//            dropZoneElement = document.createElement('div');
//            dropZoneElement.id = 'drop-zone';
//            dropZoneElement.innerHTML = 'ПЕРЕТАЩИ<br>СЮДА<br>▼';
//            gameField.appendChild(dropZoneElement);

//            // Навешиваем события "приема" на зону
//            setupDropZoneEvents(dropZoneElement);
//        }

//        // --- ЛОГИКА ЗАДАНИЙ ---
//        if (currentLevel === 1) {
//            // ... Уровень 1 (без изменений) ...
//            if (currentRound === 1 || currentRound === 2) {
//                currentTaskMode = 'color';
//                targetColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
//                taskText.textContent = 'НАЙДИ ЦВЕТ: ' + colorNames[targetColorKey];
//                taskText.style.color = gameColors[targetColorKey];
//            } else if (currentRound === 3) {
//                currentTaskMode = 'shape';
//                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//                taskText.textContent = 'НАЙДИ ФОРМУ: ' + shapeNames[targetShapeKey];
//                taskText.style.color = 'navy';
//            } else {
//                currentTaskMode = 'both';
//                targetColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
//                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//                taskText.textContent = 'НАЙДИ: ' + colorNames[targetColorKey] + ' ' + shapeNames[targetShapeKey];
//                taskText.style.color = gameColors[targetColorKey];
//            }
//        }
//        else if (currentLevel === 2) {
//            // ... Уровень 2 (без изменений) ...
//            if (currentRound === 1 || currentRound === 2) {
//                currentTaskMode = 'both';
//                targetColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
//                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//                taskText.textContent = 'НАЙДИ: ' + colorNames[targetColorKey] + ' ' + shapeNames[targetShapeKey];
//                taskText.style.color = gameColors[targetColorKey];
//            } else if (currentRound === 3) {
//                currentTaskMode = 'shape';
//                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//                taskText.textContent = 'НАЙДИ ФОРМУ: ' + shapeNames[targetShapeKey] + ' (Не верь надписям!)';
//                taskText.style.color = 'navy';
//            } else {
//                currentTaskMode = 'shape';
//                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//                taskText.textContent = 'ЛОВИ ФОРМУ: ' + shapeNames[targetShapeKey];
//                taskText.style.color = 'red';
//            }
//        }
//        else if (currentLevel === 3) {
//            // === УРОВЕНЬ 3 (Drag & Drop) ===
//            if (currentRound === 1) {
//                // Раунд 1: Перетащить Розовые
//                currentTaskMode = 'color';
//                targetColorKey = 'fuchsia'; // Жестко задали "розовый" как ты просила
//                taskText.textContent = 'ПЕРЕТАЩИ: ЯРКО-РОЗОВЫЕ';
//                taskText.style.color = gameColors['fuchsia'];
//            } else if (currentRound === 2) {
//                // Раунд 2: Перетащить Круги
//                currentTaskMode = 'shape';
//                targetShapeKey = 'circle'; // Жестко задали круг
//                taskText.textContent = 'ПЕРЕТАЩИ: КРУГИ';
//                taskText.style.color = 'navy';
//            } else {
//                // Раунд 3 и 4 (Пока заглушка, сделаем рандом по цвету)
//                currentTaskMode = 'color';
//                targetColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
//                taskText.textContent = 'ПЕРЕТАЩИ: ' + colorNames[targetColorKey];
//                taskText.style.color = gameColors[targetColorKey];
//            }
//        }

//        taskText.style.textShadow = "1px 1px 0 #000";

//        var totalFigures = 20 + (currentRound * 5);
//        if (currentLevel === 3) totalFigures = 15; // На 3 уровне фигур чуть меньше, чтобы удобно таскать
//        remainingTargets = 0;

//        for (var i = 0; i < totalFigures; i++) {
//            createFigure(colorKeys, shapeKeys);
//        }

//        if (remainingTargets === 0) {
//            createFigure(colorKeys, shapeKeys, true);
//        }

//        if (gameTimer) clearInterval(gameTimer);
//        gameTimer = setInterval(function () {
//            timeLeft--;
//            timeDisplay.textContent = timeLeft;
//            if (timeLeft <= 0) {
//                endGameLoss();
//            }
//        }, 1000);

//        if (currentLevel === 2 && (currentRound === 2 || currentRound === 4)) {
//            startMovementLoop();
//        }
//    }

//    function createFigure(colorKeys, shapeKeys, forceTarget) {
//        if (forceTarget === undefined) forceTarget = false;

//        var figure = document.createElement('div');
//        var randomShape = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//        var randomColor = colorKeys[Math.floor(Math.random() * colorKeys.length)];

//        var thisShape = randomShape;
//        var thisColor = randomColor;

//        if (forceTarget) {
//            if (currentTaskMode === 'color') thisColor = targetColorKey;
//            if (currentTaskMode === 'shape') thisShape = targetShapeKey;
//            if (currentTaskMode === 'both') {
//                thisColor = targetColorKey;
//                thisShape = targetShapeKey;
//            }
//        }

//        var isTarget = false;
//        if (currentTaskMode === 'color') {
//            if (thisColor === targetColorKey) isTarget = true;
//        } else if (currentTaskMode === 'shape') {
//            if (thisShape === targetShapeKey) isTarget = true;
//        } else if (currentTaskMode === 'both') {
//            if (thisColor === targetColorKey && thisShape === targetShapeKey) isTarget = true;
//        }

//        if (isTarget) remainingTargets++;

//        var size = Math.floor(Math.random() * 50) + 40;
//        var x, y;
//        var overlap = false;
//        var attempts = 0;

//        // --- ГРАНИЦЫ ---
//        // Если 3 уровень, то ширина поля для спауна меньше (минус 25% справа)
//        var maxW = gameField.clientWidth;
//        if (currentLevel === 3) {
//            maxW = gameField.clientWidth * 0.75; // Только 75% ширины
//        }

//        do {
//            overlap = false;
//            x = Math.floor(Math.random() * (maxW - size));
//            y = Math.floor(Math.random() * (gameField.clientHeight - size));
//            var margin = 5;

//            for (var k = 0; k < placedFigures.length; k++) {
//                var existing = placedFigures[k];
//                if (x < existing.x + existing.size + margin &&
//                    x + size + margin > existing.x &&
//                    y < existing.y + existing.size + margin &&
//                    y + size + margin > existing.y) {
//                    overlap = true;
//                    break;
//                }
//            }
//            attempts++;
//        } while (overlap && attempts < 100);

//        if (overlap && !isTarget) return;

//        placedFigures.push({ x: x, y: y, size: (thisShape === 'rectangle' ? size * 1.5 : size) });

//        figure.style.position = 'absolute';
//        figure.style.left = x + 'px';
//        figure.style.top = y + 'px';
//        figure.style.width = size + 'px';
//        figure.style.height = size + 'px';
//        figure.style.backgroundColor = gameColors[thisColor];

//        // КУРСОР
//        if (currentLevel === 3) {
//            figure.style.cursor = 'grab'; // Рука
//        } else {
//            figure.style.cursor = 'pointer';
//        }

//        figure.style.transition = 'transform 0.1s';
//        figure.style.zIndex = '10';

//        figure.style.display = 'flex';
//        figure.style.justifyContent = 'center';
//        figure.style.alignItems = 'center';
//        figure.style.textAlign = 'center';
//        figure.style.fontSize = '10px';
//        figure.style.fontWeight = 'bold';
//        figure.style.fontFamily = 'Press Start 2P, sans-serif';

//        figure.dataset.color = thisColor;
//        figure.dataset.shape = thisShape;

//        // --- ТЕКСТ (УРОВЕНЬ 2) ---
//        var textContent = '';
//        if (currentLevel === 2) {
//            var textColor = 'black';
//            if (currentRound === 1 || currentRound === 2) {
//                textContent = shapeNames[thisShape];
//                textColor = (thisColor === 'fuchsia' || thisColor === 'pastelGreen') ? 'white' : 'navy';
//            } else {
//                var confusingKeys = shapeKeys.filter(function (k) { return k !== thisShape; });
//                var randomWrongKey = confusingKeys[Math.floor(Math.random() * confusingKeys.length)];
//                textContent = shapeNames[randomWrongKey];
//                textColor = 'navy';
//                figure.style.textShadow = '1px 1px 1px white';
//            }
//            figure.innerText = textContent;
//            figure.style.color = textColor;
//        }

//        if (currentLevel === 2 && (currentRound === 2 || currentRound === 4)) {
//            figure.dx = (Math.random() - 0.5) * 4;
//            figure.dy = (Math.random() - 0.5) * 4;
//            activeFiguresElements.push(figure);
//        }

//        if (thisShape === 'circle') {
//            figure.style.borderRadius = '50%';
//        } else if (thisShape === 'triangle') {
//            figure.style.backgroundColor = 'transparent';
//            figure.style.width = '0';
//            figure.style.height = '0';
//            figure.style.borderLeft = (size / 2) + 'px solid transparent';
//            figure.style.borderRight = (size / 2) + 'px solid transparent';
//            figure.style.borderBottom = size + 'px solid ' + gameColors[thisColor];

//            if (currentLevel === 2) {
//                var span = document.createElement('span');
//                span.innerText = textContent;
//                span.style.color = figure.style.color;
//                span.style.textShadow = figure.style.textShadow;
//                span.style.position = 'absolute';
//                span.style.left = (-size / 2) + 'px';
//                span.style.width = size + 'px';
//                span.style.textAlign = 'center';
//                span.style.top = (size * 0.6) + 'px';
//                span.style.fontSize = '8px';
//                figure.innerText = '';
//                figure.appendChild(span);
//            }
//        } else if (thisShape === 'rectangle') {
//            figure.style.width = (size * 1.5) + 'px';
//        }

//        figure.addEventListener('mouseenter', function () {
//            figure.style.zIndex = '100';
//            figure.style.transform = 'scale(1.1)';
//        });
//        figure.addEventListener('mouseleave', function () {
//            figure.style.zIndex = '10';
//            figure.style.transform = 'scale(1)';
//        });

//        // --- ЛОГИКА DRAG & DROP ДЛЯ 3 УРОВНЯ ---
//        if (currentLevel === 3) {
//            // Разрешаем тащить
//            figure.setAttribute('draggable', true);

//            // Начало перетаскивания
//            figure.addEventListener('dragstart', function (e) {
//                draggedFigure = figure; // Запоминаем, кого тащим
//                figure.classList.add('dragging');
//                // Для Firefox
//                e.dataTransfer.effectAllowed = 'move';
//                e.dataTransfer.setData('text/plain', '');
//            });

//            // Конец перетаскивания (если бросили мимо)
//            figure.addEventListener('dragend', function () {
//                draggedFigure = null;
//                figure.classList.remove('dragging');
//            });

//            // КЛИК ЗАПРЕЩЕН ИЛИ ШТРАФ
//            figure.addEventListener('click', function (e) {
//                // Если кликнул вместо того чтобы тащить - подсказка или штраф
//                // Сделаем просто визуальный эффект "нельзя"
//                figure.style.transform = 'translateX(5px)';
//                setTimeout(function () { figure.style.transform = 'translateX(-5px)'; }, 50);
//                setTimeout(function () { figure.style.transform = 'translateX(0)'; }, 100);
//            });

//        } else {
//            // --- ЛОГИКА КЛИКА (УРОВНИ 1 и 2) ---
//            figure.addEventListener('click', function (e) {
//                if (!gameActive) return;
//                e.stopPropagation();
//                checkAnswer(figure);
//            });
//        }

//        gameField.appendChild(figure);
//    }

//    // --- ФУНКЦИЯ ПРОВЕРКИ ОТВЕТА (Вынесли отдельно, чтобы использовать и в Click, и в Drop) ---
//    function checkAnswer(figureElement) {
//        var clickedColor = figureElement.dataset.color;
//        var clickedShape = figureElement.dataset.shape;
//        var isCorrect = false;

//        if (currentTaskMode === 'color' && clickedColor === targetColorKey) isCorrect = true;
//        else if (currentTaskMode === 'shape' && clickedShape === targetShapeKey) isCorrect = true;
//        else if (currentTaskMode === 'both' && clickedColor === targetColorKey && clickedShape === targetShapeKey) isCorrect = true;

//        if (isCorrect) {
//            currentScore += 10;
//            scoreDisplay.textContent = currentScore;
//            remainingTargets--;

//            if (currentLevel === 2 && (currentRound === 2 || currentRound === 4)) {
//                var idx = activeFiguresElements.indexOf(figureElement);
//                if (idx > -1) activeFiguresElements.splice(idx, 1);
//            }

//            figureElement.style.transform = 'scale(0)';
//            setTimeout(function () {
//                figureElement.remove();
//            }, 100);

//            saveProgress();

//            if (remainingTargets <= 0) {
//                handleRoundWin();
//            }
//        } else {
//            currentScore -= 5;
//            if (currentScore < 0) currentScore = 0;
//            scoreDisplay.textContent = currentScore;
//            saveProgress();
//            timeDisplay.style.color = 'red';
//            setTimeout(function () { timeDisplay.style.color = 'navy'; }, 300);
//        }
//    }

//    // --- НАСТРОЙКА ЗОНЫ СБРОСА (DROP ZONE) ---
//    function setupDropZoneEvents(zone) {
//        // Разрешаем сбрасывать сюда
//        zone.addEventListener('dragover', function (e) {
//            e.preventDefault(); // Обязательно!
//            zone.classList.add('hovered'); // Подсветка
//        });

//        zone.addEventListener('dragleave', function () {
//            zone.classList.remove('hovered');
//        });

//        zone.addEventListener('drop', function (e) {
//            e.preventDefault();
//            zone.classList.remove('hovered');

//            if (draggedFigure) {
//                // Проверяем фигуру
//                checkAnswer(draggedFigure);
//                draggedFigure = null;
//            }
//        });
//    }

//    function startMovementLoop() {
//        moveTimer = setInterval(function () {
//            if (!gameActive) return;

//            var w = gameField.clientWidth;
//            var h = gameField.clientHeight;

//            for (var i = 0; i < activeFiguresElements.length; i++) {
//                var fig = activeFiguresElements[i];

//                var currentX = parseFloat(fig.style.left);
//                var currentY = parseFloat(fig.style.top);
//                var figW = parseFloat(fig.style.width);
//                var figH = parseFloat(fig.style.height);

//                if (fig.style.height === '0px') {
//                    figH = parseFloat(fig.style.borderBottomWidth);
//                    figW = parseFloat(fig.style.borderLeftWidth) * 2;
//                }

//                currentX += fig.dx;
//                currentY += fig.dy;

//                if (currentX <= 0 || currentX + figW >= w) {
//                    fig.dx = -fig.dx;
//                    if (currentX <= 0) currentX = 0;
//                    if (currentX + figW >= w) currentX = w - figW;
//                }

//                if (currentY <= 0 || currentY + figH >= h) {
//                    fig.dy = -fig.dy;
//                    if (currentY <= 0) currentY = 0;
//                    if (currentY + figH >= h) currentY = h - figH;
//                }

//                fig.style.left = currentX + 'px';
//                fig.style.top = currentY + 'px';
//            }
//        }, 20);
//    }

//    function handleRoundWin() {
//        if (moveTimer) clearInterval(moveTimer);
//        clearInterval(gameTimer);
//        gameActive = false;

//        if (currentRound < maxRounds) {
//            levelMessage.textContent = 'РАУНД ' + currentRound + ' ПРОЙДЕН!';
//            levelMessage.style.display = 'block';

//            setTimeout(function () {
//                currentRound++;
//                startRound();
//            }, 2000);
//        } else {
//            finishLevel();
//        }
//    }

//    function finishLevel() {
//        // Проверяем, прошли ли мы уровень
//        // Если был 1 ур -> isLevelUp=true (станет 2)
//        // Если был 2 ур -> isLevelUp=true (станет 3)
//        // Если 3 ур -> конец игры

//        var isLevelUp = (currentLevel < 3);
//        saveProgress(isLevelUp);

//        finalScoreSpan.textContent = currentScore;

//        if (currentLevel < 3) {
//            var nextLvl = currentLevel + 1;
//            winTitle.textContent = "Уровень " + currentLevel + " пройден!";
//            nextLevelBtn.textContent = "Перейти на " + nextLvl + " уровень >>";
//            nextLevelBtn.style.display = 'inline-block';
//            nextLevelBtn.onclick = function () {
//                window.location.reload();
//            };
//        } else {
//            winTitle.textContent = "ПОЗДРАВЛЯЕМ!";
//            document.querySelector('.window-content p').textContent = "Вы прошли ВСЮ игру!";
//            nextLevelBtn.style.display = 'none';
//        }

//        winModal.classList.remove('hidden');
//        winModal.style.display = 'flex';
//    }

//    function endGameLoss() {
//        if (moveTimer) clearInterval(moveTimer);
//        clearInterval(gameTimer);
//        gameActive = false;
//        alert("Время вышло! Попробуем этот раунд заново.");
//        startRound();
//    }

//    function saveProgress(levelUp) {
//        if (levelUp === undefined) levelUp = false;

//        var data = JSON.parse(localStorage.getItem('gameUsers_FindShape'));
//        if (data && data[currentUser]) {
//            data[currentUser].score = currentScore;
//            if (levelUp) {
//                // Поднимаем уровень
//                data[currentUser].level = currentLevel + 1;
//            }
//            localStorage.setItem('gameUsers_FindShape', JSON.stringify(data));
//        }
//    }

//    emergencyExitBtn.addEventListener('click', function () {
//        if (confirm('Выйти в меню?')) {
//            sessionStorage.setItem('returnFromGame', 'true');
//            window.location.href = 'index.html';
//        }
//    });

//    exitToMenuBtn.addEventListener('click', function () {
//        sessionStorage.setItem('returnFromGame', 'true');
//        window.location.href = 'index.html';
//    });
//});




































//document.addEventListener("DOMContentLoaded", function () {

//    // 1. ПРОВЕРКА АВТОРИЗАЦИИ
//    var currentUser = localStorage.getItem('currentSessionUser');
//    if (!currentUser) {
//        alert("Сначала войдите в игру!");
//        window.location.href = 'index.html';
//        return;
//    }

//    // --- ЭЛЕМЕНТЫ DOM ---
//    var gameField = document.getElementById('game-field');
//    var taskText = document.getElementById('task-text');
//    var timeDisplay = document.getElementById('time-display');
//    var scoreDisplay = document.getElementById('score-display');
//    var roundDisplay = document.getElementById('round-display');
//    var levelMessage = document.getElementById('level-message');
//    var playerNameDisplay = document.getElementById('player-name-display');
//    var emergencyExitBtn = document.getElementById('emergency-exit');
//    var winModal = document.getElementById('win-modal');
//    var finalScoreSpan = document.getElementById('final-score');
//    var nextLevelBtn = document.getElementById('next-level-btn');
//    var exitToMenuBtn = document.getElementById('exit-to-menu-btn');
//    var winTitle = document.querySelector('.window-title');

//    // --- НАСТРОЙКИ ---
//    var gameColors = {
//        'fuchsia': '#FF00FF',
//        'pastelBlue': '#34e5f6',
//        'turquoise': '#63FFCF',
//        'pastelGreen': '#77DD77',
//        'pastelYellow': '#FDFD96'
//    };

//    var colorNames = {
//        'fuchsia': 'ЯРКО-РОЗОВЫЙ',
//        'pastelBlue': 'ГОЛУБОЙ',
//        'turquoise': 'БИРЮЗОВЫЙ',
//        'pastelGreen': 'ЗЕЛЕНЫЙ',
//        'pastelYellow': 'ЖЕЛТЫЙ'
//    };

//    var shapeNames = {
//        'square': 'КВАДРАТ',
//        'circle': 'КРУГ',
//        'triangle': 'ТРЕУГОЛ',
//        'rectangle': 'ПРЯМОУГ.'
//    };

//    // --- СОСТОЯНИЕ ---
//    var savedUsers = JSON.parse(localStorage.getItem('gameUsers_FindShape')) || {};
//    if (!savedUsers[currentUser]) savedUsers[currentUser] = { level: 1, score: 0 };

//    var currentScore = savedUsers[currentUser].score;
//    var currentLevel = savedUsers[currentUser].level;

//    if (currentLevel > 2) currentLevel = 2;

//    var gameTimer = null;
//    var moveTimer = null;
//    var timeLeft = 0;
//    var currentRound = 1;
//    var maxRounds = 4;

//    var targetColorKey = '';
//    var targetShapeKey = '';
//    var currentTaskMode = 'color';

//    var remainingTargets = 0;
//    var gameActive = false;
//    var placedFigures = [];
//    var activeFiguresElements = [];

//    playerNameDisplay.textContent = currentUser + " (Ур. " + currentLevel + ")";
//    scoreDisplay.textContent = currentScore;

//    // СТАРТ
//    startRound();

//    // --- ФУНКЦИИ ИГРЫ ---

//    function startRound() {
//        gameActive = true;
//        levelMessage.style.display = 'none';
//        gameField.innerHTML = '';
//        placedFigures = [];
//        activeFiguresElements = [];

//        if (moveTimer) clearInterval(moveTimer);

//        timeLeft = 80 - (currentRound * 10);
//        timeDisplay.textContent = timeLeft;
//        roundDisplay.textContent = currentRound;

//        var colorKeys = Object.keys(gameColors);
//        var shapeKeys = Object.keys(shapeNames);
//        targetColorKey = '';
//        targetShapeKey = '';

//        // --- ЛОГИКА ЗАДАНИЙ ---
//        if (currentLevel === 1) {
//            if (currentRound === 1 || currentRound === 2) {
//                currentTaskMode = 'color';
//                targetColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
//                taskText.textContent = 'НАЙДИ ЦВЕТ: ' + colorNames[targetColorKey];
//                taskText.style.color = gameColors[targetColorKey];
//            } else if (currentRound === 3) {
//                currentTaskMode = 'shape';
//                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//                taskText.textContent = 'НАЙДИ ФОРМУ: ' + shapeNames[targetShapeKey];
//                taskText.style.color = 'navy';
//            } else {
//                currentTaskMode = 'both';
//                targetColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
//                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//                taskText.textContent = 'НАЙДИ: ' + colorNames[targetColorKey] + ' ' + shapeNames[targetShapeKey];
//                taskText.style.color = gameColors[targetColorKey];
//            }
//        }
//        else if (currentLevel === 2) {
//            if (currentRound === 1 || currentRound === 2) {
//                currentTaskMode = 'both';
//                targetColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
//                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//                taskText.textContent = 'НАЙДИ: ' + colorNames[targetColorKey] + ' ' + shapeNames[targetShapeKey];
//                taskText.style.color = gameColors[targetColorKey];
//            } else if (currentRound === 3) {
//                currentTaskMode = 'shape';
//                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//                taskText.textContent = 'НАЙДИ ФОРМУ: ' + shapeNames[targetShapeKey] + ' (Не верь надписям!)';
//                taskText.style.color = 'red';
//            } else {
//                currentTaskMode = 'shape';
//                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//                taskText.textContent = 'ЛОВИ ФОРМУ: ' + shapeNames[targetShapeKey];
//                taskText.style.color = 'red';
//            }
//        }

//        taskText.style.textShadow = "1px 1px 0 #000";

//        var totalFigures = 20 + (currentRound * 5);
//        remainingTargets = 0;

//        for (var i = 0; i < totalFigures; i++) {
//            createFigure(colorKeys, shapeKeys);
//        }

//        if (remainingTargets === 0) {
//            createFigure(colorKeys, shapeKeys, true);
//        }

//        if (gameTimer) clearInterval(gameTimer);
//        gameTimer = setInterval(function () {
//            timeLeft--;
//            timeDisplay.textContent = timeLeft;
//            if (timeLeft <= 0) {
//                endGameLoss();
//            }
//        }, 1000);

//        // --- ЗАПУСК ДВИЖЕНИЯ (Теперь и для 2, и для 4 раунда на 2 уровне) ---
//        if (currentLevel === 2 && (currentRound === 2 || currentRound === 4)) {
//            startMovementLoop();
//        }
//    }

//    function createFigure(colorKeys, shapeKeys, forceTarget) {
//        if (forceTarget === undefined) forceTarget = false;

//        var figure = document.createElement('div');
//        var randomShape = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//        var randomColor = colorKeys[Math.floor(Math.random() * colorKeys.length)];

//        var thisShape = randomShape;
//        var thisColor = randomColor;

//        if (forceTarget) {
//            if (currentTaskMode === 'color') thisColor = targetColorKey;
//            if (currentTaskMode === 'shape') thisShape = targetShapeKey;
//            if (currentTaskMode === 'both') {
//                thisColor = targetColorKey;
//                thisShape = targetShapeKey;
//            }
//        }

//        var isTarget = false;
//        if (currentTaskMode === 'color') {
//            if (thisColor === targetColorKey) isTarget = true;
//        } else if (currentTaskMode === 'shape') {
//            if (thisShape === targetShapeKey) isTarget = true;
//        } else if (currentTaskMode === 'both') {
//            if (thisColor === targetColorKey && thisShape === targetShapeKey) isTarget = true;
//        }

//        if (isTarget) remainingTargets++;

//        var size = Math.floor(Math.random() * 50) + 40;
//        var x, y;
//        var overlap = false;
//        var attempts = 0;

//        do {
//            overlap = false;
//            x = Math.floor(Math.random() * (gameField.clientWidth - size));
//            y = Math.floor(Math.random() * (gameField.clientHeight - size));
//            var margin = 5;

//            for (var k = 0; k < placedFigures.length; k++) {
//                var existing = placedFigures[k];
//                if (x < existing.x + existing.size + margin &&
//                    x + size + margin > existing.x &&
//                    y < existing.y + existing.size + margin &&
//                    y + size + margin > existing.y) {
//                    overlap = true;
//                    break;
//                }
//            }
//            attempts++;
//        } while (overlap && attempts < 100);

//        if (overlap && !isTarget) return;

//        placedFigures.push({ x: x, y: y, size: (thisShape === 'rectangle' ? size * 1.5 : size) });

//        figure.style.position = 'absolute';
//        figure.style.left = x + 'px';
//        figure.style.top = y + 'px';
//        figure.style.width = size + 'px';
//        figure.style.height = size + 'px';
//        figure.style.backgroundColor = gameColors[thisColor];
//        figure.style.cursor = 'pointer';
//        figure.style.transition = 'transform 0.1s';
//        figure.style.zIndex = '10';

//        // Flex для обычных фигур
//        figure.style.display = 'flex';
//        figure.style.justifyContent = 'center';
//        figure.style.alignItems = 'center';
//        figure.style.textAlign = 'center';
//        figure.style.fontSize = '10px';
//        figure.style.fontWeight = 'bold';
//        figure.style.fontFamily = 'Press Start 2P, sans-serif';

//        figure.dataset.color = thisColor;
//        figure.dataset.shape = thisShape;

//        // --- ТЕКСТ (УРОВЕНЬ 2) ---
//        var textContent = '';
//        if (currentLevel === 2) {
//            var textColor = 'black';
//            if (currentRound === 1 || currentRound === 2) {
//                textContent = shapeNames[thisShape];
//                textColor = (thisColor === 'fuchsia' || thisColor === 'pastelGreen') ? 'white' : 'navy';
//            } else {
//                var confusingKeys = shapeKeys.filter(function (k) { return k !== thisShape; });
//                var randomWrongKey = confusingKeys[Math.floor(Math.random() * confusingKeys.length)];
//                textContent = shapeNames[randomWrongKey];
//                textColor = 'navy';
//                figure.style.textShadow = '1px 1px 1px white';
//            }
//            figure.innerText = textContent;
//            figure.style.color = textColor;
//        }

//        // --- ДОБАВЛЕНИЕ В ДВИЖЕНИЕ (Раунд 2 и 4) ---
//        if (currentLevel === 2 && (currentRound === 2 || currentRound === 4)) {
//            figure.dx = (Math.random() - 0.5) * 4;
//            figure.dy = (Math.random() - 0.5) * 4;
//            activeFiguresElements.push(figure);
//        }

//        // --- ФОРМА И КОРРЕКЦИЯ ТЕКСТА ---
//        if (thisShape === 'circle') {
//            figure.style.borderRadius = '50%';
//        }
//        else if (thisShape === 'triangle') {
//            // Треугольник (border-hack)
//            figure.style.backgroundColor = 'transparent';
//            figure.style.width = '0';
//            figure.style.height = '0';
//            figure.style.borderLeft = (size / 2) + 'px solid transparent';
//            figure.style.borderRight = (size / 2) + 'px solid transparent';
//            figure.style.borderBottom = size + 'px solid ' + gameColors[thisColor];

//            // --- СПЕЦИАЛЬНАЯ НАСТРОЙКА ТЕКСТА ДЛЯ ТРЕУГОЛЬНИКА ---
//            if (currentLevel === 2) {
//                var span = document.createElement('span');
//                span.innerText = textContent;
//                span.style.color = figure.style.color;
//                span.style.textShadow = figure.style.textShadow;

//                span.style.position = 'absolute';
//                span.style.left = (-size / 2) + 'px';
//                span.style.width = size + 'px';
//                span.style.textAlign = 'center';

//                span.style.top = (size * 0.6) + 'px';
//                span.style.fontSize = '8px';

//                figure.innerText = '';
//                figure.appendChild(span);
//            }

//        } else if (thisShape === 'rectangle') {
//            figure.style.width = (size * 1.5) + 'px';
//        }

//        // --- СОБЫТИЯ ---
//        figure.addEventListener('mouseenter', function () {
//            figure.style.zIndex = '100';
//            figure.style.transform = 'scale(1.1)';
//        });
//        figure.addEventListener('mouseleave', function () {
//            figure.style.zIndex = '10';
//            figure.style.transform = 'scale(1)';
//        });

//        figure.addEventListener('click', function (e) {
//            if (!gameActive) return;
//            e.stopPropagation();

//            var clickedColor = figure.dataset.color;
//            var clickedShape = figure.dataset.shape;
//            var clickedIsCorrect = false;

//            if (currentTaskMode === 'color' && clickedColor === targetColorKey) clickedIsCorrect = true;
//            else if (currentTaskMode === 'shape' && clickedShape === targetShapeKey) clickedIsCorrect = true;
//            else if (currentTaskMode === 'both' && clickedColor === targetColorKey && clickedShape === targetShapeKey) clickedIsCorrect = true;

//            if (clickedIsCorrect) {
//                currentScore += 10;
//                scoreDisplay.textContent = currentScore;
//                remainingTargets--;

//                // --- УДАЛЕНИЕ ИЗ МАССИВА ДВИЖЕНИЯ (Раунд 2 и 4) ---
//                if (currentLevel === 2 && (currentRound === 2 || currentRound === 4)) {
//                    var idx = activeFiguresElements.indexOf(figure);
//                    if (idx > -1) activeFiguresElements.splice(idx, 1);
//                }

//                figure.style.transform = 'scale(0)';
//                setTimeout(function () {
//                    figure.remove();
//                }, 100);

//                saveProgress();

//                if (remainingTargets <= 0) {
//                    handleRoundWin();
//                }
//            } else {
//                currentScore -= 5;
//                if (currentScore < 0) currentScore = 0;
//                scoreDisplay.textContent = currentScore;
//                saveProgress();
//                timeDisplay.style.color = 'red';
//                setTimeout(function () { timeDisplay.style.color = 'navy'; }, 300);
//            }
//        });

//        gameField.appendChild(figure);
//    }

//    function startMovementLoop() {
//        moveTimer = setInterval(function () {
//            if (!gameActive) return;

//            var w = gameField.clientWidth;
//            var h = gameField.clientHeight;

//            for (var i = 0; i < activeFiguresElements.length; i++) {
//                var fig = activeFiguresElements[i];

//                var currentX = parseFloat(fig.style.left);
//                var currentY = parseFloat(fig.style.top);
//                var figW = parseFloat(fig.style.width);
//                var figH = parseFloat(fig.style.height);

//                if (fig.style.height === '0px') {
//                    figH = parseFloat(fig.style.borderBottomWidth);
//                    figW = parseFloat(fig.style.borderLeftWidth) * 2;
//                }

//                currentX += fig.dx;
//                currentY += fig.dy;

//                if (currentX <= 0 || currentX + figW >= w) {
//                    fig.dx = -fig.dx;
//                    if (currentX <= 0) currentX = 0;
//                    if (currentX + figW >= w) currentX = w - figW;
//                }

//                if (currentY <= 0 || currentY + figH >= h) {
//                    fig.dy = -fig.dy;
//                    if (currentY <= 0) currentY = 0;
//                    if (currentY + figH >= h) currentY = h - figH;
//                }

//                fig.style.left = currentX + 'px';
//                fig.style.top = currentY + 'px';
//            }
//        }, 20);
//    }

//    function handleRoundWin() {
//        if (moveTimer) clearInterval(moveTimer);
//        clearInterval(gameTimer);
//        gameActive = false;

//        if (currentRound < maxRounds) {
//            levelMessage.textContent = 'РАУНД ' + currentRound + ' ПРОЙДЕН!';
//            levelMessage.style.display = 'block';

//            setTimeout(function () {
//                currentRound++;
//                startRound();
//            }, 2000);
//        } else {
//            finishLevel();
//        }
//    }

//    function finishLevel() {
//        var isLevelUp = (currentLevel === 1);
//        saveProgress(isLevelUp);

//        finalScoreSpan.textContent = currentScore;

//        if (currentLevel === 1) {
//            winTitle.textContent = "Уровень 1 пройден!";
//            nextLevelBtn.textContent = "Перейти на 2 уровень >>";
//            nextLevelBtn.style.display = 'inline-block';
//            nextLevelBtn.onclick = function () {
//                window.location.reload();
//            };
//        } else {
//            winTitle.textContent = "ПОЗДРАВЛЯЕМ!";
//            document.querySelector('.window-content p').textContent = "Вы прошли ВСЮ игру!";
//            nextLevelBtn.style.display = 'none';
//        }

//        winModal.classList.remove('hidden');
//        winModal.style.display = 'flex';
//    }

//    function endGameLoss() {
//        if (moveTimer) clearInterval(moveTimer);
//        clearInterval(gameTimer);
//        gameActive = false;
//        alert("Время вышло! Попробуем этот раунд заново.");
//        startRound();
//    }

//    function saveProgress(levelUp) {
//        if (levelUp === undefined) levelUp = false;

//        var data = JSON.parse(localStorage.getItem('gameUsers_FindShape'));
//        if (data && data[currentUser]) {
//            data[currentUser].score = currentScore;
//            if (levelUp) {
//                data[currentUser].level = currentLevel + 1;
//            }
//            localStorage.setItem('gameUsers_FindShape', JSON.stringify(data));
//        }
//    }

//    emergencyExitBtn.addEventListener('click', function () {
//        if (confirm('Выйти в меню?')) {
//            sessionStorage.setItem('returnFromGame', 'true');
//            window.location.href = 'index.html';
//        }
//    });

//    exitToMenuBtn.addEventListener('click', function () {
//        sessionStorage.setItem('returnFromGame', 'true');
//        window.location.href = 'index.html';
//    });
//});








































//document.addEventListener("DOMContentLoaded", function () {

//    // 1. ПРОВЕРКА АВТОРИЗАЦИИ
//    var currentUser = localStorage.getItem('currentSessionUser');
//    if (!currentUser) {
//        alert("Сначала войдите в игру!");
//        window.location.href = 'index.html';
//        return;
//    }

//    // --- ЭЛЕМЕНТЫ DOM ---
//    var gameField = document.getElementById('game-field');
//    var taskText = document.getElementById('task-text');
//    var timeDisplay = document.getElementById('time-display');
//    var scoreDisplay = document.getElementById('score-display');
//    var roundDisplay = document.getElementById('round-display');
//    var levelMessage = document.getElementById('level-message');
//    var playerNameDisplay = document.getElementById('player-name-display');
//    var emergencyExitBtn = document.getElementById('emergency-exit');
//    var winModal = document.getElementById('win-modal');
//    var finalScoreSpan = document.getElementById('final-score');
//    var nextLevelBtn = document.getElementById('next-level-btn');
//    var exitToMenuBtn = document.getElementById('exit-to-menu-btn');
//    var winTitle = document.querySelector('.window-title');

//    // --- НАСТРОЙКИ ---
//    var gameColors = {
//        'fuchsia': '#FF00FF',
//        'pastelBlue': '#34e5f6',
//        'turquoise': '#63FFCF',
//        'pastelGreen': '#77DD77',
//        'pastelYellow': '#FDFD96'
//    };

//    var colorNames = {
//        'fuchsia': 'ЯРКО-РОЗОВЫЙ',
//        'pastelBlue': 'ГОЛУБОЙ',
//        'turquoise': 'БИРЮЗОВЫЙ',
//        'pastelGreen': 'ЗЕЛЕНЫЙ',
//        'pastelYellow': 'ЖЕЛТЫЙ'
//    };

//    var shapeNames = {
//        'square': 'КВАДРАТ',
//        'circle': 'КРУГ',
//        'triangle': 'ТРЕУГ.',
//        'rectangle': 'ПРЯМОУГ.'
//    };

//    // --- СОСТОЯНИЕ ---
//    var savedUsers = JSON.parse(localStorage.getItem('gameUsers_FindShape')) || {};
//    if (!savedUsers[currentUser]) savedUsers[currentUser] = { level: 1, score: 0 };

//    var currentScore = savedUsers[currentUser].score;
//    var currentLevel = savedUsers[currentUser].level;

//    if (currentLevel > 2) currentLevel = 2;

//    var gameTimer = null;
//    var moveTimer = null;
//    var timeLeft = 0;
//    var currentRound = 1;
//    var maxRounds = 4;

//    var targetColorKey = '';
//    var targetShapeKey = '';
//    var currentTaskMode = 'color';

//    var remainingTargets = 0;
//    var gameActive = false;
//    var placedFigures = [];
//    var activeFiguresElements = [];

//    playerNameDisplay.textContent = currentUser + " (Ур. " + currentLevel + ")";
//    scoreDisplay.textContent = currentScore;

//    // СТАРТ
//    startRound();

//    // --- ФУНКЦИИ ИГРЫ ---

//    function startRound() {
//        gameActive = true;
//        levelMessage.style.display = 'none';
//        gameField.innerHTML = '';
//        placedFigures = [];
//        activeFiguresElements = [];

//        if (moveTimer) clearInterval(moveTimer);

//        timeLeft = 80 - (currentRound * 10);
//        timeDisplay.textContent = timeLeft;
//        roundDisplay.textContent = currentRound;

//        var colorKeys = Object.keys(gameColors);
//        var shapeKeys = Object.keys(shapeNames);
//        targetColorKey = '';
//        targetShapeKey = '';

//        // --- ЛОГИКА ЗАДАНИЙ ---
//        if (currentLevel === 1) {
//            if (currentRound === 1 || currentRound === 2) {
//                currentTaskMode = 'color';
//                targetColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
//                taskText.textContent = 'НАЙДИ ЦВЕТ: ' + colorNames[targetColorKey];
//                taskText.style.color = gameColors[targetColorKey];
//            } else if (currentRound === 3) {
//                currentTaskMode = 'shape';
//                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//                taskText.textContent = 'НАЙДИ ФОРМУ: ' + shapeNames[targetShapeKey];
//                taskText.style.color = 'navy';
//            } else {
//                currentTaskMode = 'both';
//                targetColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
//                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//                taskText.textContent = 'НАЙДИ: ' + colorNames[targetColorKey] + ' ' + shapeNames[targetShapeKey];
//                taskText.style.color = gameColors[targetColorKey];
//            }
//        }
//        else if (currentLevel === 2) {
//            if (currentRound === 1 || currentRound === 2) {
//                currentTaskMode = 'both';
//                targetColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
//                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//                taskText.textContent = 'НАЙДИ: ' + colorNames[targetColorKey] + ' ' + shapeNames[targetShapeKey];
//                taskText.style.color = gameColors[targetColorKey];
//            } else if (currentRound === 3) {
//                currentTaskMode = 'shape';
//                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//                taskText.textContent = 'НАЙДИ ФОРМУ: ' + shapeNames[targetShapeKey] + ' (Не верь надписям!)';
//                taskText.style.color = 'navy';
//            } else {
//                currentTaskMode = 'shape';
//                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//                taskText.textContent = 'ЛОВИ ФОРМУ: ' + shapeNames[targetShapeKey];
//                taskText.style.color = 'red';
//            }
//        }

//        taskText.style.textShadow = "1px 1px 0 #000";

//        var totalFigures = 20 + (currentRound * 5);//15
//        remainingTargets = 0;
       
//        for (var i = 0; i < totalFigures; i++) {
//            createFigure(colorKeys, shapeKeys);
//        }

//        if (remainingTargets === 0) {
//            createFigure(colorKeys, shapeKeys, true);
//        }

//        if (gameTimer) clearInterval(gameTimer);
//        gameTimer = setInterval(function () {
//            timeLeft--;
//            timeDisplay.textContent = timeLeft;
//            if (timeLeft <= 0) {
//                endGameLoss();
//            }
//        }, 1000);

//        if (currentLevel === 2 && currentRound === 4) {
//            startMovementLoop();
//        }
//    }

//    function createFigure(colorKeys, shapeKeys, forceTarget) {
//        if (forceTarget === undefined) forceTarget = false;

//        var figure = document.createElement('div');
//        var randomShape = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//        var randomColor = colorKeys[Math.floor(Math.random() * colorKeys.length)];

//        var thisShape = randomShape;
//        var thisColor = randomColor;

//        if (forceTarget) {
//            if (currentTaskMode === 'color') thisColor = targetColorKey;
//            if (currentTaskMode === 'shape') thisShape = targetShapeKey;
//            if (currentTaskMode === 'both') {
//                thisColor = targetColorKey;
//                thisShape = targetShapeKey;
//            }
//        }

//        var isTarget = false;
//        if (currentTaskMode === 'color') {
//            if (thisColor === targetColorKey) isTarget = true;
//        } else if (currentTaskMode === 'shape') {
//            if (thisShape === targetShapeKey) isTarget = true;
//        } else if (currentTaskMode === 'both') {
//            if (thisColor === targetColorKey && thisShape === targetShapeKey) isTarget = true;
//        }

//        if (isTarget) remainingTargets++;

//        var size = Math.floor(Math.random() * 50) + 40;
//        var x, y;
//        var overlap = false;
//        var attempts = 0;

//        do {
//            overlap = false;
//            x = Math.floor(Math.random() * (gameField.clientWidth - size));
//            y = Math.floor(Math.random() * (gameField.clientHeight - size));
//            var margin = 5;

//            for (var k = 0; k < placedFigures.length; k++) {
//                var existing = placedFigures[k];
//                if (x < existing.x + existing.size + margin &&
//                    x + size + margin > existing.x &&
//                    y < existing.y + existing.size + margin &&
//                    y + size + margin > existing.y) {
//                    overlap = true;
//                    break;
//                }
//            }
//            attempts++;
//        } while (overlap && attempts < 100);

//        if (overlap && !isTarget) return;

//        placedFigures.push({ x: x, y: y, size: (thisShape === 'rectangle' ? size * 1.5 : size) });

//        figure.style.position = 'absolute';
//        figure.style.left = x + 'px';
//        figure.style.top = y + 'px';
//        figure.style.width = size + 'px';
//        figure.style.height = size + 'px';
//        figure.style.backgroundColor = gameColors[thisColor];
//        figure.style.cursor = 'pointer';
//        figure.style.transition = 'transform 0.1s';
//        figure.style.zIndex = '10';

//        // Flex для обычных фигур
//        figure.style.display = 'flex';
//        figure.style.justifyContent = 'center';
//        figure.style.alignItems = 'center';
//        figure.style.textAlign = 'center';
//        figure.style.fontSize = '10px';
//        figure.style.fontWeight = 'bold';
//        figure.style.fontFamily = 'Press Start 2P, sans-serif';

//        figure.dataset.color = thisColor;
//        figure.dataset.shape = thisShape;

//        // --- ТЕКСТ (УРОВЕНЬ 2) ---
//        var textContent = '';
//        if (currentLevel === 2) {
//            var textColor = 'black';
//            if (currentRound === 1 || currentRound === 2) {
//                textContent = shapeNames[thisShape];
//                textColor = (thisColor === 'fuchsia' || thisColor === 'pastelGreen') ? 'white' : 'navy';
//            } else {
//                var confusingKeys = shapeKeys.filter(function (k) { return k !== thisShape; });
//                var randomWrongKey = confusingKeys[Math.floor(Math.random() * confusingKeys.length)];
//                textContent = shapeNames[randomWrongKey];
//                textColor = 'navy';
                
//                figure.style.textShadow = '1px 1px 1px white';

//            }
//            figure.innerText = textContent;
//            figure.style.color = textColor;
//        }

//        // --- ДВИЖЕНИЕ ---
//        if (currentLevel === 2 && currentRound === 4) {
//            figure.dx = (Math.random() - 0.5) * 4;
//            figure.dy = (Math.random() - 0.5) * 4;
//            activeFiguresElements.push(figure);
//        }

//        // --- ФОРМА И КОРРЕКЦИЯ ТЕКСТА ---
//        if (thisShape === 'circle') {
//            figure.style.borderRadius = '50%';
//        }
//        else if (thisShape === 'triangle') {
//            // Треугольник (border-hack)
//            figure.style.backgroundColor = 'transparent';
//            figure.style.width = '0';
//            figure.style.height = '0';
//            figure.style.borderLeft = (size / 2) + 'px solid transparent';
//            figure.style.borderRight = (size / 2) + 'px solid transparent';
//            figure.style.borderBottom = size + 'px solid ' + gameColors[thisColor];

//            // --- СПЕЦИАЛЬНАЯ НАСТРОЙКА ТЕКСТА ДЛЯ ТРЕУГОЛЬНИКА ---
//            if (currentLevel === 2) {
//                // Создаем span, так как текст в div'е с нулевой шириной не работает нормально
//                var span = document.createElement('span');
//                span.innerText = textContent;
//                span.style.color = figure.style.color;
//                span.style.textShadow = figure.style.textShadow;

//                // Позиционируем текст
//                span.style.position = 'absolute';
//                span.style.left = (-size / 2) + 'px'; // Центрируем по горизонтали (учитывая, что центр треугольника в 0)
//                span.style.width = size + 'px'; // Ширина равна основанию
//                span.style.textAlign = 'center';

//                // САМОЕ ВАЖНОЕ: Спускаем текст вниз
//                // Топ - это верхушка. Смещаем на 60% высоты (size) вниз
//                span.style.top = (size * 0.6) + 'px';

//                // Уменьшаем шрифт, чтобы влезал в узкую часть
//                span.style.fontSize = '8px';

//                // Очищаем текст родителя, вставляем span
//                figure.innerText = '';
//                figure.appendChild(span);
//            }

//        } else if (thisShape === 'rectangle') {
//            figure.style.width = (size * 1.5) + 'px';
//        }

//        // --- СОБЫТИЯ ---
//        figure.addEventListener('mouseenter', function () {
//            figure.style.zIndex = '100';
//            figure.style.transform = 'scale(1.1)';
//        });
//        figure.addEventListener('mouseleave', function () {
//            figure.style.zIndex = '10';
//            figure.style.transform = 'scale(1)';
//        });

//        figure.addEventListener('click', function (e) {
//            if (!gameActive) return;
//            e.stopPropagation();

//            var clickedColor = figure.dataset.color;
//            var clickedShape = figure.dataset.shape;
//            var clickedIsCorrect = false;

//            if (currentTaskMode === 'color' && clickedColor === targetColorKey) clickedIsCorrect = true;
//            else if (currentTaskMode === 'shape' && clickedShape === targetShapeKey) clickedIsCorrect = true;
//            else if (currentTaskMode === 'both' && clickedColor === targetColorKey && clickedShape === targetShapeKey) clickedIsCorrect = true;

//            if (clickedIsCorrect) {
//                currentScore += 10;
//                scoreDisplay.textContent = currentScore;
//                remainingTargets--;

//                if (currentLevel === 2 && currentRound === 4) {
//                    var idx = activeFiguresElements.indexOf(figure);
//                    if (idx > -1) activeFiguresElements.splice(idx, 1);
//                }

//                figure.style.transform = 'scale(0)';
//                setTimeout(function () {
//                    figure.remove();
//                }, 100);

//                saveProgress();

//                if (remainingTargets <= 0) {
//                    handleRoundWin();
//                }
//            } else {
//                currentScore -= 5;
//                if (currentScore < 0) currentScore = 0;
//                scoreDisplay.textContent = currentScore;
//                saveProgress();
//                timeDisplay.style.color = 'red';
//                setTimeout(function () { timeDisplay.style.color = 'navy'; }, 300);
//            }
//        });

//        gameField.appendChild(figure);
//    }

//    function startMovementLoop() {
//        moveTimer = setInterval(function () {
//            if (!gameActive) return;

//            var w = gameField.clientWidth;
//            var h = gameField.clientHeight;

//            for (var i = 0; i < activeFiguresElements.length; i++) {
//                var fig = activeFiguresElements[i];

//                var currentX = parseFloat(fig.style.left);
//                var currentY = parseFloat(fig.style.top);
//                var figW = parseFloat(fig.style.width);
//                var figH = parseFloat(fig.style.height);

//                if (fig.style.height === '0px') {
//                    figH = parseFloat(fig.style.borderBottomWidth);
//                    figW = parseFloat(fig.style.borderLeftWidth) * 2;
//                }

//                currentX += fig.dx;
//                currentY += fig.dy;

//                if (currentX <= 0 || currentX + figW >= w) {
//                    fig.dx = -fig.dx;
//                    if (currentX <= 0) currentX = 0;
//                    if (currentX + figW >= w) currentX = w - figW;
//                }

//                if (currentY <= 0 || currentY + figH >= h) {
//                    fig.dy = -fig.dy;
//                    if (currentY <= 0) currentY = 0;
//                    if (currentY + figH >= h) currentY = h - figH;
//                }

//                fig.style.left = currentX + 'px';
//                fig.style.top = currentY + 'px';
//            }
//        }, 20);
//    }

//    function handleRoundWin() {
//        if (moveTimer) clearInterval(moveTimer);
//        clearInterval(gameTimer);
//        gameActive = false;

//        if (currentRound < maxRounds) {
//            levelMessage.textContent = 'РАУНД ' + currentRound + ' ПРОЙДЕН!';
//            levelMessage.style.display = 'block';

//            setTimeout(function () {
//                currentRound++;
//                startRound();
//            }, 2000);
//        } else {
//            finishLevel();
//        }
//    }

//    function finishLevel() {
//        var isLevelUp = (currentLevel === 1);
//        saveProgress(isLevelUp);

//        finalScoreSpan.textContent = currentScore;

//        if (currentLevel === 1) {
//            winTitle.textContent = "Уровень 1 пройден!";
//            nextLevelBtn.textContent = "Перейти на 2 уровень >>";
//            nextLevelBtn.style.display = 'inline-block';
//            nextLevelBtn.onclick = function () {
//                window.location.reload();
//            };
//        } else {
//            winTitle.textContent = "ПОЗДРАВЛЯЕМ!";
//            document.querySelector('.window-content p').textContent = "Вы прошли ВСЮ игру!";
//            nextLevelBtn.style.display = 'none';
//        }

//        winModal.classList.remove('hidden');
//        winModal.style.display = 'flex';
//    }

//    function endGameLoss() {
//        if (moveTimer) clearInterval(moveTimer);
//        clearInterval(gameTimer);
//        gameActive = false;
//        alert("Время вышло! Попробуем этот раунд заново.");
//        startRound();
//    }

//    function saveProgress(levelUp) {
//        if (levelUp === undefined) levelUp = false;

//        var data = JSON.parse(localStorage.getItem('gameUsers_FindShape'));
//        if (data && data[currentUser]) {
//            data[currentUser].score = currentScore;
//            if (levelUp) {
//                data[currentUser].level = currentLevel + 1;
//            }
//            localStorage.setItem('gameUsers_FindShape', JSON.stringify(data));
//        }
//    }

//    emergencyExitBtn.addEventListener('click', function () {
//        if (confirm('Выйти в меню?')) {
//            sessionStorage.setItem('returnFromGame', 'true');
//            window.location.href = 'index.html';
//        }
//    });

//    exitToMenuBtn.addEventListener('click', function () {
//        sessionStorage.setItem('returnFromGame', 'true');
//        window.location.href = 'index.html';
//    });
//});






























//document.addEventListener("DOMContentLoaded", function () {

//    // 1. ПРОВЕРКА АВТОРИЗАЦИИ
//    var currentUser = localStorage.getItem('currentSessionUser');
//    if (!currentUser) {
//        alert("Сначала войдите в игру!");
//        window.location.href = 'index.html';
//        return;
//    }

//    // --- ЭЛЕМЕНТЫ DOM ---
//    var gameField = document.getElementById('game-field');
//    var taskText = document.getElementById('task-text');
//    var timeDisplay = document.getElementById('time-display');
//    var scoreDisplay = document.getElementById('score-display');
//    var roundDisplay = document.getElementById('round-display');
//    var levelMessage = document.getElementById('level-message');
//    var playerNameDisplay = document.getElementById('player-name-display');
//    var emergencyExitBtn = document.getElementById('emergency-exit');
//    var winModal = document.getElementById('win-modal');
//    var finalScoreSpan = document.getElementById('final-score');
//    var nextLevelBtn = document.getElementById('next-level-btn');
//    var exitToMenuBtn = document.getElementById('exit-to-menu-btn');
//    var winTitle = document.querySelector('.window-title'); // Заголовок окна победы

//    // --- НАСТРОЙКИ ---
//    var gameColors = {
//        'fuchsia': '#FF00FF',
//        'pastelBlue': '#AEC6CF',
//        'turquoise': '#63FFCF',
//        'pastelGreen': '#77DD77',
//        'pastelYellow': '#FDFD96'
//    };

//    var colorNames = {
//        'fuchsia': 'ЯРКО-РОЗОВЫЙ',
//        'pastelBlue': 'ГОЛУБОЙ',
//        'turquoise': 'БИРЮЗОВЫЙ',
//        'pastelGreen': 'ЗЕЛЕНЫЙ',
//        'pastelYellow': 'ЖЕЛТЫЙ'
//    };

//    var shapeNames = {
//        'square': 'КВАДРАТ',
//        'circle': 'КРУГ',
//        'triangle': 'ТРЕУГ', // Сократим, чтобы влезало
//        'rectangle': 'ПРЯМОУГ'
//    };

//    // --- СОСТОЯНИЕ ---
//    var savedUsers = JSON.parse(localStorage.getItem('gameUsers_FindShape')) || {};
//    if (!savedUsers[currentUser]) savedUsers[currentUser] = { level: 1, score: 0 };

//    var currentScore = savedUsers[currentUser].score;
//    // Определяем ТЕКУЩИЙ УРОВЕНЬ
//    var currentLevel = savedUsers[currentUser].level;

//    // Если игрок прошел все уровни (например, уровень 3, а у нас их 2), то играем на 2-м
//    if (currentLevel > 2) currentLevel = 2;

//    var gameTimer = null;
//    var moveTimer = null; // Таймер для движения фигур
//    var timeLeft = 0;
//    var currentRound = 1;
//    var maxRounds = 4;

//    // Переменные задания
//    var targetColorKey = '';
//    var targetShapeKey = '';
//    var currentTaskMode = 'color'; // 'color', 'shape', 'both'

//    var remainingTargets = 0;
//    var gameActive = false;
//    var placedFigures = []; // Здесь храним координаты для проверки наложения
//    var activeFiguresElements = []; // Здесь храним сами элементы для анимации движения

//    playerNameDisplay.textContent = currentUser + " (Ур. " + currentLevel + ")";
//    scoreDisplay.textContent = currentScore;

//    // СТАРТ
//    startRound();

//    // --- ФУНКЦИИ ИГРЫ ---

//    function startRound() {
//        gameActive = true;
//        levelMessage.style.display = 'none';
//        gameField.innerHTML = '';
//        placedFigures = [];
//        activeFiguresElements = [];

//        // Очищаем таймер движения, если он был
//        if (moveTimer) clearInterval(moveTimer);

//        timeLeft = 80 - (currentRound * 10);
//        timeDisplay.textContent = timeLeft;
//        roundDisplay.textContent = currentRound;

//        // Сбрасываем цели
//        var colorKeys = Object.keys(gameColors);
//        var shapeKeys = Object.keys(shapeNames);
//        targetColorKey = '';
//        targetShapeKey = '';

//        // --- ЛОГИКА ЗАДАНИЙ ПО УРОВНЯМ ---

//        if (currentLevel === 1) {
//            // === УРОВЕНЬ 1 (Классика) ===
//            if (currentRound === 1 || currentRound === 2) {
//                currentTaskMode = 'color';
//                targetColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
//                taskText.textContent = 'НАЙДИ ЦВЕТ: ' + colorNames[targetColorKey];
//                taskText.style.color = gameColors[targetColorKey];
//            } else if (currentRound === 3) {
//                currentTaskMode = 'shape';
//                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//                taskText.textContent = 'НАЙДИ ФОРМУ: ' + shapeNames[targetShapeKey];
//                taskText.style.color = '#FF00FF';
//            } else {
//                currentTaskMode = 'both';
//                targetColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
//                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//                taskText.textContent = 'НАЙДИ: ' + colorNames[targetColorKey] + ' ' + shapeNames[targetShapeKey];
//                taskText.style.color = gameColors[targetColorKey];
//            }
//        }
//        else if (currentLevel === 2) {
//            // === УРОВЕНЬ 2 (С текстом и путаницей) ===
//            if (currentRound === 1 || currentRound === 2) {
//                // Раунд 1-2: Найти по Цвету и Форме (например, Розовые Квадраты)
//                // Надписи ПРАВИЛЬНЫЕ, но цвет надписи отличается
//                currentTaskMode = 'both';
//                targetColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
//                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//                taskText.textContent = 'НАЙДИ: ' + colorNames[targetColorKey] + ' ' + shapeNames[targetShapeKey];
//                taskText.style.color = gameColors[targetColorKey];
//            } else if (currentRound === 3) {
//                // Раунд 3: Найти по ФОРМЕ. Надписи ЗАПУТЫВАЮЩИЕ (неверные).
//                currentTaskMode = 'shape';
//                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//                taskText.textContent = 'НАЙДИ ФОРМУ: ' + shapeNames[targetShapeKey] + ' (Не верь надписям!)';
//                taskText.style.color = '#FF00FF';
//            } else {
//                // Раунд 4: Найти по ФОРМЕ. ДВИЖЕНИЕ. Надписи запутывающие.
//                currentTaskMode = 'shape';
//                targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//                taskText.textContent = 'ЛОВИ ФОРМУ: ' + shapeNames[targetShapeKey];
//                taskText.style.color = 'red';
//            }
//        }

//        taskText.style.textShadow = "1px 1px 0 #000";

//        // Кол-во фигур
//        var totalFigures = 15 + (currentRound * 5);
//        remainingTargets = 0;

//        for (var i = 0; i < totalFigures; i++) {
//            createFigure(colorKeys, shapeKeys);
//        }

//        if (remainingTargets === 0) {
//            createFigure(colorKeys, shapeKeys, true);
//        }

//        // Запуск основного таймера игры
//        if (gameTimer) clearInterval(gameTimer);
//        gameTimer = setInterval(function () {
//            timeLeft--;
//            timeDisplay.textContent = timeLeft;
//            if (timeLeft <= 0) {
//                endGameLoss();
//            }
//        }, 1000);

//        // --- ЗАПУСК ДВИЖЕНИЯ (ТОЛЬКО ДЛЯ УРОВНЯ 2, РАУНД 4) ---
//        if (currentLevel === 2 && currentRound === 4) {
//            startMovementLoop();
//        }
//    }

//    function createFigure(colorKeys, shapeKeys, forceTarget) {
//        if (forceTarget === undefined) forceTarget = false;

//        var figure = document.createElement('div');
//        var randomShape = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//        var randomColor = colorKeys[Math.floor(Math.random() * colorKeys.length)];

//        var thisShape = randomShape;
//        var thisColor = randomColor;

//        // Принудительное создание цели
//        if (forceTarget) {
//            if (currentTaskMode === 'color') thisColor = targetColorKey;
//            if (currentTaskMode === 'shape') thisShape = targetShapeKey;
//            if (currentTaskMode === 'both') {
//                thisColor = targetColorKey;
//                thisShape = targetShapeKey;
//            }
//        }

//        // Проверка цели
//        var isTarget = false;
//        if (currentTaskMode === 'color') {
//            if (thisColor === targetColorKey) isTarget = true;
//        } else if (currentTaskMode === 'shape') {
//            if (thisShape === targetShapeKey) isTarget = true;
//        } else if (currentTaskMode === 'both') {
//            if (thisColor === targetColorKey && thisShape === targetShapeKey) isTarget = true;
//        }

//        if (isTarget) remainingTargets++;

//        // Координаты
//        var size = Math.floor(Math.random() * 50) + 40;
//        var x, y;
//        var overlap = false;
//        var attempts = 0;

//        do {
//            overlap = false;
//            x = Math.floor(Math.random() * (gameField.clientWidth - size));
//            y = Math.floor(Math.random() * (gameField.clientHeight - size));
//            var margin = 5;

//            for (var k = 0; k < placedFigures.length; k++) {
//                var existing = placedFigures[k];
//                if (x < existing.x + existing.size + margin &&
//                    x + size + margin > existing.x &&
//                    y < existing.y + existing.size + margin &&
//                    y + size + margin > existing.y) {
//                    overlap = true;
//                    break;
//                }
//            }
//            attempts++;
//        } while (overlap && attempts < 100);

//        if (overlap && !isTarget) return;

//        placedFigures.push({ x: x, y: y, size: (thisShape === 'rectangle' ? size * 1.5 : size) });

//        // --- СТИЛИ ФИГУРЫ ---
//        figure.style.position = 'absolute';
//        figure.style.left = x + 'px';
//        figure.style.top = y + 'px';
//        figure.style.width = size + 'px';
//        figure.style.height = size + 'px';
//        figure.style.backgroundColor = gameColors[thisColor];
//        figure.style.cursor = 'pointer';
//        figure.style.transition = 'transform 0.2s';
//        figure.style.zIndex = '10';

//        // Flex для центрирования текста
//        figure.style.display = 'flex';
//        figure.style.justifyContent = 'center';
//        figure.style.alignItems = 'center';
//        figure.style.textAlign = 'center';
//        figure.style.fontSize = '10px';
//        figure.style.fontWeight = 'bold';
//        figure.style.fontFamily = 'Press Start 2P, sans-serif'; // Читаемый шрифт

//        figure.dataset.color = thisColor;
//        figure.dataset.shape = thisShape;

//        // --- ЛОГИКА ТЕКСТА (ДЛЯ УРОВНЯ 2) ---
//        if (currentLevel === 2) {
//            var textContent = '';
//            var textColor = 'black'; // По умолчанию

//            if (currentRound === 1 || currentRound === 2) {
//                // Раунд 1-2: Надпись соответствует фигуре (на квадрате "КВАДРАТ"), но цвет надписи случайный
//                textContent = shapeNames[thisShape];
//                // Цвет текста просто белый или черный для контраста
//                textColor = (thisColor === 'fuchsia' || thisColor === 'pastelGreen') ? 'white' : 'navy';
//            } else {
//                // Раунд 3-4: ЗАПУТЫВАНИЕ. На круге написано "КВАДРАТ".
//                // Выбираем случайное имя фигуры, которое НЕ совпадает с текущей
//                var confusingKeys = shapeKeys.filter(function (k) { return k !== thisShape; });
//                var randomWrongKey = confusingKeys[Math.floor(Math.random() * confusingKeys.length)];
//                textContent = shapeNames[randomWrongKey];

//                // Делаем текст ярким, чтобы отвлекал
//                textColor = 'white';
//                figure.style.textShadow = '1px 1px 1px black';
//            }

//            figure.innerText = textContent;
//            figure.style.color = textColor;
//        }

//        // --- ДАННЫЕ ДЛЯ ДВИЖЕНИЯ (ДЛЯ УРОВНЯ 2 РАУНД 4) ---
//        if (currentLevel === 2 && currentRound === 4) {
//            // Задаем скорость dx и dy (от -2 до 2)
//            figure.dx = (Math.random() - 0.5) * 4;
//            figure.dy = (Math.random() - 0.5) * 4;
//            // Сохраняем элемент в массив живых фигур
//            activeFiguresElements.push(figure);
//        }

//        // --- ФОРМА ---
//        if (thisShape === 'circle') {
//            figure.style.borderRadius = '50%';
//        } else if (thisShape === 'triangle') {
//            // Для треугольника текст сложнее разместить, он будет поверх
//            figure.style.backgroundColor = 'transparent';
//            figure.style.width = '0'; figure.style.height = '0';
//            figure.style.borderLeft = (size / 2) + 'px solid transparent';
//            figure.style.borderRight = (size / 2) + 'px solid transparent';
//            figure.style.borderBottom = size + 'px solid ' + gameColors[thisColor];

//            // Текст для треугольника нужно сместить вниз
//            figure.style.alignItems = 'flex-end';
//            figure.style.paddingBottom = '5px';
//            // Убираем flex, чтобы border работал корректно, и ставим текст через псевдо-элемент или вложенный спан
//            // Но чтобы не усложнять CSS, для треугольника во 2 уровне текст сделаем абсолютным внутри
//            var span = document.createElement('span');
//            span.innerText = figure.innerText;
//            span.style.position = 'absolute';
//            span.style.top = (size / 2) + 'px'; // Смещаем вниз
//            span.style.left = (-size / 2) + 'px';
//            span.style.width = size + 'px';
//            span.style.textAlign = 'center';
//            figure.innerText = ''; // Очищаем текст самого дива
//            figure.appendChild(span);

//        } else if (thisShape === 'rectangle') {
//            figure.style.width = (size * 1.5) + 'px';
//        }

//        // --- СОБЫТИЯ ---
//        figure.addEventListener('mouseenter', function () {
//            figure.style.zIndex = '100';
//            figure.style.transform = 'scale(1.1)';
//        });
//        figure.addEventListener('mouseleave', function () {
//            figure.style.zIndex = '10';
//            figure.style.transform = 'scale(1)';
//        });

//        figure.addEventListener('click', function (e) {
//            if (!gameActive) return;
//            e.stopPropagation();

//            var clickedColor = figure.dataset.color;
//            var clickedShape = figure.dataset.shape;
//            var clickedIsCorrect = false;

//            if (currentTaskMode === 'color' && clickedColor === targetColorKey) clickedIsCorrect = true;
//            else if (currentTaskMode === 'shape' && clickedShape === targetShapeKey) clickedIsCorrect = true;
//            else if (currentTaskMode === 'both' && clickedColor === targetColorKey && clickedShape === targetShapeKey) clickedIsCorrect = true;

//            if (clickedIsCorrect) {
//                currentScore += 10;
//                scoreDisplay.textContent = currentScore;
//                remainingTargets--;

//                // Удаляем из массива движущихся фигур, чтобы не было ошибок
//                if (currentLevel === 2 && currentRound === 4) {
//                    var idx = activeFiguresElements.indexOf(figure);
//                    if (idx > -1) activeFiguresElements.splice(idx, 1);
//                }

//                figure.style.transform = 'scale(0)';
//                setTimeout(function () {
//                    figure.remove();
//                }, 200);

//                saveProgress();

//                if (remainingTargets <= 0) {
//                    handleRoundWin();
//                }
//            } else {
//                currentScore -= 5;
//                if (currentScore < 0) currentScore = 0;
//                scoreDisplay.textContent = currentScore;
//                saveProgress();
//                timeDisplay.style.color = 'red';
//                setTimeout(function () { timeDisplay.style.color = 'navy'; }, 300);
//            }
//        });

//        gameField.appendChild(figure);
//    }

//    // --- ФУНКЦИЯ ДВИЖЕНИЯ (Для 4 раунда 2 уровня) ---
//    function startMovementLoop() {
//        // Запускаем таймер, который срабатывает каждые 20мс (50 кадров в секунду)
//        moveTimer = setInterval(function () {
//            if (!gameActive) return;

//            var fieldRect = gameField.getBoundingClientRect();
//            var w = gameField.clientWidth;
//            var h = gameField.clientHeight;

//            // Проходим по всем активным фигурам
//            for (var i = 0; i < activeFiguresElements.length; i++) {
//                var fig = activeFiguresElements[i];

//                // Текущие координаты (парсим из style.left)
//                var currentX = parseFloat(fig.style.left);
//                var currentY = parseFloat(fig.style.top);
//                var figW = parseFloat(fig.style.width); // ширина
//                var figH = parseFloat(fig.style.height);

//                // Для треугольника высота и ширина 0 из-за border, берем borderBottom
//                if (fig.style.height === '0px') {
//                    // Парсим размер из borderBottom
//                    figH = parseFloat(fig.style.borderBottomWidth);
//                    // Ширина треугольника (сумма левой и правой границы)
//                    figW = parseFloat(fig.style.borderLeftWidth) * 2;
//                }

//                // Обновляем позицию
//                currentX += fig.dx;
//                currentY += fig.dy;

//                // Отскок от стенок
//                // Левая или Правая стенка
//                if (currentX <= 0 || currentX + figW >= w) {
//                    fig.dx = -fig.dx; // Меняем направление X
//                    // Корректируем, чтобы не застрял
//                    if (currentX <= 0) currentX = 0;
//                    if (currentX + figW >= w) currentX = w - figW;
//                }

//                // Верхняя или Нижняя стенка
//                if (currentY <= 0 || currentY + figH >= h) {
//                    fig.dy = -fig.dy; // Меняем направление Y
//                    if (currentY <= 0) currentY = 0;
//                    if (currentY + figH >= h) currentY = h - figH;
//                }

//                // Применяем новые координаты
//                fig.style.left = currentX + 'px';
//                fig.style.top = currentY + 'px';
//            }
//        }, 20);
//    }

//    function handleRoundWin() {
//        if (moveTimer) clearInterval(moveTimer); // Останавливаем движение
//        clearInterval(gameTimer);
//        gameActive = false;

//        if (currentRound < maxRounds) {
//            levelMessage.textContent = 'РАУНД ' + currentRound + ' ПРОЙДЕН!';
//            levelMessage.style.display = 'block';

//            setTimeout(function () {
//                currentRound++;
//                startRound();
//            }, 2000);
//        } else {
//            finishLevel();
//        }
//    }

//    function finishLevel() {
//        // Если это был 1 уровень, то мы его прошли -> levelUp = true
//        // Если это был 2 уровень, то это конец игры
//        var isLevelUp = (currentLevel === 1);

//        saveProgress(isLevelUp);

//        finalScoreSpan.textContent = currentScore;

//        if (currentLevel === 1) {
//            winTitle.textContent = "Уровень 1 пройден!";
//            nextLevelBtn.textContent = "Перейти на 2 уровень >>";
//            nextLevelBtn.style.display = 'inline-block';
//            // Обработчик кнопки перехода
//            nextLevelBtn.onclick = function () {
//                // Просто перезагружаем страницу, так как уровень в базе уже 2,
//                // и скрипт сам загрузит логику 2-го уровня
//                window.location.reload();
//            };
//        } else {
//            winTitle.textContent = "ПОЗДРАВЛЯЕМ!";
//            document.querySelector('.window-content p').textContent = "Вы прошли ВСЮ игру!";
//            nextLevelBtn.style.display = 'none'; // Скрываем кнопку "Дальше"
//        }

//        winModal.classList.remove('hidden');
//        winModal.style.display = 'flex';
//    }

//    function endGameLoss() {
//        if (moveTimer) clearInterval(moveTimer);
//        clearInterval(gameTimer);
//        gameActive = false;
//        alert("Время вышло! Попробуем этот раунд заново.");
//        startRound();
//    }

//    function saveProgress(levelUp) {
//        if (levelUp === undefined) levelUp = false;

//        var data = JSON.parse(localStorage.getItem('gameUsers_FindShape'));
//        if (data && data[currentUser]) {
//            data[currentUser].score = currentScore;
//            if (levelUp) {
//                // Повышаем уровень
//                data[currentUser].level = currentLevel + 1;
//            }
//            localStorage.setItem('gameUsers_FindShape', JSON.stringify(data));
//        }
//    }

//    // КНОПКИ
//    emergencyExitBtn.addEventListener('click', function () {
//        if (confirm('Выйти в меню?')) {
//            sessionStorage.setItem('returnFromGame', 'true');
//            window.location.href = 'index.html';
//        }
//    });

//    exitToMenuBtn.addEventListener('click', function () {
//        sessionStorage.setItem('returnFromGame', 'true');
//        window.location.href = 'index.html';
//    });

//    // Обработчик nextLevelBtn теперь динамический в finishLevel
//});


















































//document.addEventListener("DOMContentLoaded", function () {

//    // 1. ПРОВЕРКА АВТОРИЗАЦИИ
//    var currentUser = localStorage.getItem('currentSessionUser');
//    if (!currentUser) {
//        alert("Сначала войдите в игру!");
//        window.location.href = 'index.html';
//        return;
//    }

//    // --- ЭЛЕМЕНТЫ DOM ---
//    var gameField = document.getElementById('game-field');
//    var taskText = document.getElementById('task-text');
//    var timeDisplay = document.getElementById('time-display');
//    var scoreDisplay = document.getElementById('score-display');
//    var roundDisplay = document.getElementById('round-display');
//    var levelMessage = document.getElementById('level-message');
//    var playerNameDisplay = document.getElementById('player-name-display');

//    var emergencyExitBtn = document.getElementById('emergency-exit');
//    var winModal = document.getElementById('win-modal');
//    var finalScoreSpan = document.getElementById('final-score');
//    var nextLevelBtn = document.getElementById('next-level-btn');
//    var exitToMenuBtn = document.getElementById('exit-to-menu-btn');

//    // --- НАСТРОЙКИ ---
//    var gameColors = {
//        'fuchsia': '#FF00FF',
//        'pastelBlue': '#AEC6CF',
//        'turquoise': '#63FFCF',
//        'pastelGreen': '#77DD77',
//        'pastelYellow': '#FDFD96'
//    };

//    var colorNames = {
//        'fuchsia': 'ЯРКО-РОЗОВЫЙ',
//        'pastelBlue': 'ГОЛУБОЙ',
//        'turquoise': 'БИРЮЗОВЫЙ',
//        'pastelGreen': 'ЗЕЛЕНЫЙ',
//        'pastelYellow': 'ЖЕЛТЫЙ'
//    };

//    // Добавили названия фигур для 3 и 4 раунда
//    var shapeNames = {
//        'square': 'КВАДРАТЫ',
//        'circle': 'КРУГИ',
//        'triangle': 'ТРЕУГОЛЬНИКИ',
//        'rectangle': 'ПРЯМОУГОЛЬНИКИ'
//    };

//    // --- СОСТОЯНИЕ ---
//    var savedUsers = JSON.parse(localStorage.getItem('gameUsers_FindShape')) || {};
//    if (!savedUsers[currentUser]) savedUsers[currentUser] = { level: 1, score: 0 };

//    var currentScore = savedUsers[currentUser].score;

//    var gameTimer = null;
//    var timeLeft = 0;
//    var currentRound = 1;
//    var maxRounds = 4;

//    // Переменные задания
//    var targetColorKey = '';
//    var targetShapeKey = '';
//    var currentTaskMode = 'color'; // 'color', 'shape', 'both'

//    var remainingTargets = 0;
//    var gameActive = false;
//    var placedFigures = [];

//    playerNameDisplay.textContent = currentUser;
//    scoreDisplay.textContent = currentScore;

//    // СТАРТ
//    startRound();

//    // --- ФУНКЦИИ ИГРЫ ---

//    function startRound() {
//        gameActive = true;
//        levelMessage.style.display = 'none';
//        gameField.innerHTML = '';
//        placedFigures = [];

//        // Время уменьшается с каждым раундом
//        timeLeft = 80 - (currentRound * 10);
//        timeDisplay.textContent = timeLeft;
//        roundDisplay.textContent = currentRound;

//        // --- ЛОГИКА ВЫБОРА ЗАДАНИЯ ---
//        var colorKeys = Object.keys(gameColors);
//        var shapeKeys = Object.keys(shapeNames);

//        // Сбрасываем цели
//        targetColorKey = '';
//        targetShapeKey = '';

//        if (currentRound === 1 || currentRound === 2) {
//            // РАУНД 1 и 2: Только цвет
//            currentTaskMode = 'color';
//            targetColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];

//            taskText.textContent = 'НАЙДИ ЦВЕТ: ' + colorNames[targetColorKey];
//            taskText.style.color = gameColors[targetColorKey];

//        } else if (currentRound === 3) {
//            // РАУНД 3: Только форма
//            currentTaskMode = 'shape';
//            targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];

//            taskText.textContent = 'НАЙДИ ФОРМУ: ' + shapeNames[targetShapeKey];
//            taskText.style.color = 'navy'; // Цвет текста нейтральный, так как ищем форму

//        } else {
//            // РАУНД 4: Цвет + Форма
//            currentTaskMode = 'both';
//            targetColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
//            targetShapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];

//            // Пример: "НАЙДИ: ЗЕЛЕНЫЙ КРУГИ" (можно подправить окончания, но для курсовой сойдет)
//            taskText.textContent = 'НАЙДИ: ' + colorNames[targetColorKey] + ' ' + shapeNames[targetShapeKey];
//            taskText.style.color = gameColors[targetColorKey];
//        }

//        taskText.style.textShadow = "1px 1px 0 #000";

//        // Кол-во фигур
//        var totalFigures = 15 + (currentRound * 5);
//        remainingTargets = 0;

//        for (var i = 0; i < totalFigures; i++) {
//            createFigure(colorKeys, shapeKeys);
//        }

//        // Гарантия: если рандом не создал ни одной правильной, создаем одну принудительно
//        if (remainingTargets === 0) {
//            createFigure(colorKeys, shapeKeys, true);
//        }

//        if (gameTimer) clearInterval(gameTimer);
//        gameTimer = setInterval(function () {
//            timeLeft--;
//            timeDisplay.textContent = timeLeft;
//            if (timeLeft <= 0) {
//                endGameLoss();
//            }
//        }, 1000);
//    }

//    function createFigure(colorKeys, shapeKeys, forceTarget) {
//        if (forceTarget === undefined) forceTarget = false;

//        var figure = document.createElement('div');

//        // Генерируем случайные свойства
//        var randomShape = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
//        var randomColor = colorKeys[Math.floor(Math.random() * colorKeys.length)];

//        // Определяем свойства этой конкретной фигуры
//        var thisShape = randomShape;
//        var thisColor = randomColor;

//        // Если нужно принудительно создать правильную фигуру
//        if (forceTarget) {
//            if (currentTaskMode === 'color') thisColor = targetColorKey;
//            if (currentTaskMode === 'shape') thisShape = targetShapeKey;
//            if (currentTaskMode === 'both') {
//                thisColor = targetColorKey;
//                thisShape = targetShapeKey;
//            }
//        }

//        // Проверяем, является ли эта фигура целью (Правильной)
//        var isTarget = false;

//        if (currentTaskMode === 'color') {
//            if (thisColor === targetColorKey) isTarget = true;
//        } else if (currentTaskMode === 'shape') {
//            if (thisShape === targetShapeKey) isTarget = true;
//        } else if (currentTaskMode === 'both') {
//            if (thisColor === targetColorKey && thisShape === targetShapeKey) isTarget = true;
//        }

//        if (isTarget) remainingTargets++;

//        // --- КООРДИНАТЫ И ЗАЩИТА ОТ НАЛОЖЕНИЯ ---
//        var size = Math.floor(Math.random() * 50) + 40;
//        var x, y;
//        var overlap = false;
//        var attempts = 0;

//        do {
//            overlap = false;
//            x = Math.floor(Math.random() * (gameField.clientWidth - size));
//            y = Math.floor(Math.random() * (gameField.clientHeight - size));
//            var margin = 5;

//            for (var k = 0; k < placedFigures.length; k++) {
//                var existing = placedFigures[k];
//                if (x < existing.x + existing.size + margin &&
//                    x + size + margin > existing.x &&
//                    y < existing.y + existing.size + margin &&
//                    y + size + margin > existing.y) {
//                    overlap = true;
//                    break;
//                }
//            }
//            attempts++;
//        } while (overlap && attempts < 100);

//        if (overlap && !isTarget) return; // Если места нет и это мусор - не создаем

//        placedFigures.push({ x: x, y: y, size: (thisShape === 'rectangle' ? size * 1.5 : size) });

//        // --- СТИЛИ ---
//        figure.style.position = 'absolute';
//        figure.style.left = x + 'px';
//        figure.style.top = y + 'px';
//        figure.style.width = size + 'px';
//        figure.style.height = size + 'px';
//        figure.style.backgroundColor = gameColors[thisColor];
//        figure.style.cursor = 'pointer';
//        figure.style.transition = 'transform 0.2s';
//        figure.style.zIndex = '10';

//        // Сохраняем данные в элемент для проверки клика
//        figure.dataset.color = thisColor;
//        figure.dataset.shape = thisShape;

//        // Отрисовка формы
//        if (thisShape === 'circle') {
//            figure.style.borderRadius = '50%';
//        } else if (thisShape === 'triangle') {
//            figure.style.backgroundColor = 'transparent';
//            figure.style.width = '0'; figure.style.height = '0';
//            figure.style.borderLeft = (size / 2) + 'px solid transparent';
//            figure.style.borderRight = (size / 2) + 'px solid transparent';
//            figure.style.borderBottom = size + 'px solid ' + gameColors[thisColor];
//        } else if (thisShape === 'rectangle') {
//            figure.style.width = (size * 1.5) + 'px';
//        }

//        // Hover эффект
//        figure.addEventListener('mouseenter', function () {
//            figure.style.zIndex = '100';
//            figure.style.transform = 'scale(1.1)';
//        });
//        figure.addEventListener('mouseleave', function () {
//            figure.style.zIndex = '10';
//            figure.style.transform = 'scale(1)';
//        });

//        // КЛИК ПО ФИГУРЕ
//        figure.addEventListener('click', function (e) {
//            if (!gameActive) return;
//            e.stopPropagation();

//            // Проверяем правильность снова при клике
//            var clickedColor = figure.dataset.color;
//            var clickedShape = figure.dataset.shape;
//            var clickedIsCorrect = false;

//            if (currentTaskMode === 'color' && clickedColor === targetColorKey) clickedIsCorrect = true;
//            else if (currentTaskMode === 'shape' && clickedShape === targetShapeKey) clickedIsCorrect = true;
//            else if (currentTaskMode === 'both' && clickedColor === targetColorKey && clickedShape === targetShapeKey) clickedIsCorrect = true;

//            if (clickedIsCorrect) {
//                // ВЕРНО
//                currentScore += 10;
//                scoreDisplay.textContent = currentScore;
//                remainingTargets--;

//                // Анимация удаления (медленная)
//                figure.style.transition = 'transform 0.2s, opacity 0.2s';
//                figure.style.transform = 'scale(1.1)';
//                figure.style.opacity = '0';

//                setTimeout(function () {
//                    figure.remove();
//                }, 200);

//                saveProgress();

//                if (remainingTargets <= 0) {
//                    handleRoundWin();
//                }
//            } else {
//                // ОШИБКА
//                currentScore -= 5;
//                if (currentScore < 0) currentScore = 0;
//                scoreDisplay.textContent = currentScore;
//                saveProgress();

//                timeDisplay.style.color = 'red';
//                setTimeout(function () { timeDisplay.style.color = 'navy'; }, 300);
//            }
//        });

//        gameField.appendChild(figure);
//    }

//    function handleRoundWin() {
//        clearInterval(gameTimer);
//        gameActive = false;

//        if (currentRound < maxRounds) {
//            levelMessage.textContent = 'РАУНД ' + currentRound + ' ПРОЙДЕН!';
//            levelMessage.style.display = 'block';

//            setTimeout(function () {
//                currentRound++;
//                startRound();
//            }, 2000);
//        } else {
//            finishLevel();
//        }
//    }

//    function finishLevel() {
//        saveProgress(true);
//        finalScoreSpan.textContent = currentScore;
//        winModal.classList.remove('hidden');
//        winModal.style.display = 'flex';
//    }

//    function endGameLoss() {
//        clearInterval(gameTimer);
//        gameActive = false;
//        alert("Время вышло! Попробуем этот раунд заново.");
//        startRound();
//    }

//    function saveProgress(levelUp) {
//        if (levelUp === undefined) levelUp = false;

//        var data = JSON.parse(localStorage.getItem('gameUsers_FindShape'));
//        if (data && data[currentUser]) {
//            data[currentUser].score = currentScore;
//            if (levelUp) {
//                if (data[currentUser].level < 2) data[currentUser].level = 2;
//            }
//            localStorage.setItem('gameUsers_FindShape', JSON.stringify(data));
//        }
//    }

//    // КНОПКИ
//    emergencyExitBtn.addEventListener('click', function () {
//        if (confirm('Выйти в меню?')) {
//            sessionStorage.setItem('returnFromGame', 'true');
//            window.location.href = 'index.html';
//        }
//    });

//    exitToMenuBtn.addEventListener('click', function () {
//        sessionStorage.setItem('returnFromGame', 'true');
//        window.location.href = 'index.html';
//    });

//    nextLevelBtn.addEventListener('click', function () {
//        alert("Уровень 2 в разработке!");
//        sessionStorage.setItem('returnFromGame', 'true');
//        window.location.href = 'index.html';
//    });
//});































// Если за 100 попыток место не нашли (экран забит), просто не создаем фигуру, 
// если только это не целевая (целевую создаем поверх, иначе игру не пройти)
//if (overlap && colorKey !== targetColorKey) {
//    return;
//}






//emergencyExitBtn.addEventListener('click', () => {
//    if (confirm('Выйти в меню?')) {
//        sessionStorage.setItem('returnFromGame', 'true');
//        window.location.href = 'index.html';
//    }
//});
//прогресс сохранчяется даже есои вышли,надо исправить








// КНОПКИ
//emergencyExitBtn.addEventListener('click', () => {
//    if (confirm('Выйти в меню?')) window.location.href = 'index.html';
//});
//exitToMenuBtn.addEventListener('click', () => window.location.href = 'index.html');
//nextLevelBtn.addEventListener('click', () => {
//    alert("Уровень 2 в разработке!");
//    window.location.href = 'index.html';
//});