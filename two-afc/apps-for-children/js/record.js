const recordChartContext = document.getElementById('studyChart').getContext('2d');
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

document.querySelector('.span_select_left').addEventListener('click', () => {
    const unit = document.querySelector('.side_unit_day').classList.contains('active') ? 'day' :
                document.querySelector('.side_unit_week').classList.contains('active') ? 'week' :
                document.querySelector('.side_unit_month').classList.contains('active') ? 'month' : 'year';
    
    switch(unit) {
        case 'day':
            currentDate.setDate(currentDate.getDate() - 1);
            //document.querySelector('.record_comment_text').value = '';
            createTimeChart('day');
            //createCategoryChart('day');
            break;
        case 'week':
            currentDate.setDate(currentDate.getDate() - 7);
            createTimeChart('week');
            //createCategoryChart('week');
            break;
        case 'month':
            currentDate.setMonth(currentDate.getMonth() - 1);
            createTimeChart('month');
            //createCategoryChart('month');
            break;
        case 'year':
            currentDate.setFullYear(currentDate.getFullYear() - 1);
            createTimeChart('year');
            //createCategoryChart('year');
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
            document.querySelector('.guardian_comment_text').value = '';
            //const formattedDate = formatDate(currentDate);
            
            // コメントの存在チェックと取得
            //get_comment_data(formattedDate, 'day');
            break;
        case 'week':
            currentDate.setDate(currentDate.getDate() + 7);
            createTimeChart('week');
            //createCategoryChart('week');
            break;
        case 'month':
            currentDate.setMonth(currentDate.getMonth() + 1);
            createTimeChart('month');
            //createCategoryChart('month');
            break;
        case 'year':
            currentDate.setFullYear(currentDate.getFullYear() + 1);
            createTimeChart('year');
            //createCategoryChart('year');
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
    const apiUrl = `../../php/guardian/guardian_time.php?unit=${encodeURIComponent(labelUnit)}&date=${formatDate(currentDate)}`;

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
                labels = Array.from({length: 24}, (_, i) => `${i}時`);
                break;
            case 'week':
                labels = ['日', '月', '火', '水', '木', '金', '土'].map((day, i) => {
                    const date = new Date(weekRange.start);
                    date.setDate(date.getDate() + i);
                    return `${day}`;
                });
                break;
            case 'month':
                const daysInMonth = new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1,
                    0
                ).getDate();
                labels = Array.from({length: daysInMonth}, (_, i) => `${i + 1}日`);
                break;
            case 'year':
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

        if (recordChartInstance) {
            recordChartInstance.destroy();
        }
        recordChartInstance = new Chart(recordChartContext, config);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
}

/* カテゴリー別勉強時間グラフを作成する関数 
function createCategoryChart(labelUnit) {
    const categoryChartContext = document.getElementById('categoryChart').getContext('2d');
    const apiUrl = `../../php/guardian/guardian_category.php?unit=${encodeURIComponent(labelUnit)}&date=${formatDate(currentDate)}`;

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

        if (!data.categories || !Array.isArray(data.categories)) {
            console.error('Invalid data format received:', data);
            return;
        }

        const labels = data.categories.map(record => record.category_name);
        const chartData = {
            labels: labels,
            datasets: [{
                label: 'カテゴリー別勉強時間(時間)',
                data: data.categories.map(record => record.study_time),
                backgroundColor: labels.map(label => categoryColorMap[label] || '#4870BD'),
                borderColor: labels.map(label => categoryColorMap[label] || '#4870BD'),
                borderWidth: 1
            }]
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
                    },
                    noData: {
                        text: 'カテゴリー別データはありません',
                        align: 'center',
                        verticalAlign: 'middle',
                        font: {
                            size: window.innerWidth * 0.04
                        }
                    }
                }
            }
        };

        if (recordChartInstance) {
            recordChartInstance.destroy();
        }
        recordChartInstance = new Chart(categoryChartContext, config);
    })
    .catch(error => {
        console.error('Error fetching category data:', error);
    });
}
*/

// DOMContentLoadedイベントハンドラーを修正
document.addEventListener('DOMContentLoaded', () => {
    const dayButton = document.querySelector('.side_unit_day');
    const weekButton = document.querySelector('.side_unit_week');
    const monthButton = document.querySelector('.side_unit_month');
    const yearButton = document.querySelector('.side_unit_year');

    if (dayButton) dayButton.addEventListener('click', () => {
        createTimeChart('day');
        //createCategoryChart('day');
    });
    
    if (weekButton) weekButton.addEventListener('click', () => {       
        createTimeChart('week');
        //createCategoryChart('week');
    });
    
    if (monthButton) monthButton.addEventListener('click', () => {
        createTimeChart('month');
        //createCategoryChart('month');
    });
    
    if (yearButton) yearButton.addEventListener('click', () => {        
        createTimeChart('year');
        //createCategoryChart('year');
    });

    /*
    const commentDateInput = document.getElementById('commentDate');
    commentDateInput.addEventListener('change', (e) => {
        currentDate = new Date(e.target.value);
        createTimeChart('day');
        createCategoryChart('day');
    });
    */

    //const initialDate = new Date();
    //initialDate.setDate(initialDate.getDate() - initialDate.getDay());
    //currentDate = new Date(initialDate);
    createTimeChart('week');
    //createCategoryChart('week');

    //customizeCalendar();
    
    //commentDateInput.addEventListener('input', () => {
    //    customizeCalendar();
    //});
});

/* カレンダーをカスタマイズする関数
function customizeCalendar() {
    const commentDateInput = document.getElementById('commentDate');
    
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    fetch(`../../php/guardian/guardian_calender.php?year=${currentYear}&month=${currentMonth}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error:', data.error);
                return;
            }

            const studyDates = new Set(data.dates || []);

            flatpickr(commentDateInput, {
                locale: 'ja',
                dateFormat: 'Y-m-d',
                maxDate: 'today',
                inline: false,
                enable: [
                    function(date) {
                        const dateString = date.toISOString().split('T')[0];
                        return studyDates.has(dateString);
                    }
                ],
                onDayCreate: function(dObj, dStr, fp, dayElem) {
                    const dateString = dayElem.dateObj.toISOString().split('T')[0];
                    const today = new Date().toISOString().split('T')[0];
                    
                    if (studyDates.has(dateString)) {
                        dayElem.classList.add('has-study-record');
                        dayElem.classList.remove('flatpickr-disabled');
                    } else if (dateString <= today) {
                        dayElem.classList.add('no-study-record');
                        dayElem.classList.add('flatpickr-disabled');
                    }
                },
                onChange: function(selectedDates) {
                    if (selectedDates.length > 0) {
                        currentDate = selectedDates[0];
                        const formattedDate = formatDate(currentDate);
                        
                        get_comment_data(formattedDate, 'day');
                    }
                },
                onMonthChange: function(selectedDates, dateStr, instance) {
                    const newYear = instance.currentYear;
                    const newMonth = instance.currentMonth + 1;
                    
                    fetch(`../../php/guardian/guardian_calender.php?year=${newYear}&month=${newMonth}`)
                        .then(response => response.json())
                        .then(newData => {
                            if (newData.error) {
                                console.error('Error:', newData.error);
                                return;
                            }
                            
                            const newStudyDates = new Set(newData.dates || []);
                            
                            instance.set('enable', [
                                function(date) {
                                    const dateString = date.toISOString().split('T')[0];
                                    return newStudyDates.has(dateString);
                                }
                            ]);
                            
                            instance.days.forEach(dayElem => {
                                const dateString = dayElem.dateObj.toISOString().split('T')[0];
                                dayElem.classList.remove('has-study-record', 'no-study-record', 'flatpickr-disabled');
                                
                                if (newStudyDates.has(dateString)) {
                                    dayElem.classList.add('has-study-record');
                                } else {
                                    dayElem.classList.add('no-study-record');
                                    dayElem.classList.add('flatpickr-disabled');
                                }
                            });
                        })
                        .catch(error => {
                            console.error('Error fetching study dates:', error);
                        });
                }
            });
        })
        .catch(error => {
            console.error('Error fetching study dates:', error);
        });
}
*/