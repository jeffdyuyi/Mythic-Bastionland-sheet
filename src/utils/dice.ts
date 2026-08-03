export const rollDice = (sides: number): number => {
    return Math.floor(Math.random() * sides) + 1;
};

export const rollMultiple = (count: number, sides: number): number => {
    let total = 0;
    for (let i = 0; i < count; i++) {
        total += rollDice(sides);
    }
    return total;
};

export const parseFormula = (formula: string): number => {
    // Simple evaluator for things like "1d12+1d6", "1d12+6", "2d6"
    const parts = formula.replace(/\s/g, '').split('+');
    let total = 0;

    for (const part of parts) {
        if (part.includes('d')) {
            const [countStr, sidesStr] = part.split('d');
            const count = parseInt(countStr) || 1;
            const sides = parseInt(sidesStr) || 1;
            total += rollMultiple(count, sides);
        } else {
            total += parseInt(part) || 0;
        }
    }

    return total;
};
