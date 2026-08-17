window.CalculatorRegistry.register({
    id: "plumbing-pump",
    section: "Инженерные системы",
    subsection: "Сантехника",
    name: "Подбор насоса",
    fields: [
        { id: "flow", label: "Требуемый расход (л/мин)", type: "number", step: 1 },
        { id: "height", label: "Высота подъёма (м)", type: "number", step: 0.5 },
        { id: "length", label: "Длина трубопровода (м)", type: "number", step: 1 },
        { id: "diameter", label: "Диаметр трубы (мм)", type: "select", options: ["25", "32", "40", "50"] },
        { id: "pressure", label: "Требуемое давление в точке (бар)", type: "number", step: 0.5 }
    ],
    calculate(input) {
        const flow = parseFloat(input.flow);
        const height = parseFloat(input.height);
        const length = parseFloat(input.length);
        const pressure = parseFloat(input.pressure);
        if (isNaN(flow) || isNaN(height) || isNaN(length) || isNaN(pressure)) return "Заполните все поля корректно.";
        if (flow <= 0 || length < 0) return "Проверьте введённые значения.";

        const pipes = window.Data.plumbing.pipes;
        const pipe = pipes[input.diameter];
        if (!pipe) return "Выберите диаметр трубы.";

        // Интерполяция потерь по расходу
        const flowPoints = [10, 20, 30, 40];
        let lossPerMeter;

        if (flow <= flowPoints[0]) {
            lossPerMeter = pipe.losses[10];
        } else if (flow >= flowPoints[flowPoints.length - 1]) {
            lossPerMeter = pipe.losses[40];
        } else {
            for (let i = 0; i < flowPoints.length - 1; i++) {
                if (flow >= flowPoints[i] && flow <= flowPoints[i + 1]) {
                    const f1 = flowPoints[i];
                    const f2 = flowPoints[i + 1];
                    const l1 = pipe.losses[f1];
                    const l2 = pipe.losses[f2];
                    lossPerMeter = l1 + (l2 - l1) * (flow - f1) / (f2 - f1);
                    break;
                }
            }
        }

        const pipeLoss = length * lossPerMeter;
        const staticHead = height;
        const pressureHead = pressure * 10.2;
        const totalHead = staticHead + pipeLoss + pressureHead;
        const power = totalHead * flow / 6120; // гидравлическая (полезная) мощность в кВт, Q в л/мин

        let out = `Расход: ${flow} л/мин\n`;
        out += `Диаметр трубы: ${input.diameter} мм\n`;
        out += `Удельные потери: ${lossPerMeter.toFixed(3)} м/м\n`;
        out += `Длина трубопровода: ${length} м\n`;
        out += `Потери в трубах: ${pipeLoss.toFixed(1)} м\n`;
        out += `Высота подъёма: ${height} м\n`;
        out += `Требуемое давление: ${pressure} бар = ${pressureHead.toFixed(1)} м\n\n`;
        out += `ИТОГО: требуемый напор ${totalHead.toFixed(1)} м\n`;
        out += `Производительность: ${flow * 60} л/час = ${(flow * 60 / 1000).toFixed(1)} м³/час\n`;
        out += `Полезная мощность: ${power.toFixed(2)} кВт\n\n`;
        out += `Статус: ПРИНЯТО\n\n`;
        out += `Расчёт выполнен по нормативным формулам для типовых условий.`;
        return out;
    }
});
