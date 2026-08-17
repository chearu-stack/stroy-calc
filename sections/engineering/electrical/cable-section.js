window.CalculatorRegistry.register({
    id: "electrical-cable-section",
    section: "Инженерные системы",
    subsection: "Электрика",
    name: "Сечение кабеля по нагрузке",
    fields: [
        { id: "power", label: "Мощность нагрузки (кВт)", type: "number", step: 0.1 },
        { id: "voltage", label: "Напряжение сети", type: "select", options: ["220", "380"] },
        { id: "length", label: "Длина линии (м)", type: "number", step: 1 }
    ],
    calculate(input) {
        const power = parseFloat(input.power);
        const voltage = parseInt(input.voltage);
        const length = parseFloat(input.length);
        if (isNaN(power) || isNaN(voltage) || isNaN(length)) return "Заполните все поля корректно.";
        if (power <= 0 || length <= 0) return "Мощность и длина должны быть больше нуля.";

        const cables = window.Data.electrical.cables;

        let current;
        if (voltage === 220) {
            current = power * 1000 / 220;
        } else {
            current = power * 1000 / (380 * 1.73);
        }

        const sections = [1.5, 2.5, 4, 6, 10, 16, 25];
        const sectionNames = ["1.5", "2.5", "4", "6", "10", "16", "25"];

        let selectedIndex = -1;
        for (let i = 0; i < sections.length; i++) {
            if (cables[sectionNames[i]].current >= current) {
                selectedIndex = i;
                break;
            }
        }

        if (selectedIndex === -1) {
            return `Ток: ${current.toFixed(1)} А\n\nТребуемое сечение: более 25 мм²\nСтатус: ПРЕВЫШЕН ТИПОВОЙ РЯД\n\nРасчёт выполнен по нормативным формулам для типовых условий.`;
        }

        let finalIndex = selectedIndex;
        let finalDropPercent = 0;

        for (let i = selectedIndex; i < sections.length; i++) {
            const section = sections[i];
            let voltageDrop;
            if (voltage === 220) {
                voltageDrop = 2 * 0.0175 * length * current / section;
            } else {
                voltageDrop = 1.73 * 0.0175 * length * current / section;
            }
            const dp = voltageDrop / voltage * 100;
            finalDropPercent = dp;
            finalIndex = i;

            if (dp <= 3) {
                break;
            }
        }

        const finalSection = sectionNames[finalIndex];
        const selectedSectionName = sectionNames[selectedIndex];

        if (finalDropPercent > 3) {
            let out = `Мощность: ${power} кВт\n`;
            out += `Напряжение: ${voltage} В\n`;
            out += `Ток: ${current.toFixed(1)} А\n`;
            out += `Длина линии: ${length} м\n\n`;
            out += `Сечение по току: ${selectedSectionName} мм²\n`;
            out += `Падение напряжения при 25 мм²: ${finalDropPercent.toFixed(2)}%\n\n`;
            out += `Статус: ПРЕВЫШЕН ТИПОВОЙ РЯД\n`;
            out += `Даже максимальное сечение 25 мм² даёт падение более 3%.\n`;
            out += `Требуется: увеличить напряжение до 380 В или сократить длину линии.`;
            out += `\n\nРасчёт выполнен по нормативным формулам для типовых условий.`;
            return out;
        }

        let out = `Мощность: ${power} кВт\n`;
        out += `Напряжение: ${voltage} В\n`;
        out += `Ток: ${current.toFixed(1)} А\n`;
        out += `Длина линии: ${length} м\n\n`;
        out += `Сечение по току: ${selectedSectionName} мм²\n`;

        if (finalSection !== selectedSectionName) {
            out += `Увеличено для падения напряжения: ${finalSection} мм²\n`;
        }

        out += `Допустимый ток: ${cables[finalSection].current} А\n`;
        out += `Падение напряжения: ${finalDropPercent.toFixed(2)}%\n\n`;
        out += `ИТОГО: сечение кабеля ${finalSection} мм²\n`;
        out += `Статус: ПРИНЯТО\n\n`;
        out += `Расчёт выполнен по нормативным формулам для типовых условий.`;
        return out;
    }
});
