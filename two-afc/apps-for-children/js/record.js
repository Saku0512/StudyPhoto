// グローバルオブジェクトからformat関数を取得
const { format } = window;

// Retrieve the saved data
const studyTimes = JSON.parse(localStorage.getItem('studyTimes')) || [];
const dates = JSON.parse(localStorage.getItem('dates')) || [];

// Format the dates for Chart.js
const formattedDates = dates.map(date => format(new Date(date), 'yyyy-MM-dd'));

const ctx = document.getElementById('studyChart').getContext('2d');
const studyChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: formattedDates,
    datasets: [{
      label: '勉強時間 (h)',
      data: studyTimes,
      borderColor: '#5bc8ac',
      backgroundColor: 'rgba(91, 200, 172, 0.2)',
      borderWidth: 2,
    }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
        max: 12,
        ticks: {
          callback: function(value) {
            return value + 'h';
          }
        }
      },
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'll',
          displayFormats: {
            day: 'YYYY-MM-DD'
          }
        },
        title: {
          display: true,
          text: '日付'
        }
      }
    }
  }
});

document.getElementById('backToHome').addEventListener('click', () => {
  window.location.href = '../home.html';
});
