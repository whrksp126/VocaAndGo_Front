const video = document.getElementById('video');
const captureButton = document.getElementById('capture');
const photoContainer = document.getElementById('photo-container');
let imageCapture;
let stream;

async function setupCamera() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: 1920, 
        height: 1080,
        focusMode: 'continuous'
      } 
    });
    video.srcObject = stream;
    const track = stream.getVideoTracks()[0];
    imageCapture = new ImageCapture(track);
  } catch (err) {
    console.error("Camera access denied or not supported:", err);
  }
}

async function takePhoto() {
  try {
    const blob = await imageCapture.takePhoto();
    const img = document.createElement("img");
    img.src = URL.createObjectURL(blob);
    img.onload = () => { performOCR(img); }
    img.style.width = "100%";
    img.style.height = "auto";
    photoContainer.innerHTML = '';
    photoContainer.appendChild(img);
  } catch (error) {
    console.error("Error taking photo:", error);
  }
}

async function performOCR(img) {
  try {
    const result = await Tesseract.recognize(
      img.src,
      'eng',
      {
        logger: m => console.log(m.status, m.progress)
      }
    );
    // Use a regular expression to filter out non-English or nonsensical words
    const wordRegex = /^[a-zA-Z]{2,}$/; // Only match words with two or more alphabetic characters
    const words = result.data.words
      .map(word => word.text)
      .filter(text => wordRegex.test(text));

    console.log("Filtered words:", words); // Log filtered words
    overlayText(result, img); // Continue to display all words on the image for visual verification
  } catch (err) {
    console.error("OCR failed:", err);
  }
}

function overlayText(ocrResult, img) {
  const scaleX = img.width / img.naturalWidth;
  const scaleY = img.height / img.naturalHeight;

  ocrResult.data.words.forEach(word => {
    // Create a box around the word
    const box = document.createElement('div');
    box.style.position = 'absolute';
    box.style.left = `${word.bbox.x0 * scaleX}px`;
    box.style.top = `${word.bbox.y0 * scaleY}px`;
    box.style.width = `${(word.bbox.x1 - word.bbox.x0) * scaleX}px`;
    box.style.height = `${(word.bbox.y1 - word.bbox.y0) * scaleY}px`;
    box.style.border = '2px solid red';
    box.style.boxSizing = 'border-box';
    photoContainer.appendChild(box);

    // Create text inside the box
    const text = document.createElement('span');
    text.style.position = 'absolute';
    text.style.left = '50%';
    text.style.top = '50%';
    text.style.transform = 'translate(-50%, -50%)';
    text.style.color = 'yellow';
    text.style.fontSize = 'small';
    text.textContent = word.text;
    box.appendChild(text);
  });
}


captureButton.addEventListener('click', () => {
  takePhoto();
});

setupCamera();