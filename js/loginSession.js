// URL에서 마지막 경로 값을 가져오는 함수
function getLastPathFromURL() {
  const path = window.location.pathname;
  let lastPath = path.substring(path.lastIndexOf('/') + 1);
  if (lastPath.endsWith('.html')) {
    lastPath = lastPath.substring(0, lastPath.lastIndexOf('.'));
  }
  return lastPath;
}

document.addEventListener('DOMContentLoaded', function() {
  const IS_MAIN_PAGES = ['login'];
  const curPage = getLastPathFromURL();
  const isLoginPage = IS_MAIN_PAGES.includes(curPage);
  const user_data = JSON.parse(localStorage.getItem('user'));
  if(!user_data && !isLoginPage || user_data.state == "logout" && !isLoginPage){
    window.location.href = '/html/login.html'
  }
})