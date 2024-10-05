let allPhotos = []; // すべての写真を格納する配列

window.onload = function() {
  allPhotos = []; // リロードされたら写真のデータを削除
}

function showPhotoOptions() {
  document.getElementById("photoOptionsPopup").style.display = "block";
}

function hidePhotoOptionsPopup() {
  document.getElementById("photoOptionsPopup").style.display = "none";
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