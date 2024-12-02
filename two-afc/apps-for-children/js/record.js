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
      if (data.error) {
        console.error('Error from server:', data.error);
        return;
      }

      if (!data.labels || !data.values) {
        console.error('Invalid data format received:', data);
        return;
      }

      // データのチェックと変換
      const labels = data.labels.map(label => new Date(label)); // 日時ラベルをDate形式に変換
      const values = data.values.map(value => {
        const numericValue = parseFloat(value);
        return isNaN(numericValue) ? 0 : numericValue;
      });

      const FontSize = 18;
      // チャートの設定
      const config = {
        type: 'line',
        data: {
          labels: labels, // 日時ラベル
          datasets: [{
            label: '学習時間 (時間)',
            data: values,  // 学習時間データ
            fill: false,
            borderColor: 'blue',
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              type: 'time',
              time: {
                unit: labelUnit, // 単位（week, month, year）
                tooltipFormat: 'yyyy-MM-dd', // ツールチップのフォーマット
              },
              title: {
                display: true,
                text: '日付',
                font: {
                  size: FontSize
                }
              },
              ticks: {
                font: {
                  size: FontSize
                }
              }
            },
            y: {
              beginAtZero: true, // Y軸を0から開始
              title: {
                display: true,
                text: '学習時間 (時間)',
                font: {
                  size: FontSize
                }
              },
              ticks: {
                font: {
                  size: FontSize
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

  if (weekButton) weekButton.addEventListener('click', () => createChart('week'));
  if (monthButton) monthButton.addEventListener('click', () => createChart('month'));
  if (yearButton) yearButton.addEventListener('click', () => createChart('year'));

  // 初期グラフを週単位で表示
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