(function () {
  const s = document.createElement("link").relList;
  if (s && s.supports && s.supports("modulepreload")) return;
  for (const t of document.querySelectorAll('link[rel="modulepreload"]')) n(t);
  new MutationObserver((t) => {
    for (const r of t)
      if (r.type === "childList")
        for (const f of r.addedNodes)
          f.tagName === "LINK" && f.rel === "modulepreload" && n(f);
  }).observe(document, { childList: !0, subtree: !0 });
  function c(t) {
    const r = {};
    return (
      t.integrity && (r.integrity = t.integrity),
      t.referrerPolicy && (r.referrerPolicy = t.referrerPolicy),
      t.crossOrigin === "use-credentials"
        ? (r.credentials = "include")
        : t.crossOrigin === "anonymous"
          ? (r.credentials = "omit")
          : (r.credentials = "same-origin"),
      r
    );
  }
  function n(t) {
    if (t.ep) return;
    t.ep = !0;
    const r = c(t);
    fetch(t.href, r);
  }
})();
const E = "https://6kt29kkeub.execute-api.eu-central-1.amazonaws.com",
  _ = `${E}/products/favorites`,
  N = document.querySelector(".header__burger-button"),
  a = document.querySelector(".line"),
  d = document.querySelector(".header__menu"),
  u = document.querySelector(".wrapper"),
  p = document.getElementsByClassName("header__menu-item"),
  i = document.querySelector(".slides-container"),
  M = document.querySelector(".btn.prev"),
  q = document.querySelector(".btn.next"),
  g = document.querySelector(".slider-dots"),
  L = document.querySelector(".scrollbar-thumb"),
  P = document.querySelector(".slider-scrollbar"),
  v = [
    "./images/coffee-slider-1.png",
    "./images/coffee-slider-2.png",
    "./images/coffee-slider-3.png",
  ];
let m = null,
  o = 1;
N.addEventListener("click", function () {
  (a.classList.contains("active-menu")
    ? a.classList.remove("active-menu")
    : a.classList.add("active-menu"),
    d.classList.contains("showMenu")
      ? d.classList.remove("showMenu")
      : d.classList.add("showMenu"),
    u.classList.contains("no-scroll")
      ? u.classList.remove("no-scroll")
      : u.classList.add("no-scroll"));
});
for (let e = 0; e < p.length; e++)
  p[e].addEventListener("click", function () {
    (a.classList.remove("active-menu"),
      d.classList.remove("showMenu"),
      u.classList.remove("no-scroll"));
  });
const O = i.scrollWidth - i.clientWidth,
  T = window.innerWidth;
T > 768 &&
  (l(o),
  (m = setInterval(function () {
    (o++, l(o));
  }, 6e3)));
const x = () => {
  const s = (i.scrollLeft / O) * (P.clientWidth - L.offsetWidth);
  L.style.left = `${s}px`;
};
i.addEventListener("scroll", () => {
  x();
});
const B = () => {
    i && (i.innerHTML = '<div class="loader">Loading...</div>');
  },
  h = () => {
    i &&
      (i.innerHTML =
        '<p class="error">Something went wrong. Please, refresh the page</p>');
  };
async function C() {
  try {
    B();
    const e = await fetch(_);
    return (
      e.ok || h(),
      (await e.json()).data.map((n, t) => ({ ...n, imageUrl: v[t % v.length] }))
    );
  } catch {
    h();
  }
}
function $(e) {
  (console.log(e, "coffees"),
    (i.innerHTML = ""),
    (g.innerHTML = ""),
    e.forEach((s, c) => {
      const n = document.createElement("div");
      ((n.className = "fade"),
        (n.innerHTML = `
         <div class='fade__image'>
         <img src="${s.imageUrl}" alt="${s.name}" />
         </div>
        <h3 class="fade__title">${s.name}</h3>
        <p class="fade__desc">${s.description}</p>
        <span class="fade__price">$${s.price}</span>
    `),
        i.appendChild(n));
      const t = document.createElement("span");
      ((t.className = "dot"),
        t.addEventListener("click", () => I(c + 1)),
        g.appendChild(t));
    }),
    l(o),
    y());
}
function l(e) {
  const s = document.getElementsByClassName("fade"),
    c = document.getElementsByClassName("dot");
  if (s.length !== 0) {
    (e > s.length && (o = 1), e < 1 && (o = s.length));
    for (let n = 0; n < s.length; n++) s[n].style.display = "none";
    for (let n = 0; n < c.length; n++)
      c[n].className = c[n].className.replace(" active", "");
    ((s[o - 1].style.display = "flex"),
      c.length > 0 && (c[o - 1].className += " active"));
  }
}
function y() {
  (w(),
    (m = window.setInterval(() => {
      (o++, l(o));
    }, 6e3)));
}
function S(e) {
  (l((o += e)), b());
}
function I(e) {
  (l((o = e)), b());
}
function w() {
  m && clearInterval(m);
}
function b() {
  (w(), y());
}
M?.addEventListener("click", () => S(-1));
q?.addEventListener("click", () => S(1));
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const e = await C();
    $(e);
  } catch {
    h();
  }
});
