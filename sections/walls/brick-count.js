window.CalculatorRegistry.register({
    id: "walls-brick-count",
    section: "Коробка",
    subsection: null,
    name: "Расход кирпича / блока на кладку",
    fields: [
        { id: "perimeter", label: "Периметр стен (м)", type: "number", step: 0.1 },
        { id: "height", label: "Высота стен (м)", type: "number", step: 0.1 },
        {
            id: "windowsCount",
            label: "Количество окон",
            type: "number",
            step: 1,
            min: 0,
            generatesGroup: {
                itemLabel: "Окно №{n}",
                maxCount: 15,
                fields: [
                    { suffix: "width", label: "Ширина (м)", type: "number", step: 0.1 },
                    { suffix: "height", label: "Высота (м)", type: "number", step: 0.1 }
                ]
            }
        },
        {
            id: "doorsCount",
            label: "Количество дверей",
            type: "number",
            step: 1,
            min: 0,
            generatesGroup: {
                itemLabel: "Дверь №{n}",
                maxCount: 10,
                fields: [
                    { suffix: "width", label: "Ширина (м)", type: "number", step: 0.1 },
                    { suffix: "height", label: "Высота (м)", type: "number", step: 0.1 }
                ]
            }
        },
        {
            id: "masonryMaterial",
            label: "Материал кладки",
            type: "select",
            options: ["Кирпич", "Блок (газоблок, ракушечник, известняк и др.)"]
        },
        {
            id: "brickThickness",
            label: "Толщина кладки в кирпичах (0.5 / 1 / 1.5 / 2 / 2.5)",
            type: "number",
            step: 0.5,
            visibleWhen: { field: "masonryMaterial", equals: "Кирпич" }
        },
        {
            id: "blockLength",
            label: "Длина блока (мм)",
            type: "number",
            step: 1,
            visibleWhen: { field: "masonryMaterial", equals: "Блок (газоблок, ракушечник, известняк и др.)" }
        },
        {
            id: "blockHeight",
            label: "Высота блока (мм)",
            type: "number",
            step: 1,
            visibleWhen: { field: "masonryMaterial", equals: "Блок (газоблок, ракушечник, известняк и др.)" }
        },
        {
            id: "blockWidth",
            label: "Ширина блока (мм) — влияет на объём в м³, не на количество штук",
            type: "number",
            step: 1,
            visibleWhen: { field: "masonryMaterial", equals: "Блок (газоблок, ракушечник, известняк и др.)" }
        },
        {
            id: "blockSeam",
            label: "Толщина шва (мм): клей ~2-3, цементный раствор ~10-15",
            type: "number",
            step: 1,
            visibleWhen: { field: "masonryMaterial", equals: "Блок (газоблок, ракушечник, известняк и др.)" }
        }
    ],

    calculate(input) {
        const perimeter = parseFloat(input.perimeter);
        const height = parseFloat(input.height);

        if (isNaN(perimeter) || perimeter <= 0) return "Периметр стен должен быть больше нуля.";
        if (isNaN(height) || height <= 0) return "Высота стен должна быть больше нуля.";

        const grossArea = perimeter * height;

        // Суммируем площадь окон
        const windowsCount = parseInt(input.windowsCount) || 0;
        let windowsArea = 0;
        for (let i = 1; i <= windowsCount; i++) {
            const w = parseFloat(input[`windowsCount_${i}_width`]);
            const h = parseFloat(input[`windowsCount_${i}_height`]);
            if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
                windowsArea += w * h;
            }
        }

        // Суммируем площадь дверей
        const doorsCount = parseInt(input.doorsCount) || 0;
        let doorsArea = 0;
        for (let i = 1; i <= doorsCount; i++) {
            const w = parseFloat(input[`doorsCount_${i}_width`]);
            const h = parseFloat(input[`doorsCount_${i}_height`]);
            if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) {
                doorsArea += w * h;
            }
        }

        const openingsArea = windowsArea + doorsArea;
        const netArea = grossArea - openingsArea;

        if (netArea <= 0) return "Площадь проёмов не может быть больше или равна площади стен. Проверьте введённые размеры.";

        const margin = 1.05; // запас 5% на бой и подрезку
        let out = `Периметр стен: ${perimeter} м\n`;
        out += `Высота стен: ${height} м\n`;
        out += `Площадь стен (брутто): ${grossArea.toFixed(1)} м²\n`;
        out += `Окон: ${windowsCount}, площадь окон: ${windowsArea.toFixed(2)} м²\n`;
        out += `Дверей: ${doorsCount}, площадь дверей: ${doorsArea.toFixed(2)} м²\n`;
        out += `Площадь кладки (за вычетом проёмов): ${netArea.toFixed(1)} м²\n`;
        out += `Материал: ${input.masonryMaterial}\n\n`;

        if (input.masonryMaterial === "Кирпич") {
            const thickness = parseFloat(input.brickThickness);
            if (isNaN(thickness) || thickness <= 0) return "Укажите толщину кладки в кирпичах.";

            // База: 51 шт/м² на каждые 0.5 кирпича толщины (справочное значение,
            // учитывает шов 10 мм). Расход растёт линейно с толщиной —
            // упрощение, не учитывающее экономию на перевязке (в пределах пары %).
            const baseRatePerHalfBrick = 51;
            const rate = baseRatePerHalfBrick * (thickness / 0.5);
            const totalUnits = Math.ceil(netArea * rate * margin);

            out += `Толщина кладки: ${thickness} кирпича (~${Math.round(thickness * 250)} мм)\n`;
            out += `Расход: ${rate.toFixed(1)} шт/м²\n\n`;
            out += `ИТОГО (с запасом 5%): ${totalUnits} кирпичей\n\n`;

        } else if (input.masonryMaterial === "Блок (газоблок, ракушечник, известняк и др.)") {
            const blockLength = parseFloat(input.blockLength);
            const blockHeight = parseFloat(input.blockHeight);
            const blockWidth = parseFloat(input.blockWidth);
            const seam = parseFloat(input.blockSeam);

            if (isNaN(blockLength) || blockLength <= 0) return "Укажите длину блока.";
            if (isNaN(blockHeight) || blockHeight <= 0) return "Укажите высоту блока.";
            if (isNaN(blockWidth) || blockWidth <= 0) return "Укажите ширину блока.";
            if (isNaN(seam) || seam < 0) return "Укажите толщину шва (0, если впритык).";

            // Расход по площади лицевой грани блока (длина × высота) с учётом шва.
            // Блок укладывается в один ряд по глубине (ширина = толщина стены),
            // поэтому расход штук на м² не зависит от толщины стены.
            const lengthM = (blockLength + seam) / 1000;
            const heightM = (blockHeight + seam) / 1000;
            const areaPerUnit = lengthM * heightM;
            const rate = 1 / areaPerUnit;
            const totalUnits = Math.ceil(netArea * rate * margin);

            const volumePerUnit = (blockLength / 1000) * (blockHeight / 1000) * (blockWidth / 1000);
            const totalVolume = totalUnits * volumePerUnit;

            out += `Размер блока: ${blockLength} × ${blockHeight} × ${blockWidth} мм (Д×В×Ш)\n`;
            out += `Толщина шва: ${seam} мм\n`;
            out += `Расход: ${rate.toFixed(2)} шт/м²\n\n`;
            out += `ИТОГО (с запасом 5%): ${totalUnits} блоков\n`;
            out += `Объём (справочно, для заказа по м³): ${totalVolume.toFixed(2)} м³\n\n`;

        } else {
            return "Выберите материал кладки.";
        }

        out += `Статус: ПРИНЯТО\n\n`;
        out += `Расчёт выполнен по нормативным формулам для типовых условий.`;
        return out;
    }
});
