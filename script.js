const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startScreen = document.getElementById("startScreen");
const startBtn = document.getElementById("startBtn");
const gameWrapper = document.getElementById("gameWrapper");
const restartBtn = document.getElementById("restartBtn");

// ================= AUDIO =================
const bgMusic = new Audio("sounds/bg.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.4;

const positiveSound = new Audio("sounds/positive.wav");
const negativeSound = new Audio("sounds/negative.wav");

// ================= GAME STATE =================
let gameOver = false;
let score = 0;
let lives = 3;

// difficulty
let difficultyTimer = 0;
let speedMultiplier = 1;
let spawnInterval = 60;

// ================= PLAYER =================
const player = {
  x: 260,
  y: 360,
  width: 80,
  height: 20,
  speed: 6,
};

// ================= INPUT =================
const keys = {};
window.addEventListener("keydown", (e) => (keys[e.key] = true));
window.addEventListener("keyup", (e) => (keys[e.key] = false));

// ================= COMMENTS =================
let comments = [];
let spawnTimer = 0;

const positiveTexts = [
  "Kamu hebat!",
  "Tetap semangat!",
  "Keren banget!",
  "Terus berusaha!",
  "Jangan menyerah!",
];

const negativeTexts = [
  "Kamu gagal",
  "Payah",
  "Nggak bisa",
  "Menyerah aja",
  "Cupu",
];

// ================= START =================
startBtn.addEventListener("click", () => {
  startScreen.style.display = "none";
  gameWrapper.style.display = "block";
  bgMusic.play();
  gameLoop();
});

// ================= RESTART =================
restartBtn.addEventListener("click", restartGame);

// ================= FUNCTIONS =================
function updatePlayer() {
  if (keys["ArrowLeft"]) player.x -= player.speed;
  if (keys["ArrowRight"]) player.x += player.speed;

  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width)
    player.x = canvas.width - player.width;
}

// ===== DIFFICULTY =====
function updateDifficulty() {
  difficultyTimer++;
  if (difficultyTimer >= 300) {
    speedMultiplier += 0.15;
    if (spawnInterval > 20) spawnInterval -= 5;
    difficultyTimer = 0;
  }
}

// ===== COMMENTS =====
function spawnComment() {
  const isPositive = Math.random() > 0.5;

  comments.push({
    x: Math.random() * (canvas.width - 140),
    y: -40,
    width: 140,
    height: 30,
    speed: (2 + Math.random() * 2) * speedMultiplier,
    text: isPositive
      ? positiveTexts[Math.floor(Math.random() * positiveTexts.length)]
      : negativeTexts[Math.floor(Math.random() * negativeTexts.length)],
    type: isPositive ? "positive" : "negative",
  });
}

function updateComments() {
  spawnTimer++;
  if (spawnTimer >= spawnInterval) {
    spawnComment();
    spawnTimer = 0;
  }

  for (let i = comments.length - 1; i >= 0; i--) {
    comments[i].y += comments[i].speed;

    if (isColliding(player, comments[i])) {
      if (comments[i].type === "positive") {
        score += 10;
        positiveSound.play();
      } else {
        lives--;
        negativeSound.play();
        if (lives <= 0) gameOver = true;
      }
      comments.splice(i, 1);
    } else if (comments[i].y > canvas.height) {
      comments.splice(i, 1);
    }
  }
}

// ===== DRAW =====
function drawPlayer() {
  ctx.fillStyle = "#2196f3";
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawComments() {
  comments.forEach((c) => {
    ctx.fillStyle = c.type === "positive" ? "#4caf50" : "#f44336";
    ctx.fillRect(c.x, c.y, c.width, c.height);

    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.fillText(c.text, c.x + 6, c.y + 20);
  });
}

function drawUI() {
  ctx.fillStyle = "#333";
  ctx.font = "16px Arial";
  ctx.fillText("Score: " + score, 10, 22);
  ctx.fillText("Lives: " + lives, canvas.width - 80, 22);
}

// ===== COLLISION =====
function isColliding(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// ===== RESTART =====
function restartGame() {
  gameOver = false;
  score = 0;
  lives = 3;
  comments = [];
  spawnTimer = 0;
  difficultyTimer = 0;
  speedMultiplier = 1;
  spawnInterval = 60;
  restartBtn.style.display = "none";
  gameLoop();
}

// ================= GAME LOOP =================
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (gameOver) {
    ctx.font = "36px Arial";
    ctx.fillText("GAME OVER", 180, 180);
    ctx.font = "18px Arial";
    ctx.fillText("Tetap jaga pikiran positif 💙", 150, 220);
    restartBtn.style.display = "block";
    return;
  }

  updatePlayer();
  updateDifficulty();
  updateComments();

  drawPlayer();
  drawComments();
  drawUI();

  requestAnimationFrame(gameLoop);
}
