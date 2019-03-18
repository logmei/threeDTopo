/**
 * Created by logmei on 2017/3/22.
 */
var toolPosition={
    /**
     * div位于屏幕中间位置
     * @param divDom：div对象
     * @returns {Object} top left
     */
    divOfScreenCenter:function(divDom){
        var obj=new Object();
        var top = ($(window).height() - divDom.height())/2;
        var left = ($(window).width() - divDom.width())/2;
        var scrollTop = $(document).scrollTop();
        var scrollLeft = $(document).scrollLeft();
        obj.top=top+scrollTop;
        obj.left=left+scrollLeft;
        return obj;
    }
}
