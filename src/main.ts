import "./styles/style.scss";
import {
  BackendProduct,
  MenuProduct,
  MergedProduct,
} from "./types/product.inteface";

const menuWrapper = document.querySelector(".menu__wrapper") as HTMLElement;
const wrapper = document.querySelector(".wrapper") as HTMLElement;
let showMore = document.querySelector(".menu__showmore") as HTMLElement;
const coffeeBtn = document.querySelector<HTMLButtonElement>(".coffee")!;
const teaBtn = document.querySelector<HTMLButtonElement>(".tea")!;
const dessertBtn = document.querySelector<HTMLButtonElement>(".dessert")!;
const shoppingCart = document.querySelector<HTMLElement>(".shopping-cart")!;

function create<T extends HTMLElement>(
  tagname: keyof HTMLElementTagNameMap,
  classname: string | string[],
  parent: HTMLElement,
) {
  let tag = document.createElement(tagname) as T;
  Array.isArray(classname)
    ? tag.classList.add(...classname)
    : tag.classList.add(classname);
  return parent.appendChild(tag);
}

const BASE_URL = "https://6kt29kkeub.execute-api.eu-central-1.amazonaws.com";
const FAVORITES_ENDPOINT = `${BASE_URL}/products`;

function showLoader() {
  menuWrapper.innerHTML = "";
  const loader = create<HTMLDivElement>("div", "menu__loader", menuWrapper);
  loader.innerText = "Loading...";
  loader.setAttribute("data-loader", "true");
}

function showError() {
  menuWrapper.innerHTML = "";
  const error = create<HTMLDivElement>("div", "menu__error", menuWrapper);
  error.innerText = "⚠ Failed to load menu. Try again later.";
}

const cartItems = document.querySelector(".cart-items") as HTMLElement;

function isLoggedIn(): boolean {
  return !!localStorage.getItem("token");
}

const isUserLogged = isLoggedIn();
const haveItems = JSON.parse(localStorage.getItem("cart") || "[]");


if (isUserLogged || haveItems.length) {
  shoppingCart.classList.remove("hidden");
  cartItems.innerHTML = `${haveItems.length}`;
} else {
  shoppingCart.classList.add("hidden");
}

async function getAllProducts(): Promise<MergedProduct[]> {
  const [backendRes, menuRes] = await Promise.all([
    fetch(FAVORITES_ENDPOINT),
    fetch("/data/menu.json"),
  ]);

  if (!backendRes.ok || !menuRes.ok) {
    showError();
  }

  const backendJson = await backendRes.json();
  const backendData: BackendProduct[] = backendJson.data;
  const menuData: MenuProduct[] = await menuRes.json();

  const allProducts = backendData.map((product) => {
    const menuItem = menuData.find((item) => item.id === product.id);
    return {
      ...product,
      imageUrl: menuItem?.image ?? null,
    };
  });

  return allProducts;
}

let typeMenu = "coffee";

let display = window.innerWidth;
window.addEventListener("resize", function () {
  display = window.innerWidth;
  menuWrapper.innerHTML = "";
  displayMenu(typeMenu);
});

let displayMenu = async function (category: string, showBtn = false) {
  showLoader();
  const allProducts = await getAllProducts();
  if (!allProducts) showError();
  typeMenu = category;
  menuWrapper.innerHTML = "";

  const filtered = allProducts.filter((p) => p.category === category);

  if (display < 768 && !showBtn) {
    filtered.length <= 4
      ? showMore.classList.add("modal__close")
      : showMore.classList.remove("modal__close");
    filtered.slice(0, 4).forEach((element) => {
      let item = create("div", "menu__wrapper-item", menuWrapper);
      item.setAttribute("id", `${element.id}`);

      let imageWrap = create("div", "menu__wrapper-image", item);

      let itemImg = create<HTMLImageElement>("img", "coffee-image", imageWrap);
      itemImg.src = `${element.imageUrl}`;
      itemImg.setAttribute("alt", `coffee/${element.id}`);

      let itemInfo = create("div", "menu__wrapper-info", item);

      let subtitle = create("h4", "menu__wrapper-subtitle", itemInfo);
      subtitle.innerText = element.name;

      let text = create("p", "menu__wrapper-text", itemInfo);
      text.innerText = element.description;

      let price = create("span", "menu__wrapper-price", itemInfo);
      price.innerText = `$${element.price}`;
    });
  } else if (showBtn === true || display > 768) {
    allProducts
      .filter((item) => item.category === `${category}`)
      .forEach((element) => {
        let item = create("div", "menu__wrapper-item", menuWrapper);
        item.setAttribute("id", `${element.id}`);

        let imageWrap = create("div", "menu__wrapper-image", item);

        let itemImg = create<HTMLImageElement>(
          "img",
          "coffee-image",
          imageWrap,
        );
        itemImg.src = `${element.imageUrl}`;
        itemImg.setAttribute("alt", `coffee/${element.id}`);

        let itemInfo = create("div", "menu__wrapper-info", item);

        let subtitle = create("h4", "menu__wrapper-subtitle", itemInfo);
        subtitle.innerText = element.name;

        let text = create("p", "menu__wrapper-text", itemInfo);
        text.innerText = element.description;

        let price = create("span", "menu__wrapper-price", itemInfo);
        price.innerText = `$${element.price}`;
      });
  }
  let menuItem = document.getElementsByClassName("menu__wrapper-item");
  showModal(menuItem, allProducts);
};

async function getProductById(id: number): Promise<MergedProduct | null> {
  try {
    const [backendRes, menuRes] = await Promise.all([
      fetch(`${BASE_URL}/products/${id}`),
      fetch("/data/menu.json"),
    ]);

    if (!backendRes.ok || !menuRes.ok) {
      showError();
    }

    const backendJson = await backendRes.json();
    const backendData: BackendProduct = backendJson.data;
    const menuData: MenuProduct[] = await menuRes.json();
    console.log(backendData, "back");

    const menuProduct = menuData.find((item) => item.id === backendData.id);

    const mergedProduct: MergedProduct = {
      ...backendData,
      imageUrl: menuProduct?.image ?? null,
    };

    return mergedProduct;
  } catch (error) {
    return null;
  }
}

function getPriceForUser(price: string, discountPrice?: string): string {
  const isLoggedUser = isLoggedIn();
  return isLoggedUser && discountPrice ? discountPrice : price;
}

function attachTooltip(el: HTMLElement, text: string) {
  const tooltip = document.createElement("div");
  tooltip.className = "tooltip";
  tooltip.innerHTML = text;
  document.body.appendChild(tooltip);

  el.addEventListener("mouseenter", (e) => {
    tooltip.classList.add("show");
    const rect = el.getBoundingClientRect();
    tooltip.style.left = rect.left + rect.width / 2 + "px";
    tooltip.style.top = rect.top - 8 + "px";
  });

  el.addEventListener("mouseleave", () => {
    tooltip.classList.remove("show");
  });
}

function showModal(item: HTMLCollectionOf<Element>, data: MergedProduct[]) {

  for (let i = 0; i < item.length; i++) {
    let element = item[i];
    element.addEventListener("click", async function () {
      const product = await getProductById(Number(element.id));

      if (!product) return showError();

      let modal = create("div", "modal", wrapper);
      let modalWrap = create("div", "modal__wrapper", modal);
      let modalImgSide = create("div", "modal__image", modalWrap);
      let modalImgWrap = create("div", "modal__image-wrap", modalImgSide);

      let modalImg = create<HTMLImageElement>(
        "img",
        "modal-image",
        modalImgWrap,
      );
      modalImg.src = product?.imageUrl ?? "";

      let modalInfo = create("div", "modal__info", modalWrap);
      let closeBtn = create("div", "modal__wrapper__closebtn", modalWrap);
      let closeBtnImg = create<HTMLImageElement>(
        "img",
        "closebtn-image",
        closeBtn,
      );
      closeBtnImg.src = "/images/icons/button-close.svg";

      let modalTextWrap = create("div", "modal__textwrap", modalInfo);
      let title = create("h4", "modal__title", modalTextWrap);
      title.innerText = product!.name;
      let text = create("p", "modal__text", modalTextWrap);
      text.innerText = product!.description;

      let modalButtonWrap = create("div", "modal__buttonwrap", modalInfo);
      let subtitle = create("p", "modal__subtitle", modalButtonWrap);
      subtitle.innerText = "Size";
      let sizeButtons = create("div", "menu__buttons", modalButtonWrap);

      let sizeButton = create(
        "button",
        ["menu-button", "active", "size_button"],
        sizeButtons,
      );
      const sizeData = product.sizes.s;
      const price = getPriceForUser(sizeData.price, sizeData.discountPrice);
      sizeButton.setAttribute("data-price", price);
      let sizeButtonIcon = create("span", "menu__buttons-icon", sizeButton);
      sizeButtonIcon.innerText = "S";
      let sizeButtonText = create("span", "menu__buttons-text", sizeButton);
      sizeButtonText.innerText = product.sizes.s.size;

      const original = sizeData.price;
      const discounted = sizeData.discountPrice;

      const tooltipText =
        isLoggedIn() && discounted
          ? `$${discounted} <s>$${original}</s>`
          : `$${original}`;

      attachTooltip(sizeButton, tooltipText);

      let sizeButton1 = create(
        "button",
        ["menu-button", "size_button"],
        sizeButtons,
      );
      let sizeButtonIcon1 = create("span", "menu__buttons-icon", sizeButton1);
      const sizeData1 = product.sizes.m;
      const price1 = getPriceForUser(sizeData1.price, sizeData1.discountPrice);
      sizeButton1.setAttribute("data-price", price1);

      sizeButtonIcon1.innerText = "M";
      let sizeButtonText1 = create("span", "menu__buttons-text", sizeButton1);
      sizeButtonText1.innerText = product.sizes.m.size;

      let sizeButton2 = create(
        "button",
        ["menu-button", "size_button"],
        sizeButtons,
      );
      const sizeData2 = product.sizes.l;
      const price2 = getPriceForUser(sizeData2.price, sizeData2.discountPrice);
      sizeButton2.setAttribute("data-price", price2);

      let sizeButtonIcon2 = create("span", "menu__buttons-icon", sizeButton2);
      sizeButtonIcon2.innerText = "L";
      let sizeButtonText2 = create("span", "menu__buttons-text", sizeButton2);
      sizeButtonText2.innerText = product.sizes.l.size;

      if (product.sizes.xl) {
        let sizeButton3 = create(
          "button",
          ["menu-button", "size_button"],
          sizeButtons,
        );
        const sizeData3 = product.sizes.xl;
        const price3 = getPriceForUser(
          sizeData3.price,
          sizeData3.discountPrice,
        );
        sizeButton2.setAttribute("data-price", price3);

        let sizeButtonIcon3 = create("span", "menu__buttons-icon", sizeButton3);
        sizeButtonIcon3.innerText = "L";
        let sizeButtonText3 = create("span", "menu__buttons-text", sizeButton3);
        sizeButtonText3.innerText = product.sizes.xl.size;
      }

      if (product.sizes.xxl) {
        let sizeButton3 = create(
          "button",
          ["menu-button", "size_button"],
          sizeButtons,
        );
        const sizeData3 = product.sizes.xxl;
        const price3 = getPriceForUser(
          sizeData3.price,
          sizeData3.discountPrice,
        );
        sizeButton2.setAttribute("data-price", price3);

        let sizeButtonIcon3 = create("span", "menu__buttons-icon", sizeButton3);
        sizeButtonIcon3.innerText = "XL";
        let sizeButtonText3 = create("span", "menu__buttons-text", sizeButton3);
        sizeButtonText3.innerText = product.sizes.xxl.size;
      }

      let modalButtonWrap2 = create("div", "modal__buttonwrap", modalInfo);
      let subtitle2 = create("p", "modal__subtitle", modalButtonWrap2);
      subtitle2.innerText = "Additives";
      let addButtons = create("div", "menu__buttons", modalButtonWrap2);

      product.additives.forEach((additive, index) => {
        const priceToUse = isLoggedIn()
          ? (additive.discountPrice ?? additive.price)
          : additive.price;
        let addButton = create(
          "button",
          ["menu-button", "additives"],
          addButtons,
        );

        addButton.setAttribute("data-price", priceToUse);

        let addButtonIcon = create("span", "menu__buttons-icon", addButton);
        addButtonIcon.innerText = `${index + 1}`;
        let addButtonText = create("span", "menu__buttons-text", addButton);
        addButtonText.innerText = additive.name;
        addButton.addEventListener("click", function () {
          addButton.classList.toggle("active");

          const value = Number(addButton.getAttribute("data-price") ?? 0);
          const total = Number(pricing.innerText);

          const newTotal = addButton.classList.contains("active")
            ? total + value
            : total - value;

          pricing.innerText = newTotal.toFixed(2);
        });
      });

      let priceWrap = create("div", "modal__price", modalInfo);
      let priceTitle = create("h4", "modal__price-title", priceWrap);
      priceTitle.innerText = "Total:";
      let priceNum = create("h4", "modal__price-num", priceWrap);
      let priceSign = create("span", "modal__price-sign", priceNum);
      let pricing = create("span", "modal__price-price", priceNum);
      priceSign.innerText = "$";
      let sizButtons = [...document.getElementsByClassName("size_button")];

      let basePrice = Number(sizButtons[0].getAttribute("data-price")) || 0;

      let addToCart = create("button", "modal__closebtn", modalInfo);
      addToCart.innerText = "Add to cart";
      addToCart.addEventListener("click", function () {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");

        const selectedSizeBtn = document.querySelector(
          ".size_button.active",
        ) as HTMLElement;
        const selectedSizeName = selectedSizeBtn
          .querySelector(".menu__buttons-text")!
          .textContent!.trim();
        const selectedSizePrice = Number(
          selectedSizeBtn.getAttribute("data-price"),
        );
        const activeAdditives = [
          ...document.querySelectorAll(".additives.active"),
        ];
        const selectedAdditives = activeAdditives.map((btn: any) => {
          return {
            name: btn.querySelector(".menu__buttons-text").textContent.trim(),
            price: Number(btn.getAttribute("data-price")),
          };
        });
        const totalAdditivesPrice = selectedAdditives.reduce(
          (sum, a) => sum + a.price,
          0,
        );
        const totalPrice = (selectedSizePrice + totalAdditivesPrice).toFixed(2);

        const isDiscountedUser = isLoggedIn();
        const newItem = {
          id: product!.id,
          name: product!.name,
          imageUrl: product!.imageUrl,
          size: { name: selectedSizeName, price: selectedSizePrice },
          additives: selectedAdditives,
          totalPrice: Number(totalPrice),
          quantity: 1,
          isDiscounted: isDiscountedUser,
        };
        const existingIndex = cart.findIndex(
          (item: any) =>
            item.id === newItem.id &&
            item.size.name === newItem.size.name &&
            JSON.stringify(item.additives) ===
              JSON.stringify(newItem.additives),
        );

        if (existingIndex !== -1) {
          cart[existingIndex].quantity += 1;
          cart[existingIndex].totalPrice = Number(
            (cart[existingIndex].totalPrice + newItem.totalPrice).toFixed(2),
          );
        } else {
          cart.push(newItem);
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        document.querySelector(".body")!.classList.remove("no-scroll");
        modal.classList.add("modal__close");
      });

      document.querySelector(".body")!.classList.add("no-scroll");

      let sizeButtonsList = [...document.getElementsByClassName("size_button")];
      let additiveButtonsList = [
        ...document.getElementsByClassName("additives"),
      ];
      pricing.innerText = basePrice.toFixed(2);

      sizeButtonsList.forEach((button) => {
        button.addEventListener("click", function () {
          sizeButtonsList.forEach((btn) => btn.classList.remove("active"));
          button.classList.add("active");

          additiveButtonsList.forEach((addBtn) =>
            addBtn.classList.remove("active"),
          );

          basePrice = Number(button.getAttribute("data-price")) || 0;
          pricing.innerText = basePrice.toFixed(2);
        });
      });

      closeModal(closeBtn, modal, modalWrap);
    });
  }
}

teaBtn.addEventListener("click", function () {
  showMore.classList.remove("modal__close");

  dessertBtn.classList.remove("active");
  teaBtn.classList.add("active");
  menuWrapper.innerHTML = "";
  displayMenu("tea");
  coffeeBtn.classList.remove("active");
});

coffeeBtn.addEventListener("click", function () {
  showMore.classList.remove("modal__close");

  dessertBtn.classList.remove("active");
  teaBtn.classList.remove("active");
  coffeeBtn.classList.add("active");
  menuWrapper.innerHTML = "";
  displayMenu("coffee");
});

dessertBtn.addEventListener("click", function () {
  showMore.classList.remove("modal__close");

  teaBtn.classList.remove("active");
  dessertBtn.classList.add("active");
  menuWrapper.innerHTML = "";
  displayMenu("dessert");
  coffeeBtn.classList.remove("active");
});

let closeModal = (
  button: HTMLElement,
  modal: HTMLElement,
  modalWrap: HTMLElement,
) => {
  modalWrap.addEventListener("click", function (e) {
    e.stopPropagation();
  });
  button.addEventListener("click", function () {
    document.querySelector(".body")!.classList.remove("no-scroll");

    modal.classList.add("modal__close");
  });

  modal.addEventListener("click", function () {
    document.querySelector(".body")!.classList.remove("no-scroll");

    modal.classList.add("modal__close");
  });

  document.addEventListener("keydown", function escHandler(e) {
    if (e.key === "Escape") {
      document.querySelector(".body")!.classList.remove("no-scroll");
      modal.classList.add("modal__close");
      document.removeEventListener("keydown", escHandler);
    }
  });
};

displayMenu(typeMenu);
coffeeBtn.classList.add("active");

showMore.addEventListener("click", function () {
  showLoader();
  showMore.classList.add("modal__close");
  displayMenu(typeMenu, true);
});
