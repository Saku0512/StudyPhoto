fetch('../../php/record/note.php')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.status);
        }
        const contentType = response.headers.get("Content-Type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Expected JSON response, but got " + contentType);
        }
        return response.json();
    })
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }

        // 画像の処理
        const noteSection = document.getElementById('noteSection');
        if (data.images && data.images.length > 0) {
            data.images.forEach(base64EncodedUrl => {
                try {
                    console.log(base64EncodedUrl);
                    const decodedUrl = Base64.decode(base64EncodedUrl); // Base64をデコード
                    console.log(decodedUrl); // デコードされたURLを確認

                    const imagePath = decodedUrl.replace('/var/www/html', ''); // /var/www/html を削除
                    console.log(imagePath);

                    const imageElement = document.createElement('div');
                    imageElement.classList.add('image-container');

                    const img = document.createElement('img');
                    img.src = imagePath; // デコードしたURLをimg要素のsrcに設定
                    img.alt = 'Study Image';
                    img.classList.add('study-image');

                    imageElement.appendChild(img);
                    noteSection.appendChild(imageElement);
                } catch (error) {
                    console.error('Failed to decode Base64 URL:', error);
                }
            });
        } else {
            noteSection.innerHTML = '<p>No images available.</p>';
        }

        // カテゴリーの処理
        const categorySection = document.getElementById('categorySection');
        if (data.categories && data.categories.length > 0) {
            data.categories.forEach(category => {
                const categoryElement = document.createElement('div');
                categoryElement.classList.add('category-item');
                categoryElement.textContent = category; // カテゴリー名を表示
                categorySection.appendChild(categoryElement);
            });
        } else {
            categorySection.innerHTML = '<p>No categories available.</p>';
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });