// 단어장 추가 버튼 클릭 시
const clickCardTest = (event) => {
  const modal = openDefaultModal();
  modal.container.classList.add('setup_test');
  modal.top.innerHTML = modalTopHtml(`테스트 설정`);
  modal.middle.innerHTML = setTextSetupHtml();
  const btns = [
    {class:"close gray", text: "취소", fun: ""},
    {class:"pink", text: "시작", fun: `onclick="window.location.href='/html/card_test.html'"`}
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
  if(type == 'test_types' || type == 'word_types'){
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