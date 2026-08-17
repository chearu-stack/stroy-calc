window.CalculatorRegistry.register({
    id: "heating-expansion-tank",
    section: "Инженерные системы",
    subsection: "Отопление",
    name: "Расширительный бак",

    fields: [

        {
            id: "systemVolume",
            label: "Объём системы отопления (л)",
            type: "number",
            step: 1
        },

        {
            id: "minTemp",
            label: "Температура заполнения (°C)",
            type: "number",
            step: 1
        },

        {
            id: "maxTemp",
            label: "Максимальная температура теплоносителя (°C)",
            type: "number",
            step: 1
        },

        {
            id: "pressurePrecharge",
            label: "Предварительное давление бака (бар)",
            type: "number",
            step: 0.1
        },

        {
            id: "pressureMax",
            label: "Максимальное рабочее давление (бар)",
            type: "number",
            step: 0.1
        },

        {
            id: "pressureValve",
            label: "Давление предохранительного клапана (бар)",
            type: "number",
            step: 0.1
        }
    ],

    calculate(input) {

        const systemVolume =
            parseFloat(input.systemVolume);

        const minTemp =
            parseFloat(input.minTemp);

        const maxTemp =
            parseFloat(input.maxTemp);

        const pressurePrecharge =
            parseFloat(input.pressurePrecharge);

        const pressureMax =
            parseFloat(input.pressureMax);

        const pressureValve =
            parseFloat(input.pressureValve);

        if (
            !Number.isFinite(systemVolume) ||
            !Number.isFinite(minTemp) ||
            !Number.isFinite(maxTemp) ||
            !Number.isFinite(pressurePrecharge) ||
            !Number.isFinite(pressureMax) ||
            !Number.isFinite(pressureValve)
        ) {
            return "Заполните все поля корректно.";
        }

        if (
            systemVolume <= 0 ||
            maxTemp <= minTemp ||
            pressurePrecharge <= 0 ||
            pressureMax <= pressurePrecharge ||
            pressureValve <= pressureMax
        ) {
            return "Проверьте температуры и давления. Должно выполняться: Tмакс > Tмин и Pпред < Pмакс < Pклапана.";
        }

        // ----------------------------------------------------
        // Плотность воды.
        //
        // Формула Kell / IAPWS-приближения для диапазона
        // бытовых температур.
        //
        // Относительное увеличение объёма:
        //
        // e = rho(Tmin) / rho(Tmax) - 1
        //
        // ----------------------------------------------------

        function waterDensity(T) {

            return 1000 *
                (
                    1 -
                    (
                        (T + 288.9414) /
                        (508929.2 * (T + 68.12963))
                    ) *
                    Math.pow(T - 3.9863, 2)
                );
        }

        const rhoMin =
            waterDensity(minTemp);

        const rhoMax =
            waterDensity(maxTemp);

        const expansion =
            rhoMin / rhoMax - 1;

        // Объём расширившейся воды.
        const expansionVolume =
            systemVolume *
            expansion;

        // ----------------------------------------------------
        // Для мембранного бака давление необходимо считать
        // в абсолютных величинах.
        //
        // Pabs = Pman + 1 бар
        // ----------------------------------------------------

        const pPrechargeAbs =
            pressurePrecharge + 1;

        const pMaxAbs =
            pressureMax + 1;

        const efficiency =
            1 -
            pPrechargeAbs / pMaxAbs;

        if (efficiency <= 0) {
            return "Недопустимое соотношение предварительного и максимального давления.";
        }

        const theoreticalTankVolume =
            expansionVolume /
            efficiency;

        // Небольшой эксплуатационный запас.
        const recommendedTankVolume =
            theoreticalTankVolume *
            1.10;

        // Стандартные типоразмеры.
        const standardSizes = [
            8, 12, 18, 24, 25, 35, 50,
            60, 80, 100, 150, 200
        ];

        let standardSize =
            standardSizes.find(
                size => size >= recommendedTankVolume
            );

        if (!standardSize) {
            standardSize =
                Math.ceil(
                    recommendedTankVolume / 50
                ) * 50;
        }

        let out = "";

        out += `Объём системы: ${systemVolume} л\n`;
        out += `Температура заполнения: ${minTemp}°C\n`;
        out += `Максимальная температура: ${maxTemp}°C\n`;
        out += `Относительное расширение воды: `;
        out += `${(expansion * 100).toFixed(2)}%\n`;
        out += `Объём расширения: `;
        out += `${expansionVolume.toFixed(2)} л\n\n`;

        out += `Предварительное давление: `;
        out += `${pressurePrecharge} бар\n`;

        out += `Максимальное рабочее давление: `;
        out += `${pressureMax} бар\n`;

        out += `Давление клапана: `;
        out += `${pressureValve} бар\n`;

        out += `Коэффициент использования объёма бака: `;
        out += `${(efficiency * 100).toFixed(1)}%\n\n`;

        out += `Расчётный объём бака: `;
        out += `${theoreticalTankVolume.toFixed(1)} л\n`;

        out += `С эксплуатационным запасом 10%: `;
        out += `${recommendedTankVolume.toFixed(1)} л\n\n`;

        out += `ИТОГО: рекомендуемый типоразмер `;
        out += `${standardSize} л\n\n`;

        out += `ВАЖНО:\n`;
        out += `Расчёт выполнен для воды. Для гликолевых теплоносителей `;
        out += `коэффициент температурного расширения должен быть `;
        out += `определён отдельно. Перед монтажом необходимо проверить `;
        out += `предварительное давление бака и допустимое давление `;
        out += `конкретного оборудования.`;

        return out;
    }
});
