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
$ROOT     = $_ENV['MIAL_ROOTUSER'] ?? $_SERVER['MIAL_ROOTUSER'];

$mail = new PHPMailer(true);

// CSRFトークンの確認
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
        die('不正なリクエストです。');
    }
}

if (isset($_POST['name']) && isset($_POST['email']) && isset($_POST['subject']) && isset($_POST['content'])) {
    try {
        $mail->isSMTP();
        $mail->Host         = 'smtp.gmail.com';
        $mail->SMTPAuth     = true;
        $mail->Username     = $Username;
        $mail->Password     = $Password;
        $mail->SMTPSecure   = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port         = 587;

        $mail->setFrom($Username, $Username);
        $mail->addAddress($_POST['email']);
        $mail->addBCC($ROOT, 'サービス管理者');

        $mail->isHTML(true);
        $mail->Subject = $_POST['subject'];
        $mail->Body    = $_POST['content'];

        $mail->send();
    } catch (Exception $e) {
        echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
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
                    <a href="./home.php" class="cancel" type="button">Back</a>
                    <button class="buttn" type="submit">Submit</button>
                </div>
            </div>
        </form>
    </main>
</body>
</html>