function submit(event) {
    event.preventDefault();
    const files = document.getElementById('itemimages').files;
    const file = files[0];
    let signedRequests = [];
    if (file == null) {
        alert("No images to be uploaded.");
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