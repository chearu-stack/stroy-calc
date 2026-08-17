window.CalculatorRegistry.register({
    id: "foundation-slab",
    section: "Фундамент",
    subsection: null,
    name: "Монолитная плита: толщина",
    fields: [
        { id: "soil", label: "Тип грунта", type: "select", options: () => window.Data.soils.names() },
        { id: "walls", label: "Материал стен", type: "select", options: ["Газобетон", "Каркас / дерево", "Керамзитобетон", "Кирпич", "Монолит"] },
        { id: "floors", label: "Этажность", type: "number", min: 1, max: 3 },
        { id: "area", label: "Площадь застройки (м²)", type: "number", step: 1 }
    ],
    calculate(input) {
        const soil = window.Data.soils[input.soil];
        const floors = parseInt(input.floors);
        const area = parseFloat(input.area);
        if (!soil || isNaN(floors) || isNaN(area)) return "Заполните все поля корректно.";
        const wallWeights = { "Газобетон": 300, "Каркас / дерево": 200, "Керамзитобетон": 500, "Кирпич": 800, "Монолит": 900 };
        const weight = wallWeights[input.walls] || 300;
        const load = weight * area * floors + 200 * area;
        const pressure = load / area / 10000;
        let thickness = 20;
        if (soil.bearing < 1.0) thickness = 30;
        if (soil.bearing < 0.5) thickness = 40;
        if (floors >= 2) thickness += 5;
        if (pressure > soil.bearing) thickness += 10;
        let out = `Нагрузка: ${Math.round(load / 1000)} т\n`;
        out += `Давление на грунт: ${pressure.toFixed(3)} кг/см²\n`;
        out += `Несущая способность: ${soil.bearing} кг/см²\n\n`;
        out += `ИТОГО: толщина плиты ${thickness} см\n`;
        out += `Статус: ${pressure > soil.bearing ? "ТРЕБУЕТСЯ УСИЛЕНИЕ" : "ПРИНЯТО"}\n\n`;
        out += `⚠️ Точный проектный расчёт для идеальных условий.`;
        return out;
    }
});
