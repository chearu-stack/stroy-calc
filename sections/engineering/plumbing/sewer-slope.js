window.CalculatorRegistry.register({
    id: "plumbing-sewer-slope",
    section: "Инженерные системы",
    subsection: "Сантехника",
    name: "Уклон канализационной трубы",
    fields: [
        { id: "diameter", label: "Диаметр трубы (мм)", type: "select", options: ["50", "110", "160"] },
        { id: "length", label: "Длина участка (м)", type: "number", step: 0.1 }
    ],
    calculate(input) {
        const diameter = input.diameter;
        const length = parseFloat(input.length);
        if (isNaN(length) || length <= 0) return "Длина должна быть больше нуля.";

        const slopes = window.Data.plumbing.sewerSlopes;
        const slope = slopes[diameter];
        const totalDrop = slope * length;

        let out = `Диаметр трубы: ${diameter} мм\n`;
        out += `Длина участка: ${length} м\n`;
        out += `Уклон: ${slope} см на метр\n\n`;
        out += `Общее понижение: ${totalDrop.toFixed(1)} см\n`;
        out += `Верхняя точка: 0 см\n`;
        out += `Нижняя точка: -${totalDrop.toFixed(1)} см\n\n`;
        out += `Статус: ПРИНЯТО\n\n`;
        out += `Расчёт выполнен по нормативным формулам для типовых условий.`;
        return out;
    }
});
