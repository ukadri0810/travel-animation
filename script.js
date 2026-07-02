const copy = document.getElementById("copy");
const loader = document.getElementById("loader");

const messages = [
  "Arranging every detail with care",
  "Packing your travel essentials",
  "Finalising a seamless experience",
  "Your journey is ready"
];

messages.forEach((message, index) => {
  setTimeout(() => {
    copy.style.opacity = "0";
    copy.style.transform = "translateY(6px)";
    setTimeout(() => {
      copy.textContent = message;
      copy.style.opacity = "1";
      copy.style.transform = "translateY(0)";
    }, 220);
  }, index * 1250);
});

setTimeout(() => {
  loader.classList.add("hide");
  document.body.style.overflow = "auto";
}, 5900);
