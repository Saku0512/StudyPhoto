document.addEventListener('DOMContentLoaded', () => {
  // localStorage から保存された秒数を取得
  const elapsedSeconds = parseInt(localStorage.getItem('stopwatchTime'), 10) || 0;

  // 秒を時間：分：秒形式に変換
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  //表示用のテキストを作成
  const timeString = 
    String(hours).padStart(2, '0') + ':' +
    String(minutes).padStart(2, '0') + ':' +
    String(seconds).padStart(2, '0');

    // 表示
  document.getElementById('timer-display').textContent = timeString;
});

$('#saveButton').on('click', () => {
  // 現在の日付を取得し、YYYY-MM-DD形式で保存
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD形式

  // 保存する時間を取得
  const timeString = localStorage.getItem('stopwatchTime') || '00:00:00';
  console.log("Saving to record:", timeString); // デバッグ用

  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  const totalHours = hours + minutes / 60 + seconds / 3600;

  // データを保存
  localStorage.setItem('recordTime', totalHours);

  // 現在の日付と時間を保存
  let dates = JSON.parse(localStorage.getItem('dates')) || [];
  let studyTimes = JSON.parse(localStorage.getItem('studyTimes')) || [];

  dates.push(currentDate);
  studyTimes.push(totalHours);

  localStorage.setItem('dates', JSON.stringify(dates));
  localStorage.setItem('studyTimes', JSON.stringify(studyTimes));

  window.location.href = 'record.html';
});
