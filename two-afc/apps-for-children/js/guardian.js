// 設定ボタン
document.getElementById("setting").addEventListener("click", showSPopup);
// 閉じるボタン
document.getElementById("closeSetting").addEventListener("click", hideSPopup);
// ログアウトボタン
document.querySelector(".logout").addEventListener("click", function() {
    window.location.href = 'php/logout.php';
});

const chartContext = document.getElementById('studyChart').getContext('2d');
let chartInstance;


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

function createChart(labelUnit) {
    // Fetchデータの取得
    console.log("Fetching data for:", labelUnit);

    fetch(`../../php/guardian.php?unit=${encodeURIComponent(labelUnit)}`, {
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
    .then(data => {
        if (data.error) {
            console.error('Error from server:', data.error);
            return;
        }

        if (!data.labels || !data.values) {
            console.error('Invalid data format received:', data);
            return;
        }
        
        console.log(data);
        console.log("encodeURIComponent(labelUnit)", encodeURIComponent('week'));

        // データのチェックと変換
        let labels = data.labels.map(label => new Date(label)); // 日時ラベルをDate形式に変換
        console.log("labels", labels);
        /*
        0:Fri Feb 07 2025 14:26:34 GMT+0900 (日本標準時) {}
        1:Sun Feb 09 2025 17:09:31 GMT+0900 (日本標準時) {}
        2:Sun Feb 09 2025 17:15:45 GMT+0900 (日本標準時) {}
        3:Sun Feb 09 2025 17:24:38 GMT+0900 (日本標準時) {}
        4:Sun Feb 09 2025 17:31:09 GMT+0900 (日本標準時) {}
        5:Sun Feb 09 2025 17:37:10 GMT+0900 (日本標準時) {}
        6:Sun Feb 09 2025 17:37:10 GMT+0900 (日本標準時) {}
        7:Sun Feb 09 2025 18:22:23 GMT+0900 (日本標準時) {}
        8:Sun Feb 09 2025 18:55:40 GMT+0900 (日本標準時) {}
        9:Mon Feb 10 2025 13:34:53 GMT+0900 (日本標準時) {}
        10:Tue Feb 11 2025 10:59:34 GMT+0900 (日本標準時) {}
        11:Tue Feb 11 2025 10:59:35 GMT+0900 (日本標準時) {}
        12:Tue Feb 11 2025 10:59:35 GMT+0900 (日本標準時) {}
        length: 13
        */
        console.log("labelUnit", labelUnit);
        const values = data.values.map(value => {
            const numericValue = parseFloat(value);
            return isNaN(numericValue) ? 0 : numericValue;
        });

        if (labelUnit === 'week') {
            labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        } else if (labelUnit === 'month') {
            labels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];
        } else if (labelUnit === 'year') {
            labels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
        }

        const FontSize = 30;
        // チャートの設定
        const chartData = {
            labels: labels,
            datasets: [
                {
                    label: '勉強時間(時間)',
                    data: [2, 3.5, 4, 2.5, 5, 6, 3],
                    backgroundColor: '#4870BD',
                    borderColor: '#4870BD',
                    borderWidth: 1
                }
            ]
        };

        const config = {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '時間',
                            font: {
                                size: window.innerWidth * 0.03 // y軸のタイトルのフォントサイズをvwで設定
                            }
                        },
                        ticks: {
                            font: {
                                size: window.innerWidth * 0.03
                            }
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: window.innerWidth * 0.03,
                                style: 'normal' // イタリック体を解除
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                size: window.innerWidth * 0.03 // datasets のラベルのフォントサイズ
                            }
                        }
                    }
                }
            }
        };

        // 既存のチャートがあれば破棄して新しいチャートを描画
        if (chartInstance) {
            chartInstance.destroy();
        }
        chartInstance = new Chart(chartContext, config);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
}

// DOMContentLoaded イベントでボタンのクリックイベントを設定
document.addEventListener('DOMContentLoaded', () => {
    // 期間ボタンのイベント設定
    const weekButton = document.querySelector('.side_unit_week');
    const monthButton = document.querySelector('.side_unit_month');
    const yearButton = document.querySelector('.side_unit_year');

    console.log("weekButton", weekButton);
    console.log("monthButton", monthButton);
    console.log("yearButton", yearButton);

    if (weekButton) weekButton.addEventListener('click', () => createChart('week'));
    if (monthButton) monthButton.addEventListener('click', () => createChart('month'));
    if (yearButton) yearButton.addEventListener('click', () => createChart('year'));

    // 初期グラフを週単位で表示
    createChart('week');
});