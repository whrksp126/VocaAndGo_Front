// 단어장 리스트 세팅
const setVocabularyList = async () => {
  const _ul = document.querySelector('main .container ul');
  _ul.innerHTML = ``;
  const noteBooks = await getIndexedDbNotebooks();
  if(noteBooks.length > 0){
    const html = await setVocabularyListHtml(noteBooks);
    _ul.innerHTML = html;
  }else{
    console.log('단어장 추가 유도 UI');
  }
}

// 단어장 클릭 시
const clickVocabularyItem = async (event, id) => {
  const vocabulary = getValueFromURL("vocabulary");
  const type = getValueFromURL("test_type");

  const modal = openDefaultModal();
  modal.container.classList.add('setup_test');
  modal.top.innerHTML = modalTopHtml(`테스트 설정`);
  modal.middle.innerHTML = setTextSetupHtml();

  const btns = [
    {class:"close gray", text: "취소", fun: ""},
    {class:"pink", text: "시작", fun: `onclick="clickStartTest(event, '${type}', ${id})"`}
  ]
  modal.bottom.innerHTML = modalBottomHtml(btns);

  const vocabulary_word_list = await getVocabularyWordList(id);
  const _numInp = modal.middle.querySelector('.problem_nums input[type="number"]');
  _numInp.setAttribute('min', 4)
  _numInp.setAttribute('max', vocabulary_word_list.length)
  _numInp.setAttribute('value', vocabulary_word_list.length > 10 ? 10 : vocabulary_word_list.length);

  setTimeout(()=>modal.container.classList.add('active'),300);
  modal.middle.addEventListener('click', event => clickEventBtn(event));
}

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

const setInitHtml = () => {
  setVocabularyList();
}
setInitHtml();