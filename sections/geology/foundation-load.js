window.CalculatorRegistry.register({
    id: "foundation-load",
    section: "Геология",
    subsection: null,
    name: "Нагрузка на фундамент",
    fields: [
        { id: "walls", label: "Материал стен", type: "select", options: ["Газобетон", "Каркас / дерево", "Керамзитобетон", "Кирпич", "Монолит"] },
        { id: "floors", label: "Этажность", type: "number", min: 1, max: 3 },
        { id: "area", label: "Площадь застройки (м²)", type: "number", step: 1 },
        { id: "perimeter", label: "Периметр фундамента (м)", type: "number", step: 0.1 },
        { id: "roof", label: "Тип кровли", type: "select", options: ["Лёгкая (металлочерепица, профнастил)", "Средняя (гибкая черепица)", "Тяжёлая (керамическая черепица)"] },
        { id: "region", label: "Регион (снег)", type: "select", options: () => window.Data.regions.names() }
    ],

    calculate(input) {
        const wallWeights = {
            "Газобетон": 300,
            "Каркас / дерево": 200,
            "Керамзитобетон": 500,
            "Кирпич": 800,
            "Монолит": 900
        };

        const roofWeights = {
            "Лёгкая (металлочерепица, профнастил)": 50,
            "Средняя (гибкая черепица)": 80,
            "Тяжёлая (керамическая черепица)": 120
        };

        const walls = input.walls;
        const floors = parseInt(input.floors);
        const area = parseFloat(input.area);
        const perimeter = parseFloat(input.perimeter);
        const region = window.Data.regions[input.region];

        if (!wallWeights[walls] || isNaN(floors) || isNaN(area) || isNaN(perimeter) || !region) {
            return "Заполните все поля корректно.";
        }

        const wallWeight = wallWeights[walls];
        const roofWeight = roofWeights[input.roof];

        const wallsLoad = wallWeight * area * floors;
        const roofLoad = (roofWeight + region.snow) * area;
        const floorsLoad = 150 * area * (floors - 1);

        const total = wallsLoad + roofLoad + floorsLoad;
        const perMeter = total / perimeter;
        const perCm2 = perMeter / 100; // примерно, при ширине ленты 100 см

        let out = `Суммарная нагрузка: ${Math.round(total / 1000)} т\n`;
        out += `Нагрузка на погонный метр: ${Math.round(perMeter)} кг/м\n`;
        out += `Удельная нагрузка на грунт (при ленте 100 см): ${perCm2.toFixed(2)} кг/см²\n\n`;

        out += `Сравните с несущей способностью грунта из геологического отчёта.\n`;
        out += `Если удельная нагрузка больше несущей способности — нужен другой тип фундамента или шире лента.`;

        return out;
    }
});