const loader = document.getElementById("loaderScreen");
const barStage = document.getElementById("barStage");
const boat = document.getElementById("boatWrap");
const waterFill = document.getElementById("waterFill");
const trackShine = document.getElementById("trackShine");
const wakeLayer = document.getElementById("wakeLayer");
const splash = document.getElementById("paddleSplash");

function getMetrics() {
  const stage = barStage.getBoundingClientRect();
  const boatBox = boat.getBoundingClientRect();

  /*
    The boat now stays fully inside the loading bar width.
    It starts aligned inside the left edge and ends inside the right edge.
  */
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

function updateProgress() {
  const m = getMetrics();
  const x = gsap.getProperty(boat, "x");
  const progress = clamp((x - m.startX) / (m.endX - m.startX), 0, 1);

  const fill = progress * 100;
  gsap.set(waterFill, { width: `${fill}%` });
  gsap.set(trackShine, { width: `${fill}%` });
  gsap.set(wakeLayer, { width: `${fill}%` });
}

function createWakeParticle() {
  const m = getMetrics();
  const x = gsap.getProperty(boat, "x");
  const progress = clamp((x - m.startX) / (m.endX - m.startX), 0, 1);

  if (progress < 0.04 || progress > 0.96) return;

  const dot = document.createElement("span");
  dot.className = "wake-dot";
  wakeLayer.appendChild(dot);

  const px = progress * m.stageWidth - gsap.utils.random(22, 64);
  const py = gsap.utils.random(4, 20);

  gsap.set(dot, {
    x: px,
    y: py,
    scale: gsap.utils.random(.55, 1.25),
    opacity: .8
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

function startLoader() {
  const m = getMetrics();

  gsap.set(boat, { x: m.startX });
  updateProgress();

  const tl = gsap.timeline({
    onUpdate: updateProgress,
    onComplete: finishLoader
  });

  tl.to(boat, {
    x: m.endX,
    duration: 6.2,
    ease: "sine.inOut"
  });

  /*
    Since the image already has a paddle, we do not add another one.
    Instead, the splash pulses near the existing paddle to imply rowing.
  */
  gsap.to(splash, {
    keyframes: [
      { opacity: .88, scale: 1.05, duration: .14 },
      { opacity: 0, scale: 1.55, duration: .52 }
    ],
    repeat: 6,
    repeatDelay: .38,
    ease: "power2.out"
  });

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

  gsap.to(loader, {
    opacity: 0,
    duration: 1,
    delay: .5,
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
