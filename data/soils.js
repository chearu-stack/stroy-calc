window.Data = window.Data || {};

window.Data.soils = {
    "Песок плотный":   { heaving: false, bearing: 3.5, drainage: "хорошая" },
    "Песок рыхлый":    { heaving: false, bearing: 1.5, drainage: "хорошая" },
    "Супесь":          { heaving: true,  bearing: 2.0, drainage: "средняя" },
    "Суглинок":        { heaving: true,  bearing: 1.8, drainage: "средняя" },
    "Глина":           { heaving: true,  bearing: 1.2, drainage: "плохая" },
    "Торф / органика": { heaving: false, bearing: 0.2, drainage: "плохая" },
    "Плывун":          { heaving: false, bearing: 0.5, drainage: "очень плохая" },

    names() {
        return Object.keys(this);
    }
};