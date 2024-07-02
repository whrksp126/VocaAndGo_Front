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
