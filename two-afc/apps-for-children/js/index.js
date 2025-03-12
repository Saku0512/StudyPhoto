// ポップアップ表示
function showPopup(FormName) {
    closePopup();
    console.log(FormName);
    document.getElementById('overlay').style.display = 'block';
    document.getElementById(FormName).style.display = 'block';
}
function closePopup() {
    document.getElementById('loginPopup').style.display = 'none';
    document.getElementById('guardianForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'none';
}
document.querySelector('.loginForm').addEventListener('click', () => {
    showPopup('loginPopup');
});
document.querySelector('.guardianForm').addEventListener('click', () => {
    showPopup('guardianForm');
});