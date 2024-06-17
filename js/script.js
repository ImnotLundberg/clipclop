document.addEventListener('DOMContentLoaded', function () {
    const isSmartphone = /Mobi|Android/i.test(navigator.userAgent);

    if (!isSmartphone || window.innerWidth > 768) {
        document.body.innerHTML = '<h1>Это приложение доступно только на смартфонах</h1>';
        return;
    }

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
        event.preventDefault(); // Предотвращаем стандартное действие (появление контекстного меню)
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

        createFloatingSymbol(touchPositionX, touchPositionY, touchDuration >= 500 ? '-' : '.');

        // Управление заполнением wide-button в зависимости от длительности нажатия
        if (touchDuration >= 500) {
            increment += 4; // Длинное нажатие (4%)
        } else {
            increment += 1; // Короткое нажатие (1%)
        }

        if (increment > 100) {
            increment = 100; // Ограничиваем значение до 100%
        }

        updateIncrementDisplay(); // Обновляем отображение значения
        fillWideButton(increment); // Заполняем кнопку

        resetImageSize();
        activeTouchId = null;
        event.preventDefault(); // Предотвращаем стандартное действие (появление контекстного меню)
    });

    image.addEventListener('touchcancel', (event) => {
        const touch = Array.from(event.changedTouches).find(t => t.identifier === activeTouchId);
        if (!touch) {
            return;
        }
        resetImageSize();
        activeTouchId = null;
    });

    image.addEventListener('contextmenu', (event) => {
        event.preventDefault(); // Предотвращаем стандартное контекстное меню браузера
    });

    function createFloatingSymbol(x, y, symbol) {
        const symbolElement = document.createElement('div');
        symbolElement.textContent = symbol;
        symbolElement.className = 'symbol';
        symbolElement.style.left = `${x}px`;
        symbolElement.style.top = `${y}px`;
        symbolElement.style.fontSize = `${fontSize}px`;
        symbolElement.style.pointerEvents = 'none'; // Отключаем события на символе

        document.body.appendChild(symbolElement);

        const overlayTop = overlayArea.getBoundingClientRect().top;
        const translateY = y - overlayTop + fontSize / 2;

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
