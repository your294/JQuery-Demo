const baseUrl = "../../assets/";
const picUrls = ["1.jpg", "2.jpg", "3.jpg"];
const promiseQueue = new PromiseQueue(2);
$(function () {
    const picContainer = $('#pic-container');
    picUrls.forEach((url) => {
        promiseQueue.push(() => loadImage(baseUrl + url));
    })

    $('#load-btn').on('click', async function() {
        while (!promiseQueue.empty()) {
            const arr = await promiseQueue.exec(); // 等待本次执行完成
            arr.forEach((result, index) => {
                if (result.ok) {
                    picContainer.append(result.res);
                } else {
                    console.error('pic index: ', index, ', error: ', result.err);
                }
            });
        }
    });
})