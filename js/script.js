document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // DOM Elements
    const buttonOverlay = document.getElementById("button-overlay-area");
    const image = document.querySelector('#game-area img');
    const overlayArea = document.getElementById('overlay-area');
    const wideButton = document.querySelector('.wide-button');
    const incrementDisplay = document.getElementById('increment-display');
    const morseBar = document.getElementById('morse-bar');
    const characterDisplay = document.querySelector('.character');
    const buttonPanel = document.querySelector('.button-panel');
    const buttonPanelTop = document.querySelector('.button-panel-top');
    const helpPanel = document.querySelector('.help-panel');

    // Variables
    let fillPercentage;
    let isButtonOverlayActive = false;
    let countdownActive = false;
    let scale = 100;
    let touchStartTime;
    let activeTouchId = null;
    let increment = 0;
    let timeLeft = 30;
    const fontSize = 120;
    const decrementInterval = 3000;

    // Target array of characters
    const targetArray = ['t', 'h', 'i', 'n', 'k'];
    let currentIndex = 0;

    // Constants and values
    const decrementAmount = 1;
    const shortTouchDuration = 500;
    const shortVibrationDuration = 30;
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

    // Symbols
    const poopSymbol = '💩';
    const cupcakeSymbol = '🧁';
    const lollipopSymbol = '🍭';
    const dotSymbol = '.';
    const dashSymbol = '-';

    // Morse Alphabet
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

    // Initialize on page load
    updateIncrementDisplay();

    // Button overlay click handler
    buttonOverlay.addEventListener("click", function () {
        if (!countdownActive) {
            isButtonOverlayActive = !isButtonOverlayActive;

            if (isButtonOverlayActive) {
                buttonOverlay.classList.add("pulsing");
                buttonOverlay.style.opacity = 0.9;
                buttonPanel.classList.add('button-panel-hidden');
                buttonPanelTop.classList.add('button-panel-hidden');
                helpPanel.classList.add('help-panel-visible');
                helpPanel.classList.remove('help-panel-hidden');
            } else {
                buttonOverlay.classList.remove("pulsing");
                buttonOverlay.style.opacity = 1;
                buttonPanel.classList.remove('button-panel-hidden');
                buttonPanelTop.classList.remove('button-panel-hidden');
                helpPanel.classList.remove('help-panel-visible');
                helpPanel.classList.add('help-panel-hidden');
            }
        }
    });

    // Update morseBar visibility based on overlay state
    function updateMorseBarVisibility() {
        if (isButtonOverlayActive) {
            morseBar.style.opacity = '1';
        } else {
            morseBar.style.opacity = '0';
        }
    }

    // Function to fill wideButton
    function fillWideButton(percent) {
        fillPercentage = `${percent}%`;

        wideButton.style.setProperty('--fill-width', fillPercentage);
        wideButton.style.background = wideButtonFillGradient.replace(/0%/g, fillPercentage);
    }

    // Update increment display
    function updateIncrementDisplay() {
        incrementDisplay.textContent = `${increment}%`;
    }

    // Decrease image size on touch
    function decreaseImageSize() {
        scale -= 2;
        image.style.transform = `scale(${scale / 100})`;
    }

    // Reset image size
    function resetImageSize() {
        scale = 100;
        image.style.transform = `scale(${scale / 100})`;
    }

    // Touch start event handler on image
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

    // Touch end event handler on image
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

    // Touch cancel event handler on image
    image.addEventListener('touchcancel', (event) => {
        resetImageSize();
        activeTouchId = null;
    });

    // Prevent context menu on right-click
    image.addEventListener('contextmenu', (event) => {
        event.preventDefault();
    });

    // Create floating symbol function
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

    // Variables for Morse code input handling
    let morseInput = '';
    let morseTimeout;

    // Handle Morse code input based on touch duration
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

    // Decode Morse code sequence to letter
    function decodeMorse(sequence) {
        return morseAlphabet[sequence] || poopSymbol;
    }

    // Check entered character against target array
    function checkCharacter(letter) {
        if (letter.toLowerCase() === targetArray[currentIndex]) {
            const characterDiv = document.createElement('div');
            characterDiv.classList.add('character', fadeInClass);
            characterDiv.textContent = letter;
            buttonOverlay.appendChild(characterDiv);

            currentIndex++;

            if (currentIndex === targetArray.length) {
                timeLeft = 30;
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

    // Handle game end
    function handleGameEnd() {
        countdownActive = false;

        setTimeout(() => {
            buttonOverlay.classList.add('game-over-animation');

            setTimeout(() => {
                const characterDivs = buttonOverlay.querySelectorAll('.character');
                characterDivs.forEach(div => div.remove());
                isButtonOverlayActive = false;
                buttonOverlay.classList.remove('pulsing', 'game-over-animation');
                buttonOverlay.style.opacity = 1;
                buttonPanel.classList.remove('button-panel-hidden');
                buttonPanelTop.classList.remove('button-panel-hidden');
                currentIndex = 0;
                startCountdown();
            }, 2000);
        }, 2500);
    }

    // Start countdown timer
    function startCountdown() {
        countdownActive = true;

        setTimeout(() => {
            const countdownDiv = document.createElement('div');
            countdownDiv.classList.add('character');
            countdownDiv.style.opacity = '1';
            countdownDiv.style.width = '200px';

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
                    buttonOverlay.disabled = false;
                    checkCharacter();
                }
            }, 100);

            buttonOverlay.appendChild(countdownDiv);
            buttonOverlay.disabled = true;
        }, 100);
    }

    // Update morseBar display
    function updateMorseBar(letter) {
        morseBar.textContent = letter;
        morseBar.style.opacity = 1;

        setTimeout(() => {
            morseBar.textContent = '';
            morseBar.style.opacity = 0;
        }, morseBarDisplayDuration);
    }

    // Decrease increment every second
    setInterval(() => {
        if (increment > 0) {
            increment -= decrementAmount;
            updateIncrementDisplay();
            fillWideButton(increment);
        }
    }, decrementInterval);

});
