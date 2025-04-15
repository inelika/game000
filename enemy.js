let enemies = [];
let loot = [];

function spawnEnemy() {
  const type = Math.random() < 0.7 ? "demon" : "ghost";
  let enemy = {
    type,
    x: canvas.width,
    y: type === "ghost" ? 100 : 160,
    width: 40,
    height: 40,
    color: type === "ghost" ? "#ffffff" : "#660000",
    speed: gameSettings.speed,
    alive: true
  };
  enemies.push(enemy);
}

function drawEnemies(ctx) {
  enemies.forEach((e) => {
    ctx.fillStyle = e.color;
    ctx.fillRect(e.x, e.y, e.width, e.height);
  });
}

function updateEnemies() {
  enemies.forEach((e) => {
    e.x -= e.speed;
  });
  enemies = enemies.filter((e) => e.x + e.width > 0 && e.alive);
}

function handleCollisions() {
  enemies.forEach((enemy) => {
    if (!enemy.alive) return;

    if (detectCollision(demon, enemy)) {
      if (enemy.type === "ghost") {
        if (!demon.ducking) {
          endGame();
        }
      } else {
        // Уничтожить демона, если не атакует
        if (!demon.attacking) {
          endGame();
        } else {
          enemy.alive = false;
          spawnLoot(enemy.x, enemy.y);
        }
      }
    }
  });
}

function spawnLoot(x, y) {
  loot.push({ x, y, width: 20, height: 20, color: "#ffcc00" });
}

function drawLoot(ctx) {
  loot.forEach((l) => {
    ctx.fillStyle = l.color;
    ctx.fillRect(l.x, l.y, l.width, l.height);
  });
}

