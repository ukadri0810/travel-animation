const stage = document.getElementById('stage');
const button = document.getElementById('runButton');
const bubble = document.getElementById('bubble');
const attemptCount = document.getElementById('attemptCount');
const timer = document.getElementById('timer');
const resultCard = document.getElementById('resultCard');
const finalAttempts = document.getElementById('finalAttempts');
const finalTime = document.getElementById('finalTime');
const restartButton = document.getElementById('restartButton');
const buttonText = document.getElementById('buttonText');
const face = document.getElementById('face');
const hintText = document.getElementById('hintText');
const canvas = document.getElementById('confettiCanvas');
const ctx = canvas.getContext('2d');

const taunts = [
  'Too slow 😂',
  'Almost had me.',
  'Your Wi-Fi is faster than that?',
  'Skill issue 👀',
  'I moved before you blinked.',
  'One more try. Maybe.',
  'Okay, you are getting close.',
  'Fine, I am tired now.'
];
const faces = ['😏', '😂', '😜', '🏃', '😬', '👀', '😅', '😭'];

let attempts = 0;
let startTime = null;
let timerId = null;
let gameOver = false;
let confettiPieces = [];

function isMobile() {
  return matchMedia('(pointer: coarse)').matches || window.innerWidth < 760;
}

function resizeCanvas() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function startTimer() {
  if (startTime) return;
  startTime = performance.now();
  timerId = setInterval(() => {
    timer.textContent = `${((performance.now() - startTime) / 1000).toFixed(1)}s`;
  }, 80);
}

function showBubble(text) {
  bubble.textContent = text;
  bubble.classList.remove('pop');
  requestAnimationFrame(() => bubble.classList.add('pop'));
  setTimeout(() => bubble.classList.remove('pop'), 220);
}

function safePosition() {
  const stageRect = stage.getBoundingClientRect();
  const btnRect = button.getBoundingClientRect();
  const pad = isMobile() ? 30 : 36;
  const minX = pad + btnRect.width / 2;
  const maxX = stageRect.width - pad - btnRect.width / 2;
  const minY = 78 + btnRect.height / 2;
  const maxY = stageRect.height - pad - btnRect.height / 2;
  return {
    x: Math.max(minX, Math.min(maxX, minX + Math.random() * (maxX - minX))),
    y: Math.max(minY, Math.min(maxY, minY + Math.random() * (maxY - minY)))
  };
}

function moveButton() {
  const pos = safePosition();
  button.style.left = `${pos.x}px`;
  button.style.top = `${pos.y}px`;
  button.style.transform = `translate(-50%, -50%) rotate(${(Math.random() * 12 - 6).toFixed(1)}deg)`;
}

function registerMiss() {
  if (gameOver) return;
  startTimer();
  attempts += 1;
  attemptCount.textContent = attempts;
  const text = taunts[Math.min(attempts - 1, taunts.length - 1)];
  showBubble(text);
  face.textContent = faces[Math.min(attempts - 1, faces.length - 1)];
  hintText.textContent = attempts < 5 ? 'Keep trying. The button slowly loses confidence.' : 'Now it is tired. Catch it.';

  if (navigator.vibrate) navigator.vibrate(18);
  moveButton();

  if (attempts >= 6) {
    buttonText.textContent = 'Okay catch me';
    button.style.transitionDuration = '.55s';
  }
}

function winGame() {
  if (gameOver) return;
  gameOver = true;
  clearInterval(timerId);
  const finalSeconds = startTime ? ((performance.now() - startTime) / 1000).toFixed(1) : '0.0';
  finalAttempts.textContent = attempts + 1;
  finalTime.textContent = `${finalSeconds}`;
  timer.textContent = `${finalSeconds}s`;
  button.style.opacity = '0';
  resultCard.classList.add('show');
  showBubble('You got me 😭');
  if (navigator.vibrate) navigator.vibrate([30, 50, 60]);
  launchConfetti();
}

button.addEventListener('pointerdown', (event) => {
  event.preventDefault();
  if (gameOver) return;
  if (attempts >= 6) winGame();
  else registerMiss();
});

stage.addEventListener('pointermove', (event) => {
  if (gameOver || isMobile() || attempts >= 6) return;
  const rect = button.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY);
  if (distance < 105) registerMiss();
});

function resetGame() {
  attempts = 0;
  startTime = null;
  gameOver = false;
  clearInterval(timerId);
  attemptCount.textContent = '0';
  timer.textContent = '0.0s';
  buttonText.textContent = 'Catch me';
  face.textContent = '😏';
  hintText.textContent = 'Tap the button to start. It gets easier after a few tries.';
  button.style.opacity = '1';
  button.style.left = '50%';
  button.style.top = '58%';
  button.style.transform = 'translate(-50%, -50%)';
  button.style.transitionDuration = '';
  resultCard.classList.remove('show');
  showBubble('Catch me first 😏');
}
restartButton.addEventListener('click', resetGame);

function launchConfetti() {
  confettiPieces = Array.from({ length: 110 }, () => ({
    x: Math.random() * window.innerWidth,
    y: -20 - Math.random() * window.innerHeight * .4,
    size: 5 + Math.random() * 7,
    speed: 2 + Math.random() * 4,
    drift: Math.random() * 2 - 1,
    rotation: Math.random() * Math.PI,
    spin: Math.random() * .22 - .11,
    life: 120 + Math.random() * 40
  }));
  animateConfetti();
}

function animateConfetti() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  confettiPieces.forEach((p) => {
    p.x += p.drift;
    p.y += p.speed;
    p.rotation += p.spin;
    p.life -= 1;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * .65);
    ctx.restore();
  });
  confettiPieces = confettiPieces.filter(p => p.life > 0 && p.y < window.innerHeight + 40);
  if (confettiPieces.length) requestAnimationFrame(animateConfetti);
  else ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
}
