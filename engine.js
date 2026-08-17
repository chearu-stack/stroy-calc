// ============================================
// ДВИЖОК
// Читает реестр калькуляторов, строит интерфейс.
// Не знает ни одного калькулятора по имени.
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

function init() {
    const sections = [...new Set(
        window.CalculatorRegistry.getAll().map(c => c.section)
    )];

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
}

function fillCalculators(section, subsection) {
    calculatorSelect.innerHTML = '<option value="">— Выберите калькулятор —</option>';
    resetFields();

    const list = window.CalculatorRegistry.getAll().filter(c =>
        c.section === section && c.subsection === subsection
    );

    list.forEach(calc => {
        const option = document.createElement("option");
        option.value = calc.id;
        option.textContent = calc.name;
        calculatorSelect.appendChild(option);
    });

    calculatorBlock.classList.remove("hidden");
}

sectionSelect.addEventListener("change", function() {
    const section = this.value;

    subsectionSelect.innerHTML = '<option value="">— Выберите подраздел —</option>';
    calculatorSelect.innerHTML = '<option value="">— Выберите калькулятор —</option>';
    resetFields();

    const subsections = [...new Set(
        window.CalculatorRegistry.getAll()
            .filter(c => c.section === section)
            .map(c => c.subsection)
            .filter(s => s !== null)
    )];

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

calculatorSelect.addEventListener("change", function() {
    const calc = window.CalculatorRegistry.getById(this.value);
    if (!calc) return;

    currentCalculator = calc;
    fieldsBlock.innerHTML = "";
    fieldsBlock.classList.remove("hidden");
    calculateBtn.classList.remove("hidden");
    resultBlock.classList.add("hidden");
    exportBlock.classList.add("hidden");

    calc.fields.forEach(field => {
        const wrapper = document.createElement("div");
        wrapper.className = "block";

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
        }

        fieldsBlock.appendChild(wrapper);
    });
});

calculateBtn.addEventListener("click", function() {
    if (!currentCalculator) return;

    lastInput = {};
    currentCalculator.fields.forEach(field => {
        const element = document.getElementById("field-" + field.id);
        lastInput[field.id] = element.value;
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
    currentCalculator.fields.forEach(field => {
        out += `${field.label}: ${lastInput[field.id]}\n`;
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

init();