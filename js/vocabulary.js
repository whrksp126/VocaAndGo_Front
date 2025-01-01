// 검색 시 사용할 전역 리스트 변수
let SEARCH_LIST = [];
let TEMP_WORD = {
  id: null, 
  word_id: null,
  origin : "",
  meanings : "", 
  examples : [], 
  description : "",
};
// let OCR_DATA = {};
// 단어장 추가 버튼 클릭 시
const clickAddWord = async (event) => {
  const vocabulary_id = getValueFromURL("vocabulary_id");
  let modal = getDefaultModal();
  modal = modal.container ? modal : openDefaultModal();
  modal.container.className = 'modal add_word';
  modal.top.innerHTML = modalTopHtml(`단어 추가`, `
    <div></div>
    <h1>단어 추가</h1>
    <button onclick="clickOpenOcrCamera(event, clickOpenOcrCamera)">
      <i class="ph ph-camera"></i>
    </button>
  `);
  TEMP_WORD.id = vocabulary_id;
  modal.middle.innerHTML = await setWordModalHtml(TEMP_WORD);
  const btns = [
    {class:"close gray", text: "취소", fun: `onclick="clickModalCancelWordBtn(event)"`},
    {class:"pink", text: "추가", fun: `onclick="clickModalsetWordBtn(event)"`}
  ]
  modal.bottom.innerHTML = modalBottomHtml(btns);
  setTimeout(()=>modal.container.classList.add('active'),300);
}



// 예문 저장 버튼 클릭 시
const clickSaveExampleBoxBtn = (event) => {
  const __box = document.querySelectorAll(".preview_container .box");
  const _exampleBox = document.querySelector(".example_box");
  const _originInput = document.querySelector(".example_box input.origin");
  const _meaningInput = document.querySelector(".example_box input.meaning");
  const originInputValue = _originInput.value.trim();
  const meaningInputValue = _meaningInput.value.trim();
  if(originInputValue.length == 0) return alert("예문을 작성해 주세요");
  if(meaningInputValue.length == 0) return alert("뜻을 작성해 주세요");
  const exampleBoxIndex = Number(_exampleBox.dataset.index);
  const wordInputValue = document.querySelector(".input_text .word").value.trim();
  const html = setExampleBoxHtml(exampleBoxIndex, wordInputValue, originInputValue, meaningInputValue);
  if(exampleBoxIndex > __box.length){ // 생성 중
    const _previewContainer = document.querySelector(".preview_container");
    _previewContainer.insertAdjacentHTML('beforeend', html);
    _previewContainer.classList.add("active");

  }else{ // 수정 중
    const _box = document.querySelector(`.box[data-index="${exampleBoxIndex}"]`);
    _box.insertAdjacentHTML("afterend", html);
    _box.remove();
  }
  _originInput.value = "";
  _meaningInput.value = "";
  const __newBox = document.querySelectorAll(".preview_container .box");
  __newBox.forEach((_box, index)=>{
    _box.dataset.index = index + 1;
    _box.querySelector("h3").innerHTML = index + 1;
  })
  _exampleBox.querySelector(".top h3").innerHTML = `${__newBox.length + 1}.`;
  _exampleBox.dataset.index = __newBox.length + 1;
}

// 예문 생성 버튼 클릭 시
const clickAddExampleBoxBtn = (event) => {
  let modal = getDefaultModal();
  modal = modal.container ? modal : openDefaultModal();
  modal.container.className = "modal add_example";
  modal.top.innerHTML = modalTopHtml(`예문 추가`);
  modal.middle.innerHTML = setExampleModalHtml(TEMP_WORD.examples.length);
  const btns = [
    {class:"gray", text: "취소", fun: `onclick="clickModalCancelExampleBtn(event)"`},
    {class:"pink", text: "저장", fun: `onclick="clickModalsetExampleBtn(event)"`}
  ]
  modal.bottom.innerHTML = modalBottomHtml(btns);
  setTimeout(()=>modal.container.classList.add('active'),300);
}
// 예문 수정 버튼 클릭 시
const clickEditExampleBoxBtn = (event) => {
  const _box = findParentTarget(event.target, ".box");
  const boxIndex = Number(_box.dataset.index);

  let modal = getDefaultModal();
  console.log(TEMP_WORD.examples[boxIndex])
  modal = modal.container ? modal : openDefaultModal();
  modal.container.className = "modal add_example";
  modal.top.innerHTML = modalTopHtml(`예문 수정`);
  const origin = TEMP_WORD.examples[boxIndex]?.origin;
  const meaning = TEMP_WORD.examples[boxIndex]?.meaning;
  modal.middle.innerHTML = setExampleModalHtml(boxIndex, origin, meaning);
  const btns = [
    {class:"gray", text: "취소", fun: `onclick="clickModalCancelExampleBtn(event)"`},
    {class:"pink", text: "수정", fun: `onclick="clickModalsetExampleBtn(event, ${boxIndex})"`}
  ]
  modal.bottom.innerHTML = modalBottomHtml(btns);
  setTimeout(()=>modal.container.classList.add('active'),300);
  
  console.log(TEMP_WORD.examples[boxIndex]);
  // const originValue = _box.querySelector(".content").dataset.origin;
  // const meaningValue = _box.querySelector(".content").dataset.meaning;

  // const _exampleBox = document.querySelector(".example_box");
  // _exampleBox.dataset.index = boxIndex;
  // _exampleBox.querySelector(".top h3").innerHTML = `${boxIndex}`;
  // const _originInput = _exampleBox.querySelector("input.origin");
  // const _meaningInput = _exampleBox.querySelector("input.meaning");
  // _originInput.value = originValue;
  // _meaningInput.value = meaningValue;
}
// 예문 삭제 버튼 클릭 시
const clickDeleteExampleBoxBtn = (event) => {
  const _box = findParentTarget(event.target, ".box");
  const boxIndex = Number(_box.dataset.index);
  TEMP_WORD.examples.splice(boxIndex, 1);
  console.log(TEMP_WORD.examples)
  findParentTarget(event.target, ".box").remove();
  const __box = document.querySelectorAll(".box");
  __box.forEach((_box, index)=>{
    _box.dataset.index = index;
    _box.querySelector("h3").innerHTML = index + 1;
  })
  if(__box.length == 0){
    const _previewContainer = document.querySelector(".preview_container");
    _previewContainer.classList.remove("active");
  }
  // const _exampleBox = document.querySelector(".example_box");
  // _exampleBox.querySelector(".top h3").innerHTML = `${__box.length+1}.`;
  // _exampleBox.dataset.index = __box.length+1;

}

// 예문 추가 모달 취소 버튼 클릭 시
const clickModalCancelExampleBtn = async (event) => {
  const modal = getDefaultModal();
  modal.container.className = 'modal add_word';
  const btns = [{class:"close gray", text: "취소", fun: `onclick="clickModalCancelWordBtn(event)"`}]


  if(TEMP_WORD.word_id){
    modal.top.innerHTML = modalTopHtml(`단어 수정`);
    modal.middle.innerHTML = await setWordModalHtml(TEMP_WORD);
    btns.push({class:"pink", text: "수정", fun: `onclick="clickModalsetWordBtn(event)"`})
  }else{
    modal.top.innerHTML = modalTopHtml(`단어 추가`, `
      <div></div>
      <h1>단어 추가</h1>
      <button onclick="clickOpenOcrCamera(event, clickOpenOcrCamera)">
        <i class="ph ph-camera"></i>
      </button>
    `);
    btns.push({class:"pink", text: "추가", fun: `onclick="clickModalsetWordBtn(event)"`})
  }
  modal.middle.innerHTML = await setWordModalHtml(TEMP_WORD);
  modal.bottom.innerHTML = modalBottomHtml(btns);
  setTimeout(()=>modal.container.classList.add('active'),300);
}

// 예문 추가 모달 저장 버튼 클릭 시
const clickModalsetExampleBtn = async (event, index=null) => {
  const modal = getDefaultModal();
  const origin_example = modal.middle.querySelector(".origin_example").value.trim();
  const meaning_example = modal.middle.querySelector(".meaning_example").value.trim();
  if(origin_example == "") return alert("영어 예문을 입력해주세요.")
  if(meaning_example == "") return alert("한글 해석을 입력해주세요.")
  

  modal.container.className = 'modal add_word';
  const btns = [{class:"close gray", text: "취소", fun: `onclick="clickModalCancelWordBtn(event)"`}]

  if(index == null){
    TEMP_WORD.examples.push({origin : origin_example,meaning : meaning_example});
  }else{
    TEMP_WORD.examples[index].origin = origin_example;
    TEMP_WORD.examples[index].meaning = meaning_example;
  }
  if(TEMP_WORD.word_id){
    modal.top.innerHTML = modalTopHtml(`단어 수정`);
    modal.middle.innerHTML = await setWordModalHtml(TEMP_WORD);
    btns.push({class:"pink", text: "수정", fun: `onclick="clickModalsetWordBtn(event)"`})
  }else{
    
    modal.top.innerHTML = modalTopHtml(`단어 추가`, `
      <div></div>
      <h1>단어 추가</h1>
      <button onclick="clickOpenOcrCamera(event, clickOpenOcrCamera)">
        <i class="ph ph-camera"></i>
      </button>
    `);
    btns.push({class:"pink", text: "추가", fun: `onclick="clickModalsetWordBtn(event)"`})
  }
  modal.middle.innerHTML = await setWordModalHtml(TEMP_WORD);
  modal.bottom.innerHTML = modalBottomHtml(btns);
  setTimeout(()=>modal.container.classList.add('active'),300);
}
// const ocrCameraCallback = (original, view, crop) => {
//   selectOcrWordFun(original, view, crop)
// }
// const selectOcrWordFun = async (original, view, crop) => {
//   // OCR 데이터 가져오기
  
//   // const ocr_data_list = await getOcr(crop.img, ['eng', 'kor', 'jpn']);
//   const ocr_data_list = await getOcr(crop.img, ['eng']);

//   const url = `https://vocaandgo.ghmate.com/search/en`;
//   const method = 'GET';
//   for (const ocr_data of ocr_data_list) {
//     const data = { word: ocr_data.text };
//     try {
//       const result = await fetchDataAsync(url, method, data);
//       if (result.code != 200) {
//         console.error('검색 에러');
//       } else {
//         ocr_data.search_list = result.data;
//       }
//     } catch (error) {
//       console.error('API 요청 중 오류 발생:', error);
//     }
//   }
//   // TODO : 모달 변경

//   const modal = getDefaultModal();
//   modal.container.classList.add('ocr_word')
//   modal.top.innerHTML = modalTopHtml(`단어 선택`);
//   modal.middle.innerHTML = `
//     <div class="preview">
//       <img src="${view.img}">
//       <div class="highlighter"></div>
//     </div>
//     <ul class="search_list active"></ul>
//   `;
//   const _searchList = modal.middle.querySelector('.search_list');
//   let search_list = []
  
//   ocr_data_list.forEach((ocr_data)=>{
//     if(ocr_data.search_list.length<=0) return 
//     ocr_data.search_list.forEach((search_data)=>{
//       if (search_data.word.toUpperCase() === ocr_data.text.toUpperCase()) {
//         search_data.box = ocr_data.box;
//         search_list = [...search_list, search_data]
//       }
//     })
//   })
//   OCR_DATA = {original, view, crop, search_list};
//   setSearchListEl(_searchList, search_list);
//   const btns = [
//     {class:"gray", text: "재촬영", fun: `onclick="clickOpenOcrCamera(event, clickOpenOcrCamera)"`},
//   ]
//   modal.bottom.innerHTML = modalBottomHtml(btns);
// }





// 단어 수정 버튼 클릭 시
const clickEditWordBtn = async (event) => {
  const notebookId = Number(getValueFromURL("vocabulary_id"));
  const WORD_ID = Number(findParentTarget(event.target, 'li').dataset.id);
  let modal = getDefaultModal();
  modal = modal.container ? modal : openDefaultModal();
  modal.container.dataset.id = WORD_ID;
  modal.container.classList.add('add_word');
  modal.top.innerHTML = modalTopHtml(`단어 수정`);
  const result = await getWord(WORD_ID);
  TEMP_WORD.id = notebookId;
  TEMP_WORD.word_id = WORD_ID;
  TEMP_WORD.origin = result.origin;
  TEMP_WORD.meanings = result.meaning.join(", ");
  TEMP_WORD.examples = result.example;
  TEMP_WORD.description = result.description;
  modal.middle.innerHTML = await setWordModalHtml(TEMP_WORD);
  const btns = [
    {class:"close gray", text: "취소", fun: `onclick="clickModalCancelWordBtn(event)"`},
    {class:"pink", text: "수정", fun: `onclick="clickModalsetWordBtn(event)"`}
  ]
  modal.bottom.innerHTML = modalBottomHtml(btns);
  setTimeout(()=>modal.container.classList.add('active'),300);
}


// 단어 삭제 버튼 클릭 시
const clickDeleteWordBtn = (event) => {
  const WORD_ID = findParentTarget(event.target, 'li').dataset.id;
  let modal = getDefaultModal();
  modal = modal.container ? modal : openDefaultModal();
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
// 단어 설정 모달에서 취소 클릭 시
const clickModalCancelWordBtn = (event) => {
  TEMP_WORD = {  
    id: null, 
    origin : "",
    meanings : "", 
    examples : [], 
    description : "",
  }
}
// 단어 설정 모달에서 저장 클릭 시
const clickModalsetWordBtn = async (event) => {
  const prev_vocabulary_id = Number(getValueFromURL("vocabulary_id"));
  const _modal = findParentTarget(event.target, '.modal');
  const vocabulary_id = Number(_modal.querySelector('.vocabulary').value);
  const word_id = Number(_modal.dataset.id);
  const word = _modal.querySelector('input.word').value.trim();
  const meaning = _modal.querySelector('input.meaning').value.split(',').map(item => item.trim()).filter(Boolean);
  const example = [...document.querySelectorAll('.preview_container .box .content')].map(({ dataset: { origin, meaning } }) => ({ origin, meaning }));
  const explanation = _modal.querySelector('input.explanation').value;
  const createdAt = new Date().toISOString();
  const new_data = {
    wordbook_id : Number(vocabulary_id),
    origin : word,
    meaning : meaning,
    example : example,
    description : explanation,
  };

  if(word.length <= 0) return alert('단어는 필수 입력 사항입니다');
  if(meaning.length <= 0) return alert('의미는 필수 입력 사항입니다');
  if(_modal.dataset.id){
    const result = await updateWord(word_id, new_data);
  }else{
    const resultWordByOrigin = await getWordByOrigin(vocabulary_id, word);
    if(resultWordByOrigin) {
      const confirm = await setConfirm({
        text : "단어장에 같은 단어가 있어요. 그래도 추가할까요?",
        btns : [{text : "취소"}, {text : "추가",}], 
      })
      if(!confirm) return
    }
    const result = await addWord(new_data.wordbook_id, new_data.origin, new_data.meaning, new_data.example, new_data.description, 0);
  }
  _modal.click();
  const _ul = document.querySelector('main .container ul');
  _ul.innerHTML = await setVocabularyHtml(prev_vocabulary_id);
  clickModalCancelWordBtn();
}

// 단어 삭제 모달에서 삭제 클릭 시
const clickModalDeleteWordBook = async (event) => {
  const VOCABULARY_ID = Number(getValueFromURL("vocabulary_id"));
  const _modal = findParentTarget(event.target, '.modal');
  const WORD_ID = Number(_modal.dataset.id);
  const reuslt = await deleteWord(WORD_ID);
  _modal.click();
  const _ul = document.querySelector('main .container ul');

  _ul.innerHTML = await setVocabularyHtml(VOCABULARY_ID);
}

// 선택 삭제 버튼 클릭 시
const clickDeleteSelectBtn = (event) => {
  let modal = getDefaultModal();
  modal = modal.container ? modal : openDefaultModal();
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
    const result = await deleteWord(Number(_selectWord.id));
  }
  const _modal = findParentTarget(event.target, '.modal');
  _modal.click();
  const _ul = document.querySelector('main .container ul');
  _ul.innerHTML = await setVocabularyHtml(VOCABULARY_ID);
}

// 단어장 명 세팅
const setVocabularyNameHtml = async (id) => {
  // const noteBook = await getIndexedDbNotebookById(Number(id));
  const result = await getWordbook(Number(id));
  document.querySelector('header .container h2').innerHTML = result.name;
  
}
// 단어 리스트 세팅
const setVocabularyHtml = async (id) => {
  let html = '';
  const words = await getWordsByWordbook(Number(id));
  const bodyStyle = document.querySelector('body').style;
  bodyStyle.setProperty('--card-color', `#FF8DD4`);
  bodyStyle.setProperty('--card-background', `#FFEFFA`);
  bodyStyle.setProperty('--progress-color', `#FF8DD44d`); // 색상 코드에 투명도 추가
  if(words.length > 0){
    document.querySelector('.delete_select_btn')?.classList.add('active');
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
              
            </div>
            <div class="right">
              <div class="btns">
                <button class="marker marker_btn" onclick="clickMarker(event)">
                  <img src="/images/marker_${word.status}.png?v=2024.12.310015">
                </button>
                <button class="sound_btn" onclick="generateSpeech('${word.word}', 'en')">
                  <i class="ph-fill ph-speaker-high"></i>
                </button>
                <button onclick="clickEditWordBtn(event)" class="edit_btn"><i class="ph ph-pencil-simple"></i></button>
                <button onclick="clickDeleteWordBtn(event)" class="delete_btn"><i class="ph ph-trash"></i></button>
              </div>
            </div>
          </div>
          <div class="bottom">
            <div class="meaning">${word.meaning}</div>
            <div class="examples ${getExmapleStyleAlwaysVisible() ? "active" : ""}">
              ${word.example?.map(({origin, meaning})=>`
              <div 
                class="example" 
                data-origin="${origin}" 
                data-meaning="${meaning}" 
                onclick="generateSpeech('${origin}', 'en')"
                >
                <div class="origin">
                  ${setHighlightText(origin, word.word)}
                </div>
                <div class="meaning">
                  <span>${meaning}</span>
                </div>
              </div>
              `).join('')}
            </div>
          </div>
        </li>
      `
    }
  }else{
    html += `
    <li class="empty_message">
      <div class="top">
        <i class="ph ph-spinner"></i>
      </div>
      <div class="middle">
        <span>아직 추가된 단어가 없어요!</span><strong>단어</strong><span>를 추가해보세요 🤗</span>
      </div>
      <div class="bottom">
        <button onclick="clickAddWord(event)">
          <i class="ph ph-plus"></i>
          <span>단어 추가하기</span>
        </button>
      </div>
    </li>
    `
    
    // const url = window.location.href; 
    // const parsedUrl = new URL(url); 
    // const pathname = parsedUrl.pathname; 
    // const htmlFileName = pathname.split('/').pop(); 
    // if(htmlFileName != "vocabulary_edit.html"){
    //   const _addVocabularyBookBtn = document.querySelector('.add_vocabulary_btn');
    //   _addVocabularyBookBtn.setAttribute("data-tippy-content", "눌러서 단어 추가");
    //   const tooltipInstance = tippy('.add_vocabulary_btn', {
    //     trigger: 'manual',
    //     arrow: true,
    //     animation: 'shift-away',
    //     theme: 'ff8dd4',
    //     onHide(instance) {
    //       // 툴팁이 숨겨질 때 작업
    //       console.log('툴팁이 숨겨졌습니다!');
    //     },
    //   });
    //   // 초기 툴팁 보여주기
    //   tooltipInstance[0].show();
    //   // 버튼 클릭 시 툴팁 숨기기
    //   _addVocabularyBookBtn.addEventListener('click', () => {
    //     tooltipInstance[0].hide();
    //   });
    // }
  }
  return html;
}

// 단어 입력 시
const onInputWord = async (event) => {
  const word = event.target.value.trim();
  if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(word)) {
    return event.target.value = word.replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, '')
  }
  TEMP_WORD.origin = word;
  const _searchList = findParentTarget(event.target, '.input_text').querySelector('.search_list');
  if (word.length < 2) {
    _searchList.classList.remove('active');
    return;
  }
  await getSearchWordData(word);
  setSearchListEl(_searchList, SEARCH_LIST, word);
};


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
  TEMP_WORD.meanings = word;
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

// 설명 입력 시
const onInputExplanation = (event) => {
  const description = event.target.value.trim();
  event.target.value = description;
  TEMP_WORD.description = description;
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
  const _examplePreviewContainer = document.querySelector('.preview_container');
  
  _wordInput.value = data.word;
  _meaningInput.value = data.meanings ? data.meanings.join(', ') : data.meaning;
  _examplePreviewContainer.innerHTML = data.examples.map(({exam_en, exam_ko}, index)=>setExampleBoxHtml(index + 1, data.word, exam_en, exam_ko)).join('');

  TEMP_WORD.origin = _wordInput.value;
  TEMP_WORD.meanings = _meaningInput.value;
  TEMP_WORD.examples = data.examples.map(({exam_en, exam_ko}) => ({origin : exam_en, meaning: exam_ko}));

  if(data.examples.length > 0) _examplePreviewContainer.classList.add('active');
  // const _exampleBox = document.querySelector('.example_box');
  // _exampleBox.querySelector('h3').innerHTML = `${data.examples.length + 1}.`;
  // _exampleBox.querySelector('.origin').value = '';
  // _exampleBox.querySelector('.meaning').value = '';
  SEARCH_LIST = [];
  const _searchList = findParentTarget(event.target, '.input_text').querySelector('.search_list');
  _searchList.classList.remove('active'); 
}

// ocr 단어 선택 모달 다시 선택 클릭 시 
const clickSelectAgainOcrSearchedWord = (event) => {
  const modal = getDefaultModal();
  const __searchWord = modal.middle.querySelectorAll('.search_list li');
  const _highlighter = document.querySelector('.preview .highlighter');
  __searchWord.forEach((_searchWord)=>{
    _searchWord.classList.remove("active");
    _searchWord.classList.remove("hidden");
  })
  _highlighter.classList.remove('active');
  modal.container.classList.add('ocr_word');
  modal.top.innerHTML = modalTopHtml(`단어 선택`);
  const btns = [
    {class:"gray", text: "재촬영", fun: `onclick="clickOpenOcrCamera(event)"`},
  ]
  modal.bottom.innerHTML = modalBottomHtml(btns);
}

// ocr 단어 선택 모달 추가 버튼 클릭 시
const clickAddOcrSearchedWord = async (event) => {
  const modal = getDefaultModal();
  const index = Number(modal.middle.querySelector('.search_list li:not(.hidden)').dataset.index);
  const search_word = OCR_DATA[index].search;
  console.log("search_word,",search_word)
  modal.container.classList.remove('ocr_word')
  modal.container.classList.add('add_word');
  modal.top.innerHTML = modalTopHtml(`단어 추가`, `
    <div></div>
    <h1>단어 추가</h1>
    <button onclick="clickOpenOcrCamera(event, clickOpenOcrCamera)">
      <i class="ph ph-camera"></i>
    </button>
  `);
  
  console.log("search_word,",search_word)
  const DATA = {id: "", origin : search_word.word, meanings : search_word.meanings.join(", "), examples : search_word.examples, description : ""};
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
  const index_status = await waitSqliteOpen();
  if(index_status == "on"){
    const id = getValueFromURL("vocabulary_id");
    await setVocabularyNameHtml(id);
    const _ul = document.querySelector('main .container ul');
    _ul.innerHTML = await setVocabularyHtml(id);
    setLottieSound();

    const url = window.location.href; 
    const parsedUrl = new URL(url); 
    const pathname = parsedUrl.pathname; 
    const htmlFileName = pathname.split('/').pop(); 
    
    if(htmlFileName != "vocabulary_edit.html"){
      const words = await getWordsByWordbook(Number(id));
      if(words.length == 1){
        const _addVocabularyBookBtn = document.querySelector('.marker_btn');
        _addVocabularyBookBtn.setAttribute("data-tippy-content", "암기했다면 클릭!");
        const tooltipInstance = tippy('.marker_btn', {
          trigger: 'manual',
          arrow: true,
          placement: 'bottom-end',
          animation: 'shift-away',
          theme: 'ff8dd4',
          popperOptions: {
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [20, 10], // [x축 이동, y축 이동]
                },
              },
            ],
          },
          onHide(instance) {
            // 툴팁이 숨겨질 때 작업
            console.log('툴팁이 숨겨졌습니다!');
          },
        });
  
        // 초기 툴팁 보여주기
        tooltipInstance[0].show();
  
        // 버튼 클릭 시 툴팁 숨기기
        _addVocabularyBookBtn.addEventListener('click', () => {
          tooltipInstance[0].hide();
        });
      }
    }else{

    }
  }
  if(index_status == "err"){
    alert("데이터 호출 err")
  }

}
setInitHtml();