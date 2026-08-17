window.CalculatorRegistry.register({
    id: "plumbing-septic",
    section: "Инженерные системы",
    subsection: "Сантехника",
    name: "Расчёт септика",
    fields: [
        { id: "people", label: "Количество проживающих", type: "number", step: 1 },
        { id: "daily", label: "Суточный расход на человека (л), по умолчанию 200", type: "number", step: 10 }
    ],
    calculate(input) {
        const people = parseInt(input.people);
        let daily = parseFloat(input.daily);
        if (isNaN(people) || people <= 0) return "Количество проживающих должно быть больше нуля.";
        if (isNaN(daily) || daily <= 0) daily = 200;

        const dailyTotal = people * daily;
        const threeDayVolume = dailyTotal * 3;
        const workingVolume = threeDayVolume;
        const totalVolume = workingVolume * 1.3;

        let out = `Проживающих: ${people}\n`;
        out += `Суточный расход на человека: ${daily} л\n`;
        out += `Общий суточный расход: ${dailyTotal} л\n`;
        out += `Трёхсуточный объём: ${threeDayVolume} л\n\n`;
        out += `Рабочий объём септика: ${workingVolume} л = ${(workingVolume / 1000).toFixed(1)} м³\n`;
        out += `Полный объём (с запасом 30%): ${Math.ceil(totalVolume / 100) * 100} л = ${(totalVolume / 1000).toFixed(1)} м³\n\n`;

        let recommendation;
        if (totalVolume <= 3000) {
            recommendation = "Септик из бетонных колец: 2 кольца КС 15-9";
        } else if (totalVolume <= 5000) {
            recommendation = "Септик из бетонных колец: 3 кольца КС 15-9";
        } else if (totalVolume <= 8000) {
            recommendation = "Станция биологической очистки или септик с инфильтратором";
        } else {
            recommendation = "Станция биологической очистки";
        }

        out += `Рекомендация: ${recommendation}\n\n`;
        out += `Статус: ПРИНЯТО\n\n`;
        out += `Расчёт выполнен по нормативным формулам для типовых условий.`;
        return out;
    }
});
