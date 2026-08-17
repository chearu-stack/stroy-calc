window.CalculatorRegistry.register({
    id: "wall-economy",
    section: "Коробка",
    subsection: null,
    name: "Экономика стены: стоимость и окупаемость",
    fields: [
        { id: "region", label: "Регион", type: "select", options: () => window.Data.regions.names() },
        { id: "wallMaterial", label: "Материал стены", type: "select", options: () => window.Data.wallMaterials.names() },
        { id: "wallThickness", label: "Толщина стены (см)", type: "number", step: 1 },
        { id: "wallCost", label: "Стоимость материала стены (руб/м³)", type: "number", step: 100 },
        { id: "insulation", label: "Тип утеплителя", type: "select", options: () => window.Data.insulation.names() },
        { id: "insulationThickness", label: "Толщина утеплителя (см)", type: "number", step: 1 },
        { id: "insulationCost", label: "Стоимость утеплителя (руб/м³)", type: "number", step: 100 },
        { id: "wallArea", label: "Площадь стен (м²)", type: "number", step: 1 },
        { id: "energyCost", label: "Стоимость энергии (руб/кВт·ч)", type: "number", step: 0.5 }
    ],

    calculate(input) {
        const region = window.Data.regions[input.region];
        const wallMaterial = window.Data.wallMaterials[input.wallMaterial];
        const wallThickness = parseFloat(input.wallThickness);
        const wallCost = parseFloat(input.wallCost);
        const insulation = window.Data.insulation[input.insulation];
        const insulationThickness = parseFloat(input.insulationThickness);
        const insulationCost = parseFloat(input.insulationCost);
        const wallArea = parseFloat(input.wallArea);
        const energyCost = parseFloat(input.energyCost);

        if (!region || !wallMaterial || !insulation || 
            isNaN(wallThickness) || isNaN(wallCost) || 
            isNaN(insulationThickness) || isNaN(insulationCost) || 
            isNaN(wallArea) || isNaN(energyCost)) {
            return "Заполните все поля корректно.";
        }

        // R стены без утеплителя
        const rWallOnly = wallThickness / 100 / wallMaterial.lambda;

        // R стены с утеплителем
        const rInsulation = insulationThickness / 100 / insulation.lambda;
        const rTotal = rWallOnly + rInsulation;

        // Разница температур
        const tempDiff = 20 - region.temp;

        // Теплопотери: Q = S × ΔT / R
        const heatWithoutInsulation = wallArea * tempDiff / rWallOnly;
        const heatWithInsulation = wallArea * tempDiff / rTotal;

        // Годовые теплопотери: Q × 24 часа × 210 дней / 1000 → кВт·ч
        const yearlyWithout = heatWithoutInsulation * 24 * 210 / 1000;
        const yearlyWith = heatWithInsulation * 24 * 210 / 1000;

        // Стоимость отопления
        const costWithout = yearlyWithout * energyCost;
        const costWith = yearlyWith * energyCost;
        const savingsPerYear = costWithout - costWith;

        // Стоимость материалов
        const wallVolume = wallArea * wallThickness / 100;
        const insVolume = wallArea * insulationThickness / 100;
        const wallPrice = wallVolume * wallCost;
        const insPrice = insVolume * insulationCost;
        const workPrice = wallArea * 1500;
        const totalPrice = wallPrice + insPrice + workPrice;

        // Окупаемость утеплителя
        const payback = savingsPerYear > 0 ? insPrice / savingsPerYear : Infinity;

        let out = `Площадь стен: ${wallArea} м²\n`;
        out += `Разница температур: ${tempDiff}°C\n\n`;
        out += `R стены без утеплителя: ${rWallOnly.toFixed(2)}\n`;
        out += `R стены с утеплителем: ${rTotal.toFixed(2)}\n\n`;
        out += `Теплопотери без утеплителя: ${Math.round(yearlyWithout)} кВт·ч/год\n`;
        out += `Теплопотери с утеплителем: ${Math.round(yearlyWith)} кВт·ч/год\n\n`;
        out += `Стоимость отопления без утеплителя: ${Math.round(costWithout)} руб/год\n`;
        out += `Стоимость отопления с утеплителем: ${Math.round(costWith)} руб/год\n`;
        out += `Экономия: ${Math.round(savingsPerYear)} руб/год\n\n`;
        out += `Стоимость материала стены: ${Math.round(wallPrice)} руб\n`;
        out += `Стоимость утеплителя: ${Math.round(insPrice)} руб\n`;
        out += `Стоимость работ (примерно): ${Math.round(workPrice)} руб\n`;
        out += `ИТОГО: ${Math.round(totalPrice)} руб\n\n`;

        if (payback === Infinity || payback <= 0) {
            out += "Окупаемость утеплителя: не окупается (экономии нет)";
        } else {
            out += `Окупаемость утеплителя: ${payback.toFixed(1)} лет`;
        }

        return out;
    }
});