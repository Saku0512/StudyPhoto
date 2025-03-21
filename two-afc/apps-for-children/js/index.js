// ポップアップ表示
const loginPopup = document.getElementById('loginPopup');
const signupPopup = document.getElementById('signupPopup');
const resetPassPopup = document.getElementById('resetPassPopup');
const guardianPopup = document.getElementById('guardianPopup');
const loginForm = document.querySelector('.loginForm');
const guardianForm = document.querySelector('.guardianForm');
const overlay = document.getElementById('overlay');
const loginLink = document.querySelector('.loginPopup .message a');
const resetPassLink = document.querySelector('.loginPopup a.forgotPass');
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
    signupPopup.classList.add('hide');
    resetPassPopup.style.display = 'none';
    resetPassPopup.classList.add('hide');
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

resetPassLink.addEventListener('click', (e) => {
    e.preventDefault();
    togglePopup(resetPassPopup, loginPopup);
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
    // ユーザーエージェントでPCかどうかを判定
function isPC() {
    return !/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

if (isPC()) {
    if (localStorage.getItem('isPC') !== 'true') {
        var userConfirmed = confirm('このアプリはスマートフォンでの利用を推奨しています。続行しますか？');
        if (!userConfirmed) {
            window.location.href = "https://www.google.com";
        }
    }
    
    localStorage.setItem('isPC', true);
}
