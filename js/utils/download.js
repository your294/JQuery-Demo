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

/**
 * 用于JQuery 遇到需要使用post请求下载文件，但不支持json格式，只支持application/x-www-form-urlencoded
 * 'http://localhost:3000/downloadBySerial'
 * @param {string} url
 * @param {Object} param 
 */
function downloadByForm(url, param) {
    const form = $('<form></form>', {
        method: 'POST',
        action: url,
        style: 'display: none;'
    });
    for (const key in param) {
        form.append($('<input>', {
            type: 'hidden',
            name: key,
            value: param[key]
        }))
    }
    $('body').append(form);
    form.trigger('submit');
    form.remove();
}

function downloadThroughPost(url, param) {
    $.ajax({
        url,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(param),
        xhr: function() {
            const xhr = new XMLHttpRequest();
            xhr.responseType = 'blob';
            return xhr;
        },
        success: function(blob, status, xhr) {
            let filename = 'default.txt';
            const disposition = xhr.getResponseHeader('Content-Disposition');
            if (disposition) {
                const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                if (match && match[1]) {
                    filename = decodeURIComponent(match[1]).replace(/^['"]|['"]$/g, '');;
                }
            }
            // 创建下载链接
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        },
        error: function(xhr) {
            alert('下载失败：' + xhr.responseText);
        }
    })
}

export {
    downloadCrossOriginFile,
    downloadByForm,
    downloadThroughPost
}