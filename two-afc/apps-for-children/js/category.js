let isPopupVisible = false;

function showPopup() {
    document.getElementById("overlay").style.display = "block";
    document.getElementById("popup").classList.add("active");
    isPopupVisible = true;
    showSection('addSection'); // 最初に追加フォームを表示

    // フォームの入力をリセット
    document.getElementById("addOptionName").value = "";
    document.getElementById("editOptionName").value = "";
}

// overlayクリック時の動作を無効
window.onclick = function(event) {
    const overlay = document.getElementById("overlay");
    if (overlay) {
        overlay.addEventListener("click", function(event) {
            if (isPopupVisible) {
                event.stopPropagation(); // 何もしない
                return;
            } else {
                hidePopup();
            }
        });
    }
};

function hidePopup() {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("popup").classList.remove("active");
    document.querySelectorAll('.form-section').forEach(section => section.classList.remove("active"));
    resetButtonColor(); // ボタンの色をリセット
    isPopupVisible = false;
}

function showSection(sectionId) {
    document.querySelectorAll('.form-section').forEach(section => section.classList.remove("active"));
    document.getElementById(sectionId).classList.add("active");
    updateButtonColor(sectionId); // ボタンの色を更新

    // ポップアップのサイズを調整
    const popup = document.getElementById("popup");
    if (sectionId === 'addSection') {
        popup.style.height = '30vh';
    } else if (sectionId === 'editSection') {
        popup.style.height = '45vh';
    } else if (sectionId === 'deleteSection') {
        popup.style.height = '30vh';
    }
}

// ボタンの色をセクションに合わせて更新する関数
function updateButtonColor(activeSectionId) {
    const buttons = document.querySelectorAll('.tab button');
    buttons.forEach(button => {
        button.style.color = 'black';
    });
    if (activeSectionId === 'addSection') {
        buttons[0].style.color = 'blue';
    } else if (activeSectionId === 'editSection') {
        buttons[1].style.color = 'blue';
    } else if (activeSectionId === 'deleteSection') {
        buttons[2].style.color = 'blue';
    }
}

// ボタンの色をリセット
function resetButtonColor() {
    const buttons = document.querySelectorAll('.tab button');
    buttons.forEach(button => {
        button.style.color = 'black';
    });
}

function addOption() {
    const optionName = document.getElementById('addOptionName').value;

    if (!optionName) {
        alert("教科名を入力してください。");
        return;
    }

    fetch('../../php/category/add_category.php', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `category_name=${encodeURIComponent(optionName)}`
    })
    .then(response => {
        console.log('Response Status:', response.status); // ステータスコードを表示
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text(); // レスポンスをテキスト形式で表示
    })
    .then(text => {
        console.log('Raw Response:', text); // サーバーからのレスポンスを確認
        return JSON.parse(text); // 必要ならJSONに変換
    })
    .then(data => {
        if (data.status === "success") {
            alert("カテゴリーが追加されました。");
            hidePopup();
            loadCategories();
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error('Error adding category:', error));
}

function editOption() {
  const oldOptionName = document.getElementById('editOptionSelect').value;
  const newOptionName = document.getElementById('editOptionName').value;


  if (!oldOptionName || !newOptionName) {
      alert("変更する教科名を選択し、新しい教科名を入力してください。");
      return;
  }

  fetch('../../php/category/edit_category.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `old_category_name=${encodeURIComponent(oldOptionName)}&new_category_name=${encodeURIComponent(newOptionName)}`
  })
  .then(response => {
      console.log('Response Status:', response.status); // ステータスコードを表示
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.text(); // レスポンスをJSONとして取得
  })
  .then(text => {
    console.log('Raw Response:', text); // サーバーからのレスポンスを確認
    return JSON.parse(text);
  })
  .then(data => {
      console.log('Response Data:', data); // レスポンス内容を表示
      if (data.status === "success") {
          alert("カテゴリーが変更されました。");
          hidePopup();
          loadCategories(); // カテゴリー一覧を更新
      } else {
          alert(data.message); // エラーメッセージを表示
      }
  })
  .catch(error => {
      console.error('Error editing category:', error);
  });
}
function deleteOption() {
    const optionToDelete = document.getElementById('deleteOptionSelect').value;
    const username = document.getElementById('username').value;

    if (!optionToDelete) {
        alert("削除する教科名を選択してください。");
        return;
    }

    fetch('../../php/category/delete_category.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `category_name=${encodeURIComponent(optionToDelete)}&username=${encodeURIComponent(username)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            alert("カテゴリーが削除されました。");
            hidePopup();
            loadCategories(); // カテゴリーを再読み込み
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error('Error deleting category:', error));
}

function loadCategories() {
  fetch('../../php/category/get_category.php', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(categoryData => {
      const currentPage = window.location.pathname;

      if (currentPage.includes("record_note.html")) {
        const noteSection = document.getElementById("noteSection");
        if (!noteSection) return;

        noteSection.innerHTML = "";

        categoryData.forEach(item => {
          const imageElement = document.createElement('div');
          imageElement.classList.add('image-container');

          // 画像を表示
          const img = document.createElement('img');
          img.src = '../../ui_image/file_close.png';
          img.alt = `${item.category_name}の画像`;
          img.classList.add('category-image', item.category_name);

          // 画像クリックイベント
          img.addEventListener('click', () => {
            const clickedClassName = item.category_name;
            const imageClassName = img.classList.contains(clickedClassName);

            if (imageClassName) {
              const closedImage = '../../ui_image/file_close.png';
              const openedImage = '../../ui_image/file_open.png';

              // 画像を切り替え
              img.src = img.src.includes('file_close.png') ? openedImage : closedImage;

              // ポップアップに画像を表示
              fetchStudyImages(clickedClassName);
            } else {
              console.log(`一致しない: ${clickedClassName} vs ${imageClassName}`);
            }
          });

          // カテゴリー名を表示
          const categoryName = document.createElement('span');
          categoryName.classList.add('category-name');
          categoryName.textContent = item.category_name;

          imageElement.appendChild(img);
          imageElement.appendChild(categoryName);
          noteSection.appendChild(imageElement);
        });
      }
    })
    .catch(error => console.error('Error loading categories:', error));
}

// study_data テーブルから画像を取得し、ポップアップに表示
function fetchStudyImages(categoryName) {

  console.log('Category Name:', categoryName);  // カテゴリ名が正しく渡されているか確認

  if (!categoryName) {
    console.error('Category name is missing');
    return;  // カテゴリ名がなければ処理を中止
  }

  fetch(`../../php/record/note.php?category=${encodeURIComponent(categoryName)}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.status);
      }
      const contentType = response.headers.get("Content-Type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Expected JSON response, but got " + contentType);
      }
      return response.json();
    })
    .then(data => {
      if (data.error) {
        throw new Error(data.error);
      }

      // ポップアップ内のコンテンツ
      const popupContent = document.getElementById("popupContent");
      const popupText = document.getElementById("popupText");

      popupText.textContent = `選択されたカテゴリー: ${categoryName}`;
      //popupContent.innerHTML = ''; // 既存のコンテンツをクリア

      // 画像がある場合
      if (data.images && data.images.length > 0) {
        data.images.forEach(base64EncodedUrl => {
          try {
            const decodedUrl = Base64.decode(base64EncodedUrl);
            const imagePath = decodedUrl.replace('/var/www/html', '');

            const img = document.createElement('img');
            img.src = imagePath;
            img.alt = 'Study Image';
            img.classList.add('popup-study-image');
            popupContent.appendChild(img);
          } catch (error) {
            console.error('Failed to decode Base64 URL:', error);
          }
        });
      } else if (data.message) {
        // messageフィールドがあった場合は画像がないとして処理
        popupText.innerHTML = `<p>${data.message}</p>`;
      }

      // ポップアップを表示
      document.getElementById("popupOverlay").style.display = "block";
      popupContent.style.display = "block";
    })
    .catch(error => {
      // エラーが発生した場合は、エラーメッセージを表示
      console.error('Error fetching study images:', error);
      const popupContent = document.getElementById("popupContent");
      popupContent.innerHTML = '<p>画像の読み込み中にエラーが発生しました。</p>';
      document.getElementById("popupOverlay").style.display = "block";
      popupContent.style.display = "block";
    });
}

// ポップアップを非表示にし、画像をリセット
function hidePopup_category() {
  document.getElementById("popupOverlay").style.display = "none";
  document.getElementById("popupContent").style.display = "none";

  // 画像のみを削除
  const popupContent = document.getElementById("popupContent");
  const images_remove = popupContent.querySelectorAll('img');
  images_remove.forEach(img => {
    img.remove();  // imgタグを削除
  });

  const images = document.querySelectorAll('.category-image');
  images.forEach(img => {
    if (img.src.includes('file_open.png')) {
      img.src = '../../ui_image/file_close.png';
    }
  });
}

// ページが読み込まれたときにカテゴリーを読み込む
window.onload = function () {
  loadCategories();
};
document.addEventListener('DOMContentLoaded', function () {
  loadCategories();
});