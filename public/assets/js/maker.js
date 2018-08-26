function submit(event) {
  event.preventDefault();
  const files = document.getElementById('banner_image').files;
  const signedRequests = [];
  const file = files[0];
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
          document.getElementById('imageURL').value = imageURL;
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
      imageURL = url;
  })
  .catch( error => alert("There was an error uploading the file: " + error));
}

var imageURL = '';
var fileUploads = [];
document.querySelector('form').addEventListener("submit", submit);