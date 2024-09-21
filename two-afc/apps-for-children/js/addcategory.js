const subject = document.querySelector("subject");

function showPopup() {
    document.getElementById("overlay").style.display = "block";
    document.getElementById("popup").style.display = "block";
}

function hidePopup() {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("popup").style.display = "none";
}

function addOption() {
    const subject = document.getElementById("optionName").value;
    console.log(subject);
    if(subject){
        //  カテゴリ取得
        const select =document.getElementById("category")
        // optionタグを作成する
        const option = document.createElement("option");
        option.textContent=subject;
        //select.insertBefore(option,select.lastElementChild);
        select.appendChild(option);
        hidePopup();
    }else{
        alert("入力してください。");
    }
   }