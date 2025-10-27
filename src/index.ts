import { ICoffee } from "./types/coffee.interface";
import "./styles/style.scss";

enum API {
  BASE_URL = "https://6kt29kkeub.execute-api.eu-central-1.amazonaws.com",
  FAVORITES_ENDPOINT = "https://6kt29kkeub.execute-api.eu-central-1.amazonaws.com/products/favorites",
}

enum SlideTiming {
  INTERVAL = 6000,
}

interface HTMLElementMap {
  burgerButton: HTMLElement;
  lineButton: HTMLElement;
  burgerMenu: HTMLElement;
  body: HTMLElement;
  imageList: HTMLElement;
  prevBtn: HTMLElement;
  nextBtn: HTMLElement;
  dotsContainer: HTMLElement;
  shoppingCart: HTMLElement;
  scrollbarThumb: HTMLElement;
  sliderScrollbar: HTMLElement;
  cartItems: HTMLElement;
}


const els: HTMLElementMap = {
  burgerButton: document.querySelector(".header__burger-button") as HTMLElement,
  lineButton: document.querySelector(".line") as HTMLElement,
  burgerMenu: document.querySelector(".header__menu") as HTMLElement,
  body: document.querySelector(".wrapper") as HTMLElement,
  imageList: document.querySelector(".slides-container") as HTMLElement,
  prevBtn: document.querySelector(".btn.prev") as HTMLElement,
  nextBtn: document.querySelector(".btn.next") as HTMLElement,
  dotsContainer: document.querySelector(".slider-dots") as HTMLElement,
  shoppingCart: document.querySelector(".shopping-cart") as HTMLElement,
  scrollbarThumb: document.querySelector(".scrollbar-thumb") as HTMLElement,
  sliderScrollbar: document.querySelector(".slider-scrollbar") as HTMLElement,
  cartItems: document.querySelector(".cart-items") as HTMLElement,
};


const placeholders: string[] = [
  "/images/coffee-slider-1.png",
  "/images/coffee-slider-2.png",
  "/images/coffee-slider-3.png",
];

let timer: number | null = null;
let slideIndex = 1;


function isLoggedIn(): boolean {
  return !!localStorage.getItem("token");
}


els.burgerButton.addEventListener("click", (): void => {
  els.lineButton.classList.toggle("active-menu");
  els.burgerMenu.classList.toggle("showMenu");
  els.body.classList.toggle("no-scroll");
});

const menuLinks: HTMLCollectionOf<Element> = document.getElementsByClassName("header__menu-item");

Array.from(menuLinks).forEach((link: Element): void => {
  link.addEventListener("click", (): void => {
    els.lineButton.classList.remove("active-menu");
    els.burgerMenu.classList.remove("showMenu");
    els.body.classList.remove("no-scroll");
  });
});


const isUserLogged: boolean = isLoggedIn();
const storedCart: string | null = localStorage.getItem("cart");
const haveItems: unknown = storedCart ? JSON.parse(storedCart) : [];

if (Array.isArray(haveItems) && (isUserLogged || haveItems.length > 0)) {
  els.shoppingCart.classList.remove("hidden");
  els.cartItems.innerHTML = haveItems.length > 0 ? `${haveItems.length}` : "";
} else {
  els.shoppingCart.classList.add("hidden");
}


const maxScrollLeft: number = els.imageList.scrollWidth - els.imageList.clientWidth;

const updateScrollThumbPosition = (): void => {
  const scrollPosition: number = els.imageList.scrollLeft;
  const thumbPosition: number =
    (scrollPosition / maxScrollLeft) *
    (els.sliderScrollbar.clientWidth - els.scrollbarThumb.offsetWidth);
  els.scrollbarThumb.style.left = `${thumbPosition}px`;
};

els.imageList.addEventListener("scroll", updateScrollThumbPosition);

const showLoader = (): void => {
  els.imageList.innerHTML = `<div class="loader">Loading...</div>`;
};

const showError = (): void => {
  els.imageList.innerHTML = `<p class="error">Something went wrong. Please refresh the page.</p>`;
};


interface IFetchResponse {
  data: ICoffee[];
}

async function fetchFavoriteCoffees(): Promise<ICoffee[] | undefined> {
  try {
    showLoader();
    const res: Response = await fetch(API.FAVORITES_ENDPOINT);

    if (!res.ok) {
      showError();
      return;
    }

    const data: IFetchResponse = await res.json();

    const coffees: ICoffee[] = data.data.map(
      (coffee: ICoffee, i: number): ICoffee => ({
        ...coffee,
        imageUrl: placeholders[i % placeholders.length],
      }),
    );

    return coffees;
  } catch {
    showError();
  }
}


function renderSlides(coffees: ICoffee[]): void {
  els.imageList.innerHTML = "";
  els.dotsContainer.innerHTML = "";

  coffees.forEach((coffee: ICoffee, index: number): void => {
    const slide: HTMLDivElement = document.createElement("div");
    slide.className = "fade";
    slide.innerHTML = `
      <div class='fade__image'>
        <img src="${coffee.imageUrl}" alt="${coffee.name}" />
      </div>
      <h3 class="fade__title">${coffee.name}</h3>
      <p class="fade__desc">${coffee.description}</p>
      <span class="fade__price">$${coffee.price}</span>
    `;
    els.imageList.appendChild(slide);

    const dot: HTMLSpanElement = document.createElement("span");
    dot.className = "dot";
    dot.addEventListener("click", (): void => currentSlide(index + 1));
    els.dotsContainer.appendChild(dot);
  });

  showSlides(slideIndex);
  startAutoSlide();
}

function showSlides(n: number): void {
  const slides: HTMLCollectionOf<HTMLElement> = document.getElementsByClassName("fade") as HTMLCollectionOf<HTMLElement>;
  const dots: HTMLCollectionOf<HTMLElement> = document.getElementsByClassName("dot") as HTMLCollectionOf<HTMLElement>;

  if (slides.length === 0) return;

  if (n > slides.length) slideIndex = 1;
  if (n < 1) slideIndex = slides.length;

  Array.from(slides).forEach((slide: HTMLElement) => (slide.style.display = "none"));
  Array.from(dots).forEach((dot: HTMLElement): void => dot.classList.remove("active"));

  slides[slideIndex - 1].style.display = "flex";
  if (dots.length > 0) dots[slideIndex - 1].classList.add("active");
}

function startAutoSlide(): void {
  stopAutoSlide();
  timer = window.setInterval((): void => {
    slideIndex++;
    showSlides(slideIndex);
  }, SlideTiming.INTERVAL);
}

function stopAutoSlide(): void {
  if (timer !== null) clearInterval(timer);
}

function resetAutoSlide(): void {
  stopAutoSlide();
  startAutoSlide();
}

function plusSlides(n: number): void {
  showSlides((slideIndex += n));
  resetAutoSlide();
}

function currentSlide(n: number): void {
  showSlides((slideIndex = n));
  resetAutoSlide();
}


els.prevBtn.addEventListener("click", (): void => plusSlides(-1));
els.nextBtn.addEventListener("click", (): void => plusSlides(1));

window.addEventListener("DOMContentLoaded", async (): Promise<void> => {
  try {
    const favorites: ICoffee[] | undefined = await fetchFavoriteCoffees();
    if (favorites && favorites.length > 0) renderSlides(favorites);
  } catch {
    showError();
  }
});
