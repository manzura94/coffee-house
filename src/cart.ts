import "./styles/style.scss";
import { UserInfo } from "./types/auth.interface";
import { CartItem } from "./types/cart.interface";

document.addEventListener("DOMContentLoaded", () => {
  const shoppingCart = document.querySelector<HTMLElement>(".shopping-cart")!;
  const cartWrapper = document.querySelector<HTMLElement>(".cart__wrapper")!;
  const cartItemsNum = document.querySelector<HTMLElement>(".cart-items")!;

  const BASE_URL = "https://6kt29kkeub.execute-api.eu-central-1.amazonaws.com";

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
    console.log(haveItems);
    

    if (haveItems.length === 0) {
      const empty = create<HTMLParagraphElement>("p", "cart-empty", cartWrap);
      empty.innerText = "Your cart is empty.";
    } else {
      haveItems.forEach((element) => {
        const cartItemsWrap = create<HTMLDivElement>(
          "div",
          "cart__items",
          cartWrap,
        );
        const cartItem = create<HTMLDivElement>(
          "div",
          "cart__item",
          cartItemsWrap,
        );
        const cartLeft = create<HTMLDivElement>(
          "div",
          "cart__items-left",
          cartItem,
        );
        const cartRight = create<HTMLDivElement>(
          "div",
          "cart__items-right",
          cartItem,
        );

        const cartLeftIcon = create<HTMLDivElement>(
          "div",
          "cart__items-deleteicon",
          cartLeft,
        );
        cartLeftIcon.setAttribute("data-id", String(element.id));

        const cartLeftIconImg = create<HTMLImageElement>(
          "img",
          "delete-image",
          cartLeftIcon,
        );
        cartLeftIconImg.src = "/images/icons/trash.svg";
        cartLeftIconImg.alt = "delete";

        const cartLeftImgWrap = create<HTMLDivElement>(
          "div",
          "cart__left-image",
          cartLeft,
        );
        const cartLeftImg = create<HTMLImageElement>(
          "img",
          "cart__left-img",
          cartLeftImgWrap,
        );
        cartLeftImg.src = element.imageUrl;
        cartLeftImg.alt = element.name;

        const cartLeftInfo = create<HTMLDivElement>(
          "div",
          "cart__left-info",
          cartLeft,
        );
        const cartTitle = create<HTMLHeadingElement>(
          "h6",
          "cart__info-title",
          cartLeftInfo,
        );
        cartTitle.innerText = element.name;

        const cartDesc = create<HTMLParagraphElement>(
          "p",
          "cart__info-description",
          cartLeftInfo,
        );
        const parts: string[] = [];
        if (element.size?.name) parts.push(element.size.name);
        if (Array.isArray(element.additives) && element.additives.length) {
          parts.push(...element.additives.map((a) => a.name));
        }
        cartDesc.innerText = parts.join(", ");


        const cartPrice = create<HTMLParagraphElement>(
          "p",
          "cart__price",
          cartRight,
        );

        const actual = Number( element.totalPrice ?? 0);
      const discounted = Number(element.discountedTotal ?? actual);
       if (discounted < actual) {
        const oldPrice = create<HTMLParagraphElement>("p", ["cart__price", "old-price"], cartPrice);
        oldPrice.innerText = `$${actual.toFixed(2)}`;
        const newPrice = create<HTMLParagraphElement>("p", ["cart__price", "new-price"], cartPrice);
        newPrice.innerText = `$${discounted.toFixed(2)}`;
      } else {
        const onlyPrice = create<HTMLParagraphElement>("p", "cart__price", cartPrice);
        onlyPrice.innerText = `$${actual.toFixed(2)}`;
      }
      });
    }

    const cartInfoWrap = create<HTMLDivElement>(
      "div",
      "cart__info-wrap",
      cartWrap,
    );
    const totalActual = haveItems.reduce((acc, item) => acc + Number(item.totalPrice ?? 0), 0);
  const totalDiscounted = haveItems.reduce((acc, item) => acc + Number(item.discountedTotal ??  item.totalPrice ?? 0), 0);
    const totalPriceWrap = create<HTMLDivElement>(
      "div",
      "totalprice-wrap",
      cartInfoWrap,
    );

    const totalTitle = create<HTMLParagraphElement>(
      "p",
      "totalprice-title",
      totalPriceWrap,
    );
    totalTitle.innerText = "Total:";

    const totalPrice = create<HTMLDivElement>(
      "div",
      "totalprice",
      totalPriceWrap,
    );
      if (totalDiscounted < totalActual) {
    totalPrice.innerHTML = `
      <span class="old-price">$${totalActual.toFixed(2)}</span>
      <span class="new-price">$${totalDiscounted.toFixed(2)}</span>
    `;
  } else {
    totalPrice.innerText = `$${totalActual.toFixed(2)}`;
  }

    if (
      isLoggedIn() &&
      userInfo &&
      (userInfo.city || userInfo.street || userInfo.houseNumber)
    ) {
      const addressWrap = create<HTMLDivElement>(
        "div",
        "address-cont",
        cartInfoWrap,
      );
      const addressText = create<HTMLParagraphElement>(
        "p",
        "address-text",
        addressWrap,
      );
      addressText.innerText = "Address:";

      const addressInfo = create<HTMLParagraphElement>(
        "p",
        "address-info",
        addressWrap,
      );
      addressInfo.innerText =
        `${userInfo.city ?? ""} ${userInfo.street ?? ""} ${userInfo.houseNumber ?? ""}`.trim();

      const payInfoWrap = create<HTMLDivElement>(
        "div",
        "payment-wrap",
        cartInfoWrap,
      );
      const paymentText = create<HTMLParagraphElement>(
        "p",
        "address-text",
        payInfoWrap,
      );
      paymentText.innerText = "Pay by:";

      const paymentInfo = create<HTMLParagraphElement>(
        "p",
        "address-info",
        payInfoWrap,
      );
      paymentInfo.innerText = `${userInfo.paymentMethod ?? "—"}`;
    }

    const cartButtonsWrap = create<HTMLDivElement>(
      "div",
      "cart__buttons-wrap",
      cartWrap,
    );

    if (isLoggedIn() && haveItems.length > 0) {
      const cartConfirmBtn = create<HTMLDivElement>(
        "div",
        ["confirm", "confirm-btn"],
        cartButtonsWrap,
      );
      cartConfirmBtn.innerText = "Confirm";
      cartConfirmBtn.addEventListener("click", async () => {
        const cart = getCart();
        if (cart.length === 0) return;

        const items = cart.map((item) => ({
          productId: item.id,
          size: item.size?.name ?? "",
          additives: Array.isArray(item.additives)
            ? item.additives.map((a) => a.name)
            : [],
          quantity: item.quantity ?? 1,
        }));

        const totalPrice = cart.reduce(
          (acc, item) => acc + Number(item.totalPrice ?? 0),
          0,
        );

        const body = {
          items,
          totalPrice: Number(totalPrice.toFixed(2)),
        };
        const loader = document.createElement("div");
        loader.classList.add("loader-overlay");
        loader.innerHTML = `
    <div class="loader"></div>
  `;

        document.body.appendChild(loader);

        try {
          await new Promise((resolve) => setTimeout(resolve, 3000));

          const response = await fetch(`${BASE_URL}/orders/confirm`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(body),
          });

          if (!response.ok) {
            throw new Error("Order failed");
          }

          const data = await response.json();
          console.log("Order placed:", data);

          loader.remove();

          localStorage.removeItem("cart");
          updateCartCount();
          updateShoppingCartVisibility();
          displayCarts();

          showNotification(
            "Thank you for your order! Our manager will contact you shortly.",
            "success",
          );
        } catch (error) {
          loader.remove();
          showNotification("Something went wrong. Please, try again.", "error");
        }
      });
    } else if (!isLoggedIn()) {
      const cartRegBtn = create<HTMLDivElement>(
        "div",
        ["registerbtn", "confirm-btn"],
        cartButtonsWrap,
      );
      cartRegBtn.innerText = "Register";
      cartRegBtn.addEventListener("click", () => {
        window.location.href = "/register.html";
      });

      const cartSignBtn = create<HTMLDivElement>(
        "div",
        ["signin", "confirm-btn"],
        cartButtonsWrap,
      );
      cartSignBtn.innerText = "Sign In";
      cartSignBtn.addEventListener("click", () => {
        window.location.href = "/signin.html";
      });
    }
  }

  cartWrapper.addEventListener("click", (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const deleteIcon = target.closest(
      ".cart__items-deleteicon",
    ) as HTMLElement | null;
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

  function showNotification(message: string, type: "success" | "error"): void {
    const existing = document.querySelector(".notification");
    if (existing) existing.remove();

    const notification = document.createElement("div");
    notification.classList.add("notification", type);
    notification.innerText = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("show");
    }, 50);

    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }

  updateShoppingCartVisibility();
  displayCarts();
});
