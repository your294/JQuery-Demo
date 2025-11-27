$(function (){
    const lazyLoadImager = new LazyLoadImager({
        root: $('#pic-container')[0],
        rootMargin: '100px',
        threshold: 0.5
    }, lazyLoadCallback);
    lazyLoadImager.observe($('#lazy-sentinel')[0])
    lazyLoadImager.firstLoad();
})