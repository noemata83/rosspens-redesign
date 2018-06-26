function navigateByArrow (event) {
    if (event.key === 'ArrowRight') {
        plusSlides(1);
    } else if (event.key === 'ArrowLeft') {
        plusSlides(-1);
    }
}

function openModal() {
    document.getElementById('penModal').style.display="inline-block";
    document.addEventListener('keydown', navigateByArrow);
}

function closeModal() {
    document.removeEventListener('keydown', navigateByArrow);
    document.getElementById('penModal').style.display="none";
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
    const slides = document.getElementsByClassName('modal__slide');
    const dots = document.getElementsByClassName('modal__demo');
    const captionText = document.getElementById("caption");
    if (n > slides.length) { slideIndex = 1; }
    if (n < 1 ) { slideIndex = slides.length; }
    for (let i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (let i = 0; i < dots.length; i++ ) {
        dots[i].className = dots[i].className.replace(" modal__demo--active", "");
    }
    slides[slideIndex-1].style.display = "block";
    dots[slideIndex-1].className += " modal__demo--active";
    captionText.innerHTML = dots[slideIndex-1].alt;
}
