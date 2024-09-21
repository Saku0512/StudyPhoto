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
const ctx = $('#studyChart')[0].getContext('2d');
const studyChart = new Chart(ctx, {
  type: 'bar', // 棒グラフを表示
  data: {
    labels: formattedDates,
    datasets: [{
      label: '勉強時間 (h)',
      data: totalTimes,
      backgroundColor: '#5bc8ac', // 棒グラフの背景色
      borderColor: '#3b9e8d', // 棒グラフの枠線色
      borderWidth: 1
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 12, // 最大値を12時間に設定
        ticks: {
          stepSize: 0.5, // 目盛り間隔を0.5時間に設定
          callback: function(value) {
            return value + 'h'; // 時間を表示
          }
        }
      },
      x: {
        type: 'time',
        time: {
          unit: 'day', // 日単位で表示
          tooltipFormat: 'MM/DD', // ツールチップの日付形式
          displayFormats: {
            day: 'MM/DD' // 軸ラベルの日付形式
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