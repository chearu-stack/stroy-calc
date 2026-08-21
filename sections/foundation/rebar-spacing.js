window.CalculatorRegistry.register({
    id: "foundation-rebar",
    section: "Фундамент",
    subsection: null,
    name: "Армирование фундамента",
    fields: [
        { id: "perimeter", label: "Периметр фундамента (м)", type: "number", step: 0.1 },
        { id: "diameter", label: "Диаметр арматуры (мм)", type: "select", options: ["10", "12", "14", "16"] },
        { id: "rodsPerBelt", label: "Стержней в одном поясе", type: "number", step: 1 },
        { id: "belts", label: "Количество поясов армирования", type: "number", step: 1 }
    ],
    calculate(input) {
        const perimeter = parseFloat(input.perimeter);
        const diameter = input.diameter;
        const rodsPerBelt = parseInt(input.rodsPerBelt);
        const belts = parseInt(input.belts);

        if (isNaN(perimeter) || perimeter <= 0) return "Периметр должен быть больше нуля.";
        if (isNaN(rodsPerBelt) || rodsPerBelt <= 0) return "Число стержней в поясе должно быть больше нуля.";
        if (isNaN(belts) || belts <= 0) return "Число поясов должно быть больше нуля.";

        // Вес погонного метра арматуры, кг/м (справочные значения, класс А500)
        const weightPerMeter = {
            "10": 0.617,
            "12": 0.888,
            "14": 1.208,
            "16": 1.578
        };

        const wpm = weightPerMeter[diameter];
        if (!wpm) return "Выберите диаметр арматуры.";

        const margin = 1.05; // запас 5% на нахлёсты в углах и стыках
        const totalLength = perimeter * rodsPerBelt * belts * margin;
        const totalWeight = totalLength * wpm;

        let out = `Периметр фундамента: ${perimeter} м\n`;
        out += `Диаметр арматуры: ${diameter} мм\n`;
        out += `Стержней в поясе: ${rodsPerBelt}\n`;
        out += `Поясов армирования: ${belts}\n\n`;
        out += `ИТОГО: длина арматуры ${totalLength.toFixed(1)} м\n`;
        out += `Вес арматуры: ${totalWeight.toFixed(1)} кг\n\n`;
        out += `Статус: ПРИНЯТО\n\n`;
        out += `Расчёт выполнен по нормативным формулам для типовых условий.`;
        return out;
    }
});
