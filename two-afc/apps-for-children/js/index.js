document.addEventListener('DOMContentLoaded', function() {
    // ボタンのクリックイベントをJavaScriptで設定
    const signupButton = document.querySelector('.btn-gradient:nth-of-type(1)');
    const loginButton = document.querySelector('.btn-gradient:nth-of-type(2)');
    const guardianButton = document.querySelector('.btn-gradient:nth-of-type(3)');

    signupButton.addEventListener('click', function() {
        showForm('signupForm');
    });

    loginButton.addEventListener('click', function() {
        showForm('loginForm');
    });

    guardianButton.addEventListener('click', function() {
        showForm('guardianForm');
    });
});

function showForm(formId) {
    document.getElementById("signupForm").style.display = "none";
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("guardianForm").style.display = "none";
    document.getElementById(formId).style.display = "flex";
}