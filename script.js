const loader = document.getElementById("loaderScreen");
const barStage = document.getElementById("barStage");
const boat = document.getElementById("boatWrap");
const waterFill = document.getElementById("waterFill");
const trackShine = document.getElementById("trackShine");
const wakeLayer = document.getElementById("wakeLayer");
const splash = document.getElementById("paddleSplash");
const ripple = document.getElementById("paddleRipple");

function getMetrics() {
  const stage = barStage.getBoundingClientRect();
  const boatBox = boat.getBoundingClientRect();

  return {
    stageWidth: stage.width,
    boatWidth: boatBox.width,
    startX: 0,
    endX: stage.width - boatBox.width
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function progressValue() {
  const m = getMetrics();
  const x = gsap.getProperty(boat, "x");
  return clamp((x - m.startX) / (m.endX - m.startX), 0, 1);
}

function updateProgress() {
  const p = progressValue();
  const fill = p * 100;

  gsap.set(waterFill, { width: `${fill}%` });
  gsap.set(trackShine, { width: `${fill}%` });
  gsap.set(wakeLayer, { width: `${fill}%` });
}

function createWakeParticle() {
  const m = getMetrics();
  const p = progressValue();

  if (p < 0.04 || p > 0.96) return;

  const dot = document.createElement("span");
  dot.className = "wake-dot";
  wakeLayer.appendChild(dot);

  const px = p * m.stageWidth - gsap.utils.random(22, 68);
  const py = gsap.utils.random(3, 20);

  gsap.set(dot, {
    x: px,
    y: py,
    scale: gsap.utils.random(.45, 1.15),
    opacity: .78
  });

  gsap.to(dot, {
    x: px - gsap.utils.random(10, 34),
    y: py + gsap.utils.random(-8, 8),
    scale: 0,
    opacity: 0,
    duration: gsap.utils.random(.65, 1.05),
    ease: "power2.out",
    onComplete: () => dot.remove()
  });
}

function animateStrokeReaction() {
  const m = getMetrics();
  const p = progressValue();
  const x = p * m.stageWidth - 48;

  gsap.set(ripple, { x, opacity: 0, scale: .55 });
  gsap.to(ripple, {
    opacity: .75,
    scale: 1,
    duration: .12,
    ease: "power1.out"
  });
  gsap.to(ripple, {
    opacity: 0,
    scale: 2.2,
    duration: .7,
    delay: .08,
    ease: "power2.out"
  });

  gsap.to(splash, {
    opacity: .88,
    scale: 1.08,
    duration: .12,
    ease: "power1.out"
  });
  gsap.to(splash, {
    opacity: 0,
    scale: 1.55,
    duration: .5,
    delay: .08,
    ease: "power2.out"
  });
}

function startLoader() {
  const m = getMetrics();

  gsap.set(boat, { x: m.startX });
  updateProgress();

  /*
    Premium rowing motion:
    Each rowing cycle has a subtle acceleration and glide.
    Movement remains smooth, not jumpy.
  */
  const tl = gsap.timeline({
    onUpdate: updateProgress,
    onComplete: finishLoader
  });

  const strokes = 6;
  const distance = m.endX - m.startX;
  const perStroke = distance / strokes;
  let x = m.startX;

  for (let i = 0; i < strokes; i++) {
    x += perStroke * 0.56;
    tl.to(boat, {
      x,
      duration: .46,
      ease: "power2.out",
      onStart: animateStrokeReaction
    });

    x += perStroke * 0.44;
    tl.to(boat, {
      x,
      duration: .58,
      ease: "sine.out"
    });
  }

  gsap.ticker.add(() => {
    if (loader.classList.contains("hide")) return;
    if (Math.random() > 0.9) createWakeParticle();
  });
}

function finishLoader() {
  gsap.to(".wave", {
    y: 4,
    duration: .75,
    ease: "sine.out"
  });

  gsap.to(".water-fill", {
    filter: "saturate(.9)",
    duration: .6,
    ease: "sine.out"
  });

  gsap.to(loader, {
    opacity: 0,
    duration: 1,
    delay: .65,
    ease: "power2.inOut",
    onComplete: () => {
      loader.classList.add("hide");
      document.body.style.overflow = "auto";
    }
  });
}

window.addEventListener("load", startLoader);

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => window.location.reload(), 250);
});
