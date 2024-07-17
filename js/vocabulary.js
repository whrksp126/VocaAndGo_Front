// 검색 시 사용할 전역 리스트 변수
let SEARCH_LIST = [];

// 단어장 추가 버튼 클릭 시
const clickAddWord = async (event) => {
  const ID = getValueFromURL("vocabulary_id");
  const modal = openDefaultModal();
  modal.container.classList.add('add_word')
  modal.top.innerHTML = modalTopHtml(`단어 추가`);
  const DATA = {id: ID, word : "",meaning : "",example : "",description : "",};
  modal.middle.innerHTML = await setWordModalHtml(DATA);
  const btns = [
    {class:"close gray", text: "취소", fun: ""},
    {class:"pink", text: "추가", fun: `onclick="clickModalsetWordBtn(event)"`}
  ]
  modal.bottom.innerHTML = modalBottomHtml(btns);
  setTimeout(()=>modal.container.classList.add('active'),300)
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
  console.log(word)
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
  const PREV_VOCABULARY_ID = Number(getValueFromURL("vocabulary_id"));
  const _modal = findParentTarget(event.target, '.modal');
  
  const VOCABULARY_ID = Number(_modal.querySelector('.vocabulary').value);
  const ID = Number(_modal.dataset.id);
  const WORD = _modal.querySelector('input.word').value;
  const MEANING = _modal.querySelector('input.meaning').value;
  const EXAMPLE = _modal.querySelector('input.example').value;
  const EXPLANATION = _modal.querySelector('input.explanation').value;
  const createdAt = new Date().toISOString();
  const data = {
    notebookId : Number(VOCABULARY_ID),
    id : ID,
    word : WORD,
    meaning : MEANING,
    example : EXAMPLE,
    description : EXPLANATION,
    status : "not learned"
  }
  if(_modal.dataset.id){
    const result = await updateIndexedDbWord(data.id, data.notebookId, data.word, data.meaning, data.example, data.description, createdAt, data.status);
  }else{
    const result = await addIndexedDbWord(data.notebookId, data.word, data.meaning, data.example, data.description, createdAt, createdAt, data.status);
  }
  _modal.click();
  setVocabularyHtml(PREV_VOCABULARY_ID);
  // TODO : 단어 저장, 수정, 삭제 기능 구현
}
// 단어 삭제 모달에서 삭제 클릭 시
const clickModalDeleteWordBook = async (event) => {
  const VOCABULARY_ID = Number(getValueFromURL("vocabulary_id"));
  const _modal = findParentTarget(event.target, '.modal');
  const WORD_ID = Number(_modal.dataset.id);
  const reuslt = await deleteIndexedDbWord(WORD_ID);
  _modal.click();
  setVocabularyHtml(VOCABULARY_ID);
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
  setVocabularyHtml(VOCABULARY_ID);
}

// 단어장 명 세팅
const setVocabularyNameHtml = async (id) => {
  const noteBook = await getIndexedDbNotebookById(Number(id));
  document.querySelector('header .container h2').innerHTML = noteBook.name;
  
}
// 단어 리스트 세팅
const setVocabularyHtml = async (id) => {
  const _ul = document.querySelector('main .container ul');
  _ul.innerHTML = '';
  const words = await getIndexedDbWordsByNotebookId(Number(id));
  if(words.length > 0){
    const noteBook = await getIndexedDbNotebookById(Number(id));
    const bodyStyle = document.querySelector('body').style;
    // bodyStyle.setProperty('--card-color', `#${noteBook.color.main}`);
    // bodyStyle.setProperty('--card-background', `#${noteBook.color.background}`);
    // bodyStyle.setProperty('--progress-color', `#${noteBook.color.main}4d`); // 색상 코드에 투명도 추가
    bodyStyle.setProperty('--card-color', `#FF8DD4`);
    bodyStyle.setProperty('--card-background', `#FFEFFA`);
    bodyStyle.setProperty('--progress-color', `#FF8DD44d`); // 색상 코드에 투명도 추가
    for(let word of words){
      const html = `
        <li data-id="${word.id}">
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
              <div class="favorites"><i class="ph-fill ph-star"></i></div>
            </div>
            <div class="right">
              <div class="btns">
                <button class="sound_btn" onclick="generateSpeech('${word.word}', 'en')"><i class="ph-fill ph-speaker-high"></i></button>
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
      _ul.insertAdjacentHTML('beforeend', html)
    }
  }else{
    console.log('단어 추가 유도 UI');
  }
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
  _searchList.classList.toggle('active', SEARCH_LIST.length > 0);
  const regex = new RegExp(`(${word})`, 'gi');
  const highlightText = (text, regex, keyword) => text.split(regex).map(part =>
    part.toLowerCase() === keyword.toLowerCase() ? `<strong>${part}</strong>` : `<span>${part}</span>`
  ).join('');
  _searchList.innerHTML = '';  
  SEARCH_LIST.forEach(({ word: dataWord, meanings }, index) => {
    const search_word_html = highlightText(dataWord, regex, word);
    const search_meaning_html = meanings.join(', ');
    _searchList.insertAdjacentHTML('beforeend', `
      <li onclick="clickSelectSearchedWord(event)" data-index="${index}">
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
  await getSearchMeaningData(word)
}

// 단어 검색 요청 
const getSearchWordData = async (word) => {
  const url = `http://127.0.0.1:5000/search/search_word_en`;
  const method = 'GET';
  const data = {word : word};
  const result = await fetchDataAsync(url, method, data);
  if(result.code != 200){ console.error('검색 에러')}
  SEARCH_LIST = result.data
  return;
}
// 의미 검색 요청
const getSearchMeaningData = async (word) => {
  const url = `http://127.0.0.1:5000/search/search_word_ko`;
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
  _meaningInput.value = data.meanings.join(', ');
  SEARCH_LIST = [];
  const _searchList = findParentTarget(event.target, '.input_text').querySelector('.search_list');
  _searchList.classList.remove('active'); 
}

const setInitHtml = () => {
  const id = getValueFromURL("vocabulary_id");
  setVocabularyNameHtml(id);
  setVocabularyHtml(id);
}


setInitHtml();