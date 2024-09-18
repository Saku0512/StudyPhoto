const openPopupButton = $("#openPopup");
const closePopupButton = $("#closePopup");
const overlay = $("#overlay");
const popup = $("#popup");

if (openPopupButton.length && closePopupButton.length && overlay.length && popup.length) {
    openPopupButton.on("click", () => {
        overlay.show();
        popup.show();
    });

    closePopupButton.on("click", () => {
        overlay.hide();
        popup.hide();
    });

    overlay.on("click", () => {
        overlay.hide();
        popup.hide();
    });
} else {
    console.error("One or more elements not found");
}
