<?php
session_start();
$nonce = base64_encode(random_bytes(16));
header("Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-" . $nonce . "' https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.12/cropper.min.js; style-src 'self' 'nonce-" . $nonce . "' https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.12/cropper.min.css; img-src 'self' blob: data:; connect-src 'self' blob:; frame-src 'self';");
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="../../css/main.css" />
    <link rel="stylesheet" href="../../css/scss/load.css" />
    <link rel="stylesheet" href="../../css/study/study-next.css" />
    <link rel="shortcut icon" href="../../favicon.ico">
    <script src="../../js/load.js" nonce="<?= htmlspecialchars($nonce, ENT_QUOTES, 'UTF-8') ?>" defer></script>
    <script src="../../js/study-next.js" nonce="<?= htmlspecialchars($nonce, ENT_QUOTES, 'UTF-8') ?>" defer></script>
    <script src="../../js/category-study.js" nonce="<?= htmlspecialchars($nonce, ENT_QUOTES, 'UTF-8') ?>" defer></script>
    <!-- Cropper.jsのCSSとJS -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.12/cropper.min.css" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.12/cropper.min.js"></script>

    <title>Stopwatch Next</title>
</head>
<body>
    <div class="loading active">
        <div class="loading__icon"></div>
        <p class="loading__text">loading</p>
    </div>
    <div class="return">
        <a href="./study.html"><img src="../../ui_image/return.png"></a>
    </div>
    <h1 class="timer" id="timer-display">00:00:00</h1>
    
    <div class="dropdown">
        <select id="category" required="required">
            <option name="0">--教科を選択--</option>
            <!--動的にカテゴリーを表示-->
        </select>
        <button class="newSubject">教科を編集</button>
    </div>

    <div class="overlay" id="overlay"></div>
    <div class="popup" id="popup">
        <div class="tab">
            <button id="addSection">追加</button>
            <button id="editSection">変更</button>
            <button id="deleteSection">削除</button>
        </div>

        <!-- Add Section -->
        <div id="addSection" class="form-section add-popup">
            <label for="optionName" class="optionlabel">追加する教科名</label>
            <input type="text" id="addOptionName" placeholder="新しい教科名">
            <div class="popupbutton">
                <button class="cancel">キャンセル</button>
                <button class="addSubject">追加</button>
            </div>
        </div>

        <!-- Edit Section -->
        <div id="editSection" class="form-section edit-popup">
            <label for="optionSelect" class="optionlabel">変更する教科名</label>
            <select id="editOptionSelect">
                <option value="">--変更する教科を選択--</option>
                <!--動的にカテゴリーを表示-->
            </select>
            <label for="editOptionName" class="optionlabel">新しい教科名</label>
            <input type="text" id="editOptionName" placeholder="新しい教科名">
            <div class="popupbutton">
                <button class="cancel">キャンセル</button>
                <button class="editSubject">変更</button>
            </div>
        </div>
        <!-- Delete Section -->
        <div id="deleteSection" class="form-section delete-popup">
            <label for="optionSelect" class="optionlabel">削除する教科名</label>
            <select id="deleteOptionSelect">
                <option value="">--削除する教科を選択--</option>
                <!--動的にカテゴリーを表示-->
            </select>
            <div class="popupbutton">
                <button class="cancel">キャンセル</button>
                <button class="deleteSubject">削除</button>
            </div>
        </div>
    </div>
    <div id="cropContainer_overlay"></div>
    <div id="cropContainer">
        <p>トリミングしたい部分を選択してください</p>
        <img id="previewImage">
        <button id="cropButton">トリミングを実行</button>
    </div>
    <div class="photo">
        <button class="photoSelect" >画像を追加</button>
        <button class="photoDelete" >画像を削除</button>
    </div>
    <div class="popup_photo" id="photoOptionsPopup">
        <p>画像をどうしますか？</p>
        <div class="popupbutton_photo_sub">
            <button class="photoGraph">撮影</button>
            <button class="photo-Select">選択</button>
            <button class="cancel_photo">キャンセル</button>
        </div>
    </div>
    <div class="popup_photo_delete" id="deletePhotoPopup">
        <p>削除する画像を選択してください</p>
        <div id="deletePhotoList"></div>
        <button class="delete_cancel">キャンセル</button>
        <button class="delete_done">削除</button>
    </div>
    <div class="photoDisplay">
        <div type="text" id="photoDisplay_id"></div>
    </div>
    <div class="button-container">
        <form action="../../php/save_images.php" method="post" enctype="multipart/form-data" id="imageForm">
            <input type="submit" id="saveButton" value="登録" />
        </form>
    </div>
    <input type="hidden" id="username" value="<?php echo $_SESSION['username']; ?>">
</body>
</html>