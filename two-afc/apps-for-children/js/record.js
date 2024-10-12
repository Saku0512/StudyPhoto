// グローバルオブジェクトからformat関数を取得
const { format } = window.dateFns || { format: (date) => date.toString() };

// ローカルストレージから勉強時間と日付のデータを取得
const studyTimes = JSON.parse(localStorage.getItem('studyTimes')) || [];
const dates = JSON.parse(localStorage.getItem('dates')) || [];

// 重複を削除し、一意の日付だけを取得
const uniqueDates = [...new Set(dates)];
const dateTimeMap = new Map(uniqueDates.map(date => [date, 0]));

// 日付ごとに勉強時間を合計
studyTimes.forEach((time, index) => {
  const date = dates[index];
  if (dateTimeMap.has(date)) {
    dateTimeMap.set(date, dateTimeMap.get(date) + time);
  }
});

// 日付と勉強時間を配列に変換
const formattedDates = Array.from(dateTimeMap.keys()).map(date => new Date(date));
const totalTimes = Array.from(dateTimeMap.values());

// グラフの作成
const ctx = document.getElementById('studyChart').getContext('2d'); // jQuery ではなく、純粋な JS を使用
const studyChart = new Chart(ctx, {
  type: 'bar', // 棒グラフを表示
  data: {
    labels: formattedDates,
    datasets: [{
      label: '勉強時間 (h)',
      data: totalTimes,
      backgroundColor: '#4870BD', // 棒グラフの背景色
      borderColor: 'white', // 棒グラフの枠線色
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 0.5, // 最大値を12時間に設定
        ticks: {
          stepSize: 0.05, // 目盛り間隔を0.5時間に設定
          callback: function(value) {
            return value + 'h'; // 時間を表示
          }
        }
      },
      x: {
        type: 'time',
        time: {
          unit: 'day', // 日単位で表示
          tooltipFormat: 'MM/dd', // ツールチップの日付形式
          displayFormats: {
            day: 'MM/dd' // 軸ラベルの日付形式
          }
        },
        title: {
          display: true,
          text: '日付'
        },
        ticks: {
          source: 'auto' // 軸のラベルを自動的に設定
        }
      }
    }
  }
});

// DOM の読み込み完了後に実行する処理
document.addEventListener('DOMContentLoaded', () => {
  showPopup();
  const selectedCategory = localStorage.getItem("selectedCategory");
  console.log(selectedCategory);
  if(selectedCategory) {
    document.getElementById("displayCategory").textContent = selectedCategory;
  }
});
// ポップアップを隠す関数
function hidePopup() {
  document.getElementById('popup').style.display = 'none';
  document.getElementById('overlay').style.display = 'none';
}

// ポップアップを表示する関数
function showPopup() {
  document.getElementById('popup').style.display = 'block';
  document.getElementById('overlay').style.display = 'block';
}