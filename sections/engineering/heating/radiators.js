window.CalculatorRegistry.register({
    id: "heating-radiators",
    section: "Инженерные системы",
    subsection: "Отопление",
    name: "Расчёт радиаторов",

    fields: [

        {
            id: "roomArea",
            label: "Площадь помещения (м²)",
            type: "number",
            step: 0.1
        },

        {
            id: "ceilingHeight",
            label: "Высота потолка (м)",
            type: "number",
            step: 0.1
        },

        {
            id: "heatLossPerM2",
            label: "Расчётные теплопотери (Вт/м²)",
            type: "number",
            step: 1
        },

        {
            id: "radiatorType",
            label: "Тип радиатора",
            type: "select",
            options: [
                "Алюминиевые",
                "Биметаллические",
                "Чугунные"
            ]
        },

        {
            id: "deltaT",
            label: "Температурный напор радиатора ΔT (°C)",
            type: "number",
            step: 1
        }
    ],

    calculate(input) {

        const roomArea = parseFloat(input.roomArea);
        const ceilingHeight = parseFloat(input.ceilingHeight);
        const heatLossPerM2 = parseFloat(input.heatLossPerM2);
        const deltaT = parseFloat(input.deltaT);

        if (
            !Number.isFinite(roomArea) ||
            !Number.isFinite(ceilingHeight) ||
            !Number.isFinite(heatLossPerM2) ||
            !Number.isFinite(deltaT)
        ) {
            return "Заполните все поля корректно.";
        }

        if (
            roomArea <= 0 ||
            ceilingHeight <= 0 ||
            heatLossPerM2 <= 0 ||
            deltaT <= 0
        ) {
            return "Все значения должны быть больше нуля.";
        }

        const radiator =
            window.Data.heating.radiators[input.radiatorType];

        if (!radiator) {
            return "Выберите тип радиатора.";
        }

        const roomVolume =
            roomArea *
            ceilingHeight;

        // Требуемая мощность помещения.
        //
        // heatLossPerM2 предполагается уже рассчитанным
        // для данного помещения.
        const requiredPower =
            roomArea *
            heatLossPerM2;

        // Паспортная мощность обычно указывается
        // при ΔT = 70 °C.
        //
        // P = P70 × (ΔT / 70)^1.3
        const actualSectionPower =
            radiator.powerPerSection *
            Math.pow(
                deltaT / 70,
                window.Data.heating.radiatorExponent
            );

        const sections =
            Math.ceil(
                requiredPower /
                actualSectionPower
            );

        const installedPower =
            sections *
            actualSectionPower;

        let out = "";

        out += `Площадь помещения: ${roomArea} м²\n`;
        out += `Высота потолка: ${ceilingHeight} м\n`;
        out += `Объём помещения: ${roomVolume.toFixed(1)} м³\n`;
        out += `Расчётные теплопотери: ${heatLossPerM2} Вт/м²\n`;
        out += `Требуемая мощность: ${requiredPower.toFixed(0)} Вт\n\n`;

        out += `Тип радиатора: ${input.radiatorType}\n`;
        out += `Паспортная мощность секции при ΔT70: `;
        out += `${radiator.powerPerSection} Вт\n`;

        out += `Расчётный ΔT: ${deltaT}°C\n`;
        out += `Расчётная мощность одной секции: `;
        out += `${actualSectionPower.toFixed(0)} Вт\n\n`;

        out += `ИТОГО: ${sections} секций\n`;
        out += `Установленная мощность: ${installedPower.toFixed(0)} Вт\n\n`;

        out += `ВАЖНО:\n`;
        out += `Теплоотдача секции взята из ориентировочной `;
        out += `паспортной мощности и пересчитана по ΔT. `;
        out += `Для точного подбора используйте паспорт конкретного радиатора.`;

        return out;
    }
});
