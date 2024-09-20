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
    <meta name="viewport" content="width=device-width , initial-scale=1.0" />
    <link rel="stylesheet" href="../css/main.css" />
    <title>お問い合わせ</title>
    <style>
    body {
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-family: Arial, sans-serif;
      background-color: #f7f7f7;
    }
    main {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: none;
    }
    .return {
      display: flex;
      justify-content: flex-start;
      width: 100%;
      padding: auto;
      margin: auto;
    }
    .return a {
      display: block;
      height: 50px;
      width: 50px;
    }
    .return a img {
      height: 100%;
      width: 100%;
    }
    .Form {
      width: 100%;
      margin: 20px;
    }
    .Form-Item {
      display: flex;
      flex-direction: column;
      margin-bottom: 20px;
    }
    .Form-Item-Label {
      display: inline;
      align-items: flex-start;
      font-size: 20px;
      margin-bottom: 20px;
      white-space: nowrap; /* 改行を防ぐ */
    }
    @media (max-width: 600px) { /* 600px以下のデバイス向けのスタイル */
      .Form-Item {
        align-items: flex-start; /* 小さいデバイスでも左揃え */
      }
      .Form-Item-Input, .Form-Item-Textarea {
        max-width: 80%;
      }
    }
    .Form-Item-Label-Required {
      background-color: #4870BD;
      color: white;
      padding: 2px 6px;  /* パディングを少し狭く調整 */
      border-radius: 4px;
      font-size: 30px;
      line-height: 1;
      display: inline;  /* inlineにして文字が横に並ぶように設定 */
      margin-right: 5px;
      text-shadow: none;
    }
    .Form-Item-Input,
    .Form-Item-Textarea {
      width: 80%;
      max-width: 80%;
      padding: 10px;
      font-size: 16px;
      margin-top: 10px;
      box-sizing: border-box;
    }
    .Form-Item-Textarea {
      min-height: 150px;
    }
    .save, .cancel {
      width: 48%;
      padding: 10px;
      font-size: 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .save {
      background-color: #4870BD;
      color: white;
    }
    .cancel {
      background-color: #f44336;
      color: white;
    }
    .save:hover, .cancel:hover {
      opacity: 0.8;
    }
    .err-msg-name, .err-msg-mail, .err-msg-content {
      color: red;
      margin-bottom: 10px;
      font-size: 14px;
    }
    </style>
  </head>
  <body>
    <main>
      <?php if($mode == 'input'){ ?>
        <!-- 入力画面 -->
        <?php
          if($errmessage){
            echo '<div style="color:red">';
            echo implode(separator: '<br>', array: $errmessage);
            echo '</div>';
          }
        ?>
        <div class="return">
          <a href="../home.html"><img src="../ui_image/return.png"></a>
        </div>
        <form method="post" action="./contact.php">
          <div class="Form">
            <div class="Form-Item">
              <div class="err-msg-name"></div>
              <div class="Form-Item-Label">
                <span class="Form-Item-Label-Required">必須</span>名前
              </div>
              <input type="text" name="fullname" id="name" class="Form-Item-Input" value="<?php echo $_SESSION['fullname']; ?>">
            </div>
            <div class="Form-Item">
              <div class="err-msg-mail"></div>
              <div class="Form-Item-Label">
                <span class="Form-Item-Label-Required">必須</span>メールアドレス
              </div>
              <input type="email" name="email" id="mail" class="Form-Item-Input" value="<?php echo $_SESSION['email']; ?>">
            </div>
            <div class="Form-Item">
              <div class="err-msg-content"></div>
              <div class="Form-Item-Label">
                <span class="Form-Item-Label-Required">必須</span>お問い合わせ内容
              </div>
              <textarea class="Form-Item-Textarea" name="message"  id="text"><?php echo $_SESSION['message']; ?></textarea>
            </div>
            <input type="submit" name="confirm" id="save" class="save" value="確認する">
            <input type="reset" id="cancel" class="cancel" value="リセット">
          </div>
        </form>
      <?php } else if($mode == 'confirm'){ ?>
        <!-- 確認画面 -->
        <form action="./contact.php" method="post">
          名前 <?php echo $_SESSION['fullname']; ?><br>
          Eメール <?php echo $_SESSION['email']; ?><br>
          お問い合わせ内容<br>
          <?php echo nl2br($_SESSION['message']); ?><br>
          <input type="submit" name="back" value="戻る" />
          <input type="submit" name="send" value="送信" />
        </form>
      <?php } else { ?>
        <!-- 送信完了 -->
        お問い合わせを受け付けました。<br>
      <?php } ?>
    </main>
  </body>
</html>