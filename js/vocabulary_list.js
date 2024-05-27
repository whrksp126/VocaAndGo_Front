

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