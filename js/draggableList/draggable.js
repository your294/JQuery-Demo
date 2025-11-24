(function ($) {
  $.fn.draggable = function () {
    return this.each(function () {
      const $list = $(this);
      /** @type {JQuery | HTMLElement | null} */
      let draggableItem = null;
      /** @type {JQuery | HTMLElement | null} */
      let ghostItem = null;
      /** @type {JQuery | HTMLElement | null} */
      let placeholder = null;
      /** @type {JQuery.Coordinates} */
      let listRect = $list[0].getBoundingClientRect();

      $list.on("mousedown", ".drag-item", handleMouseDown);

      /**
       * 处理鼠标点击列表项，左键有效
       * @param {JQuery.MouseDownEvent} e
       */
      function handleMouseDown(e) {
        if (e.which !== 1) {
          return;
        }
        // 这里可否用e.target
        draggableItem = this;
        /** @type {JQuery} */
        const $item = $(draggableItem);
        // 创建幽灵元素 不要设置clone为true把事件处理也copy进来
        const startX = e.pageX - listRect.left;
        const startY = e.pageY - listRect.top;
        ghostItem = $item.clone().addClass('ghost')
                    .css({
                        position: 'absolute',
                        left: startX - $item.outerWidth() / 2,
                        top: startY - $item.outerHeight() / 2,
                        width: $item.outerWidth(),
                        height: $item.outerHeight(),
                        zIndex: 9999
                    }).appendTo($list);
        placeholder = $('<li class="drag-item placeholder"></li>')
                        .css({ height: $item.outerHeight() })
                        .insertAfter($item);
        $item.addClass('dragging');
        $(document).on('mousemove.drag', onMouseMove);
        $(document).on('mouseup.drag', onMouseUp);
        // 获取一次list的Rect参数 因为加入了幽灵元素参数变化
        listRect = $list[0].getBoundingClientRect();
      }
      /**
       * 跟随鼠标移动 placeholder和幽灵元素的位置改变设定
       * @param {JQuery.MouseMoveEvent} e 
       */
      function onMouseMove(e) {
        if (e.clientY < listRect.top || e.clientY > listRect.bottom) {
          return;
        }
        if (!ghostItem) return;
        const x = e.pageX - listRect.left;
        const y = e.pageY - listRect.top;
        ghostItem.css({
            top: y - ghostItem.outerHeight() / 2,
            left: x - ghostItem.outerWidth() / 2
        });

        // 需要知道鼠标在哪个item上方
        // const mouseY = e.clientY;
        // /** @type {HTMLElement} */
        // let targetItem = null;
        // $list.children('.drag-item:not(.dragging):not(.placeholder)').each(function () {
        //     const rect = this.getBoundingClientRect();
        //     if (mouseY >= rect.top && mouseY <= rect.bottom) {
        //         /** @type {HTMLElement} */
        //         targetItem = this;
        //         return false; // break;
        //     }
        // })
        let targetItem = e.target;
        const $target = $(targetItem);
        if ($target.length == 0 || !($target.hasClass('drag-item'))) {
          return;
        }
        const mouseY = e.clientY;
        // 插入改在这个元素之前还是之后？根据是否过了该元素一半高度判断
        if (targetItem) {
            const rect = targetItem.getBoundingClientRect();
            const midLine = rect.top + rect.height / 2;
            /** @type {JQuery} */
            let $targetItem = $(targetItem);
            if (mouseY <= midLine) {
                placeholder.insertBefore($targetItem);
            } else {
                placeholder.insertAfter($targetItem);
            }
        }
      }
      /**
       * 当鼠标抬起停止移动
       * @param {JQuery.MouseUpEvent} e 
       */
      function onMouseUp(e) {
        if (ghostItem) {
            ghostItem.remove();
            ghostItem = null;
        }
        if (draggableItem) {
            $(draggableItem).removeClass('dragging');
            // 移动到placeholder的位置
            if (placeholder) {
              placeholder.replaceWith(draggableItem);
            }
            draggableItem = null;
            placeholder = null;
        }
        $(document).off('mousemove.drag', onMouseMove);
        $(document).off('mouseup.drag', onMouseUp);
      }
    });
  };
})(jQuery);

$(function() {
    $('#sortable-list').draggable();
})
