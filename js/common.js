// URL에서 파라미터 
const getValueFromURL = (paramName) => {
  const urlParams = new URLSearchParams(window.location.search);
  // const paramValue = String(urlParams.get(paramName));
  const paramValue = urlParams.get(paramName);
  if (paramValue) {
    return paramValue;
  } else {
    return false;
  }
}

// 타겟의 부모요소 중 특정 부모가 있는지 찾아서 리턴함
const findParentTarget = (targetEl, parent) => {
  return targetEl.closest(parent);
}

// 로컬 스토리지에 데이터 저장
const setLocalStorageData = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
}


// 모달 기본 엘리먼트 추가
const openDefaultModal = (isBackClose=true) => {
  removeModal();
  history.replaceState({ modalOpen: true }, '', '');
  history.pushState({ modalOpen: true }, '', '');
  document.querySelector('body').insertAdjacentHTML('beforeend', defaultModalHtml());
  const _modal = document.querySelector('.modal');
  const _modal_content = document.querySelector('.modal_content');
  const _modal_top = document.querySelector('.modal_top');
  const _modal_middle = document.querySelector('.modal_middle');
  const _modal_bottom = document.querySelector('.modal_bottom');  
  _modal.addEventListener('click', event => clickHandler(event, isBackClose));
  window.addEventListener('popstate', onPopStateHandler);
  window.openModal = true;
  return { 
    container : _modal, 
    content: _modal_content, 
    top : _modal_top, 
    middle : _modal_middle, 
    bottom : _modal_bottom 
  }
}
const getDefaultModal = () => {
  const _modal = document.querySelector('.modal');
  const _modal_content = document.querySelector('.modal_content');
  const _modal_top = document.querySelector('.modal_top');
  const _modal_middle = document.querySelector('.modal_middle');
  const _modal_bottom = document.querySelector('.modal_bottom');  
  return { 
    container : _modal, 
    content: _modal_content, 
    top : _modal_top, 
    middle : _modal_middle, 
    bottom : _modal_bottom 
  }
}

// 모달 삭제
const removeModal = () => {
  window.removeEventListener('popstate', onPopStateHandler);
  history.replaceState({modalOpen:false}, '', '');
  const _modal = document.querySelector('.modal');
  if(_modal) _modal.remove();
  window.openModal = false;
}

// 모달 배경 클릭 시 닫기(이벤트 제거)
const clickHandler = (event, isBackClose) => {
  const target = event.target; 
  const isClose = findParentTarget(target, '.close');
  const isModalBackground = isBackClose ? target.classList.contains('modal') : false;
  if (isModalBackground || isClose) {
    history.back();
  };
};

// 뒤로 가기 이벤트 핸들러
const onPopStateHandler = (event) => {
  if (event.state && event.state.modalOpen) {
    const _modal = document.querySelector('.modal');
    _modal.classList.remove('active')
    setTimeout(()=>{
      removeModal();
    },300)
  }
};

// 색상 선택 이벤트 등록
const addEventClickColor = () => {
  const _vocabularyColor = document.querySelector('.vocabulary_color');
  _vocabularyColor.addEventListener('click',(event)=>{
    const _color = findParentTarget(event.target, 'li.color');
    if(!_color) return;
    _vocabularyColor.querySelector('.color.active').classList.remove('active');
    _color.classList.add('active');
  })
}

// 신규 단어장 추가 버튼 클릭 시
const clickSaveVocabulary = (event, callback) => {
  const _modal = findParentTarget(event.target, '.modal');
  const VOCABULARY_NAME = document.querySelector('.vocabulary_name').value;
  const _colorLi = document.querySelector('.vocabulary_color li.active');
  const ID = _modal.dataset.id || crypto.randomUUID();
  const data = {
    id : ID,
    name : VOCABULARY_NAME,
    colors : {main : _colorLi.dataset.color,background : _colorLi.dataset.background},
    counts : {total : 0,correct : 0}
  }
  if(_modal.dataset.id){
    localStorageData.vocabulary_list = localStorageData.vocabulary_list.map(item => item.id === ID ? data : item);
  }else{
    localStorageData.vocabulary_list.push(data);
  }
  setLocalStorageData('vocabulary_list', localStorageData.vocabulary_list);
  const VOCABULARY_LIST = JSON.parse(localStorage.getItem(ID)) || [];
  setLocalStorageData(ID, VOCABULARY_LIST);
  callback();
  _modal.click();
}

// 앱에서 개발자 로고 확인용
const createTestViewLog = () => {
  const _body = document.querySelector('body');
  const html = `<div id="logEl"></div>`
  _body.insertAdjacentHTML('beforeend', html)
}
const writeTestAppLog = (html) => {
  const _logEl = document.querySelector('#logEl');
  _logEl.insertAdjacentHTML('afterbegin', html)
}