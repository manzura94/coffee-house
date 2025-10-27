import "./styles/style.scss";

const shoppingCart = document.querySelector<HTMLElement>(".shopping-cart")!;
const userInfo = JSON.parse(localStorage.getItem("user") || "[]");
const cartWrapper = document.querySelector<HTMLElement>('.cart__wrapper')!;

function isLoggedIn(): boolean {
  return !!localStorage.getItem("token");
};

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
const cartItemsNum = document.querySelector('.cart-items')!;
const haveItems = JSON.parse(localStorage.getItem("cart") || "[]");

if(isUserLogged || haveItems.length){
  shoppingCart.classList.remove('hidden');
   cartItemsNum.innerHTML = `${haveItems.length}`
}else{
  shoppingCart.classList.add('hidden')

}

haveItems.map((element)=>{
   const cartWrap = create<HTMLElement>('div', 'cart__wrap', cartWrapper);
   const cartItemsWrap = create('div', 'cart__items', cartWrap);
   const cartInfoWrap = create('div', 'cart__info-wrap', cartWrap);
   const cartButtonsWrap = create('div', 'cart__buttons-wrap', cartWrap);
   const cartItem = create('div', 'cart__item', cartItemsWrap);
   const cartLeft = create('div', 'cart__items-left', cartItem);
   const cartRight = create('div', 'cart__items-right', cartItem);
   const cartLeftIcon = create('div', 'cart__items-deleteicon', cartLeft);
   const cartLeftIconImg = create<HTMLImageElement>('img', 'delete-image', cartLeftIcon);
   cartLeftIconImg.src = '/images/icons/trash.svg';
   const cartLeftImgWrap = create('div', 'cart__left-image', cartLeft);
   const cartLeftImg = create<HTMLImageElement>('img', 'cart__left-img', cartLeftImgWrap);
   cartLeftImg.src = `${element.imageUrl}`;
   const cartLeftInfo = create('div', 'cart__left-info', cartLeft)
   const cartTitle = create('h6', 'cart__title', cartLeftInfo);
   cartTitle.innerText = `${element.name}`;
   const cartDesc = create('p', 'cart__description', cartLeftInfo);
   console.log(element);
   
   cartDesc.innerText = element.size.name

   if(element.additives.length){
    element.additives.map(item=>{

        cartDesc.innerText +=  `, ${item.name}`
    })
   };

   const cartPrice = create('p', 'cart__price', cartRight);
   cartPrice.innerText = `$${element.totalPrice}`
})
