window.onload = () => {
  const loading = document.getElementById("loading");
  loading.style.display = "none"; // скрываем overlay после полной загрузки
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
const finishScore = 1;
let gameStarted = false;

// Прыжок
function jump() {
  if (!player.classList.contains("jump")) {
    player.classList.add("jump");
    setTimeout(() => player.classList.remove("jump"), 600);
  }
}
document.body.addEventListener("keydown", e => { if (e.code === "Space") jump(); });
document.body.addEventListener("touchstart", jump);

// Музыка после клика
document.body.addEventListener("click", () => {
  music.muted = false;
  music.play();
}, { once: true });

// Проверка ориентации ДО загрузки
function checkOrientationBeforeLoading() {
  if (window.innerWidth > window.innerHeight) {
    rotateOverlay.style.display = 'none';
    loadingOverlay.style.display = 'flex';
  } else {
    rotateOverlay.style.display = 'flex';
    loadingOverlay.style.display = 'none';
  }
}

// Проверка ориентации в реальном времени после старта игры
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

// Слушатели resize/orientationchange
checkOrientationBeforeLoading();
window.addEventListener('resize', () => {
  checkOrientationBeforeLoading();
  checkOrientationDuringGame();
});
window.addEventListener('orientationchange', () => {
  checkOrientationBeforeLoading();
  checkOrientationDuringGame();
});

// Старт игры
function startGame() {
  gameStarted = true;
  score = 0;
  spawned = 0;
  gameOver = false;
  scoreEl.textContent = "Пройдено: 0";
  message.style.display = "none";
  restartBtn.style.display = "none";

  document.querySelectorAll(".obstacle").forEach(o => o.remove());

  // скрываем загрузку и показываем игру
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
  }, 50); // увеличиваем интервал для экономии ресурсов

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
}

// Фиксируем видимость картинок
function fixWishImages() {
  const images = document.querySelectorAll("#birthdayExtra .wish-img");
  images.forEach(img => {
    img.style.animation = "none";
    img.style.opacity = "1";
    img.style.transform = "scale(1)";
  });
}

// Кнопки
restartBtn.addEventListener("click", startGame);
startBtn.addEventListener('click', startGame);

// Показ финала
function showFinal() {
  const finalOverlay = document.getElementById("finalOverlay");
  finalOverlay.style.display = "flex";
}

// Подарок
const giftBox = document.getElementById("giftBox");
const finalText = document.getElementById("finalText");

giftBox.addEventListener("click", explodeGift);

function explodeGift() {
  giftBox.style.animation = "none";

  giftBox.animate(
    [
      { transform: "scale(1)", opacity: 1 },
      { transform: "scale(2)", opacity: 0 }
    ],
    { duration: 500, fill: "forwards", easing: "ease-out" }
  );

  setTimeout(() => {
    finalText.style.display = "block";
  }, 600);
}
