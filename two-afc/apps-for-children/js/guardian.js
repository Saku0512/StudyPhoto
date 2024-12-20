function showSPopup() {
  document.getElementById("settingPanel").style.display = "block";
}
function hideSPopup() {
  document.getElementById("settingPanel").style.display = "none";
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