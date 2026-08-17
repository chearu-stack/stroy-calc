// ============================================
// РЕЕСТР
// Хранит зарегистрированные калькуляторы.
// Отклоняет некорректные калькуляторы ДО того,
// как они попадут в интерфейс — не должно быть
// молчаливых сбоев.
// ============================================

window.CalculatorRegistry = {
    _list: [],

    register(calc) {
        const errors = this._validate(calc);

        if (errors.length > 0) {
            console.error(
                `[CalculatorRegistry] Калькулятор "${calc && calc.id ? calc.id : "(без id)"}" НЕ зарегистрирован:\n` +
                errors.map(e => "  - " + e).join("\n")
            );
            return;
        }

        this._list.push(calc);
    },

    _validate(calc) {
        const errors = [];

        if (!calc || typeof calc !== "object") {
            errors.push("объект калькулятора отсутствует или не является объектом");
            return errors;
        }

        // --- обязательные поля ---
        const required = ["id", "section", "name", "fields", "calculate"];
        required.forEach(key => {
            if (calc[key] === undefined || calc[key] === null) {
                errors.push(`отсутствует обязательное поле "${key}"`);
            }
        });

        if (errors.length > 0) return errors; // дальше проверять нечего

        // --- id ---
        if (typeof calc.id !== "string" || calc.id.trim() === "") {
            errors.push(`"id" должен быть непустой строкой`);
        } else if (this._list.some(c => c.id === calc.id)) {
            errors.push(`id "${calc.id}" уже зарегистрирован (дубликат)`);
        }

        // --- section / subsection против taxonomy ---
        const taxonomy = window.Data && window.Data.taxonomy && window.Data.taxonomy.sections;

        if (!taxonomy) {
            errors.push(`window.Data.taxonomy не загружен — проверьте порядок подключения скриптов (data/taxonomy.js должен идти раньше registry.js)`);
        } else {
            if (!Object.prototype.hasOwnProperty.call(taxonomy, calc.section)) {
                errors.push(`раздел "${calc.section}" не найден в data/taxonomy.js (проверьте файловая_структура.txt — раздел должен быть помечен [СОЗДАНО])`);
            } else {
                const allowedSubsections = taxonomy[calc.section];

                if (allowedSubsections === null) {
                    // раздел без подразделов — subsection обязан быть null
                    if (calc.subsection !== null && calc.subsection !== undefined) {
                        errors.push(`раздел "${calc.section}" не имеет подразделов, но указан subsection "${calc.subsection}"`);
                    }
                } else {
                    // раздел с подразделами — subsection обязателен и должен быть в списке
                    if (!calc.subsection) {
                        errors.push(`раздел "${calc.section}" требует subsection, но он не указан`);
                    } else if (!allowedSubsections.includes(calc.subsection)) {
                        errors.push(`подраздел "${calc.subsection}" не найден в data/taxonomy.js для раздела "${calc.section}"`);
                    }
                }
            }
        }

        // --- name ---
        if (typeof calc.name !== "string" || calc.name.trim() === "") {
            errors.push(`"name" должен быть непустой строкой`);
        }

        // --- fields ---
        if (!Array.isArray(calc.fields) || calc.fields.length === 0) {
            errors.push(`"fields" должен быть непустым массивом`);
        } else {
            const fieldIds = new Set();
            calc.fields.forEach((field, i) => {
                if (!field || typeof field !== "object") {
                    errors.push(`fields[${i}] не является объектом`);
                    return;
                }
                if (!field.id) {
                    errors.push(`fields[${i}] не имеет "id"`);
                } else if (fieldIds.has(field.id)) {
                    errors.push(`повторяющийся id поля "${field.id}" внутри одного калькулятора`);
                } else {
                    fieldIds.add(field.id);
                }
                if (!field.label) {
                    errors.push(`fields[${i}] (id: "${field.id || "?"}") не имеет "label"`);
                }
                if (!["select", "number", "text"].includes(field.type)) {
                    errors.push(`fields[${i}] (id: "${field.id || "?"}") имеет недопустимый type "${field.type}" (ожидается select | number | text)`);
                }
                if (field.type === "select" && !field.options) {
                    errors.push(`fields[${i}] (id: "${field.id || "?"}") типа select не имеет "options"`);
                }
            });
        }

        // --- calculate ---
        if (typeof calc.calculate !== "function") {
            errors.push(`"calculate" должен быть функцией`);
        }

        return errors;
    },

    getAll() {
        return this._list;
    },

    getById(id) {
        return this._list.find(c => c.id === id);
    }
};
