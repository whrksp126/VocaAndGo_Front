let OCR_DATA = [];
// 카메라 열기 버튼 클릭 시, React Native의 WebView에 메시지를 보냄
const clickOpenOcrCamera = async (event) => {
  let img_data;
  try{
    if (getDevicePlatform() === 'web') {
      const ocr_list = await getWebOcrData('/images/orc_dummy_img_6.png?v=2025.01.170143');
      img_data = { image: '/images/orc_dummy_img_6.png?v=2025.01.170143', ocr_list: ocr_list }
    } else if (getDevicePlatform() === 'app') {
      img_data = await openCamera('ocr');
    }
  }catch (error) {
    console.error("카메라를 여는 중 오류 발생:", error);
  }
  const modal = getDefaultModal();
  modal.container.classList.add('ocr_word');
  modal.top.innerHTML = modalTopHtml(`단어 선택`);
  modal.middle.innerHTML = `
    <div class="preview">
      <img src="${img_data.image}">
      <div class="highlighter"></div>
    </div>
    <ul class="search_list"></ul>
  `;
  const btns = [
    { class: "gray", text: "재촬영", fun: `onclick="clickOpenOcrCamera(event)"` },
  ];
  modal.bottom.innerHTML = modalBottomHtml(btns);
  OCR_DATA = await searchAndFilterWords(img_data.ocr_list);
  const imgElement = document.querySelector('.ocr_word .preview img');
  const cur_img_rect = imgElement.getBoundingClientRect();
  const ori_img_rect = { width: imgElement.naturalWidth, height: imgElement.naturalHeight };

  const _searchList = modal.middle.querySelector('.search_list');
  _searchList.classList.toggle('active', OCR_DATA.length > 0);
  _searchList.innerHTML = '';
  OCR_DATA.forEach(({ search, box }, index) => {
    OCR_DATA[index].box = convertOcrBox(box, ori_img_rect, cur_img_rect);
    const search_meaning_html = search.meanings.join(', ');
    _searchList.insertAdjacentHTML('beforeend', `
      <li onclick="clickSelectOcrSearchedWord(event, ${index})" data-index="${index}">
        <div class="search_word">${search.word}</div>
        <div class="search_meaning">${search_meaning_html}</div>
      </li>
    `);
  });
};
// 웹 OCR 조회
const getWebOcrData = async (src) => {
  return (await getOcr(src, ['eng'])).filter(item => /^[a-zA-Z]{2,}$/.test(item.text));
  
}
// OCR 결과 사전 리스트로 필터링
async function searchAndFilterWords(ocr_list) {
  if(!ocr_list || ocr_list.length == 0) return;

  const url = `https://vocaandgo.ghmate.com/search/en`;
  const method = 'GET';
  try {
    const fetchPromises = ocr_list.map(async (ocr_data) => {
      const data = { word: ocr_data.text };
      try {
        const result = await fetchDataAsync(url, method, data);
        if (result.code != 200) {
          console.error('검색 에러');
        } else {
          if (result.data.length > 0) {
            ocr_data.search = result.data[0];
          }
        }
      } catch (error) {
        console.error('API 요청 중 오류 발생:', error);
      }
      return ocr_data; 
    });
    let updatedOCRData = await Promise.all(fetchPromises);
    updatedOCRData = updatedOCRData.filter(ocr_data => ocr_data.search);
    return updatedOCRData;
  } catch (error) {
    console.error('전체 요청 처리 중 오류 발생:', error);
  }
}

// ocr box 데이터 현재 이미지 사이즈에 맞게 변환
const convertOcrBox = (originalBox, ori_img_rect, cur_img_rect) => {
  const scaleWidth = cur_img_rect.width / ori_img_rect.width;
  const scaleHeight = cur_img_rect.height / ori_img_rect.height;
  const scaleFactor = Math.min(scaleWidth, scaleHeight);
  const padding = 5;
  return {
    x0: originalBox.x0 * scaleFactor - padding,
    y0: originalBox.y0 * scaleFactor - padding,
    x1: originalBox.x1 * scaleFactor + padding,
    y1: originalBox.y1 * scaleFactor + padding
  };
}

  // OCR 검색된 단어 선택 시
const clickSelectOcrSearchedWord = (event, index) => {
  const _highlighter = document.querySelector('.preview .highlighter');
  _highlighter.style.top = `${OCR_DATA[index].box.y0}px`;
  _highlighter.style.left = `${OCR_DATA[index].box.x0}px`;
  _highlighter.style.width = `${OCR_DATA[index].box.x1 - OCR_DATA[index].box.x0}px`;
  _highlighter.style.height = `${OCR_DATA[index].box.y1 - OCR_DATA[index].box.y0}px`;
  _highlighter.classList.add('active');

  const modal = getDefaultModal();
  modal.container.classList.add('ocr_word')
  modal.top.innerHTML = modalTopHtml(`단어 추가`);
  const __searchWord = modal.middle.querySelectorAll('.search_list li');
  __searchWord.forEach((_searchWord)=>{
    if(_searchWord.dataset.index != index){
      _searchWord.classList.add("hidden");
    }else{
      _searchWord.classList.add("active");
    }
  })
  const btns = [
    {class:"gray", text: "다시 선택", fun: `onclick="clickSelectAgainOcrSearchedWord(event)"`},
    {class:"pink", text: "추가", fun: `onclick="clickAddOcrSearchedWord(event)"`},
  ]
  modal.bottom.innerHTML = modalBottomHtml(btns);
}
