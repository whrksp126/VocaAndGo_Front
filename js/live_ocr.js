const camera_container_html = (callback) => {
  return `
    <div class="camera_container">
      <button class="off_camera" onclick="clickCloseCamera(event)">
        <i class="ph ph-x"></i>
      </button>
      <div class="blur"></div>
      <div class="focus_box">
        <img class="center_focus" src="/images/focus.svg?v=2024.08.270203">
        <p>정확한 텍스트 인식을 위해 검색하고 싶은<br>
          텍스트를 평평한 곳에 두고 촬영해주세요.</p>
      </div>
      <button class="capture_btn" id="capture" onclick="clickCapturBtn(event, ${callback})"><i class="ph ph-camera"></i></button>
      <video id="video" autoplay playsinline></video>
      <canvas id="crop_canvas" style="display: none;"></canvas>
      <canvas id="view_canvas" style="display: none;"></canvas>
      <img id="photo" alt="Captured Photo" style="display: none;"/>
    </div>
  `;
};

async function startCamera(callback) {
  document.body.insertAdjacentHTML('beforeend', camera_container_html(callback));
  const video = document.getElementById('video');

  // 기존 스트림이 있다면 해제
  if (video.srcObject) {
    let tracks = video.srcObject.getTracks();
    tracks.forEach(track => track.stop());
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');

    if (videoDevices.length > 0) {
      let backCamera = videoDevices.find(device => device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('rear'));
      let frontCamera = videoDevices.find(device => device.label.toLowerCase().includes('front'));

      let constraints;

      if (backCamera) {
        constraints = {
          video: {
            deviceId: { exact: backCamera.deviceId },
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
            advanced: [{ focusMode: "auto" }] // 오토포커스 설정
          }
        };
      } else if (frontCamera) {
        constraints = {
          video: {
            deviceId: { exact: frontCamera.deviceId },
            facingMode: { ideal: "user" },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
      } else {
        constraints = { video: true };
      }

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      video.srcObject = newStream;
      video.play();

      // 클릭으로 오토포커스 재조정 트리거
      video.addEventListener('click', restartCamera);

      video.addEventListener('loadedmetadata', () => {
        console.log(`비디오 해상도: ${video.videoWidth}x${video.videoHeight}`);
      });

    } else {
      console.error("비디오 입력 장치를 찾을 수 없습니다.");
    }
  } catch (err) {
    console.error("카메라 액세스 오류: ", err);
  }
}

// 클릭으로 카메라 스트림을 재시작하여 초점 재조정
const restartCamera = async () => {
  const video = document.getElementById('video');
  if (video.srcObject) {
    let tracks = video.srcObject.getTracks();
    tracks.forEach(track => track.stop());
  }

  const constraints = { video: true };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  video.srcObject = stream;
  video.play();
};

// 포커스 박스 설정
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

const clickOpenOcrCamera = async (event, callback) => {
  await startCamera(callback);
  // setFocus();
};

const clickCloseCamera = (event) => {
  const video = document.getElementById('video');

  if (video.srcObject) {
    let tracks = video.srcObject.getTracks();
    tracks.forEach(track => track.stop());
  }

  video.srcObject = null;
  document.querySelector('.camera_container').remove();
};

const clickCapturBtn = async (event, callback) => {
  const video = document.getElementById('video');
  const viewCanvas = document.getElementById('view_canvas');
  const cropCanvas = document.getElementById('crop_canvas');

  const originalCanvas = document.createElement('canvas');
  const originalContext = originalCanvas.getContext('2d');
  originalCanvas.width = video.videoWidth;
  originalCanvas.height = video.videoHeight;
  originalContext.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

  const videoRect = video.getBoundingClientRect();
  const visibleWidth = videoRect.width;
  const visibleHeight = videoRect.height;
  const visibleX = (video.videoWidth - visibleWidth) / 2;
  const visibleY = (video.videoHeight - visibleHeight) / 2;

  const viewContext = viewCanvas.getContext('2d');
  viewCanvas.width = visibleWidth;
  viewCanvas.height = visibleHeight;
  viewContext.drawImage(video, visibleX, visibleY, visibleWidth, visibleHeight, 0, 0, visibleWidth, visibleHeight);

  const focusRect = document.querySelector('.center_focus').getBoundingClientRect();
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
    visible: { w: visibleWidth, h: visibleHeight, x: visibleX, y: visibleY }
  };

  const crop = {
    img: cropCanvas.toDataURL('image/png'),
    visible: { w: focusRect.width, h: focusRect.height, x: focusRect.left, y: focusRect.top }
  };

  await callback(original, view, crop);
  clickCloseCamera();
};
