document.getElementById('saveButton').addEventListener('click', () => {
  // Get stopwatch time from localStorage and convert to hours
  const timeString = localStorage.getItem('stopwatchTime') || '00:00:00';
  //console.log("Saving to record:", timeString);  // デバッグ用
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  const totalHours = hours + minutes / 60 + seconds / 3600;

  // Save the time in hours to localStorage
  localStorage.setItem('recordTime', totalHours);

  // Also save the current date for record.html
  const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  let dates = JSON.parse(localStorage.getItem('dates')) || [];
  let studyTimes = JSON.parse(localStorage.getItem('studyTimes')) || [];

  dates.push(currentDate);
  studyTimes.push(totalHours);

  localStorage.setItem('dates', JSON.stringify(dates));
  localStorage.setItem('studyTimes', JSON.stringify(studyTimes));

  window.location.href = 'record.html';
});
document.getElementById('backButton').addEventListener('click', () => {
  window.location.href = 'study.html';
});
document.addEventListener('DOMContentLoaded', () => {
  // localStorageから保存された時間を取得
  const timeString = localStorage.getItem('stopwatchTime') || '00:00:00';
  console.log("Loaded time for display:", timeString);  // デバッグ用

  // 取得した時間を画面に表示
  document.getElementById('displayTime').innerText = timeString;
});
