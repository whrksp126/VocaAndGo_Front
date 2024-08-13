
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

// // 로컬 스토리지에 데이터 저장
// const setLocalStorageData = (key, value) => {
//   localStorage.setItem(key, JSON.stringify(value));
// }


// 모달 기본 엘리먼트 추가
const openDefaultModal = (scrollClose=false, isBackClose=true) => {
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

  if(scrollClose){
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
  }
  
  
  
  



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
const clickSaveVocabulary = async (event, htmlFun) => {
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
    // localStorageData.vocabulary_list = localStorageData.vocabulary_list.map(item => item.id === ID ? data : item);
  }else{
    const result = await addIndexedDbNotebook(data.name, data.color, data.createdAt, data.updatedAt, data.status);
  }
  const _ul = document.querySelector('main .container ul');
  _ul.innerHTML = await htmlFun();
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

// 마커 클릭 시
const clickMarker = async (event) => {
  const _li = findParentTarget(event.target, 'li') || findParentTarget(event.target, '.item') || findParentTarget(event.target, '.card');
  let status = Number(_li.dataset.status) + 1;
  if(status > 2) status = 0;
  _li.querySelector('img').src = `/images/marker_${status}.png`;
  _li.dataset.status = status;
  const word_id = Number(_li.dataset.id);
  await updateIndexedDbWord(word_id, {status : status});
}


// 테스트 설정 모달에서 시작 클릭 시
const clickStartTest = async (event, type, vocabulary_id=null) => {
  const vocabulary = getValueFromURL("vocabulary");
  const test_type = type;
  const view_types = document.querySelector('.view_types button.active').dataset.type;
  const word_types = document.querySelector('.word_types button.active').dataset.type;
  const problem_nums = Number(document.querySelector('.problem_nums input[type="number"]').value);
  let vocabulary_word_list = null;
  let urlParams = `vocabulary=${vocabulary}&test_type=${test_type}&view_types=${view_types}&word_types=${word_types}&problem_nums=${problem_nums}`;
  if(vocabulary == 'all'){
    vocabulary_word_list = await getVocabularyWordList();
  }
  if(vocabulary == 'each'){
    vocabulary_word_list = await getVocabularyWordList(vocabulary_id);
    urlParams += `vocabulary_id=${vocabulary_id}`
  }
  if(word_types != 'all'){ // 헷갈리는 단어만 선택 시
    vocabulary_word_list = vocabulary_word_list.filter((word)=>word.status == 2)
  }
  if(vocabulary_word_list.length < 4){
    return alert('테스트는 4개 이상의 단어가 필요합니다!')
  }
  await updateRecentLearningData("type", test_type);
  await updateRecentLearningData("state", "before");
  if(test_type == 'card'){
    await updateRecentLearningData("test_list", setTestWrodList(vocabulary_word_list, problem_nums));
  }else if(test_type == 'mcq'){
    const meaningValues = vocabulary_word_list.map(item => item.meaning);
    const wordValues = vocabulary_word_list.map(item => item.word);
    const randomMeanings = [];
    for (let i = 0; i < problem_nums; i++) {
      const selectedMeanings = [];
      const usedIndices = new Set(); // 이미 선택된 인덱스를 추적
      // 임의로 4개의 값을 선택하여 배열에 추가
      while (selectedMeanings.length < 4) {
        const randomIndex = Math.floor(Math.random() * meaningValues.length);
        if (!usedIndices.has(randomIndex)) {
          selectedMeanings.push({
            word : wordValues[randomIndex],
            meaning: meaningValues[randomIndex]
          });
          usedIndices.add(randomIndex); // 선택된 인덱스를 기록
        }
      }
      randomMeanings.push(selectedMeanings);
    }
    test_list = setTestWrodOptionList(vocabulary_word_list, problem_nums, randomMeanings);
    await updateRecentLearningData("test_list", test_list);
  }
  window.location.href=`/html/${type}_test.html?${urlParams}`
}

// INDEXED_DB 단어장 단어 호출
const getVocabularyWordList = async (vocabulary_id=null) => {
  const vocabulary_word_list = [];
  if(vocabulary_id == null){
    const noteBooks = await getIndexedDbNotebooks();
    for(const noteBook of noteBooks){
      const words = await getIndexedDbWordsByNotebookId(noteBook.id)
      vocabulary_word_list.push(...words);
    }
  }else{
    const words = await getIndexedDbWordsByNotebookId(vocabulary_id);
    vocabulary_word_list.push(...words);
  }

  return vocabulary_word_list;
}

// 전체 단어 리스트에서 테스트할 단어만 추출
const setTestWrodList = (vocabulary_word_list, problem_nums) => {
  let tempArray = [...vocabulary_word_list];
  for (let i = tempArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tempArray[i], tempArray[j]] = [tempArray[j], tempArray[i]];
  }
  return tempArray.slice(0, problem_nums);
}

// 전체 단어 리스트에서 테스트할 단어만 추출 후 옵션 추가
const setTestWrodOptionList = (vocabulary_word_list, problem_nums, option_list) => {
  let tempArray = [...vocabulary_word_list];
  for (let i = tempArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tempArray[i], tempArray[j]] = [tempArray[j], tempArray[i]];
  }
  tempArray = tempArray.slice(0, problem_nums);
  for (let i = 0; i < problem_nums; i++) {
    tempArray[i].options = option_list[i];
    let result = tempArray[i].options.findIndex(option => option.meaning === tempArray[i].meaning) + 1;
    if (result === 0) {
      const randomIndex = Math.floor(Math.random() * tempArray[i].options.length);
      tempArray[i].options[randomIndex] = {
        word : tempArray[i].word,
        meaning : tempArray[i].meaning,
      };
      result = randomIndex + 1;
    }
    tempArray[i].result = result;
  }
  
  return tempArray
}

// 테스트 결과 화면
const setTestResultsHtml = () => {
  const html = `
    <div class="test_result_box">
      <div class="top">
        <div class="progress_bar"></div>
      </div>
      <div class="btns">
        <button onclick="clickShowAnswer(event)" class="out_line">정답 보기</button>
        <button onclick="clickRetest(event, true)" class="gray">테스트 다시 하기</button>
        <button onclick="clickRetest(event, false)" class="fill">모르는 문제 다시 풀기</button>
      </div>
    </div>
  `
  document.querySelector('main').insertAdjacentHTML("beforeend", html);
  document.querySelector('.test_result_box').classList.add('active');
  setProGressBar()
}

// 원형 프로그래스 바 세팅
const setProGressBar = () => {
  const total = TEST_WORD_LIST.length;
  const correct_num = TEST_WORD_LIST.filter(data => data.isCorrect).length;
  console.log(total, correct_num)
  const _probressBar = document.querySelector('.progress_bar');
  console.log(_probressBar)
  const bar = new ProgressBar.Circle(_probressBar, {
    trailColor: '#FFEFFA',
    strokeWidth: 12.5,
    trailWidth: 12.5,
    easing: 'easeInOut',
    duration: 1400,
    // text: {autoStyleContainer: false},
    from: { color: '#FF8DD4', width: 12.5 },
    to: { color: '#FF8DD4', width: 12.5 },
    // 모든 애니메이션 호출에 대한 기본 단계 함수를 설정합니다.
    step: function(state, circle) {
      circle.path.setAttribute('stroke', state.color);
      circle.path.setAttribute('stroke-width', state.width);
      const value = Math.round(correct_num/total * 100);
      circle.setText(`
        <h2>${value + '점'}</h2>
        <div>
          <strong>${correct_num}</strong>
          <span>/${total}</span>
        </div>
      `);
    }
  });
  bar.animate(correct_num/total);  // 0.0에서 1.0 사이의 숫자
}

// 정답 보기 클릭 시
const clickShowAnswer = async (event) => {
  const modal = openDefaultModal();
  modal.container.classList.add('show_answer')
  modal.top.innerHTML = modalTopHtml(`정답 보기`);
  modal.middle.innerHTML = await setShowAnswerHtml();
  
  const btns = [
    {class:"gray", text: "틀린 단어 마크 등록", fun: `data-register="1" onclick="clickBatchSetMarkBtn(event, false)"`},
    {class:"pink", text: "맞은 단어 마크 등록", fun: `data-register="1" onclick="clickBatchSetMarkBtn(event, true)"`}
  ]
  modal.bottom.innerHTML = modalBottomHtml(btns);
  setTimeout(()=>modal.container.classList.add('active'),300)
}

// 다시 풀기 클릭 시
const clickRetest = async (event, is_all) => {
  await updateRecentLearningData("state", "during");
  if(!is_all) {
    TEST_WORD_LIST = TEST_WORD_LIST.filter((data)=>data.isCorrect == 0);  
  }
  TEST_WORD_LIST.forEach((data)=>data.isCorrect = undefined);
  await updateRecentLearningData("test_list", TEST_WORD_LIST);
  location.reload();
}

const getOcr = async (img, lngs) => {
  // OCR 처리
  let ocr_data = [];
  const result = await Tesseract.recognize(img, lngs.join('+'), {
    // logger: m => console.log(m)
  });
  // 인식된 텍스트와 위치 정보를 콘솔에 출력
  result.data.words.forEach(word => {
    console.log(`Text: ${word.text}, Bounding Box: ${JSON.stringify(word.bbox)}`);
    ocr_data.push({
      text: word.text,
      box : word.bbox
    })
  });
  return ocr_data;
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