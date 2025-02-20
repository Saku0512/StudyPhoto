let isPopupVisible = false;

// 教科を編集
document.querySelector(".newSubject").addEventListener('click', showPopup);
// オーバーレイ
document.getElementById('overlay').addEventListener('click', hidePopup);
// 追加ボタン
document.getElementById('addSection').addEventListener('click', () => showSection('addSection'));
// 変更ボタン
document.getElementById('editSection').addEventListener('click', () => showSection('editSection'));
// 削除ボタン
document.getElementById('deleteSection').addEventListener('click', () => showSection('deleteSection'));
// キャンセルボタン
document.querySelectorAll(".cancel").forEach(cancel => cancel.addEventListener('click', hidePopup));
// 追加ボタン
document.querySelector(".addSubject").addEventListener('click', addOption);
// 変更ボタン
document.querySelector(".editSubject").addEventListener('click', editOption);
// 削除ボタン
document.querySelector(".deleteSubject").addEventListener('click', deleteOption);

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
    if (sectionId === 'addSection') {
        document.querySelector('.add-popup').classList.add("active");
    } else if (sectionId === 'editSection') {
        document.querySelector('.edit-popup').classList.add("active");
    } else if (sectionId === 'deleteSection') {
        document.querySelector('.delete-popup').classList.add("active");
    }
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

    // 文字数チェックを追加
    if (optionName.length > 6) {
        alert("教科名は全角6文字以内で入力してください。");
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
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text(); // レスポンスをテキスト形式で表示
    })
    .then(text => {
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

    // 文字数チェックを追加
    if (newOptionName.length > 6) {
        alert("教科名は全角6文字以内で入力してください。");
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
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text(); // レスポンスをJSONとして取得
    })
    .then(text => {
        return JSON.parse(text);
    })
    .then(data => {
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
        // Ensure categoryData is an array
        if (Array.isArray(categoryData)) {
            const currentPage = window.location.pathname;

            if (currentPage.includes("record_note.php")) {
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
                            console.error(`一致しない: ${clickedClassName} vs ${imageClassName}`);
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
            } else {
                const categorySelect = document.getElementById("category");
                const editcategorySelect = document.getElementById("editOptionSelect");
                const deletecategorySelect = document.getElementById("deleteOptionSelect");
                categorySelect.innerHTML = '<option value="0">--教科を選択--</option>';
                editcategorySelect.innerHTML = '<option value="0">--変更する教科を選択--</option>';
                deletecategorySelect.innerHTML = '<option value="0">--削除する教科を選択--</option>';

                // Ensure categoryData is an array before using .forEach()
                categoryData.forEach(item => {
                    const option = document.createElement("option");
                    option.textContent = item.category_name;
                    categorySelect.appendChild(option);
                });

                categoryData.forEach(item => {
                    const option = document.createElement("option");
                    option.textContent = item.category_name;
                    editcategorySelect.appendChild(option);
                });

                categoryData.forEach(item => {
                    const option = document.createElement("option");
                    option.textContent = item.category_name;
                    deletecategorySelect.appendChild(option);
                });
            }
        } else {
            console.error('Invalid category data received:', categoryData);
        }
    })
    .catch(error => console.error('Error loading categories:', error));
}

// study_data テーブルから画像を取得し、ポップアップに表示
function fetchStudyImages(categoryName) {
    if (!categoryName) {
        console.error('Category name is missing');
        return;
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

        const popupContent = document.getElementById("popupContent");
        const popupText = document.getElementById("popupText");

        if (!popupContent || !popupText) {
            console.error("Popup elements not found.");
            return;
        }

        popupText.innerHTML = '';
        popupText.textContent = `選択されたカテゴリー: ${categoryName}`;

        if (data.images && data.images.length > 0) {
            // データを日付で降順にソート
            data.images.sort((a, b) => {
                const dateA = new Date(a.study_date);
                const dateB = new Date(b.study_date);
                return dateB - dateA; // 降順にするために B - A を使用
            });

            const table = document.createElement('table');
            const tableHeader = document.createElement('thead');
            const tableBody = document.createElement('tbody');

            const headerRow = document.createElement('tr');
            const headers = [
                { id: 'study-date', text: '勉強日' },
                { id: 'study-time', text: '勉強時間' },
                { id: 'category', text: 'カテゴリー' },
                { id: 'image-link', text: '画像リンク' }
            ];

            headers.forEach(header => {
                const th = document.createElement('th');
                th.id = header.id;
                th.textContent = header.text;
                headerRow.appendChild(th);
            });
            tableHeader.appendChild(headerRow);
            table.appendChild(tableHeader);

            data.images.forEach(imageData => {
                const row = document.createElement('tr');
        
                // 勉強日
                const studyDateCell = document.createElement('td');
                const studyDate = new Date(imageData.study_date); // Dateオブジェクトに変換
                const formattedDate = studyDate.toLocaleDateString('ja-JP'); // 'yyyy/MM/dd'形式で取得
                // SspentTimeが文字列の場合、コンマで分割して改行を挿入
                let formattedSpendTime = imageData.SspentTime;
                if (typeof formattedSpendTime === 'string') {
                    // コンマで分割し、それぞれの要素を改行で区切る
                    formattedSpendTime = formattedSpendTime.split(',').join(',<br>');
                } else if (Array.isArray(formattedSpendTime)) {
                    // すでに配列の場合はそのまま改行を挿入
                    formattedSpendTime = formattedSpendTime.join('<br>');
                }

                studyDateCell.innerHTML = formattedDate + '<br>' + formattedSpendTime; // 日付と改行された時間帯を表示
                row.appendChild(studyDateCell);

                // 勉強時間
                const studyTimeCell = document.createElement('td');
                studyTimeCell.textContent = imageData.study_time;
                row.appendChild(studyTimeCell);

                // カテゴリー
                const categoryCell = document.createElement('td');
                categoryCell.textContent = imageData.category;
                row.appendChild(categoryCell);
        
                // 画像リンク
                const pdfLinkCell = document.createElement('td');
                const pdfLink = document.createElement('a');
        
                // Base64デコードしてパスを取得
                if (imageData.image_path) {
                    try {
                        const decodedUrl = Base64.decode(imageData.image_path);  // Base64デコード
                        const imagePath = decodedUrl.replace('/var/www/html', '');  // パスの置換

        
                        pdfLink.textContent = 'PDFリンク';
                        pdfLink.href = imagePath;
                        //pdfLink.target = '_blank'; // 新しいタブで開く
        
                        // クリックイベントで画像をポップアップ表示
                        pdfLink.addEventListener('click', (event) => {
                            event.preventDefault();
                            openImageInPopup(imagePath);
                        });
        
                        pdfLinkCell.appendChild(pdfLink);
                    } catch (error) {
                        console.error('Failed to decode Base64 URL:', error);
                        pdfLinkCell.textContent = '画像の読み込みに失敗しました';
                    }
                } else {
                    pdfLinkCell.textContent = '画像なし';
                }
        
                row.appendChild(pdfLinkCell);
                tableBody.appendChild(row);
            });

            table.appendChild(tableBody);
            popupText.appendChild(table); // ここでpopupTextにテーブルを追加
        } else {
            popupText.innerHTML = '<p>画像が見つかりませんでした。</p>';
        }

        document.getElementById("popupOverlay").style.display = "block";
        popupContent.style.display = "block";
    })
    .catch(error => {
        console.error('Error fetching study images:', error);
        const popupContent = document.getElementById("popupContent");
        popupContent.innerHTML = '<p>画像の読み込み中にエラーが発生しました。</p>';
        document.getElementById("popupOverlay").style.display = "block";
        popupContent.style.display = "block";
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
});