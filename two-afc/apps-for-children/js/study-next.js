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

  // 選択された画像のファイルオブジェクトを取得
  const selectedImages = Array.from(document.querySelectorAll('input[type="file"][name="images[]"]')).flatMap(input => Array.from(input.files));

  // 画像が選択されているか確認
  if (selectedImages.length === 0) {
    console.error("No images selected.");
    alert("画像が選択されていません。");
    return; // 画像がない場合は処理を中断
  }

  // 送信するデータを準備
  const formData = new FormData();
  formData.append('category', category);
  formData.append('study_time', studyTime);

  // 選択された画像をFormDataに追加
  selectedImages.forEach((image) => {
      formData.append('images[]', image);
  });

  // 送信するデータをコンソールに表示（デバッグ用）
  console.log("Sending category:", category);
  console.log("Sending study time:", studyTime);
  console.log("Sending images:", selectedImages);

  // データをサーバーに送信
  fetch('../../php/save_study_data.php', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())  // サーバーからのレスポンスがJSONであることを確認
  .then(data => {
    if (data.success) {
        console.log("Data saved successfully:", data);
        //alert("データが正常に保存されました。");
    } else {
        console.error("Error saving data:", data.error);
        alert("エラーが発生しました: " + data.error);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert("通信エラーが発生しました。");
  });
}
document.getElementById('saveButton').addEventListener('click', (event) => {
  event.preventDefault();
  console.log("Save button clicked");

  const categorySelect = document.getElementById("category");
  const selectedCategory = categorySelect.value;

  const photoDisplay = document.getElementById("photoDisplay_id");
  const photoSelected = photoDisplay.innerHTML.trim() !== '';

  if (selectedCategory === "--教科を選択--" && !photoSelected) {
    alert("教科を選択してください。");
    return;
  }

  if (!photoSelected) {
    showConfirmPopup();
  } else {
    saveData(); // 必要に応じてリダイレクトをここでも行う
    saveStudySession();
    alert("データが保存されました。");
  }
});

document.getElementById("confirm-save").addEventListener("click", () => {
  hideConfirmPopup();
  saveData();
  saveStudySession();
  alert("データが保存されました。");
});

function showConfirmPopup() {
  document.getElementById("confirm-overlay").style.display = "block";
  document.getElementById("confirm-popup").style.display = "block";
}

function hideConfirmPopup() {
  document.getElementById("confirm-overlay").style.display = "none";
  document.getElementById("confirm-popup").style.display = "none";
}

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
      img.classList.add('photo_img')

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

function capturePhoto() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = 'enviroment'; // 環境カメラ
  input.onchange = function(event) {
    const files = event.target.files;
    updatePhotoList(files);
    hidePhotoOptionsPopup();
  };
  input.click();
}

function selectPhoto() {
  const input = document.getElementById('fileInput'); // 追加したinputタグを取得 // inputをクリックしてファイル選択ダイアログを表示
    input.onchange = function(event) {
        const files = event.target.files; // 選択されたファイルを取得
        updatePhotoList(files); // 画像リストを更新
        hidePhotoOptionsPopup(); // ポップアップを隠す
    };
    input.click();
}

function updatePhotoList(files) {
  // 新しいファイルを既存のファイルリストに追加
  allPhotos = [...allPhotos, ...Array.from(files)];
  displayPhoto(Array.from(files)); // 全ての写真を表示
}

function displayPhoto(files) {
  const photoDisplay = document.getElementById('photoDisplay_id'); // IDを修正
  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.classList.add('photo_img')
      photoDisplay.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
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