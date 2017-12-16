var makers = document.getElementById("formmaker");
for (var i = 0; i < makers.options.length; i++) {
    if (makers.options[i].value === "<%=pen.maker%>") {
        makers.options[i].setAttribute("selected", "selected");
    }
}
var types = document.getElementById("itemtype");
for (var i = 0; i < types.options.length; i++) {
    if (types.options[i].value === "<%=pen.type%>") {
        types.options[i].setAttribute("selected", "selected");
    }
}

// image gallery
// init the state from the input

document.querySelectorAll(".image-checkbox").forEach(element => {
  if (element.querySelector('input[type="checkbox"]').getAttribute("checked")) {
    element.classList.add('image-checkbox-checked');
  }
  else {
    element.classList.remove('image-checkbox-checked');
    }
});

// sync the state to the input
document.querySelectorAll(".image-checkbox").forEach(element => element.addEventListener("click", function (e) {
  this.classList.toggle('image-checkbox-checked');
  
  var checkbox = this.querySelector('input[type="checkbox"]');
  checkbox.setAttribute("checked", !checkbox.getAttribute("checked"));
    
  e.preventDefault();
  var imagechangesform = document.getElementById("imagechanges");
  imagechangesform.value = Array(changedImages());
}));

function changedImages() {
    var imagesarray = [...document.querySelectorAll('.image-checkbox')];
    var imagechanges = [];
    imagesarray.forEach( (element, index) => {
        if (element.classList.contains("image-checkbox-checked")) {
	    imagechanges.push(index); 
    }});
	return imagechanges;
}