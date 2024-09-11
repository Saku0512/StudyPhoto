document.getElementById('recordTime').textContent = localStorage.getItem('recordTime') || '00:00:00';

document.getElementById('backToHome').addEventListener('click', () => {
  window.location.href = 'study.html';
});