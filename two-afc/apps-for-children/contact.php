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
$Password = $_ENV['MAIL_APP_PASSWORD'] ?? $_SERVER['MAIL_APP_PASSWORD'];
$ROOT     = $_ENV['MAIL_ROOTUSER'] ?? $_SERVER['MAIL_ROOTUSER'];

$mail = new PHPMailer(true);

// CSRFトークンの確認
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
        die('不正なリクエストです。');
    }
}

if (isset($_POST['name']) && isset($_POST['email']) && isset($_POST['subject']) && isset($_POST['content'])) {
    try {
        // 1通目（管理者宛）
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = $Username;
        $mail->Password   = $Password;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;
    
        $mail->setFrom($Username, 'StudyPhoto');
        if (!empty($_POST['email']) && filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
            $mail->addReplyTo($_POST['email']);
        }
        $mail->addAddress($Username, '管理者');
    
        $mail->isHTML(true);
        $mail->CharSet = 'UTF-8';
        $mail->Encoding = 'base64';
    
        // 本文チェック
        if (empty($_POST['content'])) {
            throw new Exception('メール本文が空です。');
        }
    
        $mail->Subject = !empty($_POST['subject']) ? $_POST['subject'] : '件名なし';
        $mail->Body = htmlspecialchars($_POST['content'], ENT_QUOTES, 'UTF-8');
        // 送信
        $mail->send();
        $mail->smtpClose();
        
        // 2通目（ユーザー宛）
        $mail2 = new PHPMailer(true);
        $mail2->isSMTP();
        $mail2->Host       = 'smtp.gmail.com';
        $mail2->SMTPAuth   = true;
        $mail2->Username   = $Username;
        $mail2->Password   = $Password;
        $mail2->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail2->Port       = 587;
    
        $mail2->setFrom($Username, 'StudyPhoto');
        $mail2->addAddress($_POST['email']);
        
        // ユーザー向け内容
        if ($_SESSION['language'] == 'ja') {
            $mail2->Subject = '問い合わせメールを受け取りました';
            $mail2->Body = htmlspecialchars($_POST['name'], ENT_QUOTES, 'UTF-8') . '　様 <br /> <br />'
                         . '平素よりStudyPhotoをご利用いただき、誠にありがとうございます。 <br />'
                         . '以下の内容で問い合わせを受け取りましたので、報告致します。 <br /> <br />'
                         . str_repeat('-', 20) . '<br /> <br />'
                         . 'お名前: ' . htmlspecialchars($_POST['name'], ENT_QUOTES, 'UTF-8') . '<br /> <br />'
                         . '件名: ' . htmlspecialchars($_POST['subject'], ENT_QUOTES, 'UTF-8') . '<br /> <br />'
                         . '問い合わせ内容: ' . htmlspecialchars($_POST['content'], ENT_QUOTES, 'UTF-8') . '<br /> <br />'
                         . str_repeat('-', 20) . '<br /> <br />'
                         . '今後ともStudyPhotoをよろしくお願いいたします。 <br />'
                         . '開発リーダー: 佐藤佑作';
        } else {
            $mail2->Subject = 'We received your inquiry email';
            $mail2->Body = 'Dear. ' . htmlspecialchars($_POST['name'], ENT_QUOTES, 'UTF-8') . '<br /> <br />'
                         . 'Thank you for using StudyPhto. <br />'
                         . 'We are pleased to report that we have received your inquiry with the following information. <br /> <br />'
                         . str_repeat('-', 20) . '<br /> <br />'
                         . 'Name: ' . htmlspecialchars($_POST['name']) . '<br /> <br />'
                         . 'Subject: ' . htmlspecialchars($_POST['subject'], ENT_QUOTES, 'UTF-8') . '<br /> <br />'
                         . 'Message: ' . htmlspecialchars($_POST['content'], ENT_QUOTES, 'UTF-8') . '<br /> <br />'
                         . str_repeat('-', 20) . '<br /> <br />'
                         . 'Thank you for your continued support of StudyPhoto. <br />'
                         . 'Development Leader: Yusaku Sato';
        }
    
        // メール送信
        $mail2->isHTML(true);
        $mail2->CharSet = 'UTF-8';
        $mail2->Encoding = 'base64';
        
        // 送信
        $mail2->send();
        
    } catch (Exception $e) {
        echo "<div style='color:red;'>メール送信エラー: " . nl2br($e->getMessage()) . "</div>";
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
    <title>
        <?php echo ($_SESSION['language'] == 'ja' ? '問い合わせフォーム' : 'Inquiry Form'); ?>
    </title>
</head>
<body>
    <div class="loading active">
        <div class="loading__icon"></div>
        <p class="loading__text">
            <?php echo ($_SESSION['language'] == 'ja' ? '読み込み中' : 'loading'); ?>
        </p>
    </div>
    <main>
        <!-- 入力画面 -->
        <?php if ($errmessage): ?>
        <div style="color:red"><?php echo implode('<br>', $errmessage); ?></div>
        <?php endif; ?>
        <form method="post" action="./contact.php">
            <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
            <p class="title">
                <?php echo ($_SESSION['language'] == 'ja' ? '問い合わせフォーム' : 'Inquiry Form'); ?>
            </p>
            <div class="Form">
                <input class="FormName" type="text" name="name" placeholder="<?php echo ($_SESSION['language'] == 'ja' ? 'お名前' : 'Name'); ?>" required />
                <input class="FormEmail" type="email" name="email" placeholder="<?php echo ($_SESSION['language'] == 'ja' ? 'メールアドレス' : 'Eamil'); ?>" required />
                <input class="FormSubject" type="text" name="subject" placeholder="<?php echo ($_SESSION['language'] == 'ja' ? '件名' : 'Subject'); ?>" required />
                <textarea class="FormContent" type="text" name="content" placeholder="<?php echo ($_SESSION['language'] == 'ja' ? '問い合わせ内容' : 'Message'); ?>" required></textarea>
                <div class="FormButtons">
                    <a href="./home.php" class="cancel" type="button">
                        <?php echo ($_SESSION['language'] == 'ja' ? '戻る' : 'Back'); ?>
                    </a>
                    <button class="buttn" type="submit">
                        <?php echo ($_SESSION['language'] == 'ja' ? '送信' : 'Submit'); ?>
                    </button>
                </div>
            </div>
        </form>
    </main>
</body>
</html>