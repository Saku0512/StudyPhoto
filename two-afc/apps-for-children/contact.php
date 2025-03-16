<?php
session_start();
$nonce = base64_encode(random_bytes(16));
header("Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-" . $nonce . "'; style-src 'self' 'nonce-" . $nonce . "';");

$mode = 'input';
$errmessage = array();

// CSRFトークンの生成
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

use Dotenv\Dotenv;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require './vendor/phpmailer/phpmailer/src/Exception.php';
require './vendor/phpmailer/phpmailer/src/PHPMailer.php';
require './vendor/phpmailer/phpmailer/src/SMTP.php';
require './vendor/autoload.php';

$dotenv = Dotenv::createImmutable('./');
$dotenv->load();

$Username = $_ENV['MAIL_USERNAME'] ?? $_SERVER['MAIL_USERNAME'];
$Password = $_ENV['MIAL_APP_PASSWORD'] ?? $_SERVER['MIAL_APP_PASSWORD'];

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
        $mail->Host       = 'smtp.gmail.com'; // 自分のSMTPサーバーを設定
        $mail->SMTPAuth   = true;
        $mail->Username   = $Username; // SMTPユーザー名
        $mail->Password   = $Password; // SMTPパスワード
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
        $errmessage[] = "メール送信に失敗しました。再度お試しくください。 {$mail->ErrorInfo}";
        $mode = 'input';
    }
}
?>

<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width , initial-scale=1.0" />
    <link rel="stylesheet" href="./css/contact.css" />
    <link rel="stylesheet" href="./css/scss/load.css" />
    <script src="./js/load.js" nonce="<?php htmlspecialchars($nonce, ENT_QUOTES, 'UTF-8') ?>" defer></script>
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
                <p class="title">問い合わせフォーム</p>
                <div class="Form">
                    <input class="FormName" type="text" name="name" placeholder="Name" required />
                    <input class="FormEmail" type="email" name="email" placeholder="Eamil" required />
                    <input class="FormSubject" type="text" name="subject" placeholder="Subject" required />
                    <textarea class="FormContent" type="text" name="content" placeholder="Message" required></textarea>
                    <div class="FormButtons">
                        <button class="cancel" type="button">Back</button>
                        <button class="submit" type="submit">Confirm</button>
                    </div>
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
                <div><a href="../home.php">ホームに戻る</a></div>
            </div>
        <?php } ?>
    </main>
</body>
</html>