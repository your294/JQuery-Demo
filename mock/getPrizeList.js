function getPrizeList() {
    const prizeList = Array(5).fill().map((_, i) => ({
        name: 'test' + i,
        email: 'test' + i + '@xx.com'
    }));
    return new Promise((resolve) => {
        resolve(prizeList);
    })
}