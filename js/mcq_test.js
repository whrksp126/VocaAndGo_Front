// 사지선타 테스트 문제 html
const setMcqHtml = (word, total, cur) => {
  let show_text = '';
  let show_hint = '';
  let show_option = [];
  const view_type = URL_PARAMS.view_types;
  let show_type = 1; // 0 : 단어, 1 : 의미;
  if(view_type == 'word') show_type = 0;
  if(view_type == 'meaning') show_type = 1;
  if(view_type == 'cross') show_type = cur % 2 == 0 ? 1 : 0;
  if(view_type == 'random') show_type = Math.random() < 0.5 ? 0 : 1;
  show_text = show_type == 0 ? word.word : word.meaning;
  show_hint = show_type == 0 ? word.meaning : word.word;
  show_option = word.options.map(option => show_type == 0 ? option.meaning : option.word);

  return `
    <div 
      class="item"
      data-notebookId="${word.notebookId}"
      data-id="${word.id}"
      data-meaning="${word.meaning}"
      data-word="${word.word}"
      data-description="${word.description}"
      data-example="${word.example}"
      data-status="${word.status}"
      data-result="${word.result}"
    >
      <div class="card">
        <div class="granding">
          <i class="ph-bold ph-circle"></i>
          <i class="ph-bold ph-x"></i>
        </div>
        <span class="word">${show_text}</span>
        <span class="word hint">${show_hint}</span>
        <div class="bottom">
          <button class="marker" onclick="clickMarker(event)">
            <img src="/images/marker_${word.status}.png">
          </button>
          <div class="page">
            <span class="cur">${cur}</span>
            <span>/</span>
            <span class="total">${total}</span>
          </div>
          <button class="speaker" onclick="generateSpeech('${word.word}', 'en')">
            <i class="ph-fill ph-speaker-high"></i>
          </button>
        </div>
      </div>
      <div class="btns">
        ${show_option.map((option, index)=>`
        <button class="option_btn" onclick="clickMcqOption(event, ${index+1})" data-index="${index+1}">${option}</button>
        `).join('')}
      </div>
    </div>
  `
}

// 사지선다 테스트 페이지 문제 세팅
const setMcqTestPage = () => {
  const _items = document.querySelector('main .items')
  TEST_WORD_LIST.forEach((word, index)=>{
    if(word.isCorrect == undefined){
      _items.insertAdjacentHTML('afterbegin', setMcqHtml(word, TEST_WORD_LIST.length, index+1))
    }
  });
  const _first_item = document.querySelector('.items .item:last-child');
  _first_item?.classList.add('active');
}

// 옵션 클릭 시
const clickMcqOption = (event, index) => {
  findParentTarget(event.target, '.option_btn').classList.add('active');
  const __item = document.querySelectorAll('.items .item');
  const _currentItem = __item[__item.length - 1];
  if(!_currentItem) return;
  const _nextItem = __item[__item.length - 2];
  const isCorrect = Number(_currentItem.dataset.result) == Number(index) ;
  _currentItem.classList.add(isCorrect ? 'correct' : 'incorrect');
  _currentItem.querySelector('.card').classList.add('end');
  const word_data = TEST_WORD_LIST.find(data => data.id == Number(_currentItem.dataset.id));
  word_data.isCorrect = isCorrect ? 1 : 0;
  setTimeout(()=>{
    _currentItem.classList.add('end');
    _currentItem.classList.remove('active');
    if (!_nextItem) {
      _currentItem.remove();
      updateRecentLearningData("state", "after");
      updateRecentLearningData("test_list", TEST_WORD_LIST);
      setTestResultsHtml();
    }else{
      _nextItem.classList.add('active');
      updateRecentLearningData("test_list", TEST_WORD_LIST);
      setTimeout(() => _currentItem.remove(), 300);
    }
  },500)
}

const init = async () => {
  const index_status = await waitIndexDbOpen();
  if(index_status == "on"){
    const state = await getRecentLearningData("state");
    if(state == 'before') {
      await updateRecentLearningData("state", "during");
      TEST_WORD_LIST = await getRecentLearningData("test_list", TEST_WORD_LIST);
    }
    if(state == 'during'){ 
      TEST_WORD_LIST = await getRecentLearningData("test_list", TEST_WORD_LIST);
    }
    if(state == 'after'){
      const test_list = await getRecentLearningData("test_list", TEST_WORD_LIST);
      TEST_WORD_LIST = test_list;
      setTestResultsHtml();
    }
    setMcqTestPage();
  }
  if(index_status == "err"){
    alert("데이터 호출 err")
  }
}
init();

