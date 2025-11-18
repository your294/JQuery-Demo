/**
 * 
 * @param {JQuery} $list 
 * @param {JQuery} $template 
 */
function initialList($list, $template) {
    getPrizeList().then((list) => {
        $list.data('prize-list', list);
        if (!list || list.length == 0) {
            addFirstItem($template);
            return;
        }
        const fragment = document.createDocumentFragment();
        list.forEach((obj) => {
            const $clone = cloneTemplateDOM($template);
            $clone.find('.name-input').val(obj.name);
            $clone.find('.email-input').val(obj.email);
            let error = '';
            if (!InputValidator.nameCheck(obj.name)) {
                error += '姓名需要8-16位';
            }
            if (!InputValidator.emailCheck(obj.email)) {
                error += '邮箱格式错误';
            }
            const $error = $clone.find('.error');
            if (error !== '') {
                $error.toggleClass('none', false).text(error);
            } else {
                $error.toggleClass('none', true);
            }
            fragment.append($clone[0]);
        })
        $list.append(fragment);
    })
}

function addFirstItem($template) {
    const clone = document.importNode($template[0].content, true);
    const $clone = $(clone);
    const $list = $('#list');
    $list.append($clone);
    $list.data('prize-list', [{}]);
  }

function cloneTemplateDOM($template) {
    const clone = document.importNode($template[0].content, true);
    const $clone = $(clone);
    return $clone;
}

/**
 * 
 * @param {JQuery} $list 
 */
function checkListInput($list) {
    const allItems = $list.find('.item');
    allItems.each((_, item) => {
        const $item = $(item);
        const name = $item.find('.name-input').val();
        const email = $item.find('.email-input').val();
        let error = '';
        if (!InputValidator.nameCheck(name)) {
            error += '姓名不能存在特殊字符';
        }
        if (!InputValidator.emailCheck(email)) {
            error += '邮箱格式错误';
        }
        const $error = $item.find('.error');
        if (error !== '') {
            $error.toggleClass('none', false).text(error);
        } else {
            $error.toggleClass('none', true);
        }
    })
}