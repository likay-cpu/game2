document.addEventListener("DOMContentLoaded", function () {
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    function playSound(type) {
        if (audioCtx.state === 'suspended') audioCtx.resume(); // Активируем звук

        var osc = audioCtx.createOscillator(); // Генератор звука
        var gain = audioCtx.createGain(); // Громкость

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
    if (!currentUser) {
        alert("Сначала войдите в игру!");
        window.location.href = 'index.html';
        return;
    }

    
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

    //
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
            if (currentRound === 1 ) {
                currentTaskMode = 'color';
                targetColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
                taskText.textContent = 'НАЙДИ ЦВЕТ: ' + colorNames[targetColorKey];
                taskText.style.color = gameColors[targetColorKey];
            }else if(currentRound===2){
                currentTaskMode = 'color';
                targetColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
                taskText.textContent = 'НАЙДИ ЦВЕТ: ' + colorNames[targetColorKey]+' '+'ЖМИ ДВА РАЗА';
                taskText.style.color = gameColors[targetColorKey];
            }else if (currentRound === 3) {
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

                taskText.textContent = 'ЖМИ БУКВЫ ДЛЯ ФОРМЫ: ' + shapeNames[targetShapeKey]+' '+'(НЕ ВЕРЬ НАДПИСЯМ)';
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

        
        if (currentLevel === 2) {
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

            //if (currentLevel === 2) {
            //    var span = document.createElement('span');
            //    span.innerText = textContent;
            //    span.style.color = figure.style.color;
            //    span.style.textShadow = figure.style.textShadow;
            //    span.style.position = 'absolute';
            //    // шире область текста чтобы слово влезло
            //    span.style.width = (size * 2) + 'px';
            //    span.style.left = (-size) + 'px';

            //    span.style.textAlign = 'center';
            //    span.style.top = (size * 0.65) + 'px';
            //    span.style.fontSize = (size / 11) + 'px';

            //    figure.innerText = '';
            //    figure.appendChild(span);
            //    ////span.style.left = (-size / 2) + 'px';
            //    ////span.style.width = size + 'px';
            //    ////span.style.textAlign = 'center';
            //    ////span.style.top = (size * 0.6) + 'px';
            //    ////span.style.fontSize = '8px';
            //    ////figure.innerText = '';
            //    ////figure.appendChild(span);
            //}
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

            // --- ЛОГИКА КЛИКА (УРОВНИ 1 и 2) ---

            // --- СПЕЦИАЛЬНЫЙ СЛУЧАЙ: 1 УРОВЕНЬ 2 РАУНД - ДВОЙНОЙ КЛИК ---
            if (currentLevel === 1 && currentRound === 2) {

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
                    // Трясем фигуру, намекая, что мало одного клика
                    figure.style.transform = 'rotate(10deg)';
                    setTimeout(function () { figure.style.transform = 'rotate(-10deg)'; }, 100);
                    setTimeout(function () { figure.style.transform = 'rotate(0deg)'; }, 200);
                });

            }

            else {
                figure.addEventListener('click', function (e) {
                    if (!gameActive) return;
                    e.stopPropagation();//остановка всплытия события

                    if (currentLevel === 2 && currentRound === 3) {

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
        playSound('pop'); // Добавить в начало функции
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
        playSound('error'); 
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
        playSound('win');
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


 
    document.addEventListener('keydown', function (e) {
        if (gameActive && currentLevel === 2 && currentRound === 3) {

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
