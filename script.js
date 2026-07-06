const arena = document.getElementById('arena');
const runner = document.getElementById('runner');
const speech = document.getElementById('speech');
const attemptsEl = document.getElementById('attempts');
const clockEl = document.getElementById('clock');
const note = document.getElementById('note');
const face = document.getElementById('face');
const runnerText = document.getElementById('runnerText');
const win = document.getElementById('win');
const finalAttempts = document.getElementById('finalAttempts');
const finalTime = document.getElementById('finalTime');
const again = document.getElementById('again');
const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');

const taunts = [
  'Too slow 😂',
  'Almost. Try again.',
  'Bro clicked air.',
  'Faster than your Wi-Fi.',
  'Okay, you are getting close.',
  'Fine. I am tired now.'
];
const faces = ['😂','😜','🏃','👀','😅','😭'];

let attempts = 0;
let start = 0;
let timer = null;
let ended = false;
let lastTap = 0;
let pieces = [];
const winAfter = 6;

function setCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
setCanvas();
window.addEventListener('resize', setCanvas);

function startTimer() {
  if (start) return;
  start = performance.now();
  timer = setInterval(() => {
    clockEl.textContent = `${((performance.now() - start) / 1000).toFixed(1)}s`;
  }, 80);
}

function speak(text) {
  speech.textContent = text;
  speech.classList.remove('pop');
  requestAnimationFrame(() => speech.classList.add('pop'));
  setTimeout(() => speech.classList.remove('pop'), 220);
}

function bounds() {
  const a = arena.getBoundingClientRect();
  const b = runner.getBoundingClientRect();
  const pad = 24;
  return {
    minX: pad + b.width / 2,
    maxX: Math.max(pad + b.width / 2, a.width - pad - b.width / 2),
    minY: 92 + b.height / 2,
    maxY: Math.max(92 + b.height / 2, a.height - pad - b.height / 2)
  };
}

function randomPosition() {
  const p = bounds();
  const x = p.minX + Math.random() * (p.maxX - p.minX);
  const y = p.minY + Math.random() * (p.maxY - p.minY);
  runner.style.left = `${x}px`;
  runner.style.top = `${y}px`;
  runner.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 14 - 7}deg)`;
}

function miss() {
  startTimer();
  attempts++;
  attemptsEl.textContent = attempts;
  speak(taunts[Math.min(attempts - 1, taunts.length - 1)]);
  face.textContent = faces[Math.min(attempts - 1, faces.length - 1)];

  if (attempts < winAfter) {
    randomPosition();
    note.textContent = attempts < 4 ? 'It runs away first. Keep tapping.' : 'Now it is losing confidence.';
    if (navigator.vibrate) navigator.vibrate(15);
  } else {
    runner.classList.add('ready');
    runnerText.textContent = 'Okay, click me';
    speak('I surrender. Click now 😭');
    note.textContent = 'Now the button is clickable. Finish it.';
    if (navigator.vibrate) navigator.vibrate([20, 40, 20]);
  }
}

function finish() {
  ended = true;
  clearInterval(timer);
  const seconds = start ? ((performance.now() - start) / 1000).toFixed(1) : '0.0';
  finalAttempts.textContent = attempts + 1;
  finalTime.textContent = `${seconds}s`;
  clockEl.textContent = `${seconds}s`;
  runner.style.opacity = '0';
  runner.style.pointerEvents = 'none';
  win.classList.add('show');
  speak('You got me 😭');
  if (navigator.vibrate) navigator.vibrate([30, 40, 70]);
  confetti();
}

function handlePress(e) {
  e.preventDefault();
  e.stopPropagation();
  const now = Date.now();
  if (now - lastTap < 180 || ended) return;
  lastTap = now;
  if (attempts >= winAfter) finish();
  else miss();
}

// This makes it work on desktop, Android, and iPhone.
runner.addEventListener('pointerdown', handlePress, { passive: false });
runner.addEventListener('touchstart', handlePress, { passive: false });
runner.addEventListener('click', handlePress, { passive: false });

arena.addEventListener('pointermove', (e) => {
  if (ended || attempts >= winAfter || window.matchMedia('(pointer: coarse)').matches) return;
  const r = runner.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  if (Math.hypot(e.clientX - cx, e.clientY - cy) < 95) miss();
});

function reset() {
  attempts = 0;
  start = 0;
  ended = false;
  lastTap = 0;
  clearInterval(timer);
  attemptsEl.textContent = '0';
  clockEl.textContent = '0.0s';
  note.textContent = 'Tap the orange button. It will run first, then surrender.';
  face.textContent = '😏';
  runnerText.textContent = 'Catch me';
  runner.classList.remove('ready');
  runner.style.left = '50%';
  runner.style.top = '60%';
  runner.style.opacity = '1';
  runner.style.pointerEvents = 'auto';
  runner.style.transform = 'translate(-50%, -50%)';
  win.classList.remove('show');
  speak('Catch me if you can 😏');
}
again.addEventListener('click', reset);

function confetti() {
  pieces = Array.from({ length: 120 }, () => ({
    x: Math.random() * innerWidth,
    y: -30 - Math.random() * 200,
    s: 5 + Math.random() * 8,
    vy: 2 + Math.random() * 4,
    vx: Math.random() * 2 - 1,
    rot: Math.random() * 6,
    spin: Math.random() * .18 - .09,
    life: 150
  }));
  draw();
}
function draw() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  pieces.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.rot += p.spin; p.life--;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillRect(-p.s/2, -p.s/2, p.s, p.s*.65); ctx.restore();
  });
  pieces = pieces.filter(p => p.life > 0 && p.y < innerHeight + 40);
  if (pieces.length) requestAnimationFrame(draw);
  else ctx.clearRect(0, 0, innerWidth, innerHeight);
}
