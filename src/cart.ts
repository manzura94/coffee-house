import "./styles/style.scss";

const shoppingCart = document.querySelector<HTMLElement>('.shopping-cart')!;

function isLoggedIn(): boolean {
  return !!localStorage.getItem("token");
}

const isUserLogged = isLoggedIn();
shoppingCart.classList.toggle('hidden', !isUserLogged);