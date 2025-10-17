import { ICoffee } from "./types/coffee.interface";

const burgerButton = document.querySelector('.header__burger-button') as HTMLElement;
const lineButton = document.querySelector('.line') as HTMLElement;
const burgerMenu = document.querySelector('.header__menu') as HTMLElement;
const body = document.querySelector('.wrapper') as HTMLElement;
const links = document.getElementsByClassName('header__menu-item');

const imageList = document.querySelector('.favourite__slideshow') as HTMLElement;
const scrollbarThumb = document.querySelector('.scrollbar-thumb') as HTMLElement;
const sliderScrollbar = document.querySelector('.slider-scrollbar') as HTMLElement;

let slideIndex = 1;
let timer: number | null = null;

const BASE_URL = 'https://6kt29kkeub.execute-api.eu-central-1.amazonaws.com/';
const FAVORITES_ENDPOINT = `${BASE_URL}/products/favorites`;

const showLoader =()=>{
    if(imageList){
        imageList.innerHTML = `<div class="loader">Loading...</div>`;
    }
}

const showError = () =>{
     if (imageList) {
    imageList.innerHTML = `<p class="error">Something went wrong. Please, refresh the page</p>`;
  }
}

// async function fetchFavoriteCoffees(): Promise<ICoffee[]>{
// try{
//     showLoader();
//     const res = await fetch(FAVORITES_ENDPOINT);
//     if (!res.ok) throw new Error('Network error');
//      const data: ICoffee[] = await res.json();
//      console.log(data);
     
//     return data.slice(0, 3);
// } catch{
//      showError();
//     throw new Error('Failed to fetch favorites');
// }
// }

fetch(`${BASE_URL}/products/favorites`)
  .then(res => res.json())
  .then(data => console.log('Data received:', data))
  .catch(err => console.error('Error fetching data:', err));

