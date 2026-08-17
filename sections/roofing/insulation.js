window.CalculatorRegistry.register({
    id: "roofing-insulation",
    section: "Кровля",
    subsection: null,
    name: "Толщина утеплителя кровли",
    fields: [
        { id: "region", label: "Регион", type: "select", options: () => window.Data.regions.names() },
        { id: "roofType", label: "Тип кровли", type: "select", options: ["Скатная", "Мансардная"] },
        { id: "material", label: "Тип утеплителя", type: "select", options: () => window.Data.insulation.names() }
    ],
    calculate(input) {
        const region = window.Data.regions[input.region];
        const material = window.Data.insulation[input.material];
        if (!region || !material) return "Заполните все поля корректно.";
        let r = region.rRoof;
        if (input.roofType === "Мансардная") r += 0.5;
        const thickness = Math.ceil(r * material.lambda * 100 / 5) * 5;
        let out = `Тип кровли: ${input.roofType}\n`;
        out += `Требуемое сопротивление R: ${r.toFixed(1)} (м²·°C)/Вт\n`;
        out += `Утеплитель: ${input.material}\n`;
        out += `Теплопроводность: ${material.lambda} Вт/(м·°C)\n\n`;
        out += `ИТОГО: толщина утеплителя ${thickness} мм\n`;
        out += `Статус: ПРИНЯТО\n\n`;
        out += `Расчёт выполнен по нормативным формулам для типовых условий.`;
        return out;
    }
});
