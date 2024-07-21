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
    const overlayTitle = document.getElementById('overlay-title');
    const myScore = document.getElementById('score');

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
    let score = 0;

    const fontSize = 120;
    const decrementInterval = 1000;

    // Target array of characters
    const targetArray = ['t'];
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
    const pointsPerWord = 900; // Points awarded for completing a word
    const numCoins = 20; // Количество монет для анимации
    const delayBetweenCoins = 100; // Задержка между каждой монетой в миллисекундах
    const durationSymbolCoin = 500; // Продолжительность анимации одной монеты
    const totalCoinAnimationDuration = (numCoins - 1) * delayBetweenCoins + durationSymbolCoin; // Рассчитайте полную продолжительность анимации монет
    const durationScore = Math.min(totalCoinAnimationDuration, 5000); // Установите продолжительность анимации счета

    // Symbols
    const poopSymbol = '💩';
    const cupcakeSymbol = '🧁';
    const lollipopSymbol = '🍭';
    const dotSymbol = '·';
    const dashSymbol = '-';
    const coinSymbol = '🪙';

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
    updateMyScore();

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

    function updateMyScore() {
        myScore.textContent = score;
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

    function formatScore(value) {
        if (value >= 1000000000) {
            // Форматирует значение в миллиарды и добавляет 'b', округляя до одной десятичной точки
            return (value / 1000000000).toFixed(1).replace(/\.0$/, '') + 'b';
        } else if (value >= 1000000) {
            // Форматирует значение в миллионы и добавляет 'm', округляя до одной десятичной точки
            return (value / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
        } else if (value >= 1000) {
            // Форматирует значение в тысячи и добавляет 'k', округляя до одной десятичной точки
            return (value / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
        }
        return value; // Возвращает значение без изменений, если оно меньше 1000
    }

    function handleGameEnd() {
        gameEndCount++;
        countdownActive = false;

        // Calculate the new score
        const startScore = score;
        score += pointsPerWord; // Обновляем внутреннюю переменную score
        const endScore = score;

        // Animation duration in milliseconds
        const durationScore = Math.min(totalCoinAnimationDuration, 5000);
        let startTime = null;

        function animateCounter(timestamp) {
            if (!startTime) {
                startTime = timestamp;
                myScore.classList.add('pulsing'); // Add pulse animation class at the start
            }
            const progress = timestamp - startTime;
            const currentScore = Math.min(startScore + (progress / durationScore) * (endScore - startScore), endScore);
            myScore.innerText = formatScore(Math.floor(currentScore)); // Use formatScore function

            if (progress < durationScore) {
                requestAnimationFrame(animateCounter);
            } else {
                myScore.innerText = formatScore(endScore); // Ensure the final score is set
                myScore.classList.remove('pulsing'); // Remove pulse animation class at the end
            }
        }

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

                // Start the score animation
                requestAnimationFrame(animateCounter);

                // Create and animate multiple floating coins
                createFloatingCoins();

                startCountdown();
            }, 2000);
        }, 2500);
    }


    // Create and animate multiple floating coins
    function createFloatingCoins() {

        for (let i = 1; i < numCoins; i++) {
            setTimeout(() => {
                const coinElement = document.createElement('div');
                coinElement.textContent = coinSymbol;
                coinElement.className = 'symbol';
                coinElement.style.fontSize = `40px`;

                // Получаем размеры и позицию gameBar
                const gameBarRect = gameBar.getBoundingClientRect();
                const gameBarCenterX = gameBarRect.left + window.scrollX + (gameBarRect.width / 2);
                const gameBarCenterY = gameBarRect.top + window.scrollY + (gameBarRect.height / 2);

                coinElement.style.position = 'absolute';
                coinElement.style.left = `${gameBarCenterX}px`;
                coinElement.style.top = `${gameBarCenterY}px`;
                coinElement.style.transform = 'translate(-50%, -50%)'; // Центрирование по середине элемента

                document.body.appendChild(coinElement);

                // Начальная и конечная позиции
                const scoreRect = myScore.getBoundingClientRect();
                const scoreCenterX = scoreRect.left + window.scrollX + (scoreRect.width / 2);
                const scoreCenterY = scoreRect.top + window.scrollY + (scoreRect.height / 2);

                let startTime;

                function animateCoin(timestamp) {
                    if (!startTime) startTime = timestamp;
                    const progress = timestamp - startTime;
                    const progressRatio = Math.min(progress / durationSymbolCoin, 1);

                    const x = gameBarCenterX + (scoreCenterX - gameBarCenterX) * progressRatio;
                    const y = gameBarCenterY + (scoreCenterY - gameBarCenterY) * progressRatio;

                    coinElement.style.left = `${x}px`;
                    coinElement.style.top = `${y}px`;
                    coinElement.style.opacity = 0.3 - progressRatio;

                    if (progress < durationSymbolCoin) {
                        requestAnimationFrame(animateCoin);
                    } else {
                        coinElement.remove();
                    }
                }

                requestAnimationFrame(animateCoin);
            }, i * delayBetweenCoins); // Задержка запуска анимации каждой монеты
        }
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
                const title = button.getAttribute('data-title');

                try {
                    const response = await fetch(contentUrl);
                    if (response.ok) {
                        const content = await response.text();
                        overlayContent.innerHTML = `<h2 class="overlay-title">${title}</h2>` + content;
                        overlayArea.style.display = 'block';
                    } else {
                        overlayContent.innerHTML = `<h2 class="overlay-title">${title}</h2>Ошибка загрузки содержимого.`;
                        overlayArea.style.display = 'block';
                    }
                } catch (error) {
                    overlayContent.innerHTML = `<h2 class="overlay-title">${title}</h2>Ошибка загрузки содержимого.`;
                    overlayArea.style.display = 'block';
                }
            }
        });
    });
});
