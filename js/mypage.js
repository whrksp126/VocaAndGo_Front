

// 로그아웃 버튼 클릭 시
const clickLogOut = (event) => {
  const modal = openDefaultModal();
  modal.container.classList.add('confirm');
  modal.middle.innerHTML = `
    <h3>정말 로그아웃 하시겠어요?</h3>
    <span>로그아웃 시에는 일부 기능을 사용할 수 없어요 🥺</span>
  `;
  const btns = [
    {class:"close gray", text: "취소", fun: ""},
    {class:"pink", text: "로그아웃", fun: `onclick="clickModalLogOut(event)"`}
  ]
  modal.bottom.innerHTML = modalBottomHtml(btns);
  setTimeout(()=>modal.container.classList.add('active'),300)
}

// 로그아웃 모달에서 로그아웃 클릭 시
const clickModalLogOut = (event) => {
  alert('다시 만나요~');
  const user_data = JSON.parse(localStorage.getItem('user'));
  localStorage.setItem('user', JSON.stringify({
    token: user_data.token,
    email: user_data.email,
    name: user_data.name,
    state: "logout"
  }))
  const device_type = getDevicePlatform();
  if(device_type == 'web'){
    window.location.href = '/html/login.html';
  }else{
    window.ReactNativeWebView.postMessage('logoutGoogleAuth');
    window.location.href = '/html/login.html'
  }
}

// 토글 버튼 변경 시
const changeThemeToggle = (event) => {
  const is_checked = event.target.checked;
  if(is_checked){
    setDarkTheme();
  }else{
    setLightTheme();
  }
}

// light 모드 설정
function setLightTheme() {
  document.documentElement.setAttribute('data-theme', 'light');
  document.documentElement.style.setProperty('--background-color', 'white');
  document.documentElement.style.setProperty('--text-color', 'black');
  localStorage.setItem('theme', 'light');
}
// dark 모드 설정
function setDarkTheme() {
  document.documentElement.setAttribute('data-theme', 'dark');
  document.documentElement.style.setProperty('--background-color', 'black');
  document.documentElement.style.setProperty('--text-color', 'white');
  localStorage.setItem('theme', 'dark');
}

// 예문 보기 토글 버튼 변경 시
const changeExampleVisibleToggle = (event) => {
  const is_checked = event.target.checked;
  setExampleStyleAlwaysVisible(is_checked);
  console.log(getExmapleStyleAlwaysVisible());
}

// 푸시 알림 토글 버튼 변경 시
const changePushNotificationToggle = async (event) => {
  const is_checked = event.target.checked;
  alert(`토큰 조회 전`)
  const fcm_token = await getFcmToken()
  alert(fcm_token)
  const url = `https://vocaandgo.ghmate.com/fcm/is_message_allowed`;
  const method = 'POST';
  const fetchData = {
    is_allowed: event.target.checked,
    fcm_token : fcm_token,
  };
  alert(`전 : ${JSON.stringify(fetchData)}`);
  const result = await fetchDataAsync(url, method, fetchData);
  alert(`후 : ${JSON.stringify(result)}`);
  if(result.code == 200){
    setPushNotificationOn(is_checked);
    console.log(getPushNotificationOn());
  }
}

// 단어장 업로드 클릭 시
const clickUpload = async (event) => {
  // TODO : 업로드 경고 모달
   
  const _li = findParentTarget(event.target, 'li');
  const _iconBox = _li.querySelector('.icon_box');
  setModalLoadingBtn(_iconBox);
  const device_type = getDevicePlatform();
  const wordbooks = await getWordbook();
  for (const wordbook of wordbooks) {
    wordbook.words = await getWordsByWordbook(wordbook.id);
    wordbook.words.forEach((word) => delete word.wordbookId);
  }
  // 업로드 요청 함수 정의
  const uploadNotebooks = async (url, data) => {
    setNoEvents();
    try {
      const result = await fetchDataAsync(url, 'POST', data);
      if (result.code === 200) {
        cleanNoEvents()
        cleanModalLoadingBtn(_iconBox, '<i class="ph ph-upload"></i>')
        alert('단어장 업로드 완료');
      } else if (result.code === 401 || result.code === 403) { // 구글 드라이브 읽기 쓰기 권한 없음
        alert("구글 드라이브 권한이 필요합니다. 다시 로그인해주세요.")
        const isSuccess = await requestGooglePermissions();
        if(isSuccess){
          const accessToken = await getAccessToken();
          await uploadNotebooks(url, {notebooks: data.notebooks, access_token: accessToken});
          cleanModalLoadingBtn(_iconBox, '<i class="ph ph-upload"></i>')
          cleanNoEvents()
        }
      }else {
        cleanModalLoadingBtn(_iconBox, '<i class="ph ph-upload"></i>')
        cleanNoEvents()
        alert(`업로드 실패: ${result.msg || '알 수 없는 오류가 발생했습니다.'}`);
      }
    } catch {
      cleanModalLoadingBtn(_iconBox, '<i class="ph ph-upload"></i>')
      cleanNoEvents()
      alert('단어장을 업로드하는 중에 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // URL과 데이터 설정
  if (device_type === 'web') {
    const url = `https://vocaandgo.ghmate.com/drive/backup`;
    console.log("wordbooks,",wordbooks)
    await uploadNotebooks(url, wordbooks);
  } else {
    try {
      const accessToken = await getAccessToken();
      const url = `https://vocaandgo.ghmate.com/drive/backup/app`;
      const data = { notebooks: wordbooks, access_token: accessToken };
      await uploadNotebooks(url, data);
    } catch (error) {
      console.error("액세스 토큰을 가져오는 중 오류:", error);
    }
  }
};

// 단어장 다운로드 클릭 시
const clickDownload = async (event) => {
  // TODO : 다운로드 경고 모달

  const _li = findParentTarget(event.target, 'li');
  const _iconBox = _li.querySelector('.icon_box');
  setModalLoadingBtn(_iconBox);
  setNoEvents();
  
  const device_type = getDevicePlatform();
  const method = `GET`;
  let fetchData = {};
  try {
    
    const downloadNotebooks = async () => {
      let url = `https://vocaandgo.ghmate.com/drive/excel_to_json`;
      if (device_type !== 'web') {
        const accessToken = await getAccessToken();
        fetchData['access_token'] = accessToken;
        url += `/app`; // 모바일용 URL로 변경
      }
      const result = await fetchDataAsync(url, method, fetchData);
      if(result.code == 200){
        const existing_wordbooks = await getWordbook();
        for (const wordbook of existing_wordbooks) {
          await deleteWordbookWithWords(wordbook.id);
        }
        for (const wordbook of result.data) {
          const wordbook_data = await addWordbook(wordbook.name, wordbook.color, wordbook.status);
          for (const data of wordbook.words) {
            await addWord(wordbook_data.id, data.word, data.meaning, data.example, data.description, data.status);
          }
        }
        cleanNoEvents()
        cleanModalLoadingBtn(_iconBox, '<i class="ph ph-download"></i>')
        alert('단어장 다운로드 완료');
      }
      else if (result.code === 400 || result.code === 401 || result.code === 403) {
        alert("구글 드라이브 권한이 필요합니다. 다시 로그인해주세요.")
        const isSuccess = await requestGooglePermissions();
        if(isSuccess){
          await downloadNotebooks();
        }else{
          cleanModalLoadingBtn(_iconBox, '<i class="ph ph-download"></i>')
          cleanNoEvents()
        }
      }else{
        cleanModalLoadingBtn(_iconBox, '<i class="ph ph-download"></i>')
        cleanNoEvents()
        alert(`다운로드 실패: ${result.msg || '알 수 없는 오류가 발생했습니다.'}`);
        return
      }
    }
    downloadNotebooks();
    

    // IndexedDB에서 기존 단어장 삭제
    // const notebooks = await getIndexedDbNotebooks();
    // for (const notebook of notebooks) {
    //   await deleteIndexedDbNotebook(notebook.id);
    // }
    

    // 서버에서 받은 단어장 데이터 추가
    // for (const notebook of result.data) {
    //   const notebook_id = await addIndexedDbNotebook(notebook.name, notebook.color, notebook.createdAt, notebook.updatedAt, notebook.status);
    //   for (const data of notebook.words) {
    //     await addIndexedDbWord(notebook_id, data.word, data.meaning, data.example, data.description, data.createdAt, data.updatedAt, data.status);
    //   }
    // }

  } catch (error) {
    cleanModalLoadingBtn(_iconBox, '<i class="ph ph-download"></i>')
    cleanNoEvents()
    console.error("다운로드 중 오류 발생:", error);
    alert("다운로드 실패: 오류가 발생했습니다.");
  }
};

document.addEventListener('DOMContentLoaded', function() {
  const user_data = JSON.parse(localStorage.getItem('user'));
  const theme_data = localStorage.getItem('theme');
  const example_visible = getExmapleStyleAlwaysVisible();

  if(document.querySelector('body').dataset.page == 'account'){
    const _userEmail = document.querySelector('.user_email');
    _userEmail.innerHTML = user_data.email;
  }
  if(document.querySelector('body').dataset.page == 'mypage'){
    const _userEmail = document.querySelector('.user_email');
    _userEmail.innerHTML = user_data.email;
    const _theme = document.querySelector('.theme span');
    _theme.innerHTML = theme_data == 'dark' ? '다크' : '라이트';
    const _visible = document.querySelector('.visible span');
    _visible.innerHTML = example_visible ? '항상 보기' : '숨기기';
    const _fcmPush = document.querySelector('.fcm_push span');
    alert(getPushNotificationOn())
    _fcmPush.innerHTML = getPushNotificationOn() ? 'on' : 'off';
    
  }

  // 페이지 로드 시 저장된 테마 설정 적용
  if(document.querySelector('body').dataset.page == 'theme'){
    document.querySelector('main .toggle_box').innerHTML = `
      <input 
        id="theme_toggle_btn" 
        type="checkbox" 
        class="theme_checkbox" 
        onchange="changeThemeToggle(event)"
        ${theme_data == 'dark' ? 'checked' : ''}
      >
      <label for="theme_toggle_btn" class="switch_box">
        <div class="btn_icon">
          <i class="ph-fill ph-sun"></i>
          <i class="ph-fill ph-moon"></i>
        </div>
      </label>
    `
  }
  if(document.querySelector('body').dataset.page == 'example_settings'){
    document.querySelector('main .toggle_box').innerHTML = `
      <input 
        id="theme_toggle_btn" 
        type="checkbox" 
        class="custom_checkbox" 
        onchange="changeExampleVisibleToggle(event)"
        ${example_visible ? 'checked' : ''}
      >
      <label for="theme_toggle_btn" class="switch_box">
        <div class="btn_icon">
        </div>
      </label>
    `
  }
  if(document.querySelector('body').dataset.page == 'push_notifications'){
    document.querySelector('main .toggle_box').innerHTML = `
      <input 
        id="theme_toggle_btn" 
        type="checkbox" 
        class="custom_checkbox" 
        onchange="changePushNotificationToggle(event)"
        ${getPushNotificationOn() ? 'checked' : ''}
      >
      <label for="theme_toggle_btn" class="switch_box">
        <div class="btn_icon">
        </div>
      </label>
    `
  }
});