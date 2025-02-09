document.addEventListener('DOMContentLoaded', () => {
    const elapsedSeconds = parseInt(localStorage.getItem('stopwatchTime'), 10) || 0;

    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;

    const timeString = 
        String(hours).padStart(2, '0') + ':' +
        String(minutes).padStart(2, '0') + ':' +
        String(seconds).padStart(2, '0');

    document.getElementById('timer-display').textContent = timeString;
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
                reject(new Error(data.error || 'データの保存に失敗しました'));
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
        alert("写真を撮影してください。");
        return;
    }

    if (selectedCategory === "--教科を選択--" || selectedCategory === "0") {
        alert("教科を選択してください。");
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
        alert("有効な画像ファイルを選択してください。");
        return;
    }

    try {
        // データの保存を順番に実行
        await saveStudySession();
        saveData();
        form.submit();
    } catch (error) {
        console.error('データの保存中にエラーが発生しました:', error);
        alert('データの保存中にエラーが発生しました。もう一度お試しください。');
    }
});

function saveData() {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];

    const timeString = localStorage.getItem('stopwatchTime') || '00:00:00';
    const parts = timeString.split(':');
    const elapsedSeconds = parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
    console.log("Saving to record:", timeString);

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

function showPhotoOptions() {
    document.getElementById("photoOptionsPopup").style.display = "block";
}

function showDeletePhotoPopup() {
    if(selectedFiles.length === 0) {
        alert("削除できる写真がありません");
    }else {
        const deletePhotoPopup = document.getElementById("deletePhotoPopup");
        const deletePhotoList = document.getElementById("deletePhotoList");
        deletePhotoList.innerHTML = ""; // 以前の内容をクリア

        selectedFiles.forEach((photo, index) => {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(photo);
            img.classList.add('photo_img');

            img.onclick = function() {
                const photoIndex = allPhotos.indexOf(photo);

                if (photoIndex !== -1) {
                    // 既にallPhotosに含まれている場合、選択を解除
                    allPhotos.splice(photoIndex, 1);
                    img.style.opacity = '1.0';
                } else {
                    // allPhotosに含まれていない場合、選択を追加
                    allPhotos.push(photo);
                    img.style.opacity = '0.5';
                }
            };

            deletePhotoList.appendChild(img); // 画像をリストに追加
        });

        deletePhotoPopup.style.display = "block"; // ポップアップを表示
    }
}

function hidePhotoOptionsPopup() {
    document.getElementById("photoOptionsPopup").style.display = "none";
}

function hideDeletePhotoPopup() {
    document.getElementById("deletePhotoPopup").style.display = "none";
}
let selectedFiles = []; // 選択された画像を管理する配列
let inputCount = 0; // 作成されたinputタグの数を管理する変数

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
            console.log('ファイルが選択されていません');
            return;
        }

        const files = Array.from(event.target.files);
        
        // ファイルの圧縮と処理
        const processedFiles = await Promise.all(files.map(async file => {
            // 画像ファイルの検証
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/PNG', 'image/JPG', 'image/JPEG'];
            if (!validTypes.includes(file.type) || file.size === 0) {
                console.log(`不正なファイル: ${file.name}`);
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
            alert('有効な画像ファイルが処理できませんでした');
            return;
        }

        // 重複チェックと追加
        const newFiles = validFiles.filter(file => 
            !selectedFiles.some(existingFile => existingFile.name === file.name)
        );
        
        if (newFiles.length > 0) {
            selectedFiles.push(...newFiles);
            displayPhoto(newFiles);
            console.log(`${newFiles.length}個の新しいファイルが追加されました`);
        }

        hidePhotoOptionsPopup();
    };

    form.insertBefore(input, submitButton);
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

            console.log('ファイル名:', file.name); // コンソールにファイル名を表示
            console.log('inputのdata-image-name属性:', input.getAttribute('data-image-name')); // data-image-name属性からファイル名を取得
        });

        // 重複を避けて新しく選ばれたファイルのみを追加
        const newFiles = files.filter(file => 
            !selectedFiles.some(existingFile => existingFile.name === file.name)
        );
        selectedFiles.push(...newFiles); // 新しいファイルをselectedFilesに追加

        displayPhoto(newFiles); // 新しく選ばれたファイルのみを表示
        hidePhotoOptionsPopup(); // オプションのポップアップを非表示（未定義の関数）
        // document.body.removeChild(input); // DOMからinputを削除（任意）
    };

    input.click(); // ファイル選択ダイアログを表示
}

// 画像を表示する
function displayPhoto(files) {
    const photoDisplay = document.getElementById('photoDisplay_id'); // 画像を表示する場所

    files.forEach(file => {
        const reader = new FileReader(); // ファイルを読み込むためのFileReader
        reader.onload = function(e) {
            const img = document.createElement('img'); // 新しい画像要素を作成
            img.src = e.target.result; // 画像データをセット
            img.classList.add('photo_img'); // クラスを追加
            photoDisplay.appendChild(img); // 画像を表示する場所に追加
        };
        reader.readAsDataURL(file); // 画像ファイルを読み込む
    });

    console.log("表示している写真:", files); // デバッグ用: 表示される写真
}

function deleteSelectedPhotos() {
    // 選択された画像を allPhotos から削除
    selectedFiles = selectedFiles.filter(photo => !allPhotos.includes(photo));
    const imageForm = document.getElementById('imageForm');
    const inputs = imageForm.querySelectorAll('input[data-image-name]'); // imageFormないの全てのinputタグを取得
    // 選択された写真のinputタグを削除
    inputs.forEach(input => {
        const imageName = input.getAttribute('data-image-name'); // data-image-name属性からファイル名を取得
        if (allPhotos.some(file => file.name === imageName)) {
            input.remove(); // inputタグを削除
        }
    });
    allPhotos = []; // 選択された画像をリセット
    hideDeletePhotoPopup(); // ポップアップを隠す
    updatePhotoDisplay(); // 表示を更新
}

function updatePhotoDisplay() {
    const photoDisplay = document.getElementById('photoDisplay_id');
    photoDisplay.innerHTML = ''; // 以前の内容をクリア

    selectedFiles.forEach(photo => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.classList.add('photo_img')
            photoDisplay.appendChild(img);
        };
        reader.readAsDataURL(photo); //既存の写真も表示
    });
}