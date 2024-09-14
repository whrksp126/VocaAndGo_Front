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
      <!-- 
      <div class="blurs">
        <div class="blur top"></div>
        <div class="blur left"></div>
        <div class="blur bottom"></div>
        <div class="blur right"></div>
      </div>
      -->
      <video id="video" autoplay playsinline></video>
      <canvas id="crop_canvas" style="display: none;"></canvas>
      <canvas id="view_canvas" style="display: none;"></canvas>
      <img id="photo" alt="Captured Photo" style="display: none;"/>
    </div>
  `
} 

// .modal.ocr_word .modal_content .modal_middle .preview img
// 카메라 열기 버튼 클릭 시, React Native의 WebView에 메시지를 보냄
const clickOpenOcrCamera = () => {
  const modal = getDefaultModal();
  modal.container.classList.add('ocr_word')
  modal.top.innerHTML = modalTopHtml(`단어 선택`);
  modal.middle.innerHTML = `
    <div class="preview">
      <img src="">
      <div class="highlighter"></div>
    </div>
    <ul class="search_list active"></ul>
  `;
  // const _searchList = modal.middle.querySelector('.search_list');
  // let search_list = []
  
  // ocr_data_list.forEach((ocr_data)=>{
  //   if(ocr_data.search_list.length<=0) return 
  //   ocr_data.search_list.forEach((search_data)=>{
  //     if (search_data.word.toUpperCase() === ocr_data.text.toUpperCase()) {
  //       search_data.box = ocr_data.box;
  //       search_list = [...search_list, search_data]
  //     }
  //   })
  // })
  // OCR_DATA = {original, view, crop, search_list};
  // setSearchListEl(_searchList, search_list);
  const btns = [
    {class:"gray", text: "재촬영", fun: `onclick="clickOpenOcrCamera(event, ocrCameraCallback)"`},
  ]
  modal.bottom.innerHTML = modalBottomHtml(btns);

  window?.ReactNativeWebView?.postMessage('launchCamera');
  const handleMessage = function(event) {
    try {
      const message = JSON.parse(event.data);  // 메시지를 JSON으로 파싱
      if (message.type === 'image') {
        const imgElement = document.querySelector('.modal.ocr_word .modal_content .modal_middle .preview img');
        imgElement.src = message.data;
        document.removeEventListener('message', handleMessage);
      }
    } catch (error) {
      console.error(`Error parsing message : ${error}`);
    }
  };
  document.addEventListener('message', handleMessage);
}

// React Native에서 촬영한 이미지(base64)를 받는 이벤트 리스너
// window.addEventListener('message', function(event) {
//   try {
//     const data = JSON.parse(event.data); 
//     if (data.type === 'capturedImage') {
//       alert('Captured image received:', data.image);
//       const base64Image = data.image; 
//       if (base64Image.startsWith('data:image')) {
//         const imgElement = document.querySelector('.modal.ocr_word .modal_content .modal_middle .preview img');
//         imgElement.src = base64Image; 
//       }
//     }
//   } catch (error) {
//     alert('Error parsing message: ' + error);
//   }
// });
// async function startCamera(callback) {
  
//   document.body.insertAdjacentHTML('beforeend', camera_container_html(callback));
//   const video = document.getElementById('video');

//   // 기존 스트림이 있다면 해제
//   if (video.srcObject) {
//     let tracks = video.srcObject.getTracks();
//     tracks.forEach(track => track.stop());
//   }

//   try {
//     // 기본 스트림 권한 요청
//     const stream = await navigator.mediaDevices.getUserMedia({ video: true });

//     // 디바이스 정보 가져오기
//     const devices = await navigator.mediaDevices.enumerateDevices();
//     const videoDevices = devices.filter(device => device.kind === 'videoinput');

//     if (videoDevices.length > 0) {
//       let backCamera = videoDevices.find(device => device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('rear'));
//       let frontCamera = videoDevices.find(device => device.label.toLowerCase().includes('front'));

//       let constraints;

//       // 후면 카메라가 있는 경우 최대 해상도 설정
//       if (backCamera) {
//         constraints = {
//           video: {
//             deviceId: { exact: backCamera.deviceId },
//             facingMode: { ideal: "environment" },
//             width: { ideal: 1280 },
//             height: { ideal: 720 },
//             advanced: [{ focusMode: "auto" }]
//           }
//         };
//       } 
//       // 후면 카메라가 없으면 전면 카메라를 최대 해상도로 사용
//       else if (frontCamera) {
//         constraints = {
//           video: {
//             deviceId: { exact: frontCamera.deviceId },
//             facingMode: { ideal: "user" },
//             width: { ideal: 1280 },
//             height: { ideal: 720 },
//           }
//         };
//       } else {
//         constraints = { video: true };
//       }

//       // 새로운 constraints로 스트림 요청
//       const newStream = await navigator.mediaDevices.getUserMedia(constraints);
//       video.srcObject = newStream;
//       video.play();

//       // 비디오 해상도 및 초점 확인
//       video.addEventListener('loadedmetadata', () => {
//         console.log(`비디오 해상도: ${video.videoWidth}x${video.videoHeight}`);
//       });

//     } else {
//       console.error("비디오 입력 장치를 찾을 수 없습니다.");
//     }
//   } catch (err) {
//     console.error("카메라 액세스 오류: ", err);
//   }
// }



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
// const clickOpenOcrCamera = async (event, callback) =>{
//   await startCamera(callback);
//   // setFocus();
// }

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