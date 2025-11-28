window.onload = () => {
  const loading = document.getElementById("loading");
  loading.style.display = "none"; // скрываем overlay
};
const loadingOverlay = document.getElementById("loadingOverlay");
const startBtn = document.getElementById("startBtn");

const game = document.getElementById("game");
const player = document.getElementById("player");
const scoreEl = document.getElementById("score");
const message = document.getElementById("message");
const messageText = document.getElementById("messageText");
const restartBtn = document.getElementById("restartBtn");

const rotateOverlay = document.getElementById("rotateOverlay");
const gameContainer = document.getElementById("gameContainer");
const music = document.getElementById("bgMusic");

let score = 0;
let spawned = 0;
let gameOver = false;
const finishScore = 10;
let gameStarted = false;
let confettiActive = false;



// прыжок
function jump() {
  if (!player.classList.contains("jump")) {
    player.classList.add("jump");
    setTimeout(() => player.classList.remove("jump"), 600);
  }
}
document.body.addEventListener("keydown", e => { if (e.code === "Space") jump(); });
document.body.addEventListener("touchstart", jump);

// музыка после клика
document.body.addEventListener("click", () => {
  music.muted = false;
  music.play();
}, { once: true });

// проверка ориентации ДО загрузки
function checkOrientationBeforeLoading() {
  if (window.innerWidth > window.innerHeight) {
    // горизонтально → показываем загрузку
    rotateOverlay.style.display = 'none';
    loadingOverlay.style.display = 'flex';
  } else {
    // вертикально → показываем просьбу повернуть
    rotateOverlay.style.display = 'flex';
    loadingOverlay.style.display = 'none';
  }
}

// проверка ориентации в реальном времени после старта игры
function checkOrientationDuringGame() {
  if (!gameStarted) return;
  if (window.innerWidth > window.innerHeight) {
    rotateOverlay.style.display = 'none';
    gameContainer.style.display = 'block';
  } else {
    rotateOverlay.style.display = 'flex';
    gameContainer.style.display = 'none';
  }
}

// запускаем проверку ДО загрузки
checkOrientationBeforeLoading();
window.addEventListener('resize', () => {
  checkOrientationBeforeLoading();
  checkOrientationDuringGame();
});
window.addEventListener('orientationchange', () => {
  checkOrientationBeforeLoading();
  checkOrientationDuringGame();
});

// старт игры
function startGame() {
  gameStarted = true;
  score = 0;
  spawned = 0;
  gameOver = false;
  scoreEl.textContent = "Пройдено: 0";
  message.style.display = "none";
  restartBtn.style.display = "none";

  // удалить старые препятствия
  document.querySelectorAll(".obstacle").forEach(o => o.remove());

  // скрываем загрузку
  loadingOverlay.style.display = 'none';
  gameContainer.style.display = 'block';

  spawnGroup(2, 800);
  spawnObstacle();
}

function spawnGroup(count, interval) {
  for (let i = 0; i < count; i++) {
    setTimeout(spawnObstacle, i * interval);
  }
}

function spawnObstacle() {
  if (gameOver) return;
  if (spawned >= finishScore) return;

  spawned++;
  const obstacle = document.createElement("img");
  obstacle.src = "static/lotos.png";
  obstacle.className = "obstacle";
  game.appendChild(obstacle);

  const checkCollision = setInterval(() => {
    const playerRect = player.getBoundingClientRect();
    const obsRect = obstacle.getBoundingClientRect();
    if (
      playerRect.left < obsRect.right &&
      playerRect.right > obsRect.left &&
      playerRect.bottom > obsRect.top &&
      playerRect.top < obsRect.bottom
    ) {
      gameOver = true;
      message.style.display = "flex";
      messageText.innerHTML = "проигрыш ((";
      restartBtn.style.display = "inline-block";
      clearInterval(checkCollision);
    }
  }, 30);

 obstacle.addEventListener("animationend", () => {
  if (!gameOver) {
    score++;
    scoreEl.textContent = "Пройдено: " + score;

    if (score >= finishScore) {
      gameOver = true;
      message.style.display = "flex";
      showFinal();

      setTimeout(() => {
        const birthdayExtra = document.getElementById("birthdayExtra");
        birthdayExtra.classList.add("show");

        // фиксируем видимость картинок
        fixWishImages();
      }, 800);
    }
  }

  obstacle.remove();
  clearInterval(checkCollision);

  if (!gameOver && spawned < finishScore) {
    setTimeout(spawnObstacle, 400 + Math.random() * 400);
  }
});

// Вынеси функцию наружу, чтобы её можно было вызвать
function fixWishImages() {
  const images = document.querySelectorAll("#birthdayExtra .wish-img");
  images.forEach(img => {
    // убираем анимацию, чтобы она не сбрасывала opacity
    img.style.animation = "none";
    img.style.opacity = "1";
    img.style.transform = "scale(1)";
  });
}
}

// кнопка рестарта
restartBtn.addEventListener("click", startGame);

// кнопка «Начать игру»
startBtn.addEventListener('click', startGame);

// показываем загрузку после полной загрузки страницы, только если горизонтально




// Показ финала
function showFinal() {
  finalOverlay.style.display = "flex";
}

// Нажатие на подарок → взрыв
giftBox.addEventListener("click", explodeGift);

function explodeGift() {
  giftBox.style.animation = "none";

  // Анимация исчезновения подарка
  giftBox.animate(
    [
      { transform: "scale(1)", opacity: 1 },
      { transform: "scale(2)", opacity: 0 }
    ],
    { duration: 500, fill: "forwards", easing: "ease-out" }
  );

  // Запуск конфетти
  setTimeout(startConfetti, 400);

  // Показ текста
  setTimeout(() => {
    finalText.style.display = "block";
  }, 600);
}

// Конфетти
const canvas = document.getElementById("confettiCanvas");
const ctx = canvas.getContext("2d");

let confettiPieces = [];

function startConfetti() {
  canvas.style.display = "block";
  confettiActive = true;

  for (let i = 0; i < 20; i++) {
    confettiPieces.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * -window.innerHeight,
      size: 5 + Math.random() * 8,
      speed: 2 + Math.random() * 3,
      angle: Math.random() * 360
    });
  }

  drawConfetti();

  // ⛔ Остановить через 3 секунды (можно менять)
  setTimeout(() => {
    confettiActive = false;
    setTimeout(() => {
      canvas.style.display = "none";
      confettiPieces = []; // очистка
    }, 500);
  }, 2000);
}

function drawConfetti() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  confettiPieces.forEach(c => {
    c.y += c.speed;
    c.angle += 5;

    if (c.y > canvas.height) c.y = -10;

    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.angle * Math.PI / 180);
    ctx.fillStyle = 'rgb(209, 250, 255)';
    ctx.fillRect(0, 0, c.size, c.size);
    ctx.restore();
  });

  requestAnimationFrame(drawConfetti);
}


