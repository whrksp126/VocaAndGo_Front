// TODO : test_word_list를 indexed_db 최근 학습 데이터로 변경
const TEST_WORD_LIST = [];
const URL_PARAMS = {
  vocabulary : getValueFromURL('vocabulary'), // all
  test_type : getValueFromURL('test_type'), // card
  view_types : getValueFromURL('view_types'), // word
  word_types : getValueFromURL('word_types'), // all
  problem_nums : getValueFromURL('problem_nums'), // 10
}

// INDEXED_DB 단어장 단어 호출
const getVocabularyWordList = async () => {
  const vocabulary_word_list = [];
  if(URL_PARAMS.vocabulary == "all"){
    const noteBooks = await getIndexedDbNotebooks();
    for(const noteBook of noteBooks){
      const words = await getIndexedDbWordsByNotebookId(noteBook.id)
      vocabulary_word_list.push(...words);
    }
  }
  return vocabulary_word_list;
}

// 전체 단어 리스트에서 테스트할 단어만 추출
const setTestWrodList = (vocabulary_word_list) => {
  let tempArray = [...vocabulary_word_list];
  for (let i = tempArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tempArray[i], tempArray[j]] = [tempArray[j], tempArray[i]];
  }
  return tempArray.slice(0, Number(URL_PARAMS.problem_nums));
}

// 카드 테스트 card HTML
const setCardHtml = (word, total, cur) => {
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
      <span class="word">${word.word}</span>
      <div class="bottom">
        <button class="star"><i class="ph-fill ph-star"></i></button>
        <div class="page">
          <span class="cur">${cur}</span>
          <span>/</span>
          <span class="total">${total}</span>
        </div>
        <button class="speaker" onclick="generateSpeech('${word.word}', 'en')"><i class="ph-fill ph-speaker-high"></i></button>
      </div>
    </div>
  `
}

// 테스트 페이지 카드 세팅
const setCardTestPage = () => {
  const _cards = document.querySelector('main .cards')
  TEST_WORD_LIST.forEach((word, index)=>_cards.insertAdjacentHTML('afterbegin', setCardHtml(word, Number(URL_PARAMS.problem_nums), index+1)))
  const _first_card = document.querySelector('.cards .card:last-child');;
  _first_card.classList.add('active');
}

// OX 클릭 시
const clickGrading = (event, outcome) => {
  const __card = document.querySelectorAll('.cards .card');
  const _currentCard = __card[__card.length - 1];
  if(!_currentCard) return;
  const _nextCard = __card[__card.length - 2];
  _currentCard.classList.add(outcome);
  _currentCard.classList.add('end');
  _currentCard.classList.remove('active');
  const word_data = TEST_WORD_LIST.find(data => data.id == Number(_currentCard.dataset.id));
  word_data.result = outcome;
  if (!_nextCard) {
    console.log(TEST_WORD_LIST)
    _currentCard.remove()

  } else {
    _nextCard.classList.add('active');
    setTimeout(() => _currentCard.remove(), 300);
    setCardTouchEvent();
  }
}
// 첫번째 카드에 터치 이벤트 적용
const setCardTouchEvent = () => {
  const _card = document.querySelector('.cards .card.active');
  const _granding = _card.querySelector('.granding');
  const screenWidth = window.innerWidth;
  let initialX = 0;
  let initialY = 0;
  let offsetX = 0;
  let offsetY = 0;
  let startTime = 0; // 터치 시작 시간을 기록

  // 터치 시작 이벤트 핸들러
  const startTouch = (e) => {
    initialX = e.touches[0].clientX - offsetX;
    initialY = e.touches[0].clientY - offsetY;
    startTime = Date.now(); // 터치 시작 시간 기록

    _card.classList.add('move')
    _card.addEventListener('touchmove', moveTouch, { passive: false });
  };

  // 터치 이동 이벤트 핸들러
  const moveTouch = (e) => {
    e.preventDefault(); // 화면 스크롤 방지
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
        clickGrading(null, 'correct');
      }
      if(positionHorizontal == 'left'){
        clickGrading(null, 'incorrect');
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
  _card.addEventListener('touchstart', startTouch);
  _card.addEventListener('touchend', endTouch);
  _card.addEventListener('touchcancel', endTouch); 
}

const init = async () => {
  const vocabulary_word_list = await getVocabularyWordList();
  TEST_WORD_LIST.push(...setTestWrodList(vocabulary_word_list));
  setCardTestPage(TEST_WORD_LIST);
  setCardTouchEvent();
}
init();





