const recordChartContext = document.getElementById('studyChart').getContext('2d');
// 言語設定
const language = document.getElementById("hidden_language").value;
let recordChartInstance;

// 現在の表示期間を追跡するための変数
let currentDate = new Date();

// カテゴリーの色マッピングを保持するオブジェクト
let categoryColorMap = {};

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

    const popupContent = document.getElementById('imagePopupContent');
    const images = popupContent.querySelectorAll('img');
    images.forEach(img => {
        img.remove();
    });
}

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth() + 1;
const day = today.getDate();

function getWeekDates(date) {
    const currentDate = new Date(date);
    const startOfWeek = currentDate.getDate() - currentDate.getDay();
    const sunday = new Date(currentDate.setDate(startOfWeek));
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(sunday);
        day.setDate(sunday.getDate() + i);
        const dayOfMonth = day.getDate();
        weekDates.push(dayOfMonth);
    }

    return weekDates;
}

const weekDates = getWeekDates(new Date());

function updateSpanSelectText(unit) {
    const spanText = document.querySelector('.span_select_text');
    
    switch(unit) {
        case 'day':
            if (language === 'ja') {
                spanText.textContent = `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月${currentDate.getDate()}日`;
            } else if (language === 'en') {
                spanText.textContent = `${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()}`;
            }
            break;
        case 'week':
            const weekStart = new Date(currentDate);
            weekStart.setDate(currentDate.getDate() - currentDate.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            if (language === 'ja') {
                spanText.textContent = `${weekStart.getMonth() + 1}月${weekStart.getDate()}日～${weekEnd.getMonth() + 1}月${weekEnd.getDate()}日`;
            } else if (language === 'en') {
                spanText.textContent = `${weekStart.getMonth() + 1}/${weekStart.getDate()} - ${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`;
            }
            break;
        case 'month':
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            if (language === 'ja') {
                spanText.textContent = `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`;
            } else if (language === 'en') {
                spanText.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
            }
            break;
        case 'year':
            if (language === 'ja') {
                spanText.textContent = `${currentDate.getFullYear()}年`;
            } else if (language === 'en') {
                spanText.textContent = `${currentDate.getFullYear()}`;
            }
            break;
    }
}

document.querySelector('.span_select_left').addEventListener('click', () => {
    const unit = document.querySelector('.side_unit_day').classList.contains('active') ? 'day' :
                document.querySelector('.side_unit_week').classList.contains('active') ? 'week' :
                document.querySelector('.side_unit_month').classList.contains('active') ? 'month' : 'year';
    
    switch(unit) {
        case 'day':
            currentDate.setDate(currentDate.getDate() - 1);
            createTimeChart('day');
            createCategoryChart('day');
            break;
        case 'week':
            currentDate.setDate(currentDate.getDate() - 7);
            createTimeChart('week');
            createCategoryChart('week');
            break;
        case 'month':
            currentDate.setMonth(currentDate.getMonth() - 1);
            createTimeChart('month');
            createCategoryChart('month');
            break;
        case 'year':
            currentDate.setFullYear(currentDate.getFullYear() - 1);
            createTimeChart('year');
            createCategoryChart('year');
            break;
    }
});

document.querySelector('.span_select_right').addEventListener('click', () => {
    const unit = document.querySelector('.side_unit_day').classList.contains('active') ? 'day' :
                document.querySelector('.side_unit_week').classList.contains('active') ? 'week' :
                document.querySelector('.side_unit_month').classList.contains('active') ? 'month' : 'year';
    
    switch(unit) {
        case 'day':
            currentDate.setDate(currentDate.getDate() + 1);
            createTimeChart('day');
            createCategoryChart('day');
            break;
        case 'week':
            currentDate.setDate(currentDate.getDate() + 7);
            createTimeChart('week');
            createCategoryChart('week');
            break;
        case 'month':
            currentDate.setMonth(currentDate.getMonth() + 1);
            createTimeChart('month');
            createCategoryChart('month');
            break;
        case 'year':
            currentDate.setFullYear(currentDate.getFullYear() + 1);
            createTimeChart('year');
            createCategoryChart('year');
            break;
    }
});

function createTimeChart(labelUnit) {
    // アクティブなボタンのスタイルを更新
    document.querySelectorAll('.side_unit_button button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.side_unit_${labelUnit}`).classList.add('active');

    updateSpanSelectText(labelUnit);

    const timeToHours = timeStr => {
        const [hours, minutes, seconds] = timeStr.split(':').map(Number);
        return Number(((hours + minutes / 60 + seconds / 3600)).toFixed(2));
    };

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
    const apiUrl = `../../php/record/chart_time.php?unit=${encodeURIComponent(labelUnit)}&date=${formatDate(currentDate)}`;

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

        // データが空かどうかをチェック
        const hasData = data.values && data.values.some(record =>
            timeToHours(record.study_time) > 0
        );

        let labels;
        const daysOfWeek = {
            ja: ['日', '月', '火', '水', '木', '金', '土'],
            en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        };
        const monthsOfYear = {
            ja: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        };
        
        switch (labelUnit) {
            case 'day':
                labels = Array.from({ length: 24 }, (_, i) => 
                    language === 'ja' ? `${i}時` : `${i}:00`
                );
                break;
            case 'week':
                labels = daysOfWeek[language].map((day, i) => {
                    const date = new Date(weekRange.start);
                    date.setDate(date.getDate() + i);
                    return day;
                });
                break;
            case 'month':
                const daysInMonth = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1,
                    0
                ).getDate();
                labels = Array.from({ length: daysInMonth }, (_, i) => 
                    language === 'ja' ? `${i + 1}日` : `${i + 1}`
                );
                break;
            case 'year':
                labels = monthsOfYear[language];
                break;
        }

        let label;
        let text;

        if (language === 'ja') {
            label = '勉強時間(時間)';
            text = '時間(h)';
        } else if (language === 'en') {
            label = 'Study Time (Hours)';
            text = 'Hours';
        }

        // データの整形
        const chartData = {
            labels: labels,
            datasets: [{
                label: label,
                data: new Array(labels.length).fill(0),
                backgroundColor: '#4870BD',
                borderColor: '#4870BD',
                borderWidth: 1
            }]
        };

        if (data.values && Array.isArray(data.values)) {
            data.values.forEach(record => {
                const index = record.time_index;
                const hours = timeToHours(record.study_time);
                chartData.datasets[0].data[index] = hours;
            });
        }

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
                            text: text,
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

        // データがない場合の表示設定を追加
        if (!hasData) {
            // グラフの色を薄く設定
            config.data.datasets[0].backgroundColor = 'rgba(72, 112, 189, 0.3)';
            config.data.datasets[0].borderColor = 'rgba(72, 112, 189, 0.3)';
            
            // プラグインの定義を追加
            const noDataPlugin = {
                id: 'noData',
                afterDraw: (chart) => {
                    if (!hasData) {
                        const {ctx, width, height} = chart;
                        ctx.save();
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        // フォントサイズが設定されていない場合のデフォルト値を設定
                        const fontSize = chart.options.plugins.noData?.font?.size || 16;
                        ctx.font = `${fontSize}px sans-serif`;
                        ctx.fillStyle = '#666';
                        if (language === 'ja') {
                            ctx.fillText(chart.options.plugins.noData?.text || 'データがありません', width / 2, height / 2);
                        } else if (language === 'en') {
                            ctx.fillText(chart.options.plugins.noData?.text || 'No data available', width / 2, height / 2);
                        }
                        ctx.restore();
                    }
                }
            };

            config.plugins = [noDataPlugin];
        }

        if (recordChartInstance) {
            recordChartInstance.destroy();
        }
        recordChartInstance = new Chart(recordChartContext, config);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
}

const categoryChartContext = document.getElementById('categoryChart').getContext('2d');
let categoryChartInstance;

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function generateColors(categories) {
    const usedColors = new Set();
    const colors = [];

    categories.forEach((category, index) => {
        if (!categoryColorMap[category]) {
            let hue;
            do {
                hue = (index * (360 / categories.length)) % 360;
            } while (usedColors.has(hue));

            categoryColorMap[category] = `hsl(${hue}, 70%, 60%)`;
            usedColors.add(hue);
        }
        colors.push(categoryColorMap[category]);
    });

    return colors;
}

function createCategoryChart(unit = 'week') {
    const apiUrl = `../../php/record/chart_category.php?unit=${encodeURIComponent(unit)}&date=${formatDate(currentDate)}`;

    const spanText = document.querySelector('.span_select_text').textContent;
    const chartFooter = document.querySelector('.chart-footer');

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error:', data.error);
                return; // エラーがある場合は処理を中断
            }

            // データが空の場合はchart-footerを非表示にする
            if (!data.categories || data.categories.length === 0) {
                chartFooter.style.display = 'none';
                return;
            }
            
            chartFooter.style.display = 'flex';

            const timeToHours = timeStr => {
                if (!timeStr) return 0; // timeStrがundefinedまたはnullの場合は0を返す
                const [hours, minutes, seconds] = timeStr.split(':').map(Number);
                const totalHours = hours + minutes / 60 + seconds / 3600;
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

    createTimeChart('week');
    createCategoryChart('week');
});