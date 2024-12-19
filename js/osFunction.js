// true 일때는 뒤로가기가 되고 아니면 토스트 한번 띄우고 종료;
function is_backable() {
  let isBackable = true;
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


// 네이티브 카메라 모달 열기 - Promise로 변환
function openCamera(type) {
  return new Promise((resolve, reject) => {
    if (type === 'ocr') {
      window?.ReactNativeWebView?.postMessage('ocr_camera_open');
      const handleMessage = function (event) {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'ocr_camera_return') {
            resolve(message.data); // 이미지 데이터 반환
            closeCamera(type);
            document.removeEventListener('message', handleMessage);
          }
        } catch (error) {
          console.error(`메시지를 구문 분석하는 중에 오류가 발생했습니다: ${error}`);
          reject(error); // 오류 발생 시 reject
        }
      };
      document.addEventListener('message', handleMessage);
    } else {
      reject("지원되지 않는 카메라 유형입니다.");
    }
  });
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
          // TODO : adm 29 일간 정지 후 주석 failure 적용
          // callback("failure")
          callback("success")
          document.removeEventListener('message', handleMessage);
        }
      } catch (error) {
        callback("success")
        console.error(`메시지를 구문 분석하는 중에 오류가 발생했습니다. : ${error}`);
      }
    };
    document.addEventListener('message', handleMessage);
  }else{
    callback("success")
  }
}


// 액세스 토큰 조회 - Promise로 변환
function getAccessToken() {
  return new Promise((resolve, reject) => {
    window?.ReactNativeWebView?.postMessage('get_access_token');
    const handleMessage = function(event) {
      try {
        const message = JSON.parse(event.data); 
        if (message.type === 'access_token_return') {
          if (message.data) {
            resolve(message.data); // 액세스 토큰을 resolve
          } else {
            reject('토큰 데이터가 없습니다.');
          }
          document.removeEventListener('message', handleMessage);
        }
      } catch (error) {
        console.error(`메시지를 구문 분석하는 중에 오류가 발생했습니다: ${error}`);
        reject(error); // 오류 발생 시 reject
      }
    };
    document.addEventListener('message', handleMessage);
  });
}

// TTS 
function getNativeTTS(text, language) {
  const message = JSON.stringify({
    type: 'tts',
    text: text,
    language: language 
  });
  window.ReactNativeWebView?.postMessage(message);
}

// 웹에서 쿼리와 데이터를 JSON으로 구성하여 앱으로 전달
function setSqliteQuery(query, params = []) {
  const queryData = {
    type: "set_sqlite_query",
    query: query,
    params: params,
  };
  return new Promise((resolve, reject) => {
    // WebView로 메시지 전송
    window.ReactNativeWebView?.postMessage(JSON.stringify(queryData));
    const handleMessage = function (event) {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'sqlite_query_return') {
          if(message.success){
            resolve(message.result); 
          }else{
            reject(message.error); 
          }
          document.removeEventListener('message', handleMessage);
        }
      } catch (error) {
        console.error(`메시지를 구문 분석하는 중에 오류가 발생했습니다: ${error}`);
        reject(error); // 오류 발생 시 reject
      }
    };
    document.addEventListener('message', handleMessage);
  })
}


// SQLite 상태 조회 - Promise로 변환
function getSqliteStatus() {
  return new Promise((resolve, reject) => {
    window?.ReactNativeWebView?.postMessage('get_sqlite_status');
    const handleMessage = function(event) {
      try {
        const message = JSON.parse(event.data); 
        if (message.type === 'sqlite_status_return') {
          if (message.data) {
            resolve(message.data);
          } else {
            reject('토큰 데이터가 없습니다.');
          }
          document.removeEventListener('message', handleMessage);
        }
      } catch (error) {
        console.error(`메시지를 구문 분석하는 중에 오류가 발생했습니다: ${error}`);
        reject(error); // 오류 발생 시 reject
      }
    };
    document.addEventListener('message', handleMessage);
  });
}


// 네이티브 cofirm 세팅
function setConfirm(data) {
  if(getDevicePlatform() == "app"){
    return new Promise((resolve, reject) => {
      // WebView로 메시지 전송
      window.ReactNativeWebView?.postMessage(JSON.stringify({
        type : 'confirm', 
        message : data.text,
        btns : data.btns
      }));
      const handleMessage = function (event) {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'confirm_return') {
            if(message.success){
              resolve(message.result); 
            }else{
              reject(message.error); 
            }
            document.removeEventListener('message', handleMessage);
          }
        } catch (error) {
          console.error(`메시지를 구문 분석하는 중에 오류가 발생했습니다: ${error}`);
          reject(error); // 오류 발생 시 reject
        }
      };
      document.addEventListener('message', handleMessage);
    })
  }else{
    return confirm(data.text);
  }
}
