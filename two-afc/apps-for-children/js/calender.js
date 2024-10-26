let isPopupVisible = false;

function showPopup11() {
    document.getElementById("overlay").style.display = "block";
    document.getElementById("popup").classList.add("active");
    isPopupVasible = true;
    showSection('addSection'); // 最初に追加フォームを表示

    // フォームの入力をリセット
    document.getElementById("addOptionName").value = "";
    document.getElementById("editOptionName").value = "";
}
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
