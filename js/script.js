document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // DOM Elements
    const overlayArea = document.getElementById('overlay-area');
    const buttonGameBar = document.getElementById('button-game-bar');
    const image = document.querySelector('#game-area img');
    const gameBar = document.getElementById('game-bar');
    const wideButton = document.querySelector('.wide-button');
    const incrementDisplay = document.getElementById('increment-display');
    const morseBar = document.getElementById('morse-bar');
    const characterDisplay = document.querySelector('.character');
    const buttonPanel = document.querySelector('.button-panel');
    const buttonPanelTop = document.querySelector('.button-panel-top');
    const helpPanel = document.querySelector('.help-panel');
    const buttons = document.querySelectorAll('.button');
    const overlayContent = document.getElementById('overlay-content');

    // Variables
    let activeButton = null;
    let gameEndCount = 0;
    let fillPercentage;
    let isButtonGameBurActive = false;
    let countdownActive = false;
    let scale = 100;
    let touchStartTime;
    let activeTouchId = null;
    let increment = 0;
    let timeLeft = 30;

    const fontSize = 120;
    const decrementInterval = 1000;

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
    const dotSymbol = '·';
    const dashSymbol = '-';

    // Morse Alphabet
    const morseAlphabet = {
        '·-': 'A', '-···': 'B', '-·-·': 'C', '-··': 'D', '·': 'E',
        '··-·': 'F', '--·': 'G', '····': 'H', '··': 'I', '·---': 'J',
        '-·-': 'K', '·-··': 'L', '--': 'M', '-·': 'N', '---': 'O',
        '·--·': 'P', '--·-': 'Q', '·-·': 'R', '···': 'S', '-': 'T',
        '··-': 'U', '···-': 'V', '·--': 'W', '-··-': 'X', '-·--': 'Y',
        '--··': 'Z', '·----': '1', '··---': '2', '···--': '3', '····-': '4',
        '·····': '5', '-····': '6', '--···': '7', '---··': '8', '----·': '9',
        '-----': '0'
    };

    // Initialize on page load
    updateIncrementDisplay();

    // Button overlay click handler
    buttonGameBar.addEventListener('click', () => {
        if (!countdownActive) {
            isButtonGameBurActive = !isButtonGameBurActive;

            if (isButtonGameBurActive) {
                buttonGameBar.classList.add('pulsing');
                buttonGameBar.style.opacity = 0.9;
                buttonPanel.classList.add('button-panel-hidden');
                buttonPanelTop.classList.add('button-panel-hidden');
                helpPanel.classList.add('help-panel-visible');
                helpPanel.classList.remove('help-panel-hidden');
            } else {
                buttonGameBar.classList.remove('pulsing');
                buttonGameBar.style.opacity = 1;
                buttonPanel.classList.remove('button-panel-hidden');
                buttonPanelTop.classList.remove('button-panel-hidden');
                helpPanel.classList.remove('help-panel-visible');
                helpPanel.classList.add('help-panel-hidden');
            }
        }
    });

    // Update morseBar visibility based on overlay state
    function updateMorseBarVisibility() {
        morseBar.style.opacity = isButtonGameBurActive ? '1' : '0';
    }

    function fillWideButton(percent) {
        let red, green, blue;

        if (percent < 25) {
            red = 255;
            green = Math.round(127 + (percent / 25) * (178 - 127));
            blue = Math.round(80 + (percent / 25) * (102 - 80));
        } else if (percent < 50) {
            red = 255;
            green = Math.round(178 + ((percent - 25) / 25) * (255 - 178));
            blue = 102;
        } else if (percent < 75) {
            red = Math.round(255 - ((percent - 50) / 25) * (255 - 102));
            green = 255;
            blue = 102;
        } else {
            red = 102;
            green = 255;
            blue = 102;
        }

        const fillColor = `rgba(${red}, ${green}, ${blue}, 0.9)`;
        wideButton.style.background = `linear-gradient(to right, ${fillColor} ${percent}%, white ${percent}%)`;
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

        if (isButtonGameBurActive) {
            symbol = touchDuration >= shortTouchDuration ? dashSymbol : dotSymbol;
            symbolClass = 'symbol';
        } else {
            symbol = touchDuration >= shortTouchDuration ? cupcakeSymbol : lollipopSymbol;
            symbolClass = 'symbol-eat';
        }

        createFloatingSymbol(touchPositionX, touchPositionY, symbol, symbolClass);

        if (!isButtonGameBurActive) {
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
    image.addEventListener('touchcancel', () => {
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

        const overlayTop = gameBar.getBoundingClientRect().top;
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
            buttonGameBar.appendChild(characterDiv);

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
        gameEndCount++;
        countdownActive = false;

        setTimeout(() => {
            buttonGameBar.classList.add('game-over-animation');

            setTimeout(() => {
                const characterDivs = buttonGameBar.querySelectorAll('.character');
                characterDivs.forEach(div => div.remove());
                isButtonGameBurActive = false;
                buttonGameBar.classList.remove('pulsing', 'game-over-animation');
                buttonGameBar.style.opacity = 1;
                buttonPanel.classList.remove('button-panel-hidden');
                buttonPanelTop.classList.remove('button-panel-hidden');
                helpPanel.classList.remove('help-panel-visible');
                helpPanel.classList.add('help-panel-hidden');
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
                    buttonGameBar.disabled = false;
                    checkCharacter();
                }
            }, 1000);

            buttonGameBar.appendChild(countdownDiv);
            buttonGameBar.disabled = true;
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

    buttons.forEach(button => {
        button.addEventListener('click', async () => {
            if (button === activeButton) {
                overlayArea.style.display = 'none';
                button.classList.remove('active');
                activeButton = null;
            } else {
                if (activeButton) {
                    activeButton.classList.remove('active');
                }

                activeButton = button;
                button.classList.add('active');

                const contentUrl = button.getAttribute('data-content');
                try {
                    const response = await fetch(contentUrl);
                    if (response.ok) {
                        const content = await response.text();
                        overlayContent.innerHTML = content;
                        overlayArea.style.display = 'block';
                    } else {
                        overlayContent.innerHTML = 'Ошибка загрузки содержимого.';
                        overlayArea.style.display = 'block';
                    }
                } catch (error) {
                    overlayContent.innerHTML = 'Ошибка загрузки содержимого.';
                    overlayArea.style.display = 'block';
                }
            }
        });
    });

});
