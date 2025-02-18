<?php
$TimeNonce = base64_encode(random_bytes(16));
header("Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-" . $TimeNonce . "' https://cdn.jsdelivr.net/npm/flatpickr https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/ja.js https://cdn.jsdelivr.net/npm/chart.js https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns https://cdnjs.cloudflare.com/ajax/libs/date-fns/2.28.0/date-fns.min.js https://cdn.jsdelivr.net/npm/flatpickr https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/ja.js;");
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width , initial-scale=1.0" />
    <link rel="stylesheet" href="../../css/main.css" />
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script> <!-- Chart.js CDN -->
    <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns"></script> <!-- Date-fns adapter -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/date-fns/2.28.0/date-fns.min.js"></script> <!-- date-fns CDN -->
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script> <!-- flatpickr CDN -->
    <script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/ja.js"></script> <!-- flatpickr Japanese locale -->
    <link rel="stylesheet" href="../../css/scss/load.css" />
    <link rel="stylesheet" href="../../css/record/record_time.css" />
    <script src="../../js/load.js" nonce="<?= htmlspecialchars($TimeNonce, ENT_QUOTES, 'UTF-8') ?>" defer></script>
    <script src="../../js/record.js" nonce="<?= htmlspecialchars($TimeNonce, ENT_QUOTES, 'UTF-8') ?>" defer></script>
    <script nonce="<?= htmlspecialchars($TimeNonce, ENT_QUOTES, 'UTF-8') ?>" src="../../js/record_DOM.js" defer></script>
    <title>記録を振り返る</title>
</head>
<body>
    <div class="loading active">
        <div class="loading__icon"></div>
        <p class="loading__text">loading</p>
    </div>
    <main>
        <div class="tab">
            <a href="../../home.php"><img src="../../ui_image/return.png" alt="Return"></a>
            <a href="./record_time.php" id="timeButton" type="button"><img src="../../ui_image/clock.png" alt="Time Record"></a>
            <a href="./record_note.php" id="noteButton" type="button"><img src="../../ui_image/book.png" alt="Note Record"></a>
            <a href="./record_comment.php" id="commentButton" type="button"><img src="../../ui_image/parent.png" alt="Comment Record"></a>
        </div>
        <div id="timerSection" class="section">
            <div class="side_unit">
                <div class="side_unit_button">
                    <button class="side_unit_day">日</button>
                    <button class="side_unit_week">週</button>
                    <button class="side_unit_month">月</button>
                    <button class="side_unit_year">年</button>
                </div>
            </div>
            <div class="span_select">
                <img class="span_select_left" src="../../ui_image/span_select_left.png" alt="左矢印">
                <p class="span_select_text"><!-- 動的に表示 --></p>
                <img class="span_select_right" src="../../ui_image/span_select_right.png" alt="右矢印">
            </div>
            <div class="chart-container">
                <canvas id="studyChart"></canvas>
            </div>
        </div>
    </main>
</body>
</html>