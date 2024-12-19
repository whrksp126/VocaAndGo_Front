// 페이지 로드 전에 테마를 설정합니다.
(function() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }

  // 예문 보기 초기 기본 값 세팅
  if(!localStorage.getItem('example_style')){
    localStorage.setItem('example_style', JSON.stringify({
      always_visible : true,
    }))
  }

  // 푸시 알림 초기 기본 값 세팅
  if(!localStorage.getItem('push_notification')){
    localStorage.setItem('push_notification', JSON.stringify({
      daily_sentence : true
    }))
  }
})();


// 조회 예문 보기 
const getExmapleStyleAlwaysVisible = () => {
  const exampleStyle = JSON.parse(localStorage.getItem('example_style'));
  return exampleStyle.always_visible;
}

// 세팅 예문 보기
const setExampleStyleAlwaysVisible = (always_visible) => {
  const exampleStyle = JSON.parse(localStorage.getItem('example_style'));
  exampleStyle.always_visible = always_visible;
  localStorage.setItem('example_style', JSON.stringify(exampleStyle));
}

// 조회 푸시 알람 
const getPushNotificationOn = () => {
  const pushNotification = JSON.parse(localStorage.getItem('push_notification'));
  return pushNotification.daily_sentence;
}


// 세팅 푸시 알림
const setPushNotificationOn = (daily_sentence) => {
  const pushNotification = JSON.parse(localStorage.getItem('push_notification'));
  pushNotification.daily_sentence = daily_sentence;
  localStorage.setItem('push_notification', JSON.stringify(pushNotification));
}