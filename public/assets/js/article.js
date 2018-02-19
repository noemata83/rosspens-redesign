const imageURLs = [];
const fileUploads = [];

const imageForm = document.getElementById('articleImageUpload');
imageForm.addEventListener('submit', submit);

const fileInputToggle = () => {
    const fileInput = document.querySelector('.image-menu__form--input');    
    fileInput.classList.toggle('show-form');
}

function submit(event) {
    event.preventDefault();
    const files = document.getElementById('articleImages').files;
    const file = files[0];
    let signedRequests = [];
    let submitcontinue = true;
    if (file == null) {
        submitcontinue = false;
    } else {
        for (let i = 0; i < files.length; i++) {
            signedRequests.push(getSignedRequest(files[i]));   
        }
    }
    if (submitcontinue) {
        Promise.all(signedRequests).then( () => {
            Promise.all(fileUploads).then( () => {
                document.getElementById('imageURLs').value = imageURLs;
                imageForm.submit();
            });
        });
    }
}

function getSignedRequest(file) {
    return axios.get(`/sign-s3-article?file-name=${file.name}&file-type=${file.type}`)
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

function getAndDisplayImages() {
    axios.get('/about/images')
        .then(res => {
            res.data.forEach(image => {
                console.log(image.URL);
                let imageNode = document.createElement('img');
                imageNode.setAttribute('src', image.URL);
                imageNode.addEventListener('click', copyImage);
                document.querySelector('.image-menu__display').appendChild(imageNode);
                imageNode.classList.add('image-menu__thumbnail')

            });
        })
        .catch(err => {
            console.log(err);
        });
}

function copyImage(e) {
    let snippet = `<figure class="article__figure">\n
<img class="article__img" src="${e.target.src}" />\n
<figcaption class="article__figure--caption">ENTER CAPTION HERE</figcaption>\n
</figure>`;
    console.log(snippet);
    copyToClipboard(snippet);
}

function copyToClipboard(val){
      const dummy = document.createElement("input");
      dummy.style.opacity = 0;
      document.body.appendChild(dummy);
      dummy.setAttribute("id", "dummy_id");
      document.getElementById("dummy_id").value=val;
      dummy.select();
      document.execCommand("copy");
      console.log(document.execCommand("copy"));
      document.body.removeChild(dummy);
    }

window.onload = getAndDisplayImages();