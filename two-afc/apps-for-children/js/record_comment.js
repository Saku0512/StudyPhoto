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
                            <th>日付</th>
                            <th>コメント</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            const availableDates = new Set();
            data.forEach(comment => {
                tableHTML += `<tr><td>${comment.study_date}</td><td>${comment.comment_text}</td></tr>`;
                availableDates.add(comment.study_date);
            });
            
            tableHTML += `
                    </tbody>
                </table>
            `;
            commentList.innerHTML = tableHTML;

            // カレンダーの設定
            flatpickr("#commentDate", {
                enable: Array.from(availableDates), // 有効な日付を設定
                dateFormat: "Y-m-d"
            });
        })
        .catch(error => console.error('Error fetching comments:', error));
});
