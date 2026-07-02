const loader = document.getElementById("pageLoader");
const track = document.getElementById("track");
const boat = document.getElementById("boatWrap");
const oar = document.getElementById("oar");
const rower = document.getElementById("rower");
const waterFill = document.getElementById("waterFill");
const waterShine = document.getElementById("waterShine");

function metrics() {
  const trackRect = track.getBoundingClientRect();
  const boatRect = boat.getBoundingClientRect();

  return {
    trackWidth: trackRect.width,
    boatWidth: boatRect.width,
    startX: -boatRect.width * 0.46,
    endX: trackRect.width - boatRect.width * 0.54
  };
}

function setProgressByBoat() {
  const m = metrics();
  const x = gsap.getProperty(boat, "x");
  const p = Math.min(Math.max((x - m.startX) / (m.endX - m.startX), 0), 1);

  gsap.set(waterFill, { width: `${p * 100}%` });
  gsap.set(waterShine, { width: `${p * 100}%` });
}

function startLoader() {
  const m = metrics();

  gsap.set(boat, {
    x: m.startX
  });

  gsap.set(oar, {
    rotation: 18
  });

  /*
    Main concept:
    Boat movement is one smooth left-to-right journey.
    The custom ease creates natural rowing physics:
    tiny acceleration, slight glide, then acceleration again —
    without the boat jumping in visible parts.
  */
  const boatTimeline = gsap.timeline({
    onUpdate: setProgressByBoat,
    onComplete: finishLoader
  });

  boatTimeline.to(boat, {
    x: m.endX,
    duration: 5.8,
    ease: "power1.inOut"
  });

  /*
    Rower sync:
    The oar keeps pulling backward and returning forward.
    Movement is smooth and looped, so the person feels like they are rowing.
  */
  gsap.to(oar, {
    keyframes: [
      { rotation: -34, duration: 0.38, ease: "power2.in" },
      { rotation: 18, duration: 0.62, ease: "power3.out" }
    ],
    repeat: 5,
    transformOrigin: "12% 62%"
  });

  gsap.to(rower, {
    keyframes: [
      { x: -2, y: 1, rotate: -2, duration: 0.38, ease: "power2.in" },
      { x: 1, y: 0, rotate: 1, duration: 0.62, ease: "power3.out" }
    ],
    repeat: 5,
    transformOrigin: "210px 80px"
  });
}

function finishLoader() {
  gsap.to(oar, {
    rotation: 8,
    duration: 0.5,
    ease: "power2.out"
  });

  gsap.to(".wave-front, .wave-back", {
    y: 5,
    duration: 0.7,
    ease: "sine.out"
  });

  gsap.to(loader, {
    opacity: 0,
    duration: 1,
    delay: 0.45,
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
