

// Firebaseの初期化
var config = {
  apiKey: "AIzaSyBZxjwX0yd15FkvGzoVZlXgRdIQaJgH7j4",
  authDomain: "sky-way-d053d.firebaseapp.com",
  };
  firebase.initializeApp(config);
  
  // アカウント登録
  function signUp() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
  
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(function(result) {
        console.log(result);
        document.getElementById('log').innerText = 'サインアップ成功';
      }).catch(function(error) {
        console.log('signup error')
        var errorCode = error.code;
        var errorMessage = error.message;
        document.getElementById('log').innerText = 'サインアップ失敗: ' + errorCode + ', ' + errorMessage;
      });
  }
  
  // ログイン
  function signIn() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
  
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(function(result) {
        document.getElementById('log').innerText = 'サインイン成功';
        //ログインページで入力したuserIDをhashに設定することでログインスルーを防いでいる
        let userhash = document.getElementById('user-name').value
        let hashkey = 'approval'
        location.replace('http://localhost:3000#'+hashkey+userhash);

      }).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        document.getElementById('log').innerText = 'サインイン失敗: ' + errorCode + ', ' + errorMessage;
      });
  }
  
  // ログアウト
  function signOut() {
    firebase.auth().signOut().then(function() {
      document.getElementById('log').innerText = 'サインアウト成功';

    }).catch(function(error) {
      console.log(error);
      document.getElementById('log').innerText = 'サインアウト失敗';
    });
  }
  
  // ログイン確認
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // ログイン認証済
      console.log('auth user', user);
      document.getElementById('state').innerText = 'ログイン済(email: ' + user.email + ')';

    } else {
      // No user is signed in.
      document.getElementById('state').innerText = '未ログイン';
    }
  });