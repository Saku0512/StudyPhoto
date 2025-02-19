<?php
$CommentNonce = base64_encode(random_bytes(16));
header("Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-" . $CommentNonce . "' https://cdn.jsdelivr.net/npm/flatpickr https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/ja.js; style-src 'self' https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css");
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width , initial-scale=1.0" />
    <link rel="stylesheet" href="../../css/main.css" />
    <link rel="stylesheet" href="../../css/scss/load.css" />
    <link rel="stylesheet" href="../../css/record/record_comment.css" />
    <script src="../../js/load.js" defer></script>
    <script nonce="<?= htmlspecialchars($CommentNonce, ENT_QUOTES, 'UTF-8') ?>" src="../../js/record_tab.js" defer></script>
    <script nonce="<?= htmlspecialchars($CommentNonce, ENT_QUOTES, 'UTF-8') ?>" src="../../js/record_comment.js" defer></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/ja.js"></script>
    <title>記録を振り返る</title>
</head>
<body>
    <div class="loading active">
        <div class="loading__icon"></div>
        <p class="loading__text">loading</p>
    </div>
    <main>
        <div class="tab">
            <a href="../../home.php"><img src="../../ui_image/return.png"></a>
            <a href="./record_time.php" id="timeButton" type="button"><img src="../../ui_image/clock.png"></a>
            <a href="./record_note.php" id="noteButton" type="button"><img src="../../ui_image/book.png"></a>
            <a href="./record_comment.php" id="commentButton" type="button"><img src="../../ui_image/parent.png"></a>
        </div>
        <!-- Comment Section -->
        <div id="commentSection" class="section">
            <div class="comment-header">
                <div class="comment-date-input-container">
                    <p>日付で検索</p>
                    <input type="date" id="commentDate" class="comment-date-input">
                </div>
                <div class="comment-textSearch-input-container">
                    <p>キーワードで検索</p>
                    <div class="input-with-icon">
                        <input type="text" id="commentText" class="comment-textSearch-input">
                        <img src="../../ui_image/search.png" alt="Search Icon" class="search-icon">
                    </div>
                </div>
            </div>
            <button id="clearButton" class="clear-button">クリア</button>
            <div class="comment-list">
                <!-- 動的にコメントを表示 -->
            </div>
        </div>
    </main>
</body>
</html>