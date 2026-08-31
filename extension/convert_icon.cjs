const Jimp = require('jimp');

Jimp.read('icon.jpg')
  .then(image => {
    return image.resize(128, 128).writeAsync('icon.png');
  })
  .then(() => {
    console.log('Successfully converted icon.jpg to icon.png (128x128)');
  })
  .catch(err => {
    console.error(err);
  });
