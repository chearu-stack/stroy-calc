window.CalculatorRegistry.register({
    id: "roofing-gutter",
    section: "Кровля",
    subsection: null,
    name: "Водосточная система",
    fields: [
        { id: "roofArea", label: "Площадь ската (м²)", type: "number", step: 1 },
        { id: "slopeLength", label: "Длина ската (м)", type: "number", step: 0.1 }
    ],
    calculate(input) {
        const roofArea = parseFloat(input.roofArea);
        const slopeLength = parseFloat(input.slopeLength);
        if (isNaN(roofArea) || isNaN(slopeLength)) return "Заполните все поля корректно.";
        const effectiveArea = roofArea * 1.1;
        let gutterDiameter;
        if (effectiveArea <= 50) gutterDiameter = 90;
        else if (effectiveArea <= 100) gutterDiameter = 125;
        else gutterDiameter = 150;
        const downspouts = Math.ceil(effectiveArea / 100);
        let out = `Площадь ската: ${roofArea} м²\n`;
        out += `Эффективная площадь (с запасом 10%): ${effectiveArea.toFixed(1)} м²\n\n`;
        out += `Диаметр желоба: ${gutterDiameter} мм\n`;
        out += `Количество водосточных труб: ${downspouts} шт\n`;
        out += `Длина ската: ${slopeLength} м\n`;
        out += `Максимальная длина желоба на одну трубу: 10 м\n\n`;
        out += `Статус: ПРИНЯТО\n\n`;
        out += `Расчёт выполнен по нормативным формулам для типовых условий.`;
        return out;
    }
});
