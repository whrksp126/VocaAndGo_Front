// true 일때는 뒤로가기가 되고 아니면 토스트 한번 띄우고 종료;
function is_backable() {
  let isBackable = true
  const IS_MAIN_PAGES = ['login', 'vocabulary_list', 'mypage'];
  const curPage = getLastPathFromURL();
  const isMainPage = IS_MAIN_PAGES.includes(curPage);
  const isModalOpen = document.querySelector('.modal');
  if(isMainPage && !isModalOpen) isBackable = false;
  return isBackable;
};

// 기기 타입 조회
function getDevicePlatform() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const isAppWebView = userAgent.includes('HeyVoca');
  if (isAppWebView) {
    return 'app'
  }else{
    return 'web';
  }
}


// 네이티브 카메라 모달 열기
function openCamera(type, callback){
  if(type == 'ocr'){
    window?.ReactNativeWebView?.postMessage('ocr_camera_open');
    const handleMessage = function(event) {
      try {
        const message = JSON.parse(event.data); 
        if (message.type == 'ocr_camera_return'){
          callback(message.data)
          closeCamera(type);
          document.removeEventListener('message', handleMessage);
        }
      } catch (error) {
        console.error(`메시지를 구문 분석하는 중에 오류가 발생했습니다. : ${error}`);
      }
    };
    document.addEventListener('message', handleMessage);
  } 
}

// 네이티브 카메라 모달 닫기
function closeCamera(type){
  if(type == 'ocr'){
    window?.ReactNativeWebView?.postMessage('ocr_camera_close');
  }
}


// 네이티브 보상형 전면 광고 열기
function showRewardedAd (callback){
  if(getDevicePlatform() == "app"){
    window?.ReactNativeWebView?.postMessage('show_rewarded_ad')
    const handleMessage = function(event) {
      try {
        const message = JSON.parse(event.data); 
        if (message.type == "reward"){
          callback("success")
          document.removeEventListener('message', handleMessage);
        }else if (message.type == 'reward_failed'){
          callback("failure")
          document.removeEventListener('message', handleMessage);
        }
      } catch (error) {
        console.error(`메시지를 구문 분석하는 중에 오류가 발생했습니다. : ${error}`);
      }
    };
    document.addEventListener('message', handleMessage);
  }else{
    callback("success")
  }
}


// 액세스 토큰 조회
function getAccessToken(callback){
  window?.ReactNativeWebView?.postMessage('get_access_token');
  const handleMessage = function(event) {
    try {
      const message = JSON.parse(event.data); 
      if (message.type == 'access_token_return'){
        if(message.data){
          callback(message.data)
        }
        closeCamera(type);
        document.removeEventListener('message', handleMessage);
      }
    } catch (error) {
      console.error(`메시지를 구문 분석하는 중에 오류가 발생했습니다. : ${error}`);
    }
  };
  document.addEventListener('message', handleMessage);
}