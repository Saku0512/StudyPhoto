let isPopupVisible = false;

function showPopup() {
    document.getElementById("overlay").style.display = "block";
    document.getElementById("popup").classList.add("active");
    isPopupVasible = true;
    showSection('addSection'); // 最初に追加フォームを表示
}

// overlayクリック時にの動作を無効
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
    console.log(subject);
    if(subject){
        //  カテゴリ取得
        const select =document.getElementById("category")
        // optionタグを作成する
        const option = document.createElement("option");
        option.textContent=subject;
        select.appendChild(option);
        hidePopup();
    }else{
        alert("入力してください。");
    }
}