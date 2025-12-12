document.addEventListener("DOMContentLoaded", () => {
    const splashScreen = document.getElementById('splash-screen');
    const authScreen = document.getElementById('auth-screen');
    const continueScreen = document.getElementById('continue-screen');
    const mainMenu = document.getElementById('main-menu');
    const appHeader = document.getElementById('app-header');
    const leaderboardScreen = document.getElementById('leaderboard-screen');

    const usernameInput = document.getElementById('username-input');
    const loginBtn = document.getElementById('login-btn');
    const continueBtn = document.getElementById('continue-btn');
    const restartBtn = document.getElementById('restart-btn');
    const changeUserBtn = document.getElementById('change-user-btn');
    const headerLogoutBtn = document.getElementById('header-logout-btn');
    const leaderboardBtn = document.getElementById('leaderboard-btn');
    const welcomeName = document.getElementById('welcome-name');
    const startGameCard = document.getElementById('start-game-card');

    const dolphinHelper = document.getElementById('dolphin-helper');
    const helperText = document.getElementById('helper-text');
    const closeHelperBtn = document.getElementById('close-helper-btn');

    const leaderboardBody = document.getElementById('leaderboard-body');
    const closeLeaderboardBtns = document.querySelectorAll('.id-close-leaderboard');

   
    let currentUser = localStorage.getItem('currentSessionUser');

    // загрузка

    //вернулись
    const returningFromGame = sessionStorage.getItem('returnFromGame');

    if (returningFromGame === 'true' && currentUser) {
       
        sessionStorage.removeItem('returnFromGame');

        
        splashScreen.style.display = 'none';
        authScreen.classList.add('hidden');
        enterMainMenu();
    } else {
       
     
        splashScreen.style.display = 'block';

        
        currentUser = null;
        localStorage.removeItem('currentSessionUser');
        authScreen.classList.add('hidden');
        mainMenu.classList.add('hidden');
        continueScreen.classList.add('hidden');
        appHeader.classList.add('hidden');
    }

   /*клик по заставке 2 */
    function hideSplashScreen() {
        if (splashScreen.style.display !== 'none') {
            splashScreen.style.display = 'none';
            authScreen.classList.remove('hidden');
            usernameInput.value = '';
            usernameInput.focus(); // Сразу ставим курсор в поле ввода
        }
    }

    splashScreen.addEventListener('click', hideSplashScreen);

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            hideSplashScreen();
        }
    });

    /*вход */
    loginBtn.addEventListener('click', handleLogin);
    usernameInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });

    function handleLogin() {
        const username = usernameInput.value.trim();
        if (!username) {
            alert("Пожалуйста, введите имя!");
            return;
        }

      
        localStorage.setItem('currentSessionUser', username);
        currentUser = username;

       
        /*const savedUsers = JSON.parse(localStorage.getItem('gameUsers_FindShape')) || {};*/
        //проверка на новчика
        var rawData = localStorage.getItem('gameUsers_FindShape');
        var savedUsers = {}; 

       
        if (rawData !== null) {
            savedUsers = JSON.parse(rawData);//текст в объект
        }

        if (savedUsers[username]) {
            authScreen.classList.add('hidden');
            continueScreen.classList.remove('hidden');
            welcomeName.textContent = username;
        } else {
            savedUsers[username] = { level: 1, score: 0 };
            localStorage.setItem('gameUsers_FindShape', JSON.stringify(savedUsers));//объект в текст
            enterMainMenu();
        }
    }

    //менб и навигация
    function enterMainMenu() {
        authScreen.classList.add('hidden');
        continueScreen.classList.add('hidden');
        appHeader.classList.remove('hidden');
        mainMenu.classList.remove('hidden');
        //dolphinHelper.classList.remove('hidden');
       setTimeout(() => dolphinHelper.classList.remove('hidden'), 1000);
    }

    function logoutUser() {
        localStorage.removeItem('currentSessionUser');
        currentUser = null;

        appHeader.classList.add('hidden');
        mainMenu.classList.add('hidden');
        continueScreen.classList.add('hidden');
        dolphinHelper.classList.add('hidden');
        leaderboardScreen.classList.add('hidden');

        usernameInput.value = '';
        authScreen.classList.remove('hidden');
    }
    continueBtn.addEventListener('click', function () {
        enterMainMenu();
    });

   //сброс
    restartBtn.addEventListener('click', function () {
        var rawData = localStorage.getItem('gameUsers_FindShape');
        var savedUsers = JSON.parse(rawData);

       
        if (savedUsers && savedUsers[currentUser]) {
            var resetPlayer = {};
            resetPlayer.level = 1;
            resetPlayer.score = 0;

            savedUsers[currentUser] = resetPlayer;

            var textToSave = JSON.stringify(savedUsers);
            localStorage.setItem('gameUsers_FindShape', textToSave);
        }

        enterMainMenu();
    });

    changeUserBtn.addEventListener('click', logoutUser);
    headerLogoutBtn.addEventListener('click', logoutUser);

    // играааа
    startGameCard.addEventListener('click', function () {
        if (currentUser) {
            window.location.href = 'game.html';
        }
    });



    // рейтинг
    leaderboardBtn.addEventListener('click', function () {

        var rawData = localStorage.getItem('gameUsers_FindShape');
        var savedUsers = {};

        if (rawData !== null) {
            savedUsers = JSON.parse(rawData);
        }
        var sortedPlayers = []; 
       
        for (var key in savedUsers) {
            if (savedUsers.hasOwnProperty(key)) {
                var playerObj = savedUsers[key];
                playerObj.name = key; //добавляем имя в объект игрока
                sortedPlayers.push(playerObj); 
            }
        }

        sortedPlayers.sort(function (a, b) {
            return b.score - a.score;
        });

       
        leaderboardBody.innerHTML = ''; 

        if (sortedPlayers.length === 0) {
            leaderboardBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Пока пусто...</td></tr>';
        } else {
           
            for (var i = 0; i < sortedPlayers.length; i++) {
                var player = sortedPlayers[i];
                var row = document.createElement('tr');//строчка в таблице

                var htmlString = '<td>' + (i + 1) + '</td>' +
                    '<td>' + player.name + '</td>' +
                    '<td>' + player.level + '</td>' +
                    '<td>' + player.score + '</td>';

                row.innerHTML = htmlString;
                leaderboardBody.appendChild(row);
            }
        }

        leaderboardScreen.classList.remove('hidden');
    });

    
    for (var i = 0; i < closeLeaderboardBtns.length; i++) {
        var btn = closeLeaderboardBtns[i];
        btn.addEventListener('click', function () {
            leaderboardScreen.classList.add('hidden');
        });
    }
    closeHelperBtn.addEventListener('click', function () {
        dolphinHelper.classList.add('hidden');
    });

   
    //уровни
    var levelsBtn = document.getElementById('levels-dropdown-btn');
    var levelsContent = document.getElementById('levels-content');

    levelsBtn.addEventListener('click', function (e) {
        // Останавливаем всплытие, чтобы window click не закрыл сразу же
        e.stopPropagation();
        levelsContent.classList.toggle('show');
    });

    window.addEventListener('click', function (e) {
        if (!e.target.matches('#levels-dropdown-btn')) {
            if (levelsContent.classList.contains('show')) {
                levelsContent.classList.remove('show');
            }
        }
    });

    var levelButtons = document.querySelectorAll('.level-btn');

  
    for (var i = 0; i < levelButtons.length; i++) {
        levelButtons[i].addEventListener('click', function (e) {
            if (!currentUser) {
                alert("Сначала войдите в игру (введите имя)!");
                levelsContent.classList.remove('show');
                return;
            }

            var selectedLevel = parseInt(this.getAttribute('data-level'));

            // Обновляем данные пользователя в LocalStorage
            var savedUsers = JSON.parse(localStorage.getItem('gameUsers_FindShape'));

            if (savedUsers && savedUsers[currentUser]) {
                // ПРИНУДИТЕЛЬНО меняем уровень игрока на выбранный
                savedUsers[currentUser].level = selectedLevel;
                // Сохраняем обратно в базу
                localStorage.setItem('gameUsers_FindShape', JSON.stringify(savedUsers));
            }

            // Записываем сессию (на всякий случай)
            localStorage.setItem('currentSessionUser', currentUser);

            // Переходим в игру (game.js сам считает новый уровень из базы)
            window.location.href = 'game.html';
        });
    }









































































    //leaderboardBtn.addEventListener('click', () => {
    //    const savedUsers = JSON.parse(localStorage.getItem('gameUsers_FindShape')) || {};
    //    const sortedPlayers = Object.keys(savedUsers).map(key => {
    //        return { name: key, ...savedUsers[key] };
    //    }).sort((a, b) => b.score - a.score);

    //    leaderboardBody.innerHTML = '';
    //    if (sortedPlayers.length === 0) {
    //        leaderboardBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Пока пусто...</td></tr>';
    //    } else {
    //        sortedPlayers.forEach((player, index) => {
    //            const row = document.createElement('tr');
    //            row.innerHTML = `<td>${index + 1}</td><td>${player.name}</td><td>${player.level}</td><td>${player.score}</td>`;
    //            leaderboardBody.appendChild(row);
    //        });
    //    }
    //    leaderboardScreen.classList.remove('hidden');
    //});

    //closeLeaderboardBtns.forEach(btn => {
    //    btn.addEventListener('click', () => leaderboardScreen.classList.add('hidden'));
    //});

    //closeHelperBtn.addEventListener('click', () => dolphinHelper.classList.add('hidden'));
});












































































//continueBtn.addEventListener('click', () => enterMainMenu());

//restartBtn.addEventListener('click', () => {
//    const savedUsers = JSON.parse(localStorage.getItem('gameUsers_FindShape'));
//    if (savedUsers && savedUsers[currentUser]) {
//        savedUsers[currentUser] = { level: 1, score: 0 };
//        localStorage.setItem('gameUsers_FindShape', JSON.stringify(savedUsers));
//    }
//    enterMainMenu();
//});

//changeUserBtn.addEventListener('click', logoutUser);
//headerLogoutBtn.addEventListener('click', logoutUser);


//// --- 5. ПЕРЕХОД В ИГРУ ---
//startGameCard.addEventListener('click', () => {
//    if (currentUser) {
//        window.location.href = 'game.html';
//    }
//});





















//document.addEventListener("DOMContentLoaded", () => {
//    // --- ЭЛЕМЕНТЫ ---
//    const splashScreen = document.getElementById('splash-screen');
//    const authScreen = document.getElementById('auth-screen');
//    const continueScreen = document.getElementById('continue-screen');
//    const mainMenu = document.getElementById('main-menu');
//    const appHeader = document.getElementById('app-header');
//    const leaderboardScreen = document.getElementById('leaderboard-screen');

//    const usernameInput = document.getElementById('username-input');
//    const loginBtn = document.getElementById('login-btn');
//    const continueBtn = document.getElementById('continue-btn');
//    const restartBtn = document.getElementById('restart-btn');
//    const changeUserBtn = document.getElementById('change-user-btn');
//    const headerLogoutBtn = document.getElementById('header-logout-btn');
//    const leaderboardBtn = document.getElementById('leaderboard-btn');
//    const welcomeName = document.getElementById('welcome-name');
//    const startGameCard = document.getElementById('start-game-card');

//    const dolphinHelper = document.getElementById('dolphin-helper');
//    const helperText = document.getElementById('helper-text');
//    const closeHelperBtn = document.getElementById('close-helper-btn');

//    const leaderboardBody = document.getElementById('leaderboard-body');
//    const closeLeaderboardBtns = document.querySelectorAll('.id-close-leaderboard');

//    let currentUser = localStorage.getItem('currentSessionUser'); // Пытаемся найти, кто был залогинен

//    // --- 1. ГЛАВНАЯ ПРОВЕРКА ПРИ ЗАГРУЗКЕ ---
//    // Проверяем специальную метку "returnFromGame" (мы ставим её в game.js)
//    const returningFromGame = sessionStorage.getItem('returnFromGame');

//    if (returningFromGame === 'true' && currentUser) {
//        // СЦЕНАРИЙ: Вернулись из игры
//        // 1. Удаляем метку (чтобы при обновлении страницы заставка вернулась)
//        sessionStorage.removeItem('returnFromGame');

//        // 2. Скрываем заставку и показываем меню
//        splashScreen.style.display = 'none';
//        authScreen.classList.add('hidden');
//        enterMainMenu();
//    } else {
//        // СЦЕНАРИЙ: Просто открыли сайт или обновили страницу
//        // Показываем заставку (она и так видна по умолчанию в HTML, но на всякий случай)
//        splashScreen.style.display = 'block';
//    }


//    // --- 2. ЛОГИКА ЗАСТАВКИ ---
//    splashScreen.addEventListener('click', () => {
//        splashScreen.style.display = 'none';

//        // Если мы уже залогинены, то после клика по заставке не просим пароль, а даем выбор "Продолжить"
//        if (currentUser) {
//            showContinueScreen();
//        } else {
//            authScreen.classList.remove('hidden');
//        }
//    });

//    // --- 3. ЛОГИКА ВХОДА ---
//    loginBtn.addEventListener('click', handleLogin);
//    usernameInput.addEventListener('keypress', (e) => {
//        if (e.key === 'Enter') handleLogin();
//    });

//    function handleLogin() {
//        const username = usernameInput.value.trim();
//        if (!username) {
//            alert("Пожалуйста, введите имя!");
//            return;
//        }

//        // Сохраняем пользователя
//        localStorage.setItem('currentSessionUser', username);
//        currentUser = username;

//        const savedUsers = JSON.parse(localStorage.getItem('gameUsers_FindShape')) || {};

//        if (savedUsers[username]) {
//            // Старый пользователь -> Окно продолжения
//            showContinueScreen();
//        } else {
//            // Новый пользователь -> Создаем запись и в Меню
//            savedUsers[username] = { level: 1, score: 0 };
//            localStorage.setItem('gameUsers_FindShape', JSON.stringify(savedUsers));
//            enterMainMenu();
//        }
//    }

//    function showContinueScreen() {
//        authScreen.classList.add('hidden');
//        continueScreen.classList.remove('hidden');
//        welcomeName.textContent = currentUser;
//    }

//    // --- 4. МЕНЮ И НАВИГАЦИЯ ---
//    function enterMainMenu() {
//        authScreen.classList.add('hidden');
//        continueScreen.classList.add('hidden');
//        appHeader.classList.remove('hidden');
//        mainMenu.classList.remove('hidden');

//        // Дельфин
//        setTimeout(() => dolphinHelper.classList.remove('hidden'), 1000);
//    }

//    function logoutUser() {
//        // Удаляем сессию
//        localStorage.removeItem('currentSessionUser');
//        currentUser = null;

//        // Прячем интерфейс
//        appHeader.classList.add('hidden');
//        mainMenu.classList.add('hidden');
//        continueScreen.classList.add('hidden');
//        dolphinHelper.classList.add('hidden');
//        leaderboardScreen.classList.add('hidden');

//        // Возвращаем на вход
//        usernameInput.value = '';
//        authScreen.classList.remove('hidden');
//    }

//    continueBtn.addEventListener('click', () => enterMainMenu());

//    restartBtn.addEventListener('click', () => {
//        const savedUsers = JSON.parse(localStorage.getItem('gameUsers_FindShape'));
//        if (savedUsers && savedUsers[currentUser]) {
//            savedUsers[currentUser] = { level: 1, score: 0 };
//            localStorage.setItem('gameUsers_FindShape', JSON.stringify(savedUsers));
//        }
//        enterMainMenu();
//    });

//    changeUserBtn.addEventListener('click', logoutUser);
//    headerLogoutBtn.addEventListener('click', logoutUser);

//    // --- 5. ПЕРЕХОД В ИГРУ ---
//    startGameCard.addEventListener('click', () => {
//        if (currentUser) {
//            // Идем играть
//            window.location.href = 'game.html';
//        }
//    });

//    // --- 6. РЕЙТИНГ ---
//    leaderboardBtn.addEventListener('click', () => {
//        const savedUsers = JSON.parse(localStorage.getItem('gameUsers_FindShape')) || {};
//        const sortedPlayers = Object.keys(savedUsers).map(key => {
//            return { name: key, ...savedUsers[key] };
//        }).sort((a, b) => b.score - a.score);

//        leaderboardBody.innerHTML = '';
//        if (sortedPlayers.length === 0) {
//            leaderboardBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Пока пусто...</td></tr>';
//        } else {
//            sortedPlayers.forEach((player, index) => {
//                const row = document.createElement('tr');
//                row.innerHTML = `<td>${index + 1}</td><td>${player.name}</td><td>${player.level}</td><td>${player.score}</td>`;
//                leaderboardBody.appendChild(row);
//            });
//        }
//        leaderboardScreen.classList.remove('hidden');
//    });

//    closeLeaderboardBtns.forEach(btn => {
//        btn.addEventListener('click', () => leaderboardScreen.classList.add('hidden'));
//    });

//    // --- 7. ДЕЛЬФИН ---
//    closeHelperBtn.addEventListener('click', () => dolphinHelper.classList.add('hidden'));
//});
























































//document.addEventListener("DOMContentLoaded", () => {
//    // --- ЭЛЕМЕНТЫ ---
//    const splashScreen = document.getElementById('splash-screen');
//    const authScreen = document.getElementById('auth-screen');
//    const continueScreen = document.getElementById('continue-screen');
//    const mainMenu = document.getElementById('main-menu');
//    const appHeader = document.getElementById('app-header');
//    const leaderboardScreen = document.getElementById('leaderboard-screen');

//    const usernameInput = document.getElementById('username-input');
//    const loginBtn = document.getElementById('login-btn');
//    const continueBtn = document.getElementById('continue-btn');
//    const restartBtn = document.getElementById('restart-btn');
//    const changeUserBtn = document.getElementById('change-user-btn');
//    const headerLogoutBtn = document.getElementById('header-logout-btn');
//    const leaderboardBtn = document.getElementById('leaderboard-btn');
//    const welcomeName = document.getElementById('welcome-name');
//    const startGameCard = document.getElementById('start-game-card'); // Кнопка играть

//    const dolphinHelper = document.getElementById('dolphin-helper');
//    const helperText = document.getElementById('helper-text');
//    const closeHelperBtn = document.getElementById('close-helper-btn');

//    const leaderboardBody = document.getElementById('leaderboard-body');
//    const closeLeaderboardBtns = document.querySelectorAll('.id-close-leaderboard');

//    let currentUser = null;

//    // --- 1. ЗАСТАВКА ---
//    splashScreen.addEventListener('click', () => {
//        splashScreen.style.display = 'none';
//        authScreen.classList.remove('hidden');
//    });

//    // --- 2. ВХОД ---
//    loginBtn.addEventListener('click', handleLogin);
//    usernameInput.addEventListener('keypress', (e) => {
//        if (e.key === 'Enter') handleLogin();
//    });

//    function handleLogin() {
//        const username = usernameInput.value.trim();
//        if (!username) {
//            alert("Пожалуйста, введите имя!");
//            return;
//        }
//        const savedUsers = JSON.parse(localStorage.getItem('gameUsers_FindShape')) || {};
//        if (savedUsers[username]) {
//            currentUser = username;
//            authScreen.classList.add('hidden');
//            continueScreen.classList.remove('hidden');
//            welcomeName.textContent = username;
//        } else {
//            currentUser = username;
//            savedUsers[username] = { level: 1, score: 0 };
//            localStorage.setItem('gameUsers_FindShape', JSON.stringify(savedUsers));
//            enterMainMenu();
//        }
//    }

//    // --- 3. МЕНЮ И НАВИГАЦИЯ ---
//    function enterMainMenu() {
//        authScreen.classList.add('hidden');
//        continueScreen.classList.add('hidden');
//        appHeader.classList.remove('hidden');
//        mainMenu.classList.remove('hidden');
//        setTimeout(() => dolphinHelper.classList.remove('hidden'), 1000);
//    }

//    function logoutUser() {
//        appHeader.classList.add('hidden');
//        mainMenu.classList.add('hidden');
//        continueScreen.classList.add('hidden');
//        dolphinHelper.classList.add('hidden');
//        leaderboardScreen.classList.add('hidden');
//        currentUser = null;
//        usernameInput.value = '';
//        authScreen.classList.remove('hidden');
//    }

//    continueBtn.addEventListener('click', () => enterMainMenu());

//    restartBtn.addEventListener('click', () => {
//        const savedUsers = JSON.parse(localStorage.getItem('gameUsers_FindShape'));
//        if (savedUsers && savedUsers[currentUser]) {
//            savedUsers[currentUser] = { level: 1, score: 0 };
//            localStorage.setItem('gameUsers_FindShape', JSON.stringify(savedUsers));
//        }
//        enterMainMenu();
//    });

//    changeUserBtn.addEventListener('click', logoutUser);
//    headerLogoutBtn.addEventListener('click', logoutUser);

//    // --- 4. ПЕРЕХОД НА СТРАНИЦУ ИГРЫ (GAME.HTML) ---
//    startGameCard.addEventListener('click', () => {
//        // Сохраняем имя того, кто сейчас играет, чтобы game.html знал
//        localStorage.setItem('currentSessionUser', currentUser);
//        // Переходим!
//        window.location.href = 'game.html';
//    });

//    // --- 5. РЕЙТИНГ ---
//    leaderboardBtn.addEventListener('click', () => {
//        const savedUsers = JSON.parse(localStorage.getItem('gameUsers_FindShape')) || {};
//        const sortedPlayers = Object.keys(savedUsers).map(key => {
//            return { name: key, ...savedUsers[key] };
//        }).sort((a, b) => b.score - a.score);

//        leaderboardBody.innerHTML = '';
//        if (sortedPlayers.length === 0) {
//            leaderboardBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Пока пусто...</td></tr>';
//        } else {
//            sortedPlayers.forEach((player, index) => {
//                const row = document.createElement('tr');
//                row.innerHTML = `<td>${index + 1}</td><td>${player.name}</td><td>${player.level}</td><td>${player.score}</td>`;
//                leaderboardBody.appendChild(row);
//            });
//        }
//        leaderboardScreen.classList.remove('hidden');
//        closeLeaderboardBtns.forEach(btn => {
//                btn.addEventListener('click', () => {
//                    leaderboardScreen.classList.add('hidden');
//                });
//            });
//    });

   

//    // --- 6. ДЕЛЬФИН ---
//    closeHelperBtn.addEventListener('click', () => dolphinHelper.classList.add('hidden'));
//});









































//document.addEventListener("DOMContentLoaded", () => {
//    // --- ЭЛЕМЕНТЫ ---
//    const splashScreen = document.getElementById('splash-screen');
//    const authScreen = document.getElementById('auth-screen');
//    const continueScreen = document.getElementById('continue-screen');
//    const mainMenu = document.getElementById('main-menu');
//    const appHeader = document.getElementById('app-header');
//    const leaderboardScreen = document.getElementById('leaderboard-screen'); // Новое окно

//    const usernameInput = document.getElementById('username-input');
//    const loginBtn = document.getElementById('login-btn');
//    const continueBtn = document.getElementById('continue-btn');
//    const restartBtn = document.getElementById('restart-btn');
//    const changeUserBtn = document.getElementById('change-user-btn'); // Кнопка в окне приветствия
//    const headerLogoutBtn = document.getElementById('header-logout-btn'); // Кнопка в шапке
//    const leaderboardBtn = document.getElementById('leaderboard-btn'); // Кнопка рейтинга
//    const welcomeName = document.getElementById('welcome-name');

//    const dolphinHelper = document.getElementById('dolphin-helper');
//    const helperText = document.getElementById('helper-text');
//    const closeHelperBtn = document.getElementById('close-helper-btn');

//    const leaderboardBody = document.getElementById('leaderboard-body');
//    const closeLeaderboardBtns = document.querySelectorAll('.id-close-leaderboard');

//    let currentUser = null;

//    // --- 1. ЗАСТАВКА ---
//    splashScreen.addEventListener('click', () => {
//        splashScreen.style.display = 'none';
//        authScreen.classList.remove('hidden');
//    });

//    // --- 2. ЛОГИКА ВХОДА ---
//    loginBtn.addEventListener('click', handleLogin);
//    usernameInput.addEventListener('keypress', (e) => {
//        if (e.key === 'Enter') handleLogin();
//    });

//    function handleLogin() {
//        const username = usernameInput.value.trim();
//        if (!username) {
//            alert("Пожалуйста, введите имя!");
//            return;
//        }

//        const savedUsers = JSON.parse(localStorage.getItem('gameUsers_FindShape')) || {};

//        if (savedUsers[username]) {
//            // Старый пользователь
//            currentUser = username;
//            authScreen.classList.add('hidden');
//            continueScreen.classList.remove('hidden');
//            welcomeName.textContent = username;
//        } else {
//            // Новый пользователь
//            currentUser = username;
//            savedUsers[username] = { level: 1, score: 0 };
//            localStorage.setItem('gameUsers_FindShape', JSON.stringify(savedUsers));
//            enterGame();
//        }
//    }

//    // --- 3. НАВИГАЦИЯ ИГРЫ ---

//    function enterGame() {
//        authScreen.classList.add('hidden');
//        continueScreen.classList.add('hidden');
//        appHeader.classList.remove('hidden');
//        mainMenu.classList.remove('hidden');

//        setTimeout(() => {
//            dolphinHelper.classList.remove('hidden');
//        }, 1000);
//    }

//    // Функция выхода (Смена пользователя)
//    function logoutUser() {
//        // Скрываем игровые экраны
//        appHeader.classList.add('hidden');
//        mainMenu.classList.add('hidden');
//        continueScreen.classList.add('hidden');
//        dolphinHelper.classList.add('hidden');
//        leaderboardScreen.classList.add('hidden');

//        // Очищаем поле и показываем вход
//        currentUser = null;
//        usernameInput.value = '';
//        authScreen.classList.remove('hidden');
//    }

//    // Кнопки "Продолжить" и "Заново"
//    continueBtn.addEventListener('click', () => enterGame());

//    restartBtn.addEventListener('click', () => {
//        const savedUsers = JSON.parse(localStorage.getItem('gameUsers_FindShape'));
//        if (savedUsers && savedUsers[currentUser]) {
//            savedUsers[currentUser] = { level: 1, score: 0 }; // Сброс
//            localStorage.setItem('gameUsers_FindShape', JSON.stringify(savedUsers));
//        }
//        enterGame();
//    });

//    // Кнопки смены пользователя (одна в окне приветствия, одна в шапке)
//    changeUserBtn.addEventListener('click', logoutUser);
//    headerLogoutBtn.addEventListener('click', logoutUser);

//    // --- 4. РЕЙТИНГ (LEADERBOARD) ---

//    leaderboardBtn.addEventListener('click', () => {
//        // 1. Получаем данные
//        const savedUsers = JSON.parse(localStorage.getItem('gameUsers_FindShape')) || {};

//        // 2. Превращаем объект в массив и сортируем по очкам (от большего к меньшему)
//        // Формат: [{name: 'Вася', level: 2, score: 100}, ...]
//        const sortedPlayers = Object.keys(savedUsers).map(key => {
//            return { name: key, ...savedUsers[key] };
//        }).sort((a, b) => b.score - a.score);

//        // 3. Генерируем HTML
//        leaderboardBody.innerHTML = ''; // Очистить старое

//        if (sortedPlayers.length === 0) {
//            leaderboardBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Пока пусто...</td></tr>';
//        } else {
//            sortedPlayers.forEach((player, index) => {
//                const row = document.createElement('tr');
//                row.innerHTML = `
//                    <td>${index + 1}</td>
//                    <td>${player.name}</td>
//                    <td>${player.level}</td>
//                    <td>${player.score}</td>
//                `;
//                leaderboardBody.appendChild(row);
//            });
//        }

//        // 4. Показываем окно
//        leaderboardScreen.classList.remove('hidden');
//    });

//    // Закрытие окна рейтинга (крестик и кнопка)
//    closeLeaderboardBtns.forEach(btn => {
//        btn.addEventListener('click', () => {
//            leaderboardScreen.classList.add('hidden');
//        });
//    });

//    // --- 5. ДЕЛЬФИН И УРОВНИ ---
//    closeHelperBtn.addEventListener('click', () => {
//        dolphinHelper.classList.add('hidden');
//    });

//    const levelButtons = document.querySelectorAll('.level-btn');
//    levelButtons.forEach(btn => {
//        btn.addEventListener('click', (e) => {
//            const dropdown = e.target.closest('.dropdown-content');
//            dropdown.style.display = 'none'; // Фикс закрытия меню
//            setTimeout(() => { dropdown.style.display = ''; }, 500);

//            const levelName = e.target.textContent;
//            helperText.innerHTML = `<span class="pixel-text">Загружаю <b>${levelName}</b>...<br>Удачи, ${currentUser}!</span>`;
//            dolphinHelper.classList.remove('hidden');
//        });
//    });

//    // --- ИГРОВЫЕ ПЕРЕМЕННЫЕ ---
//    // Ссылки на элементы
//    const startGameCard = document.getElementById('start-game-card');
//    const gameScreen = document.getElementById('game-screen');
//    const exitLevelBtn = document.getElementById('exit-level-btn');
//    const gameField = document.getElementById('game-field');
//    const taskText = document.getElementById('task-text');
//    const timeDisplay = document.getElementById('time-display');
//    const scoreDisplay = document.getElementById('score-display');
//    const levelMessage = document.getElementById('level-message');
//    const roundDisplay = document.getElementById('round-display'); // Если добавила в HTML

//    // Настройки цветов (Фуксия и пастельные)
//    const gameColors = {
//        'fuchsia': '#FF00FF',    // Фуксия (яркий)
//        'pastelBlue': '#AEC6CF', // Пастельный голубой
//        'pastelPink': '#FFB7B2', // Пастельный розовый
//        'pastelGreen': '#77DD77',// Пастельный зеленый
//        'pastelYellow': '#FDFD96'// Пастельный желтый
//    };

//    // Перевод цветов на русский для задания
//    const colorNames = {
//        'fuchsia': 'ЯРКО-РОЗОВЫЙ (ФУКСИЯ)',
//        'pastelBlue': 'НЕЖНО-ГОЛУБОЙ',
//        'pastelPink': 'НЕЖНО-РОЗОВЫЙ',
//        'pastelGreen': 'СВЕТЛО-ЗЕЛЕНЫЙ',
//        'pastelYellow': 'СВЕТЛО-ЖЕЛТЫЙ'
//    };

//    // Логика состояния
//    let gameTimer = null;
//    let timeLeft = 0;
//    let currentScore = 0;
//    let currentRound = 1;
//    const maxRounds = 4;
//    let targetColorKey = ''; // Какой цвет ищем (ключ объекта)
//    let remainingTargets = 0; // Сколько фигур осталось найти
//    let gameActive = false;

//    // --- ЗАПУСК ИГРЫ (Кнопка "Играть") ---
//    startGameCard.addEventListener('click', () => {
//        // 1. Сохраняем имя текущего игрока во "временное хранилище", 
//        // чтобы game.html знала, кто играет.
//        localStorage.setItem('currentSessionUser', currentUser);

//        // 2. Переходим на страницу игры
//        window.location.href = 'game.html';
//        //const savedUsers = JSON.parse(localStorage.getItem('gameUsers_FindShape'));
//        //const userData = savedUsers[currentUser];

//        //// Скрываем меню, показываем игру
//        //mainMenu.classList.add('hidden');
//        //gameScreen.classList.remove('hidden');

//        //currentScore = userData.score;
//        //scoreDisplay.textContent = currentScore;

//        //// Запускаем 1-й уровень, 1-й раунд
//        //if (userData.level === 1) {
//        //    currentRound = 1;
//        //    startRound();
//        //} else {
//        //    alert("Уровень в разработке");
//        //    currentRound = 1;
//        //    startRound();
//        //}
//    });

//    // Кнопка Выход
//    exitLevelBtn.addEventListener('click', () => {
//        stopGame();
//        gameScreen.classList.add('hidden');
//        mainMenu.classList.remove('hidden');
//        saveProgress();
//    });

//    // --- ГЛАВНАЯ ФУНКЦИЯ РАУНДА ---
//    function startRound() {
//        gameActive = true;
//        levelMessage.style.display = 'none'; // Скрыть сообщение
//        gameField.innerHTML = ''; // Очистить поле

//        // 1. Настройка времени (70, 60, 50, 40)
//        // Формула: 80 - (номер раунда * 10).
//        // Раунд 1: 80-10=70. Раунд 4: 80-40=40.
//        timeLeft = 80 - (currentRound * 10);
//        timeDisplay.textContent = timeLeft;
//        if (roundDisplay) roundDisplay.textContent = currentRound; // Обновить цифру раунда

//        // 2. Выбор цвета задания
//        const keys = Object.keys(gameColors);
//        targetColorKey = keys[Math.floor(Math.random() * keys.length)];

//        taskText.textContent = `НАЙДИ ЦВЕТ: ${colorNames[targetColorKey]}!`;
//        taskText.style.color = gameColors[targetColorKey]; // Покрасим текст в нужный цвет

//        // Подсказка дельфина
//        helperText.innerHTML = `Раунд ${currentRound}!<br>Ищи цвет:<br><b style="color:${gameColors[targetColorKey]}; background:black; padding:2px;">${colorNames[targetColorKey]}</b>`;
//        dolphinHelper.classList.remove('hidden');

//        // 3. Генерация фигур
//        // Чем выше раунд, тем больше фигур "мусора", чтобы было сложнее
//        let totalFigures = 15 + (currentRound * 5);
//        remainingTargets = 0; // Сброс счетчика

//        for (let i = 0; i < totalFigures; i++) {
//            createFigure(keys);
//        }

//        // Если вдруг рандом не создал ни одной нужной фигуры (бывает такое), создадим одну принудительно
//        if (remainingTargets === 0) {
//            createFigure(keys, true); // true = принудительно нужный цвет
//        }

//        // 4. Запуск таймера
//        clearInterval(gameTimer);
//        gameTimer = setInterval(() => {
//            timeLeft--;
//            timeDisplay.textContent = timeLeft;
//            if (timeLeft <= 0) {
//                endGame(false); // Проигрыш
//            }
//        }, 1000);
//    }

//    function createFigure(colorKeys, forceTarget = false) {
//        const figure = document.createElement('div');

//        // Выбор формы
//        const shapes = ['square', 'circle', 'triangle', 'rectangle'];
//        const shape = shapes[Math.floor(Math.random() * shapes.length)];

//        // Выбор цвета
//        let colorKey;
//        if (forceTarget) {
//            colorKey = targetColorKey;
//        } else {
//            colorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
//        }

//        // Если этот цвет целевой, увеличиваем счетчик того, что надо найти
//        if (colorKey === targetColorKey) {
//            remainingTargets++;
//        }

//        // Размеры и позиция
//        const size = Math.floor(Math.random() * 50) + 40; // 40-90px
//        const x = Math.floor(Math.random() * (gameField.clientWidth - size));
//        const y = Math.floor(Math.random() * (gameField.clientHeight - size));

//        // Применяем стили
//        figure.style.position = 'absolute';
//        figure.style.left = `${x}px`;
//        figure.style.top = `${y}px`;
//        figure.style.width = `${size}px`;
//        figure.style.height = `${size}px`;
//        figure.style.backgroundColor = gameColors[colorKey];
//        figure.style.transition = 'transform 0.1s, opacity 0.2s';
//        figure.style.cursor = 'pointer';
//        figure.classList.add('game-figure'); // для общих стилей

//        // Форма
//        if (shape === 'circle') {
//            figure.style.borderRadius = '50%';
//        } else if (shape === 'triangle') {
//            figure.style.width = '0';
//            figure.style.height = '0';
//            figure.style.backgroundColor = 'transparent';
//            figure.style.borderLeft = `${size / 2}px solid transparent`;
//            figure.style.borderRight = `${size / 2}px solid transparent`;
//            figure.style.borderBottom = `${size}px solid ${gameColors[colorKey]}`;
//        } else if (shape === 'rectangle') {
//            figure.style.width = `${size * 1.5}px`; // Чуть шире
//        }

//        // Привязка данных
//        figure.dataset.color = colorKey;

//        // --- КЛИК ПО ФИГУРЕ ---
//        figure.addEventListener('click', (e) => {
//            if (!gameActive) return;

//            // Фикс для треугольника (клик может попасть в border)
//            // Берем цвет из dataset
//            const clickedColor = figure.dataset.color;

//            if (clickedColor === targetColorKey) {
//                // ВЕРНО
//                currentScore += 10;
//                scoreDisplay.textContent = currentScore;
//                remainingTargets--; // Минус одна цель

//                // Анимация исчезновения
//                figure.style.transform = 'scale(1.2)';
//                figure.style.opacity = '0';
//                setTimeout(() => figure.remove(), 200);

//                // ПРОВЕРКА ПОБЕДЫ В РАУНДЕ
//                if (remainingTargets <= 0) {
//                    handleRoundWin();
//                }
//            } else {
//                // ОШИБКА
//                currentScore -= 5; // Штраф
//                if (currentScore < 0) currentScore = 0;
//                scoreDisplay.textContent = currentScore;

//                // Тряска экрана или красная вспышка
//                gameScreen.style.backgroundColor = '#ffcccc';
//                setTimeout(() => gameScreen.style.backgroundColor = '', 200);
//            }
//        });

//        gameField.appendChild(figure);
//    }

//    // --- ЛОГИКА ПЕРЕХОДА МЕЖДУ РАУНДАМИ ---
//    function handleRoundWin() {
//        clearInterval(gameTimer);
//        gameActive = false;

//        if (currentRound < maxRounds) {
//            // ЕСТЬ ЕЩЕ РАУНДЫ
//            levelMessage.textContent = `РАУНД ${currentRound} ПРОЙДЕН!`;
//            levelMessage.style.display = 'block';

//            setTimeout(() => {
//                currentRound++;
//                startRound(); // Запуск следующего
//            }, 2000); // Пауза 2 секунды перед следующим раундом
//        } else {
//            // ВСЕ РАУНДЫ ПРОЙДЕНЫ (ПОБЕДА В УРОВНЕ)
//            levelMessage.textContent = `УРОВЕНЬ 1 ЗАВЕРШЕН!`;
//            levelMessage.style.display = 'block';
//            helperText.innerHTML = "Ты супер!<br>Фигуры повержены.";

//            setTimeout(() => {
//                saveProgress(true); // Сохранить и повысить уровень
//                stopGame();
//                gameScreen.classList.add('hidden');
//                mainMenu.classList.remove('hidden');
//            }, 3000);
//        }
//    }

//    function endGame(win) {
//        stopGame();
//        if (!win) {
//            alert(`Время вышло! Вы набрали ${currentScore} очков.`);
//            gameScreen.classList.add('hidden');
//            mainMenu.classList.remove('hidden');
//            saveProgress(); // Просто сохранить очки
//        }
//    }

//    function stopGame() {
//        gameActive = false;
//        clearInterval(gameTimer);
//    }

//    function saveProgress(levelUp = false) {
//        const savedUsers = JSON.parse(localStorage.getItem('gameUsers_FindShape'));
//        if (savedUsers && savedUsers[currentUser]) {
//            // Обновляем рекорд, если текущие очки больше
//            if (currentScore > savedUsers[currentUser].score) {
//                savedUsers[currentUser].score = currentScore;
//            }

//            if (levelUp) {
//                savedUsers[currentUser].level = 2; // Открываем 2 уровень
//            }
//            localStorage.setItem('gameUsers_FindShape', JSON.stringify(savedUsers));
//        }
//    }











   


//});
































//document.addEventListener("DOMContentLoaded", () => {
//    // Получаем элементы со страницы
//    const splashScreen = document.getElementById('splash-screen');
//    const authScreen = document.getElementById('auth-screen');
//    const continueScreen = document.getElementById('continue-screen');
//    const mainMenu = document.getElementById('main-menu');
//    const appHeader = document.getElementById('app-header');

//    const usernameInput = document.getElementById('username-input');
//    const loginBtn = document.getElementById('login-btn');
//    const continueBtn = document.getElementById('continue-btn');
//    const restartBtn = document.getElementById('restart-btn');
//    const changeUserBtn = document.getElementById('change-user-btn');
//    const welcomeName = document.getElementById('welcome-name');

//    const dolphinHelper = document.getElementById('dolphin-helper');
//    const helperText = document.getElementById('helper-text');
//    const closeHelperBtn = document.getElementById('close-helper-btn');

//    let currentUser = null;

//    // --- 1. ЭКРАН ЗАСТАВКИ ---
//    // Клик в любом месте убирает заставку и открывает вход
//    splashScreen.addEventListener('click', () => {
//        splashScreen.style.display = 'none';
//        authScreen.classList.remove('hidden');
//    });

//    // --- 2. ЛОГИКА ВХОДА ---
//    loginBtn.addEventListener('click', handleLogin);

//    // Также можно нажать Enter в поле ввода
//    usernameInput.addEventListener('keypress', (e) => {
//        if (e.key === 'Enter') handleLogin();
//    });

//    function handleLogin() {
//        const username = usernameInput.value.trim();

//        if (!username) {
//            alert("Пожалуйста, введите имя!");
//            return;
//        }

//        // Проверяем LocalStorage (база данных в браузере)
//        const savedUsers = JSON.parse(localStorage.getItem('gameUsers_FindShape')) || {};

//        if (savedUsers[username]) {
//            // Пользователь найден -> Показываем окно "Продолжить"
//            currentUser = username;
//            authScreen.classList.add('hidden');
//            continueScreen.classList.remove('hidden');
//            welcomeName.textContent = username;
//        } else {
//            // Новый пользователь -> Создаем и пускаем в игру
//            currentUser = username;
//            // Сохраняем нового пользователя
//            savedUsers[username] = { level: 1, score: 0 };
//            localStorage.setItem('gameUsers_FindShape', JSON.stringify(savedUsers));

//            enterGame();
//        }
//    }

//    // --- 3. КНОПКИ В ОКНЕ ПОДТВЕРЖДЕНИЯ ---

//    // Кнопка "Продолжить"
//    continueBtn.addEventListener('click', () => enterGame());

//    // Кнопка "Начать заново"
//    restartBtn.addEventListener('click', () => {
//        // Сброс очков
//        const savedUsers = JSON.parse(localStorage.getItem('gameUsers_FindShape'));
//        if (savedUsers && savedUsers[currentUser]) {
//            savedUsers[currentUser] = { level: 1, score: 0 };
//            localStorage.setItem('gameUsers_FindShape', JSON.stringify(savedUsers));
//        }
//        enterGame();
//    });

//    // Кнопка "Сменить пользователя"
//    changeUserBtn.addEventListener('click', () => {
//        continueScreen.classList.add('hidden');
//        authScreen.classList.remove('hidden');
//        usernameInput.value = '';
//    });

//    // --- 4. ВХОД В ИГРУ (ГЛАВНОЕ МЕНЮ) ---
//    function enterGame() {
//        authScreen.classList.add('hidden');
//        continueScreen.classList.add('hidden');
//        appHeader.classList.remove('hidden');
//        mainMenu.classList.remove('hidden');

//        // Дельфин всплывает через 1 секунду
//        setTimeout(() => {
//            dolphinHelper.classList.remove('hidden');
//        }, 1000);
//    }

//    // --- 5. ДЕЛЬФИН ---
//    // Закрыть облачко дельфина
//    closeHelperBtn.addEventListener('click', () => {
//        dolphinHelper.classList.add('hidden');
//    });

//    // --- 6. КНОПКИ УРОВНЕЙ (В МЕНЮ SELLERS) ---
//    const levelButtons = document.querySelectorAll('.level-btn');

//    levelButtons.forEach(btn => {
//        btn.addEventListener('click', (e) => {
//            // Скрываем выпадающее меню (визуальный фикс)
//            const dropdown = e.target.closest('.dropdown-content');
//            dropdown.style.display = 'none';
//            setTimeout(() => { dropdown.style.display = ''; }, 500);

//            const levelName = e.target.textContent;

//            // Меняем текст у дельфина
//            helperText.innerHTML = '<span class="pixel-text" style="font-family: var(--pixel-font); font-size: 0.7rem;">Выбран раздел: <b>${levelName}</b>.<br>Уровень загружается...</span>';
//            dolphinHelper.classList.remove('hidden');

//            console.log(`Игрок ${currentUser} выбрал уровень: ${levelName}`);
//            // В будущем здесь будет вызов функции: startLevel(1);
//        });
//    });
//});