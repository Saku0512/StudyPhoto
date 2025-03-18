// タイマーをリセット
document.querySelector('a[href="./pages/study/study.html"]').addEventListener('click', () => {
    localStorage.removeItem('stopwatchTime');
    localStorage.removeItem('isRunning');
});

// ポップアップの表示・非表示
function togglePopup(action) {
    const panel = document.getElementById("settingPanel");
    panel.style.display = action === 'show' ? "block" : "none";

    if (action === 'hide') {
        resetFields();
    }
}

function resetFields() {
    const inputElements = document.querySelectorAll("input.edit-input");
    inputElements.forEach(inputElement => restoreText(inputElement, inputElement.id));

    resetIcons();
}

function resetIcons() {
    const iconDefaults = {
        "editName": "./ui_image/pencil.png",
        "editPass": "./ui_image/pencil.png",
        "toggleName": "./ui_image/close_eye.png",
        "toggleId": "./ui_image/close_eye.png",
        "toggleEmail": "./ui_image/close_eye.png",
        "togglePass": "./ui_image/close_eye.png"
    };

    Object.keys(iconDefaults).forEach(id => {
        document.getElementById(id).setAttribute("src", iconDefaults[id]);
    });

    document.querySelectorAll(".check-icon").forEach(icon => icon.remove());
}

function saveRecord() {
    alert("記録が保存されました。");
    togglePopup('hide');
}

// 表示・非表示を切り替える関数
function toggleFieldVisibility(imgElement, fieldId, fieldType) {
    console.log("imgElement", imgElement);
    console.log("fieldId", fieldId);
    console.log("fieldType", fieldType);
    const field = document.getElementById(fieldId);
    const currentSrc = imgElement.getAttribute("src");
    const fieldData = field.dataset[fieldType];

    if (currentSrc === "./ui_image/close_eye.png") {
        imgElement.setAttribute("src", "./ui_image/open_eye.png");
        field.textContent = fieldData;
    } else {
        imgElement.setAttribute("src", "./ui_image/close_eye.png");
        field.textContent = "*".repeat(fieldData.length);
    }
}

// イベントリスナーの追加
document.getElementById("togglePass").addEventListener("click", () => toggleFieldVisibility(document.getElementById("togglePass"), "passwordField", "password"));
document.getElementById("toggleId").addEventListener("click", () => toggleFieldVisibility(document.getElementById("toggleId"), "idField", "id"));
document.getElementById("toggleName").addEventListener("click", () => toggleFieldVisibility(document.getElementById("toggleName"), "nameField", "name"));
document.getElementById("toggleEmail").addEventListener("click", () => toggleFieldVisibility(document.getElementById("toggleEmail"), "emailField", "email"));

// 編集モードの切り替え
// ユーザー名の編集処理
document.getElementById("editName").addEventListener('click', function() {
    toggleEdit(this, "nameField");
});
document.getElementById("editPass").addEventListener('click', function() {
    toggleEdit(this, "passwordField");
});

// 編集アイコンの切り替え処理（共通化）
function toggleEdit(imgElement, targetFieldId) {
    const field = document.getElementById(targetFieldId);
    const currentSrc = imgElement.getAttribute("src");

    if (currentSrc === "./ui_image/pencil.png") {
        
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

// テキストを元に戻す
function restoreText(inputElement, targetFieldId) {
    const originalValue = inputElement.value;
    if (originalValue !== undefined) {
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

// コピーアイコンの処理
document.querySelectorAll('.copyName, .copyId, .copyEmail, .copyPass').forEach(icon => {
    icon.addEventListener('click', function () {
        const fieldId = this.classList[0].replace('copy', '').toLowerCase() + 'Field';
        const fieldName = this.classList[0].replace('copy', '');
        const text = document.getElementById(fieldId).getAttribute('data-' + fieldId.replace('Field', ''));

        navigator.clipboard.writeText(text).then(() => {
            alert(`${fieldName}をクリップボードにコピーしました。`);
        }).catch(err => {
            console.error('コピーに失敗しました:', err);
        });
    });
});

// チェックボックスの処理
document.getElementById("switch").addEventListener("change", function() {
    this.form.submit();
});