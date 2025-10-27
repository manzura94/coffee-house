import "./styles/style.scss";

const shoppingCart = document.querySelector<HTMLElement>(".shopping-cart")!;
const userInfo = JSON.parse(localStorage.getItem("user") || "[]");
const cartWrapper = document.querySelector<HTMLElement>(".cart__wrapper")!;

function isLoggedIn(): boolean {
  return !!localStorage.getItem("token");
}

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

const isUserLogged = isLoggedIn();
const cartItemsNum = document.querySelector(".cart-items")!;
const haveItems = JSON.parse(localStorage.getItem("cart") || "[]");
console.log(userInfo);

if (!!isUserLogged || haveItems.length > 0) {
  shoppingCart.classList.remove("hidden");
  cartItemsNum.innerHTML = haveItems.length > 0 ? `${haveItems.length}`: '';
} else {
  shoppingCart.classList.add("hidden");
}

function displayCarts() {
  const cartWrap = create<HTMLElement>("div", "cart__wrap", cartWrapper);

  haveItems.length &&
    haveItems.map((element) => {
      const cartItemsWrap = create("div", "cart__items", cartWrap);
      const cartItem = create("div", "cart__item", cartItemsWrap);
      const cartLeft = create("div", "cart__items-left", cartItem);
      const cartRight = create("div", "cart__items-right", cartItem);
      const cartLeftIcon = create("div", "cart__items-deleteicon", cartLeft);
      const cartLeftIconImg = create<HTMLImageElement>(
        "img",
        "delete-image",
        cartLeftIcon,
      );
      cartLeftIconImg.src = "/images/icons/trash.svg";
      const cartLeftImgWrap = create("div", "cart__left-image", cartLeft);
      const cartLeftImg = create<HTMLImageElement>(
        "img",
        "cart__left-img",
        cartLeftImgWrap,
      );
      cartLeftImg.src = `${element.imageUrl}`;
      const cartLeftInfo = create("div", "cart__left-info", cartLeft);
      const cartTitle = create("h6", "cart__info-title", cartLeftInfo);
      cartTitle.innerText = `${element.name}`;
      const cartDesc = create("p", "cart__info-description", cartLeftInfo);
      console.log(element);

      cartDesc.innerText = element.size.name;

      if (element.additives.length) {
        element.additives.map((item) => {
          cartDesc.innerText += `, ${item.name}`;
        });
      }

      const cartPrice = create("p", "cart__price", cartRight);
      cartPrice.innerText = `$${element.totalPrice}`;
    });
  const cartInfoWrap = create("div", "cart__info-wrap", cartWrap);

  const total = haveItems.reduce((total, item) => total + item.totalPrice, 0);
  const totalPriceWrap = create("div", "totalprice-wrap", cartInfoWrap);
  const totalTitle = create("p", "totalprice-title", totalPriceWrap);
  totalTitle.innerText = "Total:";
  const totalPrice = create("div", "totalprice", totalPriceWrap);
  totalPrice.innerText = total > 0 ? `$${total}` : "$0.00";

  if (isUserLogged && userInfo.city) {
    const addressWrap = create("div", "address-cont", cartInfoWrap);
    const addressText = create("p", "address-text", addressWrap);
    addressText.innerText = "Address:";
    const addressInfo = create("p", "address-info", addressWrap);
    addressInfo.innerText = `${userInfo.city} ${userInfo.street} ${userInfo.houseNumber}`;

    const payInfoWrap = create("div", "payment-wrap", cartInfoWrap);
    const paymentText = create("p", "address-text", payInfoWrap);
    paymentText.innerText = "Pay by:";
    const paymentInfo = create("p", "address-info", payInfoWrap);
    paymentInfo.innerText = `${userInfo.paymentMethod}`;
  }
  const cartButtonsWrap = create("div", "cart__buttons-wrap", cartWrap);

  if (isUserLogged && haveItems.length > 0) {
    const cartConfirmBtn = create("div", "confirm-btn", cartButtonsWrap);
    cartConfirmBtn.innerText = "Confirm";
  }
  if(!isUserLogged){
     const cartRegBtn = create("div", "confirm-btn", cartButtonsWrap);
    cartRegBtn.innerText = "Register";
     const cartSignBtn = create("div", "confirm-btn", cartButtonsWrap);
    cartSignBtn.innerText = "Sign In";
  }
}

displayCarts();
