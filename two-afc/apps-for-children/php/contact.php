<?php
  session_start();
  $mode = 'input';
  $errmessage = array();
  $mymail = 'comonraven113@gmail.com';
  if(isset($_POST['back']) && $_POST['back']){
    // 何もしない
  } else if(isset($_POST['confirm']) && $_POST['confirm']){
    // 確認画面
    if(!$_POST['fullname']){
      $errmessage[] = 'お名前を入力してください';
    } else if(mb_strlen($_POST['fullname']) > 100){
      $errmessage[] = 'お名前は100文字以内にしてください';
    }
    $_SESSION['fullname'] = htmlspecialchars($_POST['fullname'], ENT_QUOTES);

    if(!$_POST['email']){
      $errmessage[] = 'メールアドレスを入力してください';
    } else if(mb_strlen($_POST['email']) > 200){
      $errmessage = 'メールアドレスは200文字以内にしてください';
    } else if(!filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)){
      $errmessage[] = 'メールアドレスが不正です';
    }
    $_SESSION['email'] = htmlspecialchars($_POST['email'], ENT_QUOTES);

    if(!$_POST['message']){
      $errmessage[] = 'お問い合わせ内容を入力してください';
    } else if(mb_strlen($_POST['message']) > 500){
      $errmessage[] = 'お問い合わせ内容は500文字以内にしてください';
    }
    $_SESSION['message' ] = htmlspecialchars($_POST['message'], ENT_QUOTES);

    if($errmessage){
      $mode = 'input';
    } else{
      $mode = 'confirm';
    }
  } else if(isset($_POST['send']) && $_POST['send']){
    //　送信ボタンを押したとき
    $massage = 
      "お問い合わせを受け付けました。\r\n"
      . "お名前: " . $_SESSION['fullname'] . "\r\n"
      . "email: " . $_SESSION['email'] . "\r\n"
      . "お問い合わせ内容:\r\n"
      . preg_replace("/\r\n|\n/", "\r\n", $_SESSION['message']);
    mail($_SESSION['email'], 'お問い合わせありがとうございます。', $massage);
    mail($mymail, 'スタディフォトからのお問い合わせ受付', $massage);
    $_SESSION = array();
    $mode = 'send';
  } else{
    $_SESSION['fullname'] = "";
    $_SESSION['email'] = "";
    $_SESSION['message'] = "";
  }
?>
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewpot" content="width=device-width , initial-scale=1.0" />
    <link rel="stylesheet" href="../css/main.css" />
<!--    <script src="../js/contact.js" defer></script> -->
    <script src="https://www.gstatic.com/firebasejs/ui/6.1.0/firebase-ui-auth__ja.js" defer></script>
    <link type="text/css" rel="stylesheet" href="https://www.gstatic.com/firebasejs/ui/6.1.0/firebase-ui-auth.css" />
    <!--<script type="module" src="js/logined.js" defer></script>
    <script src="/__/firebase/7.16.0/firebase-app.js"></script> 
    <script src="/__/firebase/7.16.0/firebase-auth.js"></script> 
    <script src="/__/firebase/init.js"></script> -->
    <title>お問い合わせ</title>
    <style>
      .return {
        position: absolute;
        top: 10px;
        left: 10px;
        display: flex;
        justify-content: flex-start;
        width: 100%;
      }
      .return button {
        font-size: 18px;
        padding: 10px 20px;
        margin: 5px;
        border-radius: 5px;
        border: none;
        background-color: #5bc8ac;
        color: white;
        cursor: pointer;
      }
      .return button:hover {
        background-color: #45a29e;
      }
    </style>
  </head>
  <body>
    <script src="/__/firebase/7.16.0/firebase-app.js"></script>
    <script src="/__/firebase/7.16.0/firebase-auth.js"></script>
    <script src="/__/firebase/init.js"></script>
    <main>
      <div class="return">
        <button type="button"><a href="../home.html">戻る</a></button>
      </div>
      <form method="post" action="">
        <div class="Form">
          <div class="Form-Item">
            <div class="err-msg-name"></div>
            <p class="Form-Item-Label"><span class="Form-Item-Label-Required">必須</span>氏名</p>
            <input type="text" id="name" class="Form-Item-Input" placeholder="例）山田太郎">
          </div>
          <div class="Form-Item">
            <div class="err-msg-tell"></div>
            <p class="Form-Item-Label"><span class="Form-Item-Label-Required">必須</span>電話番号</p>
            <input type="tel" id="tell" class="Form-Item-Input" placeholder="例）000-0000-0000">
          </div>
          <div class="Form-Item">
            <div class="err-msg-mail"></div>
            <p class="Form-Item-Label"><span class="Form-Item-Label-Required">必須</span>メールアドレス</p>
            <input type="email" id="mail" class="Form-Item-Input" placeholder="例）example@gmail.com">
          </div>
          <div class="Form-Item">
            <div class="err-msg-content"></div>
            <p class="Form-Item-Label isMsg"><span class="Form-Item-Label-Required">必須</span>お問い合わせ内容</p>
            <textarea class="Form-Item-Textarea" id="text"></textarea>
          </div>
          <input type="submit" id="save" class="save" value="確認する">
          <input type="reset" id="cancel" class="cancel" value="リセット">
        </div>
      </form>
      <div class="overlay" id="overlay" style="display: none;"></div>
      <div class="popup" id="popup" style="display: none;">
        <h2>内容を確認して送信しますか？</h2>
        <div id="confirmDetails">
          <p><strong>氏名:</strong> <span id="confirmName"></span> </p>
          <p><strong>電話番号:</strong> <span id="confirmTell"></span></p>
          <p><strong>メールアドレス:</strong> <span id="confirmMail"></span></p>
          <p><strong>お問い合わせ内容:</strong><br> <span id="confirmText"></span></p>
        </div>
        <button id="closePopup">キャンセル</button>
        <button id="confirmSend">送信</button>
      </div>
    </main>
  </body>
</html>