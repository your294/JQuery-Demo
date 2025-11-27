/**
 * @typedef {Object} ExecReturn
 * @property {bool} [ok]
 * @property {any} [res]
 * @property {any} [err]
 */
/**
 * Promise队列，用于控制Promise并发规模
 */
class PromiseQueue {
    //  执行队列
    /** @type {Array<Promise>} */
    exec_queue = [];
    // 缓冲队列
    /** @type {Array<Promise>} */
    buff_queue = [];
    size = 1;
    /**
     * 控制队列可容纳Promise长度 > 0
     * @param {number} size 
     */
    constructor(size = 1) {
        if (size <= 0) size = 1;
        this.size = size;
    }
    /**
     * 将任意对象推入执行队列（size充足的情况），不充足将会进入缓冲队列
     * 进入执行队列会立刻被包装成Promise，缓冲队列不会包装成Promise
     * @param {any} exec 
     */
    push(exec) {
        if (this.exec_queue.length >= this.size) {
            this.buff_queue.push(exec);
            return;
        }
        this.exec_queue.push(new Promise((resolve) => {
            resolve(exec);
        }));
    }

    /**
     * 尝试清空当前PromiseQueue，并开始转入内容进入exec_queue
     * @return {Promise<Array<ExecReturn>>}
     */
    exec() {
        if (this.exec_queue.length <= 0) return;
        const promises = this.exec_queue.map((p) => {
            return p.then((exec) => {
                return typeof exec === 'function' ? exec() : exec;
            })
        });
        /** @type {Array<ExecReturn>} */
        const execResults = [];
        return Promise.allSettled(promises).then((results) => {
            results.forEach((values) => {
                if (values.status === 'fulfilled') {
                    execResults.push({ok: true, res: values.value});
                } else {
                    execResults.push({ok: false, err: values.reason})
                }
            })
            return new Promise((resolve) => resolve(execResults));
        }).finally(() => {
            this.exec_queue = [];
            while (this.buff_queue.length > 0 && this.exec_queue.length < this.size) {
                this.exec_queue.push(new Promise(resolve => {
                    const exec = this.buff_queue.pop();
                    resolve(exec);
                }))
            }
        })
    }

    /**
     * 
     * @returns {boolean}
     */
    empty() {
        return this.exec_queue.length === 0;
    }
}