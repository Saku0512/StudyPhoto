document.addEventListener('DOMContentLoaded', () => {
    fetchStudyData();
});

function showSPopup() {
    document.getElementById("settingPanel").style.display = "block";
}
function hideSPopup() {
    document.getElementById("settingPanel").style.display = "none";

    // 各フィールドをの要素を取得
    const nameField = document.getElementById("userNameField");
    const idField = document.getElementById("userIdField");

    // ユーザー名、IDを「*」に戻す
    nameField.textContent = "*".repeat(nameField.dataset.username.length);
    idField.textContent = "*".repeat(idField.dataset.userid.length);

    // アイコンを非表示状態に戻す
    document.getElementById("toggleUserName").setAttribute("src", "./ui_image/close_eye.png");
    document.getElementById("toggleId").setAttribute("src", "./ui_image/close_eye.png");
}

document.getElementById("toggleUserName").addEventListener("click", function() {
    const imgElement = this;
    const usernameField = document.getElementById("userNameField");
    const currentSrc = imgElement.getAttribute("src");

    if (currentSrc === "./ui_image/close_eye.png") {
        imgElement.setAttribute("src", "ui_image/open_eye.png");
        usernameField.textContent = usernameField.dataset.username;
    } else {
        imgElement.setAttribute("src", "./ui_image/close_eye.png");
        usernameField.textContent = "*".repeat(usernameField.dataset.username.length);
    }
});

document.getElementById("toggleId").addEventListener("click", function() {
    const imgElement = this;
    const userIdField = document.getElementById("userIdField");
    const currentSrc = imgElement.getAttribute("src");

    if (currentSrc === "./ui_image/close_eye.png") {
        imgElement.setAttribute("src", "ui_image/open_eye.png");
        userIdField.textContent = userIdField.dataset.userid;
    } else {
        imgElement.setAttribute("src", "./ui_image/close_eye.png");
        userIdField.textContent = "*".repeat(userIdField.dataset.userid.length);
    }
});

function fetchStudyData() {
    try {
        fetch('./php/guardian.php')
        .then(response => {
            if(!response.ok){
                throw new Error('Network response was not ok');
            }
            const contentType = response.headers.get('content-type');
            if(!contentType || !contentType.includes('application/json')){
                throw new Error('Expected JSON response, but got " + contentType');
            }
            return response.json();
        })
        .then(data => {
            if(data.error){
                throw new Error(data.error);
            }

            const studyData = document.getElementById('studyData');
            if(!studyData){
                console.error('studyData element not found');
                return;
            }
            studyData.innerHTML = ''; // 中身を空にする
            if(data.images && data.images.length > 0){
                const table = document.createElement('table');
                const tableHeader = document.createElement('thead');
                const tableBody = document.createElement('tbody');

                const headerRow = document.createElement('tr');
                const headers = ['勉強日', '勉強時間', 'カテゴリー', '画像リンク'];
                headers.forEach(headerText => {
                    const th = document.createElement('th');
                    th.textContent = headerText;
                    headerRow.appendChild(th);
                });
                tableHeader.appendChild(headerRow);
                table.appendChild(tableHeader);

                data.images.forEach(imageData => {
                    const row = document.createElement('tr');

                    // 勉強日
                    const studyDataCell = document.createElement('td');
                    const studyDate = new Date(imageData.study_date);
                    const formattedDate = studyDate.toLocaleDateString('ja-JP');
                    let formattedSpendTime = imageData.SspentTime;
                    if(typeof formattedSpendTime === 'string'){
                        formattedSpendTime = formattedSpendTime.split(',').join(',<br>');
                    } else if(Array.isArray(formattedSpendTime)){
                        formattedSpendTime = formattedSpendTime.join('<br>');
                    }
                    studyDataCell.innerHTML = formattedDate + '<br>' + formattedSpendTime;
                    row.appendChild(studyDataCell);

                    // 勉強時間
                    const studyTimeCell = document.createElement('td');
                    studyTimeCell.textContent = imageData.study_time;
                    row.appendChild(studyTimeCell);

                    // カテゴリー
                    const categoryCell = document.createElement('td');
                    categoryCell.textContent = imageData.category;
                    row.appendChild(categoryCell);

                    // 画像リンク
                    const imageLinkCell = document.createElement('td');
                    const imageLink = document.createElement('a');

                    // base64デコードしてパスを表示
                    if(imageData.image_path){
                        try{
                            const decodedUrl = Base64.decode(imageData.image_path);
                            const imagePath = decodedUrl.replace('/var/www/html', '');
                            imageLink.textContent = '画像リンク';
                            imageLink.href = imagePath;

                            // クリックイベントで画像をポップアップ表示
                            imageLink.addEventListener('click', (event) => {
                                event.preventDefault();
                                openImageInPopup(imagePath);
                            });

                            imageLinkCell.appendChild(imageLink);
                        } catch(error){
                            console.error('Failed to decode image path:', error);
                            imageLinkCell.textContent = '画像のパスを取得できませんでした';
                        }
                    } else {
                        imageLinkCell.textContent = '画像なし';
                    }

                row.appendChild(imageLinkCell);
                    tableBody.appendChild(row);
                });
                table.appendChild(tableBody);
                studyData.appendChild(table);
            } else {
                studyData.innerHTML = '<p>データが見つかりませんでした。</p>';
            }
            //overlayとかpopupとかの処理を追加する予定
        })
        .catch(error => {
            console.error('Error fetching study data:', error);
            const studyData = document.getElementById('studyData');
            if(studyData){
                studyData.innerHTML = '<p style="color: red;">データの取得に失敗しました。</p>';
            }
        });
    } catch (error) {
        console.error('Error fetching study data:', error);
        const studyData = document.getElementById('studyData');
        if(studyData){
            studyData.innerHTML = '<p style="color: red;">データの取得に失敗しました。</p>';
        }
    }
}

// XSS対策のためのHTMLサニタイズ関数
function sanitizeHTML(str) {
    return str.replace(/[&<>"'`]/g, match => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '`': '&#x60;'
    }[match]));
}

// 画像をポップアップ表示する関数
function openImageInPopup(imagePath) {
    const popupImage = document.createElement('img');
    popupImage.src = imagePath;
    popupImage.alt = '画像';
    popupImage.classList.add('popup-image-large');

    const imagePopupContent = document.getElementById('imagePopupContent');
    const imagePopupOverlay = document.getElementById('imagePopupOverlay');
    imagePopupContent.appendChild(popupImage);

    imagePopupOverlay.style.display = 'block';
    imagePopupContent.style.display = 'block';
}

function hideImagePopup() {
    document.getElementById('imagePopupOverlay').style.display = 'none';
    document.getElementById('imagePopupContent').style.display = 'none';

    // 画像を削除
    const popupContent = document.getElementById('imagePopupContent');
    const images = popupContent.querySelectorAll('img');
    images.forEach(img => {
        img.remove();  // imgタグを削除
    });
}