window.CalculatorRegistry.register({
    id: "electrical-grounding",
    section: "Инженерные системы",
    subsection: "Электрика",
    name: "Расчёт заземления",
    fields: [
        { id: "soil", label: "Тип грунта", type: "select", options: () => window.Data.soils.names() },
        { id: "electrodes", label: "Количество электродов (шт)", type: "number", step: 1 },
        { id: "length", label: "Длина электрода (м)", type: "number", step: 0.5 }
    ],
    calculate(input) {
        const soil = window.Data.soils[input.soil];
        const electrodes = parseInt(input.electrodes);
        const length = parseFloat(input.length);
        if (!soil || isNaN(electrodes) || isNaN(length)) return "Заполните все поля корректно.";
        if (electrodes <= 0 || length <= 0) return "Количество и длина должны быть больше нуля.";

        let resistivity;
        if (input.soil === "Песок плотный" || input.soil === "Песок рыхлый") resistivity = 500;
        else if (input.soil === "Супесь") resistivity = 300;
        else if (input.soil === "Суглинок") resistivity = 100;
        else if (input.soil === "Глина") resistivity = 60;
        else if (input.soil === "Торф / органика") resistivity = 25;
        else resistivity = 150;

        const singleResistance = resistivity / length;
        const utilization = electrodes === 1 ? 1 : electrodes === 2 ? 0.85 : electrodes === 3 ? 0.75 : 0.65;
        const totalResistance = singleResistance / (electrodes * utilization);

        let out = `Тип грунта: ${input.soil}\n`;
        out += `Удельное сопротивление: ${resistivity} Ом·м\n`;
        out += `Количество электродов: ${electrodes} шт\n`;
        out += `Длина электрода: ${length} м\n\n`;
        out += `Сопротивление одного: ${singleResistance.toFixed(1)} Ом\n`;
        out += `Общее сопротивление: ${totalResistance.toFixed(1)} Ом\n`;
        out += `Норма: ≤ 4 Ом\n\n`;

        if (totalResistance <= 4) {
            out += `Статус: ПРИНЯТО`;
        } else {
            out += `Статус: НЕДОСТАТОЧНО\n`;
            out += `Требуется увеличить количество электродов или их длину.`;
        }

        out += `\n\nРасчёт выполнен по нормативным формулам для типовых условий.`;
        return out;
    }
});
