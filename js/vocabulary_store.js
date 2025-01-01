let STORE_DATA = null;
const getStoreData = async () => {
  const url = `https://vocaandgo.ghmate.com/search/bookstore`
  const method = 'GET';
  const result = await fetchDataAsync(url, method);
  if(result.code != 200) return null;
  return result.data
}

const initHtml = async () => {
  STORE_DATA = await getStoreData();
  // STORE_DATA = vocabulary_store_dummy_data;
  if(!STORE_DATA) return alert('서점 데이터 호출 중 에러');
  document.querySelector("main .container ul").innerHTML = `
  ${STORE_DATA.map((data)=>{
    const color = JSON.parse(data.color);
    return `
    <li 
      class="" 
      data-id="${data.id}" 
      style="
        --main-color: ${color.main}; 
        --sub-color: ${color.sub}; 
        --background-color: ${color.background};
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
    `}).join('')}
  `
}

initHtml();

// 서점 단어장 미리보기 클릭 시
const clickVocabularyPreview = (event) => {
  const id = Number(findParentTarget(event.target, "li").dataset.id);
  const words = STORE_DATA.find((data)=>data.id == id).words || [];
  const modal = openDefaultModal();
  modal.container.classList.add('voca_preview')
  modal.top.innerHTML = modalTopHtml(`단어장 미리보기`);
  modal.middle.innerHTML = setVocabularyPreviewHtml(words);
  setLottieSound();

  const btns = [
    {class:"gray close", text: "취소", fun: ``},
    {class:"pink", text: "추가", fun: `onclick="clickAddStoreVocabulary(event, ${id})"`}
  ]
  modal.bottom.innerHTML = modalBottomHtml(btns);
  setTimeout(()=>modal.container.classList.add('active'),300)
}

// 서점 단어장 추가 버튼 클릭 시
const clickAddStoreVocabulary = (event, id) => {
  const modal = getDefaultModal();
  modal.container.classList.add('confirm');
  modal.middle.innerHTML = `
    <h3>‘토익 준비용 🔥’ 을<br>내 단어장에 추가하시겠어요?</h3>
    <span>추가 후에는 내 단어장에서 수정 가능해요 😉</span>
  `;
  const btns = [
    {class:"close gray", text: "취소", fun: ""},
    {class:"pink", text: "추가", fun: `onclick="clickAddVocabulary(event, ${id})"`}
  ];
  modal.bottom.innerHTML = modalBottomHtml(btns);
  setTimeout(()=>modal.container.classList.add('active'),300);
};

const clickAddVocabulary = async (event, id) => {
  setNoEvents();
  setModalLoadingBtn(findParentTarget(event.target, 'button'));
  const callback = async (result) => {
    if(result == "success"){
      const vocabulary = STORE_DATA.find((item)=>item.id == id);
      const createdAt = new Date().toISOString();
      const color = JSON.parse(vocabulary.color);
      const wordbook = await addWordbook(vocabulary.name, {main : color.main,background : color.background});
      const wordsData = vocabulary.words.map(data => ({
        wordbookId: Number(wordbook.id),
        word: data.word,
        meaning: data.meaning,
        example: data.examples,
        description: data.description,
        status: 0
      }));
      const words = await addWords(wordsData);

      // 단어장 다운로드 수 증가
      const url = 'https://vocaandgo.ghmate.com/search/bookstore/download';
      const method = 'POST';
      const fetchData = {id : id};
      const result = await fetchDataAsync(url, method, fetchData);
      cleanNoEvents();
      window.location.href=`/html/vocabulary_list.html`;
    }
    if(result == "failure"){
      cleanNoEvents();
      alert("리워드 획득 실패");
    }
  }
  showRewardedAd(callback)
}


createTestViewLog();