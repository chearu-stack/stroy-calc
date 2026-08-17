window.CalculatorRegistry.register({
    id: "heating-heat-loss",
    section: "Инженерные системы",
    subsection: "Отопление",
    name: "Расчёт теплопотерь дома",
    fields: [
        { id: "region", label: "Регион", type: "select", options: () => window.Data.regions.names() },
        { id: "wallArea", label: "Площадь стен (м²)", type: "number", step: 1 },
        { id: "windowArea", label: "Площадь окон (м²)", type: "number", step: 0.1 },
        { id: "floorArea", label: "Площадь пола (м²)", type: "number", step: 1 },
        { id: "roofArea", label: "Площадь кровли (м²)", type: "number", step: 1 },
        { id: "doorArea", label: "Площадь дверей (м²)", type: "number", step: 0.1 },
        { id: "volume", label: "Отапливаемый объём (м³)", type: "number", step: 1 },
        { id: "ventilationType", label: "Тип вентиляции", type: "select", options: [
            "Современный герметичный дом с рекуператором",
            "Дом с естественной вентиляцией",
            "Дом с механической вытяжкой",
            "Старый дом со сквозняками",
            "Ввести своё значение"
        ] },
        {
            id: "airChangesManual",
            label: "Кратность воздухообмена (1/ч)",
            type: "number",
            step: 0.1,
            placeholder: "Например: 0.5",
            visibleWhen: {
                field: "ventilationType",
                equals: "Ввести своё значение"
            }
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

        if (!region || !Number.isFinite(wallArea) || !Number.isFinite(windowArea) || !Number.isFinite(floorArea) || !Number.isFinite(roofArea) || !Number.isFinite(doorArea) || !Number.isFinite(volume)) {
            return "Заполните все поля корректно.";
        }

        const airChangesMap = {
            "Современный герметичный дом с рекуператором": 0.25,
            "Дом с естественной вентиляцией": 0.5,
            "Дом с механической вытяжкой": 0.65,
            "Старый дом со сквозняками": 1.0
        };

        let airChanges;
        let airSource;

        if (input.ventilationType === "Ввести своё значение") {
            airChanges = parseFloat(input.airChangesManual);
            airSource = "введено вручную";
        } else {
            airChanges = airChangesMap[input.ventilationType];
            airSource = input.ventilationType;
        }

        if (!Number.isFinite(airChanges) || airChanges < 0) {
            return "Введите корректное значение кратности воздухообмена.";
        }

        const indoorTemp = 20;
        const outdoorTemp = Number(region.temp);
        const tempDiff = indoorTemp - outdoorTemp;
        if (tempDiff <= 0) return "Расчёт теплопотерь невозможен при такой температуре.";

        const U = window.Data.heating.defaultU;

        const wallLoss = U["Стены"] * wallArea * tempDiff;
        const windowLoss = U["Окна"] * windowArea * tempDiff;
        const floorLoss = U["Пол"] * floorArea * tempDiff;
        const roofLoss = U["Кровля"] * roofArea * tempDiff;
        const doorLoss = U["Двери"] * doorArea * tempDiff;
        const transmissionLoss = wallLoss + windowLoss + floorLoss + roofLoss + doorLoss;

        const ventilationLoss = 0.335 * airChanges * volume * tempDiff;

        const totalBeforeReserve = transmissionLoss + ventilationLoss;
        const totalLoss = totalBeforeReserve * window.Data.heating.thermalBridgeReserve;
        const totalLossKW = totalLoss / 1000;
        const boilerPowerKW = totalLossKW * 1.20;
        const heatLossPerM2 = totalLoss / floorArea;

        window.HeatingResults.save(window.Data.heating.sourceKeys.heatLoss, { value: totalLossKW, unit: "кВт" });
        window.HeatingResults.save(window.Data.heating.sourceKeys.heatLossPerM2, { value: heatLossPerM2, unit: "Вт/м²" });
        window.HeatingResults.save(window.Data.heating.sourceKeys.boilerPower, { value: boilerPowerKW, unit: "кВт" });

        let out = "";
        out += `Регион: ${input.region}\n`;
        out += `Температура снаружи: ${outdoorTemp}°C\n`;
        out += `Температура внутри: ${indoorTemp}°C\n`;
        out += `Разница температур: ${tempDiff.toFixed(1)}°C\n\n`;
        out += `Теплопотери через ограждения:\n`;
        out += `Стены: ${wallLoss.toFixed(0)} Вт\n`;
        out += `Окна: ${windowLoss.toFixed(0)} Вт\n`;
        out += `Пол: ${floorLoss.toFixed(0)} Вт\n`;
        out += `Кровля: ${roofLoss.toFixed(0)} Вт\n`;
        out += `Двери: ${doorLoss.toFixed(0)} Вт\n`;
        out += `Итого: ${transmissionLoss.toFixed(0)} Вт\n\n`;
        out += `Вентиляция: ${airSource}\n`;
        out += `Кратность: ${airChanges} 1/ч\n`;
        out += `Вентиляционные теплопотери: ${ventilationLoss.toFixed(0)} Вт\n\n`;
        out += `Суммарные с резервом 10%: ${totalLossKW.toFixed(2)} кВт\n`;
        out += `Удельные: ${heatLossPerM2.toFixed(0)} Вт/м²\n\n`;
        out += `Рекомендуемая мощность источника тепла: ${boilerPowerKW.toFixed(2)} кВт\n\n`;
        out += `Результат сохранён для калькуляторов отопления.\n\n`;
        out += `ВАЖНО:\n`;
        out += `U-значения ограждений ориентировочные. Для проекта — фактические конструкции.`;
        return out;
    }
});
