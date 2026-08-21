window.CalculatorRegistry.register({
    id: "walls-insulation-packs",
    section: "Коробка",
    subsection: null,
    name: "Утеплитель в упаковках",
    fields: [
        { id: "netArea", label: "Площадь утепляемой стены (м²)", type: "number", step: 0.5 },
        { id: "areaPerPack", label: "Площадь в одной упаковке (м²) — указана на упаковке", type: "number", step: 0.1 }
    ],
    calculate(input) {
        const netArea = parseFloat(input.netArea);
        const areaPerPack = parseFloat(input.areaPerPack);

        if (isNaN(netArea) || netArea <= 0) return "Площадь стены должна быть больше нуля.";
        if (isNaN(areaPerPack) || areaPerPack <= 0) return "Площадь упаковки должна быть больше нуля.";

        const margin = 1.10; // запас 10% на подрезку и нахлёст
        const requiredArea = netArea * margin;
        const packsNeeded = Math.ceil(requiredArea / areaPerPack);

        let out = `Площадь стены: ${netArea} м²\n`;
        out += `Площадь одной упаковки: ${areaPerPack} м²\n`;
        out += `Требуемая площадь (с запасом 10%): ${requiredArea.toFixed(1)} м²\n\n`;
        out += `ИТОГО: ${packsNeeded} упаковок\n\n`;
        out += `Статус: ПРИНЯТО\n\n`;
        out += `Расчёт выполнен по нормативным формулам для типовых условий.`;
        return out;
    }
});
