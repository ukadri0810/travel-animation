const device = document.getElementById('device');
const form = document.getElementById('loginForm');
const passwordInput = document.getElementById('passwordInput');
const fakeDots = document.getElementById('fakeDots');
const escapeWorld = document.getElementById('escapeWorld');
const passwordShell = document.getElementById('passwordShell');
const messageStrip = document.getElementById('messageStrip');
const btnLabel = document.getElementById('btnLabel');
const liveBadge = document.getElementById('liveBadge');
const lead = document.getElementById('lead');
const reactionCard = document.getElementById('reactionCard');
const reactionText = document.getElementById('reactionText');
const finish = document.getElementById('finish');
const restartBtn = document.getElementById('restartBtn');

let dotCount = 0;
let escaped = false;
let returning = false;
let typingTimer;

const reactions = [
  'Password left the chat.',
  'Bro said: I need space.',
  'Security level: emotional damage.',
  'Login is chasing the password now.',
  'Your password saw Monday and ran.'
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function renderDots(count) {
  fakeDots.innerHTML = '';
  const limit = Math.min(count, 11);
  for (let i = 0; i < limit; i += 1) {
    const dot = document.createElement('span');
    dot.className = 'dot';
    dot.style.animationDelay = `${i * 24}ms`;
    fakeDots.appendChild(dot);
  }
}

function showReaction(text) {
  reactionText.textContent = text;
  reactionCard.classList.remove('show');
  void reactionCard.offsetWidth;
  reactionCard.classList.add('show');
}

function setPanicMessage(text) {
  messageStrip.textContent = text;
  messageStrip.classList.add('hot');
}

function getLocalPointFromElement(element, offsetX = 0, offsetY = 0) {
  const elementRect = element.getBoundingClientRect();
  const deviceRect = device.getBoundingClientRect();
  return {
    x: elementRect.left - deviceRect.left + offsetX,
    y: elementRect.top - deviceRect.top + offsetY
  };
}

function escapePassword() {
  if (escaped || returning || dotCount < 3) return;

  escaped = true;
  liveBadge.textContent = 'Password escaped';
  lead.textContent = 'The interface is no longer a login screen. It is a tiny comedy show.';
  setPanicMessage('Password dots have entered survival mode.');
  btnLabel.textContent = 'Catch them first';
  form.classList.add('panic');
  setTimeout(() => form.classList.remove('panic'), 460);
  showReaction(reactions[Math.floor(Math.random() * reactions.length)]);

  const shellRect = passwordShell.getBoundingClientRect();
  const deviceRect = device.getBoundingClientRect();
  const dots = [...fakeDots.children];
  fakeDots.innerHTML = '';

  dots.forEach((_, index) => {
    const runner = document.createElement('span');
    runner.className = 'runner';
    const startX = shellRect.left - deviceRect.left + 18 + index * 18;
    const startY = shellRect.top - deviceRect.top + shellRect.height / 2 - 5;
    const safePad = 28;
    const endX = random(safePad, deviceRect.width - safePad - 14);
    const endY = random(90, deviceRect.height - 185);
    const midX = random(40, deviceRect.width - 54);
    const midY = random(155, deviceRect.height - 240);

    runner.dataset.finalX = String(endX);
    runner.dataset.finalY = String(endY);
    runner.style.transform = `translate3d(${startX}px, ${startY}px, 0)`;
    escapeWorld.appendChild(runner);

    const animation = runner.animate([
      { transform: `translate3d(${startX}px, ${startY}px, 0) scale(1) rotate(0deg)` },
      { transform: `translate3d(${midX}px, ${midY}px, 0) scale(1.22) rotate(${random(-28, 28)}deg)` },
      { transform: `translate3d(${endX}px, ${endY}px, 0) scale(.98) rotate(${random(-16, 16)}deg)` }
    ], {
      duration: 850 + index * 62,
      delay: index * 28,
      easing: 'cubic-bezier(.16,.95,.22,1)',
      fill: 'forwards'
    });

    animation.onfinish = () => {
      runner.style.transform = `translate3d(${endX}px, ${endY}px, 0)`;
      runner.classList.add('tired');
    };
  });
}

function returnPassword() {
  if (!escaped || returning) return;

  returning = true;
  btnLabel.textContent = 'Bringing them back...';
  liveBadge.textContent = 'Recovery mode';
  setPanicMessage('Okay fine, the password is coming back.');
  form.classList.add('panic');
  if (navigator.vibrate) navigator.vibrate([24, 36, 52]);

  const shellRect = passwordShell.getBoundingClientRect();
  const deviceRect = device.getBoundingClientRect();
  const targetY = shellRect.top - deviceRect.top + shellRect.height / 2 - 5;
  const runners = [...escapeWorld.querySelectorAll('.runner')];

  runners.forEach((runner, index) => {
    runner.classList.remove('tired');
    const current = getComputedStyle(runner).transform === 'none' ? runner.style.transform : getComputedStyle(runner).transform;
    const targetX = shellRect.left - deviceRect.left + 18 + index * 18;
    runner.animate([
      { transform: current },
      { transform: `translate3d(${random(30, deviceRect.width - 50)}px, ${random(105, deviceRect.height - 220)}px, 0) scale(1.15)` },
      { transform: `translate3d(${targetX}px, ${targetY}px, 0) scale(1)` }
    ], {
      duration: 720,
      delay: index * 34,
      easing: 'cubic-bezier(.2,.85,.2,1)',
      fill: 'forwards'
    });
  });

  setTimeout(() => {
    escapeWorld.innerHTML = '';
    renderDots(dotCount);
    form.classList.remove('panic');
    messageStrip.classList.remove('hot');
    messageStrip.textContent = 'Login finally agreed to behave.';
    liveBadge.textContent = 'Unlocked';
    btnLabel.textContent = 'Portal unlocked';
    createConfetti();
    finish.classList.add('show');
    if (navigator.vibrate) navigator.vibrate([40, 35, 80]);
  }, 1180);
}

function createConfetti() {
  for (let i = 0; i < 42; i += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti';
    piece.style.background = i % 4 === 0 ? '#fff7df' : i % 4 === 1 ? '#e6c36a' : i % 4 === 2 ? '#d7ff55' : '#72ffd3';
    piece.style.setProperty('--x', `${random(-185, 185)}px`);
    piece.style.setProperty('--y', `${random(-285, 105)}px`);
    piece.style.setProperty('--r', `${random(-280, 280)}deg`);
    piece.style.animationDelay = `${random(0, 110)}ms`;
    device.appendChild(piece);
    setTimeout(() => piece.remove(), 1200);
  }
}

passwordInput.addEventListener('input', () => {
  if (escaped || returning) return;
  dotCount = passwordInput.value.length;
  renderDots(dotCount);
  clearTimeout(typingTimer);
  if (dotCount === 1) {
    messageStrip.textContent = 'First dot arrived. It looks nervous.';
  } else if (dotCount === 2) {
    messageStrip.textContent = 'Second dot is already checking exits.';
  } else if (dotCount >= 3) {
    messageStrip.textContent = 'Something is about to go wrong...';
    typingTimer = setTimeout(escapePassword, 420);
  }
});

passwordInput.addEventListener('focus', () => {
  if (!escaped && dotCount === 0) {
    messageStrip.textContent = 'Type at least 3 characters.';
  }
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (returning || finish.classList.contains('show')) return;

  if (dotCount < 3) {
    form.classList.add('panic');
    setPanicMessage('The password is too short to run away.');
    setTimeout(() => form.classList.remove('panic'), 460);
    passwordInput.focus();
    return;
  }

  if (!escaped) {
    escapePassword();
    setTimeout(returnPassword, 760);
  } else {
    returnPassword();
  }
});

restartBtn.addEventListener('click', () => {
  escaped = false;
  returning = false;
  dotCount = 0;
  passwordInput.value = '';
  fakeDots.innerHTML = '';
  escapeWorld.innerHTML = '';
  finish.classList.remove('show');
  liveBadge.textContent = 'Live demo';
  lead.textContent = 'Type a password and watch the dots escape like they saw your old website.';
  messageStrip.textContent = 'Waiting for password drama...';
  messageStrip.classList.remove('hot');
  btnLabel.textContent = 'Enter the portal';
  passwordInput.focus();
});

// Subtle premium tilt on desktop only.
window.addEventListener('pointermove', (event) => {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const rect = device.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  const ry = clamp((x - .5) * 5, -4, 4);
  const rx = clamp((.5 - y) * 5, -4, 4);
  device.style.setProperty('--rx', `${rx}deg`);
  device.style.setProperty('--ry', `${ry}deg`);
});

window.addEventListener('pointerleave', () => {
  device.style.setProperty('--rx', '0deg');
  device.style.setProperty('--ry', '0deg');
});

// Make mobile demo easy: tapping empty screen focuses password field.
device.addEventListener('click', (event) => {
  if (event.target.closest('input, button')) return;
  if (!finish.classList.contains('show')) passwordInput.focus();
});
