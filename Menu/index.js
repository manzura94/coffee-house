const menuWrapper = document.querySelector('.menu__wrapper');
const wrapper = document.querySelector('.wrapper');
let showMore = document.querySelector('.menu__showmore');

const create = (tagname, classname, parent) => {
    let tag = document.createElement(tagname);
    Array.isArray(classname) ? tag.classList.add(...classname) : tag.classList.add(classname);
    return parent.appendChild(tag);
};

// let menuGlobal = [];
let menu = fetch('./data/menu.json')
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        // menuGlobal = data;
        return data;
    });

let typeMenu = 'coffee';
let newdata;

let display = window.innerWidth;
window.addEventListener('resize', function () {
    display = window.innerWidth;
    menuWrapper.innerHTML = '';
    displayMenu(typeMenu);
});

let displayMenu = async function (category, showBtn = false) {
    let newdata = await menu;
    typeMenu = category;
    menuWrapper.innerHTML = '';
    if (display < 768 && showBtn != true) {
        let filterMenu = newdata.filter((item) => item.category === `${category}`);

        filterMenu.length <= 4 ? showMore.classList.add('modal__close') : showMore.classList.remove('modal__close');
        filterMenu.slice(0, 4).forEach((element) => {
            let item = create('div', 'menu__wrapper-item', menuWrapper);
            item.setAttribute('id', element.id);

            let imageWrap = create('div', 'menu__wrapper-image', item);

            let itemImg = create('img', 'coffee-image', imageWrap);
            itemImg.src = `${element.image}`;
            itemImg.setAttribute('alt', `coffee/${element.id}`);

            let itemInfo = create('div', 'menu__wrapper-info', item);

            let subtitle = create('h4', 'menu__wrapper-subtitle', itemInfo);
            subtitle.innerText = element.name;

            let text = create('p', 'menu__wrapper-text', itemInfo);
            text.innerText = element.description;

            let price = create('span', 'menu__wrapper-price', itemInfo);
            price.innerText = `$${element.price}`;
        });
    } else if (showBtn === true || display > 768) {
        newdata
            .filter((item) => item.category === `${category}`)
            .forEach((element) => {
                let item = create('div', 'menu__wrapper-item', menuWrapper);
                item.setAttribute('id', element.id);

                let imageWrap = create('div', 'menu__wrapper-image', item);

                let itemImg = create('img', 'coffee-image', imageWrap);
                itemImg.src = `${element.image}`;
                itemImg.setAttribute('alt', `coffee/${element.id}`);

                let itemInfo = create('div', 'menu__wrapper-info', item);

                let subtitle = create('h4', 'menu__wrapper-subtitle', itemInfo);
                subtitle.innerText = element.name;

                let text = create('p', 'menu__wrapper-text', itemInfo);
                text.innerText = element.description;

                let price = create('span', 'menu__wrapper-price', itemInfo);
                price.innerText = `$${element.price}`;
            });
    }

    let menuItem = document.getElementsByClassName('menu__wrapper-item');
    showModal(menuItem, newdata);
};

function showModal(item, data) {
    for (let i = 0; i < item.length; i++) {
        let element = item[i];
        element.addEventListener('click', function () {
            const product = data.find((el) => el.id == element.id);
            let modal = create('div', 'modal', wrapper);
            let modalWrap = create('div', 'modal__wrapper', modal);
            let modalImgSide = create('div', 'modal__image', modalWrap);
            let modalImgWrap = create('div', 'modal__image-wrap', modalImgSide);
            let modalImg = create('img', 'modal-image', modalImgWrap);
            modalImg.src = `${product.image}`;

            let modalInfo = create('div', 'modal__info', modalWrap);
            let modalTextWrap = create('div', 'modal__textwrap', modalInfo);
            let title = create('h4', 'modal__title', modalTextWrap);
            title.innerText = product.name;
            let text = create('p', 'modal__text', modalTextWrap);
            text.innerText = product.description;

            let modalButtonWrap = create('div', 'modal__buttonwrap', modalInfo);
            let subtitle = create('p', 'modal__subtitle', modalButtonWrap);
            subtitle.innerText = 'Size';
            let sizeButtons = create('div', 'menu__buttons', modalButtonWrap);

            let sizeButton = create('button', ['menu-button', 'active', 'size_button'], sizeButtons);
            sizeButton.setAttribute('data-price', product.sizes.s['add-price']);
            let sizeButtonIcon = create('span', 'menu__buttons-icon', sizeButton);
            sizeButtonIcon.innerText = 'S';
            let sizeButtonText = create('span', 'menu__buttons-text', sizeButton);
            sizeButtonText.innerText = product.sizes.s.size;

            let sizeButton1 = create('button', ['menu-button', 'size_button'], sizeButtons);
            let sizeButtonIcon1 = create('span', 'menu__buttons-icon', sizeButton1);
            sizeButton1.setAttribute('data-price', product.sizes.m['add-price']);

            sizeButtonIcon1.innerText = 'M';
            let sizeButtonText1 = create('span', 'menu__buttons-text', sizeButton1);
            sizeButtonText1.innerText = product.sizes.m.size;

            let sizeButton2 = create('button', ['menu-button', 'size_button'], sizeButtons);
            sizeButton2.setAttribute('data-price', product.sizes.l['add-price']);

            let sizeButtonIcon2 = create('span', 'menu__buttons-icon', sizeButton2);
            sizeButtonIcon2.innerText = 'L';
            let sizeButtonText2 = create('span', 'menu__buttons-text', sizeButton2);
            sizeButtonText2.innerText = product.sizes.l.size;

            let modalButtonWrap2 = create('div', 'modal__buttonwrap', modalInfo);
            let subtitle2 = create('p', 'modal__subtitle', modalButtonWrap2);
            subtitle2.innerText = 'Additives';
            let addButtons = create('div', 'menu__buttons', modalButtonWrap2);

            product.additives.forEach((element, num) => {
                let addButton = create('button', ['menu-button', 'additives'], addButtons);
                addButton.setAttribute('data-price', element['add-price']);

                let addButtonIcon = create('span', 'menu__buttons-icon', addButton);
                addButtonIcon.innerText = `${num + 1}`;
                let addButtonText = create('span', 'menu__buttons-text', addButton);
                addButtonText.innerText = element.name;
                addButton.addEventListener('click', function () {
                    addButton.classList.toggle('active');
                    let value = addButton.getAttribute('data-price');

                    let total = price.innerHTML;

                    price.innerText = [...addButton.classList].includes('active')
                        ? `${Number.parseFloat(Number(total) + Number(value)).toFixed(2)}`
                        : `${Number.parseFloat(Number(total) - Number(value)).toFixed(2)}`;
                });
            });

            let priceWrap = create('div', 'modal__price', modalInfo);
            let priceTitle = create('h4', 'modal__price-title', priceWrap);
            priceTitle.innerText = 'Total:';
            let priceNum = create('h4', 'modal__price-num', priceWrap);
            let priceSign = create('span', 'modal__price-sign', priceNum);
            let price = create('span', 'modal__price-price', priceNum);
            priceSign.innerText = '$';
            price.innerText = product.price;

            // priceNum.innerText = `${product.price}`;

            let download = create('div', 'modal__download', modalInfo);
            let downloadIcon = create('div', 'icon-wrap', download);
            let iconImg = create('img', 'empty-icon', downloadIcon);
            iconImg.src = `../images/icons/info-empty.svg`;
            let downloadText = create('p', 'modal__download-text', download);
            downloadText.innerText =
                'The cost is not final. Download our mobile app to see the final price and place your order. Earn loyalty points and enjoy your favorite coffee with up to 20% discount.';
            let closeBtn = create('button', 'modal__closebtn', modalInfo);
            closeBtn.innerText = 'Close';

            document.querySelector('.body').classList.add('no-scroll');
            let sizButtons = [...document.getElementsByClassName('size_button')];
            sizButtons.forEach((button) => {
                button.addEventListener('click', function () {
                    let additives = [...document.getElementsByClassName('additives')];
                    additives.forEach((el) => {
                        el.classList.remove('active');
                    });
                    sizButtons.forEach((el) => {
                        el.classList.remove('active');
                    });
                    button.classList.add('active');
                    let value = button.getAttribute('data-price');

                    price.innerText = `${Number.parseFloat(Number(product.price) + Number(value)).toFixed(2)}`;
                });
            });
            closeModal(closeBtn, modal, modalWrap);
            totalPrice(product.additives);
        });
    }
}

let teaMenu = document.querySelector('.tea');
let coffeeMenu = document.querySelector('.coffee');
let dessertMenu = document.querySelector('.dessert');

function totalPrice(buttons) {
    for (let index = 0; index < buttons.length; index++) {
        const element = buttons[index];
    }
}

let closeModal = (button, modal, modalWrap) => {
    modalWrap.addEventListener('click', function (e) {
        e.stopPropagation();
    });
    button.addEventListener('click', function () {
        document.querySelector('.body').classList.remove('no-scroll');

        modal.classList.add('modal__close');
    });

    modal.addEventListener('click', function () {
        document.querySelector('.body').classList.remove('no-scroll');

        modal.classList.add('modal__close');
    });
};

teaMenu.addEventListener('click', function () {
    showMore.classList.remove('modal__close');

    dessertMenu.classList.remove('active');
    teaMenu.classList.add('active');
    menuWrapper.innerHTML = '';
    displayMenu('tea');
    coffeeMenu.classList.remove('active');
});

coffeeMenu.addEventListener('click', function () {
    showMore.classList.remove('modal__close');

    dessertMenu.classList.remove('active');
    teaMenu.classList.remove('active');
    coffeeMenu.classList.add('active');
    menuWrapper.innerHTML = '';
    displayMenu('coffee');
});

dessertMenu.addEventListener('click', function () {
    showMore.classList.remove('modal__close');

    teaMenu.classList.remove('active');
    dessertMenu.classList.add('active');
    menuWrapper.innerHTML = '';
    displayMenu('dessert');
    coffeeMenu.classList.remove('active');
});

displayMenu('coffee');
coffeeMenu.classList.add('active');

// let showMore = document.querySelector('.menu__showmore');

showMore.addEventListener('click', function () {
    showMore.classList.add('modal__close');
    displayMenu(typeMenu, (showBtn = true));
});
