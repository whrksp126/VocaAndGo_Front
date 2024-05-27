// 로컬 스토리지에 저장된 모든 데이터를 전역 변수 객체에 저장
const localStorageData = {};
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  const value = localStorage.getItem(key);
  localStorageData[key] = JSON.parse(value);
}

// 단어장 추가 버튼 클릭 시
const clickAddVocabularyBook = (event) => {
  const modal = openDefaultModal();
  modal.top.innerHTML = modalTopHtml(`단어장 추가`);
  modal.middle.innerHTML = `
    <ul>
      <li>
        <div class="input_text">
          <label>단어장 이름</label>
          <input>
          <span></span>
        </div>
      </li>
    </ul>
  `;
  const btns = [
    {class:"close gray", text: "취소", fun: ""},
    {class:"pink", text: "추가", fun: ""}
  ]
  modal.bottom.innerHTML = modalBottomHtml(btns);
  setTimeout(()=>modal.container.classList.add('active'),300)
}

// 단어장 수정 클릭 시
const clickEditVocabularyBook = (event) => {
  const modal = openDefaultModal();
  modal.top.innerHTML = modalTopHtml(`단어장 수정`);
  modal.middle.innerHTML = `
    <ul>
      <li>
        <div class="input_text">
          <label>단어장 이름</label>
          <input>
          <span></span>
        </div>
      </li>
    </ul>
  `;
  const btns = [
    {class:"close gray", text: "취소", fun: ""},
    {class:"pink", text: "저장", fun: ""}
  ]
  modal.bottom.innerHTML = modalBottomHtml(btns);
  setTimeout(()=>modal.container.classList.add('active'),300)
}

// 단어장 삭제 클릭 시
const clickDeleteVocabularyBook = (event) => {
  const modal = openDefaultModal();
  modal.container.classList.add('confirm')
  modal.middle.innerHTML = `
    <h3>단어장을 정말 삭제하시겠어요?</h3>
    <span>삭제 후에는 복구가 불가능해요 😢</span>
  `;
  const btns = [
    {class:"close gray", text: "취소", fun: ""},
    {class:"pink", text: "삭제", fun: ""}
  ]
  modal.bottom.innerHTML = modalBottomHtml(btns);
  setTimeout(()=>modal.container.classList.add('active'),300)
}















const setUserNameHtml = () => {
  const _name = document.querySelector('header .container h2 strong');
  _name.innerHTML = `${localStorageData.user_data.name}`
}
const setVocabularyListHtml = () => {
  const _ul = document.querySelector('main .container ul');
  const liHtml = localStorageData.vocabulary_list.map((vocabulary)=>{
    const progress = (vocabulary.success_count / vocabulary.total_count) * 100;
    return `
      <li 
        data-id="${vocabulary.id}"
        onclick="window.location.href='/html/vocabulary.html?vocabulary_id=${vocabulary.id}'"
        style="--card-color: ${vocabulary.main_color}; --card-background: ${vocabulary.background_color}; --progress-color: ${vocabulary.main_color}4d; --progress-width:${progress}%;"
        >
        <div class="top">
          <h3>${vocabulary.name}</h3>
          <span>${vocabulary.success_count}/${vocabulary.total_count}</span>
        </div>
        <div class="progress_bar">
          <div class="cur_bar">
            <span>${progress}%</span>
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