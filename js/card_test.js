// 카드 테스트 card HTML
const setCardHtml = (word, total, index) => {
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
      data-show="${show_type}"
      data-id="${word.id}"
      data-index="${index}"
    >
      <div class="granding">
        <i class="ph-bold ph-circle"></i>
        <i class="ph-bold ph-x"></i>
      </div>
      <span class="word">${show_text}</span>
      <span class="word hint">${show_hint}</span>
      <div class="bottom">
        <button class="marker click_event" onclick="clickMarker(event)">
          <img src="/images/marker_${word.status}.png?v=2024.12.130150">
        </button>
        <!-- 
        <div class="page">
          <span class="cur">${index + 1}</span>
          <span>/</span>
          <span class="total">${total}</span>
        </div>
        -->
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
      _cards.insertAdjacentHTML('afterbegin', setCardHtml(word, TEST_WORD_LIST.length, index))
    }
  })
  const _first_card = document.querySelector('.cards .card:last-child');;
  _first_card?.classList.add('active');
  const _progressbarBox = document.querySelector('.progressbar_box');
  _progressbarBox.style.setProperty('--total-page', TEST_WORD_LIST.length);
  const cur_page = TEST_WORD_LIST.filter(data => data.isCorrect !== undefined).length;
  _progressbarBox.style.setProperty('--cur-page', cur_page);
  const _curCard = document.querySelector('.card.active');
  if(_curCard){
    const index = Number(_curCard.dataset.index);
    const show_type = _curCard.dataset.show;
    if(show_type == 0){
      generateSpeech(TEST_WORD_LIST[index].word, 'en')
    }else{
  
    }
  }
}

// 플래그 변수 추가
let isProcessing = false;

// OX 클릭 시
const clickGrading = async (event, outcome) => {
  // 클릭 이벤트 연속 방지
  if (isProcessing) return;
  isProcessing = true;

  const __card = document.querySelectorAll('.cards .card');
  const _currentCard = __card[__card.length - 1];
  if (!_currentCard) {
    isProcessing = false; // 카드가 없으면 플래그 해제
    return;
  }
  const _nextCard = __card[__card.length - 2];
  _currentCard.classList.add(outcome ? 'correct' : 'incorrect');
  _currentCard.classList.add('end');
  _currentCard.classList.remove('active');

  const word_data = TEST_WORD_LIST[Number(_currentCard.dataset.index)];
  word_data.isCorrect = outcome;

  const _progressbarBox = document.querySelector('.progressbar_box');
  let currentPage = parseInt(getComputedStyle(_progressbarBox).getPropertyValue('--cur-page')) || 0;
  _progressbarBox.style.setProperty('--cur-page', currentPage + 1);

  const recentStudy = await getRecentStudy();

  if (!_nextCard) {
    _currentCard.remove();
    await updateRecentStudy(recentStudy.id, {
      state: 1,
      test_list: TEST_WORD_LIST,
    });
    setTestResultsHtml();
    isProcessing = false; // 작업 완료 후 플래그 해제
  } else {
    _nextCard.classList.add('active');
    await updateRecentStudy(recentStudy.id, {
      test_list: TEST_WORD_LIST,
    });

    const show_type = Number(_nextCard.dataset.show); // 0 : 단어, 1 : 의미
    const cur_data = TEST_WORD_LIST[Number(_nextCard.dataset.index)];

    if (show_type == 0) {
      generateSpeech(cur_data.word, 'en');
    }

    // 카드 제거 후 플래그 해제
    setTimeout(() => {
      _currentCard.remove();
      isProcessing = false; // 300ms 후 플래그 해제
    }, 300);

    setCardTouchEvent();
  }
};

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
    event.preventDefault();
    // const _clickEvent = findParentTarget(event.target, 'click_event');
    // if(_clickEvent) return;
    // const _card = findParentTarget(event.target, '.card');
    // _card.classList.toggle('hint');
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











const init = async () => {
  // const index_status = await waitIndexDbOpen()
  const index_status = await waitSqliteOpen();
  if(index_status == "on"){
    const recentStudy = await getRecentStudy();
    TEST_WORD_LIST = recentStudy.test_list;
    if(recentStudy.state == 0){ // 학습 중
      setCardTestPage();
      setCardTouchEvent();
    }
    if(recentStudy.state == 1) { // 학습 종료
      setTestResultsHtml();
    }
    
    
  }
  if(index_status == "err"){
    alert("데이터 호출 err")
  }

}
init();





