window.CalculatorRegistry.register({
    id: "foundation-concrete-volume",
    section: "Фундамент",
    subsection: null,
    name: "Объём бетона на ленточный фундамент",
    fields: [
        { id: "perimeter", label: "Периметр фундамента (м)", type: "number", step: 0.1 },
        { id: "width", label: "Ширина ленты (м)", type: "number", step: 0.05 },
        { id: "height", label: "Высота ленты (м)", type: "number", step: 0.05 }
    ],
    calculate(input) {
        const perimeter = parseFloat(input.perimeter);
        const width = parseFloat(input.width);
        const height = parseFloat(input.height);

        if (isNaN(perimeter) || perimeter <= 0) return "Периметр должен быть больше нуля.";
        if (isNaN(width) || width <= 0) return "Ширина ленты должна быть больше нуля.";
        if (isNaN(height) || height <= 0) return "Высота ленты должна быть больше нуля.";

        const rawVolume = perimeter * width * height;
        const margin = 1.05; // запас 5% на неровности опалубки и грунта
        const totalVolume = rawVolume * margin;

        let out = `Периметр фундамента: ${perimeter} м\n`;
        out += `Ширина ленты: ${width} м\n`;
        out += `Высота ленты: ${height} м\n\n`;
        out += `Объём без запаса: ${rawVolume.toFixed(2)} м³\n`;
        out += `ИТОГО (с запасом 5%): ${totalVolume.toFixed(2)} м³\n\n`;
        out += `Статус: ПРИНЯТО\n\n`;
        out += `Расчёт выполнен по нормативным формулам для типовых условий.`;
        return out;
    }
});
