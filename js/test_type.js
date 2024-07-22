// 단어장 추가 버튼 클릭 시
const clickCardTest = (event) => {
  const modal = openDefaultModal();
  modal.container.classList.add('setup_test');
  modal.top.innerHTML = modalTopHtml(`테스트 설정`);
  modal.middle.innerHTML = setTextSetupHtml();

  const btns = [
    {class:"close gray", text: "취소", fun: ""},
    {class:"pink", text: "시작", fun: `onclick="clickStartCardTest(event, 'card')"`}
  ]
  modal.bottom.innerHTML = modalBottomHtml(btns);
  setTimeout(()=>modal.container.classList.add('active'),300);
  modal.middle.addEventListener('click', event => clickEventBtn(event));
};

const clickEventBtn = (event) => {
  const _btn = findParentTarget(event.target, 'button');
  if(!_btn)return;
  const _li = findParentTarget(event.target, 'li');
  const type = _li.dataset.type;
  if(type == 'view_types' || type == 'word_types'){
    _li.querySelector('button.active').classList.remove('active');
    _btn.classList.add('active');
  }
  if(type == 'problem_nums'){
    const calc_type = _btn.dataset.type;
    const _input = _li.querySelector('input');
    if (calc_type === 'minus' && Number(_input.value) > Number(_input.min)) {
      _input.value = Number(_input.value) - 1;
    }    
    if (calc_type === 'plus' && Number(_input.value) < Number(_input.max)) {
      _input.value = Number(_input.value) + 1;
    }
    
  }
}

// 테스트 설정 모달에서 시작 클릭 시
const clickStartCardTest = async (event, type) => {
  const vocabulary = getValueFromURL("vocabulary");
  const test_type = type;
  const view_types = document.querySelector('.view_types button.active').dataset.type;
  const word_types = document.querySelector('.word_types button.active').dataset.type;
  const problem_nums = Number(document.querySelector('.problem_nums input[type="number"]').value);

  if(vocabulary == 'all'){
    const vocabulary_word_list = await getVocabularyWordList();
    await updateRecentLearningData("type", test_type);
    await updateRecentLearningData("state", "before");
    await updateRecentLearningData("test_list", setTestWrodList(vocabulary_word_list, problem_nums));
    const urlParams = `vocabulary=${vocabulary}&test_type=${test_type}&view_types=${view_types}&word_types=${word_types}&problem_nums=${problem_nums}`
    window.location.href=`/html/card_test.html?${urlParams}`
  }else{

  }
}

// INDEXED_DB 전체 단어장 단어 호출
const getVocabularyWordList = async () => {
  const vocabulary_word_list = [];
  const noteBooks = await getIndexedDbNotebooks();
  for(const noteBook of noteBooks){
    const words = await getIndexedDbWordsByNotebookId(noteBook.id)
    vocabulary_word_list.push(...words);
  }
  return vocabulary_word_list;
}

// 전체 단어 리스트에서 테스트할 단어만 추출
const setTestWrodList = (vocabulary_word_list, problem_nums) => {
  let tempArray = [...vocabulary_word_list];
  for (let i = tempArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tempArray[i], tempArray[j]] = [tempArray[j], tempArray[i]];
  }
  return tempArray.slice(0, problem_nums);
}
