window.CalculatorRegistry.register({
    id: "wall-r-value",
    section: "Коробка",
    subsection: null,
    name: "Сопротивление теплопередаче (R) многослойной стены",
    fields: [
        { id: "region", label: "Регион", type: "select", options: () => window.Data.regions.names() },
        { id: "layer1Material", label: "Слой 1: материал (изнутри)", type: "select", options: () => window.Data.wallMaterials.names() },
        { id: "layer1Thickness", label: "Слой 1: толщина (см)", type: "number", step: 1 },
        { id: "layer2Material", label: "Слой 2: материал", type: "select", options: () => window.Data.insulation.names() },
        { id: "layer2Thickness", label: "Слой 2: толщина (см)", type: "number", step: 1 },
        { id: "layer3Material", label: "Слой 3: материал (снаружи)", type: "select", options: () => window.Data.wallMaterials.names() },
        { id: "layer3Thickness", label: "Слой 3: толщина (см)", type: "number", step: 1 }
    ],

    calculate(input) {
        const region = window.Data.regions[input.region];
        const l1m = window.Data.wallMaterials[input.layer1Material];
        const l1t = parseFloat(input.layer1Thickness);
        const l2m = window.Data.insulation[input.layer2Material];
        const l2t = parseFloat(input.layer2Thickness);
        const l3m = window.Data.wallMaterials[input.layer3Material];
        const l3t = parseFloat(input.layer3Thickness);

        if (!region || !l1m || !l2m || !l3m || isNaN(l1t) || isNaN(l2t) || isNaN(l3t)) {
            return "Заполните все поля корректно.";
        }

        const r1 = l1t / 100 / l1m.lambda;
        const r2 = l2t / 100 / l2m.lambda;
        const r3 = l3t / 100 / l3m.lambda;
        const total = r1 + r2 + r3;

        let out = `Слой 1: R = ${r1.toFixed(2)}\n`;
        out += `Слой 2: R = ${r2.toFixed(2)}\n`;
        out += `Слой 3: R = ${r3.toFixed(2)}\n\n`;
        out += `Суммарное R: ${total.toFixed(2)} (м²·°C)/Вт\n`;
        out += `Требуемое R: ${region.rWall} (м²·°C)/Вт\n\n`;

        if (total >= region.rWall) {
            out += "✓ Стена соответствует нормам.";
        } else {
            out += `✗ Стена НЕ соответствует. Не хватает ${(region.rWall - total).toFixed(2)} (м²·°C)/Вт.\n`;
            out += "Увеличьте толщину утеплителя или замените материал.";
        }

        return out;
    }
});