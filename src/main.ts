import { ICoffee } from "./types/coffee.interface";

const menuWrapper = document.querySelector(".menu__wrapper") as HTMLElement;
const wrapper = document.querySelector(".wrapper") as HTMLElement;
let showMore = document.querySelector(".menu__showmore") as HTMLElement;

const create = (tagname, classname, parent) => {
  let tag = document.createElement(tagname);
  Array.isArray(classname)
    ? tag.classList.add(...classname)
    : tag.classList.add(classname);
  return parent.appendChild(tag);
};

const BASE_URL = "https://6kt29kkeub.execute-api.eu-central-1.amazonaws.com";
const FAVORITES_ENDPOINT = `${BASE_URL}/products`;

let menu = fetch(FAVORITES_ENDPOINT)
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    return data;
  });

let typeMenu = "coffee";
let newdata;

let display = window.innerWidth;
window.addEventListener("resize", function () {
  display = window.innerWidth;
  menuWrapper.innerHTML = "";
  displayMenu(typeMenu);
});

let displayMenu = async function (category: string, showBtn = false) {
  let newdata = await menu;
  typeMenu = category;
  menuWrapper.innerHTML = "";
  if (display < 768 && showBtn != true) {
    let filterMenu = newdata.filter(
      (item: ICoffee) => item.category === `${category}`,
    );
    filterMenu.length <= 4
      ? showMore.classList.add("modal__close")
      : showMore.classList.remove("modal__close");
  }
  console.log(newdata);
};

displayMenu(typeMenu);
