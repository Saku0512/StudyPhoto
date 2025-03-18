// 設定ボタン
document.getElementById("setting").addEventListener("click", showSPopup);
// 閉じるボタン
document.getElementById("closeSetting").addEventListener("click", hideSPopup);
// ログアウトボタン
document.querySelector(".logout").addEventListener("click", function() {
    window.location.href = 'php/logout.php';
});

const language = document.getElementById("hidden_language").value;
// チェックボックスの要素を取得
const languageSwitch = document.getElementById("switch");
// チェックボックスにイベントリスナーを追加
languageSwitch.addEventListener("change", function() {
    // フォームを自動的に送信
    this.form.submit();
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
    ["userNameField", "userIdField"].forEach(id => {
        const f = document.getElementById(id);
        f.textContent = "*".repeat(f.dataset[id === "userNameField" ? "username" : "userid"].length);
    });
    ["toggleUserName", "toggleId"].forEach(id => document.getElementById(id).src = "./ui_image/close_eye.png");
}

["toggleUserName", "toggleId"].forEach(id => 
    document.getElementById(id).addEventListener("click", function() {
        const f = document.getElementById(id === "toggleUserName" ? "userNameField" : "userIdField");
        this.src = this.src.includes("close_eye") ? "ui_image/open_eye.png" : "./ui_image/close_eye.png";
        f.textContent = this.src.includes("open_eye") ? f.dataset[id === "toggleUserName" ? "username" : "userid"] : "*".repeat(f.dataset[id === "toggleUserName" ? "username" : "userid"].length);
    })
);

// 画像をポップアップ表示する関数
function openImageInPopup(imagePath) {
    const popupImage = Object.assign(document.createElement('img'), { 
        src: imagePath, alt: '画像', className: 'popup-image-large' 
    });
    document.getElementById('imagePopupContent').appendChild(popupImage);
    ['imagePopupOverlay', 'imagePopupContent'].forEach(id => document.getElementById(id).style.display = 'block');
}

function hideImagePopup() {
    ['imagePopupOverlay', 'imagePopupContent'].forEach(id => document.getElementById(id).style.display = 'none');
    document.getElementById('imagePopupContent').innerHTML = '';
}

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth() + 1;
const day = today.getDate();

function getWeekDates(date) {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay()); // 日曜日を取得
    return [...Array(7)].map((_, i) => new Date(start).setDate(start.getDate() + i) && start.getDate());
}

const weekDates = getWeekDates(new Date());

// 期間の表示テキストを更新する関数を修正
function updateSpanSelectText(unit) {
    const spanText = document.querySelector('.span_select_text');
    const y = currentDate.getFullYear(), m = currentDate.getMonth() + 1, d = currentDate.getDate();
    const enMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    if (unit === 'day') spanText.textContent = language === 'ja' ? `${y}年${m}月${d}日` : `${m}/${d}/${y}`;
    if (unit === 'week') {
        const s = new Date(currentDate); s.setDate(d - s.getDay());
        const e = new Date(s); e.setDate(s.getDate() + 6);
        spanText.textContent = language === 'ja' ? `${s.getMonth() + 1}月${s.getDate()}日～${e.getMonth() + 1}月${e.getDate()}日`
                                                  : `${s.getMonth() + 1}/${s.getDate()} - ${e.getMonth() + 1}/${e.getDate()}`;
    }
    if (unit === 'month') spanText.textContent = language === 'ja' ? `${y}年${m}月` : `${enMonths[m - 1]} ${y}`;
    if (unit === 'year') spanText.textContent = language === 'ja' ? `${y}年` : `${y}`;
}

function get_comment_data(formattedDate, unit) {
    fetch(`./php/guardian/guardian_get_comment.php?date=${formattedDate}`)
    .then(res => res.json())
    .then(({ error, exists, comment }) => {
        if (error) return alert(error);

        const text = document.querySelector('.guardian_comment_text'),
              btn = document.querySelector('.guardian_comment_button'),
              isJa = language === 'ja';

        if (exists && comment) {
            text.value = comment.comment_text;
            btn.textContent = isJa ? 'コメントを編集' : 'Edit Comment';
            btn.dataset.mode = 'edit';
            btn.dataset.commentId = comment.id;
        } else {
            text.value = '';
            btn.textContent = isJa ? 'コメントを送信' : 'Send Comment';
            btn.dataset.mode = 'new';
            delete btn.dataset.commentId;
        }

        document.querySelectorAll('.side_unit_button button').forEach(b => b.classList.remove('active'));
        document.querySelector(`.side_unit_${unit}`).classList.add('active');

        createTimeChart('day');
        createCategoryChart('day');
    })
    .catch(e => {
        console.error('Error:', e);
        alert(language === 'ja' ? 'コメントの取得中にエラーが発生しました' : 'An error occurred while retrieving comments');
    });
}

// 期間移動ボタンのイベントハンドラーを修正
const updateDate = (direction) => {
    const unit = ['day', 'week', 'month', 'year'].find(u => document.querySelector(`.side_unit_${u}`).classList.contains('active'));
    const change = direction === 'left' ? -1 : 1;

    const update = {
        day: () => {
            currentDate.setDate(currentDate.getDate() + change);
            document.querySelector('.guardian_comment_text').value = '';
            get_comment_data(formatDate(currentDate), 'day');
        },
        week: () => currentDate.setDate(currentDate.getDate() + 7 * change),
        month: () => currentDate.setMonth(currentDate.getMonth() + change),
        year: () => currentDate.setFullYear(currentDate.getFullYear() + change)
    };

    update[unit]();
    if (unit !== 'day') {
        createTimeChart(unit);
        createCategoryChart(unit);
    }
};

document.querySelector('.span_select_left').addEventListener('click', () => updateDate('left'));
document.querySelector('.span_select_right').addEventListener('click', () => updateDate('right'));

function createTimeChart(labelUnit) {
    const updateButtonStyle = () => {
        document.querySelectorAll('.side_unit_button button').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.side_unit_${labelUnit}`).classList.add('active');
    };

    const updateCommentDate = () => {
        const commentDateInput = document.getElementById('commentDate');
        commentDateInput.value = labelUnit === 'day' ? formatDate(currentDate) : '';
        commentDateInput.placeholder = labelUnit !== 'day' ? 'yyyy-MM-dd' : '';
    };

    const updateLabels = () => {
        const daysOfWeek = { ja: ['日', '月', '火', '水', '木', '金', '土'], en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] };
        const monthsOfYear = { ja: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'], en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] };
        
        switch(labelUnit) {
            case 'day': return Array.from({ length: 24 }, (_, i) => language === 'ja' ? `${i}時` : `${i}:00`);
            case 'week': return daysOfWeek[language].map((day, i) => { const date = new Date(currentDate); date.setDate(date.getDate() + i); return day; });
            case 'month': return Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() }, (_, i) => language === 'ja' ? `${i + 1}日` : `${i + 1}`);
            case 'year': return monthsOfYear[language];
        }
    };

    const timeToHours = timeStr => timeStr.split(':').map(Number).reduce((h, m, i) => i === 0 ? h + m : h + m / 60, 0).toFixed(2);

    const formatDate = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    const getWeekRange = date => {
        const sunday = new Date(date); sunday.setDate(date.getDate() - date.getDay());
        const saturday = new Date(sunday); saturday.setDate(sunday.getDate() + 6);
        return { start: sunday, end: saturday };
    };

    const apiUrl = `../../php/guardian/guardian_time.php?unit=${encodeURIComponent(labelUnit)}&date=${formatDate(currentDate)}`;

    fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
        if (data.error) return console.error('Error from server:', data.error);

        const hasData = data.values?.some(record => timeToHours(record.study_time) > 0);
        const labels = updateLabels();
        const label = language === 'ja' ? '勉強時間(時間)' : 'Study Time (Hours)';
        const text = language === 'ja' ? '時間(h)' : 'Hours';
        const chartData = { labels, datasets: [{ label, data: new Array(labels.length).fill(0), backgroundColor: '#4870BD', borderColor: '#4870BD', borderWidth: 1 }] };

        data.values?.forEach(record => {
            const index = record.time_index;
            chartData.datasets[0].data[index] = timeToHours(record.study_time);
        });

        const config = {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                scales: { 
                    y: { 
                        beginAtZero: true, 
                        title: { display: true, text, font: { size: window.innerWidth * 0.03 } }, 
                        ticks: { font: { size: window.innerWidth * 0.03 } } 
                    }, 
                    x: { ticks: { font: { size: window.innerWidth * 0.03 } } } 
                },
                plugins: {
                    legend: { position: 'top', labels: { font: { size: window.innerWidth * 0.03 } } },
                    tooltip: { callbacks: { label: context => `${Math.floor(context.raw)}時間${Math.round((context.raw - Math.floor(context.raw)) * 60)}分` } },
                    noData: {
                        text: language === 'ja' ? 'データがありません' : 'No data available',
                        align: 'center',
                        verticalAlign: 'middle',
                        font: { size: window.innerWidth * 0.04 },
                    }
                }
            }
        };
        

        if (!hasData) {
            chartData.datasets[0].backgroundColor = 'rgba(72, 112, 189, 0.3)';
            chartData.datasets[0].borderColor = 'rgba(72, 112, 189, 0.3)';

            // プラグインの定義を追加
            const noDataPlugin = {
                id: 'noData',
                afterDraw: (chart) => {
                    if (!hasData) {
                        const {ctx, width, height} = chart;
                        ctx.save();
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.font = `${chart.options.plugins.noData.font.size}px sans-serif`;
                        ctx.fillStyle = '#666';
                        ctx.fillText(chart.options.plugins.noData.text, width / 2, height / 2);
                        ctx.restore();
                    }
                }
            };

            config.plugins = [noDataPlugin];
        }

        chartInstance?.destroy();
        chartInstance = new Chart(chartContext, config);
    })
    .catch(error => console.error('Error fetching data:', error));

    updateButtonStyle();
    updateCommentDate();
    updateSpanSelectText(labelUnit);
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
    const colors = []; // カテゴリーに対応する色の配列

    categories.forEach((category, index) => {
        if (!categoryColorMap[category]) {
            const hue = (index * (360 / categories.length)) % 360; // 色相を計算
            categoryColorMap[category] = `hsl(${hue}, 70%, 60%)`;
        }
        colors.push(categoryColorMap[category]); // カテゴリーに対応する色を追加
    });

    return colors; // カテゴリーに対応する色の配列を返す
}

function createCategoryChart(unit = 'week') {
    const apiUrl = `../../php/guardian/guardian_category.php?unit=${encodeURIComponent(unit)}&date=${formatDate(currentDate)}`;
    const spanText = document.querySelector('.span_select_text').textContent;
    const chartFooter = document.querySelector('.chart-footer');

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.error || !data.categories?.length) {
                chartFooter.style.display = 'none';
                return;
            }

            // データがある場合はchart-footerを表示
            chartFooter.style.display = 'flex';

            // 時間を「○h」形式にフォーマットする関数
            const timeToHours = timeStr => {
                const [hours, minutes, seconds] = timeStr.split(':').map(Number);
                const totalHours = hours + minutes / 60 + seconds / 3600;
                // 0.01時間（36秒）未満の場合は0.01として表示
                return totalHours < 0.01 ? 0.01 : Number(totalHours.toFixed(2));
            };

            const formatTime = (timeInHours) => {
                return `${timeInHours}h`;
            };

            const categories = data.categories.map(item => item.category_name);
            const times = data.categories.map(item => timeToHours(item.total_time));
            const colors = generateColors(categories);

            const config = {
                type: 'doughnut',
                data: {
                    labels: categories.map((category, index) => `${category}:${times[index]}`),
                    datasets: [{
                        data: times,
                        backgroundColor: colors,
                        borderColor: colors.map(color => color.replace('60%', '50%')),
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'right', labels: { font: { size: window.innerWidth * 0.02 } } },
                        title: { display: true, text: spanText, font: { size: window.innerWidth * 0.03 } },
                        tooltip: { callbacks: { label: context => context.label } }
                    }
                }
            };

            categoryChartInstance?.destroy();
            categoryChartInstance = new Chart(categoryChartContext, config);
        })
        .catch(error => {
            console.error('Error fetching category data:', error);
            chartFooter.style.display = 'none';
        });
}

// DOMContentLoadedイベントハンドラーを修正
document.addEventListener('DOMContentLoaded', () => {
    const timeUnits = ['day', 'week', 'month', 'year'];
    const commentDateInput = document.getElementById('commentDate');
    
    // ボタンに対するクリックイベント設定
    timeUnits.forEach(unit => {
        const button = document.querySelector(`.side_unit_${unit}`);
        if (button) {
            button.addEventListener('click', () => {
                createTimeChart(unit);
                createCategoryChart(unit);
            });
        }
    });

    // 日付入力変更時にグラフを更新
    commentDateInput.addEventListener('change', (e) => {
        currentDate = new Date(e.target.value);
        createTimeChart('day');
        createCategoryChart('day');
    });

    // 初期表示は週表示で開始
    currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - currentDate.getDay());
    createTimeChart('week');
    createCategoryChart('week');

    // カレンダーをカスタマイズ
    customizeCalendar();
    
    // 月が変わった時にカレンダー更新
    commentDateInput.addEventListener('input', customizeCalendar);
});

let locale = language === 'ja' ? 'ja' : 'en';
let dataFormat = language === 'ja' ? 'Y-m-d' : 'm-d-Y'; // 形式の設定

// カレンダーをカスタマイズする関数
function customizeCalendar() {
    const commentDateInput = document.getElementById('commentDate');
    
    fetch('./php/guardian/guardian_calender.php')
        .then(response => response.json())
        .then(data => {
            if (data.error) return console.error('Error:', data.error);

            const studyDates = new Set([...data.dates || []]);
            data.dates?.forEach(date => studyDates.add(new Date(date).toISOString().split('T')[0]));

            flatpickr(commentDateInput, {
                locale,
                enable: Array.from(studyDates),
                dateFormat: dataFormat,
                onDayCreate: (dObj, dStr, fp, dayElem) => {
                    const dateString = new Date(dayElem.dateObj.getTime() - dayElem.dateObj.getTimezoneOffset() * 60000).toISOString().split('T')[0];
                    dayElem.classList.add(studyDates.has(dateString) ? 'has-study-record' : 'no-study-record');
                },
                onChange: (selectedDates) => {
                    currentDate = selectedDates[0];
                    const formattedDate = formatDate(currentDate);

                    fetch('./php/guardian/guardian_calender.php')
                        .then(response => response.json())
                        .then(data => {
                            if (!Array.isArray(data)) return console.error('Error fetching study dates:', data.error);
                        });

                    get_comment_data(formattedDate, 'day');
                },
            });
        })
        .catch(console.error());
}

// コメントの保存/更新処理を修正
document.querySelector('.guardian_comment_button').addEventListener('click', function(e) {
    e.preventDefault();

    const commentText = document.querySelector('.guardian_comment_text').value.trim();
    const commentDate = document.querySelector('.comment-date-input').value;
    const isEditMode = this.dataset.mode === 'edit';

    const showAlert = (msg) => {
        alert(language === 'ja' ? msg.ja : msg.en);
    };

    if (!commentDate || commentDate === 'yyyy-MM-dd') return showAlert({ ja: '日付を選択してください', en: 'Please select a date' });
    if (!commentText) return showAlert({ ja: 'コメントを入力してください', en: 'Please enter a comment' });

    const invalidChars = ['<', '>'];
    const inappropriateWords = [
        ['ばか', '馬鹿', 'アホ', 'あほ', 'バカ'],
        ['勉強してください', '勉強しろ', '勉強しましょう', '勉強しなさい', '勉強しないと'],
        ['死ね', 'しね', '死ぬな', 'しぬな', '殺す', 'ころす']
    ];

    const containsInvalidChar = invalidChars.some(char => commentText.includes(char));
    const containsInappropriateWord = inappropriateWords.some(group => group.some(word => commentText.includes(word)));

    if (containsInvalidChar || containsInappropriateWord) {
        return showAlert({ ja: 'コメントに不正な文字が含まれています', en: 'Comment contains illegal characters' });
    }

    if (commentText.length > 1000) {
        return showAlert({ ja: 'コメントは1000字以内で入力してください', en: 'Comment should not exceed 1000 characters' });
    }

    const endpoint = isEditMode ? './php/guardian/update_comment.php' : './php/guardian/save_comment.php';
    const requestData = {
        comment_text: commentText,
        study_date: commentDate,
        ...(isEditMode && { comment_id: this.dataset.commentId })
    };

    fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) return showAlert({ ja: data.error, en: data.error });

        showAlert({
            ja: isEditMode ? 'コメントが更新されました' : 'コメントが保存されました',
            en: isEditMode ? 'Comment updated successfully' : 'Comment saved successfully'
        });

        document.querySelector('.guardian_comment_text').value = '';
        document.querySelector('.comment-date-input').value = 'yyyy-MM-dd';
        createTimeChart('week');
        createCategoryChart('week');
        this.textContent = language === 'ja' ? 'コメントを送信' : 'Send comment';
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert({ ja: 'コメントの保存中にエラーが発生しました', en: 'An error occurred while saving the comment' });
    });
});