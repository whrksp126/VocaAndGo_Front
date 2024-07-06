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
  const id = Number(_modal.dataset.id);
  deleteIndexedDbNotebook(id)
  _modal.click();
  setEditVocabularyListHtml();
}

// 단어장 수정 클릭 시
const clickEditVocabularyBook = async (event, data={name:"", color:"FF8DD4"}) => {
  const id = Number(findParentTarget(event.target, 'li').dataset.id);
  const noteBook = await getIndexedDbNotebookById(id);
  const DATA = {name: noteBook.name,color: noteBook.color.main};
  const modal = openDefaultModal();
  modal.container.dataset.id = id;
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
const setEditVocabularyListHtml = async () => {
  const _ul = document.querySelector('main .container ul');
  _ul.innerHTML = ``;
  const noteBooks = await getIndexedDbNotebooks();
  if(noteBooks.length > 0){
    for(let noteBook of noteBooks){
      const words = await getIndexedDbWordsByNotebookId(noteBook.id);
      const totalWords = words.length;
      const learnedCount = words.reduce((count, word) => {return word.status === "learned" ? count + 1 : count}, 0);
      const html = `
        <li 
          data-id="${noteBook.id}"
          style="--card-color: #${noteBook.color.main}; --card-background: #${noteBook.color.background}; --progress-color: #${noteBook.color.main}4d; ">
          <div class="top">
            <h3>${noteBook.name}</h3>
            <span>${learnedCount}/${totalWords}</span>
          </div>
          <div class="btns">
            <button onclick="clickEditVocabularyBook(event)" class="edit_btn"><i class="ph ph-pencil-simple"></i></button>
            <button onclick="clickDeleteVocabularyBook(event)" class="delete_btn"><i class="ph ph-trash"></i></button>
          </div>
        </li>
      `
      _ul.insertAdjacentHTML('beforeend', html);
    }
  }else{
    console.log('단어장 추가 유도 UI');
  }
}
const setInitHtml = () => {
  setEditVocabularyListHtml();
}
setInitHtml();