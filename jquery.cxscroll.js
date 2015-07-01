/**
 * 
    直接调用
    $("#element_id").cxScroll();
    自定义参数调用
    $("#element_id").cxScroll({
        direction:"right",
        step:1,
        accel:160,
        speed:800,
        time:4000,
        auto:true,
        prevBtn:true,
        nextBtn:true
    });
 * 
*/

(function($, window, document){
    var pluginName = 'cxScrolljs' 
    //参数
    var defaults ={
        direction:"right",  // 滚动方向
        easing:"swing",     // 缓动方式
        step:1,             // 滚动步长
        accel:160,          // 手动滚动速度
        speed:800,          // 自动滚动速度
        time:4000,          // 自动滚动间隔时间
        auto:true,          // 是否自动滚动
        prevBtn:true,       // 是否使用 prev 按钮
        nextBtn:true       // 是否使用 next 按钮
    }


    function cxScroll(element, options){
        this.options=$.extend(true,{},defaults,options);
        this.lock = false;
        //定时器
        this.run = null;
        this.element = element;
        this._name = pluginName;
        this.init();
    }

    cxScroll.prototype.init = function(){
        var $element = $(this.element);

        this.box=$element.find(".box");
        this.list=this.box.find(".list");
        this.items=this.list.find("li");
        this.itemSum=this.items.length;

        // 没有元素或只有1个元素时，不进行滚动
        if(this.itemSum<=1){return};

        this.prevBtn=$element.find(".prev");
        this.nextBtn=$element.find(".next");

        this.itemWidth=this.items.outerWidth();
        this.itemHeight=this.items.outerHeight();

        if(this.options.direction=="left" || this.options.direction=="right"){
            // 容器宽度不足时，不进行滚动
            if(this.itemWidth*this.itemSum<=this.box.outerWidth()){return};

            this.prevVal="left";
            this.nextVal="right";
            this.moveVal=this.itemWidth;
        }else{
            // 容器高度不足时，不进行滚动
            if(this.itemHeight*this.itemSum<=this.box.outerHeight()){return};

            this.prevVal="top";
            this.nextVal="bottom";
            this.moveVal=this.itemHeight;
        };

        // 元素：后补
        this.list.append(this.list.html());

        // 添加元素：手动操作按钮
        if(this.options.prevBtn && this.prevBtn.length == 0){
            this.prevBtn=$("<a></a>",{"class":"prev"}).prependTo($element);
        };

        if(this.options.nextBtn && this.nextBtn.length == 0){
            this.nextBtn=$("<a></a>",{"class":"next"}).prependTo($element);
        };

        // 事件：鼠标移入停止，移出开始
        if(this.options.auto){
            $element.hover(function(){
                this.options.auto=false;
                this.lock=false;
                this._off();
            },function(){
                this.options.auto=true;
                this.lock=false;
                this._on();
            });
        };

        this._bindEvent();
        this._on();
    }


    cxScroll.prototype._bindEvent = function(){
        var _this = this;
        if(this.options.nextBtn && this.nextBtn.length){
            this.nextBtn.bind("click",function(){
                if(!_this.lock){
                    _this.goto(_this.nextVal,_this.options.accel);
                };
            });
        };
        if(this.options.prevBtn && this.prevBtn.length){
            this.prevBtn.bind("click",function(){
                if(!_this.lock){
                    _this.goto(_this.prevVal,_this.options.accel);
                };
            });
        };
    }

    //方法：开始
    cxScroll.prototype._on = function(){
        var _this = this;
        if(!this.options.auto){return};

        this.run && clearTimeout(this.run);

        this.run=setTimeout(function(){
            _this.goto(_this.options.direction);
        },this.options.time);
    }
        
    // 方法：停止
    cxScroll.prototype._off = function(){
        this.box.stop(true);
        this.run && clearTimeout(this.run);
    }

    /**
     * 方法：滚动
     * @param  {string} d [方向]
     * @param  {number} t [时间]
     */
    cxScroll.prototype.goto = function(d,t){
        this._off();
        
        this.lock=true;

        var _max;   // _max 滚动的最大限度
        var _dis;   // _dis 滚动的距离
        var _speed = t || this.options.speed;
        var _this = this;
        switch(d){
            case "left":
            case "top":
                _max=0;
                if(d == "left"){
                    //归位
                    if(parseInt(this.box.scrollLeft(),10) == 0){
                        this.box.scrollLeft(this.itemSum*this.moveVal);
                    };

                    //运动的距离
                    _dis=this.box.scrollLeft()-(this.moveVal * this.options.step);

                    /*if( _dis % this.itemWidth > 0){
                        _dis -= _dis%this.itemWidth;
                    };*/

                    if(_dis < 0){ 
                        this.box.scrollLeft(this.itemSum*this.moveVal - _dis);
                        _dis=this.box.scrollLeft()-(this.moveVal * this.options.step);
                    };
                    this.box.animate({"scrollLeft":_dis},_speed,this.options.easing);
                }else{
                    //归位
                    if(parseInt(this.box.scrollTop(),10)==0){
                        this.box.scrollTop(this.itemSum*this.moveVal);
                    };
                    //运动的距离
                    _dis=this.box.scrollTop()-(this.moveVal*this.options.step);

                    /*if(_dis%this.itemHeight>0){
                        _dis-=_dis%this.itemHeight;
                    };*/

                    if(_dis < 0){ 
                        this.box.scrollTop(this.itemSum*this.moveVal - _dis);
                        _dis=this.box.scrollTop()-(this.moveVal * this.options.step);
                    };

                    this.box.animate({"scrollTop":_dis},_speed,this.options.easing);
                };
                break;

            case "right":
            case "bottom":
                _max=this.itemSum*this.moveVal;

                if(d=="right"){
                    _dis=this.box.scrollLeft()+(this.moveVal*this.options.step);

                    /*if(_dis%this.itemWidth>0){
                        _dis-=(_dis%this.itemWidth);
                    };*/

                    //if(_dis>_max){_dis=_max};

                    this.box.animate({"scrollLeft":_dis},_speed,this.options.easing,function(){
                        if(parseInt(_this.box.scrollLeft(),10)>=_max){
                            _this.box.scrollLeft(_dis-_max);
                        };
                    });
                }else{
                    _dis=this.box.scrollTop()+(this.moveVal*this.options.step);

                    /*if(_dis%this.itemHeight>0){
                        _dis-=(_dis%this.itemHeight);
                    };*/
                    
                    //if(_dis>_max){_dis=_max};
                    this.box.animate({"scrollTop":_dis},_speed,this.options.easing,function(){
                        if(parseInt(_this.box.scrollTop(),10)>=_max){
                            _this.box.scrollTop(_dis-_max);
                        };
                    });
                };
                break;
            
            // not default
        };
        this.box.queue(function(){
            _this.lock=false;
            _this._on();
            $(this).dequeue();
        });
    }

    
    return $.fn[pluginName] = function(options) {
        return this.each(function() {
            if (!$.data(this, "plugin_" + pluginName)) {
                return $.data(this, "plugin_" + pluginName, new cxScroll(this, options));
            }
        });
    };


})(jQuery, window, document);