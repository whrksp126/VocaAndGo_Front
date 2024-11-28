
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
    let max_height = 0;
    setTimeout(()=>{
      max_height = _modal_content.offsetHeight;
      _modal_content.style.setProperty('--max-height', `${max_height}px`);
    },500)
    _modal_content.addEventListener('touchstart', (event) => {
      const _eventBtn = findParentTarget(event.target, 'button');
      if(_eventBtn) return;
      const _scroll = findParentTarget(event.target, '.scroll');
      if(_scroll && _scroll.scrollTop != 0) return
      const touch = event.touches[0];
      startY = touch.clientY;
      startHeight = _modal_content.offsetHeight;
      startTime = new Date().getTime();
      _modal_content.style.transition = 'none';
    });
    
    _modal_content.addEventListener('touchmove', (event) => {
      const _eventBtn = findParentTarget(event.target, 'button');
      if(_eventBtn) return;
      const _scroll = findParentTarget(event.target, '.scroll');
      if(_scroll && _scroll.scrollTop != 0) return
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
      const _scroll = findParentTarget(event.target, '.scroll');
      if(_scroll && _scroll.scrollTop != 0) return
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
      }else{
        _modal_content.style.height = `var(--max-height)`;
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
  const vocabulary_name = document.querySelector('.vocabulary_name').value.trim();
  const _colorLi = document.querySelector('.vocabulary_color li.active');
  const id = _modal.dataset.id || crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const data = {
    name: vocabulary_name, 
    color: {main : _colorLi.dataset.color, background : _colorLi.dataset.background}, 
    createdAt: createdAt, 
    updatedAt: createdAt, 
    status: "active"
  }
  if(vocabulary_name.length <= 0) return alert('단어장 이름을 입력해 주세요.');
  if(_modal.dataset.id){
    const id = Number(_modal.dataset.id);
    const name = vocabulary_name;
    const color = {main : _colorLi.dataset.color, background : _colorLi.dataset.background};
    const status = 0;
    console.log(id, name, color, status)
    const result = await updateWordbook(id, name, color, status);
    console.log(result);
    // const result = await updateIndexedDbNotebook(Number(_modal.dataset.id), data.name, data.color, data.updatedAt, data.status);
    
  }else{
    const name = vocabulary_name;
    const color = {main : _colorLi.dataset.color, background : _colorLi.dataset.background};
    const status = 0;
    const result = await addWordbook(name, color, status);
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
  const isTestPage = ['card_test', 'mcq_test'].includes(document.querySelector('body').dataset.page);
  let status; 
  let word_id;
  if(isTestPage){ // 테스트 페이지
    const word_data = TEST_WORD_LIST[Number(_li.dataset.index)]
    status = (word_data.status + 1) % 3;
    word_id = word_data.id;
  }else{ // 기본 페이지
    status = (Number(_li.dataset.status) + 1) % 3;
    word_id = Number(_li.dataset.id);
  }
  _li.dataset.status = status;
  _li.querySelector('img').src = `/images/marker_${status}.png?v=2024.08.270203`;
  const result = await updateWord(word_id, {status : status});
  if(isTestPage){
    if(TEST_WORD_LIST)TEST_WORD_LIST.find((data)=>data.id == word_id).status = status;
    const rescentStudy = await getRecentStudy();
    await updateRecentStudy(rescentStudy.id, {test_list : TEST_WORD_LIST});
  }
}


// 테스트 설정 모달에서 시작 클릭 시
const clickStartTest = async (event, type, vocabulary_id=null) => {
  const vocabulary = getValueFromURL("vocabulary");
  const test_type = type;
  const view_types = document.querySelector('.view_types button.active')?.dataset.type;
  const word_types = document.querySelector('.word_types button.active')?.dataset.type;
  const problem_nums = Number(document.querySelector('.problem_nums input[type="number"]').value);
  let vocabulary_word_list = null;
  let urlParams = `vocabulary=${vocabulary}&test_type=${test_type}&view_types=${view_types}&word_types=${word_types}&problem_nums=${problem_nums}`;
  if(vocabulary == 'all'){
    vocabulary_word_list = await getWordsByWordbook();
  }
  if(vocabulary == 'each'){
    vocabulary_word_list = await getWordsByWordbook(vocabulary_id);
    urlParams += `vocabulary_id=${vocabulary_id}`
  }
  if(word_types != 'all'){ // 헷갈리는 단어만 선택 시
    vocabulary_word_list = vocabulary_word_list.filter((word)=>word.status == 2)
  }
  if(vocabulary_word_list.length < 4){
    return alert('테스트는 4개 이상의 단어가 필요합니다!')
  }
  const recentStudy = await getRecentStudy();
  
  const createMcqTestList = () => {
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
    return randomMeanings;
  }

  // 기존 학습 기록이 있고, state == 0 이면 해당 데이터 삭제!
  if(recentStudy && recentStudy.state == 0) {
    await deleteRecentStudy(recentStudy.id);
  }
  
  if(test_type == 'card'){
    await createRecentStudy("CARD", 0, urlParams, setTestWrodList(vocabulary_word_list, problem_nums));  
  }else if(test_type == 'mcq'){
    randomMeanings = createMcqTestList()
    await createRecentStudy("MCQ", 0, urlParams, setTestWrodOptionList(vocabulary_word_list, problem_nums, randomMeanings))
  }else if(test_type == 'example_fitb'){
    // await updateRecentLearningData("test_list", setTestExampleList(vocabulary_word_list, problem_nums));
  }
  window.location.href=`/html/${type}_test.html?${urlParams}`
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

// 전체 단어 리스트에서 테스트할 예문만 추출
const setTestExampleList = (vocabulary_word_list, problem_nums) => {
  let tempArray = vocabulary_word_list.filter(({example}) => example);
  let selectedArray = [];
  for (let i = 0; i < problem_nums; i++) {
    const j = Math.floor(Math.random() * (tempArray.length - i));
    selectedArray.push(tempArray[j]);
    [tempArray[j], tempArray[tempArray.length - i - 1]] = [tempArray[tempArray.length - i - 1], tempArray[j]];
  }
  for (let i = 0; i < problem_nums; i++) {
    console.log(highlightWordAndMeaning(selectedArray[i]))
  }
  return selectedArray;
}

function highlightWordAndMeaning(data) {
  // example 리스트에서 랜덤한 항목 선택
  const randomIndex = Math.floor(Math.random() * data.example.length);
  const selectedExample = data.example[randomIndex];

  const baseWord = data.word;
  const originSentence = selectedExample.origin;
  const exampleMeaning = selectedExample.meaning;
  const meaningList = data.meaning;

  let originResult = null;
  let meaningResult = null;

  // 정규 표현식을 이용해 baseWord의 어형 변화를 찾음
  const wordRegex = new RegExp(`(${baseWord}(ed|s|ing)?)`, 'gi');

  // originSentence에서 baseWord의 변형을 <strong>으로 감싸기
  const highlightedOriginSentence = originSentence.replace(wordRegex, (match) => {
      originResult = match;  // 매칭된 단어 저장
      return `<strong>${match}</strong>`;
  });

  // strong 태그가 없는 부분을 span 태그로 감싸기
  const finalOriginHtml = highlightedOriginSentence.split(/(<strong>.*?<\/strong>)/g)
      .map(part => part.startsWith('<strong>') ? part : `<span>${part.trim()}</span>`)
      .join(' ');

  // example.meaning에서 meaningList의 단어들을 strong으로 감싸기
  const highlightedMeaningSentence = meaningList.reduce((sentence, meaningWord) => {
      const meaningRegex = new RegExp(`(${meaningWord})`, 'gi');
      return sentence.replace(meaningRegex, (match) => {
          meaningResult = match;  // meaning 단어 저장
          return `<strong>${match}</strong>`;
      });
  }, exampleMeaning);

  // meaning 부분도 나머지를 span 태그로 감싸기
  const finalMeaningHtml = highlightedMeaningSentence.split(/(<strong>.*?<\/strong>)/g)
      .map(part => part.startsWith('<strong>') ? part : `<span>${part.trim()}</span>`)
      .join(' ');

  // 결과로 html과 매칭된 단어 반환
  return {
      origin_html: finalOriginHtml.trim(),  // origin의 최종 HTML
      meaning_html: finalMeaningHtml.trim(),  // meaning의 최종 HTML
      result: originResult || meaningResult  // 매칭된 단어
  };
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
        <button onclick="clickShowAnswer(event)" class="out_line">정답 확인</button>
        <button onclick="clickRetestModalBtn(event)" class="gray">테스트 다시 하기</button>
        <button onclick="window.location.href='/html/test.html'" class="fill">테스트 종료</button>
      </div>
    </div>
  `
  document.querySelector('main').insertAdjacentHTML("beforeend", html);
  document.querySelector('.test_result_box').classList.add('active');
  setProGressBar()
  
}

// 테스트 다시 하기 버튼 클릭 시
const clickRetestModalBtn = async (event) => {
  const modal = openDefaultModal();
  modal.container.classList.add('retest')
  modal.top.innerHTML = modalTopHtml(`테스트 다시 하기 설정`);
  modal.middle.innerHTML = `
    <div class="radio_btns">
      <button class="active" data-type="only_wrong">
        <i class="ph-bold ph-check"></i>
        <span>틀린 문제만 다시 풀기</span>
      </button>
      <button data-type="all">
        <i class="ph-bold ph-check"></i>
        <span>전체 다시 풀기</span>
      </button>
    </div>
  `;
  
  const btns = [
    {class:"gray close", text: "취소", fun: ``},
    {class:"pink", text: "시작", fun: `onclick="clickRetest(event)"`}
  ]
  modal.bottom.innerHTML = modalBottomHtml(btns);
  setTimeout(()=>modal.container.classList.add('active'),300)
  modal.middle.addEventListener('click', (event)=>{
    const _btn = findParentTarget(event.target, 'button');
    if(!_btn)return;
    const _radioBtns = findParentTarget(event.target, '.radio_btns');
    _radioBtns.querySelector('button.active').classList.remove('active');
    _btn.classList.add('active');
  });

}

// 원형 프로그래스 바 세팅
const setProGressBar = async () => {
  const recentStudy = await getRecentStudy();
  const total = recentStudy.test_list.length;
  const correct_num = recentStudy.test_list.filter(data => data.isCorrect).length;
  const _probressBar = document.querySelector('.progress_bar');
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

// 정답 확인 클릭 시
const clickShowAnswer = async (event) => {
  const modal = openDefaultModal(true);
  modal.container.classList.add('show_answer')
  modal.top.innerHTML = modalTopHtml(`정답 확인`);
  modal.middle.innerHTML = await setShowAnswerHtml();
  modal.middle.classList.add('scroll');
  const btns = [
    {class:"gray", text: "틀린 단어 마크 등록", fun: `data-register="1" onclick="clickBatchSetMarkBtn(event, false)"`},
    {class:"pink", text: "맞은 단어 마크 등록", fun: `data-register="1" onclick="clickBatchSetMarkBtn(event, true)"`}
  ]
  modal.bottom.innerHTML = modalBottomHtml(btns);
  setTimeout(()=>modal.container.classList.add('active'),300)
}

// 마크 일괄 조작 버튼 클릭 시
const clickBatchSetMarkBtn = async (event, isCorrect) => {
  const isRegister = Number(event.target.dataset.register);
  const updateMarkAndStatus = async (word_id, status) => {
    const _li = document.querySelector(`li[data-id="${word_id}"]`);
    _li.querySelector('img').src = `/images/marker_${status}.png?v=2024.08.270203`;
    await updateWord(word_id, status)
    TEST_WORD_LIST.find((data)=>data.id == word_id).status = status;
    const recentStudy = await getRecentStudy();
    await updateRecentStudy(recentStudy.id, {test_list : TEST_WORD_LIST});
  };
  for (let i = 0; i < TEST_WORD_LIST.length; i++) {
    const data = TEST_WORD_LIST[i];
    const word_id = data.id;
    if (data.isCorrect && isCorrect && isRegister) {
      await updateMarkAndStatus(word_id, 1); // 맞은 단어 마크 등록
    } else if (data.isCorrect && isCorrect && !isRegister) {
      await updateMarkAndStatus(word_id, 0); // 맞은 단어 마크 해제
    } else if (!data.isCorrect && !isCorrect && isRegister) {
      await updateMarkAndStatus(word_id, 2); // 틀린 단어 마크 등록
    } else if (!data.isCorrect && !isCorrect && !isRegister) {
      await updateMarkAndStatus(word_id, 0); // 틀린 단어 마크 해제
    }
  }
  const nextBtnText = `${isCorrect ? '맞은' : '틀린'} 단어 마크 ${isRegister ? '해제' : '등록'}`;
  event.target.innerHTML = nextBtnText;
  event.target.dataset.register = isRegister == 0 ? 1 : 0;
};

// 다시 풀기 클릭 시
const clickRetest = async (event) => {
  const recentStudy = await getRecentStudy();
  
  await updateRecentStudy(recentStudy.id, {state:0});
  // await updateRecentLearningData("state", "during");
  const modal = getDefaultModal();
  const type = modal.middle.querySelector('button.active').dataset.type;
  if(type != "all"){
    TEST_WORD_LIST = TEST_WORD_LIST.filter((data)=>data.isCorrect == 0);  
  }
  TEST_WORD_LIST.forEach((data)=>data.isCorrect = undefined);
  await updateRecentStudy(recentStudy.id, {test_list:TEST_WORD_LIST});
  // await updateRecentLearningData("test_list", TEST_WORD_LIST);
  location.reload();
}

// Highlight Text 세팅
const setHighlightText = (text, keyword) => {
  const regex = new RegExp(`(${keyword})`, 'gi');
  return text.split(regex).map(part =>
    part.toLowerCase() === keyword.toLowerCase() ? `<strong>${part}</strong>` : `<span>${part}</span>`
  ).join('');
}

const getOcr = async (img, lngs) => {
  let ocr_data = [];
  
  try {    
    // OCR 처리 시작
    const result = await Tesseract.recognize(img, lngs.join('+'), {
      // logger: m => console.log(m)
    });

    // 인식된 텍스트와 위치 정보를 콘솔에 출력
    result.data.words.forEach(word => {
      console.log(`Text: ${word.text}, Bounding Box: ${JSON.stringify(word.bbox)}`);
      ocr_data.push({
        text: word.text,
        box: word.bbox
      });
    });
    
  } catch (error) {
    console.error('OCR 처리 중 오류 발생:', error);
  }

  return ocr_data;
};


// GTTS 
const generateSpeech = async (text, language) => {
  if(getDevicePlatform() == 'web'){
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
  if(getDevicePlatform() == 'app'){  
    const languageMap  = {'en' : 'en-US', 'ko' : 'ko-KR'}
    getNativeTTS(text, languageMap[language])
  }
}