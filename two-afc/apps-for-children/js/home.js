// タイマーをリセット
document.querySelector('a[href="./html/study/study.html"]').addEventListener('click', () => {
  localStorage.removeItem('stopwatchTime');
  localStorage.removeItem('isRunning');
});

function showSPopup() {
  document.getElementById("settingPanel").style.display = "block";
}
function hideSPopup() {
  document.getElementById("settingPanel").style.display = "none";

  // 各フィールドを非表示状態に戻す
  const nameField = document.getElementById("nameField");
  const idField = document.getElementById("idField");
  const emailField = document.getElementById("emailField");
  const passwordField = document.getElementById("passwordField");

  // ユーザー名、ID、メール、パスワードを「*」に戻す
  nameField.textContent = "*".repeat(nameField.dataset.name.length);
  idField.textContent = "*".repeat(idField.dataset.id.length);
  emailField.textContent = "*".repeat(emailField.dataset.email.length);
  passwordField.textContent = "*".repeat(passwordField.dataset.password.length);

  // アイコンを非表示状態に戻す
  document.getElementById("toggleName").setAttribute("src", "./ui_image/close_eye.png");
  document.getElementById("toggleId").setAttribute("src", "./ui_image/close_eye.png");
  document.getElementById("toggleEmail").setAttribute("src", "./ui_image/close_eye.png");
  document.getElementById("togglePass").setAttribute("src", "./ui_image/close_eye.png");
}
function saveRecord() {
  alert("記録が保存されました。");
  hidePopup();
}

// パスワードの表示・非表示を切り替える
document.getElementById("togglePass").addEventListener("click", function() {
  const imgElement = this; // クリックされた要素を取得
  const passwordField = document.getElementById("passwordField"); // パスワードの要素を取得
  const currentSrc = imgElement.getAttribute("src");
  // 画像を切り替え、パスワードの表示・非表示を制御
  if (currentSrc === "./ui_image/close_eye.png") {
    imgElement.setAttribute("src", "./ui_image/open_eye.png");
    passwordField.textContent = passwordField.dataset.password; // 表示
  } else {
    imgElement.setAttribute("src", "./ui_image/close_eye.png");
    passwordField.textContent = "*".repeat(passwordField.dataset.password.length); // 非表示
  }
});
// ユーザーIDの表示・非表示を切り替える
document.getElementById("toggleId").addEventListener('click', function() {
  const imgElement = this;
  const idField = document.getElementById("idField");
  const currentSrc = imgElement.getAttribute("src");

  if (currentSrc === "./ui_image/close_eye.png") {
    imgElement.setAttribute("src", "./ui_image/open_eye.png");
    idField.textContent = idField.dataset.id;
  } else {
    imgElement.setAttribute("src", "./ui_image/close_eye.png");
    idField.textContent = "*".repeat(idField.dataset.id.length);
  }
});
// ユーザー名の表示・非表示を切り替える
document.getElementById("toggleName").addEventListener('click', function() {
  const imgElement = this;
  const nameField = document.getElementById("nameField");
  const currentSrc = imgElement.getAttribute("src");

  if (currentSrc === "./ui_image/close_eye.png") {
    imgElement.setAttribute("src", "./ui_image/open_eye.png");
    nameField.textContent = nameField.dataset.name;
  } else {
    imgElement.setAttribute("src", "./ui_image/close_eye.png");
    nameField.textContent = "*".repeat(nameField.dataset.name.length);
  }
});
// メールアドレスの表示・非表示を切り替える
document.getElementById("toggleEmail").addEventListener('click', function() {
  const imgElement = this;  // クリックされた要素を取得
  const emailField = document.getElementById("emailField"); // メールアドレスの要素を取得
  const currentSrc = imgElement.getAttribute("src"); // 現在の画像のパスを取得
  // 画像を切り替え、メールアドレスの表示・非表示を制御
  if (currentSrc === "./ui_image/close_eye.png") {
    imgElement.setAttribute("src", "./ui_image/open_eye.png");
    emailField.textContent = emailField.dataset.email; // 表示
  } else {
    imgElement.setAttribute("src", "./ui_image/close_eye.png");
    emailField.textContent = "*".repeat(emailField.dataset.email.length); // 非表示
  }
});