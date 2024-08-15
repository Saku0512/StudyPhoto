const openPopupButton = document.getElementById("openPopup");
const closePopupButton = document.getElementById("closePopup");
const overlay = document.getElementById("overlay");
const popup = document.getElementById("popup");

if (openPopupButton && closePopupButton && overlay && popup) {
    openPopupButton.addEventListener("click", () => {
        overlay.style.display = "block";
        popup.style.display = "block";
    });

    closePopupButton.addEventListener("click", () => {
        overlay.style.display = "none";
        popup.style.display = "none";
    });

    overlay.addEventListener("click", () => {
        overlay.style.display = "none";
        popup.style.display = "none";
    });
} else {
    console.error("One or more elements not found");
}
