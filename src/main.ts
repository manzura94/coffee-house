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
let newdata;

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
};

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

displayMenu(typeMenu);
coffeeBtn.classList.add("active");


showMore.addEventListener("click", function () {
  showLoader()
  showMore.classList.add("modal__close");
  displayMenu(typeMenu, true);
});
