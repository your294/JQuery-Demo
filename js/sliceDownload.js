class SliceDownloader {
    static CHUNK_SIZE = 1024 * 1024;

    constructor() {
        this.totalSize = 0;
        this.totalChunks = 0;
        this.downloadedChunks = 0;
        this.chunks = [];
        this.fileName = null;
    }

    async start() {
        try {
            // 先下载第一个切片
            const resp = await fetch('http://localhost:3000/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ start: 0, length: SliceDownloader.CHUNK_SIZE })
            });

            if (resp.status === 200 || resp.status === 206) {
                const contentRange = resp.headers.get('Content-Range');
                if (!contentRange) console.error('first slice error by content range');
                const fileTotalSize = parseInt(contentRange.split('/')[1]) || 0;
                this.totalSize = fileTotalSize;
                this.totalChunks = Math.ceil(fileTotalSize / SliceDownloader.CHUNK_SIZE);
                // 获取文件名
                this.fileName = decodeURIComponent(resp.headers.get('X-File-Name') || 'download.bin');
                const firstBlob = await resp.blob();
                this.chunks.push(firstBlob);
                this.downloadedChunks++;
            }
            // 调用接下来私有函数完成后续请求
            if (resp.status === 206) {
                await this._next();
            }
        } finally {
            // 执行合并操作
            this._merge();
        }
    }

    async _next() {
        for (let chunkIdx = 1; chunkIdx < this.totalChunks; chunkIdx++) {
            try {
                const resp = await fetch('http://localhost:3000/download', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        start: chunkIdx * SliceDownloader.CHUNK_SIZE, 
                        length: SliceDownloader.CHUNK_SIZE,
                    })
                });
                if (resp.status === 206 || resp.status === 200) {
                    const blob = await resp.blob();
                    this.chunks.push(blob);
                    this.downloadedChunks++;
                } 
                if (resp.status !== 206) break;
            } catch(e) {
                console.error('切片下载出错', e);
            }
        }
    }

    _merge() {
        const mergedBlob = new Blob(this.chunks);
        const url = window.URL.createObjectURL(mergedBlob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', this.fileName);
        link.click();
        window.URL.revokeObjectURL(url);
    }
}

export default SliceDownloader;