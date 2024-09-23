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
  const timeButton = document.getElementById("timeButton");
  const noteButton = document.getElementById("noteButton");
  const commentButton = document.getElementById("commentButton");
  const timerSection = document.getElementById("timerSection");
  const noteSection = document.getElementById("noteSection");
  const commentSection = document.getElementById("commentSection");
  const selectedCategory = localStorage.getItem("selectedCategory");

  // Sectionを全部非表示
  function hideAllSection() {
    if(timerSection) timerSection.classList.remove("active");
    if(noteSection) noteSection.classList.remove("active");
    if(commentSection) commentSection.classList.remove("active");
  }

  // デフォルトでtimerSectionを表示
  hideAllSection();
  if(timerSection) timerSection.classList.add("active");

  // ボタンの状態をリセット
  function resetButtonStates() {
    timeButton.classList.remove("active");
    noteButton.classList.remove("active");
    commentButton.classList.remove("active");
  }

  // タイムボタンをクリック
  timeButton.addEventListener("click", function() {
    hideAllSection();
    resetButtonStates();
    if(timerSection) timerSection.classList.add("active");
    timeButton.classList.add("active");
  });

  // ノートボタンをクリック
  noteButton.addEventListener("click", function() {
    hideAllSection();
    resetButtonStates();
    if(noteSection) noteSection.classList.add("active");
    noteButton.classList.add("active");
  });

  // コメントボタンをクリック
  commentButton.addEventListener("click", function() {
    hideAllSection();
    resetButtonStates();
    if(commentSection) commentSection.classList.add("active");
    commentButton.classList.add("active");
  });

  console.log(selectedCategory);
  if(selectedCategory) {
    document.getElementById("displayCategory").textContent = selectedCategory;
  }
});