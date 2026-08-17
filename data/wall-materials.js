window.Data = window.Data || {};

window.Data.wallMaterials = {
    "Кирпич полнотелый":         { lambda: 0.6,  density: 1800, strength: 100 },
    "Кирпич поризованный":       { lambda: 0.25, density: 1000, strength: 75 },
    "Газобетон D400":            { lambda: 0.12, density: 400,  strength: 25 },
    "Газобетон D500":            { lambda: 0.14, density: 500,  strength: 35 },
    "Пенобетон D600":            { lambda: 0.18, density: 600,  strength: 30 },
    "Керамзитобетон":            { lambda: 0.35, density: 1000, strength: 50 },
    "Дерево (сосна)":            { lambda: 0.12, density: 500,  strength: 60 },
    "Монолитный бетон":          { lambda: 1.7,  density: 2400, strength: 150 },

    names() {
        return Object.keys(this);
    }
};

window.Data.insulation = {
    "Минеральная вата":              { lambda: 0.040 },
    "Пенополистирол":                { lambda: 0.035 },
    "Экструдированный пенополистирол": { lambda: 0.032 },
    "Пенополиуретан":                { lambda: 0.027 },
    "Эковата":                        { lambda: 0.042 },

    names() {
        return Object.keys(this);
    }
};