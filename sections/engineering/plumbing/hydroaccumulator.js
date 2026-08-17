window.CalculatorRegistry.register({
    id: "plumbing-hydroaccumulator",
    section: "Инженерные системы",
    subsection: "Сантехника",
    name: "Объём гидроаккумулятора",
    fields: [
        { id: "pumpFlow", label: "Производительность насоса (л/мин)", type: "number", step: 1 },
        { id: "pressureOn", label: "Давление включения насоса (бар)", type: "number", step: 0.1 },
        { id: "pressureOff", label: "Давление выключения насоса (бар)", type: "number", step: 0.1 },
        { id: "cycles", label: "Допустимое число включений в час", type: "number", step: 1 }
    ],
    calculate(input) {
        const pumpFlow = parseFloat(input.pumpFlow);
        const pOn = parseFloat(input.pressureOn);
        const pOff = parseFloat(input.pressureOff);
        const cycles = parseFloat(input.cycles);
        if (isNaN(pumpFlow) || isNaN(pOn) || isNaN(pOff) || isNaN(cycles)) return "Заполните все поля корректно.";
        if (pumpFlow <= 0 || pOn <= 0 || pOff <= 0 || cycles <= 0) return "Все значения должны быть больше нуля.";
        if (pOff <= pOn) return "Давление выключения должно быть больше давления включения.";

        const pPrecharge = pOn - 0.3;
        if (pPrecharge <= 0) return "Давление включения должно быть больше 0.3 бар.";

        // Классическая формула объёма мембранного бака
        const Q = pumpFlow * 60; // л/час
        const numerator = Q * (pOff + 1) * (pOn + 1);
        const denominator = (pOff - pOn) * pPrecharge * cycles;
        const volume = numerator / denominator;

        let out = `Производительность насоса: ${pumpFlow} л/мин = ${Q} л/час\n`;
        out += `Давление включения: ${pOn} бар\n`;
        out += `Давление выключения: ${pOff} бар\n`;
        out += `Давление предварительной закачки: ${pPrecharge.toFixed(1)} бар\n`;
        out += `Допустимое число включений: ${cycles} в час\n\n`;
        out += `ИТОГО: объём гидроаккумулятора ${Math.ceil(volume / 10) * 10} л\n`;
        out += `Расчётный объём: ${volume.toFixed(1)} л\n\n`;
        out += `Статус: ПРИНЯТО\n\n`;
        out += `Расчёт выполнен по нормативным формулам для типовых условий.`;
        return out;
    }
});
