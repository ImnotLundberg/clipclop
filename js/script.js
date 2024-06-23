// Получение элементов DOM
const buttonOverlay = document.getElementById("button-overlay-area");
const image = document.querySelector('#game-area img');
const overlayArea = document.getElementById('overlay-area');
const wideButton = document.querySelector('.wide-button');
const incrementDisplay = document.getElementById('increment-display');
const morseBar = document.getElementById('morse-bar');
const characterDisplay = document.querySelector('.character');
const buttonPanel = document.querySelector('.button-panel');
const buttonPanelTop = document.querySelector('.button-panel-top');

// Переменные состояния и значения
let fillPercentage; // Процент заполнения широкой кнопки
let isButtonOverlayActive = false; // Флаг активации кнопки-оверлея
let scale = 100; // Текущий масштаб изображения
let touchStartTime; // Время начала касания
let activeTouchId = null; // Идентификатор активного касания
let increment = 0; // Текущее значение инкремента

// Константы для значений и параметров
const fontSize = 120; // Размер шрифта символов
const decrementInterval = 3000; // Интервал для уменьшения инкремента

const targetArray = ['t', 'h', 'i', 'n', 'k']; // Целевой массив символов для игры
let currentIndex = 0; // Индекс текущего символа в целевом массиве

const decrementAmount = 1; // Количество уменьшения инкремента за интервал
const shortTouchDuration = 500; // Длительность короткого касания
const shortVibrationDuration = 10; // Длительность короткого вибрационного отклика
const longVibrationDuration = 30; // Длительность длинного вибрационного отклика
const symbolFontSize = '60px'; // Размер шрифта символов типа cupcake и lollipop
const maxIncrement = 100; // Максимальное значение инкремента

const wideButtonFillGradient = 'linear-gradient(to right, rgba(255, 182, 193, 0) 0%, white 0%, white 100%)'; // Градиент для заполнения широкой кнопки
const morseBarDisplayDuration = 3000; // Длительность отображения символа в полосе Морзе
const characterDisplayDuration = 2500; // Длительность отображения символа в элементе character
const morseInputTimeoutDuration = 2000; // Таймаут для ввода символа в азбуке Морзе
const fadeOutDuration = 1000; // Длительность исчезновения элементов
const fadeInClass = 'fade-in'; // Класс для анимации появления элемента
const fadeOutClass = 'fade-out'; // Класс для анимации исчезновения элемента

// Символы для различных типов символов и азбуки Морзе
const poopSymbol = '💩';
const cupcakeSymbol = '🧁';
const lollipopSymbol = '🍭';
const dotSymbol = '.';
const dashSymbol = '-';

// Азбука Морзе: соответствие последовательностей и букв
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

// Инициализация отображения инкремента
updateIncrementDisplay();

// Добавление обработчика клика на кнопку-оверлей
buttonOverlay.addEventListener("click", function () {
    isButtonOverlayActive = !isButtonOverlayActive;

    // Изменение стилей в зависимости от активации кнопки-оверлея
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

    // Обработка азбуки Морзе при активации и проверка символа при отключении кнопки
    if (isButtonOverlayActive) {
        handleMorseInput(0);
    } else {
        checkCharacter();
    }
});

// Функция для заполнения широкой кнопки на основе процентного значения
function fillWideButton(percent) {
    fillPercentage = `${percent}%`;
    wideButton.style.setProperty('--fill-width', fillPercentage);
    wideButton.style.background = wideButtonFillGradient.replace(/0%/g, fillPercentage);
}

// Функция для обновления отображения инкремента
function updateIncrementDisplay() {
    incrementDisplay.textContent = `${increment}%`;
}

// Функция для уменьшения размера изображения
function decreaseImageSize() {
    scale -= 2;
    image.style.transform = `scale(${scale / 100})`;
}

// Функция для сброса размера изображения
function resetImageSize() {
    scale = 100;
    image.style.transform = `scale(${scale / 100})`;
}

// Обработчики событий на изображении для касаний
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

    // Определение символа и его класса в зависимости от активации кнопки-оверлея
    if (isButtonOverlayActive) {
        symbol = touchDuration >= shortTouchDuration ? dashSymbol : dotSymbol;
        symbolClass = 'symbol';
    } else {
        symbol = touchDuration >= shortTouchDuration ? cupcakeSymbol : lollipopSymbol;
        symbolClass = 'symbol-eat';
    }

    // Создание анимированного символа на экране
    createFloatingSymbol(touchPositionX, touchPositionY, symbol, symbolClass);

    // Обработка инкремента или азбуки Морзе в зависимости от состояния кнопки-оверлея
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

// Создание анимированного символа на экране
function createFloatingSymbol(x, y, symbol, symbolClass) {
  const symbolElement = document.createElement('div');
  symbolElement.textContent = symbol;
  symbolElement.className = symbolClass || 'symbol';
  symbolElement.style.left = `${x}px`;
  symbolElement.style.top = `${y}px`;

  // Установка размера шрифта в зависимости от типа символа
  if (symbol === cupcakeSymbol || symbol === lollipopSymbol) {
      symbolElement.style.fontSize = symbolFontSize;
  } else {
      symbolElement.style.fontSize = `${fontSize}px`;
  }

  symbolElement.style.pointerEvents = 'none';
  document.body.appendChild(symbolElement);

  // Рассчитываем смещение элемента и его анимацию
  const overlayTop = overlayArea.getBoundingClientRect().top;
  const translateY = y - overlayTop + (symbol === cupcakeSymbol || symbol === lollipopSymbol ? parseInt(symbolFontSize) / 2 : fontSize / 2);

  requestAnimationFrame(() => {
      symbolElement.style.transform = `translateY(-${translateY}px)`;
      symbolElement.style.opacity = 0;
  });

  // Удаление элемента после завершения анимации
  setTimeout(() => {
      symbolElement.remove();
  }, 2000);
}

let morseInput = '';
let morseTimeout;

// Обработка ввода азбуки Морзе
function handleMorseInput(duration) {
  clearTimeout(morseTimeout);

  morseInput = ''; // Сбрасываем введенную азбуку Морзе

  // Добавляем точку или тире в зависимости от длительности касания
  morseInput += duration >= shortTouchDuration ? dashSymbol : dotSymbol;

  // Устанавливаем таймаут для декодирования символа
  morseTimeout = setTimeout(() => {
      const letter = decodeMorse(morseInput);
      updateMorseBar(letter);

      // Проверяем символ и обновляем экран
      setTimeout(() => {
          checkCharacter(letter);
      }, characterDisplayDuration);

      morseInput = ''; // Сбрасываем введенную азбуку Морзе
  }, morseInputTimeoutDuration);
}

// Декодирование азбуки Морзе в символ
function decodeMorse(sequence) {
  return morseAlphabet[sequence] || poopSymbol; // Возвращаем символ или значок "💩" при отсутствии соответствия
}

// Проверка текущего символа и его отображение
function checkCharacter(letter = '') {
  if (letter.toLowerCase() === targetArray[currentIndex]) {
      // Добавляем символ на экран
      const characterDiv = document.createElement('div');
      characterDiv.classList.add('character', fadeInClass);
      characterDiv.textContent = letter;
      buttonOverlay.appendChild(characterDiv);

      currentIndex++; // Переходим к следующему символу

      if (currentIndex === targetArray.length) {
          handleGameEnd(); // Обрабатываем завершение игры
      }
  } else {
      // Удаляем все отображенные символы и сбрасываем индекс
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

// Обработка завершения игры
function handleGameEnd() {
  buttonOverlay.classList.add('game-over-animation'); // Добавляем анимацию завершения игры

  // Очищаем экран и сбрасываем состояния
  setTimeout(() => {
      buttonOverlay.innerHTML = '';
      isButtonOverlayActive = false;
      buttonOverlay.classList.remove('pulsing', 'game-over-animation');
      buttonOverlay.style.opacity = 1;
      buttonPanel.classList.remove('button-panel-hidden');
      buttonPanelTop.classList.remove('button-panel-hidden');
  }, 2000);
}

// Обновление полосы Морзе
function updateMorseBar(letter) {
  morseBar.textContent = letter; // Устанавливаем символ в полосу Морзе
  morseBar.style.opacity = 1; // Показываем полосу Морзе

  // Скрываем полосу Морзе после заданного времени
  setTimeout(() => {
      morseBar.textContent = '';
      morseBar.style.opacity = 0;
  }, morseBarDisplayDuration);
}

// Периодическое уменьшение инкремента
setInterval(() => {
  if (increment > 0) {
      increment -= decrementAmount;
      updateIncrementDisplay();
      fillWideButton(increment);
  }
}, decrementInterval);
