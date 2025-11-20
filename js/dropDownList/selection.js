/**
 * 用str替换指定位置的一个特殊字符
 * @param {number} index - 替换的位置的索引 
 * @param {string} str - 替换内容 
 * @returns 
 */
function replaceSpecialChar(index, str) {
    if (index === -1) return;
    const selection = window.getSelection();
    if (selection.rangeCount < 1) return;
    const range = selection.getRangeAt(0);
    const focusNode = selection.focusNode;
    range.setStart(focusNode, index);
    range.setEnd(focusNode, index + 1);
    // 清除特殊字符 要准备插入新的替换内容
    range.deleteContents();
    /** @type {Text} */
    const textNode = document.createTextNode(str);
    range.insertNode(textNode);
    // 将range收缩到末尾 false是开头

    range.setStart(textNode, str.length);
    range.collapse(true);
}

/**
 * 观察输入执行代码 
 * @returns {number} atIndex
 */
function onObserveInput() {
    const selection = window.getSelection();
    if (!selection) return;
    /** @type {CharacterData} */
    const focusNode = selection.focusNode;
    if (!(focusNode instanceof CharacterData)) return;
    let cursorBeforeStr = focusNode.data.slice(0, selection.focusOffset);
    const atIndex = cursorBeforeStr.lastIndexOf('@');
    return atIndex;
}


