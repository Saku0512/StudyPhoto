const language = document.getElementById("hidden_language").value;
const langday = language === 'ja' ? '日付' : 'Date';
const langcomment = language === 'ja' ? 'コメント' : 'Comment';
const locale = language === 'ja' ? 'ja' : 'en';
const dataFormat = language === 'ja' ? 'Y-m-d' : 'm-d-Y'; // 日付フォーマット

document.addEventListener('DOMContentLoaded', () => {
    const commentList = document.querySelector('.comment-list');
    const clearButton = document.getElementById('clearButton');
    const searchInput = document.getElementById('commentText');
    const searchIcon = document.getElementById('searchIcon');

    fetchComments().then(({ tableHTML, availableDates }) => {
        commentList.innerHTML = tableHTML;
        setupCalendar(availableDates);
    });

    clearButton.addEventListener('click', clearComments);
    searchIcon.addEventListener('click', () => searchComments(searchInput.value.trim()));
    searchInput.addEventListener('change', () => searchComments(searchInput.value.trim()));
});

async function fetchComments() {
    try {
        const response = await fetch('../../php/record/fetch_comment.php');
        const data = await response.json();

        if (!Array.isArray(data)) {
            console.error('Error fetching comments:', data.error || 'Unexpected response format');
            return { tableHTML: '', availableDates: new Set() };
        }

        const availableDates = new Set();
        let tableHTML = generateTableHTML(data, availableDates);

        return { tableHTML, availableDates };
    } catch (error) {
        console.error('Error fetching comments:', error);
        return { tableHTML: '', availableDates: new Set() };
    }
}

function generateTableHTML(data, availableDates) {
    let tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>${langday}</th>
                    <th>${langcomment}</th>
                </tr>
            </thead>
            <tbody>
    `;

    data.forEach(comment => {
        const studyDate = new Date(comment.study_date);
        const formattedDate = formatDate(studyDate);
        tableHTML += `<tr><td>${formattedDate}</td><td>${comment.comment_text}</td></tr>`;
        availableDates.add(studyDate.toISOString().split('T')[0]);
    });

    tableHTML += '</tbody></table>';
    return tableHTML;
}

function formatDate(date) {
    return language === 'ja'
        ? date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
        : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function setupCalendar(availableDates) {
    flatpickr("#commentDate", {
        locale,
        enable: Array.from(availableDates),
        dateFormat: dataFormat,
        onChange: handleDateChange,
        onDayCreate: (dObj, dStr, fp, dayElem) => {
            const dateString = new Date(dayElem.dateObj.getTime() - dayElem.dateObj.getTimezoneOffset() * 60000).toISOString().split('T')[0];
            dayElem.classList.add(availableDates.has(dateString) ? 'has-study-record' : 'no-study-record');
        }
    });
}

async function handleDateChange(selectedDates) {
    if (!selectedDates.length) return;

    // ローカルタイムで日付フォーマット
    const selectedDate = selectedDates[0];
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const isoDate = `${year}-${month}-${day}`;
    try {
        const response = await fetch(`../../php/record/fetch_date_comment.php?date=${isoDate}`);
        const data = await response.json();

        if (!Array.isArray(data)) {
            console.error('Error fetching comments:', data.error || 'Unexpected response format');
            return;
        }

        const filteredTableHTML = generateTableHTML(data, new Set());
        document.querySelector('.comment-list').innerHTML = filteredTableHTML;
    } catch (error) {
        console.error('Error fetching comments:', error);
    }
}

function clearComments() {
    document.getElementById('commentDate').value = '';
    document.getElementById('commentText').value = '';
    fetchComments().then(({ tableHTML }) => {
        document.querySelector('.comment-list').innerHTML = tableHTML;
    });
}

async function searchComments(keyword) {
    if (!keyword) return;

    try {
        const response = await fetch(`../../php/record/fetch_keyword_comment.php?keyword=${encodeURIComponent(keyword)}`);
        const data = await response.json();

        if (!Array.isArray(data)) {
            console.error('Error fetching comments:', data.error || 'Unexpected response format');
            return;
        }

        const filteredTableHTML = generateTableHTML(data, new Set());
        document.querySelector('.comment-list').innerHTML = filteredTableHTML;
    } catch (error) {
        console.error('Error fetching comments:', error);
    }
}
