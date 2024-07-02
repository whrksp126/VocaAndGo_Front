// true 일때는 뒤로가기가 되고 아니면 토스트 한번 띄우고 종료;
function is_backable() {
  writeTestAppLog(`<div>들어는 옴</div>`)
  let isBackable = true
  const IS_MAIN_PAGES = ['login', 'vocabulary_list', 'mypage'];
  const curPage = getLastPathFromURL();
  writeTestAppLog(`<div>curPage : ${curPage}</div>`)
  const isMainPage = IS_MAIN_PAGES.includes(curPage);
  const isModalOpen = document.querySelector('.modal');
  writeTestAppLog(`<div>isMainPage : ${isMainPage}</div>`)
  writeTestAppLog(`<div>isModalOpen : ${isModalOpen}</div>`)
  if(isMainPage && !isModalOpen) isBackable = false;
  return isBackable;
};
