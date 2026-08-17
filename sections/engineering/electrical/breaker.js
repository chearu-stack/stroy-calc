window.CalculatorRegistry.register({
    id: "electrical-breaker",
    section: "Инженерные системы",
    subsection: "Электрика",
    name: "Выбор вводного автомата и УЗО",
    fields: [
        { id: "power", label: "Суммарная мощность дома (кВт)", type: "number", step: 0.5 },
        { id: "voltage", label: "Напряжение сети", type: "select", options: ["220", "380"] }
    ],
    calculate(input) {
        const power = parseFloat(input.power);
        const voltage = parseInt(input.voltage);
        if (isNaN(power) || isNaN(voltage)) return "Заполните все поля корректно.";
        if (power <= 0) return "Мощность должна быть больше нуля.";

        let current;
        if (voltage === 220) {
            current = power * 1000 / 220;
        } else {
            current = power * 1000 / (380 * 1.73);
        }

        const withReserve = current * 1.25;
        const breakers = window.Data.electrical.breakers;
        let breaker = null;
        for (let i = 0; i < breakers.length; i++) {
            if (breakers[i] >= withReserve) {
                breaker = breakers[i];
                break;
            }
        }

        if (!breaker) {
            return `Ток: ${current.toFixed(1)} А\n\nТребуемый автомат: более 100 А\nСтатус: ПРЕВЫШЕН ТИПОВОЙ РЯД\n\nРасчёт выполнен по нормативным формулам для типовых условий.`;
        }

        const rcd = breaker >= 63 ? 100 : breaker;

        let out = `Суммарная мощность: ${power} кВт\n`;
        out += `Напряжение: ${voltage} В\n`;
        out += `Рабочий ток: ${current.toFixed(1)} А\n`;
        out += `С запасом 25%: ${withReserve.toFixed(1)} А\n\n`;
        out += `Вводной автомат: ${breaker} А\n`;
        out += `УЗО: ${rcd} А, 30 мА (противопожарное 100 мА)\n`;
        out += `Сечение вводного кабеля: ${breaker >= 63 ? 16 : breaker >= 40 ? 10 : 6} мм²\n\n`;
        out += `Статус: ПРИНЯТО\n\n`;
        out += `Расчёт выполнен по нормативным формулам для типовых условий.`;
        return out;
    }
});
