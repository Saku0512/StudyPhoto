<?php
session_start();
$mode = 'input';
$errmessage = array();
$mymail = 'comonraven113@gmail.com'; // 送信先メールアドレス

// CSRFトークンの生成
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// PHPMailerの読み込み
require 'vendor/autoload.php'; // Composerのオートローダーを使用

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

if (isset($_POST['back']) && $_POST['back']) {
    // 何もしない
} else if (isset($_POST['confirm']) && $_POST['confirm']) {
    // 確認画面
    $fullname = filter_input(INPUT_POST, 'fullname', FILTER_SANITIZE_STRING);
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $message = filter_input(INPUT_POST, 'message', FILTER_SANITIZE_STRING);
    
    if (!$fullname) {
        $errmessage[] = 'お名前を入力してください';
    } else if (mb_strlen($fullname) > 100) {
        $errmessage[] = 'お名前は100文字以内にしてください';
    }
    $_SESSION['fullname'] = htmlspecialchars($fullname, ENT_QUOTES);

    if (!$email) {
        $errmessage[] = 'メールアドレスを入力してください';
    } else if (mb_strlen($email) > 200) {
        $errmessage[] = 'メールアドレスは200文字以内にしてください';
    } else if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errmessage[] = 'メールアドレスが不正です';
    }
    $_SESSION['email'] = htmlspecialchars($email, ENT_QUOTES);

    if (!$message) {
        $errmessage[] = 'お問い合わせ内容を入力してください';
    } else if (mb_strlen($message) > 500) {
        $errmessage[] = 'お問い合わせ内容は500文字以内にしてください';
    }
    $_SESSION['message'] = htmlspecialchars($message, ENT_QUOTES);

    if ($errmessage) {
        $mode = 'input';
    } else {
        $mode = 'confirm';
    }
} else if (isset($_POST['send']) && $_POST['send']) {
    // 送信ボタンを押したとき
    $body = 
      "お問い合わせを受け付けました。\r\n"
      . "お名前: " . $_SESSION['fullname'] . "\r\n"
      . "email: " . $_SESSION['email'] . "\r\n"
      . "お問い合わせ内容:\r\n"
      . preg_replace("/\r\n|\n/", "\r\n", $_SESSION['message']);

    // PHPMailerでメール送信
    $mail = new PHPMailer(true);
    try {
        // SMTP設定
        $mail->isSMTP();
        $mail->Host = 'smtp.example.com'; // SMTPサーバー
        $mail->SMTPAuth = true;
        $mail->Username = 'your-email@example.com'; // SMTPユーザー名
        $mail->Password = 'your-email-password'; // SMTPパスワード
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // TLS暗号化
        $mail->Port = 587; // ポート番号

        // 送信先設定
        $mail->setFrom('your-email@example.com', 'スタディフォト');
        $mail->addAddress($mymail); // 受信者
        $mail->addReplyTo($_SESSION['email'], $_SESSION['fullname']); // 返信先

        // メール内容
        $mail->isHTML(false);
        $mail->Subject = 'スタディフォトからのお問い合わせ受付';
        $mail->Body = $body;

        // メール送信
        $mail->send();

        // ユーザーにも確認メールを送信
        $mail->clearAddresses(); // アドレスをクリア
        $mail->addAddress($_SESSION['email']); // 返信先を追加
        $mail->Subject = 'お問い合わせありがとうございます。';
        $mail->Body = $body;

        $mail->send();

        // 送信成功
    } catch (Exception $e) {
        $errmessage[] = "メール送信に失敗しました。再度お試しください。エラー: {$mail->ErrorInfo}";
    }
    
    $_SESSION = array();
    $mode = 'send';
} else {
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
    <link rel="stylesheet" href="../css/scss/load.css" />
    <script src="../js/load.js" defer></script>
    <title>お問い合わせ</title>
    <style>
        /* CSSスタイルはそのまま */
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
        .error {
            color: red;
            font-size: 14px;
        }
    </style>
</head>
<body>
  <main>
    <h1>お問い合わせ</h1>
      <?php if ($mode == 'input'): ?>
        <form method="post" class="Form">
            <div class="Form-Item">
                <label for="fullname" class="Form-Item-Label">お名前 <span class="Form-Item-Label-Required">必須</span></label>
                <input type="text" id="fullname" name="fullname" class="Form-Item-Input" value="<?php echo isset($_SESSION['fullname']) ? htmlspecialchars($_SESSION['fullname'], ENT_QUOTES) : ''; ?>" required />
                <?php if (isset($errmessage) && in_array('お名前を入力してください', $errmessage)): ?>
                    <div class="error">お名前を入力してください。</div>
                <?php endif; ?>
            </div>
            <div class="Form-Item">
                <label for="email" class="Form-Item-Label">メールアドレス <span class="Form-Item-Label-Required">必須</span></label>
                <input type="email" id="email" name="email" class="Form-Item-Input" value="<?php echo isset($_SESSION['email']) ? htmlspecialchars($_SESSION['email'], ENT_QUOTES) : ''; ?>" required />
                <?php if (isset($errmessage) && in_array('メールアドレスを入力してください', $errmessage)): ?>
                    <div class="error">メールアドレスを入力してください。</div>
                <?php endif; ?>
            </div>
            <div class="Form-Item">
                <label for="message" class="Form-Item-Label">お問い合わせ内容 <span class="Form-Item-Label-Required">必須</span></label>
                <textarea id="message" name="message" class="Form-Item-Textarea" required><?php echo isset($_SESSION['message']) ? htmlspecialchars($_SESSION['message'], ENT_QUOTES) : ''; ?></textarea>
                <?php if (isset($errmessage) && in_array('お問い合わせ内容を入力してください', $errmessage)): ?>
                    <div class="error">お問い合わせ内容を入力してください。</div>
                <?php endif; ?>
            </div>
            <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>" />
            <button type="submit" name="confirm" class="save">確認</button>
        </form>
        <?php elseif ($mode == 'confirm'): ?>
        <div class="Form">
            <h2>確認画面</h2>
            <p><strong>お名前:</strong> <?php echo $_SESSION['fullname']; ?></p>
            <p><strong>メールアドレス:</strong> <?php echo $_SESSION['email']; ?></p>
            <p><strong>お問い合わせ内容:</strong><br><?php echo nl2br(htmlspecialchars($_SESSION['message'], ENT_QUOTES)); ?></p>
            <form method="post">
                <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>" />
                <button type="submit" name="send" class="save">送信</button>
                <button type="submit" name="back" class="cancel">戻る</button>
            </form>
        </div>
        <?php elseif ($mode == 'send'): ?>
        <div class="Form">
            <h2>送信完了</h2>
            <p>お問い合わせありがとうございました。ご連絡をお待ちください。</p>
        </div>
    <?php endif; ?>
  </main>
</body>
</html>
