<?php
session_start();
$GuardianNonce = base64_encode(random_bytes(16));
header("Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-" . $GuardianNonce . "' https://cdn.jsdelivr.net/npm/js-base64/base64.min.js https://cdn.jsdelivr.net/npm/chart.js https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns https://cdnjs.cloudflare.com/ajax/libs/date-fns/2.28.0/date-fns.min.js; style-src 'self';");

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
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script> <!-- Chart.js CDN -->
    <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns"></script> <!-- Date-fns adapter -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/date-fns/2.28.0/date-fns.min.js"></script> <!-- date-fns CDN -->
    <link rel="stylesheet" href="./css/guardian_home.css">
    <script src="./js/guardian.js" nonce="<?= htmlspecialchars($GuardianNonce, ENT_QUOTES, 'UTF-8') ?>" defer></script>
</head>
<body>
    <main>
        <p class="title"><?php echo htmlspecialchars($userName) ?>の勉強記録</p>
        <div class="side_unit">
            <div class="side_unit_button">
                <button class="side_unit_week">週</button>
                <button class="side_unit_month">月</button>
                <button class="side_unit_year">年</button>
            </div>
        </div>
        <div class="span_select">
            <img class="span_select_left" src="./ui_image/span_select_left.png" alt="左矢印">
            <p class="span_select_text"><!-- 動的に表示 --></p>
            <img class="span_select_right" src="./ui_image/span_select_right.png" alt="右矢印">
        </div>
        <div class="chart-container">
            <canvas id="studyChart"></canvas>
        </div>
        <div class="category-chart-container">
            <canvas id="categoryChart"></canvas>
        </div>
        <div id="imagePopupOverlay" onclick="hideImagePopup()">
            <div id="imagePopupContent"></div>
        </div>
        <div class="footer" type="button">
            <button class="setting" id="setting">設定</button>
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
                    <button id="closeSetting">閉じる</button>
                    <button class="logout" onclick="window.location.href='php/logout.php'">ログアウト</button>
                </div>
            </div>
            <a href="./php/contact.php" class="contact">問い合わせ</a>
        </div>
    </main>
</body>
</html>