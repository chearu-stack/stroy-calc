window.CalculatorRegistry.register({
    id: "foundation-depth",
    section: "Геология",
    subsection: null,
    name: "Глубина заложения фундамента",
    fields: [
        { id: "region", label: "Регион", type: "select", options: () => window.Data.regions.names() },
        { id: "soil", label: "Тип грунта", type: "select", options: () => window.Data.soils.names() },
        { id: "water", label: "Уровень грунтовых вод (м от поверхности)", type: "number", step: 0.1 },
        { id: "house", label: "Тип строения", type: "select", options: ["Лёгкое (каркас, дерево)", "Среднее (газобетон, керамзитобетон)", "Тяжёлое (кирпич, монолит)"] },
        { id: "basement", label: "Наличие подвала", type: "select", options: ["Нет", "Да"] }
    ],

    calculate(input) {
        const region = window.Data.regions[input.region];
        const soil = window.Data.soils[input.soil];
        const water = parseFloat(input.water);
        const basement = input.basement === "Да";

        if (!region || !soil || isNaN(water)) {
            return "Заполните все поля корректно.";
        }

        const freezing = region.freezing;
        let depth = freezing;

        if (water < freezing) {
            depth = water + 50;
        }

        if (basement && depth < 200) {
            depth = 200;
        }

        let out = `Глубина промерзания: ${freezing} см\n`;
        out += `Тип грунта: ${input.soil}\n`;
        out += `Уровень грунтовых вод: ${water} м\n\n`;
        out += `Рекомендуемая глубина заложения: ${Math.ceil(depth / 10) * 10} см\n`;
        out += `Минимально допустимая: ${freezing} см\n\n`;

        if (soil.heaving && water < freezing + 50) {
            out += "Внимание: грунт пучинистый, вода близко. Требуется дренаж и утепление фундамента.";
        } else if (soil.bearing < 1.0) {
            out += "Внимание: грунт слабый. Требуется замена грунта или свайный фундамент.";
        } else {
            out += "Грунт пригоден для строительства.";
        }

        return out;
    }
});