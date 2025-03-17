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
                    : studyDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); // 例: 03/14/2025

                tableHTML += `<tr><td>${formattedDate}</td><td>${comment.comment_text}</td></tr>`;

                // 有効日をセットに追加
                const isoDate = studyDate.toISOString().split('T')[0]; // YYYY-MM-DD形式
                availableDates.add(isoDate);
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
                    // ローカルタイムで日付フォーマット
                    const selectedDate = selectedDates[0];
                    const year = selectedDate.getFullYear();
                    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                    const day = String(selectedDate.getDate()).padStart(2, '0');
                    const isoDate = `${year}-${month}-${day}`;

                    fetch(`../../php/record/fetch_date_comment.php?date=${isoDate}`)
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
                                const studyDate = new Date(comment.study_date);
                                const formattedDate = language === 'ja'
                                    ? studyDate.toLocaleDateString('Ja-JP', {year: 'numeric', month: 'long', day: 'numeric'}) // 2025年3月14日
                                    : studyDate.toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'}); // March 14, 2025
                                filteredTableHTML += `<tr><td>${formattedDate}</td><td>${comment.comment_text}</td></tr>`;
                            });
                            // デバッグ用ログ
                            console.log('Available Dates:', Array.from(availableDates));
                            console.log('Fetched Data:', data);

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
