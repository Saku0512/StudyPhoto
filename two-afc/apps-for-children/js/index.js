// ポップアップ表示
const loginPopup = document.getElementById('loginPopup');
const signupPopup = document.getElementById('signupPopup');
const guardianPopup = document.getElementById('guardianPopup');
const loginForm = document.querySelector('.loginForm');
const guardianForm = document.querySelector('.guardianForm');
const overlay = document.getElementById('overlay');
const loginLink = document.querySelector('.loginPopup .message a');
const signupLink = document.querySelector('.signupPopup .message a');
const closeBtns = document.querySelectorAll('.close-btn');

function showPopup(popup) {
    closePopup();
    overlay.style.display = 'block';
    popup.style.display = 'block';
    setTimeout(() => {
        popup.classList.remove("hide"); // フェードイン
    }, 200);
}

function togglePopup(popupToShow, popupToHide) {
    popupToHide.classList.add('hide');
    setTimeout(() => {
        popupToHide.style.display = 'none';
        popupToShow.style.display = 'block';
        setTimeout(() => {
            popupToShow.classList.remove('hide');
        }, 10);
    }, 200);
}

function closePopup() {
    overlay.style.display = 'none';
    loginPopup.style.display = 'none';
    loginPopup.classList.add('hide');
    guardianPopup.style.display = 'none';
    guardianPopup.classList.add('hide');
    signupPopup.style.display = 'none';
}

loginForm.addEventListener('click', () => {
    showPopup(loginPopup);
});

loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    togglePopup(signupPopup, loginPopup);
});

signupLink.addEventListener('click', (e) => {
    e.preventDefault();
    togglePopup(loginPopup, signupPopup);
});

guardianForm.addEventListener('click', () => {
    showPopup(guardianPopup);
});

closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        closePopup();
    });
});
overlay.addEventListener('click', closePopup);

// PCで開いたときに確認ダイアログ
document.addEventListener("DOMContentLoaded", function () {
    // ユーザーエージェントでPCかどうかを判定
    function isPC() {
        return !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    }

    if (isPC()) {
        const userConfirmed = confirm("このサイトは携帯やiPad向けです。本当にアクセスしますか？");

        if (!userConfirmed) {
            window.location.href = "https://www.google.com";
        }
    }
});