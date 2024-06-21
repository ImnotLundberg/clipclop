document.addEventListener('DOMContentLoaded', function () {
    const buttonOverlay = document.getElementById("button-overlay-area");
    let isPulsing = false;

    buttonOverlay.addEventListener("click", function() {
        isPulsing = !isPulsing;

        if (isPulsing) {
            buttonOverlay.classList.add("pulsing");
            buttonOverlay.style.opacity = 0.3;
        } else {
            buttonOverlay.classList.remove("pulsing");
            buttonOverlay.style.opacity = 1;
        }
    });

    const image = document.querySelector('#game-area img');
    const overlayArea = document.getElementById('overlay-area');
    const wideButton = document.querySelector('.wide-button');
    const incrementDisplay = document.getElementById('increment-display');

    let scale = 100;
    let touchStartTime;
    let activeTouchId = null;
    let increment = 0;

    const fontSize = 120;

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
        event.preventDefault();
    });

    image.addEventListener('touchend', (event) => {
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
            symbolClass = 'symbol-eat'; // Используем общий класс для кекса и леденца
        }

        createFloatingSymbol(touchPositionX, touchPositionY, symbol, symbolClass);

        if (!isPulsing) {
            if (touchDuration >= 500) {
                increment += 4;
            } else {
                increment += 1;
            }

            if (increment > 100) {
                increment = 100;
            }

            updateIncrementDisplay();
            fillWideButton(increment);
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

    // Установка размера только для символов "🧁" и "🍭"
    if (symbol === '🧁' || symbol === '🍭') {
        symbolElement.style.fontSize = '60px';
    } else {
        // Используем размер по умолчанию для остальных символов
        symbolElement.style.fontSize = `${fontSize}px`;
    }

    symbolElement.style.pointerEvents = 'none';

    document.body.appendChild(symbolElement);

    const overlayTop = overlayArea.getBoundingClientRect().top;
    const translateY = y - overlayTop + (symbol === '🧁' || symbol === '🍭' ? 30 / 2 : fontSize / 2); // Учитываем размер

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
                rgba(255, 182, 193, 0)${percent}%,
                white ${percent}%,
                white 100%
            )`;
    }

    function updateIncrementDisplay() {
        incrementDisplay.textContent = `${increment}%`;
    }
});
