// 사지선타 테스트 문제 html
const setMcqHtml = () => {

}

// 사지선다 테스트 페이지 문제 세팅
const setMcqTestPage = () => {
  const _cards = document.querySelector('main .cards')
  TEST_WORD_LIST.forEach((word, index)=>{
    if(word.isCorrect == undefined){
      _cards.insertAdjacentHTML('afterbegin', setMcqHtml(word, TEST_WORD_LIST.length, index+1))
    }
  })
  const _first_card = document.querySelector('.cards .card:last-child');;
  _first_card?.classList.add('active');
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
  // setCardTouchEvent();
}
init();

