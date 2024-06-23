document.addEventListener('DOMContentLoaded', function () {
    // Элементы DOM
    const buttonOverlay = document.getElementById("button-overlay-area");
    const image = document.querySelector('#game-area img');
    const overlayArea = document.getElementById('overlay-area');
    const wideButton = document.querySelector('.wide-button');
    const incrementDisplay = document.getElementById('increment-display');
    const morseBar = document.getElementById('morse-bar');
    const characterDisplay = document.querySelector('.character');
    const buttonPanel = document.querySelector('.button-panel');
    const buttonPanelTop = document.querySelector('.button-panel-top');

    // Переменная для значения заполнения wideButton
    let fillPercentage;

    // Константы и переменные состояния
    let isButtonOverlayActive = false; // Изменено на isButtonOverlayActive
    let countdownActive = false;
    let scale = 100;
    let touchStartTime;
    let activeTouchId = null;
    let increment = 0;
    const fontSize = 120;
    const decrementInterval = 3000; // Интервал для уменьшения процента (в мс)

    // Целевой массив символов для сравнения
    const targetArray = ['t', 'h', 'i', 'n', 'k'];
    let currentIndex = 0;

    // Константы для времени и значений
    const decrementAmount = 1; // Константа для скорости уменьшения инкремента (в процентах в секунду)
    const shortTouchDuration = 500; // Длительность короткого нажатия (в мс)
    const shortVibrationDuration = 30; // Длительность короткой вибрации (в мс)
    const longVibrationDuration = 30; // Длительность длинной вибрации (в мс)
    const symbolFontSize = '60px'; // Размер шрифта символов кексика и леденца
    const maxIncrement = 100; // Максимальное значение инкремента
    const wideButtonFillGradient = 'linear-gradient(to right, rgba(255, 182, 193, 0) 0%, white 0%, white 100%)'; // Градиент для заполнения wideButton
    const morseBarDisplayDuration = 3000; // Длительность отображения символа в morseBar (в мс)
    const characterDisplayDuration = 2500; // Длительность отображения символа в characterDisplay (в мс)
    const morseInputTimeoutDuration = 2000; // Длительность ожидания ввода в азбуке Морзе (в мс)
    const fadeOutDuration = 1000; // Длительность исчезновения элемента (в мс)
    const fadeInClass = 'fade-in'; // Класс для анимации появления элемента
    const fadeOutClass = 'fade-out'; // Класс для анимации исчезновения элемента

    // Символы для использования
    const poopSymbol = '💩'; // Символ какашки
    const cupcakeSymbol = '🧁'; // Символ кексика
    const lollipopSymbol = '🍭'; // Символ леденца
    const dotSymbol = '.'; // Символ точки в азбуке Морзе
    const dashSymbol = '-'; // Символ тире в азбуке Морзе

    // Алфавит Морзе
    const morseAlphabet = {
        '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E',
        '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J',
        '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O',
        '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T',
        '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y',
        '--..': 'Z', '.----': '1', '..---': '2', '...--': '3', '....-': '4',
        '.....': '5', '-....': '6', '--...': '7', '---..': '8', '----.': '9',
        '-----': '0'
    };

    updateIncrementDisplay(); // Инициализация при загрузке страницы

    // Обработчик клика на кнопку overlay
    buttonOverlay.addEventListener("click", function () {
        if (!countdownActive) {
            isButtonOverlayActive = !isButtonOverlayActive;

            if (isButtonOverlayActive) {
                buttonOverlay.classList.add("pulsing");
                buttonOverlay.style.opacity = 0.9;
                buttonPanel.classList.add('button-panel-hidden');
                buttonPanelTop.classList.add('button-panel-hidden');
            } else {
                buttonOverlay.classList.remove("pulsing");
                buttonOverlay.style.opacity = 1;
                buttonPanel.classList.remove('button-panel-hidden');
                buttonPanelTop.classList.remove('button-panel-hidden');
            }
        }
    });

    function updateMorseBarVisibility() {
        if (isButtonOverlayActive) {
            morseBar.style.opacity = '1'; // Показываем элемент
        } else {
            morseBar.style.opacity = '0'; // Скрываем элемент
        }
    }

    // Функция заполнения wideButton
    function fillWideButton(percent) {
        fillPercentage = `${percent}%`;

        wideButton.style.setProperty('--fill-width', fillPercentage);
        wideButton.style.background = wideButtonFillGradient.replace(/0%/g, fillPercentage);
    }

    function updateIncrementDisplay() {
        incrementDisplay.textContent = `${increment}%`;
    }

    // Функция уменьшения размера изображения при касании
    function decreaseImageSize() {
        scale -= 2;
        image.style.transform = `scale(${scale / 100})`;
    }

    // Функция сброса размера изображения
    function resetImageSize() {
        scale = 100;
        image.style.transform = `scale(${scale / 100})`;
    }

    // Обработчик события touchstart на изображении
    image.addEventListener('touchstart', (event) => {
        if (activeTouchId !== null || event.touches.length > 1) {
            return;
        }

        activeTouchId = event.changedTouches[0].identifier;
        touchStartTime = new Date().getTime();
        decreaseImageSize();

        if (navigator.vibrate) {
            navigator.vibrate(shortVibrationDuration);
        }

        event.preventDefault();
    });

    // Обработчик события touchend на изображении
    image.addEventListener('touchend', (event) => {
        if (activeTouchId === null) {
            return;
        }

        const touch = Array.from(event.changedTouches).find(t => t.identifier === activeTouchId);
        if (!touch) {
            return;
        }

        const touchEndTime = new Date().getTime();
        const touchDuration = touchEndTime - touchStartTime;
        const touchPositionX = touch.clientX;
        const touchPositionY = touch.clientY;

        let symbol, symbolClass;

        if (isButtonOverlayActive) {
            symbol = touchDuration >= shortTouchDuration ? dashSymbol : dotSymbol;
            symbolClass = 'symbol';
        } else {
            symbol = touchDuration >= shortTouchDuration ? cupcakeSymbol : lollipopSymbol;
            symbolClass = 'symbol-eat';
        }

        createFloatingSymbol(touchPositionX, touchPositionY, symbol, symbolClass);

        if (!isButtonOverlayActive) {
            increment += touchDuration >= shortTouchDuration ? 4 : 1;
            increment = Math.min(increment, maxIncrement);

            updateIncrementDisplay();
            fillWideButton(increment);
        } else {
            handleMorseInput(touchDuration);
        }

        resetImageSize();
        activeTouchId = null;

        event.preventDefault();
    });

    // Обработчик события touchcancel на изображении
    image.addEventListener('touchcancel', (event) => {
        resetImageSize();
        activeTouchId = null;
    });

    // Предотвращение контекстного меню при клике правой кнопкой мыши
    image.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });

    // Функция создания плавающего символа
    function createFloatingSymbol(x, y, symbol, symbolClass) {
        const symbolElement = document.createElement('div');
        symbolElement.textContent = symbol;
        symbolElement.className = symbolClass || 'symbol';
        symbolElement.style        .left = `${x}px`;
        symbolElement.style.top = `${y}px`;

        if (symbol === cupcakeSymbol || symbol === lollipopSymbol) {
            symbolElement.style.fontSize = symbolFontSize;
        } else {
            symbolElement.style.fontSize = `${fontSize}px`;
        }

        symbolElement.style.pointerEvents = 'none';
        document.body.appendChild(symbolElement);

        const overlayTop = overlayArea.getBoundingClientRect().top;
        const translateY = y - overlayTop + (symbol === cupcakeSymbol || symbol === lollipopSymbol ? parseInt(symbolFontSize) / 2 : fontSize / 2);

        requestAnimationFrame(() => {
            symbolElement.style.transform = `translateY(-${translateY}px)`;
            symbolElement.style.opacity = 0;
        });

        setTimeout(() => {
            symbolElement.remove();
        }, 2000);
    }

    // Переменные для работы с азбукой Морзе
    let morseInput = '';
    let morseTimeout;

    // Обработка ввода символов азбуки Морзе
    function handleMorseInput(duration) {
        clearTimeout(morseTimeout);

        morseInput += duration >= shortTouchDuration ? dashSymbol : dotSymbol;

        morseTimeout = setTimeout(() => {
            const letter = decodeMorse(morseInput);
            updateMorseBar(letter);

            setTimeout(() => {
                checkCharacter(letter);
            }, characterDisplayDuration);

            morseInput = '';
        }, morseInputTimeoutDuration);
    }

    // Декодирование последовательности Морзе в букву
    function decodeMorse(sequence) {
        return morseAlphabet[sequence] || poopSymbol;
    }

    // Проверка введенного символа с целевым массивом
    function checkCharacter(letter) {
        if (letter.toLowerCase() === targetArray[currentIndex]) {
            const characterDiv = document.createElement('div');
            characterDiv.classList.add('character', fadeInClass);
            characterDiv.textContent = letter;
            buttonOverlay.appendChild(characterDiv);

            currentIndex++;

            if (currentIndex === targetArray.length) {
                currentIndex = 0;
                setTimeout(() => {
                    characterDisplay.textContent = '';
                }, characterDisplayDuration);
            }
        } else {
            const existingCharacters = document.querySelectorAll('.character');
            existingCharacters.forEach(elem => {
                elem.classList.add(fadeOutClass);
                setTimeout(() => {
                    elem.remove();
                }, fadeOutDuration);
            });
            currentIndex = 0;
        }
    }

    // Проверка введенного символа с целевым массивом
    function checkCharacter(letter) {
        if (letter.toLowerCase() === targetArray[currentIndex]) {
            const characterDiv = document.createElement('div');
            characterDiv.classList.add('character', fadeInClass);
            characterDiv.textContent = letter;
            buttonOverlay.appendChild(characterDiv);

            currentIndex++;

            if (currentIndex === targetArray.length) {
                // Все символы массива проверены
                handleGameEnd();
            }
        } else {
            // Неверный символ - очистить предыдущие символы
            const existingCharacters = document.querySelectorAll('.character');
            existingCharacters.forEach(elem => {
                elem.classList.add(fadeOutClass);
                setTimeout(() => {
                    elem.remove();
                }, fadeOutDuration);
            });
            currentIndex = 0;
        }
    }

    // Функция завершения игры
    function handleGameEnd() {
        countdownActive = false;

        // Задержка на 2 секунды перед добавлением класса
        setTimeout(() => {
            buttonOverlay.classList.add('game-over-animation');

            // Ждем завершения анимации
            setTimeout(() => {
                // Удалить все div элементы внутри buttonOverlay
                buttonOverlay.innerHTML = '';
                // Вернуть состояние кнопки в false
                isButtonOverlayActive = false;
                buttonOverlay.classList.remove('pulsing', 'game-over-animation');
                buttonOverlay.style.opacity = 1;
                buttonPanel.classList.remove('button-panel-hidden');
                buttonPanelTop.classList.remove('button-panel-hidden');
            }, 2000); // 2000 миллисекунд = 2 секунды
        }, 2500); // 2500 миллисекунд = 2,3 секунды

        startCountdown(); // Начать обратный отсчет
    }

    function startCountdown() {
        countdownActive = true;

        setTimeout(() => {
            const countdownDiv = document.createElement('div');
            countdownDiv.classList.add('character');
            countdownDiv.style.opacity = '1'; // Устанавливаем полную непрозрачность
            countdownDiv.style.height = '350px';

            // Время для обратного отсчета в секундах
            let timeLeft = 30; // 30 секунд

            const countdownInterval = setInterval(() => {
                const hours = Math.floor(timeLeft / 3600);
                const minutes = Math.floor((timeLeft % 3600) / 60);
                const seconds = timeLeft % 60;

                countdownDiv.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

                timeLeft--;

                if (timeLeft < 0) {
                    clearInterval(countdownInterval);
                    countdownDiv.remove();
                    countdownActive = false;

                    // Включаем кнопку после завершения таймера
                    buttonOverlay.disabled = false;
                }
            }, 1000);

            buttonOverlay.appendChild(countdownDiv);
            buttonOverlay.disabled = true; // Делаем кнопку неактивной во время таймера
        }, 5000); // Задержка в 5 секунд перед стартом таймера
    }


    // Обновление отображения символа в morseBar
    function updateMorseBar(letter) {
        morseBar.textContent = letter;
        morseBar.style.opacity = 1;

        setTimeout(() => {
            morseBar.textContent = '';
            morseBar.style.opacity = 0;
        }, morseBarDisplayDuration);
    }

    // Уменьшение инкремента каждую секунду
    setInterval(() => {
        if (increment > 0) {
            increment -= decrementAmount;
            updateIncrementDisplay();
            fillWideButton(increment);
        }
    }, decrementInterval);
});
