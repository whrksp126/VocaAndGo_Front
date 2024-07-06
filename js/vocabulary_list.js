// 단어장 추가 버튼 클릭 시
const clickAddVocabularyBook = (event, data={name:"", color:"FF8DD4"}) => {
  const modal = openDefaultModal();
  modal.top.innerHTML = modalTopHtml(`단어장 추가`);
  modal.middle.innerHTML = setVocabularyBookHtml(data)
  const btns = [
    {class:"close gray", text: "취소", fun: ""},
    {class:"pink", text: "추가", fun: `onclick="clickSaveVocabulary(event, setVocabularyListHtml)"`}
  ]
  modal.bottom.innerHTML = modalBottomHtml(btns);
  setTimeout(()=>modal.container.classList.add('active'),300)
  addEventClickColor();
};




















const setUserNameHtml = async () => {
  const _name = document.querySelector('header .container h2 strong');
  const user_data = await getIndexedDbUsers();
  _name.innerHTML = `${user_data.name}`
}
const setVocabularyListHtml = async () => {
  const _ul = document.querySelector('main .container ul');
  _ul.innerHTML = ``;
  const noteBooks = await getIndexedDbNotebooks();
  if(noteBooks.length > 0){
    for(let noteBook of noteBooks){
      const words = await getIndexedDbWordsByNotebookId(noteBook.id);
      const totalWords = words.length;
      const learnedCount = words.reduce((count, word) => {return word.status === "learned" ? count + 1 : count}, 0);
      const progress = (learnedCount / totalWords) * 100 || 0;  
      const html = `
        <li 
          data-id="${noteBook.id}"
          onclick="window.location.href='/html/vocabulary.html?vocabulary_id=${noteBook.id}'"
          style="--card-color: #${noteBook.color.main}; --card-background: #${noteBook.color.background}; --progress-color: #${noteBook.color.main}4d; --progress-width:${progress}%;"
          >
          <div class="top">
            <h3>${noteBook.name}</h3>
            <span>${learnedCount}/${totalWords}</span>
          </div>
          <div class="progress_bar">
            <div class="cur_bar">
              <span class="${progress > 13 ? "" : "right"}">${progress}%</span>
            </div>
          </div>
        </li>
      `
      _ul.insertAdjacentHTML('beforeend', html)
    }
  }else{
    console.log('단어장 추가 유도 UI');
  }
}
const setInitHtml = () => {
  setUserNameHtml();
  setVocabularyListHtml();
}
setInitHtml();