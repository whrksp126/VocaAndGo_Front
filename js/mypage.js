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
  window.location.href = '/html/login.html'
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
// 페이지 로드 시 저장된 테마 설정 적용
document.addEventListener('DOMContentLoaded', function() {
  if(document.querySelector('body').dataset.page == 'theme'){
    const savedTheme = localStorage.getItem('theme');
    document.querySelector('main .toggle_box').innerHTML = `
      <input 
        id="theme_toggle_btn" 
        type="checkbox" 
        class="theme_checkbox" 
        onchange="changeThemeToggle(event)"
        ${savedTheme == 'dark' ? 'checked' : ''}
      >
      <label for="theme_toggle_btn" class="switch_box">
        <div class="btn_icon">
          <i class="ph-fill ph-sun"></i>
          <i class="ph-fill ph-moon"></i>
        </div>
      </label>
    `
  }
});