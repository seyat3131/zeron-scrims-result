document.addEventListener('DOMContentLoaded', () => {
    // 1. Canlı Tarih Güncelleme
    const liveDateElement = document.getElementById('live-date');

    function updateLiveDate() {
        const now = new Date();
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        };
        const formattedDate = now.toLocaleDateString('tr-TR', options);
        liveDateElement.textContent = formattedDate;
    }

    // Her saniye (1000ms) tarihi güncelle
    setInterval(updateLiveDate, 1000);
    updateLiveDate(); // Sayfa yüklenince hemen göster

    // 2. Puan Durumu Verisi (Başlangıç veya Kaydedilmiş Veri)

    // Başlangıç verisi (Veri yoksa bu kullanılır)
    let initialScores = [];
    for (let i = 1; i <= 18; i++) {
        initialScores.push({ rank: `#${i < 10 ? '0' + i : i}`, team: `Takım ${i}`, total: '0' });
    }

    // LocalStorage'dan kayıtlı veriyi yükle veya başlangıç verisini kullan
    let scores = JSON.parse(localStorage.getItem('zeronScores')) || initialScores;

    const scoreRowsContainer = document.getElementById('score-rows');

    function renderScoreboard(editable = false) {
        scoreRowsContainer.innerHTML = ''; // Temizle
        
        // Tabloyu ikiye bölerek göster
        const half = Math.ceil(scores.length / 2);
        
        for (let i = 0; i < half; i++) {
            const row = document.createElement('div');
            row.className = 'score-row';

            // Sol Kolon Verileri
            const leftData = scores[i];
            row.innerHTML += `
                <span class="score-cell rank-col">${leftData.rank}</span>
                <span class="score-cell team-col ${editable ? 'editable' : ''}" data-index="${i}" data-field="team">${leftData.team}</span>
                <span class="score-cell total-col ${editable ? 'editable' : ''}" data-index="${i}" data-field="total">${leftData.total}</span>
            `;

            // Sağ Kolon Verileri
            const rightIndex = i + half;
            if (scores[rightIndex]) {
                const rightData = scores[rightIndex];
                row.innerHTML += `
                    <span class="score-cell rank-col">${rightData.rank}</span>
                    <span class="score-cell team-col ${editable ? 'editable' : ''}" data-index="${rightIndex}" data-field="team">${rightData.team}</span>
                    <span class="score-cell total-col ${editable ? 'editable' : ''}" data-index="${rightIndex}" data-field="total">${rightData.total}</span>
                `;
            } else {
                 // Boş hücreler (Simetri için)
                row.innerHTML += `
                    <span class="score-cell rank-col"></span>
                    <span class="score-cell team-col"></span>
                    <span class="score-cell total-col"></span>
                `;
            }

            scoreRowsContainer.appendChild(row);
        }

        // Düzenlenebilir hale getir
        if (editable) {
            document.querySelectorAll('.editable').forEach(cell => {
                cell.setAttribute('contenteditable', 'true');
            });
        }
    }

    // Sayfa yüklenince tabloyu göster
    renderScoreboard(false);

    // 3. Yönetici Düzenleme Fonksiyonları

    let editMode = false;
    const toggleButton = document.getElementById('toggle-edit-mode');
    const saveButton = document.getElementById('save-data');

    toggleButton.addEventListener('click', () => {
        editMode = !editMode;
        if (editMode) {
            alert('Düzenleme Modu Açıldı. İstediğiniz kutucuklara tıklayıp düzenleme yapabilirsiniz. Bitince "Verileri Kaydet" butonuna basın.');
        } else {
            alert('Düzenleme Modu Kapatıldı. Kaydedilmemiş değişiklikler kaybolacaktır.');
            // Düzenleme modundan çıkınca veriyi yeniden yükle
            scores = JSON.parse(localStorage.getItem('zeronScores')) || initialScores;
        }
        renderScoreboard(editMode);
    });

    saveButton.addEventListener('click', () => {
        if (!editMode) {
            alert('Önce Düzenleme Modunu açmanız gerekiyor.');
            return;
        }
        
        // Yeni verileri topla
        document.querySelectorAll('.editable').forEach(cell => {
            const index = cell.getAttribute('data-index');
            const field = cell.getAttribute('data-field');
            const newValue = cell.textContent.trim();
            
            if (scores[index]) {
                scores[index][field] = newValue;
            }
        });

        // Veriyi LocalStorage'a kaydet
        localStorage.setItem('zeronScores', JSON.stringify(scores));
        
        // Tabloyu yeniden çiz (görüntüleme modunda)
        renderScoreboard(false);
        editMode = false;
        alert('Veriler başarıyla kaydedildi ve tüm ziyaretçiler için güncellendi!');
    });
});
