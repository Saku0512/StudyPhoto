<?php
session_start();
$nonce = base64_encode(random_bytes(16));
header("Content-Security-Policy: default-src 'self'; 
    script-src 'self' 'nonce-" . $nonce . "' https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.12/cropper.min.js;
    style-src 'self' 'nonce-" . $nonce . "' https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.12/cropper.min.css;
    img-src 'self' blob: data:;
    connect-src 'self' blob:;
    frame-src 'self';
    frame-ancestors 'none';
");
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

    <title>
        <?php echo ($_SESSION['language'] == 'ja' ? '勉強内容を記録' : 'Record your study'); ?>
    </title>
</head>
<body>
    <input type="hidden" id="hidden_language" value="<?php echo ($_SESSION['language']); ?>" />
    <div class="loading active">
        <div class="loading__icon"></div>
        <p class="loading__text">
            <?php echo ($_SESSION['language'] == 'ja' ? '読み込み中' : 'loadong'); ?>
        </p>
    </div>
    <div class="return">
        <a href="./study.html"><img src="../../ui_image/return.png"></a>
    </div>
    <h1 class="timer" id="timer-display">00:00:00</h1>
    
    <div class="dropdown">
        <select id="category" required="required">
            <option value="" selected>
                <?php echo ($_SESSION['language'] == 'ja' ? '--教科を選択--' : '--Select Subject--'); ?>
            </option>
            <!--動的にカテゴリーを表示-->
        </select>
        <button class="newSubject">
            <?php echo ($_SESSION['language'] == 'ja' ? '教科を編集' : 'Edit Subject'); ?>
        </button>
    </div>

    <div class="overlay" id="overlay"></div>
    <div class="popup" id="popup">
        <div class="tab">
            <button id="addSection">
                <?php echo ($_SESSION['language'] == 'ja' ? '追加' : 'New'); ?>
            </button>
            <button id="editSection">
                <?php echo ($_SESSION['language'] == 'ja' ? '変更' : 'Rename'); ?>
            </button>
            <button id="deleteSection">
                <?php echo ($_SESSION['language'] == 'ja' ? '削除' : 'Delete'); ?>
            </button>
        </div>

        <!-- Add Section -->
        <div id="addSection" class="form-section add-popup">
            <label for="optionName" class="optionlabel">
                <?php echo ($_SESSION['language'] == 'ja' ? '追加する教科名' : 'Name to be added'); ?>
            </label>
            <input type="text" id="addOptionName" placeholder="<?php echo ($_SESSION['language'] == 'ja' ? '新しい教科名' : 'New Subject Name'); ?>">
            <div class="popupbutton">
                <button class="cancel">
                    <?php echo ($_SESSION['language'] == 'ja' ? 'キャンセル' : 'Cancel'); ?>
                </button>
                <button class="addSubject">
                    <?php echo ($_SESSION['language'] == 'ja' ? '追加' : 'Add'); ?>
                </button>
            </div>
        </div>

        <!-- Edit Section -->
        <div id="editSection" class="form-section edit-popup">
            <label for="optionSelect" class="optionlabel">
                <?php echo ($_SESSION['language'] == 'ja' ? '変更する教科名' : 'Name to be renamed'); ?>
            </label>
            <select id="editOptionSelect">
                <option value="">
                    <?php echo ($_SESSION['language'] == 'ja' ? '--変更する教科を選択--' : '--Select images to rename--'); ?>
                </option>
                <!--動的にカテゴリーを表示-->
            </select>
            <label for="editOptionName" class="optionlabel">
                <?php echo ($_SESSION['language'] == 'ja' ? '新しい教科名' : 'New Subject Name'); ?>
            </label>
            <input type="text" id="editOptionName" placeholder="<?php echo ($_SESSION['language'] == 'ja' ? '新しい教科名' : 'New Subject Name'); ?>">
            <div class="popupbutton">
                <button class="cancel">
                    <?php echo ($_SESSION['language'] == 'ja' ? 'キャンセル' : 'Cancel'); ?>
                </button>
                <button class="editSubject">
                    <?php echo ($_SESSION['language'] == 'ja' ? '変更' : 'Rename'); ?>
                </button>
            </div>
        </div>
        <!-- Delete Section -->
        <div id="deleteSection" class="form-section delete-popup">
            <label for="optionSelect" class="optionlabel">
                <?php echo ($_SESSION['language'] == 'ja' ? '削除する教科名' : 'Name to be deleted'); ?>
            </label>
            <select id="deleteOptionSelect">
                <option value="">
                    <?php echo ($_SESSION['language'] == 'ja' ? '--削除する教科を選択--' : '--Select images to delete--'); ?>
                </option>
                <!--動的にカテゴリーを表示-->
            </select>
            <div class="popupbutton">
                <button class="cancel">
                    <?php echo ($_SESSION['language'] == 'ja' ? 'キャンセル' : 'Cancel'); ?>
                </button>
                <button class="deleteSubject">
                    <?php echo ($_SESSION['language'] == 'ja' ? '削除' : 'Delete'); ?>
                </button>
            </div>
        </div>
    </div>
    <div id="cropContainer_overlay"></div>
    <div id="cropContainer">
        <p>
            <?php echo ($_SESSION['language'] == 'ja' ? 'トリミングしたい部分を選択してください' : 'Select the area to be trimmed'); ?>
        </p>
        <div id="crop_div">
            <img id="previewImage">
        </div>
        <button id="cropButton">
            <?php echo ($_SESSION['language'] == 'ja' ? 'トリミングを実行' : 'Trim'); ?>
        </button>
    </div>
    <div class="photo_overlay" id="photo_overlay"></div>
    <div class="photo">
        <button class="photoSelect" >
            <?php echo ($_SESSION['language'] == 'ja' ? '画像を追加' : 'Add images'); ?>
        </button>
        <button class="photoDelete" >
            <?php echo ($_SESSION['language'] == 'ja' ? '画像を削除' : 'Delete images'); ?>
        </button>
    </div>
    <div class="popup_photo" id="photoOptionsPopup">
        <p>
            <?php echo ($_SESSION['language'] == 'ja' ? '画像をどうしますか？' : 'How do you add images?'); ?>
        </p>
        <div class="popupbutton_photo_sub">
            <button class="photoGraph">
                <?php echo ($_SESSION['language'] == 'ja' ? '撮影' : 'Take a picture'); ?>
            </button>
            <button class="photo-Select">
                <?php echo ($_SESSION['language'] == 'ja' ? '選択' : 'Select images'); ?>
            </button>
            <button class="cancel_photo">
                <?php echo ($_SESSION['language'] == 'ja' ? 'キャンセル' : 'Cancel'); ?>
            </button>
        </div>
    </div>
    <div class="popup_photo_delete" id="deletePhotoPopup">
        <p>
            <?php echo ($_SESSION['language'] == 'ja' ? '削除する画像を選択してください' : 'Select images to delte'); ?>
        </p>
        <div id="deletePhotoList"></div>
        <button class="delete_cancel">
            <?php echo ($_SESSION['language'] == 'ja' ? 'キャンセル' : 'Cancel'); ?>
        </button>
        <button class="delete_done">
            <?php echo ($_SESSION['language'] == 'ja' ? '削除' : 'Delete'); ?>
        </button>
    </div>
    <div class="photoDisplay">
        <div type="text" id="photoDisplay_id"></div>
    </div>
    <div class="button-container">
        <form action="../../php/save_images.php" method="post" enctype="multipart/form-data" id="imageForm">
            <input type="submit" id="saveButton" value="<?php echo ($_SESSION['language'] == 'ja' ? '登録' : 'Send'); ?>" />
        </form>
    </div>
    <input type="hidden" id="username" value="<?php echo $_SESSION['username']; ?>">
</body>
</html>