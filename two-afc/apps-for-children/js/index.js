function showForm(formId) {
    document.getElementById("signupForm").style.display = "none";
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("guardianForm").style.display = "none";
    document.getElementById(formId).style.display = "flex";
}