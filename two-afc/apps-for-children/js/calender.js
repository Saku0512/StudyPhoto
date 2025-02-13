let isPopupVisible = false;

// カレンダーの表示ボタン
document.querySelector(".year-mouth-daybutton").addEventListener("click", showPopup11);
// カレンダーの非表示ボタン
document.querySelector(".overlay").addEventListener("click", hidePopup);

// カレンダーの表示
function showPopup11() {
    document.getElementById("overlay").style.display = "block";
    document.getElementById("popup").classList.add("active");
    isPopupVasible = true;
}
// カレンダーの非表示
function hidePopup() {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("popup").classList.remove("active");
    isPopupVisible = false;
}