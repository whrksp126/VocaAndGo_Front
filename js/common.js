
// 비동기 fetch api
async function fetchDataAsync(url, method, data, form=false){
  let newUrl = url;
  const headers = {
    // 'Authorization': `Bearer ${accessToken}`
  }
  if(!form){ headers['Content-Type'] = `application/json`}
  let fetchOptions = { method, headers};
  if(method !== 'GET' && form) {
    const formData = new FormData();
    formData.append('json_data', JSON.stringify(data.json_data)) 
    data.form_data.forEach(({key, value})=>{
      formData.append(key, value);
    })
    fetchOptions.body = formData
  }
  if(method !== 'GET' && !form){
    fetchOptions.body = JSON.stringify(data);
  }
  if(method == 'GET' || method == 'DELETE'){
    newUrl += `?`
    for (const key in data) {
      const value = data[key];
      newUrl += `${key}=${value}&`;
    }
    console.log(newUrl);
  }
  fetchOptions.credentials = 'include';
  try {
    const response = await fetch(newUrl, fetchOptions);
    const contentType = response.headers.get('Content-Type');
    if (response.ok) {
      if (contentType.includes('application/json')) {
        return await response.json();
      } else if (contentType.includes('text')) {
        return await response.text();
      } else if (contentType.includes('audio')) {
        return await response.blob();
      } else {
        throw new Error(`Unsupported content type: ${contentType}`);
      }
    } else {
      throw new Error('문제가 발생했습니다.');
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

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
  let startY;
  let startHeight;
  let startTime;
  let isInternalScroll = false;
  
  _modal_content.addEventListener('touchstart', (event) => {
    const _eventBtn = findParentTarget(event.target, 'button');
    if(_eventBtn) return;
      if (_modal_middle.scrollTop !== 0 && _modal_middle.scrollTop + _modal_middle.offsetHeight !== _modal_middle.scrollHeight) {
          isInternalScroll = true;
      } else {
          isInternalScroll = false;
      }
  
      if (isInternalScroll) return;
  
      const p_top = 30 + 39 + 20;
      const p_bottom = 20;
      const maxHeight = _modal_middle.offsetHeight + p_top + p_bottom;
      _modal_content.style.maxHeight = `${maxHeight}px`;
      const touch = event.touches[0];
      startY = touch.clientY;
      startHeight = _modal_content.offsetHeight;
      startTime = new Date().getTime();
      _modal_content.style.transition = 'none';
  });
  
  _modal_content.addEventListener('touchmove', (event) => {
    const _eventBtn = findParentTarget(event.target, 'button');
      if(_eventBtn) return;
      if (isInternalScroll) return;
      const touch = event.touches[0];
      const moveY = touch.clientY;
      const distance = startY - moveY;
      const newHeight = startHeight + distance;
      const minHeight = 100; 
      if (newHeight > minHeight) {
          _modal_content.style.height = `${newHeight}px`;
      }
  });
  
  _modal_content.addEventListener('touchend', (event) => {
    const _eventBtn = findParentTarget(event.target, 'button');
    if(_eventBtn) return;
      if (isInternalScroll) return;
      _modal_content.style.transition = '';
      const finalHeight = _modal_content.offsetHeight;
      _modal_content.style.height = `${finalHeight}px`;
  
      const endTime = new Date().getTime(); 
      const duration = endTime - startTime; 
      const distance = event.changedTouches[0].clientY - startY; 
      const speed = distance / duration; 
  
      const speedThreshold = 0.5; 
      const distanceThreshold = 50; 
      if (speed > speedThreshold && distance > distanceThreshold) {
          _modal.click();
      }
  });
  
  
  



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
const clickSaveVocabulary = async (event, callback) => {
  const _modal = findParentTarget(event.target, '.modal');
  const VOCABULARY_NAME = document.querySelector('.vocabulary_name').value;
  const _colorLi = document.querySelector('.vocabulary_color li.active');
  const ID = _modal.dataset.id || crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const data = {
    name: VOCABULARY_NAME, 
    color: {main : _colorLi.dataset.color,background : _colorLi.dataset.background}, 
    createdAt: createdAt, 
    updatedAt: createdAt, 
    status: "active"
  }
  if(_modal.dataset.id){
    const result = await updateIndexedDbNotebook(Number(_modal.dataset.id), data.name, data.color, data.updatedAt, data.status);
    localStorageData.vocabulary_list = localStorageData.vocabulary_list.map(item => item.id === ID ? data : item);
  }else{
    const result = await addIndexedDbNotebook(data.name, data.color, data.createdAt, data.updatedAt, data.status);
  }
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


// GTTS 
const generateSpeech = async (text, language) => {
  const url = `https://vocaandgo.ghmate.com/tts/output`;
  const method = 'GET';
  const data = {text, language};
  const result = await fetchDataAsync(url, method, data);
  const audio_url = URL.createObjectURL(result);
  const _audio = new Audio(audio_url); 
  _audio.style.display = 'none'; 
  document.body.appendChild(_audio);
  _audio.onended = () => document.body.removeChild(_audio);
  _audio.play(); 
}