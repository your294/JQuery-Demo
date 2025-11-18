import SliceDownloader from "./sliceDownload.js";

function downloadByALink(path, fileName) {
  const link = document.createElement("a");
  link.href = path;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function downloadByBlob() {
  // 方式2: 使用 fetch 下载
  fetch("http://localhost:3000/download")
    .then((response) => response.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "data.txt";
      a.click();
    });
}

function useSliceDownloader() {
  const downloader = new SliceDownloader();
  downloader.start();
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('download-btn').addEventListener('click', () => {
    useSliceDownloader();
  })
})

