// 로컬 스토리지에 저장된 모든 데이터를 전역 변수 객체에 저장
const localStorageData = {};
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  const value = localStorage.getItem(key);
  localStorageData[key] = JSON.parse(value);
}


// 단어장 추가 버튼 클릭 시
const clickAddWord = (event) => {
  const ID = getValueFromURL("vocabulary_id");
  const modal = openDefaultModal();
  modal.container.classList.add('add_word')
  modal.top.innerHTML = modalTopHtml(`단어 추가`);
  const DATA = {id: ID, word : "",meaning : "",example : "",explanation : "",};
  modal.middle.innerHTML = setWordModalHtml(DATA);
  const btns = [
    {class:"close gray", text: "취소", fun: ""},
    {class:"pink", text: "추가", fun: `onclick="clickModalsetWordBtn(event)"`}
  ]
  modal.bottom.innerHTML = modalBottomHtml(btns);
  setTimeout(()=>modal.container.classList.add('active'),300)
}

// 단어 수정 버튼 클릭 시
const clickEditVocabularyBook = (event) => {
  const ID = getValueFromURL("vocabulary_id");
  const WORD_ID = findParentTarget(event.target, 'li').dataset.id;
  const modal = openDefaultModal();
  modal.container.dataset.id = WORD_ID;
  modal.container.classList.add('add_word');
  modal.top.innerHTML = modalTopHtml(`단어 수정`);
  const WORD_DATA = localStorageData[ID].find((data)=>data.id == WORD_ID);
  const DATA = {id: ID, word : WORD_DATA.word, meaning : WORD_DATA.meaning, example : WORD_DATA.example, explanation : WORD_DATA.explanation,};
  modal.middle.innerHTML = setWordModalHtml(DATA);
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
const clickModalsetWordBtn = (event) => {
  const PREV_VOCABULARY_ID = getValueFromURL("vocabulary_id");
  const _modal = findParentTarget(event.target, '.modal');
  
  const VOCABULARY_ID = _modal.querySelector('.vocabulary').value;
  const ID = _modal.dataset.id || crypto.randomUUID();
  const WORD = _modal.querySelector('input.word').value;
  const MEANING = _modal.querySelector('input.meaning').value;
  const EXAMPLE = _modal.querySelector('input.example').value;
  const EXPLANATION = _modal.querySelector('input.explanation').value;
  const DATA = {
    vocabulary_id : VOCABULARY_ID,
    id : ID,
    word : WORD,
    meaning : MEANING,
    example : EXAMPLE,
    explanation : EXPLANATION,
  }
  if(_modal.dataset.id){
    if(PREV_VOCABULARY_ID == VOCABULARY_ID){
      const INDEX = localStorageData[VOCABULARY_ID].findIndex((data)=> data.id == ID)
      localStorageData[VOCABULARY_ID][INDEX] = DATA;
    }else{
      const INDEX = localStorageData[PREV_VOCABULARY_ID].findIndex((data)=> data.id == ID);
      localStorageData[PREV_VOCABULARY_ID].splice(INDEX, 1);
      const PREV_LIST_INDEX = localStorageData.vocabulary_list.findIndex(item => item.id == PREV_VOCABULARY_ID);
      localStorageData.vocabulary_list[PREV_LIST_INDEX].counts.total = localStorageData[PREV_VOCABULARY_ID].length;
      localStorageData[VOCABULARY_ID].push(DATA);
      const LIST_INDEX = localStorageData.vocabulary_list.findIndex(item => item.id == VOCABULARY_ID);
      localStorageData.vocabulary_list[LIST_INDEX].counts.total = localStorageData[VOCABULARY_ID].length;
      setLocalStorageData(PREV_VOCABULARY_ID, localStorageData[PREV_VOCABULARY_ID]);
    }
  }else{
    localStorageData[VOCABULARY_ID].push(DATA);
    const LIST_INDEX = localStorageData.vocabulary_list.findIndex(item => item.id == VOCABULARY_ID);
    localStorageData.vocabulary_list[LIST_INDEX].counts.total = localStorageData[VOCABULARY_ID].length;
  }
  setLocalStorageData('vocabulary_list', localStorageData.vocabulary_list);
  setLocalStorageData(VOCABULARY_ID, localStorageData[VOCABULARY_ID]);
  _modal.click();
  setVocabularyHtml(PREV_VOCABULARY_ID);
  // TODO : 단어 저장, 수정, 삭제 기능 구현
}
// 단어 삭제 모달에서 삭제 클릭 시
const clickModalDeleteWordBook = (event) => {
  const VOCABULARY_ID = getValueFromURL("vocabulary_id");
  const WORD_ID = findParentTarget(event.target, '.modal').dataset.id;
  const _modal = findParentTarget(event.target, '.modal');
  const INDEX = localStorageData[VOCABULARY_ID].findIndex((data)=> data.id == WORD_ID);
  localStorageData[VOCABULARY_ID].splice(INDEX, 1);
  const LIST_INDEX = localStorageData.vocabulary_list.findIndex(item => item.id == VOCABULARY_ID);
  localStorageData.vocabulary_list[LIST_INDEX].counts.total = localStorageData[VOCABULARY_ID].length;
  setLocalStorageData('vocabulary_list', localStorageData.vocabulary_list);
  setLocalStorageData(VOCABULARY_ID, localStorageData[VOCABULARY_ID]);
  _modal.click();
  setVocabularyHtml(VOCABULARY_ID);
}


// 단어장 명 세팅
const setVocabularyNameHtml = (id) => {
  const name = localStorageData.vocabulary_list.find(vocabulary=>vocabulary.id == id).name;
  document.querySelector('header .container h2').innerHTML = name;
  
}
// 단어 리스트 세팅
const setVocabularyHtml = (id) => {
  document.querySelector('main .container ul').innerHTML = '';
  const word_list_data = localStorageData[id];
  if(word_list_data.length == 0) return;
  const bodyStyle = document.querySelector('body').style;
  const colors = localStorageData.vocabulary_list.find((data)=>data.id == id).colors
  bodyStyle.setProperty('--card-color', `#${colors.main}`);
  bodyStyle.setProperty('--card-background', `#${colors.background}`);
  bodyStyle.setProperty('--progress-color', `#${colors.main}4d`); // 색상 코드에 투명도 추가
  const word_list_html = word_list_data.map((data)=>{
    return `
      <li data-id="${data.id}">
        <div class="input_checkbox">
          <input type="checkbox" id="${data.id}">
          <label for="${data.id}">
            <i class="ph ph-square"></i>
            <i class="ph-fill ph-check-square"></i>
          </label>
        </div>
        <div class="top">
          <div class="left">
            <div class="word">${data.word}</div>
            <div class="favorites"><i class="ph-fill ph-star"></i></div>
          </div>
          <div class="right">
            <div class="btns">
              <button class="sound_btn"><i class="ph-fill ph-speaker-high"></i></button>
              <button onclick="clickEditVocabularyBook(event)" class="edit_btn"><i class="ph ph-pencil-simple"></i></button>
              <button onclick="clickDeleteWordBook(event)" class="delete_btn"><i class="ph ph-trash"></i></button>
            </div>
          </div>
        </div>
        <div class="bottom">
          <div class="meaning">${data.meaning}</div>
        </div>
      </li>
    `
  }).join('');
  document.querySelector('main .container ul').innerHTML = word_list_html;
}
const setInitHtml = () => {
  const id = getValueFromURL("vocabulary_id");
  setVocabularyNameHtml(id);
  setVocabularyHtml(id);
}
setInitHtml();

