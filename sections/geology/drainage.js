window.CalculatorRegistry.register({
    id: "drainage",
    section: "Геология",
    subsection: null,
    name: "Необходимость дренажа",
    fields: [
        { id: "water", label: "Уровень грунтовых вод (м от поверхности)", type: "number", step: 0.1 },
        { id: "soil", label: "Тип грунта", type: "select", options: () => window.Data.soils.names() },
        { id: "foundation", label: "Глубина заложения фундамента (м)", type: "number", step: 0.1 },
        { id: "basement", label: "Наличие подвала", type: "select", options: ["Нет", "Да"] }
    ],

    calculate(input) {
        const water = parseFloat(input.water);
        const soil = window.Data.soils[input.soil];
        const foundation = parseFloat(input.foundation);
        const basement = input.basement === "Да";

        if (isNaN(water) || !soil || isNaN(foundation)) {
            return "Заполните все поля корректно.";
        }

        let needed = false;
        let reason = "";

        if (basement) {
            needed = true;
            reason = "наличие подвала";
        }

        if (water < foundation + 50) {
            needed = true;
            reason = reason ? reason + ", вода выше подошвы фундамента" : "вода выше подошвы фундамента";
        }

        if (soil.drainage === "плохая" || soil.drainage === "очень плохая") {
            needed = true;
            reason = reason ? reason + ", грунт плохо пропускает воду" : "грунт плохо пропускает воду";
        }

        if (!needed) {
            return `Дренаж не обязателен.\n\nУровень грунтовых вод: ${water} м\nГлубина фундамента: ${foundation} м\nТип грунта: ${input.soil}\nДренаж грунта: ${soil.drainage}`;
        }

        const drainDepth = Math.ceil((foundation + 50) / 10) * 10;

        let out = `Дренаж: ОБЯЗАТЕЛЕН\n`;
        out += `Причина: ${reason}\n\n`;
        out += `Глубина заложения дренажа: ${drainDepth} см (ниже подошвы фундамента на 30–50 см)\n`;
        out += `Тип: пристенный кольцевой дренаж\n`;
        out += `Уклон дренажной трубы: 2–3 см на метр\n`;
        out += `Отвод воды: в ливнёвку или дренажный колодец`;

        return out;
    }
});