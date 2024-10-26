// Chart.jsで使用するデータの基本設定
const chartContext = document.getElementById('studyChart').getContext('2d');
let chartInstance;

// グラフの初期設定
function createChart(labelUnit) {
  const data = generateChartData(labelUnit); // ラベルに基づいてデータを生成する
  const config = {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: '学習時間',
        data: data.values,
        fill: false,
        borderColor: 'blue',
        tension: 0.1
      }]
    },
    options: {
      scales: {
        x: {
          type: 'time',
          time: {
            unit: labelUnit // ここで週、月、年を指定
          }
        },
        y: {
          beginAtZero: true
        }
      }
    }
  };

  if (chartInstance) {
    chartInstance.destroy(); // 既存のチャートがあれば破棄
  }

  chartInstance = new Chart(chartContext, config);
}

// サンプルのデータ生成（実際にはAPIやDBからデータを取得する）
function generateChartData(unit) {
  const now = new Date();
  let labels = [];
  let values = [];
  
  // データを週、月、年ごとに生成
  if (unit === 'week') {
    for (let i = 0; i < 7; i++) {
      labels.push(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)); // 過去7日分のラベル
      values.push(Math.floor(Math.random() * 10) + 1); // ランダムなデータ
    }
  } else if (unit === 'month') {
    for (let i = 0; i < 30; i++) {
      labels.push(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i)); // 過去30日分のラベル
      values.push(Math.floor(Math.random() * 10) + 1); // ランダムなデータ
    }
  } else if (unit === 'year') {
    for (let i = 0; i < 12; i++) {
      labels.push(new Date(now.getFullYear(), now.getMonth() - i, 1)); // 過去12ヶ月分のラベル
      values.push(Math.floor(Math.random() * 100) + 10); // ランダムなデータ
    }
  }

  return { labels, values };
}

// ボタンのクリックイベントを設定
document.querySelector('.side_unit_week').addEventListener('click', () => {
  createChart('week');
});
document.querySelector('.side_unit_mounth').addEventListener('click', () => {
  createChart('month');
});
document.querySelector('.side_unit_year').addEventListener('click', () => {
  createChart('year');
});

<<<<<<< HEAD
// ページが読み込まれたときに初期グラフを表示（例えば、週単位のグラフ）
window.addEventListener('load', () => {
  createChart('week');
});
=======
// DOM の読み込み完了後に実行する処理
document.addEventListener('DOMContentLoaded', () => {
  const selectedCategory = localStorage.getItem("selectedCategory");
  console.log(selectedCategory);
  if(selectedCategory) {
    document.getElementById("displayCategory").textContent = selectedCategory;
  }
});
>>>>>>> origin/main
