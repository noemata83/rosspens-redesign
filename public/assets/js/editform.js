var makers = document.getElementById("formmaker");
for (var i = 0; i < makers.options.length; i++) {
    if (makers.options[i].value === pendata.maker) {
        makers.options[i].setAttribute("selected", true);
    }
}
var types = document.getElementById("itemtype");
for (var i = 0; i < types.options.length; i++) {
    if (types.options[i].value === pendata.type) {
        types.options[i].setAttribute("selected", true);
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

function submit(event) {
    event.preventDefault();
    const files = document.getElementById('itemimages').files;
    const file = files[0];
    let signedRequests = [];
    if (file == null) {
        document.querySelector('form').submit();
        return true;
    } else {
        for (let i = 0; i < files.length; i++) {
            signedRequests.push(getSignedRequest(files[i]));   
        }
    }
    Promise.all(signedRequests).then( () => {
        Promise.all(fileUploads).then( () => {
            document.getElementById('imageURLs').value = imageURLs;
            document.querySelector('form').submit();
        });
    });
}

function getSignedRequest(file) {
    return axios.get(`/sign-s3?file-name=${file.name}&file-type=${file.type}`)
    .then(response => {
        fileUploads.push(uploadFile(file, response.data.signedRequest, response.data.url, {
        headers: {
          'Content-Type': file.type
        }
        } ))})
    .catch(error => alert("There was an error getting a signed URL: " + error));
}

function uploadFile(file, signedRequest, url, options) {
    return axios.put(signedRequest, file, options)
    .then( response => {
        imageURLs.push(url);
    })
    .catch( error => alert("There was an error uploading the file: " + error));
}

var imageURLs = [];
var fileUploads = [];
document.querySelector('form').addEventListener("submit", submit);