function showSPopup() {
  document.getElementById("settingPanel").style.display = "block";
}
function hideSPopup() {
  document.getElementById("settingPanel").style.display = "none";

  // 各フィールドをの要素を取得
  const nameField = document.getElementById("userNameField");
  const idField = document.getElementById("userIdField");

  // ユーザー名、IDを「*」に戻す
  nameField.textContent = "*".repeat(nameField.dataset.username.length);
  idField.textContent = "*".repeat(idField.dataset.userid.length);

  // アイコンを非表示状態に戻す
  document.getElementById("toggleUserName").setAttribute("src", "./ui_image/close_eye.png");
  document.getElementById("toggleId").setAttribute("src", "./ui_image/close_eye.png");
}

document.getElementById("toggleUserName").addEventListener("click", function() {
  const imgElement = this;
  const usernameField = document.getElementById("userNameField");
  const currentSrc = imgElement.getAttribute("src");

  if (currentSrc === "./ui_image/close_eye.png") {
    imgElement.setAttribute("src", "ui_image/open_eye.png");
    usernameField.textContent = usernameField.dataset.username;
  } else {
    imgElement.setAttribute("src", "./ui_image/close_eye.png");
    usernameField.textContent = "*".repeat(usernameField.dataset.username.length);
  }
});

document.getElementById("toggleId").addEventListener("click", function() {
  const imgElement = this;
  const userIdField = document.getElementById("userIdField");
  const currentSrc = imgElement.getAttribute("src");

  if (currentSrc === "./ui_image/close_eye.png") {
    imgElement.setAttribute("src", "ui_image/open_eye.png");
    userIdField.textContent = userIdField.dataset.userid;
  } else {
    imgElement.setAttribute("src", "./ui_image/close_eye.png");
    userIdField.textContent = "*".repeat(userIdField.dataset.userid.length);
  }
});