// Purpose: Improve reliability of puppeteer diffing

const urlParams = new URLSearchParams(window.location.search);

if (urlParams.has("snap")) {
  const body = document.querySelector("body");
  body?.classList.add("snap");
}
