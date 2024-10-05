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
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = true; // 複数選択可
  input.onchange = function(event) {
    const files = event.target.files;
    updatePhotoList(files);
    hidePhotoOptionsPopup();
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