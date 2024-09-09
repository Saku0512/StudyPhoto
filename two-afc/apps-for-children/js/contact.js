//送信ボタンの要素を取得
const save = document.querySelector('.save');
const cancel = document.querySelector('.cancel');

save.addEventListener('click', 
  (e) => {
    //送信ボタンクリック時
    e.preventDefault();
    //入力欄の確認
    //名前
    const name = document.querySelector('#name');
    const errMsgName = document.querySelector('.err-msg-name');
    if(!name.value){
      errMsgName.classList.add('form-invalid');
      errMsgName.textContent = '名前が入力されていません';
      name.classList.add('input-invalid');
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
      errMsgTell.textContent = '電話番号を入力してください';
      tell.classList.add('input-invalid');
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
      errMsgMail.textContent = 'メールアドレスを入力してください';
      mail.classList.add('input-invalid');
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
      errMsgText.textContent = 'お問い合わせ内容を入力してください';
      text.classList.add('input-invalid');
    }else{
      errMsgText.classList.remove('form-invalid');
      errMsgText.textContent = '';
      text.classList.remove('input-invalid');
    }

    if(!name.value || !tell.value || !mail.value || !text.value){
      window.alert('必須項目の入力が抜けています');
    }


  },false
);

cancel.addEventListener('click',
  (e) => {
    e.preventDefault();
    window.location.href = 'contact.html';
  },false
);