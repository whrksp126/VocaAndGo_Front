

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
    {main: "FF8DD4", background : "FFEFFA"},
    {main: "CD8DFF", background : "F6EFFF"},
    {main: "74D5FF", background : "EAF6FF"},
    {main: "42F98B", background : "E2FFE8"},
    {main: "FFBD3C", background : "FFF6DF"}
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
            ${COLOR_LIST.map(({main, background})=>{ 
              return `
            <li 
              style="--main-color: #${main};"
              data-color="${main}" 
              data-background="${background}" 
              class="color ${color.toUpperCase() == main.toUpperCase() ? "active" : ""}">
              <i class="ph-bold ph-check"></i>
              
            </li>`
            }).join('')}
          </ul>
        </div>
      </li>
    </ul>
  `;
  return html;
}

const setWordModalHtml = async ({id, word, meaning, example, description}) => {
  const noteBooks = await getIndexedDbNotebooks();
  return `
    <ul>
      <li>
        <div class="selete_box">
          <label>단어장</label>
          <select name="단어장" class="vocabulary" id="" ${word != "" ? "" : "disabled"}>
          ${noteBooks.map((data)=>{ return `
            <option value="${data.id}" ${Number(data.id) == Number(id) ? "selected" : ""}>${data.name}</option>
          `}).join('')}
          </select>
        </div>
      </li>
      <li class="">
        <div class="input_text">
          <label>단어<strong>*</strong></label>
          <input class="word" value="${word}" oninput="onInputWord(event)">
          <ul class="search_list"></ul>
          <span class="message"></span>
        </div>
      </li>
      <li>
        <div class="input_text">
          <label>의미<strong>*</strong></label>
          <input class="meaning" value="${meaning}" oninput="onInputMeaning(event)">
          <ul class="search_list"></ul>
          <span class="message"></span>
        </div>
      </li>
      <li>
        <div class="input_text">
          <label>예문</label>
          <input class="example" value="${example}">
          <span class="message"></span>
        </div>
      </li>
      <li>
        <div class="input_text">
          <label>설명</label>
          <input class="explanation" value="${description}">
          <span class="message"></span>
        </div>
      </li>
    </ul>
  `
}