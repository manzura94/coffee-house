const menuWrapper = document.querySelector(".menu__wrapper");

const create = (tagname, classname, parent) => {
  let tag = document.createElement(tagname);
  tag.classList.add(classname);
  return parent.appendChild(tag);
};

let menuGlobal = [];
let menu = fetch("./data/menu.json")
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    menuGlobal = data;
    return data;
  });

let newdata;

let displayMenu = async function (category) {
  newdata = await menu;
  newdata
    .filter((item) => item.category === `${category}`)
    .forEach((element) => {
      let item = create("div", "menu__wrapper-item", menuWrapper);
      item.setAttribute("id", element.id);

      let imageWrap = create("div", "menu__wrapper-image", item);

      let itemImg = create("img", "coffee-image", imageWrap);
      itemImg.src = `${element.image}`;
      itemImg.setAttribute("alt", `coffee/${element.id}`);

      let itemInfo = create("div", "menu__wrapper-info", item);

      let subtitle = create("h4", "menu__wrapper-subtitle", itemInfo);
      subtitle.innerText = element.name;

      let text = create("p", "menu__wrapper-text", itemInfo);
      text.innerText = element.description;

      let price = create("span", "menu__wrapper-price", itemInfo);
      price.innerText = `$${element.price}`;
    });
};

let teaMenu = document.querySelector(".tea");
let coffeeMenu = document.querySelector(".coffee");
let dessertMenu = document.querySelector(".dessert");

teaMenu.addEventListener("click", function () {

  displayMenu("tea");
});

coffeeMenu.addEventListener("click", function () {

  displayMenu("coffee");
});
