 // Base64 representation of a white point image
 const webpdata = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoCAAEAAQAcJaQAA3AA/v3AgAA=';
 var image

  console.log("Worker started !");
 // Retrieve the Image in Blob Format
 fetch(webpdata).then(response => response.blob()).then((blob) => {
   console.log("image fetched !");
  image = createImageBitmap(blob).then(() => {
    console.log("Loaded");
  }, () => {
    console.log("Failed");
  });
});
