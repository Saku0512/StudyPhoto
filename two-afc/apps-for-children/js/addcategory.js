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
    //console.log(subject);
    if(subject){
        //  カテゴリ取得
        const select =document.getElementById("category")
        const option = document.createElement("option");
        option.textContent=subject;
        select.appendChild(option);

        // 変更オプションにも追加
        const editSelect = document.getElementById("editOptionSelect");
        const editOption = document.createElement("option");
        editOption.textContent = subject;
        editSelect.appendChild(editOption);

        // 削除オプションにも追加
        const deleteSelect = document.getElementById("deleteOptionSelect");
        const deleteOption = document.createElement("option");
        deleteOption.textContent = subject;
        deleteSelect.appendChild(deleteOption);

        hidePopup();
    }else{
        alert("入力してください。");
    }
}

function editOption() {
    const select = document.getElementById("editOptionSelect");
    const categorySelect = document.getElementById("category");
    const subject = document.getElementById("editOptionName").value;

    // 選択されたオプションを取得
    const selectedIndex = select.selectedIndex;

    // デバッグ用
    //console.log(`Selected index: ${selectedIndex}, New subject: ${subject}`);

    if(selectedIndex > 0 && subject){
        // 選択されたオプションを変更
        const oldSubject = select.options[selectedIndex].textContent;
        select.options[selectedIndex].textContent = subject;
        
        // カテゴリのオプションも変更
        for(let i = 1; i < categorySelect.options.length; i++) {
            if(categorySelect.options[i].textContent === oldSubject) {
                categorySelect.options[i].textContent = subject;
                break;
            }
        }

        // 削除オプションも更新
        const deleteSelect = document.getElementById("deleteOptionSelect");
        for(let i = 1; i < deleteSelect.options.length; i++) {
            if(deleteSelect.options[i].textContent === oldSubject) {
                deleteSelect.options[i].textContent = subject;
                break;
            }
        }
        // 変更した教科名を editOptionSelect に反映
        const editSelect = document.getElementById("editOptionSelect");
        editSelect.options[selectedIndex].textContent = subject;

        hidePopup();
    } else {
        alert("教科を選択し、入力してください。");
    }
}

function deleteOption() {
    const select = document.getElementById("deleteOptionSelect");
    const categorySelect = document.getElementById("category");
    const editSelect = document.getElementById("editOptionSelect");
    const selectedIndex = select.selectedIndex;

    if(selectedIndex > 0) {
        const deleteSubject = select.options[selectedIndex].textContent;

        // 選択されたオプションを削除
        select.remove(selectedIndex);

        // カテゴリからも削除
        for(let i = 0; i < categorySelect.options.length; i++) {
            if(categorySelect.options[i].textContent === deleteSubject) {
                categorySelect.remove(i);
                break; // 一致するものを削除したらループを抜ける
            }
        }

        // 変更オプションからも削除
        for(let i = 0; i < editSelect.options.length; i++) {
            if(editSelect.options[i].textContent === deleteSubject) {
                editSelect.remove(i);
                break; // 一致するものを削除したらループを抜ける
            }
        }
        hidePopup();
    }else{
        alert("削除する教科を選択してください。");
    }
}

// 選択したオプションを保存する
document.getElementById("saveButton").addEventListener("click", function(event) {
    //event.preventDefault(); //ページ遷移を一旦止める

    const categorySelect = document.getElementById("category");
    const selectedOption = categorySelect.options[categorySelect.selectedIndex].text;

    if(selectedOption === "--教科を選択--") {
        event.preventDefault();
        alert("教科を選択してください。");
        return;
    }else {
        localStorage.setItem("selectedOption", selectedOption);
    }
});