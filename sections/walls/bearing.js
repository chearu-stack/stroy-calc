window.CalculatorRegistry.register({
    id: "wall-bearing",
    section: "Коробка",
    subsection: null,
    name: "Проверка несущей способности стены",
    fields: [
        { id: "material", label: "Материал стены", type: "select", options: () => window.Data.wallMaterials.names() },
        { id: "floors", label: "Этажность", type: "number", min: 1, max: 5 },
        { id: "wallThickness", label: "Толщина стены (см)", type: "number", step: 1 }
    ],

    calculate(input) {
        const material = window.Data.wallMaterials[input.material];
        const floors = parseInt(input.floors);
        const thickness = parseFloat(input.wallThickness);

        if (!material || isNaN(floors) || isNaN(thickness)) {
            return "Заполните все поля корректно.";
        }

        // Удельная нагрузка на стену от этажей (кг/см²)
        const loadPerFloor = 0.5; // примерно
        const totalLoad = loadPerFloor * floors;
        const safetyFactor = 3; // коэффициент запаса
        const requiredStrength = totalLoad * safetyFactor;

        let out = `Материал: ${input.material}\n`;
        out += `Прочность на сжатие: ${material.strength} кг/см²\n`;
        out += `Этажность: ${floors}\n`;
        out += `Толщина стены: ${thickness} см\n\n`;
        out += `Расчётная нагрузка: ${totalLoad.toFixed(2)} кг/см²\n`;
        out += `Требуемая прочность (с запасом ×${safetyFactor}): ${requiredStrength.toFixed(2)} кг/см²\n\n`;

        if (material.strength >= requiredStrength) {
            out += "✓ Стена выдерживает нагрузку.";
        } else {
            out += "✗ Прочности НЕ достаточно.\n";
            out += "Рекомендуется: увеличить толщину стены, использовать более прочный материал или разгрузить конструкцию.";
        }

        return out;
    }
});