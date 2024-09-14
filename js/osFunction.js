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

// // 이미지 조회
// function getImageSource (src) {
//   alert('동작함')
//   document.querySelector('.modal.ocr_word .modal_content .modal_middle .preview img').src = src;
// }

// window.addEventListener('message', function(event) {
//   const message = event.data;
//   alert('메시지 수신됨: ' + message);
// });
document.addEventListener('message', function(event) {
  const message = event.data;
  alert('(d)메시지 수신됨: ' + message);
});

function getImageSource() {
  alert('이미지를 수신했습니다.');
}

