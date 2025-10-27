import "./styles/style.scss";
import { UserInfo } from "./types/auth.interface";
import { CartItem } from "./types/cart.interface";

document.addEventListener("DOMContentLoaded", () => {
  const shoppingCart = document.querySelector<HTMLElement>(".shopping-cart")!;
  const cartWrapper = document.querySelector<HTMLElement>(".cart__wrapper")!;
  const cartItemsNum = document.querySelector<HTMLElement>(".cart-items")!;






  function parseJSON<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch (e) {
      console.error(`Failed to parse localStorage.${key}`, e);
      return fallback;
    }
  }

  const userInfo = parseJSON<UserInfo | null>("user", null);
  const token = localStorage.getItem("token");

  function isLoggedIn(): boolean {
    return Boolean(token);
  }

  function create<T extends HTMLElement>(
    tagname: keyof HTMLElementTagNameMap,
    classname: string | string[],
    parent: HTMLElement,
  ): T {
    const tag = document.createElement(tagname) as T;
    if (Array.isArray(classname)) {
      tag.classList.add(...classname);
    } else {
      tag.classList.add(classname);
    }
    parent.appendChild(tag);
    return tag;
  }

  function getCart(): CartItem[] {
    return parseJSON<CartItem[]>("cart", []);
  }


  function updateShoppingCartVisibility(): void {
    const items = getCart();
    if (isLoggedIn() || items.length > 0) {
      shoppingCart.classList.remove("hidden");
      cartItemsNum.innerText = items.length > 0 ? String(items.length) : "";
    } else {
      shoppingCart.classList.add("hidden");
      cartItemsNum.innerText = "";
    }
  }

  function updateCartCount(): void {
    const cart = getCart();
    cartItemsNum.innerText = cart.length > 0 ? String(cart.length) : "";
  }


  function displayCarts(): void {
    cartWrapper.innerHTML = "";
    const haveItems = getCart();
    const cartWrap = create<HTMLDivElement>("div", "cart__wrap", cartWrapper);

    if (haveItems.length === 0) {
      const empty = create<HTMLParagraphElement>("p", "cart-empty", cartWrap);
      empty.innerText = "Your cart is empty.";
    } else {
      haveItems.forEach((element) => {
        const cartItemsWrap = create<HTMLDivElement>("div", "cart__items", cartWrap);
        const cartItem = create<HTMLDivElement>("div", "cart__item", cartItemsWrap);
        const cartLeft = create<HTMLDivElement>("div", "cart__items-left", cartItem);
        const cartRight = create<HTMLDivElement>("div", "cart__items-right", cartItem);

        const cartLeftIcon = create<HTMLDivElement>("div", "cart__items-deleteicon", cartLeft);
        cartLeftIcon.setAttribute("data-id", String(element.id));

        const cartLeftIconImg = create<HTMLImageElement>("img", "delete-image", cartLeftIcon);
        cartLeftIconImg.src = "/images/icons/trash.svg";
        cartLeftIconImg.alt = "delete";

        const cartLeftImgWrap = create<HTMLDivElement>("div", "cart__left-image", cartLeft);
        const cartLeftImg = create<HTMLImageElement>("img", "cart__left-img", cartLeftImgWrap);
        cartLeftImg.src = element.imageUrl;
        cartLeftImg.alt = element.name;

        const cartLeftInfo = create<HTMLDivElement>("div", "cart__left-info", cartLeft);
        const cartTitle = create<HTMLHeadingElement>("h6", "cart__info-title", cartLeftInfo);
        cartTitle.innerText = element.name;

        const cartDesc = create<HTMLParagraphElement>("p", "cart__info-description", cartLeftInfo);
        const parts: string[] = [];
        if (element.size?.name) parts.push(element.size.name);
        if (Array.isArray(element.additives) && element.additives.length) {
          parts.push(...element.additives.map((a) => a.name));
        }
        cartDesc.innerText = parts.join(", ");

        const cartPrice = create<HTMLParagraphElement>("p", "cart__price", cartRight);
        cartPrice.innerText = `$${Number(element.totalPrice ?? 0).toFixed(2)}`;
      });
    }

    const cartInfoWrap = create<HTMLDivElement>("div", "cart__info-wrap", cartWrap);
    const total = haveItems.reduce((acc, item) => acc + Number(item.totalPrice ?? 0), 0);
    const totalPriceWrap = create<HTMLDivElement>("div", "totalprice-wrap", cartInfoWrap);

    const totalTitle = create<HTMLParagraphElement>("p", "totalprice-title", totalPriceWrap);
    totalTitle.innerText = "Total:";

    const totalPrice = create<HTMLDivElement>("div", "totalprice", totalPriceWrap);
    totalPrice.innerText = total > 0 ? `$${total.toFixed(2)}` : "$0.00";

    if (isLoggedIn() && userInfo && (userInfo.city || userInfo.street || userInfo.houseNumber)) {
      const addressWrap = create<HTMLDivElement>("div", "address-cont", cartInfoWrap);
      const addressText = create<HTMLParagraphElement>("p", "address-text", addressWrap);
      addressText.innerText = "Address:";

      const addressInfo = create<HTMLParagraphElement>("p", "address-info", addressWrap);
      addressInfo.innerText = `${userInfo.city ?? ""} ${userInfo.street ?? ""} ${userInfo.houseNumber ?? ""}`.trim();

      const payInfoWrap = create<HTMLDivElement>("div", "payment-wrap", cartInfoWrap);
      const paymentText = create<HTMLParagraphElement>("p", "address-text", payInfoWrap);
      paymentText.innerText = "Pay by:";

      const paymentInfo = create<HTMLParagraphElement>("p", "address-info", payInfoWrap);
      paymentInfo.innerText = `${userInfo.paymentMethod ?? "—"}`;
    }

    const cartButtonsWrap = create<HTMLDivElement>("div", "cart__buttons-wrap", cartWrap);

    if (isLoggedIn() && haveItems.length > 0) {
      const cartConfirmBtn = create<HTMLDivElement>("div", ["confirm", "confirm-btn"], cartButtonsWrap);
      cartConfirmBtn.innerText = "Confirm";
      cartConfirmBtn.addEventListener("click", () => {
        console.log("Confirm clicked");
      });
    } else if (!isLoggedIn()) {
      const cartRegBtn = create<HTMLDivElement>("div", ["registerbtn", "confirm-btn"], cartButtonsWrap);
      cartRegBtn.innerText = "Register";
      cartRegBtn.addEventListener("click", () => {
        window.location.href = "/register";
      });

      const cartSignBtn = create<HTMLDivElement>("div", ["signin", "confirm-btn"], cartButtonsWrap);
      cartSignBtn.innerText = "Sign In";
      cartSignBtn.addEventListener("click", () => {
        window.location.href = "/signin";
      });
    }
  }


  cartWrapper.addEventListener("click", (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const deleteIcon = target.closest(".cart__items-deleteicon") as HTMLElement | null;
    if (!deleteIcon) return;

    const itemId = deleteIcon.getAttribute("data-id");
    if (!itemId) return;

    let cart = getCart();
    cart = cart.filter((item) => String(item.id) !== itemId);
    localStorage.setItem("cart", JSON.stringify(cart));

    displayCarts();
    updateCartCount();
    updateShoppingCartVisibility();
  });


  updateShoppingCartVisibility();
  displayCarts();
});
