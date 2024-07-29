let TEST_WORD_LIST = [];
const URL_PARAMS = {
  vocabulary : getValueFromURL('vocabulary'), // all
  test_type : getValueFromURL('test_type'), // card
  view_types : getValueFromURL('view_types'), // word
  word_types : getValueFromURL('word_types'), // all
  problem_nums : getValueFromURL('problem_nums'), // 10
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
  TEST_WORD_LIST.forEach((word, index)=>{
    if(word.result == undefined){
      _cards.insertAdjacentHTML('afterbegin', setCardHtml(word, Number(URL_PARAMS.problem_nums), index+1))
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
  _currentCard.classList.add(outcome);
  _currentCard.classList.add('end');
  _currentCard.classList.remove('active');
  const word_data = TEST_WORD_LIST.find(data => data.id == Number(_currentCard.dataset.id));
  word_data.result = outcome;
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

const setTestResultsHtml = () => {
  const html = `
    <div class="test_result_box">
      <div class="top">
        <div class="progress_bar"></div>
      </div>
      <div class="btns">
        <button onclick="clickShowAnswer(event)" class="out_line">정답 보기</button>
        <button onclick="clickRetest(event, true)" class="gray">테스트 다시 하기</button>
        <button onclick="clickRetest(event, false)" class="fill">모르는 문제 다시 풀기</button>
      </div>
    </div>
  `
  document.querySelector('main').insertAdjacentHTML("beforeend", html);
  document.querySelector('.test_result_box').classList.add('active');
  setProGressBar()
}

// 원형 프로그래스 바 세팅
const setProGressBar = () => {
  const total = TEST_WORD_LIST.length;
  const correct_num = TEST_WORD_LIST.filter(data => data.result == 'correct').length;
  console.log(total, correct_num)
  const _probressBar = document.querySelector('.progress_bar');
  const bar = new ProgressBar.Circle(_probressBar, {
    trailColor: '#FFEFFA',
    strokeWidth: 12.5,
    trailWidth: 12.5,
    easing: 'easeInOut',
    duration: 1400,
    // text: {autoStyleContainer: false},
    from: { color: '#FF8DD4', width: 12.5 },
    to: { color: '#FF8DD4', width: 12.5 },
    // 모든 애니메이션 호출에 대한 기본 단계 함수를 설정합니다.
    step: function(state, circle) {
      circle.path.setAttribute('stroke', state.color);
      circle.path.setAttribute('stroke-width', state.width);
      const value = Math.round(correct_num/total * 100);
      circle.setText(`
        <h2>${value + '점'}</h2>
        <div>
          <strong>${correct_num}</strong>
          <span>/${total}</span>
        </div>
      `);
    }
  });
  bar.animate(correct_num/total);  // 0.0에서 1.0 사이의 숫자
}

// 다시 풀기 클릭 시
const clickRetest = async (event, is_all) => {
  await updateRecentLearningData("state", "during");
  if(!is_all) {
    TEST_WORD_LIST = TEST_WORD_LIST.filter((data)=>data.result == 'incorrect');  
  }
  TEST_WORD_LIST.forEach((data)=>data.result = undefined);
  await updateRecentLearningData("test_list", TEST_WORD_LIST);
  location.reload();
}

// 정답 보기 클릭 시
const clickShowAnswer = async (event) => {
  const modal = openDefaultModal();
  modal.container.classList.add('show_answer')
  modal.top.innerHTML = modalTopHtml(`정답 보기`);
  modal.middle.innerHTML = await setShowAnswerHtml();
  
  const btns = [
    {class:"gray", text: "틀린 단어 마크 해제", fun: ``},
    {class:"pink", text: "맞은 단어 마크 해제", fun: ``}
  ]
  modal.bottom.innerHTML = modalBottomHtml(btns);
  setTimeout(()=>modal.container.classList.add('active'),300)
}

const init = async () => {
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
init();





