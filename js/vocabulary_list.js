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




















const setUserNameHtml = () => {
  const _name = document.querySelector('header .container h2 strong');
  _name.innerHTML = `${localStorageData.user_data.name}`
}
const setVocabularyListHtml = () => {
  const _ul = document.querySelector('main .container ul');
  if(!localStorageData.vocabulary_list) return;
  const liHtml = localStorageData.vocabulary_list.map((vocabulary) => {
    const progress = (vocabulary.counts.correct / vocabulary.counts.total) * 100 || 0;
    return `
      <li 
        data-id="${vocabulary.id}"
        onclick="window.location.href='/html/vocabulary.html?vocabulary_id=${vocabulary.id}'"
        style="--card-color: #${vocabulary.colors.main}; --card-background: #${vocabulary.colors.background}; --progress-color: #${vocabulary.colors.main}4d; --progress-width:${progress}%;"
        >
        <div class="top">
          <h3>${vocabulary.name}</h3>
          <span>${vocabulary.counts.correct}/${vocabulary.counts.total}</span>
        </div>
        <div class="progress_bar">
          <div class="cur_bar">
            <span class="${progress > 13 ? "" : "right"}">${progress}%</span>
          </div>
        </div>
      </li>
    `
  }).join('');
  _ul.innerHTML = liHtml;
}
const setInitHtml = () => {
  setUserNameHtml();
  setVocabularyListHtml();
}
setInitHtml();