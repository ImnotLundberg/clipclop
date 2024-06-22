document.addEventListener('DOMContentLoaded', function () {
    const buttonOverlay = document.getElementById("button-overlay-area");
    const image = document.querySelector('#game-area img');
    const overlayArea = document.getElementById('overlay-area');
    const wideButton = document.querySelector('.wide-button');
    const incrementDisplay = document.getElementById('increment-display');
    const morseBar = document.getElementById('morse-bar');
    const characterDisplay = document.querySelector('.character');

    let isPulsing = false;
    let scale = 100;
    let touchStartTime;
    let activeTouchId = null;
    let increment = 0;
    const fontSize = 120;

    const targetArray = ['t', 'h', 'i', 'n', 'k'];
    let currentIndex = 0;

    buttonOverlay.addEventListener("click", function () {
        isPulsing = !isPulsing;

        if (isPulsing) {
            buttonOverlay.classList.add("pulsing");
            buttonOverlay.style.opacity = 0.9;
        } else {
            buttonOverlay.classList.remove("pulsing");
            buttonOverlay.style.opacity = 1;
        }
    });

    function decreaseImageSize() {
        scale -= 2;
        image.style.transform = `scale(${scale / 100})`;
    }

    function resetImageSize() {
        scale = 100;
        image.style.transform = `scale(${scale / 100})`;
    }

    image.addEventListener('touchstart', (event) => {
        if (activeTouchId !== null || event.touches.length > 1) {
            return;
        }

        activeTouchId = event.changedTouches[0].identifier;
        touchStartTime = new Date().getTime();
        decreaseImageSize();

        // Добавляем вибрацию при нажатии
        if (navigator.vibrate) {
            navigator.vibrate(30); // Вибрация на 30 мс
        }

        event.preventDefault();
    });

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

        if (isPulsing) {
            symbol = touchDuration >= 500 ? '-' : '.';
            symbolClass = 'symbol';
        } else {
            symbol = touchDuration >= 500 ? '🧁' : '🍭';
            symbolClass = 'symbol-eat';
        }

        createFloatingSymbol(touchPositionX, touchPositionY, symbol, symbolClass);

        if (!isPulsing) {
            increment += touchDuration >= 500 ? 4 : 1;
            increment = Math.min(increment, 100);

            updateIncrementDisplay();
            fillWideButton(increment);
        } else {
            handleMorseInput(touchDuration);
        }

        resetImageSize();
        activeTouchId = null;

        // Добавляем вибрацию при отпускании
        if (navigator.vibrate) {
            navigator.vibrate(30); // Вибрация на 30 мс
        }

        event.preventDefault();
    });

    image.addEventListener('touchcancel', (event) => {
        resetImageSize();
        activeTouchId = null;
    });

    image.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });

    function createFloatingSymbol(x, y, symbol, symbolClass) {
        const symbolElement = document.createElement('div');
        symbolElement.textContent = symbol;
        symbolElement.className = symbolClass || 'symbol';
        symbolElement.style.left = `${x}px`;
        symbolElement.style.top = `${y}px`;

        if (symbol === '🧁' || symbol === '🍭') {
            symbolElement.style.fontSize = '60px';
        } else {
            symbolElement.style.fontSize = `${fontSize}px`;
        }

        symbolElement.style.pointerEvents = 'none';
        document.body.appendChild(symbolElement);

        const overlayTop = overlayArea.getBoundingClientRect().top;
        const translateY = y - overlayTop + (symbol === '🧁' || '🍭' ? 30 / 2 : fontSize / 2);

        requestAnimationFrame(() => {
            symbolElement.style.transform = `translateY(-${translateY}px)`;
            symbolElement.style.opacity = 0;
        });

        setTimeout(() => {
            symbolElement.remove();
        }, 2000);
    }

    function fillWideButton(percent) {
        wideButton.style.setProperty('--fill-width', `${percent}%`);
        wideButton.style.background = `
            linear-gradient(to right,
                rgba(255, 182, 193, 0) ${percent}%,
                white ${percent}%,
                white 100%
            )`;
    }

    function updateIncrementDisplay() {
        incrementDisplay.textContent = `${increment}%`;
    }

    let morseInput = '';
    let morseTimeout;

    function handleMorseInput(duration) {
        clearTimeout(morseTimeout);

        morseInput += duration >= 500 ? '-' : '.';

        morseTimeout = setTimeout(() => {
            const letter = decodeMorse(morseInput);
            updateMorseBar(letter);

            // Задержка перед созданием characterDiv
            setTimeout(() => {
                checkCharacter(letter);
            }, 2500); // 3 секунды задержка

            morseInput = '';
        }, 2000);
    }

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

        return morseAlphabet[sequence] || '💩';
    }

    function checkCharacter(letter) {
        if (letter.toLowerCase() === targetArray[currentIndex]) {
            const characterDiv = document.createElement('div');
            characterDiv.classList.add('character', 'fade-in'); // Добавляем класс character для анимации
            characterDiv.textContent = letter;
            buttonOverlay.appendChild(characterDiv); // Добавляем в buttonOverlay

            currentIndex++;

            if (currentIndex === targetArray.length) {
                currentIndex = 0;
                setTimeout(() => {
                    characterDisplay.textContent = '';
                }, 2000);
            }
        } else {
            // Если пользователь ошибся, удаляем все созданные символы и сбрасываем индекс
            const existingCharacters = document.querySelectorAll('.character');
            existingCharacters.forEach(elem => {
                elem.classList.add('fade-out');
                setTimeout(() => {
                    elem.remove();
                }, 1000);
            });
            currentIndex = 0;
        }
    }

    function updateMorseBar(letter) {
        morseBar.textContent = letter;
        morseBar.style.opacity = 1;

        setTimeout(() => {
            morseBar.textContent = '';
            morseBar.style.opacity = 0;
        }, 3000);
    }

});
