// 로컬 스토리지에 저장된 모든 데이터를 전역 변수 객체에 저장
const localStorageData = {};
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  const value = localStorage.getItem(key);
  localStorageData[key] = JSON.parse(value);
}


// 단어장 추가 버튼 클릭 시
const clickAddWord = (event) => {
  const modal = openDefaultModal();
  modal.container.classList.add('add_word')
  modal.top.innerHTML = modalTopHtml(`단어 추가`);
  modal.middle.innerHTML = `
    <ul>
      <li>
        <div class="selete_box">
          <label>단어장</label>
          <select name="단어장" id="" disabled>
            <option value="토익 준비용 🔥" >토익 준비용 🔥</option>
            <option value="">Orange</option>
          </select>
        </div>
      </li>
      <li>
        <div class="input_text">
          <label>단어<strong>*</strong></label>
          <input>
          <span></span>
        </div>
      </li>
      <li>
        <div class="input_text">
          <label>의미<strong>*</strong></label>
          <input>
          <span></span>
        </div>
      </li>
      <li>
        <div class="input_text">
          <label>예문</label>
          <input>
          <span></span>
        </div>
      </li>
      <li>
        <div class="input_text">
          <label>설명</label>
          <input>
          <span></span>
        </div>
      </li>
    </ul>
  `;
  const btns = [
    {class:"close gray", text: "취소", fun: ""},
    {class:"pink", text: "추가", fun: ""}
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

// 단어장 명 세팅
const setVocabularyNameHtml = (id) => {
  const name = localStorageData.vocabulary_list.find(vocabulary=>vocabulary.id == id).name;
  document.querySelector('header .container h2').innerHTML = name;
  
}
// 단어 리스트 세팅
const setVocabularyHtml = (id) => {
  const word_list_data = localStorageData[`vocabulary_${id}`];
  
  const bodyStyle = document.querySelector('body').style;
  bodyStyle.setProperty('--card-color', word_list_data.color);
  bodyStyle.setProperty('--card-background', word_list_data.background_color);
  bodyStyle.setProperty('--progress-color', `${word_list_data.color}4d`); // 색상 코드에 투명도 추가

  const word_list_html = word_list_data.list.map((word)=>{
    return `
      <li >
        <div class="input_checkbox">
          <input type="checkbox" id="${word.id}">
          <label for="${word.id}">
            <i class="ph ph-square"></i>
            <i class="ph-fill ph-check-square"></i>
          </label>
        </div>
        <div class="top">
          <div class="left">
            <div class="word">${word.words}</div>
            <div class="favorites"><i class="ph-fill ph-star"></i></div>
          </div>
          <div class="right">
            <div class="btns">
              <button class="sound_btn"><i class="ph-fill ph-speaker-high"></i></button>
              <button onclick="clickEditVocabularyBook(event)" class="edit_btn"><i class="ph ph-pencil-simple"></i></button>
              <button onclick="clickDeleteVocabularyBook(event)" class="delete_btn"><i class="ph ph-trash"></i></button>
            </div>
          </div>
        </div>
        <div class="bottom">
          <div class="meaning">${word.meaning.map((meaning)=>meaning).join('')}</div>
        </div>
      </li>
    `
  }).join('');
  document.querySelector('main .container ul').innerHTML = word_list_html;
}
const setInitHtml = () => {
  const id = getValueFromURL("vocabulary_id");
  // const page = document.querySelector('body').dataset.page;
  setVocabularyNameHtml(id);
  setVocabularyHtml(id);
}
setInitHtml();

