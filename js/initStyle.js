// 페이지 로드 전에 테마를 설정합니다.
(function() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    backgroundColor = 'black';
    textColor = 'white';
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    backgroundColor = 'white';
    textColor = 'black';
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();