// 사지선타 테스트 문제 html
const setMcqHtml = (word, total, index) => {
  const mcqIndex = index;
  let show_text = '';
  let show_hint = '';
  let show_option = [];
  const view_type = URL_PARAMS.view_types;
  let show_type = 1; // 0 : 단어, 1 : 의미;
  if(view_type == 'word') show_type = 0;
  if(view_type == 'meaning') show_type = 1;
  if(view_type == 'cross') show_type = mcqIndex % 2 == 0 ? 0 : 1;
  if(view_type == 'random') show_type = Math.random() < 0.5 ? 0 : 1;
  show_text = show_type == 0 ? word.word : word.meaning;
  show_hint = show_type == 0 ? word.meaning : word.word;
  show_option = word.options.map(option => show_type == 0 ? option.meaning : option.word);
  return `
    <div 
      class="item"
      data-index="${index}"
      data-show="${show_type}"
      data-id="${word.id}"
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
            <img src="/images/marker_${word.status}.png?v=2025.02.280257">
          </button>
          <!-- 
          <div class="page">
            <span class="cur">${mcqIndex+1}</span>
            <span>/</span>
            <span class="total">${total}</span>
          </div>
          -->
          <button class="speaker sound_btn" onclick="generateSpeech('${show_text}','${show_type==0?'en':'ko'}' )">
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
  let currentPage = 0;
  TEST_WORD_LIST.forEach((word, index)=>{
    if(word.isCorrect == undefined){
      _items.insertAdjacentHTML('afterbegin', setMcqHtml(word, TEST_WORD_LIST.length, index))
    }else{
      currentPage += 1;
    }
  });
  const item_length = _items.querySelectorAll('.item').length;
  
  const first_item = _items.querySelectorAll('.item')[item_length - 1];
  const first_index = Number(first_item.dataset.index);
  const first_data = TEST_WORD_LIST[first_index];
  const show_type = Number(first_item.dataset.show);
  generateSpeech(show_type == 0 ? first_data.word : first_data.meaning.join(', '), show_type == 0 ? 'en' : 'ko')
  setLottieSound();

  const _first_item = document.querySelector('.items .item:last-child');
  _first_item?.classList.add('active');
  const _progressbarBox = document.querySelector('.progressbar_box');
  _progressbarBox.style.setProperty('--total-page', TEST_WORD_LIST.length);
  _progressbarBox.style.setProperty('--cur-page', currentPage);
}

// 옵션 클릭 시
const clickMcqOption = (event, index) => {
  const __item = document.querySelectorAll('.items .item');
  const _currentItem = __item[__item.length - 1];
  if(!_currentItem) return;
  const word_data = TEST_WORD_LIST[Number(_currentItem.dataset.index)]
  if(_currentItem.dataset.isdone) return;
  findParentTarget(event.target, '.option_btn').classList.add('active');
  const _nextItem = __item[__item.length - 2];
  const isCorrect = word_data.result == Number(index) ;
  _currentItem.classList.add(isCorrect ? 'correct' : 'incorrect');
  _currentItem.querySelector('.card').classList.add('end');
  word_data.isCorrect = isCorrect ? 1 : 0;
  const _cprrectOptionBtn = _currentItem.querySelector(`.btns .option_btn[data-index="${word_data.result}"]`);
  _cprrectOptionBtn.classList.add("o_btn");
  setTimeout(async ()=>{
    const _progressbarBox = document.querySelector('.progressbar_box');
    let currentPage = parseInt(getComputedStyle(_progressbarBox).getPropertyValue('--cur-page')) || 0;
    _progressbarBox.style.setProperty('--cur-page', currentPage + 1);
    const recentStudy = await getRecentStudy();
    if (!_nextItem) {
      setTimeout(async ()=>{
        _currentItem.remove();        
        await updateRecentStudy(recentStudy.id, {
          state : 1,
          test_list : TEST_WORD_LIST
        });
        setTestResultsHtml();
      },2000)
    }else{
      _currentItem.classList.add('end');
      _currentItem.classList.remove('active');
      _nextItem.classList.add('active');
      const next_show_type = Number(_nextItem.dataset.show);
      const next_data = TEST_WORD_LIST[Number(_nextItem.dataset.index)];
      generateSpeech(next_show_type == 0 ? next_data.word : next_data.meaning.join(', '), next_show_type == 0 ? 'en' : 'ko')
      await updateRecentStudy(recentStudy.id, {
        test_list : TEST_WORD_LIST
      });
      setTimeout(() => _currentItem.remove(), 300);
    }
  },2000)
  _currentItem.dataset.isdone = true;
}

const init = async () => {
  const index_status = await waitSqliteOpen();
  if(index_status == "on"){
    const recentStudy = await getRecentStudy();
    TEST_WORD_LIST = recentStudy.test_list;
    if(recentStudy.state == 0){
      setMcqTestPage();  
    }
    if(recentStudy.state == 1){
      setTestResultsHtml();
    }
    
  }
  if(index_status == "err"){
    alert("데이터 호출 err")
  }
}
init();

