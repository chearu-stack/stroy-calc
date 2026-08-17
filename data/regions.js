window.Data = window.Data || {};

window.Data.regions = {
    "Нижний Новгород": { freezing: 165, snow: 240, wind: 30, rWall: 3.2, rRoof: 4.2, temp: -31 },
    "Владимир":        { freezing: 160, snow: 200, wind: 23, rWall: 3.1, rRoof: 4.1, temp: -29 },
    "Москва":          { freezing: 140, snow: 180, wind: 23, rWall: 3.0, rRoof: 4.0, temp: -28 },
    "Ярославль":       { freezing: 170, snow: 240, wind: 30, rWall: 3.2, rRoof: 4.2, temp: -31 },
    "Казань":          { freezing: 170, snow: 240, wind: 30, rWall: 3.2, rRoof: 4.2, temp: -31 },
    "Чебоксары":       { freezing: 170, snow: 240, wind: 30, rWall: 3.2, rRoof: 4.2, temp: -31 },

    names() {
        return Object.keys(this);
    }
};