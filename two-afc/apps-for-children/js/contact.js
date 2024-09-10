//ポップアップ関連の要素を取得
const overlay = document.getElementById('overlay');
const popup = document.getElementById('popup');
const confirmSend = document.getElementById('confirmSend');
const closePopup = document.getElementById('closePopup');

//送信ボタンの要素を取得
const save = document.querySelector('.save');
const cancel = document.querySelector('.cancel');

save.addEventListener('click', 
  (e) => {
    //確認ボタンクリック時
    e.preventDefault();

    //入力欄の確認
    let isValid = true;

    //名前
    const name = document.querySelector('#name');
    const errMsgName = document.querySelector('.err-msg-name');
    if(!name.value){
      errMsgName.classList.add('form-invalid');
      name.classList.add('input-invalid');
      isValid = false;
    }else{
      errMsgName.classList.remove('form-invalid');
      errMsgName.textContent = '';
      name.classList.remove('input-invalid');
    }
    //電話
    const tell = document.querySelector('#tell');
    const errMsgTell = document.querySelector('.err-msg-tel');
    if(!tell.value){
      errMsgTell.classList.add('form-invalid');
      tell.classList.add('input-invalid');
      isValid = false;
    }else{
      errMsgTell.classList.remove('form-invalid');
      errMsgTell.textContent = '';
      tell.classList.remove('input-invalid');
    }
    //メール
    const mail = document.querySelector('#mail');
    const errMsgMail = document.querySelector('.err-msg-mail');
    if(!mail.value){
      errMsgMail.classList.add('form-invalid');
      mail.classList.add('input-invalid');
      isValid = false;
    }else{
      errMsgMail.classList.remove('form-invalid');
      errMsgMail.textContent = '';
      mail.classList.remove('input-invalid');
    }
    //お問い合わせ内容
    const text = document.querySelector('#text');
    const errMsgText = document.querySelector('.err-msg-content');
    if(!text.value){
      errMsgText.classList.add('form-invalid');
      text.classList.add('input-invalid');
      isValid = false;
    }else{
      errMsgText.classList.remove('form-invalid');
      errMsgText.textContent = '';
      text.classList.remove('input-invalid');
    }

    if(!name.value || !tell.value || !mail.value || !text.value){
      window.alert('必須項目の入力が抜けています');
    }
    if(isValid === true){
      //入力内容をポップアップに表示
      confirmName.textContent = name.value;
      confirmTell.textContent = tell.value;
      confirmMail.textContent = mail.value;
      confirmText.textContent = text.value;
      //ポップアップを表示
      overlay.style.display = 'block';
      popup.style.display = 'block';
    }
  },false
);
//リセットボタンを押したときの処置
cancel.addEventListener('click',
  (e) => {
    e.preventDefault();
    window.location.href = 'contact.html';
  },false
);

//ポップアップの「送信する」ボタンを押したときの処理
confirmSend.addEventListener('click',function(){
  popup.style.display = 'none';
  overlay.style.display = 'none';
  //フォーム送信の処理を記述
  window.alert('送信しました');
  // 例：document.querySelector('form').submit();
  window.location.href = 'contact.html';
});
//ポップアップの「キャンセル」ボタンを押したときの処理
closePopup.addEventListener('click',function(){
  popup.style.display = 'none';
  overlay.style.display = 'none';
});