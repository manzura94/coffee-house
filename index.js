

const burgerButton = document.querySelector(".header__burger-button");
const lineButton = document.querySelector(".line");
const burgerMenu = document.querySelector(".header__menu");
const body = document.querySelector(".wrapper");
const links = document.getElementsByClassName("header__menu-item")


burgerButton.addEventListener("click", function () {
  if (lineButton.classList.contains("active-menu")) {
    lineButton.classList.remove("active-menu");
  } else {
    lineButton.classList.add("active-menu");
  }

  if (burgerMenu.classList.contains("showMenu")) {
    burgerMenu.classList.remove("showMenu");

  } else {
    burgerMenu.classList.add("showMenu");
  }

  if (body.classList.contains("no-scroll")) {
    body.classList.remove("no-scroll");

  } else {
    body.classList.add("no-scroll");
  }
});


for (let index = 0; index < links.length; index++) {
    const element = links[index];

    element.addEventListener("click", function(){
        lineButton.classList.remove("active-menu");
        burgerMenu.classList.remove("showMenu");
        body.classList.remove("no-scroll");
    })
    
}

let slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("favourite__slides");
    let dots = document.getElementsByClassName("dot");

    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "flex";
  dots[slideIndex-1].className += " active";
}

let timer = setInterval(function(){
    slideIndex++;
    showSlides(slideIndex);
  }, 6000);



   



