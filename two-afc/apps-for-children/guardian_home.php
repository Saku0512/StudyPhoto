<?php
session_start();
$GuardianNonce = base64_encode(random_bytes(16));
header("Content-Security-Policy: 
    default-src 'self'; 
    script-src 'self' 'nonce-{$GuardianNonce}' https://cdn.jsdelivr.net/npm/flatpickr https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/ja.js https://cdn.jsdelivr.net/npm/js-base64/base64.min.js https://cdn.jsdelivr.net/npm/chart.js https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns https://cdnjs.cloudflare.com/ajax/libs/date-fns/2.28.0/date-fns.min.js; 
    style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css;
    img-src 'self' data:;
");
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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['language'])) {
        if ($_POST['language'] == 'ja') {
            $_SESSION['language'] = 'ja'; // 日本語を選択
        }else {
            $_SESSION['language'] = 'en'; // 英語を選択
        }
        // 言語変更後にリダイレクト
        header("Location: " . $_SERVER['REQUEST_URI']);
        exit();
    } else {
        $_SESSION['language'] = 'en';
    }
}
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
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/ja.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    <link rel="stylesheet" href="./css/guardian_home.css">
    <link rel="stylesheet" href="./css/scss/load.css" >
    <script src="./js/load.js" nonce="<?= htmlspecialchars($GuardianNonce, ENT_QUOTES, 'UTF-8') ?>" defer></script>
    <script src="./js/guardian.js" nonce="<?= htmlspecialchars($GuardianNonce, ENT_QUOTES, 'UTF-8') ?>" defer></script>
    <link rel="shortcut icon" href="favicon.ico">
</head>
<body>
    <main>
        <div class="loading active">
            <div class="loading__icon"></div>
            <p class="loading__text">
                <?php echo ($_SESSION['language'] == 'ja' ? '読み込み中' : 'loading'); ?>
            </p>
        </div>
        <p class="title">
            <?php echo ($_SESSION['language'] == 'ja' ? htmlspecialchars($userName) . 'の勉強記録' : htmlspecialchars($userName) . ' study record'); ?>
        </p>
        <div class="side_unit">
            <div class="side_unit_button">
                <button class="side_unit_day">
                    <?php echo ($_SESSION['language'] == 'ja' ? '日' : 'Day'); ?>
                </button>
                <button class="side_unit_week">
                    <?php echo ($_SESSION['language'] == 'ja' ? '週' : 'Week'); ?>
                </button>
                <button class="side_unit_month">
                    <?php echo ($_SESSION['language'] == 'ja' ? '月' : 'Month'); ?>
                </button>
                <button class="side_unit_year">
                    <?php echo ($_SESSION['language'] == 'ja' ? '年' : 'Year'); ?>
                </button>
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
        <div class="chart-footer">
            <div class="category-chart-container">
                <canvas id="categoryChart"></canvas>
            </div>
            <div class="guardian_comment">
                <div class="guardian_comment_container">
                    <p class="guardian_comment_title">
                        <?php echo ($_SESSION['language'] == 'ja' ? 'コメントを書く日付を選択' : 'Select a date to write your comment'); ?>
                    </p>
                    <div class="date-input-container">
                        <input type="date" id="commentDate" class="comment-date-input">
                    </div>
                    <textarea class="guardian_comment_text" placeholder="<?php echo ($_SESSION['language'] == 'ja' ? 'コメントを入力してください' : 'Enter your comment'); ?>"></textarea>
                </div>
                <button class="guardian_comment_button">
                    <?php echo ($_SESSION['language'] == 'ja' ? 'コメントを送信' : 'Send a comment'); ?>
                </button>
            </div>
        </div>
        <div id="imagePopupOverlay" onclick="hideImagePopup()">
            <div id="imagePopupContent"></div>
        </div>
        <div class="footer" type="button">
            <button class="setting" id="setting">
                <?php echo ($_SESSION['language'] == 'ja' ? '設定' : 'Settings'); ?>
            </button>
                <div class="settingPanel" id="settingPanel">
                    <div class="setting_header">
                        <p>
                            <?php echo ($_SESSION['language'] == 'ja' ? '設定' : 'Settings'); ?>
                        </p>
                        <form method="post" action="">
                            <div>
                                <label for="switch" class="switch_label">
                                    <span class="setting_title">
                                        <?php echo ($_SESSION['language'] == 'ja' ? '英語' : 'En'); ?>
                                    </span>
                                    <div class="swith">
                                        <input type="hidden" name="language" value="en" />
                                        <input type="checkbox" id="switch" name="language" value="ja" <?php echo ($_SESSION['language'] == 'ja' ? 'checked' : ''); ?> />
                                        <div class="circle"></div>
                                        <div class="base"></div>
                                    </div>
                                    <span class="setting_title">
                                        <?php echo ($_SESSION['language'] == 'ja' ? '日本語' : 'Ja'); ?>
                                    </span>
                                </label>
                            </div>
                        </form>
                    </div>
                <p>
                    <?php echo ($_SESSION['language'] == 'ja' ? 'ユーザー名' : 'Username'); ?>: 
                    <img class="hide_show_userName" id="toggleUserName" src="./ui_image/close_eye.png" alt="ユーザー名の表示/非表示">
                    <pre class="code-block" id="userNameField" data-username="<?php echo htmlspecialchars($_SESSION['guardian_username']); ?>"><?php echo $nameHidden; ?></pre>
                </p>
                <p>
                    <?php echo ($_SESSION['language'] == 'ja' ? 'ユーザーID' : 'User ID'); ?>: 
                    <img class="hide_show_id" id="toggleId" src="./ui_image/close_eye.png" alt="ユーザーIDの表示/非表示">
                    <pre class="code-block" id="userIdField" data-userid="<?php echo htmlspecialchars($_SESSION['guardian_id']); ?>"><?php echo $idHidden; ?></pre>
                </p> 
                <div class="button-container2">
                    <button id="closeSetting">
                        <?php echo ($_SESSION['language'] == 'ja' ? '閉じる' : 'Close'); ?>
                    </button>
                    <button class="logout" onclick="window.location.href='php/logout.php'">
                        <?php echo ($_SESSION['language'] == 'ja' ? 'ログアウト' : 'Log Out'); ?>
                    </button>
                </div>
            </div>
            <a href="./contact.php" class="contact">
                <?php echo ($_SESSION['language'] == 'ja' ? '問い合わせ' : 'Contact Us'); ?>
            </a>
        </div>
    </main>
    <input type="hidden" id="hidden_language" value="<?php echo ($_SESSION['language']); ?>" />
</body>
</html>