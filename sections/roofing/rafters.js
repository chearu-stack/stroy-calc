window.CalculatorRegistry.register({
    id: "roofing-rafters",
    section: "Кровля",
    subsection: null,
    name: "Сечение стропил",
    fields: [
        { id: "region", label: "Регион", type: "select", options: () => window.Data.regions.names() },
        { id: "span", label: "Пролёт стропильной ноги (м)", type: "number", step: 0.1 },
        { id: "step", label: "Шаг стропил (мм)", type: "number", step: 10 },
        { id: "cover", label: "Тип покрытия", type: "select", options: ["Металлочерепица", "Профнастил", "Гибкая черепица", "Керамическая черепица"] }
    ],
    calculate(input) {
        const region = window.Data.regions[input.region];
        const span = parseFloat(input.span);
        const step = parseFloat(input.step);
        if (!region || isNaN(span) || isNaN(step)) return "Заполните все поля корректно.";
        const coverWeights = { "Металлочерепица": 5, "Профнастил": 6, "Гибкая черепица": 10, "Керамическая черепица": 50 };
        const coverWeight = coverWeights[input.cover] || 5;
        const totalLoad = region.snow + coverWeight + 30;
        const loadPerMeter = totalLoad * step / 1000;
        const moment = loadPerMeter * span * span / 8;
        const requiredW = moment * 100 / 130;
        const sections = [
            { name: "50×150", w: 187.5 },
            { name: "50×200", w: 333.3 },
            { name: "75×200", w: 500.0 },
            { name: "75×250", w: 781.25 },
            { name: "100×200", w: 666.7 },
            { name: "100×250", w: 1041.7 }
        ];
        const selected = sections.find(s => s.w >= requiredW);
        let out = `Снеговая нагрузка: ${region.snow} кг/м²\n`;
        out += `Вес покрытия: ${coverWeight} кг/м²\n`;
        out += `Суммарная нагрузка: ${totalLoad} кг/м²\n`;
        out += `Нагрузка на погонный метр: ${loadPerMeter.toFixed(1)} кг/м\n`;
        out += `Пролёт: ${span} м\n\n`;
        if (selected) {
            out += `ИТОГО: сечение стропил ${selected.name}\n`;
            out += `Статус: ПРИНЯТО`;
        } else {
            out += `ИТОГО: требуется индивидуальный расчёт\n`;
            out += `Статус: ПРЕВЫШЕНЫ ТИПОВЫЕ СЕЧЕНИЯ`;
        }
        out += `\n\nРасчёт выполнен по нормативным формулам для типовых условий.`;
        return out;
    }
});
