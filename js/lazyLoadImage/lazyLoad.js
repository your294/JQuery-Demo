/**
 * @typedef {{
 *   root?: HTMLElement,
 *   rootMargin?: string,
 *   threshold?: number,
 *   [key: string]: string | number | HTMLElement | undefined
 * }} LazyLoadOptions
 */

class LazyLoadImager {
  /** @type {LazyLoadOptions} */
  options = {
    root: $("body")[0],
    rootMargin: "0px 0px 0px 0px",
    threshold: 0,
  };

  /**
   * @param {LazyLoadOptions} userOptions
   * @param {IntersectionObserverCallback} callback
   */
  constructor(userOptions, callback) {
    this.options = Object.assign(this.options, userOptions);
    this.observer = new IntersectionObserver(callback, this.options);
  }

  firstLoad() {
    lazyLoadCallback([], this.observer);
  }

  /**
   * @param {Element} target
   */
  observe(target) {
    this.observer.observe(target);
  }

  /**
   * 取消对于某个DOM的观察
   * @param {Element} target
   */
  unobserve(target) {
    this.observer.unobserve(target);
  }

  /**
   * 终止对所有target DOM的观察释放资源
   */
  disconnect() {
    this.observer.disconnect();
  }
}

// 加载状态锁
let isLoading = false;
/**
 *
 * @param {IntersectionObserverEntry[]} entries
 * @param {IntersectionObserver} observer
 */
async function lazyLoadCallback(entries, observer) {
  // 如果是由 IntersectionObserver 触发，检查是否真的 intersecting
  if (entries.length > 0) {
    const entry = entries[0];
    if (!entry.isIntersecting) return;
  }

  if (isLoading) return;
  isLoading = true;
  const $sentinel = $("#lazy-sentinel");
  /** @type {PromiseQueue} */
  const promiseQueue = new PromiseQueue(2);
  try {
    // 获取图片链接
    const imgUrls = await fetchMockImgUrls();
    imgUrls.forEach((url) => {
      promiseQueue.push(() => loadImage(url));
    });
  } catch (e) {
    observer.disconnect();
    alert(e);
    return;
  }
  // 加入占位符元素
  const uuids = [];
  const itemHTMLArr = new Array(4).fill().map(() => {
    const obj = createItemHtmlWithUUID();
    uuids.push(obj.uuid);
    return obj.dom;
  });
  const $insertDOM = $(itemHTMLArr.join(''));
  $insertDOM.insertBefore($sentinel);
  // 等待Promise队列图片请求
  let countIdx = 0;
  while (!promiseQueue.empty()) {
    const execResults = await promiseQueue.exec();
    execResults.forEach((obj, _) => {
      const uuid = uuids[countIdx];
      if (obj.ok) {
        const imgEl = obj.res;
        const $imgEl = $(imgEl);
        $imgEl.addClass("my-img");
        $("#pic-container").find(`#my-img-${uuid}`).replaceWith($imgEl);
        countIdx++;
      } else {
        const reason = obj.err;
        console.error("uuid: ", uuid, " load error for: ", reason);
      }
    });
  }
  isLoading = false;
}

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
/**
 * @typedef {{
 * dom?: string,
 * uuid?: string
 * }} ItemWithUUID
 */

/**
 *
 * @returns {ItemWithUUID}
 */
function createItemHtmlWithUUID() {
  const uuid = uuidv4();
  const itemHTML = `<img id='my-img-${uuid}' class='my-img' src='../../assets/image.png'>`;
  return {
    dom: itemHTML,
    uuid,
  };
}

const MAX_IMAGE_LOAD = 20;
let cur_load_image = 0;

/**
 * @returns {Promise<Array<string>>}
 */
function fetchMockImgUrls() {
  const baseUrl = "../../assets";
  const imgUrls = ["/1.jpg", "/2.jpg", "/3.jpg", "/4.jpg"];
  return new Promise((resolve, reject) => {
    if (cur_load_image >= MAX_IMAGE_LOAD) {
      reject("has load all pic");
    }
    cur_load_image += 4;
    resolve(imgUrls.map((v) => baseUrl + v));
  });
}
