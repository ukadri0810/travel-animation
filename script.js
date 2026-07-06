const gameArea = document.getElementById('gameArea');
const runnerBtn = document.getElementById('runnerBtn');
const speech = document.getElementById('speech');
const attemptCountEl = document.getElementById('attemptCount');
const timerEl = document.getElementById('timer');
const moodEl = document.getElementById('mood');
const resultCard = document.getElementById('resultCard');
const resultStats = document.getElementById('resultStats');
const restartBtn = document.getElementById('restartBtn');
const hint = document.getElementById('hint');

const taunts = [
  'Too slow 😂',
  'Almost had me!',
  'Your Wi-Fi is faster than you.',
  'Skill issue 👀',
  'Nice try, legend.',
  'I saw that click coming.',
  'Bro missed again 😭',
  'Okay, that was close.'
];

const moods = ['😏', '😂', '😎', '🤭', '🏃', '😅', '😭'];
let attempts = 0;
let startTime = null;
let timerInterval = null;
let canWin = false;
let gameDone = false;
let lastMoveTime = 0;

function startTimer() {
  if (timerInterval) return;
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    timerEl.textContent = `${elapsed.toFixed(1)}s`;
  }, 100);
}

function showSpeech(text) {
  speech.textContent = text;
  speech.classList.add('show');
  clearTimeout(showSpeech.timeout);
  showSpeech.timeout = setTimeout(() => speech.classList.remove('show'), 850);
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function moveButton() {
  if (gameDone) return;
  startTimer();

  attempts += 1;
  attemptCountEl.textContent = attempts;
  moodEl.textContent = moods[attempts % moods.length];

  if (attempts >= 6) {
    canWin = true;
    runnerBtn.classList.add('tired');
    runnerBtn.textContent = 'Okay, catch me 😅';
    showSpeech('Fine... I am tired now.');
    return;
  }

  const areaRect = gameArea.getBoundingClientRect();
  const btnRect = runnerBtn.getBoundingClientRect();
  const maxLeft = areaRect.width - btnRect.width - 20;
  const maxTop = areaRect.height - btnRect.height - 20;

  const newLeft = randomBetween(20, Math.max(22, maxLeft));
  const newTop = randomBetween(82, Math.max(90, maxTop));

  runnerBtn.style.left = `${newLeft}px`;
  runnerBtn.style.top = `${newTop}px`;
  runnerBtn.style.transform = `translate(0, 0) rotate(${randomBetween(-9, 9)}deg)`;

  showSpeech(taunts[Math.floor(Math.random() * taunts.length)]);
  popLaugh(newLeft + btnRect.width / 2, newTop);
}

function popLaugh(x, y) {
  const laugh = document.createElement('div');
  laugh.className = 'fake-laugh';
  laugh.textContent = Math.random() > 0.5 ? '😂' : '💨';
  laugh.style.left = `${x}px`;
  laugh.style.top = `${y}px`;
  gameArea.appendChild(laugh);
  setTimeout(() => laugh.remove(), 950);
}

function winGame() {
  if (!canWin || gameDone) {
    moveButton();
    return;
  }

  gameDone = true;
  clearInterval(timerInterval);

  const totalTime = startTime ? ((Date.now() - startTime) / 1000).toFixed(1) : '0.0';
  resultStats.textContent = `Attempts: ${attempts} • Time: ${totalTime}s`;
  resultCard.classList.remove('hidden');
  launchConfetti();

  if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
}

function launchConfetti() {
  const colors = ['#fff1a8', '#ff7ab6', '#75ffb1', '#8ea7ff', '#ffffff'];
  for (let i = 0; i < 90; i += 1) {
    const piece = document.createElement('div');
    piece.className = 'confetti';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = `${Math.random() * 0.6}s`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 2400);
  }
}

function resetGame() {
  attempts = 0;
  startTime = null;
  canWin = false;
  gameDone = false;
  clearInterval(timerInterval);
  timerInterval = null;
  attemptCountEl.textContent = '0';
  timerEl.textContent = '0.0s';
  moodEl.textContent = '😏';
  runnerBtn.textContent = 'Catch Me 😏';
  runnerBtn.classList.remove('tired');
  runnerBtn.style.left = '50%';
  runnerBtn.style.top = '56%';
  runnerBtn.style.transform = 'translate(-50%, -50%)';
  resultCard.classList.add('hidden');
  hint.textContent = window.innerWidth < 760 ? 'Tap it. It may run away 👀' : 'Move near the button or tap it 👀';
}

runnerBtn.addEventListener('click', winGame);
runnerBtn.addEventListener('touchstart', (event) => {
  event.preventDefault();
  winGame();
}, { passive: false });

// Desktop: move when cursor gets close.
gameArea.addEventListener('mousemove', (event) => {
  if (window.matchMedia('(pointer: coarse)').matches || gameDone || canWin) return;

  const now = Date.now();
  if (now - lastMoveTime < 450) return;

  const btnRect = runnerBtn.getBoundingClientRect();
  const btnCenterX = btnRect.left + btnRect.width / 2;
  const btnCenterY = btnRect.top + btnRect.height / 2;
  const distance = Math.hypot(event.clientX - btnCenterX, event.clientY - btnCenterY);

  if (distance < 125) {
    lastMoveTime = now;
    moveButton();
  }
});

restartBtn.addEventListener('click', resetGame);
window.addEventListener('resize', resetGame);
resetGame();
