// ============================================
// СПРАВКА
// Статичная часть — инструкция, написана один раз.
// Динамическая часть — дерево калькуляторов, строится
// каждый раз заново из window.CalculatorRegistry, поэтому
// не может устареть: что зарегистрировано, то и покажется.
// ============================================

const HELP_STATIC_HTML = `
    <h3>Как пользоваться избранным</h3>
    <p>Открыв любой калькулятор, под кнопкой «Рассчитать» появляется кнопка
    «☆ В избранное». Нажмите — калькулятор отмечен звездой.</p>
    <p>Дальше это работает в двух местах сразу:</p>
    <ul>
        <li><strong>Внутри своего раздела.</strong> Зайдя, например, в «Коробку»,
        избранные калькуляторы этого раздела будут показаны первыми, с пометкой ★,
        отделены чертой от остальных.</li>
        <li><strong>В отдельном разделе «⭐ Избранное».</strong> Он появляется
        в самом верху списка разделов, как только отмечен хотя бы один
        калькулятор. Здесь собраны избранные калькуляторы из ВСЕХ разделов
        сразу, с пометкой, откуда каждый.</li>
    </ul>

    <h3>Как перенести избранное на другое устройство</h3>
    <p>Избранное хранится в этом браузере на этом устройстве — на телефоне
    и на компьютере списки разные, если их не перенести вручную.</p>
    <p>Кнопка «⭐ Скачать избранное» сохраняет файл с расширением
    <code>.stroycalc</code>. Этот файл можно переслать себе в мессенджер,
    на почту, куда угодно.</p>
    <p>На другом устройстве — кнопка «📥 Загрузить избранное», выбрать
    присланный файл. Списки объединятся: то, что уже было отмечено на этом
    устройстве, не потеряется.</p>

    <h3>Как работает калькулятор в целом</h3>
    <ol>
        <li>Выбрать раздел.</li>
        <li>Если у раздела есть подразделы (например, «Инженерные системы») —
        выбрать подраздел.</li>
        <li>Выбрать конкретный калькулятор.</li>
        <li>Заполнить поля.</li>
        <li>Нажать «Рассчитать».</li>
        <li>Результат можно скопировать, скачать как TXT или распечатать —
        кнопки появляются под результатом.</li>
    </ol>
`;

function buildCalculatorTreeHtml() {
    const all = window.CalculatorRegistry.getAll();

    if (all.length === 0) {
        return "<p>Калькуляторы ещё не загружены.</p>";
    }

    const sections = [...new Set(all.map(c => c.section))]
        .sort((a, b) => a.localeCompare(b, "ru"));

    let html = "";

    sections.forEach(section => {
        html += `<div class="help-tree-section">${section}</div>`;

        const subsections = [...new Set(
            all.filter(c => c.section === section)
               .map(c => c.subsection)
               .filter(s => s !== null)
        )].sort((a, b) => a.localeCompare(b, "ru"));

        if (subsections.length > 0) {
            subsections.forEach(sub => {
                html += `<div class="help-tree-subsection">${sub}</div>`;
                const calcs = all
                    .filter(c => c.section === section && c.subsection === sub)
                    .sort((a, b) => a.name.localeCompare(b.name, "ru"));
                html += "<ul class='help-tree-list'>";
                calcs.forEach(c => { html += `<li>${c.name}</li>`; });
                html += "</ul>";
            });
        } else {
            const calcs = all
                .filter(c => c.section === section && c.subsection === null)
                .sort((a, b) => a.name.localeCompare(b.name, "ru"));
            html += "<ul class='help-tree-list'>";
            calcs.forEach(c => { html += `<li>${c.name}</li>`; });
            html += "</ul>";
        }
    });

    html += `<p class="help-tree-count">Всего калькуляторов: ${all.length}</p>`;

    return html;
}

function openHelpModal() {
    let overlay = document.getElementById("help-overlay");

    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "help-overlay";
        overlay.className = "help-overlay";

        const box = document.createElement("div");
        box.className = "help-box";

        const closeBtn = document.createElement("button");
        closeBtn.className = "help-close-btn";
        closeBtn.textContent = "✕";
        closeBtn.addEventListener("click", closeHelpModal);

        const content = document.createElement("div");
        content.id = "help-content";
        content.className = "help-content";

        box.appendChild(closeBtn);
        box.appendChild(content);
        overlay.appendChild(box);
        document.body.appendChild(overlay);

        // Закрытие по клику вне окна
        overlay.addEventListener("click", function(e) {
            if (e.target === overlay) closeHelpModal();
        });
    }

    const content = document.getElementById("help-content");
    content.innerHTML = HELP_STATIC_HTML +
        "<h3>Дерево калькуляторов (обновляется автоматически)</h3>" +
        buildCalculatorTreeHtml();

    overlay.classList.add("help-overlay-visible");
}

function closeHelpModal() {
    const overlay = document.getElementById("help-overlay");
    if (overlay) overlay.classList.remove("help-overlay-visible");
}

const helpBtn = document.getElementById("open-help");
if (helpBtn) {
    helpBtn.addEventListener("click", openHelpModal);
}
