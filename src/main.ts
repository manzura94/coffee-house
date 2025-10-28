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
  Array.isArray(classname)
    ? tag.classList.add(...classname)
    : tag.classList.add(classname);
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
    const [backendRes, menuRes] = await Promise.all([
      fetch(FAVORITES_ENDPOINT),
      fetch("/data/menu.json"),
    ]);

    if (!backendRes.ok || !menuRes.ok) {
      showError();
      return [];
    }

    const backendJson = await backendRes.json();
    const backendData: BackendProduct[] = backendJson.data;
    const menuData: MenuProduct[] = await menuRes.json();

    const allProducts: MergedProduct[] = backendData.map(
      (product: BackendProduct) => {
        const menuItem = menuData.find((item) => item.id === product.id);
        return {
          ...product,
          imageUrl: menuItem?.image ?? null,
        };
      },
    );

  
    return allProducts;
  } catch (e) {
    console.error(e);
    showError();
    return [];
  }
}

async function getProductById(id: number): Promise<MergedProduct | null> {
  try {
    const [backendRes, menuRes] = await Promise.all([
      fetch(`${BASE_URL}/products/${id}`),
      fetch("/data/menu.json"),
    ]);

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

const displayMenu = async function (
  category: string,
  showBtn = false,
): Promise<void> {
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
    filtered.length <= 4
      ? showMore.classList.add("modal__close")
      : showMore.classList.remove("modal__close");
    filtered.slice(0, 4).forEach((element) => renderMenuItem(element));
  } else {
    allProducts
      .filter((item) => item.category === category)
      .forEach((element) => renderMenuItem(element));
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
  const subtitle = create<HTMLHeadingElement>(
    "h4",
    "menu__wrapper-subtitle",
    itemInfo,
  );
  subtitle.innerText = element.name;

  const text = create<HTMLParagraphElement>(
    "p",
    "menu__wrapper-text",
    itemInfo,
  );
  text.innerText = element.description;

  const priceContainer = create<HTMLDivElement>(
    "div",
    "menu__price-container",
    itemInfo,
  );

  const isLoggedIn = Boolean(localStorage.getItem("token"));
  const hasDiscount =
    isLoggedIn &&
    element.discountPrice !== undefined &&
    element.discountPrice < element.price;

  if (hasDiscount) {
    const oldPrice = create<HTMLSpanElement>(
      "span",
      ["menu__price", "menu__price--old"],
      priceContainer,
    );
    oldPrice.innerText = `$${element.price}`;

    const newPrice = create<HTMLSpanElement>(
      "span",
      ["menu__price", "menu__price--discount"],
      priceContainer,
    );
    newPrice.innerText = `$${element.discountPrice!}`;
  } else {
    const price = create<HTMLSpanElement>(
      "span",
      "menu__wrapper-price",
      priceContainer,
    );
    price.innerText = `$${element.price}`;
  }
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

function showModal(
  items: HTMLCollectionOf<Element>,
  data: MergedProduct[],
): void {
  for (let i = 0; i < items.length; i++) {
    const element = items[i] as HTMLElement;
    element.addEventListener("click", async function () {
      const product = await getProductById(Number(element.id));
      if (!product) return showError();
      

      const modal = create<HTMLDivElement>("div", "modal", wrapper);
      const modalWrap = create<HTMLDivElement>("div", "modal__wrapper", modal);
      const modalImgSide = create<HTMLDivElement>(
        "div",
        "modal__image",
        modalWrap,
      );
      const modalImgWrap = create<HTMLDivElement>(
        "div",
        "modal__image-wrap",
        modalImgSide,
      );
      const modalImg = create<HTMLImageElement>(
        "img",
        "modal-image",
        modalImgWrap,
      );
      modalImg.src = product.imageUrl ?? "";

      const modalInfo = create<HTMLDivElement>("div", "modal__info", modalWrap);
      const closeBtn = create<HTMLDivElement>(
        "div",
        "modal__wrapper__closebtn",
        modalWrap,
      );
      const closeBtnImg = create<HTMLImageElement>(
        "img",
        "closebtn-image",
        closeBtn,
      );
      closeBtnImg.src = "/images/icons/button-close.svg";

      const modalTextWrap = create<HTMLDivElement>(
        "div",
        "modal__textwrap",
        modalInfo,
      );
      const title = create<HTMLHeadingElement>(
        "h4",
        "modal__title",
        modalTextWrap,
      );
      title.innerText = product.name;
      const text = create<HTMLParagraphElement>(
        "p",
        "modal__text",
        modalTextWrap,
      );
      text.innerText = product.description;

      const modalButtonWrap = create<HTMLDivElement>(
        "div",
        "modal__buttonwrap",
        modalInfo,
      );
      const subtitle = create<HTMLParagraphElement>(
        "p",
        "modal__subtitle",
        modalButtonWrap,
      );
      subtitle.innerText = "Size";
      const sizeButtons = create<HTMLDivElement>(
        "div",
        "menu__buttons",
        modalButtonWrap,
      );

      function createSizeButton(
        sizeKey: keyof MergedProduct["sizes"],
        label: string,
        isActive = false,
      ): HTMLButtonElement {
        const sizeData = product?.sizes[sizeKey] as Size;
        const price = Number(sizeData.price);
        const discountPrice = sizeData.discountPrice
          ? Number(sizeData.discountPrice)
          : undefined;
        const isDiscountedUser = isLoggedIn();

        const btn = create<HTMLButtonElement>(
          "button",
          isActive
            ? ["menu-button", "active", "size_button"]
            : ["menu-button", "size_button"],
          sizeButtons,
        );

       btn.setAttribute("data-price", String(price));

        const icon = create<HTMLSpanElement>("span", "menu__buttons-icon", btn);
        icon.innerText = label;
        const txt = create<HTMLSpanElement>("span", "menu__buttons-text", btn);
        txt.innerText = sizeData.size;

        const tooltipHTML =
          isDiscountedUser && discountPrice
            ? `<s>$${price.toFixed(2)}</s> $${discountPrice.toFixed(2)}`
            : `$${price.toFixed(2)}`;
        attachTooltip(btn, tooltipHTML);

         btn.type = "button";

        return btn;
      }

      const sizeOrder: (keyof MergedProduct["sizes"])[] = [
        "s",
        "m",
        "l",
        "xl",
        "xxl",
      ].filter(
        (k) => (product.sizes as Record<string, Size>)[k] !== undefined,
      ) as (keyof MergedProduct["sizes"])[];
      sizeOrder.forEach((key, idx) => {
        createSizeButton(key, idx === 0 ? "S" : key.toUpperCase(), idx === 0);
      });

      const modalButtonWrap2 = create<HTMLDivElement>(
        "div",
        "modal__buttonwrap",
        modalInfo,
      );
      const subtitle2 = create<HTMLParagraphElement>(
        "p",
        "modal__subtitle",
        modalButtonWrap2,
      );
      subtitle2.innerText = "Additives";
      const addButtons = create<HTMLDivElement>(
        "div",
        "menu__buttons",
        modalButtonWrap2,
      );

      product.additives.forEach((additive: Additives, index: number) => {
        const price = Number(additive.price);
        const discountPrice = additive.discountPrice
          ? Number(additive.discountPrice)
          : undefined;
        const isDiscountedUser = isLoggedIn();

        const btn = create<HTMLButtonElement>(
          "button",
          ["menu-button", "additives"],
          addButtons,
        );

        btn.type = "button";

        btn.setAttribute("data-price", String(price));

        const icon = create<HTMLSpanElement>("span", "menu__buttons-icon", btn);
        icon.innerText = `${index + 1}`;
        const txt = create<HTMLSpanElement>("span", "menu__buttons-text", btn);
        txt.innerText = additive.name;

        const tooltipHTML =
          isDiscountedUser && discountPrice
            ? `<s>$${price.toFixed(2)}</s> $${discountPrice.toFixed(2)}`
            : `$${price.toFixed(2)}`;
        attachTooltip(btn, tooltipHTML);

        btn.addEventListener("click", function () {
         
           btn.classList.toggle("active"); 
    updateTotal();
          
        });
      });

      addButtons.addEventListener("click", (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  const btn = target.closest("button.additives") as HTMLButtonElement | null;
  if (!btn) return;

  btn.classList.toggle("active");
  updateTotal();
});

      const priceWrap = create<HTMLDivElement>(
        "div",
        "modal__price",
        modalInfo,
      );
      const priceTitle = create<HTMLHeadingElement>(
        "h4",
        "modal__price-title",
        priceWrap,
      );
      priceTitle.innerText = "Total:";

      const priceNum = create<HTMLHeadingElement>(
        "h4",
        "modal__price-num",
        priceWrap,
      );
      const priceSign = create<HTMLSpanElement>(
        "span",
        "modal__price-sign",
        priceNum,
      );
      priceSign.innerText = "$";

      const pricing = create<HTMLSpanElement>(
        "span",
        "modal__price-price",
        priceNum,
      );
      const pricingDiscount = create<HTMLSpanElement>(
        "span",
        "modal__price-discount",
        priceNum,
      );
      const pricingOld = create<HTMLSpanElement>(
        "s",
        "modal__price-old",
        priceNum,
      );

      pricingOld.style.display = "none";
      pricingDiscount.style.display = "none";

      const sizeButtonsList = Array.from(
        modal.querySelectorAll(".size_button"),
      ) as HTMLButtonElement[];
      const additiveButtonsList = Array.from(
        modal.querySelectorAll(".additives"),
      ) as HTMLButtonElement[];

      const basePrice =
        Number(sizeButtonsList[0].getAttribute("data-price")) || 0;
      pricing.innerText = basePrice.toFixed(2);

      let lastTotals = { actual: 0, discounted: 0 };

    function updateTotal(): void {
      
  const selectedSize = modal.querySelector<HTMLButtonElement>(".size_button.active");
  const selectedAdditives = modal.querySelectorAll<HTMLButtonElement>(".additives.active");


const sizeBase = selectedSize ? Number(selectedSize.getAttribute("data-price")) || 0 : 0;
  const additivesBase = Array.from(selectedAdditives).reduce(
    (s, b) => s + (Number(b.getAttribute("data-price")) || 0),
    0,
  );
  const actualTotal = sizeBase + additivesBase;

  const isDiscountedUser = isLoggedIn();
  let sizeDiscounted = sizeBase;
  if (selectedSize) {
    const sizeName = selectedSize.querySelector(".menu__buttons-text")?.textContent?.trim().toLowerCase() as keyof MergedProduct["sizes"];
    const sizeObj = product?.sizes[sizeName];
    if (isDiscountedUser && sizeObj?.discountPrice && Number(sizeObj.discountPrice) < Number(sizeObj.price)) {
      sizeDiscounted = Number(sizeObj.discountPrice);
    }
  };

    const additivesDiscounted = Array.from(selectedAdditives).reduce((sum, btn) => {
    const name = btn.querySelector(".menu__buttons-text")?.textContent?.trim();
    const additiveObj = product?.additives.find(a => a.name === name);
    if (isDiscountedUser && additiveObj?.discountPrice && Number(additiveObj.discountPrice) < Number(additiveObj.price)) {
      return sum + Number(additiveObj.discountPrice);
    }
    return sum + (additiveObj ? Number(additiveObj.price) : Number(btn.getAttribute("data-price") || 0));
  }, 0);

  let discountedTotal = sizeDiscounted + additivesDiscounted;

   if (isDiscountedUser && product?.discountPrice && Number(product.discountPrice) < Number(product.price)) {

    const productDiscountAmount = Number(product.price) - Number(product.discountPrice);
    discountedTotal = Math.max(0, discountedTotal - productDiscountAmount);
  }

    lastTotals = { actual: Number(actualTotal.toFixed(2)), discounted: Number(discountedTotal.toFixed(2)) };
 
     if (isDiscountedUser && lastTotals.discounted < lastTotals.actual) {
    pricingOld.style.display = "inline";
    pricingDiscount.style.display = "inline";
    pricing.style.display = "none";

    pricingOld.innerText = lastTotals.actual.toFixed(2);
    pricingDiscount.innerText = lastTotals.discounted.toFixed(2);
  } else {
    pricingOld.style.display = "none";
    pricingDiscount.style.display = "none";
    pricing.style.display = "inline";
    pricing.innerText = lastTotals.actual.toFixed(2);
  }
  
}


      sizeButtonsList.forEach((button) => {
        button.addEventListener("click", function () {
          sizeButtonsList.forEach((btn) => btn.classList.remove("active"));
          button.classList.add("active");
          additiveButtonsList.forEach((btn) => btn.classList.remove("active"));
          updateTotal();
        });
      });
      additiveButtonsList.forEach((btn) =>
        btn.addEventListener("click", function () {
          btn.classList.toggle("active");
          updateTotal();
        }),
      );
      updateTotal();

      const addToCart = create<HTMLButtonElement>(
        "button",
        "modal__closebtn",
        modalInfo,
      );
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
  const finalTotalPrice = (isLoggedIn() && lastTotals.discounted < lastTotals.actual) ? lastTotals.discounted : lastTotals.actual;

  const isDiscountedUser = isLoggedIn();
  const newItem = {
    id: product.id,
    name: product.name,
    imageUrl: product.imageUrl,
    size: { name: selectedSizeName, price: selectedSizePrice },
    additives: selectedAdditives,
    totalPrice: finalTotalPrice, 
    quantity: 1,
    isDiscounted: isDiscountedUser,

    actualTotal: lastTotals.actual,
    discountedTotal: lastTotals.discounted,
  } as unknown as CartItems; 

  const existingIndex = cart.findIndex(
    (item) =>
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
    console.log(newCart);
    
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

function closeModal(
  button: HTMLElement,
  modal: HTMLElement,
  modalWrap: HTMLElement,
): void {
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
