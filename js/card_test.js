// 카드 테스트 card HTML
const setCardHtml = (word, total, cur) => {
  let show_text = '';
  let show_hint = '';
  const view_type = URL_PARAMS.view_types;
  let show_type = 1; // 0 : 단어, 1 : 의미;
  if(view_type == 'word') show_type = 0;
  if(view_type == 'meaning') show_type = 1;
  if(view_type == 'cross') show_type = cur % 2 == 0 ? 1 : 0;
  if(view_type == 'random') show_type = Math.random() < 0.5 ? 0 : 1;
  show_text = show_type == 0 ? word.word : word.meaning;
  show_hint = show_type == 0 ? word.meaning : word.word;
  return `
    <div class="card" 
      data-notebookId="${word.notebookId}"
      data-id="${word.id}"
      data-meaning="${word.meaning}"
      data-word="${word.word}"
      data-description="${word.description}"
      data-example="${word.example}"
      data-status="${word.status}"
    >
      <div class="granding">
        <i class="ph-bold ph-circle"></i>
        <i class="ph-bold ph-x"></i>
      </div>
      <span class="word">${show_text}</span>
      <span class="word hint">${show_hint}</span>
      <div class="bottom">
        <button class="marker click_event" onclick="clickMarker(event)">
          <img src="/images/marker_${word.status}.png">
        </button>
        <div class="page">
          <span class="cur">${cur}</span>
          <span>/</span>
          <span class="total">${total}</span>
        </div>
        <button class="speaker click_event" onclick="generateSpeech('${word.word}', 'en')"><i class="ph-fill ph-speaker-high"></i></button>
      </div>
    </div>
  `
}

// 테스트 페이지 카드 세팅
const setCardTestPage = () => {
  const _cards = document.querySelector('main .cards')
  TEST_WORD_LIST.forEach((word, index)=>{
    if(word.isCorrect == undefined){
      // _cards.insertAdjacentHTML('afterbegin', setCardHtml(word, Number(URL_PARAMS.problem_nums), index+1))
      _cards.insertAdjacentHTML('afterbegin', setCardHtml(word, TEST_WORD_LIST.length, index+1))
    }
  })
  const _first_card = document.querySelector('.cards .card:last-child');;
  _first_card?.classList.add('active');
}


// OX 클릭 시
const clickGrading = async (event, outcome) => {
  const __card = document.querySelectorAll('.cards .card');
  const _currentCard = __card[__card.length - 1];
  if(!_currentCard) return;
  const _nextCard = __card[__card.length - 2];
  _currentCard.classList.add(outcome ? 'correct' : 'incorrect');
  _currentCard.classList.add('end');
  _currentCard.classList.remove('active');
  const word_data = TEST_WORD_LIST.find(data => data.id == Number(_currentCard.dataset.id));
  // word_data.result = outcome;
  word_data.isCorrect = outcome;
  if (!_nextCard) {
    _currentCard.remove();
    updateRecentLearningData("state", "after");
    updateRecentLearningData("test_list", TEST_WORD_LIST);
    setTestResultsHtml();
  } else {
    _nextCard.classList.add('active');
    updateRecentLearningData("test_list", TEST_WORD_LIST);
    setTimeout(() => _currentCard.remove(), 300);
    setCardTouchEvent();
  }
}
// 첫번째 카드에 터치 이벤트 적용
const setCardTouchEvent = () => {
  const _card = document.querySelector('.cards .card.active');
  if(!_card) return;
  const _granding = _card.querySelector('.granding');
  const screenWidth = window.innerWidth;
  let initialX = 0;
  let initialY = 0;
  let offsetX = 0;
  let offsetY = 0;
  let startTime = 0; // 터치 시작 시간을 기록

  // 클릭 시
  const click = (event) => {
    const _clickEvent = findParentTarget(event.target, 'click_event');
    if(_clickEvent) return;
    const _card = findParentTarget(event.target, '.card');
    _card.classList.toggle('hint');

  }
  // 터치 시작 이벤트 핸들러
  const startTouch = (e) => {
    initialX = e.touches[0].clientX - offsetX;
    initialY = e.touches[0].clientY - offsetY;
    startTime = Date.now(); // 터치 시작 시간 기록
    _card.addEventListener('touchmove', moveTouch, { passive: false });
  };

  // 터치 이동 이벤트 핸들러
  const moveTouch = (e) => {
    e.preventDefault(); // 화면 스크롤 방지
    _card.classList.add('move')
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    offsetX = currentX - initialX;
    offsetY = currentY - initialY;

    const moveThreshold = screenWidth * 0.4;
    const movePercent = Math.abs(offsetX) / moveThreshold;
    const rotateDeg = ((offsetX/moveThreshold)*5).toFixed(2);
    _card.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${rotateDeg}deg)`;

    const cardRect = _card.getBoundingClientRect();
    const cardCenterX = cardRect.left + cardRect.width / 2;
    const positionHorizontal = cardCenterX > screenWidth / 2 ? 'correct' : 'incorrect';
    _card.classList.remove('correct', 'incorrect');
    _card.classList.add(positionHorizontal);
    _granding.style.opacity = movePercent;
  };

  // 터치 끝 이벤트 핸들러
  const endTouch = () => {
    const endTime = Date.now(); // 터치 종료 시간
    const elapsedTime = endTime - startTime; // 터치 지속 시간
    const speed = Math.sqrt(offsetX * offsetX + offsetY * offsetY) / elapsedTime; // 픽셀/밀리초 단위의 속도
    _card.removeEventListener('touchmove', moveTouch);
    _card.classList.remove('move');
    // 카드가 화면 중심에서 멀리 떨어져 있거나, 빠른 속도로 스와이프한 경우
    if (Math.abs(offsetX) > screenWidth * 0.5 || speed > 0.5) {
      const cardRect = _card.getBoundingClientRect();
      const cardCenterX = cardRect.left + cardRect.width / 2;
      const positionHorizontal = cardCenterX > screenWidth / 2 ? 'right' : 'left';
      if(positionHorizontal == 'right') {
        clickGrading(null, 1);
      }
      if(positionHorizontal == 'left'){
        clickGrading(null, 0);
      }
    } else {
      _card.classList.remove('correct', 'incorrect');
      _card.style.transform = `translate(0px, 0px)`;
    }
    initialX = 0;
    initialY = 0;
    offsetX = 0;
    offsetY = 0;
  };

  // 이벤트 리스너 추가
  _card.addEventListener('click', click)
  _card.addEventListener('touchstart', startTouch);
  _card.addEventListener('touchend', endTouch);
  _card.addEventListener('touchcancel', endTouch); 
}








// 마크 일괄 조작 버튼 클릭 시
const clickBatchSetMarkBtn = async (event, isCorrect) => {
  const isRegister = Number(event.target.dataset.register);
  const updateMarkAndStatus = async (word_id, status) => {
    const _li = document.querySelector(`li[data-id="${word_id}"]`);
    _li.querySelector('img').src = `/images/marker_${status}.png`;
    await updateIndexedDbWord(word_id, { status });
  };
  for (let i = 0; i < TEST_WORD_LIST.length; i++) {
    const data = TEST_WORD_LIST[i];
    const word_id = data.id;
    if (data.isCorrect && isCorrect && isRegister) {
      await updateMarkAndStatus(word_id, 1); // 맞은 단어 마크 등록
    } else if (data.isCorrect && isCorrect && !isRegister) {
      await updateMarkAndStatus(word_id, 0); // 맞은 단어 마크 해제
    } else if (!data.isCorrect && !isCorrect && isRegister) {
      await updateMarkAndStatus(word_id, 2); // 틀린 단어 마크 등록
    } else if (!data.isCorrect && !isCorrect && !isRegister) {
      await updateMarkAndStatus(word_id, 0); // 틀린 단어 마크 해제
    }
  }
  const nextBtnText = `${isCorrect ? '맞은' : '틀린'} 단어 마크 ${isRegister ? '해제' : '등록'}`;
  event.target.innerHTML = nextBtnText;
  event.target.dataset.register = isRegister == 0 ? 1 : 0;
};


const init = async () => {
  const index_status = await waitIndexDbOpen()
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
    setCardTestPage(TEST_WORD_LIST);
    setCardTouchEvent();
  }
  if(index_status == "err"){
    alert("데이터 호출 err")
  }

}
init();





