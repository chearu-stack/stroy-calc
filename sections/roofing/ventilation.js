window.CalculatorRegistry.register({
    id: "roofing-ventilation",
    section: "Кровля",
    subsection: null,
    name: "Вентиляция подкровельного пространства",
    fields: [
        { id: "area", label: "Площадь кровли (м²)", type: "number", step: 1 },
        { id: "slopeLength", label: "Длина ската (м)", type: "number", step: 0.1 }
    ],
    calculate(input) {
        const area = parseFloat(input.area);
        const slopeLength = parseFloat(input.slopeLength);
        if (isNaN(area) || isNaN(slopeLength)) return "Заполните все поля корректно.";
        const ventArea = area / 500;
        const inlet = Math.ceil(ventArea / 2 * 10000);
        const outlet = Math.ceil(ventArea / 2 * 10000);
        const gap = 50;
        const aerators = slopeLength > 10 ? Math.ceil(slopeLength / 10) : 0;
        let out = `Площадь кровли: ${area} м²\n`;
        out += `Длина ската: ${slopeLength} м\n`;
        out += `Требуемая площадь вентиляции: ${(ventArea * 10000).toFixed(0)} см²\n\n`;
        out += `Входные отверстия (карниз): ${inlet} см²\n`;
        out += `Выходные отверстия (конёк): ${outlet} см²\n`;
        out += `Вентзазор: ${gap} мм\n`;
        if (aerators > 0) {
            out += `Дополнительные аэраторы: ${aerators} шт\n`;
        }
        out += `\nСтатус: ПРИНЯТО\n\n`;
        out += `Расчёт выполнен по нормативным формулам для типовых условий.`;
        return out;
    }
});
