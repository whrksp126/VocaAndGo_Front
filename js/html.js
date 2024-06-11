

// footer HTML
const footerHtml = `
  <nav>
    <ul>
      <li class="active">
        <i class="ph-fill ph-notepad"></i>
        <span>단어장</span>
      </li>
      <li>
        <i class="ph-fill ph-notepad"></i>
        <span>테스트</span>
      </li>
      <li>
        <i class="ph-fill ph-user"></i>
        <span>마이페이지</span>
      </li>
    </ul>
  </nav>
`

// 모달 기본 틀
const defaultModalHtml = () => `
  <div class="modal">
    <div class="modal_content">
      <div class="modal_top"></div>
      <div class="modal_middle"></div>
      <div class="modal_bottom"></div>
    </div>
  </div>
`

// 모달 TOP
const modalTopHtml = (title) => {
  return `<h1>${title}</h1>`
}

// 모달 BOTTOM AND
const modalBottomHtml = (btns=null) => {
  return `
    ${btns != null ?`
    <div class="buttons">
      ${btns.map((btn)=>`
      <button class="${btn.class}" ${btn.fun}>${btn.text}</button>
      `).join('')}
    </div>
    `:``}
  `
}


// 단어장 생성 및 추가 모달 미들 HTML
const setVocabularyBookHtml = ({name, color}) =>{
  const COLOR_LIST = [
    {main: "FF8DD4", background: "FFEFFA"},
    {main: "CD8DFF", background: "F6EFFF"},
    {main: "74D5FF", background: "EAF6FF"},
    {main: "42F98B", background: "E2FFE8"},
    {main: "F9BB42", background: "FFF6DF"}
  ]
  const html = `
    <ul>
      <li>
        <div class="input_text">
          <label>단어장 이름</label>
          <input class="vocabulary_name" value="${name}">
          <span></span>
        </div>
      </li>
      <li>
        <div class="input_color">
          <label>색상</label>
          <ul class="vocabulary_color">
            ${COLOR_LIST.map(({main, background})=>{ return `
            <li 
              data-color="${main}" 
              data-background="${background}" 
              class="color ${color == main ? "active" : ""}">
              <span></span>
            </li>`
            }).join('')}
          </ul>
        </div>
      </li>
    </ul>
  `;
  return html;
}

const setWordModalHtml = ({id, word, meaning, example, explanation}) => {
  return `
    <ul>
      <li>
        <div class="selete_box">
          <label>단어장</label>
          <select name="단어장" class="vocabulary" id="" ${word != "" ? "" : "disabled"}>
          ${localStorageData.vocabulary_list.map((data)=>{return `
            <option value="${data.id}" ${data.id == id ? "selected" : ""}>${data.name}</option>
          `}).join('')}
          </select>
        </div>
      </li>
      <li>
        <div class="input_text">
          <label>단어<strong>*</strong></label>
          <input class="word" value="${word}">
          <span></span>
        </div>
      </li>
      <li>
        <div class="input_text">
          <label>의미<strong>*</strong></label>
          <input class="meaning" value="${meaning}">
          <span></span>
        </div>
      </li>
      <li>
        <div class="input_text">
          <label>예문</label>
          <input class="example" value="${example}">
          <span></span>
        </div>
      </li>
      <li>
        <div class="input_text">
          <label>설명</label>
          <input class="explanation" value="${explanation}">
          <span></span>
        </div>
      </li>
    </ul>
  `
}