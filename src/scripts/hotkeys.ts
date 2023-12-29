document.addEventListener("keydown", function (event) {
  if (event.shiftKey && event.key === "U") {
    const prevPageElement = document.querySelector(
      ".previous",
    ) as HTMLAnchorElement;
    if (prevPageElement) {
      const prevPageUrl = prevPageElement.href;
      if (prevPageUrl) {
        window.location.href = prevPageUrl;
      }
    }
  } else if (event.shiftKey && event.key === "I") {
    const nextPageElement = document.querySelector(
      ".next",
    ) as HTMLAnchorElement;
    if (nextPageElement) {
      const nextPageUrl = nextPageElement.href;
      if (nextPageUrl) {
        window.location.href = nextPageUrl;
      }
    }
  }
});
