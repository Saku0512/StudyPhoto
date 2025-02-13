document.addEventListener('DOMContentLoaded', function() {
    // ボタンのクリックイベントをJavaScriptで設定
    const signupButton = document.getElementById("signup");
    const loginButton = document.getElementById("user");
    const guardianButton = document.getElementById("guardian");

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