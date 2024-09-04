

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

// 토글 버튼 변경 시
const changeExampleVisibleToggle = (event) => {
  const is_checked = event.target.checked;
  setExampleStyleAlwaysVisible(is_checked);
  console.log(getExmapleStyleAlwaysVisible());
}

// 단어장 업로드 클릭 시
const clickUpload = async (event) => {
  const notebooks = await getIndexedDbNotebooks();
  for (const notebook of notebooks){
    notebook.words = await getIndexedDbWordsByNotebookId(notebook.id);
  };
  console.log(JSON.stringify(notebooks))
  const url = `https://vocaandgo.ghmate.com/login/backup`;
  const method = `POST`;
  const data = notebooks;
  const result = await fetchDataAsync(url, method, data);
  console.log(result)
  
}
// 단어장 다운로드  클릭 시
const clickDownload = (event) => {
  // TODO : 구글 드라이브에 있는 단어장 데이터 요청 API
  // TODO : 받은 데이터 IndexedDb에 저장
}

document.addEventListener('DOMContentLoaded', function() {
  const user_data = JSON.parse(localStorage.getItem('user'));
  const theme_data = localStorage.getItem('theme');
  const example_visible = getExmapleStyleAlwaysVisible();

  if(document.querySelector('body').dataset.page == 'mypage'){
    const _userEmail = document.querySelector('.user_email');
    _userEmail.innerHTML = user_data.email;
    const _theme = document.querySelector('.theme span');
    _theme.innerHTML = theme_data == 'dark' ? '다크' : '라이드';
    const _visible = document.querySelector('.visible span');
    _visible.innerHTML = example_visible ? '항상 보기' : '숨기기';
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
});