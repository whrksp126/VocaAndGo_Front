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
  const isAppWebView = userAgent.includes('HeyVocaWebView');
  if (isAppWebView) {
    if (/Android/i.test(userAgent)) {
      return 'android';
    }
    else if (/iPhone|iPad|iPod/i.test(userAgent)) {
      return 'ios';
    }
  }
  return 'web';
}