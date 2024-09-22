function capturePhoto() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = 'enviroment'; // 環境カメラ
  input.onchange = function(event) {
    const file = event.target.files;
    displayPhoto(file);
  };
  input.click();
}

function selectPhoto() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = true; // 複数選択可
  input.onchange = function(event) {
    const file = event.target.files;
    displayPhoto(file);
  };
  input.click();
}

function displayPhoto(files) {
  const photoDisplay = document.getElementById('photoDisplay_id'); // IDを修正
  photoDisplay.innerHTML = '';
  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.style.maxWidth = '100%'; // 画像サイズの制限
      img.style.margin = '5px';
      photoDisplay.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}
