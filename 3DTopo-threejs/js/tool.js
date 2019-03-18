
/*
使用方法
js.lang.String.call(String.prototype);

// 那么

var str = "&'\"中国abc def";

var ec_str = str.encodeHtml();

document.write(ec_str);

document.write(""); // CU的博客在线编辑有bug,
放不上来！！！

var dc_str = ec_str.decodeHtml();

document.write(dc_str);*/
js = {lang:{}}; // 没有包管理时，也可简单写成 js = {lang:{}};


js.lang.String = function(){

    this.REGX_HTML_ENCODE = /"|&|'|<|>|[\x00-\x20]|[\x7F-\xFF]|[\u0100-\u2700]/g;

    this.REGX_HTML_DECODE = /&\w+;|&#(\d+);/g;

    this.REGX_TRIM = /(^\s*)|(\s*$)/g;

    this.HTML_DECODE = {
        "&lt;" : "<",
        "&gt;" : ">",
        "&amp;" : "&",
        "&nbsp;": " ",
        "&quot;": "\"",
        "©": ""

        // Add more
    };

    this.encodeHtml = function(s){
        s = (s != undefined) ? s : this.toString();
        return (typeof s != "string") ? s :
            s.replace(this.REGX_HTML_ENCODE,
                function($0){
                    var c = $0.charCodeAt(0), r = ["&#"];
                    c = (c == 0x20) ? 0xA0 : c;
                    r.push(c); r.push(";");
                    return r.join("");
                });
    };

    this.decodeHtml = function(s){
        var HTML_DECODE = this.HTML_DECODE;

        s = (s != undefined) ? s : this.toString();
        return (typeof s != "string") ? s :
            s.replace(this.REGX_HTML_DECODE,
                function($0, $1){
                    var c = HTML_DECODE[$0];
                    if(c == undefined){
                        // Maybe is Entity Number
                        if(!isNaN($1)){
                            c = String.fromCharCode(($1 == 160) ? 32:$1);
                        }else{
                            c = $0;
                        }
                    }
                    return c;
                });
    };

    this.trim = function(s){
        s = (s != undefined) ? s : this.toString();
        return (typeof s != "string") ? s :
            s.replace(this.REGX_TRIM, "");
    };


    this.hashCode = function(){
        var hash = this.__hash__, _char;
        if(hash == undefined || hash == 0){
            hash = 0;
            for (var i = 0, len=this.length; i < len; i++) {
                _char = this.charCodeAt(i);
                hash = 31*hash + _char;
                hash = hash & hash; // Convert to 32bit integer
            }
            hash = hash & 0x7fffffff;
        }
        this.__hash__ = hash;

        return this.__hash__;
    };

};

js.lang.String.call(js.lang.String);

/*
 * Map对象，实现Map功能
 *
 *
 1.// 自定义Map对象
 2.var map = new Map();
 3.map.put("a","a");
 4.alert(map.get("a"));
 5.map.put("a","b");
 6.alert(map.get("a"));

 *
 *
 * size()      获取Map元素个数
 * isEmpty()   判断Map是否为空
 * clear()     删除Map所有元素
 * put(key, value)   向Map中增加元素（key, value)
 * remove(key)       删除指定key的元素，成功返回true，失败返回false
 * get(key)          获取指定key的元素值value，失败返回null
 * element(index)    获取指定索引的元素（使用element.key，element.value获取key和value），失败返回null
 * containsKey(key)  判断Map中是否含有指定key的元素
 * containsValue(value)  判断Map中是否含有指定value的元素
 * keys()      获取Map中所有key的数组（array）
 * values()    获取Map中所有value的数组（array）
 *
 */
function Map(){
    this.elements = new Array();

    //获取Map元素个数
    this.size = function() {
        return this.elements.length;
    },

        //判断Map是否为空
        this.isEmpty = function() {
            return (this.elements.length < 1);
        },

        //删除Map所有元素
        this.clear = function() {
            this.elements = new Array();
        },

        //向Map中增加元素（key, value)
        this.put = function(_key, _value) {
            if (this.containsKey(_key) == true) {
                if(this.containsValue(_value)){
                    if(this.remove(_key) == true){
                        this.elements.push( {
                            key : _key,
                            value : _value
                        });
                    }
                }else{
                    this.elements.push( {
                        key : _key,
                        value : _value
                    });
                }
            } else {
                this.elements.push( {
                    key : _key,
                    value : _value
                });
            }
        },

//删除指定key的元素，成功返回true，失败返回false
        this.remove = function(_key) {
            var bln = false;
            try  {
                for (i = 0; i < this.elements.length; i++) {
                    if (this.elements[i].key == _key){
                        this.elements.splice(i, 1);
                        return true;
                    }
                }
            }catch(e){
                bln = false;
            }
            return bln;
        },

//获取指定key的元素值value，失败返回null
        this.get = function(_key) {
            try{
                for (i = 0; i < this.elements.length; i++) {
                    if (this.elements[i].key == _key) {
                        return this.elements[i].value;
                    }
                }
            }catch(e) {
                return null;
            }
        },

//获取指定索引的元素（使用element.key，element.value获取key和value），失败返回null
        this.element = function(_index) {
            if (_index < 0 || _index >= this.elements.length){
                return null;
            }
            return this.elements[_index];
        },

//判断Map中是否含有指定key的元素
        this.containsKey = function(_key) {
            var bln = false;
            try {
                for (i = 0; i < this.elements.length; i++) {
                    if (this.elements[i].key == _key){
                        bln = true;
                    }
                }
            }catch(e) {
                bln = false;
            }
            return bln;
        },

//判断Map中是否含有指定value的元素
        this.containsValue = function(_value) {
            var bln = false;
            try {
                for (i = 0; i < this.elements.length; i++) {
                    if (this.elements[i].value == _value){
                        bln = true;
                    }
                }
            }catch(e) {
                bln = false;
            }
            return bln;
        },

        //获取Map中所有key的数组（array）
        this.keys = function() {
            var arr = new Array();
            for (i = 0; i < this.elements.length; i++) {
                arr.push(this.elements[i].key);
            }
            return arr;
        },

//获取Map中所有value的数组（array）
        this.values = function() {
            var arr = new Array();
            for (i = 0; i < this.elements.length; i++) {
                arr.push(this.elements[i].value);
            }
            return arr;
        };
}
/**
 * 获取keyFrames
 * @param index
 * @returns {Array}
 */
var KeyFramesUtil={
    getKeyFramesList: function(index){
        var styleSheet = document.styleSheets[index], keyframesRule = [];
        [].slice.call(styleSheet.cssRules).forEach(function(item){
            if (item.type === CSSRule.WEBKIT_KEYFRAMES_RULE) {
                keyframesRule.push( item );
            }
        })
        return keyframesRule;
    },
    getKeyFrame:function(index,frameName){
        var keyFrames=undefined;
        var styleSheet = document.styleSheets[index];
        if(styleSheet==undefined)return undefined;
        [].slice.call(styleSheet.cssRules).forEach(function(item){
           if(item.name==frameName){
               keyFrames = item;
               return;
           }
        })
        return keyFrames;
    }

}






