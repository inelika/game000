const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const scoreboard = document.getElementById("scoreboard");
const highscoreDisplay = document.getElementById("highscore");
const levelDisplay = document.getElementById("levelDisplay");
const gameOverMessage = document.getElementById("gameOverMessage");
const difficultySelect = document.getElementById("difficulty");

let frame = 0;
let score = 0;
let highscore = localStorage.getItem("highscore") || 0;
let animationId;
let gameOver = false;
let currentDifficulty = "medium";
let gameSettings = {};

let obstacles = [];
let obstacleCooldown = 0;

let ghost = null;

highscoreDisplay.textContent = "Рекорд: " + highscore;

// === Уровни сложности ===
const difficultySettings = {
  easy: { speed: 5, gravity: 1.3, name: "Лёгкий" },
  medium: { speed: 6, gravity: 1.5, name: "Средний" },
  hard: { speed: 7, gravity: 1.7, name: "Ад" },
  hell: { speed: 9, gravity: 2.0, name: "Супер Ад" },
};

// === Инициализация ===
function initGame() {
  demon.y = 150;
  demon.dy = 0;
  demon.grounded = true;
  demon.ducking = false;
  demon.currentAnimation = "walk";
  demon.isAlive = true;
  score = 0;
  frame = 0;
  gameOver = false;
  obstacleCooldown = 0;
  obstacles = [];
  ghost = null;

  gameSettings = difficultySettings[currentDifficulty];
  demon.gravity = gameSettings.gravity;
  levelDisplay.textContent = "Уровень: " + gameSettings.name;

  scoreboard.textContent = "Счёт: 0";
  gameOverMessage.style.display = "none";

  if (currentDifficulty !== "easy") spawnGhost(currentDifficulty);
}

// === Препятствия ===
function spawnObstacle(difficulty) {
  if (obstacleCooldown > 0) {
    obstacleCooldown--;
    return;
  }

  let count = 1;
  let cooldown = 300;

  switch (difficulty) {
    case "easy":
      cooldown = 360;
      break;
    case "medium":
      cooldown = 240 + Math.floor(Math.random() * 60);
      break;
    case "hard":
      cooldown = 180;
      break;
    case "hell":
      count = Math.floor(3 + Math.random() * 3); // 3–6 препятствий
      cooldown = 30 + Math.floor(Math.random() * 60);
      break;
  }

  for (let i = 0; i < count; i++) {
    const rand = Math.random();
    let ob = {
      x: canvas.width + i * 40,
      y: rand < 0.5 ? 160 : (rand < 0.8 ? 180 : 100),
      width: rand < 0.5 ? 20 : 30,
      height: rand < 0.5 ? 40 : (rand < 0.8 ? 20 : 30),
      color: rand < 0.5 ? "#555" : (rand < 0.8 ? "#ff6600" : "#ffffff"),
      speed: rand > 0.8 ? gameSettings.speed * 1.3 : gameSettings.speed
    };
    obstacles.push(ob);
  }

  obstacleCooldown = cooldown;
}

// === Призрак ===
function spawnGhost(difficulty) {
  ghost = {
    x: canvas.width,
    y: 80,
    width: 40,
    height: 30,
    speedX: difficulty === "hell" ? 10 : 5,
    speedY: 1,
    direction: 1,
    active: true,
    vertical: difficulty === "hard" || difficulty === "hell"
  };
}

function updateGhost() {
  if (!ghost || !ghost.active) return;

  ghost.x -= ghost.speedX;

  if (ghost.vertical) {
    ghost.y += ghost.speedY * ghost.direction;
    if (ghost.y <= 50 || ghost.y >= 120) ghost.direction *= -1;
  }

  if (ghost.x + ghost.width < 0) {
    ghost.active = false;
    if (currentDifficulty === "hell" && Math.random() < 0.05) {
      spawnGhost("hell"); // внезапный респаун
    }
  }
}

function drawGhost() {
  if (!ghost || !ghost.active) return;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(ghost.x, ghost.y, ghost.width, ghost.height);
}

function checkGhostCollision() {
  if (!ghost || !ghost.active) return;

  if (detectCollision(demon, ghost)) {
    if (!demon.ducking) {
      endGame();
    }
  }
}

// === Обновление игры ===
function update() {
  if (gameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#333";
  ctx.fillRect(0, canvas.height - 10, canvas.width, 10);

  demon.y += demon.dy;
  demon.dy += demon.gravity;
  if (demon.y >= 150) {
    demon.y = 150;
    demon.dy = 0;
    demon.grounded = true;
    if (!demon.ducking) demon.currentAnimation = "walk";
  }

  spawnObstacle(currentDifficulty);
  updateGhost();
  checkGhostCollision();

  obstacles.forEach(ob => {
    ob.x -= ob.speed;
    ctx.fillStyle = ob.color;
    ctx.fillRect(ob.x, ob.y, ob.width, ob.height);

    if (detectCollision(demon, ob)) {
      endGame();
    }
  });

  obstacles = obstacles.filter(ob => ob.x + ob.width > 0);

  drawGhost();
  drawDemon(ctx);

  score++;
  scoreboard.textContent = "Счёт: " + score;

  frame++;
  animationId = requestAnimationFrame(update);
}

// === Коллизии ===
function detectCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// === Управление ===
document.addEventListener("keydown", (e) => {
  if ((e.code === "Space" || e.code === "ArrowUp") && demon.grounded && !gameOver) {
    demon.dy = demon.jumpPower;
    demon.grounded = false;
    demon.currentAnimation = "jump";
  }

  if (e.code === "ArrowDown") {
    demon.ducking = true;
    demon.currentAnimation = "duck";
    demon.height = 20;
  }
});

document.addEventListener("keyup", (e) => {
  if (e.code === "ArrowDown") {
    demon.ducking = false;
    demon.currentAnimation = "walk";
    demon.height = 40;
  }
});

// === Конец игры ===
function endGame() {
  gameOver = true;
  cancelAnimationFrame(animationId);

  if (score > highscore) {
    highscore = score;
    localStorage.setItem("highscore", highscore);
    highscoreDisplay.textContent = "Рекорд: " + highscore;
  }

  gameOverMessage.innerHTML = `
    <p>Вы умерли</p>
    <p>Счёт: ${score}</p>
    <p>Сложность: ${gameSettings.name}</p>
  `;
  gameOverMessage.style.display = "block";
  restartBtn.style.display = "inline-block";
}

// === Кнопки ===
startBtn.onclick = () => {
  preloadDemonAnimations();
  initGame();
  update();
  startBtn.style.display = "none";
  restartBtn.style.display = "none";
};

restartBtn.onclick = () => {
  initGame();
  update();
  restartBtn.style.display = "none";
};

difficultySelect.addEventListener("change", (e) => {
  currentDifficulty = e.target.value;
  if (!gameOver) {
    initGame();
  }
});
