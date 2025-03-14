const language = document.getElementById("hidden_language").value;
let langday;
let langcomment;
let locale;
let dataFormat;
if (language === 'ja') {
    langday = '日付';
    langcomment = 'コメント';
    locale = 'ja';
    dataFormat = 'Y-m-d'; // YYYY-MM-DD
} else if (language === 'en') {
    langday = 'Date';
    langcomment = 'Comment';
    locale = 'en';
    dataFormat = 'm-d-Y'; // MM-DD-YYYY
}

document.addEventListener('DOMContentLoaded', function() {
    fetch('../../php/record/fetch_comment.php')
        .then(response => response.json())
        .then(data => {
            if (!Array.isArray(data)) {
                console.error('Error fetching comments:', data.error || 'Unexpected response format');
                return;
            }
            const commentList = document.querySelector('.comment-list');
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
            
            const availableDates = new Set();
            data.forEach(comment => {
                // 日付をフォーマット
                const studyDate = new Date(comment.study_date);
                const formattedDate = language === 'ja'
                    ? studyDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }) // 例: 2025年3月14日
                    : studyDate.toLocaleDateString('en-US'); // 例: 03/14/2025

                tableHTML += `<tr><td>${formattedDate}</td><td>${comment.comment_text}</td></tr>`;
            });
            
            tableHTML += `
                    </tbody>
                </table>
            `;
            commentList.innerHTML = tableHTML;

            // カレンダーの設定
            flatpickr("#commentDate", {
                locale: locale, // 日本語ロケールを設定
                enable: Array.from(availableDates), // 有効な日付を設定
                dateFormat: dataFormat,
                onChange: function(selectedDates, dateStr, instance) {
                    fetch(`../../php/record/fetch_date_comment.php?date=${dateStr}`)
                        .then(response => response.json())
                        .then(data => {
                            if (!Array.isArray(data)) {
                                console.error('Error fetching comments:', data.error || 'Unexpected response format');
                                return;
                            }
                            let filteredTableHTML = `
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
                                filteredTableHTML += `<tr><td>${comment.study_date}</td><td>${comment.comment_text}</td></tr>`;
                            });
                            filteredTableHTML += `
                                    </tbody>
                                </table>
                            `;
                            commentList.innerHTML = filteredTableHTML;
                        })
                        .catch(error => console.error('Error fetching comments:', error));
                },
                onDayCreate: function(dObj, dStr, fp, dayElem) {
                    const dateString = new Date(dayElem.dateObj.getTime() - dayElem.dateObj.getTimezoneOffset() * 60000).toISOString().split('T')[0];
                    if (availableDates.has(dateString)) {
                        dayElem.classList.add('has-study-record');
                    } else {
                        dayElem.classList.add('no-study-record');
                    }
                }
            });

            // クリアボタンの設定
            const clearButton = document.getElementById('clearButton');
            clearButton.addEventListener('click', function() {
                document.getElementById('commentDate').value = '';
                document.getElementById('commentText').value = '';
                // 必要に応じて、全コメントを再表示する処理を追加
                commentList.innerHTML = tableHTML;
            });

            const searchInput = document.getElementById('commentText');
            const searchIcon = document.getElementById('searchIcon');

            function searchComments(keyword) {
                fetch(`../../php/record/fetch_keyword_comment.php?keyword=${encodeURIComponent(keyword)}`)
                    .then(response => response.json())
                    .then(data => {
                        if (!Array.isArray(data)) {
                            console.error('Error fetching comments:', data.error || 'Unexpected response format');
                            return;
                        }
                        let filteredTableHTML = `
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
                            // 日付をフォーマット
                            const studyDate = new Date(comment.study_date);
                            const formattedDate = language === 'ja'
                                ? studyDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }) // 例: 2025年3月14日
                                : studyDate.toLocaleDateString('en-US'); // 例: 03/14/2025
            
                            filteredTableHTML += `<tr><td>${formattedDate}</td><td>${comment.comment_text}</td></tr>`;
                        });
                        filteredTableHTML += `
                                </tbody>
                            </table>
                        `;
                        commentList.innerHTML = filteredTableHTML;
                    })
                    .catch(error => console.error('Error fetching comments:', error));
            }

            searchIcon.addEventListener('click', function() {
                const keyword = searchInput.value.trim();
                if (keyword) {
                    searchComments(keyword);
                }
            });

            searchInput.addEventListener('change', function() {
                const keyword = searchInput.value.trim();
                if (keyword) {
                    searchComments(keyword);
                }
            });
        })
        .catch(error => console.error('Error fetching comments:', error));
});
