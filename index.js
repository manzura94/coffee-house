const burgerButton = document.querySelector('.header__burger-button');
const lineButton = document.querySelector('.line');
const burgerMenu = document.querySelector('.header__menu');
const body = document.querySelector('.wrapper');
const links = document.getElementsByClassName('header__menu-item');

burgerButton.addEventListener('click', function () {
    if (lineButton.classList.contains('active-menu')) {
        lineButton.classList.remove('active-menu');
    } else {
        lineButton.classList.add('active-menu');
    }

    if (burgerMenu.classList.contains('showMenu')) {
        burgerMenu.classList.remove('showMenu');
    } else {
        burgerMenu.classList.add('showMenu');
    }

    if (body.classList.contains('no-scroll')) {
        body.classList.remove('no-scroll');
    } else {
        body.classList.add('no-scroll');
    }
});

for (let index = 0; index < links.length; index++) {
    const element = links[index];

    element.addEventListener('click', function () {
        lineButton.classList.remove('active-menu');
        burgerMenu.classList.remove('showMenu');
        body.classList.remove('no-scroll');
    });
}

// Slide
const imageList = document.querySelector('.favourite__slideshow');
const scrollbarThumb = document.querySelector('.scrollbar-thumb');
const sliderScrollbar = document.querySelector('.slider-scrollbar');

const maxScrollLeft = imageList.scrollWidth - imageList.clientWidth;
const screenWidth = window.innerWidth;
let slideIndex = 1;

function plusSlides(n) {
    showSlides((slideIndex += n));
}

function currentSlide(n) {
    showSlides((slideIndex = n));
}

const updateScrollThumbPosition = () => {
    console.log('hello');
    const scrollPosition = imageList.scrollLeft;
    const thumbPosition = (scrollPosition / maxScrollLeft) * (sliderScrollbar.clientWidth - scrollbarThumb.offsetWidth);
    scrollbarThumb.style.left = `${thumbPosition}px`;
};

imageList.addEventListener('scroll', () => {
    updateScrollThumbPosition();
});

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName('favourite__slides');
    let dots = document.getElementsByClassName('dot');

    if (n > slides.length) {
        slideIndex = 1;
    }
    if (n < 1) {
        slideIndex = slides.length;
    }
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = 'none';
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(' active', '');
    }
    slides[slideIndex - 1].style.display = 'flex';
    dots[slideIndex - 1].className += ' active';
}

let timer = null;

if (screenWidth > 768) {
    showSlides(slideIndex);
    timer = setInterval(function () {
        slideIndex++;
        showSlides(slideIndex);
    }, 6000);
}

window.addEventListener('resize', function (event) {
    const screenWidth = window.innerWidth;

    if (screenWidth < 768) {
        clearInterval(timer);
        const slides = [...document.getElementsByClassName('favourite__slides')];

        slides.forEach((el) => (el.style.display = 'flex'));
    } else {
        showSlides(slideIndex);
    }
});
