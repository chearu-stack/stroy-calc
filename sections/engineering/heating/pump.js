window.CalculatorRegistry.register({
    id: "heating-pump",
    section: "Инженерные системы",
    subsection: "Отопление",
    name: "Циркуляционный насос",

    fields: [

        {
            id: "boilerPower",
            label: "Мощность котла (кВт)",
            type: "number",
            step: 0.1
        },

        {
            id: "tempDiff",
            label: "Разница температур подача/обратка (°C)",
            type: "number",
            step: 1
        },

        {
            id: "pipeLength",
            label: "Общая длина трубопровода (м)",
            type: "number",
            step: 1
        },

        {
            id: "pipeDiameter",
            label: "Внутренний диаметр трубы (мм)",
            type: "number",
            step: 1
        },

        {
            id: "roughness",
            label: "Шероховатость трубы (мм)",
            type: "number",
            step: 0.001
        },

        {
            id: "localCoefficient",
            label: "Суммарный коэффициент местных сопротивлений ζ",
            type: "number",
            step: 0.5
        }
    ],

    calculate(input) {

        const boilerPower =
            parseFloat(input.boilerPower);

        const tempDiff =
            parseFloat(input.tempDiff);

        const pipeLength =
            parseFloat(input.pipeLength);

        const pipeDiameter =
            parseFloat(input.pipeDiameter);

        const roughness =
            parseFloat(input.roughness);

        const localCoefficient =
            parseFloat(input.localCoefficient);

        if (
            !Number.isFinite(boilerPower) ||
            !Number.isFinite(tempDiff) ||
            !Number.isFinite(pipeLength) ||
            !Number.isFinite(pipeDiameter) ||
            !Number.isFinite(roughness) ||
            !Number.isFinite(localCoefficient)
        ) {
            return "Заполните все поля корректно.";
        }

        if (
            boilerPower <= 0 ||
            tempDiff <= 0 ||
            pipeLength <= 0 ||
            pipeDiameter <= 0 ||
            roughness < 0 ||
            localCoefficient < 0
        ) {
            return "Проверьте исходные данные.";
        }

        // ----------------------------------------------------
        // Расход воды.
        //
        // G = Q / (c × ΔT)
        //
        // Упрощённо:
        // расход ≈ 0.86 × Q / ΔT м³/ч
        // ----------------------------------------------------

        const flowM3H =
            0.86 *
            boilerPower /
            tempDiff;

        const flowM3S =
            flowM3H / 3600;

        const diameterM =
            pipeDiameter / 1000;

        const area =
            Math.PI *
            Math.pow(diameterM, 2) /
            4;

        const velocity =
            flowM3S /
            area;

        // ----------------------------------------------------
        // Свойства воды:
        //
        // ρ ≈ 983 кг/м³
        // ν ≈ 0.00000048 м²/с
        //
        // Для предварительного расчёта.
        // ----------------------------------------------------

        const rho = 983;
        const kinematicViscosity = 0.00000048;

        const reynolds =
            velocity *
            diameterM /
            kinematicViscosity;

        // Относительная шероховатость.
        const relativeRoughness =
            roughness / 1000 /
            diameterM;

        // ----------------------------------------------------
        // Коэффициент трения.
        //
        // Формула Swamee-Jain.
        // ----------------------------------------------------

        let frictionFactor;

        if (reynolds < 2300) {

            frictionFactor =
                64 / reynolds;

        } else {

            frictionFactor =
                0.25 /
                Math.pow(
                    Math.log10(
                        relativeRoughness / 3.7 +
                        5.74 /
                        Math.pow(reynolds, 0.9)
                    ),
                    2
                );
        }

        // Потери напора по длине.
        const straightPipeHead =
            frictionFactor *
            (pipeLength / diameterM) *
            Math.pow(velocity, 2) /
            (2 * 9.81);

        // Местные сопротивления.
        const localHead =
            localCoefficient *
            Math.pow(velocity, 2) /
            (2 * 9.81);

        const totalHead =
            straightPipeHead +
            localHead;

        // Небольшой эксплуатационный запас.
        const recommendedHead =
            totalHead *
            1.15;

        const recommendedFlow =
            flowM3H *
            1.10;

        let out = "";

        out += `Мощность котла: ${boilerPower} кВт\n`;
        out += `Разница температур: ${tempDiff}°C\n`;
        out += `Длина трубопровода: ${pipeLength} м\n`;
        out += `Внутренний диаметр трубы: ${pipeDiameter} мм\n\n`;

        out += `Расчётный расход: `;
        out += `${flowM3H.toFixed(2)} м³/час\n`;

        out += `Скорость теплоносителя: `;
        out += `${velocity.toFixed(2)} м/с\n`;

        out += `Число Рейнольдса: `;
        out += `${Math.round(reynolds)}\n\n`;

        out += `Потери по длине: `;
        out += `${straightPipeHead.toFixed(2)} м\n`;

        out += `Потери на местных сопротивлениях: `;
        out += `${localHead.toFixed(2)} м\n`;

        out += `Суммарные потери напора: `;
        out += `${totalHead.toFixed(2)} м\n\n`;

        out += `С запасом 15%:\n`;
        out += `Требуемый расход: `;
        out += `${recommendedFlow.toFixed(2)} м³/час\n`;

        out += `Требуемый напор: `;
        out += `${recommendedHead.toFixed(2)} м\n\n`;

        out += `ИТОГО: насос ориентировочно `;
        out += `≥ ${recommendedFlow.toFixed(1)} м³/час `;
        out += `при напоре ≥ ${Math.ceil(recommendedHead)} м\n\n`;

        out += `ВАЖНО:\n`;
        out += `Расчёт выполнен для предварительного подбора. `;
        out += `Для окончательного выбора насоса необходимо учитывать `;
        out += `фактическую трассу, все фасонные элементы, арматуру, `;
        out += `теплообменники и рабочую характеристику конкретного насоса.`;

        return out;
    }
});
