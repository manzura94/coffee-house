const menuWrapper = document.querySelector(".menu__wrapper");
const wrapper = document.querySelector(".wrapper");

const create = (tagname, classname, parent) => {
  let tag = document.createElement(tagname);
  tag.classList.add(classname);
  return parent.appendChild(tag);
};

// let menuGlobal = [];
let menu = fetch("./data/menu.json")
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    // menuGlobal = data;
    return data;
  });

let displayMenu = async function (category) {
  let newdata = await menu;
  newdata
    .filter((item) => item.category === `${category}`)
    .slice(0, 4)
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

  let menuItem = document.getElementsByClassName("menu__wrapper-item");
  showModal(menuItem, newdata);
};

function showModal(item, data) {
  for (let i = 0; i < item.length; i++) {
    let element = item[i];
    element.addEventListener("click", function () {
      const product = data.find((el) => el.id == element.id);
      let modal = create("div", "modal", wrapper);
      let modalWrap = create("div", "modal__wrapper", modal);
      let modalImgWrap = create("div", "modal__image", modalWrap);
      let modalImg = create("img", "modal-image", modalImgWrap);
      modalImg.src = `${product.image}`;

      let modalInfo = create("div", "modal__info", modalWrap);
      let modalTextWrap = create("div", "modal__textwrap", modalInfo);
      let title = create("h4", "modal__title", modalTextWrap);
      title.innerText = product.name;
      let text = create("p", "modal__text", modalTextWrap);
      text.innerText = product.description;

      let modalButtonWrap = create("div", "modal__buttonwrap", modalInfo);
      let subtitle = create("p", "modal__subtitle", modalButtonWrap);
      subtitle.innerText = "Size";
      let sizeButtons = create("div", "menu__buttons", modalButtonWrap);
      let sizeButton = create("button", "menu-button", sizeButtons);
      let sizeButtonIcon = create("span", "menu__buttons-icon", sizeButton);
      sizeButtonIcon.innerText = "S";
      let sizeButtonText = create("span", "menu__buttons-text", sizeButton);
      sizeButtonText.innerText = product.sizes.s.size;

      let sizeButton1 = create("button", "menu-button", sizeButtons);
      let sizeButtonIcon1 = create("span", "menu__buttons-icon", sizeButton1);
      sizeButtonIcon1.innerText = "M";
      let sizeButtonText1 = create("span", "menu__buttons-text", sizeButton1);
      sizeButtonText1.innerText = product.sizes.m.size;

      let sizeButton2 = create("button", "menu-button", sizeButtons);
      let sizeButtonIcon2 = create("span", "menu__buttons-icon", sizeButton2);
      sizeButtonIcon2.innerText = "L";
      let sizeButtonText2 = create("span", "menu__buttons-text", sizeButton2);
      sizeButtonText2.innerText = product.sizes.l.size;

      let modalButtonWrap2 = create("div", "modal__buttonwrap", modalInfo);
      let subtitle2 = create("p", "modal__subtitle", modalButtonWrap2);
      subtitle2.innerText = "Additives";
      let addButtons = create("div", "menu__buttons", modalButtonWrap2);

      product.additives.forEach((element, num) => {
        let addButton = create("button", "menu-button", addButtons);
        let addButtonIcon = create("span", "menu__buttons-icon", addButton);
        addButtonIcon.innerText = `${num + 1}`;
        let addButtonText = create("span", "menu__buttons-text", addButton);
        addButtonText.innerText = element.name;
      });

      document.querySelector(".body").classList.add("no-scroll");

    });
  }
}

let teaMenu = document.querySelector(".tea");
let coffeeMenu = document.querySelector(".coffee");
let dessertMenu = document.querySelector(".dessert");

teaMenu.addEventListener("click", function () {
  dessertMenu.classList.remove("active");
  teaMenu.classList.add("active");
  menuWrapper.innerHTML = "";
  displayMenu("tea");
  coffeeMenu.classList.remove("active");
});

coffeeMenu.addEventListener("click", function () {
  dessertMenu.classList.remove("active");
  teaMenu.classList.remove("active");
  coffeeMenu.classList.add("active");
  menuWrapper.innerHTML = "";
  displayMenu("coffee");
});

dessertMenu.addEventListener("click", function () {
  teaMenu.classList.remove("active");
  dessertMenu.classList.add("active");
  menuWrapper.innerHTML = "";
  displayMenu("dessert");
  coffeeMenu.classList.remove("active");
});

displayMenu("coffee");
coffeeMenu.classList.add("active");
