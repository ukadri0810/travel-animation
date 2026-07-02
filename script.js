const loader = document.getElementById("loaderScreen");
const barStage = document.getElementById("barStage");
const boat = document.getElementById("boatWrap");
const boatPhysics = document.getElementById("boatPhysics");
const oar = document.getElementById("oar");
const frontArm = document.getElementById("frontArm");
const waterFill = document.getElementById("waterFill");
const trackGloss = document.getElementById("trackGloss");
const ripple = document.getElementById("paddleRipple");

let strokeLoop;

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
  gsap.set(waterFill, { width: `${p * 100}%` });
  gsap.set(trackGloss, { width: `${p * 100}%` });
}

function paddleRipple() {
  const m = getMetrics();
  const p = progressValue();

  if (p < .04 || p > .97) return;

  gsap.set(ripple, {
    x: p * m.stageWidth - 22,
    opacity: 0,
    scale: .55
  });

  gsap.to(ripple, {
    opacity: .72,
    scale: 1,
    duration: .14,
    ease: "power1.out"
  });

  gsap.to(ripple, {
    opacity: 0,
    scale: 2.1,
    duration: .74,
    delay: .06,
    ease: "power2.out"
  });
}

function rowingCycle() {
  const tl = gsap.timeline({ onStart: paddleRipple });

  tl.to(oar, {
    rotation: -24,
    duration: .34,
    ease: "power2.in"
  }, 0);

  tl.to(frontArm, {
    rotation: -18,
    duration: .34,
    ease: "power2.in"
  }, 0);

  tl.to(oar, {
    rotation: 14,
    duration: .62,
    ease: "power3.out"
  }, .34);

  tl.to(frontArm, {
    rotation: 10,
    duration: .62,
    ease: "power3.out"
  }, .34);

  return tl;
}

function startRowingLoop() {
  const run = () => {
    if (loader.classList.contains("hide")) return;
    rowingCycle();
    strokeLoop = gsap.delayedCall(1.05, run);
  };
  strokeLoop = gsap.delayedCall(.38, run);
}

function startLoader() {
  const m = getMetrics();

  gsap.set(boat, {
    x: m.startX,
    y: 0,
    rotationZ: -0.12,
    force3D: true
  });

  gsap.set(boatPhysics, {
    y: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: -0.1,
    transformOrigin: "50% 78%",
    force3D: true
  });

  gsap.set(oar, {
    rotation: 12,
    transformOrigin: "8% 24%"
  });

  gsap.set(frontArm, {
    rotation: 6,
    transformOrigin: "8% 24%"
  });

  updateProgress();

  // One continuous travel motion — no jerky stepping.
  gsap.to(boat, {
    x: m.endX,
    duration: 7,
    ease: "sine.inOut",
    onUpdate: updateProgress,
    onComplete: finishLoader
  });

  // Smooth 3D boat pitch/roll/bob.
  gsap.to(boat, {
    y: -2.6,
    rotationZ: 0.22,
    duration: 2.1,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  gsap.to(boatPhysics, {
    rotationX: 2.2,
    rotationY: -1.2,
    y: -1.2,
    duration: 2.65,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });

  startRowingLoop();
}

function finishLoader() {
  if (strokeLoop) strokeLoop.kill();

  gsap.to([oar, frontArm], {
    rotation: 0,
    duration: .55,
    ease: "power2.out"
  });

  gsap.to(boatPhysics, {
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    y: 0,
    duration: .75,
    ease: "sine.out"
  });

  gsap.to(".water-wave", {
    y: 4,
    duration: .8,
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
