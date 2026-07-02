const statusText = document.getElementById("statusText");
const loaderScreen = document.getElementById("loaderScreen");

const messages = [
  "Selecting destinations with care",
  "Packing the essentials",
  "Adding the final details",
  "Your escape is ready"
];

messages.forEach((message, index) => {
  setTimeout(() => {
    statusText.style.opacity = "0";
    statusText.style.transform = "translateY(5px)";

    setTimeout(() => {
      statusText.textContent = message;
      statusText.style.opacity = "1";
      statusText.style.transform = "translateY(0)";
    }, 220);
  }, index * 1150);
});

statusText.style.transition = "opacity 220ms ease, transform 220ms ease";

setTimeout(() => {
  loaderScreen.classList.add("hide");
  document.body.style.overflow = "auto";
}, 5400);
