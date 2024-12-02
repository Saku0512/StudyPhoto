// Chart.jsで使用するデータの基本設定
const chartContext = document.getElementById('studyChart').getContext('2d');
let chartInstance;

// グラフの初期設定
function createChart(labelUnit) {
  // Fetchデータの取得
  console.log("Fetching data for:", labelUnit);
  
  fetch(`../../php/record/time.php?unit=${encodeURIComponent(labelUnit)}`, {
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
      // エラーデータのチェック
      if (data.error) {
        console.error('Error from server:', data.error);
        return;
      }

      // 取得したデータを数値に変換
      const values = data.values.map(value => {
        const numericValue = parseFloat(value);
        return isNaN(numericValue) ? 0 : numericValue;
      });

      // チャートの設定
      const config = {
        type: 'line',
        data: {
          labels: data.labels,  // 日時ラベル
          datasets: [{
            label: '学習時間',
            data: values,  // 学習時間データ
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
                unit: labelUnit  // 単位（週、月、年など）
              }
            },
            y: {
              beginAtZero: true  // Y軸を0から開始
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
  const weekButton = document.querySelector('.side_unit_week');
  if (weekButton) {
    weekButton.addEventListener('click', () => {
      createChart('week');  // 週単位のデータを表示
    });
  } else {
    console.warn("Week button not found!");
  }

  const monthButton = document.querySelector('.side_unit_month');
  if (monthButton) {
    monthButton.addEventListener('click', () => {
      createChart('month');  // 月単位のデータを表示
    });
  } else {
    console.warn("Month button not found!");
  }

  const yearButton = document.querySelector('.side_unit_year');
  if (yearButton) {
    yearButton.addEventListener('click', () => {
      createChart('year');  // 年単位のデータを表示
    });
  } else {
    console.warn("Year button not found!");
  }

  // ページが読み込まれたときに初期グラフを表示（週単位）
  createChart('week');
  
  // ローカルストレージから選択されたカテゴリを表示
  const selectedCategory = localStorage.getItem("selectedCategory");
  if (selectedCategory) {
    const displayCategory = document.getElementById("displayCategory");
    if (displayCategory) {
      displayCategory.textContent = selectedCategory;
    } else {
      console.warn("Display category element not found.");
    }
  }
});