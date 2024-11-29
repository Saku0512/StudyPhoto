let isPopupVisible = false;

function showPopup() {
    document.getElementById("overlay").style.display = "block";
    document.getElementById("popup").classList.add("active");
    isPopupVisible = true;
    showSection('addSection'); // 最初に追加フォームを表示

    // フォームの入力をリセット
    document.getElementById("addOptionName").value = "";
    document.getElementById("editOptionName").value = "";
}

// overlayクリック時の動作を無効
window.onclick = function(event) {
    const overlay = document.getElementById("overlay");
    if (overlay) {
        overlay.addEventListener("click", function(event) {
            if (isPopupVisible) {
                event.stopPropagation(); // 何もしない
                return;
            } else {
                hidePopup();
            }
        });
    }
};

function hidePopup() {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("popup").classList.remove("active");
    document.querySelectorAll('.form-section').forEach(section => section.classList.remove("active"));
    resetButtonColor(); // ボタンの色をリセット
    isPopupVisible = false;
}

function showSection(sectionId) {
    document.querySelectorAll('.form-section').forEach(section => section.classList.remove("active"));
    document.getElementById(sectionId).classList.add("active");
    updateButtonColor(sectionId); // ボタンの色を更新

    // ポップアップのサイズを調整
    const popup = document.getElementById("popup");
    if (sectionId === 'addSection') {
        popup.style.height = '30vh';
    } else if (sectionId === 'editSection') {
        popup.style.height = '45vh';
    } else if (sectionId === 'deleteSection') {
        popup.style.height = '30vh';
    }
}

// ボタンの色をセクションに合わせて更新する関数
function updateButtonColor(activeSectionId) {
    const buttons = document.querySelectorAll('.tab button');
    buttons.forEach(button => {
        button.style.color = 'black';
    });
    if (activeSectionId === 'addSection') {
        buttons[0].style.color = 'blue';
    } else if (activeSectionId === 'editSection') {
        buttons[1].style.color = 'blue';
    } else if (activeSectionId === 'deleteSection') {
        buttons[2].style.color = 'blue';
    }
}

// ボタンの色をリセット
function resetButtonColor() {
    const buttons = document.querySelectorAll('.tab button');
    buttons.forEach(button => {
        button.style.color = 'black';
    });
}

function addOption() {
    const optionName = document.getElementById('addOptionName').value;

    if (!optionName) {
        alert("教科名を入力してください。");
        return;
    }

    fetch('../../php/category/add_category.php', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `category_name=${encodeURIComponent(optionName)}`
    })
    .then(response => {
        console.log('Response Status:', response.status); // ステータスコードを表示
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text(); // レスポンスをテキスト形式で表示
    })
    .then(text => {
        console.log('Raw Response:', text); // サーバーからのレスポンスを確認
        return JSON.parse(text); // 必要ならJSONに変換
    })
    .then(data => {
        if (data.status === "success") {
            alert("カテゴリーが追加されました。");
            hidePopup();
            loadCategories();
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error('Error adding category:', error));
}

function editOption() {
    const oldOptionName = document.getElementById('editOptionSelect').value;
    const newOptionName = document.getElementById('editOptionName').value;
    const username = document.getElementById('username').value;

    if (!oldOptionName || !newOptionName) {
        alert("変更する教科名を選択し、新しい教科名を入力してください。");
        return;
    }

    fetch('../../php/category/edit_category.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `old_category_name=${encodeURIComponent(oldOptionName)}&new_category_name=${encodeURIComponent(newOptionName)}&username=${encodeURIComponent(username)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            alert("カテゴリーが変更されました。");
            hidePopup();
            loadCategories(); // カテゴリーを再読み込み
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error('Error editing category:', error));
}

function deleteOption() {
    const optionToDelete = document.getElementById('deleteOptionSelect').value;
    const username = document.getElementById('username').value;

    if (!optionToDelete) {
        alert("削除する教科名を選択してください。");
        return;
    }

    fetch('../../php/category/delete_category.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `category_name=${encodeURIComponent(optionToDelete)}&username=${encodeURIComponent(username)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            alert("カテゴリーが削除されました。");
            hidePopup();
            loadCategories(); // カテゴリーを再読み込み
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error('Error deleting category:', error));
}

function loadCategories() {
    fetch('../../php/category/get_category.php', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        //console.log('Categories loaded:', data);
        const categorySelect = document.getElementById("category");
        const editcategorySelect = document.getElementById("editOptionSelect");
        const deletecategorySelect = document.getElementById("deleteOptionSelect");
        categorySelect.innerHTML = '<option value="0">--教科を選択--</option>';
        editcategorySelect.innerHTML = '<option value="0">--変更する教科を選択--</option>';
        deletecategorySelect.innerHTML = '<option value="0">--削除する教科を選択--</option>';
        // 選択するカテゴリーをデータベースと一致させる
        data.forEach(item => {
            const option = document.createElement("option");
            option.textContent = item.category_name;
            categorySelect.appendChild(option);
        });
        // 変更するカテゴリーをデータベースと一致させる
        data.forEach(item => {
            const option = document.createElement("option");
            option.textContent = item.category_name;
            editcategorySelect.appendChild(option);
        });
        // 削除するカテゴリーをデータベースと一致させる
        data.forEach(item => {
            const option = document.createElement("option");
            option.textContent = item.category_name;
            deletecategorySelect.appendChild(option);
        });
    })
    .catch(error => console.error('Error loading categories:', error));
}

// ページが読み込まれたときにカテゴリーを読み込む
window.onload = function() {
    loadCategories();
};
document.addEventListener('DOMContentLoaded', function() {
    loadCategories(); // ページが読み込まれたらカテゴリーを読み込む
});