const loader = document.getElementById("loaderScreen");
const barWrap = document.getElementById("barWrap");
const boat = document.getElementById("boatHolder");
const waterFill = document.getElementById("waterFill");
const barGloss = document.getElementById("barGloss");
const oar = document.getElementById("animatedOar");
const wake = document.getElementById("wake");

function getMetrics() {
  const bar = barWrap.getBoundingClientRect();
  const boatBox = boat.getBoundingClientRect();

  return {
    barWidth: bar.width,
    boatWidth: boatBox.width,
    startX: -boatBox.width * 0.48,
    endX: bar.width - boatBox.width * 0.52
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateWater() {
  const m = getMetrics();
  const x = gsap.getProperty(boat, "x");
  const progress = clamp((x - m.startX) / (m.endX - m.startX), 0, 1);

  gsap.set(waterFill, { width: `${progress * 100}%` });
  gsap.set(barGloss, { width: `${progress * 100}%` });
  gsap.set(wake, { width: `${progress * 100}%` });
}

function createWakeParticle() {
  const m = getMetrics();
  const x = gsap.getProperty(boat, "x");
  const p = clamp((x - m.startX) / (m.endX - m.startX), 0, 1);

  if (p < 0.08 || p > 0.96) return;

  const dot = document.createElement("span");
  dot.className = "wake-dot";
  wake.appendChild(dot);

  const localX = p * m.barWidth - gsap.utils.random(30, 76);
  const localY = gsap.utils.random(-6, 10);

  gsap.set(dot, {
    x: localX,
    y: localY,
    scale: gsap.utils.random(0.5, 1.3),
    opacity: 0.85
  });

  gsap.to(dot, {
    x: localX - gsap.utils.random(16, 38),
    y: localY + gsap.utils.random(-10, 10),
    scale: 0,
    opacity: 0,
    duration: gsap.utils.random(0.7, 1.2),
    ease: "power2.out",
    onComplete: () => dot.remove()
  });
}

function startLoader() {
  const m = getMetrics();

  gsap.set(boat, { x: m.startX });
  gsap.set(oar, { rotation: 18, transformOrigin: "16% 56%" });

  /*
    Smooth movement:
    The boat travels continuously from left to right.
    Minor acceleration/deceleration is added through the ease,
    while the rower/oar cycles create the rowing feeling.
  */
  const timeline = gsap.timeline({
    onUpdate: updateWater,
    onComplete: finishLoader
  });

  timeline.to(boat, {
    x: m.endX,
    duration: 6.4,
    ease: "sine.inOut"
  }, 0);

  gsap.to(oar, {
    keyframes: [
      { rotation: -34, duration: 0.42, ease: "power2.in" },
      { rotation: 17, duration: 0.68, ease: "power3.out" }
    ],
    repeat: 5,
    transformOrigin: "16% 56%"
  });

  gsap.ticker.add(() => {
    if (loader.classList.contains("hide")) return;
    if (Math.random() > 0.88) createWakeParticle();
  });
}

function finishLoader() {
  gsap.to(oar, {
    rotation: 8,
    duration: 0.55,
    ease: "power2.out"
  });

  gsap.to(".wave", {
    y: 4,
    duration: 0.8,
    ease: "sine.out"
  });

  gsap.to(loader, {
    opacity: 0,
    duration: 1,
    delay: 0.55,
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
