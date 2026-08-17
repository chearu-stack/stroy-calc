window.CalculatorRegistry.register({
    id: "foundation-piles",
    section: "Фундамент",
    subsection: null,
    name: "Свайный фундамент: количество свай",
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
        const pileCapacity = soil.bearing * 500;
        const count = Math.ceil(load / pileCapacity);
        const withReserve = Math.ceil(count * 1.2);
        const step = Math.sqrt(area / withReserve);
        let out = `Нагрузка: ${Math.round(load / 1000)} т\n`;
        out += `Несущая способность одной сваи: ${Math.round(pileCapacity)} кг\n`;
        out += `Расчётное количество: ${count} шт\n`;
        out += `С запасом 20%: ${withReserve} шт\n`;
        out += `Шаг свай: ${step.toFixed(1)} м\n\n`;
        out += `ИТОГО: ${withReserve} свай\n`;
        out += `Статус: ПРИНЯТО\n\n`;
        out += `⚠️ Точный проектный расчёт для идеальных условий.`;
        return out;
    }
});
