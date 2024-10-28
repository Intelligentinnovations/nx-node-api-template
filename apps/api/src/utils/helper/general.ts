export const generateRandomNumber  = (length: number) => {
    return Math.random().toFixed(length).slice(2);
}
