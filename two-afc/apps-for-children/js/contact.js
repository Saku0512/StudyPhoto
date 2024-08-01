//const company = document.getElementById('company');
//const names = document.getElementById('name');
//const tell = document.getElementById('tell');
//const mail = document.getElementById('mail');
//const text = document.getElementById('text');
//送信ボタンの要素を取得
const submit = document.querySelector('.Form-Btn');

save.addEventListener('click', 
  (e) => {
    //送信ボタンクリック時
    e.preventDefault();
    //会社名
    // 「会社名」入力欄の空欄チェック　フォームの要素を取得
    const company = document.querySelector('#company');
    // エラーメッセージを表示させる要素の取得
    const errMsgCom = document.querySelector('.err-msg-com');
    if(!company.value){
      //クラスを追加（エラーメッセージを表示する）
      errMsgCom.classList.add('form-invalid');
      //エラーメッセージのテキスト
      errMsgCom.textContent = '会社名が入力されていません';
      //クラスを追加（フォームの枠線を赤くする）
      company.classList.add('input-invalid');
    }else{
      errMsgCom.classList.remove('form-invalid');
      errMsgCom.textContent = '';
      company.classList.remove('input-invalid');
    }
    //名前
    const name = document.querySelector('#name');
    const errMsgName = document.querySelector('.err-msg-name');
    if(!company.value){
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

    if(!name.value || !tell.value || !company.value || !mail.value || !text.value){
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