// Elements
const video = document.getElementById('video');
const captureButton = document.getElementById('capture');
const photo = document.getElementById('photo');
const cropCanvas = document.getElementById('crop_canvas');
const viewCanvas = document.getElementById('view_canvas');

// 카메라를 시작하고 최상의 해상도를 결정합니다.
async function startCamera() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');

    if (videoDevices.length > 0) {
      const constraints = {
        video: {
          deviceId: { exact: videoDevices[0].deviceId },
          width: { ideal: 1920, max: 4096 },
          height: { ideal: 1080, max: 2160 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = stream;
      video.play();

      // 비디오 해상도 정보를 비디오 메타 데이터가 로드된 후에 얻음
      video.addEventListener('loadedmetadata', () => {
        console.log(`비디오 해상도: ${video.videoWidth}x${video.videoHeight}`);
      });
    } else {
      console.error("비디오 입력 장치를 찾을 수 없습니다..");
    }
  } catch (err) {
    console.error("카메라 액세스 오류: ", err);
  }
}

// 버튼을 클릭하면 사진을 캡처합니다.
captureButton.addEventListener('click', async () => {
  // 비디오 해상도를 표시
  console.log(`Captured resolution: ${video.videoWidth}x${video.videoHeight}`);
  const videoRect = video.getBoundingClientRect();
  // 비디오의 보이는 부분 계산
  const visibleWidth = videoRect.width;
  const visibleHeight = videoRect.height;
  const visibleX = (video.videoWidth - visibleWidth) / 2;
  const visibleY = (video.videoHeight - visibleHeight) / 2;

  // 잘린 부분을 캔버스에 그립니다
  const viewContext = viewCanvas.getContext('2d');
  viewCanvas.width = visibleWidth;
  viewCanvas.height = visibleHeight;
  viewContext.drawImage(video, visibleX, visibleY, visibleWidth, visibleHeight, 0, 0, visibleWidth, visibleHeight);

  // focusRect 크기에 맞는 이미지로 다시 크롭하기
  const focusRect = document.querySelector('.center_focus').getBoundingClientRect();
  // 자른 이미지를 위한 새 캔버스 만들기
  const context = cropCanvas.getContext('2d');
  cropCanvas.width = focusRect.width;
  cropCanvas.height = focusRect.height;

  context.drawImage(viewCanvas, focusRect.left, focusRect.top, focusRect.width, focusRect.height, 0, 0, focusRect.width, focusRect.height);
  
  // 캔버스를 데이터 URL로 변환하여 표시
  const dataURL = cropCanvas.toDataURL('image/png');
  photo.setAttribute('src', dataURL);
  photo.style.display = 'block';

  // OCR 처리
  const result = await Tesseract.recognize(cropCanvas, 'eng+kor+jpn', {
    logger: m => console.log(m)
  });

  // 인식된 텍스트와 위치 정보를 콘솔에 출력
  result.data.words.forEach(word => {
    console.log(`Text: ${word.text}, Bounding Box: ${JSON.stringify(word.bbox)}`);
  });
  
});

const setFocus = () => {
  const focusRect = document.querySelector('.center_focus').getBoundingClientRect();
  document.querySelector('.blur.top').style.height = `${focusRect.top}px`;

  document.querySelector('.blur.left').style.top = `${focusRect.top}px`;
  document.querySelector('.blur.left').style.width = `${focusRect.left}px`;
  document.querySelector('.blur.left').style.height = `${focusRect.height}px`;

  document.querySelector('.blur.bottom').style.height = `calc(${window.innerHeight}px - (${focusRect.height}px + ${focusRect.top}px))`;

  document.querySelector('.blur.right').style.top = `${focusRect.top}px`;
  document.querySelector('.blur.right').style.width = `calc(100% - (${focusRect.left + focusRect.width}px))`;
  document.querySelector('.blur.right').style.height = `${focusRect.height}px`;
};

window.addEventListener('resize', setFocus);
window.addEventListener('load', () => {
  setFocus();
  startCamera();
});
