let isPopupVisible = false;

function showPopup11() {
    document.getElementById("overlay").style.display = "block";
    document.getElementById("popup").classList.add("active");
    isPopupVasible = true;
    showSection('addSection'); // 最初に追加フォームを表示

    // フォームの入力をリセット
    document.getElementById("addOptionName").value = "";
    document.getElementById("editOptionName").value = "";
}
function hidePopup() {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("popup").classList.remove("active");
    document.querySelectorAll('.form-section').forEach(section => section.classList.remove("active"));
    resetButtonColor(); // ボタンの色をリセット
    isPopupVisible = false;
}

function showSection(sectionId) {
    document.querySelectorAll('.form-section').forEach(section => section.classList.remove("active"));
    document.getElementById(sectionId).classList.add("active");
    updateButtonColor(sectionId); // ボタンの色を更新

    // ポップアップのサイズを調整
    const popup = document.getElementById("popup");
    if(sectionId === 'addSection'){
        popup.style.height = '30vh';
    }else if(sectionId === 'editSection'){
        popup.style.height = '45vh';
    }else if(sectionId === 'deleteSection'){
        popup.style.height = '30vh';
    }
}
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let currentDate = new Date();

function renderCalendar(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  // 月と年を表示
  document.getElementById('month').textContent = `${monthNames[month]}`;
  document.getElementById('year').textContent = `${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const prevLastDate = new Date(year, month, 0).getDate();
  const calendarBody = document.getElementById('calendar-body');
  calendarBody.innerHTML = "";

  // 前月の最後の日付を表示
  for (let i = firstDay - 1; i >= 0; i--) {
    const cell = document.createElement("div");
    cell.classList.add("inactive");
    cell.textContent = prevLastDate - i;
    calendarBody.appendChild(cell);
  }

  // 当月の日付を表示
  for (let i = 1; i <= lastDate; i++) {
    const cell = document.createElement("div");
    cell.textContent = i;
    if (new Date(year, month, i).getDay() === 0) cell.classList.add("sunday");
    if (new Date(year, month, i).getDay() === 6) cell.classList.add("saturday");
    calendarBody.appendChild(cell);
  }

  // 次月の最初の日付を表示
  const remainingCells = 42 - calendarBody.children.length;
  for (let i = 1; i <= remainingCells; i++) {
    const cell = document.createElement("div");
    cell.classList.add("inactive");
    cell.textContent = i;
    calendarBody.appendChild(cell);
  }
}

// 初回のカレンダー描画
renderCalendar(currentDate);

