const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const base64Img = require('base64-img');
const tf = require('@tensorflow/tfjs');
const handpose = require('@tensorflow-models/handpose');
const { createCanvas, loadImage } = require('canvas');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const upload = multer({ dest: 'uploads/' });

let currentPhrase = [];

const labels = ["A", "B", "C", "D", "E", "F", "G", "H", "I/J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y/Z"];

async function translateImage(imgPath) {
  const model = await handpose.load();
  const img = await loadImage(imgPath);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, img.width, img.height);

  const predictions = await model.estimateHands(canvas);

  // Debugging: Print number of hands detected
  console.log(`Number of hands detected: ${predictions.length}`);

  const translations = [];
  for (const prediction of predictions) {
    const keypoints = prediction.landmarks;
    // Your translation logic here
    // This part needs to be adapted based on how your model works

    // For the sake of example, let's say we just return a dummy label
    translations.push(labels[0]);
  }

  return translations;
}

app.get('/translate', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.json({ img: '', translations: [], current_phrase: '' });
  }

  const translations = await translateImage(req.file.path);
  currentPhrase.push(...translations);

  base64Img.base64(req.file.path, (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to process image' });
    }

    res.json({
      img: data,
      translations: translations,
      current_phrase: currentPhrase.join(' ')
    });
  });
});

app.post('/clear', (req, res) => {
  currentPhrase = [];
  res.json({ message: 'Phrase cleared', current_phrase: '' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
