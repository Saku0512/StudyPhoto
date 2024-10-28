let isPopupVisible = false;

function showPopup() {
    document.getElementById("overlay").style.display = "block";
    document.getElementById("popup").classList.add("active");
    isPopupVasible = true;
    showSection('addSection'); // 最初に追加フォームを表示

    // フォームの入力をリセット
    document.getElementById("addOptionName").value = "";
    document.getElementById("editOptionName").value = "";
}

// overlayクリック時にの動作を無効
window.onclick = function(event) {
    const overlay = document.getElementById("overlay");
    if(overlay){
        overlay.addEventListener("click", function(event){
            if(isPopupVisible) {
                event.stopPropagation(); // 何もしない
                return;
            }else{
                hidePopup();
            }
        });
    }
};
document.getElementById("overlay").addEventListener("click", function(event){
    if(isPopupVisible) {
        event.stopPropagation(); // 何もしない
        return;
    }else{
        hidePopup();
    }
});

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
    if(sectionId === 'addSection'){
        popup.style.height = '30vh';
    }else if(sectionId === 'editSection'){
        popup.style.height = '45vh';
    }else if(sectionId === 'deleteSection'){
        popup.style.height = '30vh';
    }
}

// デフォルトで追加フォームを表示
window.onload = function() {
    document.getElementById("addSection").classList.add("active");
    updateButtonColor('addSection'); // ボタンの色を更新
}

// ボタンの色をセクションに合わせて更新する関数
function updateButtonColor(activeSectionId){
    const buttons = document.querySelectorAll('.tab button'); // 修正
    buttons.forEach(button => {
        // 全てのボタンの色をリセット
        button.style.color = 'black';
    });
    // アクティブセクションに応じて対応するボタンの色を青にする
    if(activeSectionId === 'addSection'){
        buttons[0].style.color = 'blue';
    }else if(activeSectionId === 'editSection'){
        buttons[1].style.color = 'blue';
    }else if(activeSectionId === 'deleteSection'){
        buttons[2].style.color = 'blue';
    }
}

// ボタンの色をリセット
function resetButtonColor(){
    const buttons = document.querySelectorAll('.tab button');
    buttons.forEach(button => {
        button.style.color = 'black';
    });
}
function addOption() {
    const subject = document.getElementById("addOptionName").value;

    if (subject) {
        fetch('../../php/category/add_category.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `category_name=${encodeURIComponent(subject)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                loadCategories(); // カテゴリーを再読み込み
                hidePopup(); // ポップアップを隠す
            } else {
                alert(data.message);
            }
        })
        .catch(error => console.error('Error adding category:', error));
    } else {
        alert("入力してください。");
    }
}

function editOption(categoryId) {
    const newCategoryName = prompt("新しいカテゴリー名を入力してください:");

    if (newCategoryName) {
        fetch('edit_category.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `category_id=${categoryId}&new_category_name=${encodeURIComponent(newCategoryName)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                loadCategories(); // カテゴリーを再読み込み
            } else {
                alert(data.message);
            }
        })
        .catch(error => console.error('Error editing category:', error));
    }
}

function deleteOption(categoryId) {
    if (confirm("本当にこのカテゴリーを削除しますか？")) {
        fetch('delete_category.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `category_id=${categoryId}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                loadCategories(); // カテゴリーを再読み込み
            } else {
                alert(data.message);
            }
        })
        .catch(error => console.error('Error deleting category:', error));
    }
}

function loadCategories() {
    fetch('get_categories.php')
        .then(response => response.json())
        .then(data => {
            const categorySelect = document.getElementById("category");
            categorySelect.innerHTML = '<option name="0">--教科を選択--</option>';
            data.forEach(item => {
                const option = document.createElement("option");
                option.textContent = item.category_name;
                categorySelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error loading categories:', error));
}

// ページが読み込まれたときにカテゴリーを読み込む
window.onload = function() {
    loadCategories();
};