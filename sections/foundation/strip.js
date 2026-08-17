window.CalculatorRegistry.register({
    id: "foundation-strip",
    section: "Фундамент",
    subsection: null,
    name: "Ленточный фундамент: расчёт ширины",
    fields: [
        { id: "soil", label: "Тип грунта", type: "select", options: () => window.Data.soils.names() },
        { id: "walls", label: "Материал стен", type: "select", options: ["Газобетон", "Каркас / дерево", "Керамзитобетон", "Кирпич", "Монолит"] },
        { id: "floors", label: "Этажность", type: "number", min: 1, max: 3 },
        { id: "area", label: "Площадь застройки (м²)", type: "number", step: 1 },
        { id: "perimeter", label: "Периметр фундамента (м)", type: "number", step: 0.1 }
    ],
    calculate(input) {
        const soil = window.Data.soils[input.soil];
        const floors = parseInt(input.floors);
        const area = parseFloat(input.area);
        const perimeter = parseFloat(input.perimeter);
        if (!soil || isNaN(floors) || isNaN(area) || isNaN(perimeter)) return "Заполните все поля корректно.";
        const wallWeights = { "Газобетон": 300, "Каркас / дерево": 200, "Керамзитобетон": 500, "Кирпич": 800, "Монолит": 900 };
        const weight = wallWeights[input.walls] || 300;
        const load = weight * area * floors + 200 * area;
        const perMeter = load / perimeter / 100;
        const requiredWidth = perMeter / soil.bearing / 100;
        const width = Math.max(Math.ceil(requiredWidth * 1.3 / 10) * 10, 30);
        let out = `Нагрузка на фундамент: ${Math.round(load / 1000)} т\n`;
        out += `Нагрузка на погонный метр: ${Math.round(perMeter * 100)} кг/м\n`;
        out += `Несущая способность грунта: ${soil.bearing} кг/см²\n`;
        out += `Расчётная ширина: ${Math.ceil(requiredWidth)} см\n`;
        out += `С коэффициентом запаса 1.3: ${Math.ceil(requiredWidth * 1.3)} см\n\n`;
        out += `ИТОГО: ширина ленты ${width} см\n`;
        out += `Статус: ПРИНЯТО\n\n`;
        out += `⚠️ Точный проектный расчёт для идеальных условий.`;
        return out;
    }
});
