const camera_container_html = (callback) => {
  return `
    <div class="camera_container">
      <button class="off_camera" onclick="clickCloseCamera(event)">
        <i class="ph ph-x"></i>
      </button>
      <div class="focus_box">
        <img class="center_focus" src="/images/focus.svg">
        <p>정확한 텍스트 인식을 위해 검색하고 싶은<br>
          텍스트를 평평한 곳에 두고 촬영해주세요.</p>
      </div>
      <button class="capture_btn" id="capture" onclick="clickCapturBtn(event, ${callback})"><i class="ph ph-camera"></i></button>
      <div class="blurs">
        <div class="blur top"></div>
        <div class="blur left"></div>
        <div class="blur bottom"></div>
        <div class="blur right"></div>
      </div>
      <video id="video" autoplay playsinline></video>
      <canvas id="crop_canvas" style="display: none;"></canvas>
      <canvas id="view_canvas" style="display: none;"></canvas>
      <img id="photo" alt="Captured Photo" style="display: none;"/>
    </div>
  `
} 



async function startCamera(callback) {
  document.body.insertAdjacentHTML('beforeend', camera_container_html(callback));
  const video = document.getElementById('video');
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

      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        video.play();

        // 비디오 해상도 정보를 비디오 메타 데이터가 로드된 후에 얻음
        video.addEventListener('loadedmetadata', () => {
          console.log(`비디오 해상도: ${video.videoWidth}x${video.videoHeight}`);
        });
      } catch (err) {
        if (err.name === 'OverconstrainedError') {
          console.warn("요청한 해상도를 사용할 수 없습니다. 기본 해상도로 시도합니다.");

          // 기본 해상도로 다시 시도
          const defaultConstraints = {
            video: true // 기본 해상도 사용
          };

          const stream = await navigator.mediaDevices.getUserMedia(defaultConstraints);
          video.srcObject = stream;
          video.play();

          video.addEventListener('loadedmetadata', () => {
            console.log(`기본 비디오 해상도: ${video.videoWidth}x${video.videoHeight}`);
          });
        } else {
          throw err;
        }
      }
    } else {
      console.error("비디오 입력 장치를 찾을 수 없습니다.");
    }
  } catch (err) {
    console.error("카메라 액세스 오류: ", err);
  }
}

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


// window.addEventListener('resize', setFocus);
// window.addEventListener('load', () => {
//   setFocus();
//   startCamera();
// });
const clickOpenOcrCamera = async (event, callback) =>{
  await startCamera(callback);
  setFocus();
}

// 카메라 닫기 클릭 시
const clickCloseCamera = (event) => {
  const video = document.getElementById('video');
  
  // 비디오에서 스트림 가져오기
  const stream = video.srcObject;
  
  if (stream) {
    // 스트림의 모든 트랙 중지
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
  }
  
  // 비디오의 소스를 해제
  video.srcObject = null;

  // 카메라 컨테이너 요소 제거
  document.querySelector('.camera_container').remove();
}
// 카메라 촬영 클릭 시
const clickCapturBtn = async (event, callback) => {

  const video = document.getElementById('video');
  const photo = document.getElementById('photo');
  const viewCanvas = document.getElementById('view_canvas');
  const cropCanvas = document.getElementById('crop_canvas');

  // 원본 비디오 이미지를 위한 캔버스 만들기
  const originalCanvas = document.createElement('canvas');
  const originalContext = originalCanvas.getContext('2d');
  originalCanvas.width = video.videoWidth;
  originalCanvas.height = video.videoHeight;
  originalContext.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
  
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

  const original = {
    img: originalCanvas.toDataURL('image/png'),
    width: video.videoWidth,
    height: video.videoHeight
  };

  const view = {
    img: viewCanvas.toDataURL('image/png'),
    visible : {
      w : visibleWidth,
      h : visibleHeight,
      x : visibleX,
      y : visibleY
    },
  }
  const crop = {
    img: cropCanvas.toDataURL('image/png'),
    visible : {
      w : focusRect.width,
      h : focusRect.height,
      x : focusRect.left,
      y : focusRect.top
    },
  }
  await callback(original, view, crop);
  clickCloseCamera();
}