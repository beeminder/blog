const shows = Array.from(document.querySelectorAll(".slideshow"));

function loop(els: Element[], i = 0) {
  els.forEach((e) => e.classList.remove("active"));
  els[i]?.classList.add("active");
  const j = i < els.length - 1 ? i + 1 : 0;
  setTimeout(loop, 4000, els, j);
}

shows.forEach((s) => loop(Array.from(s.children)));
