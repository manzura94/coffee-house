import "./styles/style.scss";
import { Additives, CartItems, Size } from "./types/cart.interface";
import {
  BackendProduct,
  MenuProduct,
  MergedProduct,
} from "./types/product.inteface";


const menuWrapper = document.querySelector<HTMLElement>(".menu__wrapper")!;
const wrapper = document.querySelector<HTMLElement>(".wrapper")!;
let showMore = document.querySelector<HTMLElement>(".menu__showmore")!;
const coffeeBtn = document.querySelector<HTMLButtonElement>(".coffee")!;
const teaBtn = document.querySelector<HTMLButtonElement>(".tea")!;
const dessertBtn = document.querySelector<HTMLButtonElement>(".dessert")!;
const shoppingCart = document.querySelector<HTMLElement>(".shopping-cart")!;
const cartItems = document.querySelector<HTMLElement>(".cart-items")!;


function create<T extends HTMLElement>(
  tagname: keyof HTMLElementTagNameMap,
  classname: string | string[],
  parent: HTMLElement,
): T {
  const tag = document.createElement(tagname) as T;
  Array.isArray(classname) ? tag.classList.add(...classname) : tag.classList.add(classname);
  parent.appendChild(tag);
  return tag;
}

function parseJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (e) {
    console.error(`Failed to parse localStorage.${key}`, e);
    return fallback;
  }
}

function getCart(): CartItems[] {
  return parseJSON<CartItems[]>("cart", []);
}

function setCart(cart: CartItems[]): void {
  localStorage.setItem("cart", JSON.stringify(cart));
}


function updateShoppingCartVisibility(): void {
  const items = getCart();
  if (isLoggedIn() || items.length > 0) {
    shoppingCart.classList.remove("hidden");
    cartItems.innerText = items.length > 0 ? String(items.length) : "";
  } else {
    shoppingCart.classList.add("hidden");
    cartItems.innerText = "";
  }
}

function updateCartCount(): void {
  const items = getCart();
  cartItems.innerText = items.length > 0 ? String(items.length) : "";
}


const BASE_URL = "https://6kt29kkeub.execute-api.eu-central-1.amazonaws.com";
const FAVORITES_ENDPOINT = `${BASE_URL}/products`;


function showLoader(): void {
  menuWrapper.innerHTML = "";
  const loader = create<HTMLDivElement>("div", "menu__loader", menuWrapper);
  loader.innerText = "Loading...";
  loader.setAttribute("data-loader", "true");
}

function showError(): void {
  menuWrapper.innerHTML = "";
  const error = create<HTMLDivElement>("div", "menu__error", menuWrapper);
  error.innerText = "⚠ Failed to load menu. Try again later.";
}


function isLoggedIn(): boolean {
  return Boolean(localStorage.getItem("token"));
}


updateShoppingCartVisibility();


async function getAllProducts(): Promise<MergedProduct[]> {
  try {
    const [backendRes, menuRes] = await Promise.all([fetch(FAVORITES_ENDPOINT), fetch("/data/menu.json")]);

    if (!backendRes.ok || !menuRes.ok) {
      showError();
      return [];
    }

    const backendJson = await backendRes.json();
    const backendData: BackendProduct[] = backendJson.data;
    const menuData: MenuProduct[] = await menuRes.json();

    const allProducts: MergedProduct[] = backendData.map((product: BackendProduct) => {
      const menuItem = menuData.find((item) => item.id === product.id);
      return {
        ...product,
        imageUrl: menuItem?.image ?? null,
      };
    });

    return allProducts;
  } catch (e) {
    console.error(e);
    showError();
    return [];
  }
}

async function getProductById(id: number): Promise<MergedProduct | null> {
  try {
    const [backendRes, menuRes] = await Promise.all([fetch(`${BASE_URL}/products/${id}`), fetch("/data/menu.json")]);

    if (!backendRes.ok || !menuRes.ok) {
      showError();
      return null;
    }

    const backendJson = await backendRes.json();
    const backendData: BackendProduct = backendJson.data;
    const menuData: MenuProduct[] = await menuRes.json();

    const menuProduct = menuData.find((item) => item.id === backendData.id);

    const mergedProduct: MergedProduct = {
      ...backendData,
      imageUrl: menuProduct?.image ?? null,
    };

    return mergedProduct;
  } catch (error) {
    console.error(error);
    showError();
    return null;
  }
}


let typeMenu = "coffee";
let display = window.innerWidth;

window.addEventListener("resize", function () {
  display = window.innerWidth;
  menuWrapper.innerHTML = "";
  void displayMenu(typeMenu);
});

const displayMenu = async function (category: string, showBtn = false): Promise<void> {
  showLoader();
  const allProducts = await getAllProducts();
  if (!allProducts || allProducts.length === 0) {
    showError();
    return;
  }
  typeMenu = category;
  menuWrapper.innerHTML = "";

  const filtered = allProducts.filter((p) => p.category === category);

  if (display < 768 && !showBtn) {
    filtered.length <= 4 ? showMore.classList.add("modal__close") : showMore.classList.remove("modal__close");
    filtered.slice(0, 4).forEach((element) => renderMenuItem(element));
  } else {
    allProducts.filter((item) => item.category === category).forEach((element) => renderMenuItem(element));
  }

  const menuItems = document.getElementsByClassName("menu__wrapper-item");
  showModal(menuItems, allProducts);
};

function renderMenuItem(element: MergedProduct): void {
  const item = create<HTMLDivElement>("div", "menu__wrapper-item", menuWrapper);
  item.setAttribute("id", `${element.id}`);

  const imageWrap = create<HTMLDivElement>("div", "menu__wrapper-image", item);
  const itemImg = create<HTMLImageElement>("img", "coffee-image", imageWrap);
  itemImg.src = element.imageUrl ?? "/images/placeholder.png";
  itemImg.setAttribute("alt", `product/${element.id}`);

  const itemInfo = create<HTMLDivElement>("div", "menu__wrapper-info", item);
  const subtitle = create<HTMLHeadingElement>("h4", "menu__wrapper-subtitle", itemInfo);
  subtitle.innerText = element.name;

  const text = create<HTMLParagraphElement>("p", "menu__wrapper-text", itemInfo);
  text.innerText = element.description;

  const price = create<HTMLSpanElement>("span", "menu__wrapper-price", itemInfo);
  price.innerText = `$${element.price}`;
}


function getPriceForUser(price: string, discountPrice?: string): string {
  return isLoggedIn() && discountPrice ? discountPrice : price;
}

function attachTooltip(el: HTMLElement, text: string): void {
  const tooltip = document.createElement("div");
  tooltip.className = "tooltip";
  tooltip.innerHTML = text;
  document.body.appendChild(tooltip);

  el.addEventListener("mouseenter", () => {
    tooltip.classList.add("show");
    const rect = el.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2}px`;
    tooltip.style.top = `${rect.top - 8}px`;
  });

  el.addEventListener("mouseleave", () => {
    tooltip.classList.remove("show");
  });
}

function showModal(items: HTMLCollectionOf<Element>, data: MergedProduct[]): void {
  for (let i = 0; i < items.length; i++) {
    const element = items[i] as HTMLElement;
    element.addEventListener("click", async function () {
      const product = await getProductById(Number(element.id));
      if (!product) return showError();

      const modal = create<HTMLDivElement>("div", "modal", wrapper);
      const modalWrap = create<HTMLDivElement>("div", "modal__wrapper", modal);
      const modalImgSide = create<HTMLDivElement>("div", "modal__image", modalWrap);
      const modalImgWrap = create<HTMLDivElement>("div", "modal__image-wrap", modalImgSide);
      const modalImg = create<HTMLImageElement>("img", "modal-image", modalImgWrap);
      modalImg.src = product.imageUrl ?? "";

      const modalInfo = create<HTMLDivElement>("div", "modal__info", modalWrap);
      const closeBtn = create<HTMLDivElement>("div", "modal__wrapper__closebtn", modalWrap);
      const closeBtnImg = create<HTMLImageElement>("img", "closebtn-image", closeBtn);
      closeBtnImg.src = "/images/icons/button-close.svg";

      const modalTextWrap = create<HTMLDivElement>("div", "modal__textwrap", modalInfo);
      const title = create<HTMLHeadingElement>("h4", "modal__title", modalTextWrap);
      title.innerText = product.name;
      const text = create<HTMLParagraphElement>("p", "modal__text", modalTextWrap);
      text.innerText = product.description;


      const modalButtonWrap = create<HTMLDivElement>("div", "modal__buttonwrap", modalInfo);
      const subtitle = create<HTMLParagraphElement>("p", "modal__subtitle", modalButtonWrap);
      subtitle.innerText = "Size";
      const sizeButtons = create<HTMLDivElement>("div", "menu__buttons", modalButtonWrap);


      function createSizeButton(sizeKey: keyof MergedProduct["sizes"], label: string, isActive = false): HTMLButtonElement {
        const sizeBtn = create<HTMLButtonElement>("button", isActive ? ["menu-button", "active", "size_button"] : ["menu-button", "size_button"], sizeButtons);
        const sizeData = product?.sizes[sizeKey] as Size;
        const price = getPriceForUser(sizeData.price, sizeData.discountPrice);
        sizeBtn.setAttribute("data-price", price);
        const icon = create<HTMLSpanElement>("span", "menu__buttons-icon", sizeBtn);
        icon.innerText = label;
        const txt = create<HTMLSpanElement>("span", "menu__buttons-text", sizeBtn);
        txt.innerText = sizeData.size;
        attachTooltip(sizeBtn, isLoggedIn() && sizeData.discountPrice ? `$${sizeData.discountPrice} <s>$${sizeData.price}</s>` : `$${sizeData.price}`);
        return sizeBtn;
      }


      const sizeOrder: (keyof MergedProduct["sizes"])[] = ["s", "m", "l", "xl", "xxl"].filter(k => (product.sizes as Record<string, Size>)[k] !== undefined) as (keyof MergedProduct["sizes"])[];
      sizeOrder.forEach((key, idx) => {
        createSizeButton(key, idx === 0 ? "S" : key.toUpperCase(), idx === 0);
      });


      const modalButtonWrap2 = create<HTMLDivElement>("div", "modal__buttonwrap", modalInfo);
      const subtitle2 = create<HTMLParagraphElement>("p", "modal__subtitle", modalButtonWrap2);
      subtitle2.innerText = "Additives";
      const addButtons = create<HTMLDivElement>("div", "menu__buttons", modalButtonWrap2);

      product.additives.forEach((additive: Additives, index: number) => {
        const priceToUse = isLoggedIn() ? (additive.discountPrice ?? additive.price) : additive.price;
        const addButton = create<HTMLButtonElement>("button", ["menu-button", "additives"], addButtons);
        addButton.setAttribute("data-price", String(priceToUse));
        const addButtonIcon = create<HTMLSpanElement>("span", "menu__buttons-icon", addButton);
        addButtonIcon.innerText = `${index + 1}`;
        const addButtonText = create<HTMLSpanElement>("span", "menu__buttons-text", addButton);
        addButtonText.innerText = additive.name;

        addButton.addEventListener("click", function () {
          addButton.classList.toggle("active");
          const value = Number(addButton.getAttribute("data-price") ?? 0);
          const total = Number(pricing.innerText);
          const newTotal = addButton.classList.contains("active") ? total + value : total - value;
          pricing.innerText = newTotal.toFixed(2);
        });
      });


      const priceWrap = create<HTMLDivElement>("div", "modal__price", modalInfo);
      const priceTitle = create<HTMLHeadingElement>("h4", "modal__price-title", priceWrap);
      priceTitle.innerText = "Total:";
      const priceNum = create<HTMLHeadingElement>("h4", "modal__price-num", priceWrap);
      const priceSign = create<HTMLSpanElement>("span", "modal__price-sign", priceNum);
      const pricing = create<HTMLSpanElement>("span", "modal__price-price", priceNum);
      priceSign.innerText = "$";

      const sizeButtonsList = Array.from(modal.querySelectorAll(".size_button")) as HTMLButtonElement[];
      const additiveButtonsList = Array.from(modal.querySelectorAll(".additives")) as HTMLButtonElement[];
      const basePrice = Number(sizeButtonsList[0].getAttribute("data-price")) || 0;
      pricing.innerText = basePrice.toFixed(2);

      sizeButtonsList.forEach((button) => {
        button.addEventListener("click", function () {
          sizeButtonsList.forEach((btn) => btn.classList.remove("active"));
          button.classList.add("active");
          additiveButtonsList.forEach((addBtn) => addBtn.classList.remove("active"));
          const newBase = Number(button.getAttribute("data-price")) || 0;
          pricing.innerText = newBase.toFixed(2);
        });
      });


      const addToCart = create<HTMLButtonElement>("button", "modal__closebtn", modalInfo);
      addToCart.innerText = "Add to cart";
      addToCart.addEventListener("click", function () {
        const cart = getCart();

        const selectedSizeBtn = modal.querySelector<HTMLButtonElement>(".size_button.active")!;
        const selectedSizeName = selectedSizeBtn.querySelector<HTMLElement>(".menu__buttons-text")!.textContent!.trim();
        const selectedSizePrice = Number(selectedSizeBtn.getAttribute("data-price")) || 0;

        const activeAdditives = Array.from(modal.querySelectorAll<HTMLButtonElement>(".additives.active"));
        const selectedAdditives = activeAdditives.map((btn) => {
          const name = btn.querySelector<HTMLElement>(".menu__buttons-text")!.textContent!.trim();
          const price = Number(btn.getAttribute("data-price")) || 0;
          return { name, price };
        });

        const totalAdditivesPrice = selectedAdditives.reduce((sum, a) => sum + a.price, 0);
        const totalPrice = Number((selectedSizePrice + totalAdditivesPrice).toFixed(2));

        const isDiscountedUser = isLoggedIn();
        const newItem: CartItems = {
          id: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
          size: { name: selectedSizeName, price: selectedSizePrice },
          additives: selectedAdditives,
          totalPrice,
          quantity: 1,
          isDiscounted: isDiscountedUser,
        };

        const existingIndex = cart.findIndex((item) =>
          item.id === newItem.id &&
          item.size.name === newItem.size.name &&
          JSON.stringify(item.additives) === JSON.stringify(newItem.additives),
        );

        if (existingIndex !== -1) {
          const updatedItem = { ...cart[existingIndex] };
          updatedItem.quantity = cart[existingIndex].quantity + 1;
          updatedItem.totalPrice = Number((cart[existingIndex].totalPrice + newItem.totalPrice).toFixed(2));
          const newCart = [...cart];
          newCart[existingIndex] = updatedItem;
          setCart(newCart);
        } else {
          setCart([...cart, newItem]);
        }


        updateShoppingCartVisibility();
        updateCartCount();


        wrapper.classList.remove("no-scroll");
        modal.classList.add("modal__close");
      });

      closeModal(closeBtn, modal, modalWrap);
      wrapper.classList.add("no-scroll");
    });
  }
}


function closeModal(button: HTMLElement, modal: HTMLElement, modalWrap: HTMLElement): void {
  modalWrap.addEventListener("click", (e) => {
    e.stopPropagation();
  });
  button.addEventListener("click", () => {
    wrapper.classList.remove("no-scroll");
    modal.classList.add("modal__close");
  });

  modal.addEventListener("click", () => {
    wrapper.classList.remove("no-scroll");
    modal.classList.add("modal__close");
  });

  function escHandler(e: KeyboardEvent) {
    if (e.key === "Escape") {
      wrapper.classList.remove("no-scroll");
      modal.classList.add("modal__close");
      document.removeEventListener("keydown", escHandler);
    }
  }
  document.addEventListener("keydown", escHandler);
}


teaBtn.addEventListener("click", function () {
  showMore.classList.remove("modal__close");
  dessertBtn.classList.remove("active");
  teaBtn.classList.add("active");
  menuWrapper.innerHTML = "";
  void displayMenu("tea");
  coffeeBtn.classList.remove("active");
});

coffeeBtn.addEventListener("click", function () {
  showMore.classList.remove("modal__close");
  dessertBtn.classList.remove("active");
  teaBtn.classList.remove("active");
  coffeeBtn.classList.add("active");
  menuWrapper.innerHTML = "";
  void displayMenu("coffee");
});

dessertBtn.addEventListener("click", function () {
  showMore.classList.remove("modal__close");
  teaBtn.classList.remove("active");
  dessertBtn.classList.add("active");
  menuWrapper.innerHTML = "";
  void displayMenu("dessert");
  coffeeBtn.classList.remove("active");
});


displayMenu(typeMenu);
coffeeBtn.classList.add("active");

showMore.addEventListener("click", function () {
  showLoader();
  showMore.classList.add("modal__close");
  void displayMenu(typeMenu, true);
});
