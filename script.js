const loader = document.getElementById("loaderScreen");
const barStage = document.getElementById("barStage");
const boat = document.getElementById("boatWrap");
const boatImage = document.querySelector(".shikara-img");
const reflection = document.querySelector(".shikara-reflection");
const waterFill = document.getElementById("waterFill");
const trackShine = document.getElementById("trackShine");
const wakeLayer = document.getElementById("wakeLayer");
const splash = document.getElementById("paddleSplash");
const ripple = document.getElementById("paddleRipple");

let wakeTicker;
let strokeTimer;

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

  const px = p * m.stageWidth - gsap.utils.random(24, 72);
  const py = gsap.utils.random(5, 20);

  gsap.set(dot, {
    x: px,
    y: py,
    scale: gsap.utils.random(.42, 1.05),
    opacity: .72
  });

  gsap.to(dot, {
    x: px - gsap.utils.random(12, 36),
    y: py + gsap.utils.random(-7, 8),
    scale: 0,
    opacity: 0,
    duration: gsap.utils.random(.75, 1.25),
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
    opacity: .7,
    scale: 1,
    duration: .16,
    ease: "power1.out"
  });
  gsap.to(ripple, {
    opacity: 0,
    scale: 2.15,
    duration: .82,
    delay: .08,
    ease: "power2.out"
  });

  gsap.to(splash, {
    opacity: .78,
    scale: 1.05,
    duration: .13,
    ease: "power1.out"
  });
  gsap.to(splash, {
    opacity: 0,
    scale: 1.5,
    duration: .62,
    delay: .08,
    ease: "power2.out"
  });

  // Tiny forward emphasis only, not a separate X movement.
  gsap.to(boatImage, {
    rotationZ: 0.22,
    duration: .22,
    ease: "sine.out",
    yoyo: true,
    repeat: 1
  });
}

function startStrokeLoop() {
  const stroke = () => {
    if (loader.classList.contains("hide")) return;
    animateStrokeReaction();
    strokeTimer = gsap.delayedCall(0.96, stroke);
  };
  strokeTimer = gsap.delayedCall(0.45, stroke);
}

function startLoader() {
  const m = getMetrics();

  gsap.set(boat, {
    x: m.startX,
    y: 0,
    rotationZ: -0.15,
    force3D: true
  });

  gsap.set(boatImage, {
    y: 0,
    rotationZ: -0.12,
    rotationX: 0,
    rotationY: 0,
    transformOrigin: "50% 78%",
    force3D: true
  });

  gsap.set(reflection, {
    y: 0,
    scaleY: 0.55,
    opacity: .42,
    force3D: true
  });

  updateProgress();

  /*
    Main forward movement:
    One continuous timeline. No stroke-by-stroke X movement.
    This removes the jerking while keeping a premium loading feel.
  */
  const travel = gsap.to(boat, {
    x: m.endX,
    duration: 7.2,
    ease: "sine.inOut",
    onUpdate: updateProgress,
    onComplete: finishLoader
  });

  /*
    Premium boat physics:
    Separate pitch, roll, and bob layers create floating motion without disturbing X travel.
  */
  gsap.to(boat, {
    y: -3.2,
    rotationZ: 0.22,
    duration: 2.15,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  gsap.to(boatImage, {
    rotationX: 2.2,
    rotationY: -1.1,
    duration: 2.8,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  gsap.to(boatImage, {
    y: -1.4,
    duration: 1.42,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  gsap.to(reflection, {
    y: 4,
    scaleY: 0.48,
    opacity: .28,
    duration: 2.15,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  startStrokeLoop();

  wakeTicker = gsap.ticker.add(() => {
    if (loader.classList.contains("hide")) return;
    if (Math.random() > 0.92) createWakeParticle();
  });
}

function finishLoader() {
  if (strokeTimer) strokeTimer.kill();

  gsap.to(boat, {
    y: 0,
    rotationZ: 0,
    duration: .75,
    ease: "sine.out"
  });

  gsap.to(boatImage, {
    y: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    duration: .75,
    ease: "sine.out"
  });

  gsap.to(reflection, {
    opacity: .18,
    y: 2,
    scaleY: .42,
    duration: .75,
    ease: "sine.out"
  });

  gsap.to(".wave", {
    y: 5,
    duration: .85,
    ease: "sine.out"
  });

  gsap.to(".water-fill", {
    filter: "saturate(.9)",
    duration: .65,
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
