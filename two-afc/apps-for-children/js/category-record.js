const popupElements = [
    { selector: "#popupOverlay", event: 'click', handler: hidePopup_category },
    { selector: "#popupContent", event: 'click', handler: (e) => e.stopPropagation() },
    { selector: ".close-button", event: 'click', handler: hidePopup_category }
];

popupElements.forEach(({ selector, event, handler }) => {
    document.querySelector(selector).addEventListener(event, handler);
});

const language = document.getElementById("hidden_language").value;

// ポップアップを非表示にし、画像をリセット
function hidePopup_category() {
    const popupContent = document.getElementById("popupContent");
    document.getElementById("popupOverlay").style.display = "none";
    popupContent.style.display = "none";

    // 画像削除
    popupContent.querySelectorAll('embed').forEach(embed => embed.remove());

    // 画像のsrc更新
    document.querySelectorAll('.category-image').forEach(img => {
        if (img.src.includes('file_open.png')) img.src = '../../ui_image/file_close.png';
    });
}

function loadCategories() {
    fetch('../../php/category/get_category.php', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
    })
    .then(categoryData => {
        if (!Array.isArray(categoryData)) return console.error('Invalid category data received:', categoryData);

        const currentPage = window.location.pathname;
        if (currentPage.includes("record_note.php")) {
            const noteSection = document.getElementById("noteSection");
            if (!noteSection) return;

            noteSection.innerHTML = "";

            categoryData.forEach(item => {
                const imageElement = document.createElement('div');
                imageElement.classList.add('image-container');

                const img = document.createElement('img');
                img.src = '../../ui_image/file_close.png';
                img.alt = `${item.category_name}の画像`;
                img.classList.add('category-image', item.category_name);
                img.addEventListener('click', () => {
                    img.src = img.src.includes('file_close.png') ? '../../ui_image/file_open.png' : '../../ui_image/file_close.png';
                    fetchStudyImages(item.category_name);
                });

                const categoryName = document.createElement('span');
                categoryName.classList.add('category-name');
                categoryName.textContent = item.category_name;

                imageElement.append(img, categoryName);
                noteSection.appendChild(imageElement);
            });
        } else {
            const categorySelects = ["category", "editOptionSelect", "deleteOptionSelect"];
            categorySelects.forEach(selectId => {
                const select = document.getElementById(selectId);
                select.innerHTML = `<option value="0">${selectId === 'category' ? '--教科を選択--' : (selectId === 'editOptionSelect' ? '--変更する教科を選択--' : '--削除する教科を選択--')}</option>`;
                categoryData.forEach(item => {
                    const option = document.createElement("option");
                    option.textContent = item.category_name;
                    select.appendChild(option);
                });
            });
        }
    })
    .catch(error => console.error('Error loading categories:', error));
}

// study_data テーブルから画像を取得し、ポップアップに表示
function fetchStudyImages(categoryName) {
    if (!categoryName) return console.error('Category name is missing');

    fetch(`../../php/record/note.php?category=${encodeURIComponent(categoryName)}`)
    .then(response => {
        if (!response.ok) throw new Error('Network error: ' + response.status);
        if (!response.headers.get("Content-Type")?.includes("application/json"))
            throw new Error("Expected JSON, got different content");

        return response.json();
    })
    .then(data => {
        if (data.error) throw new Error(data.error);

        const popupContent = document.getElementById("popupContent");
        const popupText = document.getElementById("popupText");
        if (!popupContent || !popupText) return console.error("Popup elements not found.");

        popupText.innerHTML = `${language === 'ja' ? '選択されたカテゴリー' : 'Selected Category'}: ${categoryName}`;
        
        if (data.images?.length) {
            data.images.sort((a, b) => new Date(b.study_date) - new Date(a.study_date));

            const table = document.createElement('table');
            table.innerHTML = `
                <thead>
                    <tr>
                        <th id="study-date">${language === 'ja' ? '勉強日' : 'Study Date'}</th>
                        <th id="study-time">${language === 'ja' ? '勉強時間' : 'Study Time'}</th>
                        <th id="category">${language === 'ja' ? 'カテゴリー' : 'Category'}</th>
                        <th id="image-link">${language === 'ja' ? '画像リンク' : 'Image Link'}</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.images.map(imageData => `
                        <tr>
                            <td>${new Date(imageData.study_date).toLocaleDateString(language === 'ja' ? 'ja-JP' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}<br>${(imageData.SspentTime || '').toString().split(',').join(',<br>')}</td>
                            <td>${imageData.study_time}</td>
                            <td>${imageData.category}</td>
                            <td>
                                ${imageData.image_path ? `
                                    <a href="${Base64.decode(imageData.image_path).replace('/var/www/html', '')}" onclick="event.preventDefault(); openImageInPopup('${Base64.decode(imageData.image_path)}')">
                                        ${language === 'ja' ? 'PDFリンク' : 'PDF Link'}
                                    </a>` : '画像なし'}
                            </td>
                        </tr>`).join('')}
                </tbody>`;

            popupText.appendChild(table);
        } else {
            popupText.innerHTML = `<p>${language === 'ja' ? '画像が見つかりませんでした。' : 'No images found.'}</p>`;
        }

        document.getElementById("popupOverlay").style.display = "block";
        popupContent.style.display = "block";
    })
    .catch(error => {
        console.error('Error fetching study images:', error);
        const popupContent = document.getElementById("popupContent");
        popupContent.innerHTML = `<p>画像の読み込み中にエラーが発生しました。</p>`;
        document.getElementById("popupOverlay").style.display = "block";
        popupContent.style.display = "block";
    });
}

function openImageInPopup(imagePath) {
    const popupContent = document.getElementById('popupContent');

    const embedElement = Object.assign(document.createElement('embed'), {
        src: imagePath,
        id: 'pdfViewer',
        type: 'application/pdf',
        width: '100%',
        height: '600px'
    });

    popupContent.appendChild(embedElement);
    document.getElementById('popupOverlay').style.display = 'block';
    popupContent.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
});