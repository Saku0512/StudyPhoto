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
  const inputElements = document.querySelectorAll("input.edit-input");
  inputElements.forEach(inputElement => {
    const targetFieldId = inputElement.id;
    restoreText(inputElement, targetFieldId); // 入力中のフィールドをpreに戻す
  });

  // 編集アイコンを非表示状態に戻す
  document.getElementById("editName").setAttribute("src", "./ui_image/pencil.png");
  document.getElementById("editPass").setAttribute("src", "./ui_image/pencil.png");

  // チェックマークを削除
  const checkIcons = document.querySelectorAll(".check-icon");
  checkIcons.forEach(icon => icon.remove());

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

// ユーザー名の編集処理
document.getElementById("editName").addEventListener('click', function() {
  toggleEdit(this, "nameField");
});

// パスワードの編集処理
document.getElementById("editPass").addEventListener('click', function() {
  toggleEdit(this, "passwordField");
});

// 編集アイコンの切り替え処理（共通化）
function toggleEdit(imgElement, targetFieldId) {
  const field = document.getElementById(targetFieldId);
  const currentSrc = imgElement.getAttribute("src");

  if (currentSrc === "./ui_image/pencil.png") {
    // 編集モード開始
    imgElement.setAttribute("src", "./ui_image/cross_mark.png");

    // 現在のテキストを取得してinputに置き換え
    if (targetFieldId === "nameField") {
      const currentValue = field.dataset.name; // data-* ではなく textContent で取得
      const inputElement = document.createElement("input");
      inputElement.value = currentValue;
      inputElement.id = targetFieldId;
      inputElement.classList.add("edit-input");

      field.replaceWith(inputElement);
      inputElement.focus();
    } else if (targetFieldId === "passwordField") {
      const currentValue = field.dataset.password;
      const inputElement = document.createElement("input");
      inputElement.value = currentValue;
      inputElement.id = targetFieldId;
      inputElement.classList.add("edit-input");

      field.replaceWith(inputElement);
      inputElement.focus();
    }

    // チェックマークがなければ追加
    if (!document.getElementById("checkMark_" + targetFieldId)) {
      const checkImg = document.createElement("img");
      checkImg.setAttribute("src", "./ui_image/check_mark.png");
      checkImg.setAttribute("alt", "確認");
      checkImg.setAttribute("id", "checkMark_" + targetFieldId);
      checkImg.classList.add("check-icon");

      // cross_mark.png の隣に挿入
      imgElement.parentElement.insertBefore(checkImg, imgElement.nextSibling);

      // チェックマーククリック時の処理
      checkImg.addEventListener('click', function() {
        const inputElement = document.getElementById(targetFieldId);
        saveEdit(inputElement, targetFieldId);

        // cross_mark.png を pencil.png に戻す
        imgElement.setAttribute("src", "./ui_image/pencil.png");

        // check_mark.png を削除
        if (checkImg) {
          checkImg.remove();
        }
      });
    }
  } else if (currentSrc === "./ui_image/cross_mark.png") {
    // 編集モード終了（キャンセル）
    imgElement.setAttribute("src", "./ui_image/pencil.png");
    restoreText(field, targetFieldId);

    // チェックマークを確実に削除
    const checkImg = document.getElementById("checkMark_" + targetFieldId);
    if (checkImg) {
      checkImg.remove();
    }
  }
}

// 編集内容を保存し、PHPに送信
function saveEdit(inputElement, targetFieldId) {
  const newValue = inputElement.value;

  // サーバーに送信するデータ
  const data = {
    field: targetFieldId,
    newValue: newValue
  };

  // fetchを使ってデータをPHPに送信
  fetch('./home.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // 成功した場合、画面に反映
      restoreText(inputElement, targetFieldId);
      alert('変更が保存されました。');
    } else {
      // 失敗した場合、エラーメッセージ
      alert('保存に失敗しました: ' + (data.error || '不明なエラー'));
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('エラーが発生しました: ' + error.message);
  });
}

// テキストを元の状態に戻す
function restoreText(inputElement, targetFieldId) {
  const originalValue = inputElement.value; // inputから元の値を取得

  if (originalValue !== undefined) {
    // preタグに戻して置き換え
    const preElement = document.createElement("pre");
    preElement.id = targetFieldId;
    preElement.textContent = "*".repeat(originalValue.length);
    preElement.dataset[targetFieldId.replace('Field', '')] = originalValue;
    preElement.classList.add("code-block");

    inputElement.replaceWith(preElement);
  } else {
    console.error("原本の値が存在しません: " + targetFieldId);
  }
}