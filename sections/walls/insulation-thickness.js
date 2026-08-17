window.CalculatorRegistry.register({
    id: "wall-insulation",
    section: "Коробка",
    subsection: null,
    name: "Толщина утеплителя для стены",
    fields: [
        { id: "region", label: "Регион", type: "select", options: () => window.Data.regions.names() },
        { id: "wallMaterial", label: "Материал несущей стены", type: "select", options: () => window.Data.wallMaterials.names() },
        { id: "wallThickness", label: "Толщина несущей стены (см)", type: "number", step: 1 },
        { id: "insulation", label: "Тип утеплителя", type: "select", options: () => window.Data.insulation.names() }
    ],

    calculate(input) {
        const region = window.Data.regions[input.region];
        const wallMaterial = window.Data.wallMaterials[input.wallMaterial];
        const wallThickness = parseFloat(input.wallThickness);
        const insulation = window.Data.insulation[input.insulation];

        if (!region || !wallMaterial || isNaN(wallThickness) || !insulation) {
            return "Заполните все поля корректно.";
        }

        const rWall = wallThickness / 100 / wallMaterial.lambda;
        const rNeed = region.rWall;
        const rInsulation = rNeed - rWall;

        if (rInsulation <= 0) {
            return `Стена уже соответствует нормам.\n\nR стены: ${rWall.toFixed(2)}\nR требуемое: ${rNeed}`;
        }

        const insulationThickness = rInsulation * insulation.lambda * 100;

        let out = `Материал стены: ${input.wallMaterial}\n`;
        out += `Толщина стены: ${wallThickness} см\n`;
        out += `R стены: ${rWall.toFixed(2)} (м²·°C)/Вт\n\n`;
        out += `Требуемое R: ${rNeed} (м²·°C)/Вт\n`;
        out += `Утеплитель: ${input.insulation}\n`;
        out += `Толщина утеплителя: ${Math.ceil(insulationThickness / 5) * 5} см\n\n`;
        out += `Суммарное R: ${(rWall + insulationThickness / 100 / insulation.lambda).toFixed(2)} (м²·°C)/Вт`;

        return out;
    }
});