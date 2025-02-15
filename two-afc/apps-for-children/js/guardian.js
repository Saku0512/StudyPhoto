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

// 現在の表示期間を追跡するための変数
let currentDate = new Date();

// カテゴリーの色マッピングを保持するオブジェクト
let categoryColorMap = {};

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

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth() + 1;
const day = today.getDate();
console.log(`年: ${year}, 月: ${month}, 日: ${day}`);

function getWeekDates(date) {
    const currentDate = new Date(date);
    
    // 現在の日付が属する週の日曜日を計算
    const startOfWeek = currentDate.getDate() - currentDate.getDay(); // 日曜日の日付
    const sunday = new Date(currentDate.setDate(startOfWeek));
    
    // 現在の週の日曜日から土曜日までの日付を取得
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(sunday);
        day.setDate(sunday.getDate() + i);
        // 日付部分を取得してDD形式にする
        const dayOfMonth = day.getDate(); // 日部分だけを取得
        weekDates.push(dayOfMonth); // 日付だけを保存
    }

    return weekDates;
}

const weekDates = getWeekDates(new Date());
console.log(weekDates);

// 期間の表示テキストを更新する関数を修正
function updateSpanSelectText(unit) {
    const spanText = document.querySelector('.span_select_text');
    
    switch(unit) {
        case 'day':
            spanText.textContent = `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月${currentDate.getDate()}日`;
            break;
        case 'week':
            const weekStart = new Date(currentDate);
            weekStart.setDate(currentDate.getDate() - currentDate.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            spanText.textContent = `${weekStart.getMonth() + 1}月${weekStart.getDate()}日～${weekEnd.getMonth() + 1}月${weekEnd.getDate()}日`;
            break;
        case 'month':
            spanText.textContent = `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`;
            break;
        case 'year':
            spanText.textContent = `${currentDate.getFullYear()}年`;
            break;
    }
}

// 期間移動ボタンのイベントハンドラーを修正
document.querySelector('.span_select_left').addEventListener('click', () => {
    const unit = document.querySelector('.side_unit_day').classList.contains('active') ? 'day' :
                document.querySelector('.side_unit_week').classList.contains('active') ? 'week' :
                document.querySelector('.side_unit_month').classList.contains('active') ? 'month' : 'year';
    
    switch(unit) {
        case 'day':
            currentDate.setDate(currentDate.getDate() - 1);
            break;
        case 'week':
            currentDate.setDate(currentDate.getDate() - 7);
            break;
        case 'month':
            currentDate.setMonth(currentDate.getMonth() - 1);
            break;
        case 'year':
            currentDate.setFullYear(currentDate.getFullYear() - 1);
            break;
    }
    createTimeChart(unit);
    createCategoryChart(unit);
});

document.querySelector('.span_select_right').addEventListener('click', () => {
    const unit = document.querySelector('.side_unit_day').classList.contains('active') ? 'day' :
                document.querySelector('.side_unit_week').classList.contains('active') ? 'week' :
                document.querySelector('.side_unit_month').classList.contains('active') ? 'month' : 'year';
    
    switch(unit) {
        case 'day':
            currentDate.setDate(currentDate.getDate() + 1);
            break;
        case 'week':
            currentDate.setDate(currentDate.getDate() + 7);
            break;
        case 'month':
            currentDate.setMonth(currentDate.getMonth() + 1);
            break;
        case 'year':
            currentDate.setFullYear(currentDate.getFullYear() + 1);
            break;
    }
    createTimeChart(unit);
    createCategoryChart(unit);
});

function createTimeChart(labelUnit) {
    // アクティブなボタンのスタイルを更新
    document.querySelectorAll('.side_unit_button button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.side_unit_${labelUnit}`).classList.add('active');
    
    // 日付入力欄の制御
    const commentDateInput = document.getElementById('commentDate');
    if (labelUnit === 'day') {
        commentDateInput.value = formatDate(currentDate);
    } else {
        commentDateInput.value = 'yyyy-mm-dd';
    }
    
    // 期間表示テキストを更新
    updateSpanSelectText(labelUnit);

    // 週の開始日と終了日を取得する関数
    function getWeekRange(date) {
        const sunday = new Date(date);
        sunday.setDate(date.getDate() - date.getDay());
        const saturday = new Date(sunday);
        saturday.setDate(sunday.getDate() + 6);
        return {
            start: sunday,
            end: saturday
        };
    }

    // 日付をフォーマットする関数
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const weekRange = getWeekRange(currentDate);
    const apiUrl = `../../php/guardian_time.php?unit=${encodeURIComponent(labelUnit)}&date=${formatDate(currentDate)}`;

    fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Error from server:', data.error);
            return;
        }

        let labels;
        switch(labelUnit) {
            case 'day':
                // 日表示の場合は時間
                labels = Array.from({length: 24}, (_, i) => `${i}時`);
                break;
            case 'week':
                // 週表示の場合は曜日
                labels = ['日', '月', '火', '水', '木', '金', '土'].map((day, i) => {
                    const date = new Date(weekRange.start);
                    date.setDate(date.getDate() + i);
                    return `${day}`;
                });
                break;
            case 'month':
                // 月表示の場合はその月の日数分の日付
                const daysInMonth = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1,
                    0
                ).getDate();
                labels = Array.from({length: daysInMonth}, (_, i) => `${i + 1}日`);
                break;
            case 'year':
                // 年表示の場合は月
                labels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
                break;
        }
        
        // データの整形
        const chartData = {
            labels: labels,
            datasets: [{
                label: '勉強時間(時間)',
                data: new Array(labels.length).fill(0),
                backgroundColor: '#4870BD',
                borderColor: '#4870BD',
                borderWidth: 1
            }]
        };

        // 時間文字列（HH:MM:SS）を時間数に変換する関数
        const timeToHours = timeStr => {
            const [hours, minutes, seconds] = timeStr.split(':').map(Number);
            return Number(((hours + minutes / 60 + seconds / 3600)).toFixed(2));
        };

        // データの設定
        if (data.values && Array.isArray(data.values)) {
            data.values.forEach(record => {
                const index = record.index;
                const hours = timeToHours(record.study_time);
                chartData.datasets[0].data[index] = hours;
            });
        }

        // グラフの設定
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
                            text: '時間(h)',
                            font: {
                                size: window.innerWidth * 0.03
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
                                size: window.innerWidth * 0.03
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                size: window.innerWidth * 0.03
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const hours = context.raw;
                                const hoursInt = Math.floor(hours);
                                const minutes = Math.round((hours - hoursInt) * 60);
                                return `${hoursInt}時間${minutes}分`;
                            }
                        }
                    }
                }
            }
        };

        if (chartInstance) {
            chartInstance.destroy();
        }
        chartInstance = new Chart(chartContext, config);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
}

// カテゴリーチャートのコンテキストを取得
const categoryChartContext = document.getElementById('categoryChart').getContext('2d');
let categoryChartInstance;

// 日付をフォーマットする関数
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// HSLカラーを使用して動的に色を生成する関数
function generateColors(categories) {
    categories.forEach((category, index) => {
        if (!categoryColorMap[category]) {
            // 新しいカテゴリーの場合のみ色を生成
            const hue = (index * (360 / categories.length)) % 360;
            categoryColorMap[category] = `hsl(${hue}, 70%, 60%)`;
        }
    });
    
    // カテゴリーに対応する色の配列を返す
    return categories.map(category => categoryColorMap[category]);
}

function createCategoryChart(unit = 'week') {
    const apiUrl = `../../php/guardian_category.php?unit=${encodeURIComponent(unit)}&date=${formatDate(currentDate)}`;

    const spanText = document.querySelector('.span_select_text').textContent;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error:', data.error);
                return;
            }

            // 時間文字列を時間数に変換（より小さな値も保持）
            const timeToHours = timeStr => {
                const [hours, minutes, seconds] = timeStr.split(':').map(Number);
                const totalHours = hours + minutes / 60 + seconds / 3600;
                // 0.01時間（36秒）未満の場合は0.01として表示
                return totalHours < 0.01 ? 0.01 : Number(totalHours.toFixed(2));
            };

            // 時間を「○h」形式にフォーマットする関数
            const formatTime = (timeInHours) => {
                return `${timeInHours}h`;
            };

            const categories = data.categories.map(item => item.category_name);
            const times = data.categories.map(item => timeToHours(item.total_time));
            
            // カテゴリー名と時間を組み合わせたラベルを作成
            const labels = categories.map((category, index) => 
                `${category}:${formatTime(times[index])}`
            );
            
            const colors = generateColors(categories);

            const config = {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: times,
                        backgroundColor: colors,
                        borderColor: colors.map(color => color.replace('60%', '50%')),
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,  // アスペクト比を固定しない
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: {
                                font: {
                                    size: window.innerWidth * 0.02
                                }
                            }
                        },
                        title: {
                            display: true,
                            text: `${spanText}`,
                            font: {
                                size: window.innerWidth * 0.03
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `${context.label}`;
                                }
                            }
                        }
                    }
                }
            };

            if (categoryChartInstance) {
                categoryChartInstance.destroy();
            }
            categoryChartInstance = new Chart(categoryChartContext, config);
        })
        .catch(error => {
            console.error('Error fetching category data:', error);
        });
}

// DOMContentLoadedイベントハンドラーを修正
document.addEventListener('DOMContentLoaded', () => {
    const dayButton = document.querySelector('.side_unit_day');
    const weekButton = document.querySelector('.side_unit_week');
    const monthButton = document.querySelector('.side_unit_month');
    const yearButton = document.querySelector('.side_unit_year');

    if (dayButton) dayButton.addEventListener('click', () => {
        createTimeChart('day');
        createCategoryChart('day');
    });
    if (weekButton) weekButton.addEventListener('click', () => {
        createTimeChart('week');
        createCategoryChart('week');
    });
    if (monthButton) monthButton.addEventListener('click', () => {
        createTimeChart('month');
        createCategoryChart('month');
    });
    if (yearButton) yearButton.addEventListener('click', () => {
        createTimeChart('year');
        createCategoryChart('year');
    });

    // 日付入力欄の変更イベントを追加
    const commentDateInput = document.getElementById('commentDate');
    commentDateInput.addEventListener('change', (e) => {
        currentDate = new Date(e.target.value);
        // 日ボタンをアクティブにしてグラフを更新
        createTimeChart('day');
        createCategoryChart('day');
    });

    // 初期表示
    createTimeChart('week');
    createCategoryChart('week');
});