 
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js",
);


firebase.initializeApp({
  apiKey: "AIzaSyDAL-zqJAxhbPMvvZjObd8XzJmLiCaCfBU",
  authDomain: "charismatic-age-483618-d4.firebaseapp.com",
  projectId: "charismatic-age-483618-d4",
  storageBucket: "charismatic-age-483618-d4.firebasestorage.app",
  messagingSenderId: "562176806580",
  appId: "1:562176806580:web:3d938efea3b167fb1611e1",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(
    payload.notification?.title ?? "Notification",
    {
      body: payload.notification?.body,
    },
  );
});

