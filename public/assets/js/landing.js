var nav = document.querySelector('nav');
var dropdowns = document.querySelectorAll('.dropdown-list');

nav.style.backgroundColor = "rgba(58,71,73, 0.8)";
dropdowns.forEach(dropdown => dropdown.style.backgroundColor = "rgba(58,71,73, 0.8)");

function debounce(func, wait = 5, immediate = true) {
      var timeout;
      return function() {
        var context = this, args = arguments;
        var later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
}

function checkSlide(e) {
    if (window.scrollY <= 330) {
        nav.style.backgroundColor = `rgba(58,71,73,${0.8 + (0.2 * window.scrollY/330)} )`;
        dropdowns.forEach(dropdown => dropdown.style.backgroundColor = `rgba(58,71,73,${0.8 + (0.2 * window.scrollY/330)})`);
    } else {
        nav.style.backgroundColor = "rgb(58,71,73)";
        dropdowns.forEach(dropdown => dropdown.style.backgroundColor = "rgb(58,71,73");
    }
}

window.addEventListener('scroll', debounce(checkSlide));
