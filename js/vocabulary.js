// 검색 시 사용할 전역 리스트 변수
let SEARCH_LIST = [];
let OCR_DATA = {};
// 단어장 추가 버튼 클릭 시
const clickAddWord = async (event) => {
  const ID = getValueFromURL("vocabulary_id");
  const modal = openDefaultModal();
  modal.container.classList.add('add_word')
  modal.top.innerHTML = modalTopHtml(`단어 추가`, `
    <div></div>
    <h1>단어 추가</h1>
    <button onclick="clickOpenOcrCamera(event, ocrCameraCallback)">
      <i class="ph ph-camera"></i>
    </button>
  `);
  const DATA = {id: ID, word : "",meaning : "", examples : [],description : "",};
  modal.middle.innerHTML = await setWordModalHtml(DATA);
  const btns = [
    {class:"close gray", text: "취소", fun: ""},
    {class:"pink", text: "추가", fun: `onclick="clickModalsetWordBtn(event)"`}
  ]
  modal.bottom.innerHTML = modalBottomHtml(btns);
  setTimeout(()=>modal.container.classList.add('active'),300)
}
const ocrCameraCallback = (original, view, crop) => {
  selectOcrWordFun(original, view, crop)
}
const selectOcrWordFun = async (original, view, crop) => {
  // OCR 데이터 가져오기
  
  // const ocr_data_list = await getOcr(crop.img, ['eng', 'kor', 'jpn']);
  const ocr_data_list = await getOcr(crop.img, ['eng']);

  const url = `https://vocaandgo.ghmate.com/search/en`;
  const method = 'GET';
  for (const ocr_data of ocr_data_list) {
    const data = { word: ocr_data.text };
    try {
      const result = await fetchDataAsync(url, method, data);
      if (result.code != 200) {
        console.error('검색 에러');
      } else {
        ocr_data.search_list = result.data;
      }
    } catch (error) {
      console.error('API 요청 중 오류 발생:', error);
    }
  }
  // TODO : 모달 변경

  const modal = getDefaultModal();
  modal.container.classList.add('ocr_word')
  modal.top.innerHTML = modalTopHtml(`단어 선택`);
  modal.middle.innerHTML = `
    <div class="preview">
      <img src="${view.img}">
      <div class="highlighter"></div>
    </div>
    <ul class="search_list active"></ul>
  `;
  const _searchList = modal.middle.querySelector('.search_list');
  let search_list = []
  
  ocr_data_list.forEach((ocr_data)=>{
    if(ocr_data.search_list.length<=0) return 
    ocr_data.search_list.forEach((search_data)=>{
      if (search_data.word.toUpperCase() === ocr_data.text.toUpperCase()) {
        search_data.box = ocr_data.box;
        search_list = [...search_list, search_data]
      }
    })
  })
  OCR_DATA = {original, view, crop, search_list};
  setSearchListEl(_searchList, search_list);
  const btns = [
    {class:"gray", text: "재촬영", fun: `onclick="clickOpenOcrCamera(event, ocrCameraCallback)"`},
  ]
  modal.bottom.innerHTML = modalBottomHtml(btns);
}





// 단어 수정 버튼 클릭 시
const clickEditVocabularyBook = async (event) => {
  const notebookId = Number(getValueFromURL("vocabulary_id"));
  const WORD_ID = Number(findParentTarget(event.target, 'li').dataset.id);
  const modal = openDefaultModal();
  modal.container.dataset.id = WORD_ID;
  modal.container.classList.add('add_word');
  modal.top.innerHTML = modalTopHtml(`단어 수정`);
  const word = await getIndexedDbWordById(WORD_ID);
  const DATA = {id: notebookId, word : word.word, meaning : word.meaning, example : word.example, description : word.description,};
  modal.middle.innerHTML = await setWordModalHtml(DATA);
  const btns = [
    {class:"close gray", text: "취소", fun: ""},
    {class:"pink", text: "수정", fun: `onclick="clickModalsetWordBtn(event)"`}
  ]
  modal.bottom.innerHTML = modalBottomHtml(btns);
  setTimeout(()=>modal.container.classList.add('active'),300)

}
// 단어 삭제 버튼 클릭 시
const clickDeleteWordBook = (event) => {
  const WORD_ID = findParentTarget(event.target, 'li').dataset.id;
  const modal = openDefaultModal();
  modal.container.classList.add('confirm');
  modal.container.dataset.id = WORD_ID;
  modal.middle.innerHTML = `
    <h3>단어를 정말 삭제하시겠어요?</h3>
    <span>삭제 후에는 복구가 불가능해요 😢</span>
  `;
  const btns = [
    {class:"close gray", text: "취소", fun: ""},
    {class:"pink", text: "삭제", fun: `onclick="clickModalDeleteWordBook(event)"`}
  ]
  modal.bottom.innerHTML = modalBottomHtml(btns);
  setTimeout(()=>modal.container.classList.add('active'),300)
}

// 수정 버튼 클릭 시
const clickEditWord = (event) => {
  const id = getValueFromURL("vocabulary_id");
  window.location.href = `/html/vocabulary_edit.html?vocabulary_id=${id}`;
}

// 단어장 페이지로 이동
const clickGoBackVocabularyPage = (event) => {
  const id = getValueFromURL("vocabulary_id");
  window.location.href = `/html/vocabulary.html?vocabulary_id=${id}`;
}

// 단어 설정 모달에서 저장 클릭 시
const clickModalsetWordBtn = async (event) => {
  const prev_vocabulary_id = Number(getValueFromURL("vocabulary_id"));
  const _modal = findParentTarget(event.target, '.modal');
  
  const vocabulary_id = Number(_modal.querySelector('.vocabulary').value);
  const word_id = Number(_modal.dataset.id);
  const word = _modal.querySelector('input.word').value.trim();
  const meaning = _modal.querySelector('input.meaning').value.split(',').map(item => item.trim()).filter(Boolean);
  const example = _modal.querySelector('input.example').value;
  console.log('example,',example)
  const explanation = _modal.querySelector('input.explanation').value;
  const createdAt = new Date().toISOString();
  const new_data = {
    notebookId : Number(vocabulary_id),
    word : word,
    meaning : meaning,
    example : [],
    description : explanation,
    status : 0,
    updatedAt : new Date().toISOString()
  }
  // if(word.length <= 0) return alert('단어는 필수 입력 사항입니다');
  // if(meaning.length <= 0) return alert('의미는 필수 입력 사항입니다');
  // if(_modal.dataset.id){
  //   const result = await updateIndexedDbWord(word_id, new_data);
  // }else{
  //   const result = await addIndexedDbWord(new_data.notebookId, new_data.word, new_data.meaning, new_data.example, new_data.description, createdAt, createdAt, new_data.status);
  // }
  // _modal.click();
  // const _ul = document.querySelector('main .container ul');
  // _ul.innerHTML = await setVocabularyHtml(prev_vocabulary_id);
  // TODO : 단어 저장, 수정, 삭제 기능 구현
}
// 단어 삭제 모달에서 삭제 클릭 시
const clickModalDeleteWordBook = async (event) => {
  const VOCABULARY_ID = Number(getValueFromURL("vocabulary_id"));
  const _modal = findParentTarget(event.target, '.modal');
  const WORD_ID = Number(_modal.dataset.id);
  const reuslt = await deleteIndexedDbWord(WORD_ID);
  _modal.click();
  const _ul = document.querySelector('main .container ul');
  _ul.innerHTML = await setVocabularyHtml(VOCABULARY_ID);
}

// 선택 삭제 버튼 클릭 시
const clickDeleteSelectBtn = (event) => {
  const modal = openDefaultModal();
  modal.container.classList.add('confirm');
  modal.middle.innerHTML = `
    <h3>선택한 단어를 정말 삭제하시겠어요?</h3>
    <span>삭제 후에는 복구가 불가능해요 😢</span>
  `;
  const btns = [
    {class:"close gray", text: "취소", fun: ""},
    {class:"pink", text: "삭제", fun: `onclick="clickModalDeleteSelectWordBook(event)"`}
  ]
  modal.bottom.innerHTML = modalBottomHtml(btns);
  setTimeout(()=>modal.container.classList.add('active'),300)
}

// 선택 단어 삭제 모달에서 삭제 클릭 시
const clickModalDeleteSelectWordBook = async (event) => {
  const VOCABULARY_ID = getValueFromURL("vocabulary_id");
  const __selectWord = document.querySelectorAll('main .container ul li .input_checkbox input[type="checkbox"]:checked');
  for(let _selectWord of __selectWord){
    const result = await deleteIndexedDbWord(Number(_selectWord.id));
  }
  const _modal = findParentTarget(event.target, '.modal');
  _modal.click();
  const _ul = document.querySelector('main .container ul');
  _ul.innerHTML = await setVocabularyHtml(VOCABULARY_ID);
}

// 단어장 명 세팅
const setVocabularyNameHtml = async (id) => {
  const noteBook = await getIndexedDbNotebookById(Number(id));
  document.querySelector('header .container h2').innerHTML = noteBook.name;
  
}
// 단어 리스트 세팅
const setVocabularyHtml = async (id) => {
  let html = '';
  const words = await getIndexedDbWordsByNotebookId(Number(id));
  const noteBook = await getIndexedDbNotebookById(Number(id));
  const bodyStyle = document.querySelector('body').style;
  // bodyStyle.setProperty('--card-color', `#${noteBook.color.main}`);
  // bodyStyle.setProperty('--card-background', `#${noteBook.color.background}`);
  // bodyStyle.setProperty('--progress-color', `#${noteBook.color.main}4d`); // 색상 코드에 투명도 추가
  bodyStyle.setProperty('--card-color', `#FF8DD4`);
  bodyStyle.setProperty('--card-background', `#FFEFFA`);
  bodyStyle.setProperty('--progress-color', `#FF8DD44d`); // 색상 코드에 투명도 추가
  for(let word of words){
     html += `
      <li 
        data-id="${word.id}"
        data-status="${word.status}"
      >
        <div class="input_checkbox">
          <input type="checkbox" id="${word.id}">
          <label for="${word.id}">
            <i class="ph ph-square"></i>
            <i class="ph-fill ph-check-square"></i>
          </label>
        </div>
        <div class="top">
          <div class="left">
            <div class="word">${word.word}</div>
            <button class="marker" onclick="clickMarker(event)">
              <img src="/images/marker_${word.status}.png?v=2024.08.270203">
            </button>
          </div>
          <div class="right">
            <div class="btns">
              <button class="sound_btn" onclick="generateSpeech(event, '${word.word}', 'en')"><i class="ph-fill ph-speaker-high"></i></button>
              <button onclick="clickEditVocabularyBook(event)" class="edit_btn"><i class="ph ph-pencil-simple"></i></button>
              <button onclick="clickDeleteWordBook(event)" class="delete_btn"><i class="ph ph-trash"></i></button>
            </div>
          </div>
        </div>
        <div class="bottom">
          <div class="meaning">${word.meaning}</div>
        </div>
      </li>
    `
  }
  return html;
}

// 단어 입력 시
const onInputWord = async (event) => {
  const word = event.target.value.trim();
  const _searchList = findParentTarget(event.target, '.input_text').querySelector('.search_list');
  if(word.length < 2) {
    _searchList.classList.remove('active'); 
    return
  };
  await getSearchWordData(word);
  setSearchListEl(_searchList, SEARCH_LIST, word)
}

// 검색 리스트 엘리먼트 세팅
const setSearchListEl = (_el, search_list, word) => {
  _el.classList.toggle('active', search_list.length > 0);
  _el.innerHTML = '';  
  search_list.forEach(({ word: dataWord, meanings }, index) => {
    const search_word_html = setHighlightText(dataWord, word?word:dataWord);
    const search_meaning_html = meanings.join(', ');
    _el.insertAdjacentHTML('beforeend', `
      <li onclick="${word?`clickSelectSearchedWord(event)`:`clickSelectOcrSearchedWord(event, ${index})`}" data-index="${index}">
        <div class="search_word">${search_word_html}</div>
        <div class="search_meaning">${search_meaning_html}</div>
      </li>
    `);
  });
}


// 의미 입력 시
const onInputMeaning = async (event) => {
  const word = event.target.value.trim();
  const _searchList = findParentTarget(event.target, '.input_text').querySelector('.search_list');
  if(word.length < 2) {
    _searchList.classList.remove('active'); 
    return
  };
  await getSearchMeaningData(word);
  _searchList.classList.toggle('active', SEARCH_LIST.length > 0);
  _searchList.innerHTML = '';  
  SEARCH_LIST.forEach(({ word: dataWord, meaning }, index) => {
    _searchList.insertAdjacentHTML('beforeend', `
      <li onclick="clickSelectSearchedWord(event)" data-index="${index}">
        <div class="search_word">${highlightWord(meaning, word)}</div>
        <div class="search_meaning">${dataWord}</div>
      </li>
    `);
  });
}

// 단어 검색 요청 
const getSearchWordData = async (word) => {
  const url = `https://vocaandgo.ghmate.com/search/partial/en`;
  const method = 'GET';
  const data = {word : word};
  const result = await fetchDataAsync(url, method, data);
  if(result.code != 200){ console.error('검색 에러')}
  SEARCH_LIST = result.data
  return;
}
// 의미 검색 요청
const getSearchMeaningData = async (word) => {
  const url = `https://vocaandgo.ghmate.com/search/partial/ko`;
  const method = 'GET';
  const data = {word : word};
  const result = await fetchDataAsync(url, method, data);
  if(result.code != 200){ console.error('검색 에러')}
  console.log(result)
  SEARCH_LIST = result.data
  return;
}

// 검색된 단어 선택 시 
const clickSelectSearchedWord = (event) => {
  const data = SEARCH_LIST[Number(findParentTarget(event.target, 'li').dataset.index)];
  const _wordInput = document.querySelector('.input_text .word');
  const _meaningInput = document.querySelector('.input_text .meaning');
  const _exampleInput = document.querySelector('.input_text .example');
  const _explanationInput = document.querySelector('.input_text .explanation');
  _wordInput.value = data.word;
  _meaningInput.value = data.meanings ? data.meanings.join(', ') : data.meaning;
  SEARCH_LIST = [];
  const _searchList = findParentTarget(event.target, '.input_text').querySelector('.search_list');
  _searchList.classList.remove('active'); 
}
// OCR 검색된 단어 선택 시
const clickSelectOcrSearchedWord = (event, index) => {
  const cur_img_rect = document.querySelector('.ocr_word .preview img').getBoundingClientRect();
  const marker_x = -((OCR_DATA.view.visible.w / 2) - (cur_img_rect.width / 2)) + OCR_DATA.crop.visible.x + OCR_DATA.search_list[index].box.x0;
  const marker_y = -((OCR_DATA.view.visible.h / 2) - (cur_img_rect.height / 2)) + OCR_DATA.crop.visible.y + OCR_DATA.search_list[index].box.y0;
  const marker_w = OCR_DATA.search_list[index].box.x1 - OCR_DATA.search_list[index].box.x0;
  const marker_h = OCR_DATA.search_list[index].box.y1 - OCR_DATA.search_list[index].box.y0;
  
  const _highlighter = document.querySelector('.preview .highlighter');
  _highlighter.style.top = `${marker_y}px`;
  _highlighter.style.left = `${marker_x}px`;
  _highlighter.style.width = `${marker_w}px`;
  _highlighter.style.height = `${marker_h}px`;
  _highlighter.classList.add('active');


  const modal = getDefaultModal();
  modal.container.classList.add('ocr_word')
  modal.top.innerHTML = modalTopHtml(`단어 추가`);
  const __searchWord = modal.middle.querySelectorAll('.search_list li');
  __searchWord.forEach((_searchWord)=>{
    if(_searchWord.dataset.index != index){
      _searchWord.classList.add("hidden");
    }
  })
  const btns = [
    {class:"gray", text: "다시 선택", fun: `onclick="clickSelectAgainOcrSearchedWord(event)"`},
    {class:"pink", text: "추가", fun: `onclick="clickAddOcrSearchedWord(event)"`},
  ]
  modal.bottom.innerHTML = modalBottomHtml(btns);
}
// ocr 단어 선택 모달 다시 선택 클릭 시 
const clickSelectAgainOcrSearchedWord = (event) => {
  const modal = getDefaultModal();
  const __searchWord = modal.middle.querySelectorAll('.search_list li');
  const _highlighter = document.querySelector('.preview .highlighter');
  __searchWord.forEach((_searchWord)=>{
    _searchWord.classList.remove("hidden");
  })
  _highlighter.classList.remove('active');
  modal.container.classList.add('ocr_word')
  modal.top.innerHTML = modalTopHtml(`단어 선택`);
  const btns = [
    {class:"gray", text: "재촬영", fun: `onclick="clickOpenOcrCamera(event, ocrCameraCallback)"`},
  ]
  modal.bottom.innerHTML = modalBottomHtml(btns);
}
// ocr 단어 선택 모달 추가 버튼 클릭 시
const clickAddOcrSearchedWord = async (event) => {
  const modal = getDefaultModal();
  const index = modal.middle.querySelector('.search_list li:not(.hidden)').dataset.index;
  const search_word = OCR_DATA.search_list[index];
  modal.container.classList.add('add_word')
  modal.top.innerHTML = modalTopHtml(`단어 추가`, `
    <div></div>
    <h1>단어 추가</h1>
    <button onclick="clickOpenOcrCamera(event, ocrCameraCallback)">
      <i class="ph ph-camera"></i>
    </button>
  `);
  const DATA = {id: "", word : search_word.word, meaning : search_word.meanings.join(", "), example : "", description : ""};
  modal.middle.innerHTML = await setWordModalHtml(DATA);
  const btns = [
    {class:"close gray", text: "취소", fun: ""},
    {class:"pink", text: "추가", fun: `onclick="clickModalsetWordBtn(event)"`}
  ]
  modal.bottom.innerHTML = modalBottomHtml(btns);
}
// 한글 문자를 자모로 분리하는 함수
function splitHangul(char) {
  const initialConsonants = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ";
  const vowels = "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ";
  const finalConsonants = " ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ";

  // 한글 유니코드 범위 내에서 처리
  const code = char.charCodeAt(0) - 44032;
  if (code < 0 || code > 11171) {
      return [char]; // 한글 음절 범위 밖의 문자 처리
  }

  // 자모 분리
  const initialConsonant = initialConsonants[Math.floor(code / 588)];
  const vowel = vowels[Math.floor((code % 588) / 28)];
  const finalConsonant = finalConsonants[code % 28];

  // 빈 문자 제거 후 반환
  return [initialConsonant, vowel, finalConsonant].filter(c => c !== ' ');
}

// 입력받은 단어와 키워드를 비교하여 강조 표시하는 함수
function highlightWord(word, keyword) {
  const splitKeyword = keyword.split('').map(splitHangul).flat();
  const result = [];

  let i = 0;
  while (i < word.length) {
    const remainingWord = word.slice(i);
    const matchedLength = matchStarting(remainingWord, splitKeyword);

    // 키워드와 일치하는 부분 강조
    if (matchedLength > 0) {
      result.push(`<strong>${word.slice(i, i + matchedLength)}</strong>`);
      i += matchedLength;
    } else {
      // 일치하지 않는 부분은 그대로 유지
      result.push(`<span>${word[i]}</span>`);
      i += 1;
    }
  }

  return result.join('');
}

// 단어의 시작 부분과 키워드를 비교하여 일치하는 길이를 반환하는 함수
function matchStarting(word, splitKeyword) {
  for (let i = 1; i <= word.length; i++) {
    const slice = word.slice(0, i).split('').map(splitHangul).flat();
    if (slice.slice(0, splitKeyword.length).join('') === splitKeyword.join('')) {
      return i;
    }
  }
  return 0;
}


const setInitHtml = async () => {
  const index_status = await waitIndexDbOpen();
  if(index_status == "on"){
    const id = getValueFromURL("vocabulary_id");
    setVocabularyNameHtml(id);
    const _ul = document.querySelector('main .container ul');
    _ul.innerHTML = await setVocabularyHtml(id);
  }
  if(index_status == "err"){
    alert("데이터 호출 err")
  }

}
setInitHtml();