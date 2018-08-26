function showBrowse() {
    document.getElementById('BrowsePens').classList.toggle('show');
}

function showExplore() {
    document.getElementById('ExplorePens').classList.toggle('show');
}

function expandMenu(x) {
  x.classList.toggle('change');
  document.getElementById('collapsible').classList.toggle('expanded');
}

window.onclick = function(event) {
  if (!event.target.matches('.dropdown__btn')) {
    var dropdowns = document.getElementsByClassName("dropdown__content");
    for (var i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

const url = window.location.pathname;
const admPath = RegExp('\/admin\/');
if (admPath.test(url)) {
  const admBar = document.getElementById('admin-bar');
  admBar.style = "display: none;";
}