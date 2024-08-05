
    /*
  Firebase Authentcation を使った認証サンプル 01
  Firebase Authentication UI を使い、サインイン用のUIを生成
  ポップアップウィンドウで認証画面を表示、サインイン後元の画面に移動
  サインアウト ボタンと、Googleの表示名をウェルカムメッセージとして表示
  サインアウト 用の関数「signOut」を定義

  */

  const ui = new firebaseui.auth.AuthUI(firebase.auth());
  const uiConfig = {
  callbacks: {
    signInSuccessWithAuthResult: function(authResult, redirectUrl) {
      return true;
    },
  },
  signInFlow: 'popup',
  signInSuccessUrl: 'auth-sample01.html',
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
  ],
  tosUrl: 'sample01.html',
  privacyPolicyUrl: 'auth-sample01.html'
  };

  ui.start('#auth', uiConfig);

  firebase.auth().onAuthStateChanged(user => {
    if (user) {
        const signOutMessage = `
        <p>Hello, ${user.displayName}!<\/p>
        <button type="submit"  onClick="signOut()">サインアウト<\/button>
        `;
        document.getElementById('auth').innerHTML =  signOutMessage;
        console.log('ログインしています');

    } 
  });

  function signOut() {
  firebase.auth().onAuthStateChanged(user => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        console.log('ログアウトしました');
        location.reload();
      })
      .catch((error) => {
        console.log(`ログアウト時にエラーが発生しました (${error})`);
      });
  });
  }