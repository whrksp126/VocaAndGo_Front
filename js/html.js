

// footer HTML
const footerHtml = `
  <nav>
    <ul>
      <li class="active">
        <i class="ph-fill ph-notepad"></i>
        <span>단어장</span>
      </li>
      <li>
        <i class="ph-fill ph-storefront"></i>
        <span>서점</span>
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
const modalTopHtml = (title, html=null) => {
  if(!html){
    return `<h1>${title}</h1>`
  }else{
    return html
  }
}

// 모달 BOTTOM AND
const modalBottomHtml = (btns=null) => {
  return btns != null ? `
  <div class="buttons">
    ${btns.map((btn)=>`
    <button class="${btn.class}" ${btn.fun}>${btn.text}</button>
    `).join('')}
  </div>
  ` : ``;
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
              data-color="#${main}" 
              data-background="#${background}" 
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

// 단어 설정 모달 html
const setWordModalHtml = async ({id, word, meanings, examples, description}) => {
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
          <input class="meaning" value="${meanings}" oninput="onInputMeaning(event)">
          <ul class="search_list"></ul>
          <span class="message"></span>
        </div>
      </li>
      <li>
        <div class="input_text">
          <div class="title_box">
            <label>예문</label>
          </div>
          <div class="preview_container ${examples.length > 0 ? 'active' : ""}">
            ${examples?.map((example,index) => setExampleBoxHtml(index+1, word, example.origin, example.meaning)).join('')}
          </div>
          <div class="example_box" data-index="${examples.length+1}">
            <div class="top">
              <h3>${examples.length+1}.</h3>
              <div class="btns">
                <button onclick="clickSaveExampleBoxBtn(event)"><i class="ph ph-check-circle"></i></button>
              </div>
            </div>
            <div class="content">
              <input class="origin" placeholder="영어 예문을 입력해주세요." value="">
              <input class="meaning" placeholder="한글 해석을 입력해주세요." value="">
            </div>
          </div>
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
const setExampleBoxHtml = (num, word, origin, meaning) => {
  return `
    <div class="box" data-index="${num}">
      <div class="top">
        <h3>${num}</h3>
        <div class="btns">
          <button onclick="clickEditExampleBoxBtn(event)"><i class="ph ph-pencil-simple"></i></button>
          <button onclick="clickDeleteExampleBoxBtn(event)"><i class="ph ph-trash"></i></button>
        </div>
      </div>
      <div class="content" data-origin="${origin}" data-meaning="${meaning}">
        <div class="origin">
          ${setHighlightText(origin, word)}
        </div>
        <div class="meaning">
          <span>${meaning}</span>
        </div>
      </div>
    </div>
  `
}

// 단어장 리스트 html
const setVocabularyListHtml = async () => {
  const vocabulary_list = await getIndexedDbNotebooks();
  let html = ``;
  for(const vocabulary of vocabulary_list){
    const words = await getIndexedDbWordsByNotebookId(vocabulary.id);
    const totalWords = words.length;
    const learnedCount = words.reduce((count, word) => {return word.status == 1 ? count + 1 : count}, 0);
    const progress = Math.round((learnedCount / totalWords) * 100) || 0;
    html += `
      <li 
        data-id="${vocabulary.id}"
        onclick="clickVocabularyItem(event,${vocabulary.id})"
        style="--card-color: ${vocabulary.color.main}; --card-background: ${vocabulary.color.background}; --progress-color: ${vocabulary.color.main}4d; --progress-width:${progress}%;"
        >
        <div class="top">
          <h3>${vocabulary.name}</h3>
          <span>${learnedCount}/${totalWords}</span>
        </div>
        <div class="progress_bar">
          <div class="cur_bar">
            <span class="${progress > 13 ? "" : "right"}">${progress}%</span>
          </div>
        </div>
      </li>
    `
  }
  return html;
}

// 테스트 설정 HTML 
const setTextSetupHtml = () => {
  return `
    <ul class="">
      <li data-type="view_types" class="view_types">
        <h4>문제 유형</h4>
        <div class="radio_btns">
          <button class="active" data-type="word">
            <i class="ph-bold ph-check"></i>
            <span>단어</span>
          </button>
          <button data-type="meaning">
            <i class="ph-bold ph-check"></i>
            <span>의미</span>
          </button>
          <button data-type="cross">
            <i class="ph-bold ph-check"></i>
            <span>교차</span>
          </button>
          <button data-type="random">
            <i class="ph-bold ph-check"></i>
            <span>랜덤</span>
          </button>
        </div>
      </li>
      <li data-type="word_types" class="word_types">
        <h4>단어 유형</h4>
        <div class="radio_btns">
          <button class="active" data-type="all">
            <i class="ph-bold ph-check"></i>
            <span>전체</span>
          </button>
          <button data-type="confused">
            <i class="ph-bold ph-check"></i>
            <span>헷갈리는 단어만</span>
          </button>
        </div>
      </li>
      <li data-type="problem_nums" class="problem_nums">
        <h4>문제 개수</h4>
        <div class="btns">
          <button data-type="minus" class=""><i class="ph ph-minus"></i></button>
          <input type="number" value="10" min="5" max="30">
          <button data-type="plus" class="active"><i class="ph ph-plus"></i></button>
        </div>
      </li>
    </ul>
  `
}

// 정답 확인 html
const setShowAnswerHtml = async () => {
  const test_list = await getRecentLearningData("test_list");
  return `
    <ul>
      ${test_list.map((data)=>{return `
      <li 
        data-id="${data.id}" 
        data-noteid="${data.notebookId}" 
        data-isCorrect="${data.isCorrect}" 
        data-status="${data.status}"
        class="answer_card ${data.result}"
        >
        <div class="left">
          <div>
            <i class="ph-bold ph-circle"></i>
            <i class="ph-bold ph-x"></i>
          </div>
          <div class="texts">
            <span>${data.word}</span>
            <p>${data.meaning}</p>
          </div>
        </div>
        <button class="right" onclick="clickMarker(event)">
          <img src="/images/marker_${data.status}.png?v=2024.08.270203">
        </button>
      </li>

      `}).join('')}
    </ul>
  `
}

// 단어장 미리보기 html
const setVocabularyPreviewHtml = (word_list) => {
  const bodyStyle = document.querySelector('body').style;
  bodyStyle.setProperty('--card-color', `#FF8DD4`);
  bodyStyle.setProperty('--card-background', `#FFEFFA`);
  return `
  <ul>
    ${word_list.map((data)=>{return `
    <li data-id="${data.id}">
      <div class="top">
        <div class="left">
          <div class="word">${data.word}</div>
        </div>
        <div class="right">
          <div class="btns">
            <button class="sound_btn" onclick="generateSpeech(event, '${data.word}', 'en')">
              <i class="ph-fill ph-speaker-high"></i>
            </button>
          </div>
        </div>
      </div>
      <div class="bottom">
        <div class="meaning">${data.meaning.join(', ')}</div>
      </div>
    </li>
    `}).join('')}
  </ul>
  `
}
