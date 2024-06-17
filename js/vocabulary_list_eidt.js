// 로컬 스토리지에 저장된 모든 데이터를 전역 변수 객체에 저장
const localStorageData = {};
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  const value = localStorage.getItem(key);
  try {
    localStorageData[key] = JSON.parse(value);
  } catch (e) {
    localStorageData[key] = value;
  }
}


// 단어장 삭제 클릭 시
const clickDeleteVocabularyBook = (event) => {
  const ID = findParentTarget(event.target, 'li').dataset.id;
  const modal = openDefaultModal();
  modal.container.classList.add('confirm');
  modal.container.dataset.id = ID;
  modal.middle.innerHTML = `
    <h3>단어장을 정말 삭제하시겠어요?</h3>
    <span>삭제 후에는 복구가 불가능해요 😢</span>
  `;
  const btns = [
    {class:"close gray", text: "취소", fun: ""},
    {class:"pink", text: "삭제", fun: `onclick="clickModalDeleteVocabularyBook(event)"`}
  ]
  modal.bottom.innerHTML = modalBottomHtml(btns);
  setTimeout(()=>modal.container.classList.add('active'),300)
}

// 단어장 삭제 모달에서 삭제 버튼 클릭 시
const clickModalDeleteVocabularyBook = (event) => {
  const _modal = findParentTarget(event.target, '.modal');
  const ID = _modal.dataset.id
  const NEW_VOCABULARY_LIST = localStorageData.vocabulary_list.filter(item => item.id !== ID);
  localStorageData.vocabulary_list = NEW_VOCABULARY_LIST;
  setLocalStorageData('vocabulary_list', localStorageData.vocabulary_list);
  localStorage.removeItem(ID);
  _modal.click();
  setEditVocabularyListHtml();
}

// 단어장 수정 클릭 시
const clickEditVocabularyBook = (event, data={name:"", color:"FF8DD4"}) => {
  const ID = findParentTarget(event.target, 'li').dataset.id;
  const VOCABULARY = localStorageData.vocabulary_list.find((item)=>item.id == ID);
  const DATA = {name: VOCABULARY.name,color: VOCABULARY.colors.main};
  const modal = openDefaultModal();
  modal.container.dataset.id = ID;
  modal.top.innerHTML = modalTopHtml(`단어장 수정`);
  modal.middle.innerHTML = setVocabularyBookHtml(DATA);
  const btns = [
    {class:"close gray", text: "취소", fun: ""},
    {class:"pink", text: "저장", fun: `onclick="clickSaveVocabulary(event, setEditVocabularyListHtml)"`}
  ]
  modal.bottom.innerHTML = modalBottomHtml(btns);
  setTimeout(()=>modal.container.classList.add('active'),300);
  addEventClickColor()
}




// 단어장 에디터 리스트에서 리스트 HTML 세팅
const setEditVocabularyListHtml = () => {
  const _ul = document.querySelector('main .container ul');
  if(!localStorageData.vocabulary_list) return;
  const liHtml = localStorageData.vocabulary_list.map((vocabulary) => {
    return `
      <li 
        data-id="${vocabulary.id}"
        style="--card-color: #${vocabulary.colors.main}; --card-background: #${vocabulary.colors.background}; --progress-color: #${vocabulary.colors.main}4d; ">
        <div class="top">
          <h3>${vocabulary.name}</h3>
          <span>${vocabulary.counts.correct}/${vocabulary.counts.total}</span>
        </div>
        <div class="btns">
          <button onclick="clickEditVocabularyBook(event)" class="edit_btn"><i class="ph ph-pencil-simple"></i></button>
          <button onclick="clickDeleteVocabularyBook(event)" class="delete_btn"><i class="ph ph-trash"></i></button>
        </div>
      </li>
    `
  }).join('');
  _ul.innerHTML = liHtml;
}
const setInitHtml = () => {
  setEditVocabularyListHtml();
}
setInitHtml();