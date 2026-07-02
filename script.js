const loader = document.getElementById("loader");
const scene = document.getElementById("scene");
const shikaraWrap = document.getElementById("shikaraWrap");
const oar = document.getElementById("oar");
const progressWindow = document.getElementById("progressWindow");
const reflection = document.getElementById("reflection");
const percent = document.getElementById("percent");
const wakeParticles = document.getElementById("wakeParticles");
const mainWaterPath = document.getElementById("mainWaterPath");

const loaderState = {
  progress: 0
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getMetrics() {
  const sceneRect = scene.getBoundingClientRect();
  const boatRect = shikaraWrap.getBoundingClientRect();

  return {
    sceneW: sceneRect.width,
    sceneH: sceneRect.height,
    boatW: boatRect.width,
    startX: -boatRect.width * 1.08,
    endX: sceneRect.width + boatRect.width * 0.16
  };
}

function createWakeParticle(x, y) {
  const dot = document.createElement("span");
  dot.className = "wake-dot";
  wakeParticles.appendChild(dot);

  const size = gsap.utils.random(2, 5);
  gsap.set(dot, {
    width: size,
    height: size,
    x,
    y,
    opacity: 0.72,
    scale: gsap.utils.random(0.6, 1.2)
  });

  gsap.to(dot, {
    x: x - gsap.utils.random(24, 76),
    y: y + gsap.utils.random(-16, 18),
    opacity: 0,
    scale: 0,
    duration: gsap.utils.random(0.8, 1.35),
    ease: "power2.out",
    onComplete: () => dot.remove()
  });
}

function updateProgress() {
  const metrics = getMetrics();
  const x = gsap.getProperty(shikaraWrap, "x");
  const boatNose = x + metrics.boatW * 0.78;
  const progress = clamp(boatNose / metrics.sceneW, 0, 1);

  loaderState.progress = progress;

  gsap.set(progressWindow, {
    width: `${progress * 100}%`
  });

  gsap.set(reflection, {
    x: x + metrics.boatW * 0.02
  });

  percent.textContent = `${Math.round(progress * 100)}%`;
}

function startLoader() {
  const metrics = getMetrics();

  gsap.set(shikaraWrap, {
    x: metrics.startX,
    y: 0,
    rotate: -0.25
  });

  gsap.set(progressWindow, {
    width: "0%"
  });

  gsap.set(reflection, {
    opacity: 0,
    x: metrics.startX,
    y: 0,
    scaleY: 0.82
  });

  const floatTween = gsap.to(shikaraWrap, {
    y: -8,
    rotate: 0.28,
    duration: 1.9,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut"
  });

  const reflectionTween = gsap.to(reflection, {
    y: 9,
    scaleY: 0.9,
    duration: 1.9,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut"
  });

  gsap.to(reflection, {
    opacity: 0.8,
    duration: 1.2,
    delay: 0.7,
    ease: "power2.out"
  });

  /*
    Smooth premium movement:
    One continuous X animation prevents the boat from feeling like it jumps in parts.
    The ease below gives a soft push at the start, long elegant glide, then polished arrival.
    Rower/oar uses a repeated nested movement to create the illusion of rowing without forcing the boat into choppy steps.
  */
  const tl = gsap.timeline({
    onUpdate: updateProgress,
    onComplete: () => {
      floatTween.kill();
      reflectionTween.kill();

      gsap.to(oar, {
        rotate: 0,
        duration: 0.55,
        ease: "power2.out"
      });

      gsap.to(shikaraWrap, {
        y: 0,
        rotate: 0,
        duration: 0.8,
        ease: "sine.out"
      });

      gsap.to(reflection, {
        opacity: 0.35,
        y: 4,
        scaleY: 0.74,
        duration: 0.8,
        ease: "sine.out"
      });

      gsap.to(mainWaterPath, {
        attr: {
          d: "M0 112 C140 112 260 112 400 112 C540 112 660 112 800 112 C940 112 1060 112 1200 112 C1340 112 1460 112 1600 112 L1600 220 L0 220 Z"
        },
        duration: 1.1,
        ease: "power3.inOut"
      });

      gsap.to(loader, {
        opacity: 0,
        duration: 1,
        delay: 0.55,
        ease: "power3.inOut",
        onComplete: () => {
          loader.classList.add("is-hidden");
          loader.style.display = "none";
          document.body.style.overflow = "auto";
        }
      });
    }
  });

  tl.to(shikaraWrap, {
    x: metrics.endX,
    duration: 7.2,
    ease: "expoScale(0.92, 1.08, none)"
  }, 0);

  // Add very subtle micro-surges without interrupting continuous forward glide.
  tl.to(shikaraWrap, {
    keyframes: [
      { scaleX: 1.008, duration: 0.22 },
      { scaleX: 1, duration: 0.42 },
      { scaleX: 1.006, duration: 0.2 },
      { scaleX: 1, duration: 0.48 }
    ],
    repeat: 5,
    ease: "sine.inOut"
  }, 0.2);

  gsap.to(oar, {
    keyframes: [
      { rotate: -26, duration: 0.34, ease: "power2.in" },
      { rotate: 13, duration: 0.58, ease: "power3.out" },
      { rotate: 4, duration: 0.28, ease: "sine.out" }
    ],
    repeat: 6,
    transformOrigin: "18% 60%",
    ease: "none"
  });

  gsap.ticker.add(() => {
    if (loader.classList.contains("is-hidden")) return;

    const metricsNow = getMetrics();
    const x = gsap.getProperty(shikaraWrap, "x");

    if (loaderState.progress > 0.06 && loaderState.progress < 0.96 && Math.random() > 0.88) {
      createWakeParticle(
        x + metricsNow.boatW * 0.22,
        metricsNow.sceneH * 0.68 + gsap.utils.random(-8, 12)
      );
    }
  });
}

window.addEventListener("load", startLoader);

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    window.location.reload();
  }, 250);
});
