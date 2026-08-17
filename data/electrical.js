window.Data = window.Data || {};

window.Data.electrical = {
    cables: {
        "1.5": { current: 15, power: 3.3 },
        "2.5": { current: 21, power: 4.6 },
        "4":   { current: 27, power: 5.9 },
        "6":   { current: 34, power: 7.5 },
        "10":  { current: 50, power: 11.0 },
        "16":  { current: 80, power: 17.6 },
        "25":  { current: 100, power: 22.0 }
    },

    breakers: [16, 20, 25, 32, 40, 50, 63, 80, 100],

    rcd: [16, 25, 32, 40, 50, 63, 80, 100]
};
