document.addEventListener('DOMContentLoaded', function () {
    const buttonOverlay = document.getElementById("button-overlay-area");
    const image = document.querySelector('#game-area img');
    const overlayArea = document.getElementById('overlay-area');
    const wideButton = document.querySelector('.wide-button');
    const incrementDisplay = document.getElementById('increment-display');
    const morseBar = document.getElementById('morse-bar');
    const characterDisplay = document.querySelector('.character');
    const buttonPanel = document.querySelector('.button-panel');
    const buttonPanelTop = document.querySelector('.button-panel-top');

    let fillPercentage;
    let isButtonOverlayActive = false;
    let scale = 100;
    let touchStartTime;
    let activeTouchId = null;
    let increment = 0;
    const fontSize = 120;
    const decrementInterval = 3000;

    const targetArray = ['t', 'h', 'i' ,'n', 'k'];
    let currentIndex = 0;

    const decrementAmount = 1;
    const shortTouchDuration = 500;
    const shortVibrationDuration = 10;
    const longVibrationDuration = 30;
    const symbolFontSize = '60px';
    const maxIncrement = 100;
    const wideButtonFillGradient = 'linear-gradient(to right, rgba(255, 182, 193, 0) 0%, white 0%, white 100%)';
    const morseBarDisplayDuration = 3000;
    const characterDisplayDuration = 2500;
    const morseInputTimeoutDuration = 2000;
    const fadeOutDuration = 1000;
    const fadeInClass = 'fade-in';
    const fadeOutClass = 'fade-out';

    const poopSymbol = '💩';
    const cupcakeSymbol = '🧁';
    const lollipopSymbol = '🍭';
    const dotSymbol = '.';
    const dashSymbol = '-';

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

    updateIncrementDisplay();

    buttonOverlay.addEventListener("click", function () {
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

        if (isButtonOverlayActive) {
            handleMorseInput(0); // Обработка азбуки Морзе при активации кнопки
        } else {
            checkCharacter(); // Проверка символа при отключении кнопки
        }
    });

    function fillWideButton(percent) {
        fillPercentage = `${percent}%`;

        wideButton.style.setProperty('--fill-width', fillPercentage);
        wideButton.style.background = wideButtonFillGradient.replace(/0%/g, fillPercentage);
    }

    function updateIncrementDisplay() {
        incrementDisplay.textContent = `${increment}%`;
    }

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

        if (navigator.vibrate) {
            navigator.vibrate(shortVibrationDuration);
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

    let morseInput = '';
    let morseTimeout;

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

    function decodeMorse(sequence) {
        return morseAlphabet[sequence] || poopSymbol;
    }

    function checkCharacter(letter = '') {
        if (letter.toLowerCase() === targetArray[currentIndex]) {
            const characterDiv = document.createElement('div');
            characterDiv.classList.add('character', fadeInClass);
            characterDiv.textContent = letter;
            buttonOverlay.appendChild(characterDiv);

            currentIndex++;

            if (currentIndex === targetArray.length) {
                handleGameEnd();
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

    function handleGameEnd() {
        buttonOverlay.classList.add('game-over-animation');

        setTimeout(() => {
            buttonOverlay.innerHTML = '';
            isButtonOverlayActive = false;
            buttonOverlay.classList.remove('pulsing', 'game-over-animation');
            buttonOverlay.style.opacity = 1;
            buttonPanel.classList.remove('button-panel-hidden');
            buttonPanelTop.classList.remove('button-panel-hidden');
        }, 2000);
    }

    function updateMorseBar(letter) {
        morseBar.textContent = letter;
        morseBar.style.opacity = 1;

        setTimeout(() => {
            morseBar.textContent = '';
            morseBar.style.opacity = 0;
        }, morseBarDisplayDuration);
    }

    setInterval(() => {
        if (increment > 0) {
            increment -= decrementAmount;
            updateIncrementDisplay();
            fillWideButton(increment);
        }
    }, decrementInterval);
});
