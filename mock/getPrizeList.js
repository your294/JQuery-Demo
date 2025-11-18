/**
 * @typedef {Object} Prize
 * @property {string} [name]
 * @property {string} [email]
 */
/**
 * Mock 产生基本奖品列表数据接口
 * @returns {Promise<Array<Prize>>}
 */

function getPrizeList() {
    const prizeList = Array(5).fill().map((_, i) => ({
        name: 'test' + i,
        email: 'test' + i + '@xx.com'
    }));
    return new Promise((resolve) => {
        resolve(prizeList);
    })
}