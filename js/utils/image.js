/**
 * js加载图片
 * @param {string} url 
 * @returns {Promise<any>}
 */
function loadImage(url) {
    return new Promise((resolve, reject) => {
        /** @type {HTMLImageElement} */
        const imgEL = new Image();
        imgEL.onload = () => {
            resolve(imgEL);
        }
        imgEL.onerror = () => reject(new Error('Image load Error'));
        // 这里正式发起请求
        imgEL.src = url;
    })
}