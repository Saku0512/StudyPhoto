//テキストを20文字ごとに改行する関数
function formatText(text, lineLength) {
  let formatText = '';
  for (let i = 0; i < text.length; i += lineLength) {
    formatText += text.slice(i, i + lineLength) + '<br>';
  }
  return formatText;
}

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
    const errMsgTell = document.querySelector('.err-msg-tell');
    const tellPattern = /^\d{3}-\d{3,4}-\d{4}$/;
    if(!tell.value){
      errMsgTell.classList.add('form-invalid');
      tell.classList.add('input-invalid');
      isValid = false;
    }else if (!tellPattern.test(tell.value)){
      errMsgTell.classList.add('form-invalid');
      tell.classList.add('input-invalid');
      errMsgTell.textContent = '電話番号の形式が正しくありません';
      isValid = false;
    } else{
      errMsgTell.classList.remove('form-invalid');
      errMsgTell.textContent = '';
      tell.classList.remove('input-invalid');
    }
    //メール
    const mail = document.querySelector('#mail');
    const errMsgMail = document.querySelector('.err-msg-mail');
    const mailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!mail.value){
      errMsgMail.classList.add('form-invalid');
      mail.classList.add('input-invalid');
      isValid = false;
    }else if (!mailPattern.test(mail.value)) {
      errMsgMail.classList.add('form-invalid');
      mail.classList.add('input-invalid');
      errMsgMail.textContent = 'メールアドレスの形式が正しくありません';
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
      confirmText.innerHTML = formatText(text.value, 30); //30文字ごとに改行
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
confirmSend.addEventListener('click', (e) => {
  e.preventDefault();

  // フォームのデータを収集
  const data = {
    name: document.querySelector('#name').value,
    tell: document.querySelector('#tell').value,
    mail: document.querySelector('#mail').value,
    text: document.querySelector('#text').value
  };

  /* Firebase Functions への POST リクエスト
  fetch('https://us-central1-apps-for-children-b2c4a.cloudfunctions.net/sendMail', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    mode: 'cors', // CORSを明示的に指定
    body: JSON.stringify(data)
  })
  .then(response => {
    if (response.ok) {
      popup.style.display = 'none';
      overlay.style.display = 'none';
      window.alert('送信しました');
      window.location.href = 'contact.html';
    } else {
      console.error('Failed to send email:', response.status, response.statusText);
      window.alert('送信に失敗しました');
    }
  })
  .catch(error => {
    console.error('Error occurred during fetch:', error);
    window.alert('エラーが発生しました');
  }); */
});
