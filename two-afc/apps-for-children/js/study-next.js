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
    const category = document.getElementById("category").value;
    const studyTime = document.getElementById("timer-display").textContent;

    // ファイル選択の input 要素を取得
    const fileInputs = document.querySelectorAll('input[type="file"][name="images[]"]');
    console.log(fileInputs);  // デバッグ用
    
    // すべてのファイルを取得
    const selectedImages = Array.from(fileInputs).flatMap(input => Array.from(input.files));
    console.log(selectedImages);  // デバッグ用
    console.log(selectedImages.length);  // デバッグ用

    // 画像が選択されているか確認
    if (selectedImages.length === 0) {
        console.error("No images selected.");
        alert("画像が選択されていません。");
        return; // 画像がない場合は処理を中断
    }

    // localStorageから経過時間を取得
    const elapsedPeriod = localStorage.getItem('elapsedTime');
    
    // 経過時間がnullまたは空であればデフォルト値を設定
    const formattedElapsedTime = elapsedPeriod ? elapsedPeriod.replace(/[\[\]"]+/g, '') : 'no_elapsed_time';

    console.log("経過時間:", formattedElapsedTime);  // デバッグ用

    // 送信するデータを準備
    const formData = new FormData();
    formData.append('category', category);
    formData.append('study_time', studyTime);
    formData.append('SspentTime', formattedElapsedTime);  // 経過時間を送信

    // 選択された画像をFormDataに追加
    selectedImages.forEach((image) => {
        formData.append('images[]', image, image.name);
    });

    // データを送信する前にFormDataの内容を確認（デバッグ用）
    for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);  // 送信されるデータを表示
    }

    // データをサーバーに送信
    fetch('../../php/save_study_data.php', {
        method: 'POST',
        body: formData
    })
    .then(Response => {
        if(!Response.ok) {
            return Response.text().then(text => {throw new Error(text)});
        }
        return Response.json();
    })
    .then(data => {
        console.log(data);  // デバッグ用
        if (data.success) {
            alert("データが正常に保存されました。");
        } else {
            alert("エラーが発生しました: " + data.error);
        }
    })
    .catch(error => {
        console.error("通信エラーが発生しました:", error.message);
        alert("通信エラーが発生しました: " + error.message);
    });
}

document.getElementById('saveButton').addEventListener('click', (event) => {
    event.preventDefault();
    const categorySelect = document.getElementById("category");
    const selectedCategory = categorySelect.value;

    const photoDisplay = document.getElementById("photoDisplay_id");
    const photoSelected = photoDisplay.innerHTML.trim() !== '';

    if ((selectedCategory === "--教科を選択--" && !photoSelected) || selectedCategory === "0") {
        alert("教科を選択してください。");
        return;
    }

    if (!photoSelected) {
        alert("画像を選択してください。");
        return;
    } else {
        saveData(); // 必要に応じてリダイレクトをここでも行う
        saveStudySession();
        alert("データが保存されました。");
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

    //window.location.href = '../../home.php'; // ここでもリダイレクト
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
    if(allPhotos.length === 0) {
        alert("削除できる写真がありません");
    }else {
        const deletePhotoPopup = document.getElementById("deletePhotoPopup");
        const deletePhotoList = document.getElementById("deletePhotoList");
        deletePhotoList.innerHTML = ""; // 以前の内容をクリア
        selectedPhotos = []; // 選択状態をリセット

        allPhotos.forEach((photo, index) => {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(photo);
            img.classList.add('photo_img');

            img.onclick = function() {
                // 画像がクリックされたときの処理
                const isSelected = selectedPhotos.includes(index);
                if (isSelected) {
                    // 既に選択されている場合、選択を解除
                    selectedPhotos = selectedPhotos.filter(photoIndex => photoIndex !== index);
                    img.style.opacity = '1'; // 元の不透明度に戻す
                } else {
                    // 選択されていない場合、選択する
                    selectedPhotos.push(index);
                    img.style.opacity = '0.5'; // 選択状態を示すために不透明度を下げる
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

function capturePhoto() {
    const form = document.getElementById('imageForm'); // formタグを取得
    const input = document.createElement('input'); // 新しいinputタグを作成
    input.type = 'file';
    input.accept = 'image/*'; // 画像のみ選択
    input.multiple = true; // 複数選択可能
    input.capture = 'environment'; // 環境カメラ
    input.name = 'images[]'; // name属性にimages[]を指定
    input.style = 'display: none'; // 非表示にする
    input.id = `input_${inputCount++}`; // 一意のIDを付与
    form.appendChild(input); // formにinputを追加

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

// 画像を選択するボタンが押されたときの処理
function selectPhoto() {
    const form = document.getElementById('imageForm'); // formタグを取得
    const input = document.createElement('input'); // 新しいinputタグを作成
    input.type = 'file';
    input.accept = 'image/*'; // 画像のみ選択
    input.multiple = true; // 複数選択可能
    input.name = 'images[]'; // name属性にimages[]を指定
    input.style = 'display: none'; // 非表示にする
    input.id = `input_${inputCount++}`; // 一意のIDを付与
    form.appendChild(input); // formにinputを追加

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
    // 選択された画像を削除
    allPhotos = allPhotos.filter((_, index) => !selectedPhotos.includes(index));
    selectedPhotos = []; // 選択状態をリセット
    hideDeletePhotoPopup(); // ポップアップを隠す
    updatePhotoDisplay(); // 表示を更新
}

function updatePhotoDisplay() {
    const photoDisplay = document.getElementById('photoDisplay_id');
    photoDisplay.innerHTML = ''; // 以前の内容をクリア

    allPhotos.forEach(photo => {
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