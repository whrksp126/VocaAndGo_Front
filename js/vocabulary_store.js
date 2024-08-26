const initHtml = () => {
  document.querySelector("main .container ul").innerHTML = `
  ${vocabulary_store_dummy_data.map((data)=>`
    <li 
      class="" 
      data-id="${data.id}" 
      style="
        --main-color: ${data.color.main}; 
        --sub-color: ${data.color.sub}; 
        --background-color: ${data.color.background};
      "
      onclick="clickVocabularyPreview(event)"
      >
      <div class="top">
        ${data.category ? `
        <p class="hash">${data.category}</p>
        ` : ``}
        <h3>${data.name}</h3>
      </div>
      <div class="bottom">
        <div class="downloads">
          <i class="ph ph-box-arrow-down"></i>
          <span>${data.downloads.toLocaleString()}</span>
        </div>
        <button class="">
          <i class="ph ph-plus"></i>
        </button>
      </div>
    </li>
  `).join('')}
  `
}

initHtml();

// 서점 단어장 미리보기 클릭 시
const clickVocabularyPreview = (event) => {
  const id = Number(findParentTarget(event.target, "li").dataset.id);
  const words = vocabulary_store_dummy_data.find((data)=>data.id == id).words || [];
  const modal = openDefaultModal();
  modal.container.classList.add('voca_preview')
  modal.top.innerHTML = modalTopHtml(`단어장 미리보기`);
  modal.middle.innerHTML = setVocabularyPreviewHtml(words);
  const btns = [
    {class:"gray close", text: "취소", fun: ``},
    {class:"pink", text: "추가", fun: `onclick="clickAddStoreVocabulary(event)"`}
  ]
  modal.bottom.innerHTML = modalBottomHtml(btns);
  setTimeout(()=>modal.container.classList.add('active'),300)
}

// 서점 단어장 추가 버튼 클릭 시
const clickAddStoreVocabulary = () => {
  const modal = getDefaultModal();
  modal.container.classList.add('confirm');
  modal.middle.innerHTML = `
    <h3>‘토익 준비용 🔥’ 을<br>내 단어장에 추가하시겠어요?</h3>
    <span>추가 후에는 내 단어장에서 수정 가능해요 😉</span>
  `;
  const btns = [
    {class:"close gray", text: "취소", fun: ""},
    {class:"pink", text: "추가", fun: `onclick="alert('다음 업데이트 때 적용 예정')"`}
  ]
  modal.bottom.innerHTML = modalBottomHtml(btns);
  setTimeout(()=>modal.container.classList.add('active'),300)
}