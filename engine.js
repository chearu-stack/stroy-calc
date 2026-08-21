// ============================================
// ДВИЖОК
// Читает реестр калькуляторов, строит интерфейс.
// Не знает ни одного калькулятора по имени.
// Поддерживает условные поля через visibleWhen.
// ============================================

const sectionSelect = document.getElementById("section");
const subsectionBlock = document.getElementById("subsection-block");
const subsectionSelect = document.getElementById("subsection");
const calculatorBlock = document.getElementById("calculator-block");
const calculatorSelect = document.getElementById("calculator");
const fieldsBlock = document.getElementById("fields");
const calculateBtn = document.getElementById("calculate");
const resultBlock = document.getElementById("result");
const exportBlock = document.getElementById("export-block");
const copyBtn = document.getElementById("copy-result");
const downloadBtn = document.getElementById("download-txt");
const printBtn = document.getElementById("print-result");

let currentCalculator = null;
let lastInput = null;
let lastResult = null;
let lastFieldEntries = null; // [{label, value}] в порядке отображения — для экспорта

// ---------- ИЗБРАННОЕ ----------
// Хранится в localStorage браузера, как список id калькуляторов.
// Ни один калькулятор ничего не знает про эту механику — это чисто
// фронтенд-слой поверх уже существующего реестра.

const FAVORITES_KEY = "stroy-calc-favorites";
const FAVORITES_SECTION = "⭐ Избранное";

function getFavorites() {
    try {
        const raw = localStorage.getItem(FAVORITES_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function saveFavorites(ids) {
    try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
    } catch (e) {
        // localStorage недоступен (приватный режим и т.п.) — просто не сохраняем
    }
}

function isFavorite(id) {
    return getFavorites().includes(id);
}

function toggleFavorite(id) {
    const favorites = getFavorites();
    const index = favorites.indexOf(id);
    if (index === -1) {
        favorites.push(id);
    } else {
        favorites.splice(index, 1);
    }
    saveFavorites(favorites);
}

function init() {
    const sections = [...new Set(
        window.CalculatorRegistry.getAll().map(c => c.section)
    )].sort((a, b) => a.localeCompare(b, "ru"));

    if (getFavorites().length > 0) {
        const favOption = document.createElement("option");
        favOption.value = FAVORITES_SECTION;
        favOption.textContent = FAVORITES_SECTION;
        sectionSelect.appendChild(favOption);
    }

    sections.forEach(section => {
        const option = document.createElement("option");
        option.value = section;
        option.textContent = section;
        sectionSelect.appendChild(option);
    });
}

function resetFields() {
    fieldsBlock.innerHTML = "";
    fieldsBlock.classList.add("hidden");
    calculateBtn.classList.add("hidden");
    resultBlock.classList.add("hidden");
    exportBlock.classList.add("hidden");
    currentCalculator = null;
    lastInput = null;
    lastResult = null;
    lastFieldEntries = null;

    const favBtn = document.getElementById("favorite-btn");
    if (favBtn) favBtn.classList.add("hidden");
}

function fillFavoriteCalculators() {
    calculatorSelect.innerHTML = '<option value="">— Выберите калькулятор —</option>';
    resetFields();

    const favoriteIds = getFavorites();
    const list = favoriteIds
        .map(id => window.CalculatorRegistry.getById(id))
        .filter(calc => calc !== undefined) // на случай, если калькулятор был удалён из реестра
        .sort((a, b) => a.name.localeCompare(b.name, "ru"));

    list.forEach(calc => {
        const option = document.createElement("option");
        option.value = calc.id;
        // Показываем раздел в скобках — в "Избранном" калькуляторы вперемешку из разных разделов
        option.textContent = calc.subsection
            ? `${calc.name} (${calc.section} → ${calc.subsection})`
            : `${calc.name} (${calc.section})`;
        calculatorSelect.appendChild(option);
    });

    calculatorBlock.classList.remove("hidden");
}

function buildCalculatorOptions(list) {
    calculatorSelect.innerHTML = '<option value="">— Выберите калькулятор —</option>';

    const favorites = list.filter(calc => isFavorite(calc.id));
    const rest = list.filter(calc => !isFavorite(calc.id));

    favorites.forEach(calc => {
        const option = document.createElement("option");
        option.value = calc.id;
        option.textContent = `★ ${calc.name}`;
        calculatorSelect.appendChild(option);
    });

    if (favorites.length > 0 && rest.length > 0) {
        const separator = document.createElement("option");
        separator.disabled = true;
        separator.textContent = "──────────";
        calculatorSelect.appendChild(separator);
    }

    rest.forEach(calc => {
        const option = document.createElement("option");
        option.value = calc.id;
        option.textContent = calc.name;
        calculatorSelect.appendChild(option);
    });
}

function fillCalculators(section, subsection) {
    resetFields();

    const list = window.CalculatorRegistry.getAll()
        .filter(c => c.section === section && c.subsection === subsection)
        .sort((a, b) => a.name.localeCompare(b.name, "ru"));

    // Внутри раздела избранные калькуляторы (из ЭТОГО раздела) поднимаются
    // наверх с пометкой ★ — чтобы прораб/контролёр, зайдя в раздел с 15-25
    // калькуляторами, сразу видел свои 2-3 нужных, не листая весь список.
    buildCalculatorOptions(list);

    calculatorBlock.classList.remove("hidden");
}

sectionSelect.addEventListener("change", function() {
    const section = this.value;

    subsectionSelect.innerHTML = '<option value="">— Выберите подраздел —</option>';
    calculatorSelect.innerHTML = '<option value="">— Выберите калькулятор —</option>';
    resetFields();

    if (section === FAVORITES_SECTION) {
        subsectionBlock.classList.add("hidden");
        fillFavoriteCalculators();
        return;
    }

    const subsections = [...new Set(
        window.CalculatorRegistry.getAll()
            .filter(c => c.section === section)
            .map(c => c.subsection)
            .filter(s => s !== null)
    )].sort((a, b) => a.localeCompare(b, "ru"));

    if (subsections.length > 0) {
        subsectionBlock.classList.remove("hidden");
        calculatorBlock.classList.add("hidden");

        subsections.forEach(sub => {
            const option = document.createElement("option");
            option.value = sub;
            option.textContent = sub;
            subsectionSelect.appendChild(option);
        });
    } else {
        subsectionBlock.classList.add("hidden");
        fillCalculators(section, null);
    }
});

subsectionSelect.addEventListener("change", function() {
    const section = sectionSelect.value;
    const subsection = this.value;
    fillCalculators(section, subsection);
});

// ---------- ОТРИСОВКА ПОЛЕЙ ----------

function fieldIsVisible(field, inputs) {
    if (!field.visibleWhen) return true;
    const condition = field.visibleWhen;
    return inputs[condition.field] === condition.equals;
}

// ---------- ГЕНЕРИРУЕМЫЕ ГРУППЫ ПОЛЕЙ ----------
// Поле с generatesGroup — это счётчик (type: "number"), значение которого
// определяет, сколько повторяющихся групп подполей показать.
// Пример: "Количество окон" → генерирует "Окно №1: ширина/высота",
// "Окно №2: ширина/высота" и т.д.
//
// Существующие подполя НЕ удаляются при уменьшении числа — только
// скрываются (тот же принцип, что и у visibleWhen), чтобы не терять
// уже введённые значения при случайном изменении счётчика.

function renderGeneratedGroup(field, container) {
    const countInput = document.getElementById("field-" + field.id);
    if (!countInput) return;

    const maxCount = field.generatesGroup.maxCount || 20;
    const requested = parseInt(countInput.value);
    const target = isNaN(requested) ? 0 : Math.max(0, Math.min(requested, maxCount));

    const existingItems = container.querySelectorAll(".generated-item");

    // Показать/скрыть уже существующие
    existingItems.forEach(item => {
        const idx = parseInt(item.dataset.index);
        item.style.display = idx <= target ? "" : "none";
    });

    // Досоздать недостающие
    for (let i = existingItems.length + 1; i <= target; i++) {
        const itemWrapper = document.createElement("div");
        itemWrapper.className = "generated-item";
        itemWrapper.dataset.index = i;

        const itemTitle = document.createElement("div");
        itemTitle.className = "generated-item-title";
        itemTitle.textContent = (field.generatesGroup.itemLabel || "Элемент №{n}").replace("{n}", i);
        itemWrapper.appendChild(itemTitle);

        field.generatesGroup.fields.forEach(subField => {
            const subWrapper = document.createElement("div");
            subWrapper.className = "block";

            const subLabel = document.createElement("label");
            subLabel.textContent = subField.label;
            subWrapper.appendChild(subLabel);

            const input = document.createElement("input");
            input.type = subField.type || "number";
            input.id = `field-${field.id}_${i}_${subField.suffix}`;
            if (subField.step) input.step = subField.step;
            if (subField.min !== undefined) input.min = subField.min;
            subWrapper.appendChild(input);

            itemWrapper.appendChild(subWrapper);
        });

        container.appendChild(itemWrapper);
    }
}

function renderFields() {
    fieldsBlock.innerHTML = "";
    fieldsBlock.classList.remove("hidden");
    calculateBtn.classList.remove("hidden");
    resultBlock.classList.add("hidden");
    exportBlock.classList.add("hidden");

    currentCalculator.fields.forEach(field => {
        const wrapper = document.createElement("div");
        wrapper.className = "block";
        wrapper.id = "field-wrapper-" + field.id;

        const label = document.createElement("label");
        label.textContent = field.label;
        wrapper.appendChild(label);

        if (field.type === "select") {
            const select = document.createElement("select");
            select.id = "field-" + field.id;

            const options = typeof field.options === "function"
                ? field.options()
                : field.options;

            options.forEach(opt => {
                const option = document.createElement("option");
                option.value = opt;
                option.textContent = opt;
                select.appendChild(option);
            });

            // При изменении — перерисовываем зависимые поля
            select.addEventListener("change", function() {
                updateDependentFields();
            });

            wrapper.appendChild(select);
        } else {
            const input = document.createElement("input");
            input.type = field.type;
            input.id = "field-" + field.id;
            if (field.step) input.step = field.step;
            if (field.min) input.min = field.min;
            if (field.max) input.max = field.max;
            if (field.placeholder) input.placeholder = field.placeholder;
            wrapper.appendChild(input);

            // Поле-счётчик с generatesGroup — при изменении перерисовываем группу
            if (field.generatesGroup) {
                const container = document.createElement("div");
                container.id = "generated-" + field.id;
                container.className = "generated-container";

                input.addEventListener("input", function() {
                    renderGeneratedGroup(field, container);
                });

                fieldsBlock.appendChild(wrapper);
                fieldsBlock.appendChild(container);
                return; // wrapper уже добавлен, пропускаем общий appendChild ниже
            }
        }

        fieldsBlock.appendChild(wrapper);
    });

    // Скрыть/показать зависимые поля
    updateDependentFields();
}

function getCurrentInputs() {
    const inputs = {};
    currentCalculator.fields.forEach(field => {
        const element = document.getElementById("field-" + field.id);
        if (element) inputs[field.id] = element.value;
    });
    return inputs;
}

function updateDependentFields() {
    const inputs = getCurrentInputs();

    currentCalculator.fields.forEach(field => {
        const wrapper = document.getElementById("field-wrapper-" + field.id);
        if (!wrapper) return;

        const visible = fieldIsVisible(field, inputs);
        wrapper.style.display = visible ? "" : "none";
    });
}

calculatorSelect.addEventListener("change", function() {
    const calc = window.CalculatorRegistry.getById(this.value);
    if (!calc) return;

    currentCalculator = calc;
    renderFields();
    renderFavoriteButton();
});

// ---------- КНОПКА ИЗБРАННОГО ----------

function renderFavoriteButton() {
    let btn = document.getElementById("favorite-btn");

    if (!btn) {
        btn = document.createElement("button");
        btn.id = "favorite-btn";
        btn.type = "button";
        btn.className = "favorite-btn";
        calculateBtn.insertAdjacentElement("afterend", btn);

        btn.addEventListener("click", function() {
            if (!currentCalculator) return;
            const calcId = currentCalculator.id;
            toggleFavorite(calcId);
            updateFavoriteButtonLabel();

            // Перестраиваем ТОЛЬКО список опций (не поля формы!), чтобы
            // пометка ★ обновилась сразу, а уже введённые пользователем
            // значения в форме не потерялись.
            if (sectionSelect.value === FAVORITES_SECTION) {
                if (!isFavorite(calcId)) {
                    // Калькулятор исчез из избранного — здесь его больше
                    // не должно быть в списке, поля сбрасываем осознанно
                    fillFavoriteCalculators();
                } else {
                    const list = getFavorites()
                        .map(id => window.CalculatorRegistry.getById(id))
                        .filter(c => c !== undefined)
                        .sort((a, b) => a.name.localeCompare(b.name, "ru"));
                    buildCalculatorOptions(list);
                    calculatorSelect.value = calcId;
                }
            } else {
                const list = window.CalculatorRegistry.getAll()
                    .filter(c => c.section === sectionSelect.value && c.subsection === (subsectionSelect.value || null))
                    .sort((a, b) => a.name.localeCompare(b.name, "ru"));
                buildCalculatorOptions(list);
                calculatorSelect.value = calcId;
            }
        });
    }

    btn.classList.remove("hidden");
    updateFavoriteButtonLabel();
}

function updateFavoriteButtonLabel() {
    const btn = document.getElementById("favorite-btn");
    if (!btn || !currentCalculator) return;

    const active = isFavorite(currentCalculator.id);
    btn.textContent = active ? "★ В избранном" : "☆ В избранное";
    btn.classList.toggle("favorite-btn-active", active);
}

// ---------- РАСЧЁТ ----------

calculateBtn.addEventListener("click", function() {
    if (!currentCalculator) return;

    lastInput = {};
    lastFieldEntries = [];

    // Собираем ВСЕ поля, реально существующие в DOM на момент расчёта —
    // это включает и статичные поля из currentCalculator.fields,
    // и динамически сгенерированные (generatesGroup).
    const elements = fieldsBlock.querySelectorAll("input[id^='field-'], select[id^='field-']");

    elements.forEach(element => {
        const id = element.id.replace(/^field-/, "");
        lastInput[id] = element.value;

        const wrapper = element.closest(".block");
        const labelEl = wrapper ? wrapper.querySelector("label") : null;
        let label = labelEl ? labelEl.textContent : id;

        const generatedItem = element.closest(".generated-item");
        if (generatedItem) {
            const title = generatedItem.querySelector(".generated-item-title");
            if (title) label = `${title.textContent} — ${label}`;
        }

        lastFieldEntries.push({ label, value: element.value });
    });

    lastResult = currentCalculator.calculate(lastInput);
    resultBlock.textContent = lastResult;
    resultBlock.classList.remove("hidden");
    exportBlock.classList.remove("hidden");
});

// ============================================
// ЭКСПОРТ
// ============================================

function buildExportText() {
    if (!currentCalculator || !lastInput || !lastResult) return "";

    const now = new Date();
    const date = now.toLocaleDateString("ru-RU");
    const time = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

    let out = "════════════════════════════════\n";
    out += "  STROY-CALC — Расчёт\n";
    out += "════════════════════════════════\n\n";
    out += `Калькулятор: ${currentCalculator.name}\n`;
    out += `Раздел: ${currentCalculator.section}`;
    if (currentCalculator.subsection) {
        out += ` → ${currentCalculator.subsection}`;
    }
    out += `\nДата: ${date}, ${time}\n\n`;

    out += "━━━ Введённые данные ━━━\n";
    (lastFieldEntries || []).forEach(entry => {
        if (entry.value !== undefined && entry.value !== "") {
            out += `${entry.label}: ${entry.value}\n`;
        }
    });

    out += "\n━━━ Результат ━━━\n";
    out += lastResult;
    out += "\n\n════════════════════════════════\n";
    out += "  stroy-calc.local\n";
    out += "════════════════════════════════";

    return out;
}

copyBtn.addEventListener("click", function() {
    const text = buildExportText();
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
        const original = copyBtn.textContent;
        copyBtn.textContent = "Скопировано ✓";
        setTimeout(() => {
            copyBtn.textContent = original;
        }, 1500);
    }).catch(() => {
        alert("Не удалось скопировать. Скопируйте вручную.");
    });
});

downloadBtn.addEventListener("click", function() {
    const text = buildExportText();
    if (!text) return;

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stroy-calc_${currentCalculator.id}_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
});

printBtn.addEventListener("click", function() {
    window.print();
});

// ============================================
// ПЕРЕНОС ИЗБРАННОГО МЕЖДУ УСТРОЙСТВАМИ
// Файл с расширением .stroycalc — по факту обычный JSON, но необычное
// расширение отбивает случайное желание залезть внутрь через блокнот.
// ============================================

const FAVORITES_FILE_TYPE = "stroy-calc-favorites";

const downloadFavoritesBtn = document.getElementById("download-favorites");
const uploadFavoritesBtn = document.getElementById("upload-favorites");
const favoritesFileInput = document.getElementById("favorites-file-input");

downloadFavoritesBtn.addEventListener("click", function() {
    const favorites = getFavorites();

    if (favorites.length === 0) {
        alert("Список избранного пуст — нечего скачивать.");
        return;
    }

    const payload = {
        type: FAVORITES_FILE_TYPE,
        version: 1,
        favorites: favorites
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stroy-calc-favorites_${Date.now()}.stroycalc`;
    a.click();
    URL.revokeObjectURL(url);
});

uploadFavoritesBtn.addEventListener("click", function() {
    favoritesFileInput.click();
});

favoritesFileInput.addEventListener("change", function() {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {
        let data;
        try {
            data = JSON.parse(e.target.result);
        } catch (err) {
            alert("Файл повреждён или имеет неверный формат.");
            favoritesFileInput.value = "";
            return;
        }

        if (!data || data.type !== FAVORITES_FILE_TYPE || !Array.isArray(data.favorites)) {
            alert("Это не файл избранного stroy-calc.");
            favoritesFileInput.value = "";
            return;
        }

        // Слияние, не замена — избранное с этого устройства не теряется
        const current = getFavorites();
        const merged = [...new Set([...current, ...data.favorites])];
        saveFavorites(merged);

        favoritesFileInput.value = "";

        alert(`Добавлено в избранное: ${data.favorites.length}. Страница сейчас обновится.`);
        window.location.reload();
    };

    reader.readAsText(file);
});

init();
