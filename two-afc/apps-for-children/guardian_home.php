<?php
session_start();

ini_set('display_errors', 1);
error_reporting(E_ALL);

//データベースにアクセス
require_once './php/db_connection.php';

//ユーザーIDをセッションから取得
$userName = $_SESSION['guardian_username'] ?? null;
$userId = $_SESSION['guardian_id'] ?? null;
if ($userId === null || $userName === null) {
    header("Location: index.php");
    exit();
}

$nameHidden = str_repeat('*', strlen($_SESSION['guardian_username'] ?? ''));
$idHidden = str_repeat('*', strlen($_SESSION['guardian_id'] ?? ''));
?>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://cdn.jsdelivr.net/npm/js-base64/base64.min.js" defer></script>
    <link rel="stylesheet" href="./css/guardian_home.css">
    <script src="./js/guardian.js" defer></script>
</head>
<body>
    <main>
        <h1>保護者用ページ</h1>
        <p><?php echo htmlspecialchars($userName) ?>の勉強記録</p>
        <div id="studyDataArea">
            <div id="studyData"><!-- 動的に生成する --></div>
        </div>
        <div id="imagePopupOverlay" onclick="hideImagePopup()">
            <div id="imagePopupContent"></div>
        </div>
        <div class="footer" type="button">
            <button class="setting" onclick="showSPopup()">設定</button>
            <div class="settingPanel" id="settingPanel">
                <p>設定</p>
                <p>ユーザー名: 
                    <img class="hide_show_userName" id="toggleUserName" src="./ui_image/close_eye.png" alt="ユーザー名の表示/非表示">
                    <pre class="code-block" id="userNameField" data-username="<?php echo htmlspecialchars($_SESSION['guardian_username']); ?>"><?php echo $nameHidden; ?></pre>
                </p>
                <p>ユーザーID: 
                    <img class="hide_show_id" id="toggleId" src="./ui_image/close_eye.png" alt="ユーザーIDの表示/非表示">
                    <pre class="code-block" id="userIdField" data-userid="<?php echo htmlspecialchars($_SESSION['guardian_id']); ?>"><?php echo $idHidden; ?></pre>
                </p> 
                <div class="button-container2">
                    <button onclick="hideSPopup()">閉じる</button>
                    <button class="logout" onclick="window.location.href='php/logout.php'">ログアウト</button>
                </div>
            </div>
            <a href="./php/contact.php" class="contact">問い合わせ</a>
        </div>
    </main>
</body>
</html>