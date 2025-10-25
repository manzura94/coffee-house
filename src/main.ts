import { ICoffee } from "./types/coffee.interface";
import "./styles/style.scss";
import { BackendProduct, MenuProduct, MergedProduct } from "./types/product.inteface";

const menuWrapper = document.querySelector(".menu__wrapper") as HTMLElement;
const wrapper = document.querySelector(".wrapper") as HTMLElement;
let showMore = document.querySelector(".menu__showmore") as HTMLElement;
const coffeeBtn = document.querySelector<HTMLButtonElement>(".coffee")!;
const teaBtn = document.querySelector<HTMLButtonElement>(".tea")!;
const dessertBtn = document.querySelector<HTMLButtonElement>(".dessert")!;
const menuTitle = document.querySelector<HTMLHeadingElement>(".menu__title")!;
const shoppingCart = document.querySelector<HTMLElement>('.shopping-cart')!;

function create<T extends HTMLElement> (tagname: string, classname: string | string[], parent: HTMLElement) {
  let tag = document.createElement(tagname);
  Array.isArray(classname)
    ? tag.classList.add(...classname)
    : tag.classList.add(classname);
  return parent.appendChild(tag);
};

const BASE_URL = "https://6kt29kkeub.execute-api.eu-central-1.amazonaws.com";
const FAVORITES_ENDPOINT = `${BASE_URL}/products`;

function showLoader(){
  menuWrapper.innerHTML='';
  const loader = create<HTMLDivElement>('div', 'menu__loader', menuWrapper);
  loader.innerText = 'Loading...';
  loader.setAttribute('data-loader', 'true')
};

function showError(){
  menuWrapper.innerHTML = '';
  const error = create<HTMLDivElement>('div', 'menu__error', menuWrapper);
  error.innerText = "⚠ Failed to load menu. Try again later.";
}

function isLoggedIn(): boolean {
  return !!localStorage.getItem("token");
}

const isUserLogged = isLoggedIn();
shoppingCart.classList.toggle('hidden', !isUserLogged);

function clearWrapper() {
  menuWrapper.innerHTML = "";
}

async function getAllProducts(): Promise<MergedProduct[]>{
  const [backendRes, menuRes] = await Promise.all([
    fetch(FAVORITES_ENDPOINT),
    fetch('../Menu/data/menu.json')
  ]);

   if (!backendRes.ok || !menuRes.ok) {
     showError()
    }

   const backendJson = await backendRes.json();
    const backendData: BackendProduct[] = backendJson.data;
  const menuData: MenuProduct[] = await menuRes.json();
    
    
    const allProducts =  backendData.map(product => {
    const menuItem = menuData.find(item => item.id === product.id);
    return {
      ...product,
      imageUrl: menuItem?.image ?? null
    };
  });
  
  return allProducts


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
  
  typeMenu = category;
  menuWrapper.innerHTML = "";
  
  const filtered = allProducts.filter(p => p.category === category);
  console.log(filtered);
  
  if (display < 768 && !showBtn ) {
    filtered.length <= 4
      ? showMore.classList.add("modal__close")
      : showMore.classList.remove("modal__close");
        filtered.slice(0, 4).forEach((element) => {
      let item = create("div", "menu__wrapper-item", menuWrapper);
      item.setAttribute("id", `${element.id}`);

      let imageWrap = create("div", "menu__wrapper-image", item);

      let itemImg = create("img", "coffee-image", imageWrap);
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

        let itemImg = create("img", "coffee-image", imageWrap);
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

async function getProductById(id: number): Promise<BackendProduct | null> {
  showLoader()
  try {
    const res = await fetch(`${BASE_URL}/products/${id}`);
    if (!res.ok) return null;

    const json = await res.json();
    console.log(json.data, 'aaaaaa');
    
    return json.data; 
  } catch (error) {
    alert('Something went wrong. Please, try again')
    return null;
  }
}

function showModal(item: HTMLCollectionOf<Element>, data: MergedProduct[]) {
  console.log(data, 'itemmm');
  
  for (let i = 0; i < item.length; i++) {
    let element = item[i];
    element.addEventListener("click", async function () {
      const product = await getProductById(Number(element.id));
      let modal = create("div", "modal", wrapper);
      let modalWrap = create("div", "modal__wrapper", modal);
      let modalImgSide = create("div", "modal__image", modalWrap);
      let modalImgWrap = create("div", "modal__image-wrap", modalImgSide);
      let modalImg = create("img", "modal-image", modalImgWrap);
      modalImg.src = `${product?.imageUrl}`;

      let modalInfo = create("div", "modal__info", modalWrap);
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
      sizeButton.setAttribute("data-price", product.sizes.s["add-price"]);
      let sizeButtonIcon = create("span", "menu__buttons-icon", sizeButton);
      sizeButtonIcon.innerText = "S";
      let sizeButtonText = create("span", "menu__buttons-text", sizeButton);
      sizeButtonText.innerText = product.sizes.s.size;

      let sizeButton1 = create(
        "button",
        ["menu-button", "size_button"],
        sizeButtons,
      );
      let sizeButtonIcon1 = create("span", "menu__buttons-icon", sizeButton1);
      sizeButton1.setAttribute("data-price", product.sizes.m["add-price"]);

      sizeButtonIcon1.innerText = "M";
      let sizeButtonText1 = create("span", "menu__buttons-text", sizeButton1);
      sizeButtonText1.innerText = product.sizes.m.size;

      let sizeButton2 = create(
        "button",
        ["menu-button", "size_button"],
        sizeButtons,
      );
      sizeButton2.setAttribute("data-price", product.sizes.l["add-price"]);

      let sizeButtonIcon2 = create("span", "menu__buttons-icon", sizeButton2);
      sizeButtonIcon2.innerText = "L";
      let sizeButtonText2 = create("span", "menu__buttons-text", sizeButton2);
      sizeButtonText2.innerText = product.sizes.l.size;

      let modalButtonWrap2 = create("div", "modal__buttonwrap", modalInfo);
      let subtitle2 = create("p", "modal__subtitle", modalButtonWrap2);
      subtitle2.innerText = "Additives";
      let addButtons = create("div", "menu__buttons", modalButtonWrap2);

      product.additives.forEach((element, num) => {
        let addButton = create(
          "button",
          ["menu-button", "additives"],
          addButtons,
        );
        addButton.setAttribute("data-price", element["add-price"]);

        let addButtonIcon = create("span", "menu__buttons-icon", addButton);
        addButtonIcon.innerText = `${num + 1}`;
        let addButtonText = create("span", "menu__buttons-text", addButton);
        addButtonText.innerText = element.name;
        addButton.addEventListener("click", function () {
          addButton.classList.toggle("active");
          let value = addButton.getAttribute("data-price");

          let total = price.innerHTML;

          price.innerText = [...addButton.classList].includes("active")
            ? `${Number.parseFloat(Number(total) + Number(value)).toFixed(2)}`
            : `${Number.parseFloat(Number(total) - Number(value)).toFixed(2)}`;
        });
      });

      let priceWrap = create("div", "modal__price", modalInfo);
      let priceTitle = create("h4", "modal__price-title", priceWrap);
      priceTitle.innerText = "Total:";
      let priceNum = create("h4", "modal__price-num", priceWrap);
      let priceSign = create("span", "modal__price-sign", priceNum);
      let price = create("span", "modal__price-price", priceNum);
      priceSign.innerText = "$";
      price.innerText = product!.price;


      let download = create("div", "modal__download", modalInfo);
      let downloadIcon = create("div", "icon-wrap", download);
      let iconImg = create("img", "empty-icon", downloadIcon);
      iconImg.src = `../images/icons/info-empty.svg`;
      let downloadText = create("p", "modal__download-text", download);
      downloadText.innerText =
        "The cost is not final. Download our mobile app to see the final price and place your order. Earn loyalty points and enjoy your favorite coffee with up to 20% discount.";
      let closeBtn = create("button", "modal__closebtn", modalInfo);
      closeBtn.innerText = "Close";

      document.querySelector(".body")!.classList.add("no-scroll");
      let sizButtons = [...document.getElementsByClassName("size_button")];
      sizButtons.forEach((button) => {
        button.addEventListener("click", function () {
          let additives = [...document.getElementsByClassName("additives")];
          additives.forEach((el) => {
            el.classList.remove("active");
          });
          sizButtons.forEach((el) => {
            el.classList.remove("active");
          });
          button.classList.add("active");
          let value = button.getAttribute("data-price");

          price.innerText = `${Number.parseFloat(product!.price + Number(value)).toFixed(2)}`;
        });
      });
      closeModal(closeBtn, modal, modalWrap);
      totalPrice(product!.additives);
    });
  }
};

function totalPrice(buttons) {
  for (let index = 0; index < buttons.length; index++) {
    const element = buttons[index];
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

let closeModal = (button, modal, modalWrap) => {
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
};

displayMenu(typeMenu);
coffeeBtn.classList.add("active");





showMore.addEventListener("click", function () {
  showLoader()
  showMore.classList.add("modal__close");
  displayMenu(typeMenu, true);
});
