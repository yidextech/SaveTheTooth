const balloon = document.getElementById("balloon");
const container = document.querySelector(".game-container");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");

let obstacles = [];
let balloonX = 0;
let balloonSpeed = 0;
const BALLOON_Y = 30;
const MAX_X = 350;
const MIN_X = 0;
let obstacleSpeed = 3;
let score = 0;
let highScore = 0;
let gameRunning = false;
let animationId;

// **20% FASTER BALLOON SPEED** (1.2 multiplier)
const BALLOON_SPEED_MULTIPLIER = 1.2; 
const SPEED_INTERVAL = 5;
const SPEED_MULTIPLIER = 1.03;

// ★★★ MAX SPEED CAPS FOR EACH DIFFICULTY ★★★
// Score ~173 hits these limits - no further increases!
const MAX_SPEEDS = { 1: 9, 2: 15, 3: 24 };  // Easy:9, Medium:15, Hard:24

const keys = { left: false, right: false };
const MAX_OBSTACLES = 6;

// **PRESERVE DIFFICULTY ON RESTART**
const difficultySlider = document.getElementById("difficulty");
const difficultyLabel = document.getElementById("difficulty-label");

difficultySlider.addEventListener("input", () => {
  const val = Number(difficultySlider.value);
  let label = val === 1 ? "Easy" : val === 2 ? "Medium" : "Hard";
  difficultyLabel.textContent = label;
  setDifficultyBySlider(val);
});

// ★★★ GET MAX SPEED FOR CURRENT DIFFICULTY ★★★
function getMaxSpeedByDifficulty() {
  const val = Number(difficultySlider.value);
  return MAX_SPEEDS[val] || 9;  // Default to Easy max
}

function setDifficultyBySlider(val) {
  if (val === 1) obstacleSpeed = 3;
  if (val === 2) obstacleSpeed = 5;
  if (val === 3) obstacleSpeed = 9;
}

function createObstacle() {
  const obs = document.createElement("div");
  obs.classList.add("obstacle");
  
  const img = document.createElement("img");
  img.src = "pictures/bacteria.png";
  obs.appendChild(img);

  obs.dataset.x = Math.random() * 360;
  obs.dataset.y = -60 - Math.random() * 200;
  obs.style.left = obs.dataset.x + "px";
  obs.style.top = obs.dataset.y + "px";

  container.appendChild(obs);
  obstacles.push(obs);
}

function startGame() {
  cancelAnimationFrame(animationId);
  const overlay = document.getElementById("game-over");
  overlay.style.display = "none";

  obstacles.forEach(o => o.remove());
  obstacles = [];

  score = 0;
  scoreEl.textContent = score;

  // **PRESERVE CURRENT SLIDER DIFFICULTY ON RESTART**
  const val = Number(difficultySlider.value);
  setDifficultyBySlider(val);

  balloonX = (container.offsetWidth - balloon.offsetWidth) / 2;
  balloonSpeed = 0;
  balloon.style.left = balloonX + "px";
  balloon.style.bottom = BALLOON_Y + "px";

  gameRunning = true;

  for (let i = 0; i < 3; i++) createObstacle();
  gameLoop();
}

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") keys.left = true;
  if (e.key === "ArrowRight") keys.right = true;
});

document.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft") keys.left = false;
  if (e.key === "ArrowRight") keys.right = false;
});

function gameLoop() {
  if (!gameRunning) return;

  // **20% FASTER BALLOON** - multiplied by 1.2
  if (keys.left) balloonSpeed -= 0.8 * 1.8 * BALLOON_SPEED_MULTIPLIER;
  if (keys.right) balloonSpeed += 0.8 * 1.8 * BALLOON_SPEED_MULTIPLIER;
  balloonSpeed *= 0.85;
  balloonX += balloonSpeed;

  if (balloonX < MIN_X) balloonX = MIN_X;
  if (balloonX > MAX_X) balloonX = MAX_X;
  balloon.style.left = balloonX + "px";

  obstacles.forEach(obs => {
    let y = Number(obs.dataset.y);
    y += obstacleSpeed;
    obs.dataset.y = y;
    obs.style.top = y + "px";

    if (y > 500) {
      obs.dataset.y = -60;
      obs.dataset.x = Math.random() * 360;
      obs.style.left = obs.dataset.x + "px";

      score++;
      scoreEl.textContent = score;

      // ★★★ MAX SPEED LIMIT - NO MORE INCREASE AFTER SCORE 173 ★★★
      if (score % SPEED_INTERVAL === 0 && obstacleSpeed < getMaxSpeedByDifficulty()) {
        obstacleSpeed *= SPEED_MULTIPLIER;
        if (obstacles.length < MAX_OBSTACLES) createObstacle();
      }
    }

    checkCollision(obs);
  });

  animationId = requestAnimationFrame(gameLoop);
}

function checkCollision(obs) {
  const b = balloon.getBoundingClientRect();
  const o = obs.getBoundingClientRect();

  const radius = Math.min(b.width, b.height) / 2 * 0.6;
  const cx = b.left + b.width / 2;
  const cy = b.top + b.height / 2;

  const PADDING = 25;  // ★★★ FIXED: MORE FORGIVING (was 8) ★★★
  
  const left = o.left + PADDING;
  const right = o.right - PADDING;
  const top = o.top + PADDING;
  const bottom = o.bottom - PADDING;

  const closestX = Math.max(left, Math.min(cx, right));
  const closestY = Math.max(top, Math.min(cy, bottom));

  const dx = cx - closestX;
  const dy = cy - closestY;

  if (dx * dx + dy * dy < radius * radius) {
    endGame();
  }
}

function endGame() {
  gameRunning = false;

  if (score > highScore) {
    highScore = score;
    highScoreEl.textContent = highScore;
  }

  const overlay = document.getElementById("game-over");
  document.getElementById("final-score").textContent = score;
  overlay.style.display = "flex"; // Triggers curtain animation
}

function restartGame() {
  startGame(); // Uses current slider value - difficulty preserved!
}
