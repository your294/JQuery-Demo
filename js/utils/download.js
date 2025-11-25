async function downloadCrossOriginFile(url, filename) {
    const response = await fetch(url, {
        method: 'GET',
        mode: 'cors', // 必须启用 CORS
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename; // ✅ 这里可以自定义文件名！
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
}