document.addEventListener('DOMContentLoaded', function () {
    // Получаем элементы DOM
    const buttonOverlay = document.getElementById("button-overlay-area");
    const image = document.querySelector('#game-area img');
    const overlayArea = document.getElementById('overlay-area');
    const wideButton = document.querySelector('.wide-button');
    const incrementDisplay = document.getElementById('increment-display');
    const morseBar = document.getElementById('morse-bar');

    // Начальные значения переменных
    let isPulsing = false;
    let scale = 100;
    let touchStartTime;
    let activeTouchId = null;
    let increment = 0;
    const fontSize = 120; // Размер шрифта для основных символов

    // Обработчик клика на оверлейной кнопке
    buttonOverlay.addEventListener("click", function () {
        isPulsing = !isPulsing;

        if (isPulsing) {
            buttonOverlay.classList.add("pulsing");
            buttonOverlay.style.opacity = 0.9; // Установка прозрачности
        } else {
            buttonOverlay.classList.remove("pulsing");
            buttonOverlay.style.opacity = 1; // Восстановление полной видимости
        }
    });

    // Уменьшение размера изображения при касании
    function decreaseImageSize() {
        scale -= 2;
        image.style.transform = `scale(${scale / 100})`;
    }

    // Сброс размера изображения
    function resetImageSize() {
        scale = 100;
        image.style.transform = `scale(${scale / 100})`;
    }

    // Обработчик начала касания на изображении
    image.addEventListener('touchstart', (event) => {
        if (activeTouchId !== null || event.touches.length > 1) {
            return;
        }

        activeTouchId = event.changedTouches[0].identifier;
        touchStartTime = new Date().getTime();
        decreaseImageSize();
        event.preventDefault();
    });

    // Обработчик окончания касания на изображении
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

        // Определение символа и его класса в зависимости от состояния pulsing
        if (isPulsing) {
            symbol = touchDuration >= 500 ? '-' : '.';
            symbolClass = 'symbol';
        } else {
            symbol = touchDuration >= 500 ? '🧁' : '🍭';
            symbolClass = 'symbol-eat'; // Общий класс для кекса и леденца
        }

        // Создание плавающего символа на экране
        createFloatingSymbol(touchPositionX, touchPositionY, symbol, symbolClass);

        // Обновление инкремента и отображения
        if (!isPulsing) {
            increment += touchDuration >= 500 ? 4 : 1;
            increment = Math.min(increment, 100); // Ограничение максимального значения

            updateIncrementDisplay();
            fillWideButton(increment);
        } else {
            handleMorseInput(touchDuration);
        }

        resetImageSize();
        activeTouchId = null;
        event.preventDefault();
    });

    // Сброс размера изображения при отмене касания
    image.addEventListener('touchcancel', (event) => {
        resetImageSize();
        activeTouchId = null;
    });

    // Предотвращение контекстного меню при долгом нажатии на изображении
    image.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });

    // Создание плавающего символа на экране
    function createFloatingSymbol(x, y, symbol, symbolClass) {
        const symbolElement = document.createElement('div');
        symbolElement.textContent = symbol;
        symbolElement.className = symbolClass || 'symbol';
        symbolElement.style.left = `${x}px`;
        symbolElement.style.top = `${y}px`;

        // Установка размера только для символов "🧁" и "🍭"
        if (symbol === '🧁' || symbol === '🍭') {
            symbolElement.style.fontSize = '60px';
        } else {
            symbolElement.style.fontSize = `${fontSize}px`;
        }

        symbolElement.style.pointerEvents = 'none'; // Исключение символов из событий клика

        document.body.appendChild(symbolElement);

        const overlayTop = overlayArea.getBoundingClientRect().top;
        const translateY = y - overlayTop + (symbol === '🧁' || '🍭' ? 30 / 2 : fontSize / 2); // Учет размера

        requestAnimationFrame(() => {
            symbolElement.style.transform = `translateY(-${translateY}px)`;
            symbolElement.style.opacity = 0;
        });

        setTimeout(() => {
            symbolElement.remove();
        }, 2000); // Удаление символа через 2 секунды
    }

    // Заполнение широкой кнопки
    function fillWideButton(percent) {
        wideButton.style.setProperty('--fill-width', `${percent}%`);
        wideButton.style.background = `
            linear-gradient(to right,
                rgba(255, 182, 193, 0) ${percent}%,
                white ${percent}%,
                white 100%
            )`;
    }

    // Обновление отображения инкремента
    function updateIncrementDisplay() {
        incrementDisplay.textContent = `${increment}%`;
    }

    // Обработчик для декодирования нажатий на изображение по азбуке Морзе
    let morseInput = ''; // Переменная для хранения последовательности нажатий
    let morseTimeout; // Таймер для очистки morseInput

    function handleMorseInput(duration) {
        clearTimeout(morseTimeout);

        morseInput += duration >= 500 ? '-' : '.';

        morseTimeout = setTimeout(() => {
            const letter = decodeMorse(morseInput);
            updateMorseBar(letter);
            morseInput = ''; // Сброс последовательности после декодирования
        }, 2000); // После 2 секунд декодируем последовательность
    }

    // Декодирование последовательности по азбуке Морзе
    function decodeMorse(sequence) {
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

        return morseAlphabet[sequence] || '?'; // Возврат символа или '?' для нераспознанной последовательности
    }

    // Обновление элемента morse-bar с декодированной буквой и автоматическим скрытием через 3 секунды
    function updateMorseBar(letter) {
        morseBar.textContent = letter;
        morseBar.style.opacity = 1;

        setTimeout(() => {
            morseBar.textContent = '';
            morseBar.style.opacity = 0;
        }, 3000);
    }

});
