<?php
session_start();
$mode = 'input';
$errmessage = array();
$mymail = 'comonraven113@gmail.com';

// CSRFトークンの生成
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// CSRFトークンの確認
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
        die('不正なリクエストです。');
    }
}

if (isset($_POST['back']) && $_POST['back']) {
    // 何もしない
} else if (isset($_POST['confirm']) && $_POST['confirm']) {
    // 確認画面
    $fullname = htmlspecialchars(trim($_POST['fullname'] ?? ''), ENT_QUOTES);
    $email = htmlspecialchars(trim($_POST['email'] ?? ''), ENT_QUOTES);
    $message = htmlspecialchars(trim($_POST['message'] ?? ''), ENT_QUOTES);
    
    if (!$fullname) {
        $errmessage[] = 'お名前を入力してください';
    } else if (mb_strlen($fullname) > 100) {
        $errmessage[] = 'お名前は100文字以内にしてください';
    }
    $_SESSION['fullname'] = $fullname;

    if (!$email) {
        $errmessage[] = 'メールアドレスを入力してください';
    } else if (mb_strlen($email) > 200) {
        $errmessage[] = 'メールアドレスは200文字以内にしてください';
    } else if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errmessage[] = 'メールアドレスが不正です';
    }
    $_SESSION['email'] = $email;

    if (!$message) {
        $errmessage[] = 'お問い合わせ内容を入力してください';
    } else if (mb_strlen($message) > 500) {
        $errmessage[] = 'お問い合わせ内容は500文字以内にしてください';
    }
    $_SESSION['message'] = $message;

    if ($errmessage) {
        $mode = 'input';
    } else {
        $mode = 'confirm';
    }
} else if (isset($_POST['send']) && $_POST['send']) {
    // 送信ボタンを押したとき
    $massage = 
      "お問い合わせを受け付けました。\r\n"
      . "お名前: " . $_SESSION['fullname'] . "\r\n"
      . "email: " . $_SESSION['email'] . "\r\n"
      . "お問い合わせ内容:\r\n"
      . $_SESSION['message'];

    // メール送信
    require 'vendor/autoload.php';

    $mail = new PHPMailer(true);

    try {
        // SMTPの設定
        $mail->isSMTP();
        $mail->Host       = 'smtp.example.com'; // 自分のSMTPサーバーを設定
        $mail->SMTPAuth   = true;
        $mail->Username   = 'your_email@example.com'; // SMTPユーザー名
        $mail->Password   = 'your_password'; // SMTPパスワード
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587; // ポート番号

        // 送信先の設定
        $mail->setFrom($mymail, 'スタディフォト');
        $mail->addAddress($mymail);
        $mail->addAddress($_SESSION['email']); // ユーザーにも送信

        // メール内容
        $mail->isHTML(true);
        $mail->Subject = 'スタディフォトからのお問い合わせ受付';
        $mail->Body    = nl2br(htmlspecialchars($massage));

        // メール送信
        $mail->send();
        $_SESSION = array(); // セッションをリセット
        $mode = 'send';
    } catch (Exception $e) {
        $errmessage[] = "メール送信に失敗しました。再度お試しください。 {$mail->ErrorInfo}";
        $mode = 'input';
    }
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
</head>
<body>
    <div class="loading active">
        <div class="loading__icon"></div>
        <p class="loading__text">loading</p>
    </div>
    <main>
        <?php if ($mode == 'input') { ?>
            <!-- 入力画面 -->
            <?php if ($errmessage): ?>
                <div style="color:red"><?php echo implode('<br>', $errmessage); ?></div>
            <?php endif; ?>
            <form method="post" action="./contact.php">
                <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
                <div class="Form">
                    <div class="Form-Item">
                        <div class="Form-Item-Label">
                            <span class="Form-Item-Label-Required">必須</span>名前
                        </div>
                        <input type="text" name="fullname" id="name" class="Form-Item-Input" value="<?php echo $_SESSION['fullname'] ?? ''; ?>" required>
                    </div>
                    <div class="Form-Item">
                        <div class="Form-Item-Label">
                            <span class="Form-Item-Label-Required">必須</span>メールアドレス
                        </div>
                        <input type="email" name="email" id="mail" class="Form-Item-Input" value="<?php echo $_SESSION['email'] ?? ''; ?>" required>
                    </div>
                    <div class="Form-Item">
                        <div class="Form-Item-Label">
                            <span class="Form-Item-Label-Required">必須</span>お問い合わせ内容
                        </div>
                        <textarea class="Form-Item-Textarea" name="message" id="text" required><?php echo $_SESSION['message'] ?? ''; ?></textarea>
                    </div>
                    <input type="reset" class="cancel" value="リセット">
                    <input type="submit" name="confirm" class="save" value="確認する">
                </div>
            </form>
        <?php } else if ($mode == 'confirm') { ?>
            <!-- 確認画面 -->
            <form action="./contact.php" method="post">
                <div class="Form">
                    <div class="Form-Item">
                        <div class="Form-Item-Label">名前</div>
                        <div class="Form-Item-Input"><?php echo $_SESSION['fullname']; ?></div>
                    </div>
                    <div class="Form-Item">
                        <div class="Form-Item-Label">メールアドレス</div>
                        <div class="Form-Item-Input"><?php echo $_SESSION['email']; ?></div>
                    </div>
                    <div class="Form-Item">
                        <div class="Form-Item-Label">お問い合わせ内容</div>
                        <div class="Form-Item-Textarea"><?php echo nl2br(htmlspecialchars($_SESSION['message'])); ?></div>
                    </div>
                    <input type="submit" name="back" class="cancel" value="戻る">
                    <input type="submit" name="send" class="save" value="送信する">
                </div>
            </form>
        <?php } else if ($mode == 'send') { ?>
            <!-- 送信完了画面 -->
            <div class="Form">
                <div>お問い合わせが送信されました。ありがとうございました。</div>
                <div><a href="../home.html">ホームに戻る</a></div>
            </div>
        <?php } ?>
    </main>
</body>
</html>