const loader = document.getElementById("loaderScreen");
const barStage = document.getElementById("barStage");
const boat = document.getElementById("boatWrap");
const waterFill = document.getElementById("waterFill");
const trackShine = document.getElementById("trackShine");
const oar = document.getElementById("animatedOar");
const wakeLayer = document.getElementById("wakeLayer");
const splash = document.getElementById("paddleSplash");

function getMetrics() {
  const stage = barStage.getBoundingClientRect();
  const boatBox = boat.getBoundingClientRect();

  return {
    stageWidth: stage.width,
    boatWidth: boatBox.width,
    startX: -boatBox.width * 0.52,
    endX: stage.width - boatBox.width * 0.50
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateProgress() {
  const m = getMetrics();
  const x = gsap.getProperty(boat, "x");
  const progress = clamp((x - m.startX) / (m.endX - m.startX), 0, 1);

  gsap.set(waterFill, { width: `${progress * 100}%` });
  gsap.set(trackShine, { width: `${progress * 100}%` });
  gsap.set(wakeLayer, { width: `${progress * 100}%` });
}

function createWakeParticle() {
  const m = getMetrics();
  const x = gsap.getProperty(boat, "x");
  const progress = clamp((x - m.startX) / (m.endX - m.startX), 0, 1);

  if (progress < 0.06 || progress > 0.96) return;

  const dot = document.createElement("span");
  dot.className = "wake-dot";
  wakeLayer.appendChild(dot);

  const px = progress * m.stageWidth - gsap.utils.random(34, 88);
  const py = gsap.utils.random(-8, 14);

  gsap.set(dot, {
    x: px,
    y: py,
    scale: gsap.utils.random(.55, 1.35),
    opacity: .82
  });

  gsap.to(dot, {
    x: px - gsap.utils.random(14, 42),
    y: py + gsap.utils.random(-12, 12),
    scale: 0,
    opacity: 0,
    duration: gsap.utils.random(.65, 1.2),
    ease: "power2.out",
    onComplete: () => dot.remove()
  });
}

function startLoader() {
  const m = getMetrics();

  gsap.set(boat, { x: m.startX });
  gsap.set(oar, { rotation: -10, transformOrigin: "19% 14%" });

  /*
    Boat movement:
    smooth left-to-right motion over the loading bar.
    The movement is continuous, while the oar gives the rowing rhythm.
  */
  const tl = gsap.timeline({
    onUpdate: updateProgress,
    onComplete: finishLoader
  });

  tl.to(boat, {
    x: m.endX,
    duration: 6.6,
    ease: "sine.inOut"
  });

  /*
    Oar animation:
    oar dips into water, pulls back, exits and returns.
    The splash appears exactly when the paddle enters the water.
  */
  gsap.to(oar, {
    keyframes: [
      { rotation: 28, duration: .28, ease: "power2.in" },
      { rotation: 48, duration: .20, ease: "power1.inOut" },
      { rotation: -12, duration: .70, ease: "power3.out" }
    ],
    repeat: 5,
    transformOrigin: "19% 14%"
  });

  gsap.to(splash, {
    keyframes: [
      { opacity: .95, scale: 1.05, duration: .12 },
      { opacity: 0, scale: 1.65, duration: .55 }
    ],
    repeat: 5,
    repeatDelay: .5,
    ease: "power2.out"
  });

  gsap.ticker.add(() => {
    if (loader.classList.contains("hide")) return;
    if (Math.random() > 0.88) createWakeParticle();
  });
}

function finishLoader() {
  gsap.to(oar, {
    rotation: -4,
    duration: .55,
    ease: "power2.out"
  });

  gsap.to(".wave", {
    y: 4,
    duration: .75,
    ease: "sine.out"
  });

  gsap.to(loader, {
    opacity: 0,
    duration: 1,
    delay: .55,
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
