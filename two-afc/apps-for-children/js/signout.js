const logout = $("#logout");

logout.on('click', () => {
  signOut();
});

function signOut() {
  firebase.auth().onAuthStateChanged(user => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        console.log('ログアウトしました');
        location.href = "index.html";
      })
      .catch((error) => {
        console.log(`ログアウト時にエラーが発生しました (${error})`);
      });
  });
}