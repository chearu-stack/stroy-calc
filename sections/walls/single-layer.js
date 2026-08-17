window.CalculatorRegistry.register({
    id: "wall-single-layer",
    section: "Коробка",
    subsection: null,
    name: "Толщина однослойной стены",
    fields: [
        { id: "region", label: "Регион", type: "select", options: () => window.Data.regions.names() },
        { id: "material", label: "Материал стены", type: "select", options: () => window.Data.wallMaterials.names() }
    ],

    calculate(input) {
        const region = window.Data.regions[input.region];
        const material = window.Data.wallMaterials[input.material];

        if (!region || !material) return "Заполните все поля корректно.";

        const thickness = region.rWall * material.lambda * 100; // в см

        let out = `Материал: ${input.material}\n`;
        out += `Теплопроводность: ${material.lambda} Вт/(м·°C)\n`;
        out += `Требуемое R для региона: ${region.rWall} (м²·°C)/Вт\n\n`;
        out += `Минимальная толщина стены: ${Math.ceil(thickness)} см\n`;
        out += `Рекомендуемая толщина (с запасом 10%): ${Math.ceil(thickness * 1.1)} см\n\n`;

        if (thickness > 150) {
            out += "Внимание: однослойная стена такой толщины нерациональна.\n";
            out += "Рекомендуется многослойная конструкция с утеплителем.";
        }

        return out;
    }
});