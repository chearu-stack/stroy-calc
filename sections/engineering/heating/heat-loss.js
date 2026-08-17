window.CalculatorRegistry.register({
    id: "heating-heat-loss",
    section: "Инженерные системы",
    subsection: "Отопление",
    name: "Расчёт теплопотерь дома",

    fields: [

        {
            id: "region",
            label: "Регион",
            type: "select",
            options: () => window.Data.regions.names()
        },

        {
            id: "wallArea",
            label: "Площадь стен (м²)",
            type: "number",
            step: 1
        },

        {
            id: "windowArea",
            label: "Площадь окон (м²)",
            type: "number",
            step: 0.1
        },

        {
            id: "floorArea",
            label: "Площадь пола (м²)",
            type: "number",
            step: 1
        },

        {
            id: "roofArea",
            label: "Площадь кровли (м²)",
            type: "number",
            step: 1
        },

        {
            id: "doorArea",
            label: "Площадь дверей (м²)",
            type: "number",
            step: 0.1
        },

        {
            id: "volume",
            label: "Отапливаемый объём дома (м³)",
            type: "number",
            step: 1
        },

        {
            id: "airChanges",
            label: "Кратность воздухообмена (1/ч)",
            type: "number",
            step: 0.1
        }
    ],

    calculate(input) {

        const region = window.Data.regions[input.region];

        const wallArea = parseFloat(input.wallArea);
        const windowArea = parseFloat(input.windowArea);
        const floorArea = parseFloat(input.floorArea);
        const roofArea = parseFloat(input.roofArea);
        const doorArea = parseFloat(input.doorArea);
        const volume = parseFloat(input.volume);
        const airChanges = parseFloat(input.airChanges);

        if (
            !region ||
            !Number.isFinite(wallArea) ||
            !Number.isFinite(windowArea) ||
            !Number.isFinite(floorArea) ||
            !Number.isFinite(roofArea) ||
            !Number.isFinite(doorArea) ||
            !Number.isFinite(volume) ||
            !Number.isFinite(airChanges)
        ) {
            return "Заполните все поля корректно.";
        }

        if (
            wallArea <= 0 ||
            windowArea < 0 ||
            floorArea <= 0 ||
            roofArea <= 0 ||
            doorArea < 0 ||
            volume <= 0 ||
            airChanges < 0
        ) {
            return "Площади и объём должны быть положительными, воздухообмен — неотрицательным.";
        }

        const indoorTemp = 20;
        const outdoorTemp = Number(region.temp);
        const tempDiff = indoorTemp - outdoorTemp;

        if (tempDiff <= 0) {
            return "Расчёт теплопотерь возможен только при температуре наружного воздуха ниже расчётной внутренней.";
        }

        const U = window.Data.heating.defaultU;

        // ----------------------------------------------------
        // Трансмиссионные теплопотери:
        //
        // Q = U × A × ΔT
        //
        // U — Вт/(м²·К)
        // A — м²
        // ΔT — К
        // ----------------------------------------------------

        const wallLoss =
            U["Стены"] *
            wallArea *
            tempDiff;

        const windowLoss =
            U["Окна"] *
            windowArea *
            tempDiff;

        const floorLoss =
            U["Пол"] *
            floorArea *
            tempDiff;

        const roofLoss =
            U["Кровля"] *
            roofArea *
            tempDiff;

        const doorLoss =
            U["Двери"] *
            doorArea *
            tempDiff;

        const transmissionLoss =
            wallLoss +
            windowLoss +
            floorLoss +
            roofLoss +
            doorLoss;

        // ----------------------------------------------------
        // Вентиляционные теплопотери.
        //
        // Q = 0.335 × n × V × ΔT
        //
        // 0.335 ≈ плотность воздуха × теплоёмкость / 3600
        //
        // Результат — Вт.
        // ----------------------------------------------------

        const ventilationLoss =
            0.335 *
            airChanges *
            volume *
            tempDiff;

        // ----------------------------------------------------
        // Резерв на тепловые мосты и прочие неучтённые факторы.
        // ----------------------------------------------------

        const totalBeforeReserve =
            transmissionLoss +
            ventilationLoss;

        const totalLoss =
            totalBeforeReserve *
            window.Data.heating.thermalBridgeReserve;

        const totalLossKW =
            totalLoss / 1000;

        // 20% запас для предварительного выбора источника тепла.
        const boilerPowerKW =
            totalLossKW * 1.20;

        const boilerPowerRounded =
            Math.ceil(boilerPowerKW);

        let out = "";

        out += `Регион: ${input.region}\n`;
        out += `Расчётная температура снаружи: ${outdoorTemp}°C\n`;
        out += `Температура внутри: ${indoorTemp}°C\n`;
        out += `Разница температур: ${tempDiff.toFixed(1)}°C\n\n`;

        out += `ТЕПЛОПОТЕРИ ЧЕРЕЗ ОГРАЖДЕНИЯ:\n`;
        out += `Стены: ${wallLoss.toFixed(0)} Вт\n`;
        out += `Окна: ${windowLoss.toFixed(0)} Вт\n`;
        out += `Пол: ${floorLoss.toFixed(0)} Вт\n`;
        out += `Кровля: ${roofLoss.toFixed(0)} Вт\n`;
        out += `Двери: ${doorLoss.toFixed(0)} Вт\n`;
        out += `Итого через ограждения: ${transmissionLoss.toFixed(0)} Вт\n\n`;

        out += `ВЕНТИЛЯЦИОННЫЕ ТЕПЛОПОТЕРИ:\n`;
        out += `Объём: ${volume.toFixed(0)} м³\n`;
        out += `Кратность воздухообмена: ${airChanges.toFixed(2)} 1/ч\n`;
        out += `Теплопотери: ${ventilationLoss.toFixed(0)} Вт\n\n`;

        out += `Без дополнительного резерва: ${totalBeforeReserve.toFixed(2)} кВт\n`;
        out += `С резервом на неучтённые факторы 10%: ${totalLossKW.toFixed(2)} кВт\n`;
        out += `С запасом источника тепла 20%: ${boilerPowerKW.toFixed(2)} кВт\n\n`;

        out += `ИТОГО: ориентировочная мощность источника тепла ${boilerPowerRounded} кВт\n\n`;

        out += `ВАЖНО:\n`;
        out += `Расчёт является предварительным. U-коэффициенты ограждений `;
        out += `приняты как ориентировочные значения и должны быть заменены `;
        out += `на значения фактических конструкций для проектного расчёта.`;

        return out;
    }
});
