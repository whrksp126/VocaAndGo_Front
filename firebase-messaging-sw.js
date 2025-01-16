// Firebase JS SDK 서비스 워커 스크립트
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging.js');

// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyDNZwiU38MuCRuMc57b_QrhdSPINiw50fA",
    authDomain: "vocaandgo.firebaseapp.com",
    projectId: "vocaandgo",
    storageBucket: "vocaandgo.firebasestorage.app",
    messagingSenderId: "1029120969045",
    appId: "1:1029120969045:web:ebbd89ce97284d630c07dc"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// Messaging 인스턴스 생성
const messaging = firebase.messaging();

// 백그라운드 메시지 처리
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message: ', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
