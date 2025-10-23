import { ICoffee } from "./types/coffee.interface";
import "./styles/style.scss";

const BASE_URL = "https://6kt29kkeub.execute-api.eu-central-1.amazonaws.com";
const FAVORITES_ENDPOINT = `${BASE_URL}/products/favorites`;

const burgerButton = document.querySelector(
  ".header__burger-button",
) as HTMLElement;
const lineButton = document.querySelector(".line") as HTMLElement;
const burgerMenu = document.querySelector(".header__menu") as HTMLElement;
const body = document.querySelector(".wrapper") as HTMLElement;
const links = document.getElementsByClassName("header__menu-item");

const imageList = document.querySelector(".slides-container") as HTMLElement;
const prevBtn = document.querySelector(".btn.prev") as HTMLElement;
const nextBtn = document.querySelector(".btn.next") as HTMLElement;
const dotsContainer = document.querySelector(".slider-dots") as HTMLElement;
const scrollbarThumb = document.querySelector(
  ".scrollbar-thumb",
) as HTMLElement;
const sliderScrollbar = document.querySelector(
  ".slider-scrollbar",
) as HTMLElement;

const placeholders = [
  "./images/coffee-slider-1.png",
  "./images/coffee-slider-2.png",
  "./images/coffee-slider-3.png",
];

let timer: number | null = null;
let slideIndex = 1;

burgerButton.addEventListener("click", function () {
  if (lineButton.classList.contains("active-menu")) {
    lineButton.classList.remove("active-menu");
  } else {
    lineButton.classList.add("active-menu");
  }

  if (burgerMenu.classList.contains("showMenu")) {
    burgerMenu.classList.remove("showMenu");
  } else {
    burgerMenu.classList.add("showMenu");
  }

  if (body.classList.contains("no-scroll")) {
    body.classList.remove("no-scroll");
  } else {
    body.classList.add("no-scroll");
  }
});

for (let index = 0; index < links.length; index++) {
  const element = links[index];

  element.addEventListener("click", function () {
    lineButton.classList.remove("active-menu");
    burgerMenu.classList.remove("showMenu");
    body.classList.remove("no-scroll");
  });
}

const maxScrollLeft = imageList.scrollWidth - imageList.clientWidth;
const screenWidth = window.innerWidth;

if (screenWidth > 768) {
  showSlides(slideIndex);
  timer = setInterval(function () {
    slideIndex++;
    showSlides(slideIndex);
  }, 6000);
}

const updateScrollThumbPosition = () => {
  const scrollPosition = imageList.scrollLeft;
  const thumbPosition =
    (scrollPosition / maxScrollLeft) *
    (sliderScrollbar.clientWidth - scrollbarThumb.offsetWidth);
  scrollbarThumb.style.left = `${thumbPosition}px`;
};

imageList.addEventListener("scroll", () => {
  updateScrollThumbPosition();
});

const showLoader = () => {
  if (imageList) {
    imageList.innerHTML = `<div class="loader">Loading...</div>`;
  }
};

const showError = () => {
  if (imageList) {
    imageList.innerHTML = `<p class="error">Something went wrong. Please, refresh the page</p>`;
  }
};

async function fetchFavoriteCoffees() {
  try {
    showLoader();
    const res = await fetch(FAVORITES_ENDPOINT);
    if (!res.ok) {
      showError();
    }
    const data = await res.json();
    const coffees = data.data.map((coffee: ICoffee, i: number) => ({
      ...coffee,
      imageUrl: placeholders[i % placeholders.length],
    }));

    return coffees;
  } catch {
    showError();
  }
}

function renderSlides(coffees: ICoffee[]) {
  console.log(coffees, "coffees");

  imageList.innerHTML = "";
  dotsContainer.innerHTML = "";

  coffees.forEach((coffee, index) => {
    const slide = document.createElement("div");
    slide.className = "fade";
    slide.innerHTML = `
         <div class='fade__image'>
         <img src="${coffee.imageUrl}" alt="${coffee.name}" />
         </div>
        <h3 class="fade__title">${coffee.name}</h3>
        <p class="fade__desc">${coffee.description}</p>
        <span class="fade__price">$${coffee.price}</span>
    `;
    imageList.appendChild(slide);

    const dot = document.createElement("span");
    dot.className = "dot";
    dot.addEventListener("click", () => currentSlide(index + 1));
    dotsContainer.appendChild(dot);
  });
  showSlides(slideIndex);
  startAutoSlide();
}

function showSlides(n: number) {
  const slides = document.getElementsByClassName(
    "fade",
  ) as HTMLCollectionOf<HTMLElement>;
  const dots = document.getElementsByClassName(
    "dot",
  ) as HTMLCollectionOf<HTMLElement>;
  if (slides.length === 0) return;

  if (n > slides.length) {
    slideIndex = 1;
  }
  if (n < 1) {
    slideIndex = slides.length;
  }

  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (let i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }

  slides[slideIndex - 1].style.display = "flex";
  if (dots.length > 0) dots[slideIndex - 1].className += " active";
}

function startAutoSlide(): void {
  stopAutoSlide();
  timer = window.setInterval(() => {
    slideIndex++;
    showSlides(slideIndex);
  }, 6000);
}

function plusSlides(n: number) {
  showSlides((slideIndex += n));
  resetAutoSlide();
}

function currentSlide(n: number) {
  showSlides((slideIndex = n));
  resetAutoSlide();
}

function stopAutoSlide(): void {
  if (timer) clearInterval(timer);
}

function resetAutoSlide(): void {
  stopAutoSlide();
  startAutoSlide();
}

prevBtn?.addEventListener("click", () => plusSlides(-1));
nextBtn?.addEventListener("click", () => plusSlides(1));

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const favorites = await fetchFavoriteCoffees();
    renderSlides(favorites);
  } catch (error) {
    showError();
  }
});
