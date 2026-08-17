window.CalculatorRegistry.register({
    id: "foundation-type",
    section: "Геология",
    subsection: null,
    name: "Тип фундамента по грунтам",
    fields: [
        { id: "soil", label: "Тип грунта", type: "select", options: () => window.Data.soils.names() },
        { id: "water", label: "Уровень грунтовых вод (м)", type: "number", step: 0.1 },
        { id: "house", label: "Материал стен", type: "select", options: ["Газобетон", "Каркас / дерево", "Керамзитобетон", "Кирпич", "Монолит"] },
        { id: "floors", label: "Этажность", type: "number", min: 1, max: 3 },
        { id: "basement", label: "Подвал", type: "select", options: ["Нет", "Да"] }
    ],

    calculate(input) {
        const soil = window.Data.soils[input.soil];
        const water = parseFloat(input.water);
        const floors = parseInt(input.floors);
        const basement = input.basement === "Да";

        if (!soil || isNaN(water) || isNaN(floors)) {
            return "Заполните все поля корректно.";
        }

        let type;

        if (soil.bearing < 0.5 || input.soil === "Плывун") {
            type = "Свайный фундамент (или плита на заменённом грунте)";
        } else if (soil.heaving && water < 2.0) {
            type = "Монолитная плита или сваи с ростверком";
        } else if (soil.heaving && water >= 2.0) {
            type = "Лента мелкого заглубления с утеплением";
        } else if (!soil.heaving && soil.bearing >= 2.0) {
            type = "Лента мелкого заглубления или столбчатый";
        } else {
            type = "Лента с заглублением ниже промерзания";
        }

        if (basement) {
            type = "Заглублённая лента или монолитная плита с подвалом";
        }

        if (floors >= 3 && input.house === "Кирпич") {
            type = "Монолитная плита или заглублённая лента";
        }

        let out = `Тип грунта: ${input.soil}\n`;
        out += `Несущая способность: ${soil.bearing} кг/см²\n`;
        out += `Уровень грунтовых вод: ${water} м\n\n`;
        out += `Рекомендуемый фундамент: ${type}\n\n`;
        out += `Обоснование: ${soil.heaving ? "грунт пучинистый, " : "грунт непучинистый, "}`;
        out += `${water < 2.0 ? "вода высоко, " : "вода низко, "}`;
        out += `${soil.bearing < 1.0 ? "несущая способность низкая" : "несущая способность достаточная"}.`;

        return out;
    }
});