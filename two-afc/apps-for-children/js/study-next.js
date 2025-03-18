let selectedFiles = []; // 選択された画像を管理する配列
let inputCount = 0; // 作成されたinputタグの数を管理する変数
const language = document.getElementById("hidden_language").value;

// DOMContentLoaded時にタイマーを初期化
document.addEventListener('DOMContentLoaded', initializeTimer);

function initializeTimer() {
    const elapsedSeconds = parseInt(localStorage.getItem('stopwatchTime'), 10) || 0;
    const timeString = formatTime(elapsedSeconds);
    document.getElementById('timer-display').textContent = timeString;
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return [
        String(hours).padStart(2, '0'),
        String(minutes).padStart(2, '0'),
        String(remainingSeconds).padStart(2, '0')
    ].join(':');
}

// オーバーレイの表示と非表示
const overlay = document.getElementById('photo_overlay');
document.querySelector('.photoSelect').addEventListener('click', showOverlay);
overlay.addEventListener('click', () => {
    hideOverlay();
    hidePhotoOptionsPopup();
});

function showOverlay() {
    overlay.style.display = 'block';
    setTimeout(() => overlay.style.opacity = '1', 10);
}

function hideOverlay() {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.style.display = 'none', 300);
}

// 写真関連のイベントリスナー
document.querySelector(".photoSelect").addEventListener('click', showPhotoOptions);
document.querySelector(".photoDelete").addEventListener('click', showDeletePhotoPopup);
document.querySelector(".photoGraph").addEventListener('click', () => {
    capturePhoto();
    hideOverlay();
});
document.querySelector(".photo-Select").addEventListener('click', () => {
    selectPhoto();
    hideOverlay();
});
document.querySelector(".cancel_photo").addEventListener('click', () => {
    hidePhotoOptionsPopup();
    hideOverlay();
});
document.querySelector(".delete_cancel").addEventListener('click', () => {
    hideDeletePhotoPopup();
    hideOverlay();
});
document.querySelector(".delete_done").addEventListener('click', () => {
    deleteSelectedPhotos();
    hideOverlay();
});

function saveStudySession() {
    return new Promise((resolve, reject) => {
        const category = document.getElementById("category").value;
        const studyTime = document.getElementById("timer-display").textContent;
        const elapsedPeriod = localStorage.getItem('elapsedTime');
        const formattedElapsedTime = elapsedPeriod ? elapsedPeriod.replace(/[\[\]"]+/g, '') : 'no_elapsed_time';

        const formData = new FormData();
        formData.append('category', category);
        formData.append('study_time', studyTime);
        formData.append('SspentTime', formattedElapsedTime);

        fetch('../../php/save_formData.php', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                resolve(data);
            } else {
                if (language == 'ja') {
                    reject(new Error(data.error || 'データの保存に失敗しました'));
                } else {
                    reject(new Error(data.error || 'Failed to save data'));
                }
            }
        })
        .catch(error => {
            reject(error);
        });
    });
}

document.getElementById('saveButton').addEventListener('click', async (event) => {
    event.preventDefault();
    
    // カテゴリーの検証
    const categorySelect = document.getElementById("category");
    const selectedCategory = categorySelect.value;

    // 選択されたファイルが存在するか確認
    if (selectedFiles.length === 0) {
        if (language == 'ja') {
            alert("写真を撮影してください。");
        } else {
            alert("Please take a photo.");
        }
        return;
    }

    if (selectedCategory === "--教科を選択--" || selectedCategory === "0" || selectedCategory === "--Select Subject--") {
        if (language == 'ja') {
            alert("教科を選択してください。");   
        } else {
            alert("Please select a subject.");
        }
        return;
    }

    // ファイルの検証
    const form = document.getElementById('imageForm');
    const fileInputs = form.querySelectorAll('input[type="file"][name="images[]"]');
    let hasValidFiles = false;
    let validFileCount = 0;

    // すべてのファイル入力をチェック
    for (const input of fileInputs) {
        if (input.files && input.files.length > 0) {
            // 各ファイルの妥当性チェック
            for (const file of input.files) {
                const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/PNG', 'image/JPG', 'image/JPEG'];
                if (validTypes.includes(file.type) && file.size > 0) {
                    validFileCount++;
                }
            }
        }
    }

    hasValidFiles = validFileCount > 0;

    if (!hasValidFiles) {
        if (language == 'ja') {
            alert("有効な画像ファイルを選択してください。");
        } else {
            alert("Please select a valid image file.");
        }
        return;
    }

    try {
        // データの保存を順番に実行
        await saveStudySession();
        saveData();
        form.submit();
    } catch (error) {
        if (language == 'ja') {
            console.error('データの保存中にエラーが発生しました:', error);
            alert("データの保存中にエラーが発生しました。もう一度お試しくじってください。");
        } else {
            console.error('An error occurred while saving data:', error);
            alert("An error occurred while saving data. Please try again.");
        }
    }
});

function saveData() {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];

    const timeString = localStorage.getItem('stopwatchTime') || '00:00:00';
    const parts = timeString.split(':');
    const elapsedSeconds = parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);

    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;
    const totalCurrentHours = hours + minutes / 60 + seconds / 3600;

    const previousTotalTime = parseInt(localStorage.getItem('totalTime')) || 0;

    const newTotalTime = previousTotalTime + totalCurrentHours;
    localStorage.setItem('totalTime', newTotalTime);

    let dates = JSON.parse(localStorage.getItem('dates')) || [];
    let studyTimes = JSON.parse(localStorage.getItem('studyTimes')) || [];

    dates.push(currentDate);
    studyTimes.push(totalCurrentHours);

    localStorage.setItem('dates', JSON.stringify(dates));
    localStorage.setItem('studyTimes', JSON.stringify(studyTimes));

    localStorage.setItem('stopwatchTime', '00:00:00');

    window.location.href = '../../home.php'; // ここでもリダイレクト
}

//画像処理
let allPhotos = []; // すべての写真を格納する配列
let selectedPhotos = []; // 選択された写真を格納する配列

window.onload = function() {
    allPhotos = []; // リロードされたら写真のデータを削除
}

// その他の補助関数
function showPhotoOptions() {
    document.getElementById("photoOptionsPopup").style.display = "block";
}

function hidePhotoOptionsPopup() {
    document.getElementById("photoOptionsPopup").style.display = "none";
}

function showDeletePhotoPopup() {
    if (selectedFiles.length === 0) {
        alert(language === 'ja' ? "削除できる写真がありません" : "No photos to delete");
        return;
    }
    showOverlay();
    populateDeletePhotoList();
    document.getElementById("deletePhotoPopup").style.display = "block";
}

function hideDeletePhotoPopup() {
    document.getElementById("deletePhotoPopup").style.display = "none";
}

function populateDeletePhotoList() {
    const deletePhotoList = document.getElementById("deletePhotoList");
    deletePhotoList.innerHTML = '';
    selectedFiles.forEach(photo => {
        const img = createImageElement(photo);
        img.onclick = () => togglePhotoSelection(photo, img);
        deletePhotoList.appendChild(img);
    });
}

function togglePhotoSelection(photo, img) {
    const photoIndex = allPhotos.indexOf(photo);
    if (photoIndex !== -1) {
        allPhotos.splice(photoIndex, 1);
        img.style.opacity = '1.0';
    } else {
        allPhotos.push(photo);
        img.style.opacity = '0.5';
    }
}

// 写真を撮影する関数
function capturePhoto() {
    const form = document.getElementById('imageForm');
    const submitButton = form.querySelector('input[type="submit"]');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.capture = 'environment';
    input.name = 'images[]';
    input.style = 'display: none';
    input.id = `input_${inputCount++}`;

    input.onchange = async function(event) {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }

        const files = Array.from(event.target.files);
        
        // ファイルの圧縮と処理
        const processedFiles = await Promise.all(files.map(async file => {
            // 画像ファイルの検証
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/PNG', 'image/JPG', 'image/JPEG'];
            if (!validTypes.includes(file.type) || file.size === 0) {
                return null;
            }

            try {
                // 画像をBlobとして処理
                const blob = new Blob([file], { type: file.type });
                const fileName = `photo_${Date.now()}.${file.type.split('/')[1]}`;
                return new File([blob], fileName, { type: file.type });
            } catch (error) {
                console.error('ファイル処理エラー:', error);
                return null;
            }
        }));

        // nullを除外し、有効なファイルのみを取得
        const validFiles = processedFiles.filter(file => file !== null);

        if (validFiles.length === 0) {
            if (language === 'ja') {
                alert('有効な画像ファイルが処理できませんでした');
            } else {
                alert('Unable to process valid image files');
            }
            return;
        }

        // 重複チェックと追加
        let newFiles = validFiles.filter(file => 
            !selectedFiles.some(existingFile => existingFile.name === file.name)
        );
        
        if (newFiles.length > 0) {
            hidePhotoOptionsPopup();
            newFiles = await cropPhoto(newFiles);
            selectedFiles.push(...newFiles);
            displayPhoto(newFiles);
        }
    };
    input.click();
}

// selectPhoto関数は画像ファイルを選択させる関数
function selectPhoto() {
    const form = document.getElementById('imageForm'); // formタグを取得
    const submitButton = form.querySelector('input[type="submit"]'); // submitボタンを取得
    const input = document.createElement('input'); // 新しいinputタグを作成
    input.type = 'file';
    input.accept = 'image/*'; // 画像のみ選択
    input.multiple = true; // 複数選択可能
    input.name = 'images[]'; // name属性にimages[]を指定
    input.style = 'display: none'; // 非表示にする
    input.id = `input_${inputCount++}`; // 一意のIDを付与
    // submitボタンの前に画像のinputタグを挿入
    form.insertBefore(input, submitButton); // submitボタンの前に追加

    // ファイル選択後の処理
    input.onchange = function(event) {
        const files = Array.from(event.target.files); // 選択されたファイルを配列に変換

        files.forEach(file => {
            // input要素にファイル名を格納する
            input.setAttribute('data-image-name', file.name); // data-image-name 属性にファイル名を格納
        });

        // 重複を避けて新しく選ばれたファイルのみを追加
        const newFiles = files.filter(file => 
            !selectedFiles.some(existingFile => existingFile.name === file.name)
        );
        selectedFiles.push(...newFiles); // 新しいファイルをselectedFilesに追加

        displayPhoto(newFiles); // 新しく選ばれたファイルのみを表示
        hidePhotoOptionsPopup(); // オプションのポップアップを非表示（未定義の関数）
    };

    input.click(); // ファイル選択ダイアログを表示
}

let cropperInstance = null;

function cropPhoto(files) {
    return new Promise((resolve) => {
        document.getElementById('cropContainer').style.display = 'flex';
        document.getElementById('cropContainer_overlay').style.display = 'block';

        const image = document.getElementById('previewImage');
        const file = files[0];
        const objectURL = URL.createObjectURL(file);
        image.src = objectURL;

        // 画像が読み込まれた後に処理を実行
        image.onload = function() {
            const naturalWidth = image.naturalWidth;
            const naturalHeight = image.naturalHeight;
            
            
            // 既存のCropperインスタンスを破棄
            if (cropperInstance) {
                cropperInstance.destroy();
            }

            // Cropperを初期化
            cropperInstance = new Cropper(image, {
                aspectRatio: naturalWidth / naturalHeight,
                viewMode: 1,
                autoCropArea: 1,
                responsive: true,
                background: false
            });

            // トリミングボタンのクリックイベント
            document.getElementById('cropButton').onclick = function() {
                if (!cropperInstance) return;

                // トリミング後のキャンバスサイズを画像の元のサイズにする
                const croppedCanvas = cropperInstance.getCroppedCanvas({
                    with: naturalWidth,
                    height: naturalHeight
                });

                // トリミングされた画像をBlobに変換
                croppedCanvas.toBlob((croppedImage) => {
                    const croppedFile = new File([croppedImage], file.name, {
                        type: 'image/jpeg',
                        lastModified: new Date().getTime()
                    });

                    // トリミングされたファイルをフォームに追加
                    const form = document.getElementById('imageForm');
                    const submitButton = form.querySelector('input[type="submit"]');
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.name = 'images[]';
                    input.style = 'display: none';
                    input.id = `input_${inputCount}`;

                    // ファイルオブジェクトを作成してinputにセット
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(croppedFile);
                    input.files = dataTransfer.files;
                    input.setAttribute('data-image-name', croppedFile.name);

                    form.insertBefore(input, submitButton);

                    // トリミング後の処理
                    document.getElementById('cropContainer').style.display = 'none';
                    document.getElementById('cropContainer_overlay').style.display = 'none';
                    cropperInstance.destroy();
                    cropperInstance = null;

                    resolve([croppedFile]);
                }, 'image/jpeg');
            };
        };
    });
}

// 画像を表示する
function displayPhoto(files) {
    const photoDisplay = document.getElementById('photoDisplay_id');
    files.forEach(file => {
        const img = createImageElement(file);
        photoDisplay.appendChild(img);
    });
}

function createImageElement(file) {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.classList.add('photo_img');
    img.onload = () => URL.revokeObjectURL(img.src); // メモリリーク防止
    return img;
}

// 写真削除関連
function deleteSelectedPhotos() {
    selectedFiles = selectedFiles.filter(photo => !allPhotos.includes(photo));
    removeDeletedInputs();
    allPhotos = [];
    hideDeletePhotoPopup();
    updatePhotoDisplay();
}

function removeDeletedInputs() {
    const imageForm = document.getElementById('imageForm');
    const inputs = imageForm.querySelectorAll('input[data-image-name]');
    inputs.forEach(input => {
        const imageName = input.getAttribute('data-image-name');
        if (allPhotos.some(file => file.name === imageName)) {
            input.remove();
        }
    });
}

function updatePhotoDisplay() {
    const photoDisplay = document.getElementById('photoDisplay_id');
    photoDisplay.innerHTML = '';
    selectedFiles.forEach(photo => {
        const img = createImageElement(photo);
        photoDisplay.appendChild(img);
    });
}