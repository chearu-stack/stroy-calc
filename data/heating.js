window.Data = window.Data || {};

window.Data.heating = {

    radiators: {
        "Алюминиевые": {
            powerPerSection: 180
        },

        "Биметаллические": {
            powerPerSection: 170
        },

        "Чугунные": {
            powerPerSection: 120
        }
    },

    // Ориентировочные U для предварительного расчёта.
    // Для проектного расчёта должны заменяться
    // характеристиками фактических конструкций.
    defaultU: {
        "Стены": 0.35,
        "Окна": 1.40,
        "Пол": 0.30,
        "Кровля": 0.25,
        "Двери": 1.80
    },

    radiatorExponent: 1.30,

    thermalBridgeReserve: 1.10,

    sourceKeys: {
        heatLoss: "heating.heatLoss",
        heatLossPerM2: "heating.heatLossPerM2",
        boilerPower: "heating.boilerPower"
    }
};


// ------------------------------------------------------------
// Локальное хранилище результатов отопления.
//
// Это НЕ глобальная архитектура проекта.
// Это просто память результатов именно этого раздела.
//
// Если localStorage недоступен — калькуляторы работают
// самостоятельно.
// ------------------------------------------------------------

window.HeatingResults = {

    save(key, value) {

        try {
            localStorage.setItem(
                "stroyCalc." + key,
                JSON.stringify(value)
            );
        } catch (e) {
            // Ничего не делаем.
        }
    },

    load(key) {

        try {

            const value =
                localStorage.getItem(
                    "stroyCalc." + key
                );

            return value
                ? JSON.parse(value)
                : null;

        } catch (e) {

            return null;
        }
    },

    clear(key) {

        try {
            localStorage.removeItem(
                "stroyCalc." + key
            );
        } catch (e) {
            // Ничего не делаем.
        }
    }
};
