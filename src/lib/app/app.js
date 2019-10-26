/**
 * 单页面框架, 基于zepto/jquery, 使用hash实现
 * @Author   Jeff Zhong
 * @DateTime 2015-11-20
 * 增加 使用ajax获取html模版文件功能
 */
(function() {
    function App(options) {
        var opt = {
            container: document.body,
            pageFn: function(hash, temId, temUrl) {
                this.hash = hash;
                this.temId = temId || '';
                this.temUrl = temUrl || '';
                this.active = false;
                this.elem = $('<div class="view" data-hash="' + hash + '"></div>');
            },
            animate: {
                effects: ['slideInRight', 'slideOutLeft', 'slideInLeft', 'slideOutRight'],
                delay: 510
            },
            preLoad: function() {},
            aftLoad: function() {}
        };
        $.extend(opt, options);
        this.hashSplit = '/'
        //页面容器
        this.con = typeof opt.container == 'string' ? $('#' + opt.container) : opt.container;
        //视图构造函数
        this.pageFn = opt.pageFn;
        //页面切换动画
        this.animate = opt.animate;
        //加载切换页面前执行(公共调用)
        this.preLoad = opt.preLoad;
        //加载切换页面后执行(公共调用)
        this.aftLoad = opt.aftLoad;
        //是否第一次加载
        this.firstLoad = true;
        //是否正在加载视图
        this.isLoading = false;
        //当前hash
        this.currHash = '';
        //前个hash
        this.lastHash = '';
        //页面对象
        this.pages = {};
        //视图对象
        this.view = {};
        //其他情况下页面对象
        this.otherView = {};
        //url,hash参数
        this.request = {};
        //是否前进
        this.isForward = true;
    }
    App.prototype = {
        init: function() {
            var self = this;
            $(window).on('hashchange', function() {
                self.load();
            });
            self.load();
            return self;
        },
        //选择加载视图
        load: function() {
            var self = this,
                view = self.view,
                otherView = self.otherView,
                hash = '',
                args = [];

            self.setRequestParam();
            hash = self.request.hash;
            args = self.request.args;
            if (view[hash]) {
                self.setPage(hash, args);
            } else if (otherView.hash) { //调用默认视图
                self.setPage(otherView.hash, args);
            } else if (typeof otherView == 'function') {
                otherView.call(self);
            }
            return self;
        },
        //单个参数时可以字符串和数组: 'hash,arg1,arg2', [hash,arg1,arg2]
        //也可两个参数(hash,'arg1,arg2'),(hash,[arg1,arg2])
        //字符串参数分隔符可以:',',' '和自定义分隔符split
        setPage: function(hash, args) {
            var self = this,
                hashs = [],
                split = self.hashSplit;
            args = args || '';
            //还在切换页面
            if (this.isLoading) {
                return false;
            }
            (String(hash) + ',' + String(args)).replace(new RegExp('[^\\,\\s\\' + split + ']+', 'g'), function(item) {
                if (item) { hashs.push(item); }
            });
            hashs = split + hashs.join(split);
            if (location.hash.substr(1) == hashs) { //浏览器hash值与设置的参数相同则刷新页面
                this.updatePage(hash);
            } else { //浏览器hash值与设置的参数不同则使用location.hash触发
                location.hash = hashs;
            }

            return this;
        },
        //更新页面
        //create:只在第一次创建运行
        //init:每次切换都会运行
        updatePage: function(hash) {
            var self = this,
                prop,
                pages = self.pages,
                currView = self.view[hash],
                currPage = pages[hash], //要展示的页面
                activePage = pages[self.currHash], //当前正展示的页面
                args,
                pageInit = function() {
                    args = [self, currPage.elem].concat(self.request.args);
                    self.preLoad();
                    currView.create.apply(currView, args);
                    currView.init.apply(currView, args);
                    if (!activePage) { //当前页面为空，说明要展示的页面是第一个页面，则不做切换动画，直接展示
                        currPage.elem.show();
                        self.aftLoad();
                    } else { //当前页面存在，则两个页面进行动画切换
                        self.switchEffect(currPage, activePage, function() {
                            self.aftLoad();
                        });
                    }
                };

            //还在切换页面
            if (self.isLoading) {
                return false;
            }
            currPage && (args = [self, currPage.elem].concat(self.request.args));
            //要展示的页面不存在,则添加新页面 
            if (!currPage) {
                //如果已经有过页面，则项目不是第一次加载
                for (prop in pages) {
                    self.firstLoad = false;
                    break;
                }
                currPage = new self.pageFn(hash, currView.temId, currView.temUrl);
                pages[hash] = currPage; //加入页面对象中
                currPage.active = true; //标记为正在展示
                self.currHash = hash;
                self.bulidArgs();
                if (currPage.temId) {
                    currPage.elem.html($('#' + currPage.temId).html());
                    pageInit();
                } else if (currPage.temUrl) { //页面html不在当前页面，进行ajax获取
                    $.ajax({
                        url: currPage.temUrl,
                        type: "GET",
                        dataType: "html",
                        async: true,
                        success: function(html) {
                            currPage.elem.html(html);
                            pageInit();
                        }
                    });
                }
                self.con.prepend(currPage.elem); //填充html
            } else if (activePage.hash !== hash) { //如果已经存在，则进行切换页面
                self.firstLoad = false;
                self.currHash = hash;
                self.lastHash = activePage.hash;
                self.bulidArgs();
                self.preLoad();
                currView.init.apply(currView, args);
                self.switchEffect(currPage, activePage, function() {
                    self.aftLoad();
                });
                // self.pushHistory();
            } else { //如果参数值变化了，则进行刷新
                self.bulidArgs();
                if (currView.isParamChange) {
                    currView.init.apply(currView, args);
                }
            }
            return self;
        },
        //切换页面
        switchEffect: function(toShow, toHide, callback) {
            var self = this,
                inEffect = self.isForward ? self.animate.effects[0] : self.animate.effects[2],
                outEffect = self.isForward ? self.animate.effects[1] : self.animate.effects[3],
                delay = self.animate.delay;

            self.isLoading = true;
            toShow.active = true;
            toHide.active = false;

            // toHide.elem.addClass(outEffect);
            // toShow.elem.addClass('animate-start');
            // toShow.elem.show();
            // toShow.elem.addClass(inEffect);
            toHide.elem[0].className = 'view ' + outEffect;
            toShow.elem[0].className = 'view animate-start ' + inEffect;
            toShow.elem.show();

            return setTimeout(function() {
                // toHide.elem.removeClass(outEffect);
                // toShow.elem.removeClass('animate-start');
                // toShow.elem.removeClass(inEffect);
                toHide.elem[0].className = 'view';
                toHide.elem.hide();
                toShow.elem[0].className = 'view';
                self.isLoading = false;
                callback();
            }, delay);
        },
        //刷新当前页
        refresh: function() {
            var self = this,
                currView = self.view[self.currHash],
                currPage = self.pages[self.currHash];
            if (currPage) {
                currView.init.apply(currView, [self, currPage.elem].concat(self.request.args));
            }
            return self;
        },
        //从hash中分解出hash和参数名称
        getHashArg: function(url) {
            var hashs = url || location.hash.replace('#', ''),
                split = this.hashSplit,
                argMatch = null,
                reg = new RegExp("\\" + split + "([^\\" + split + "]*)", 'g'),
                args = [];

            if (hashs.indexOf(split) > -1) {
                while ((argMatch = reg.exec(hashs))) {
                    args.push(argMatch[1]);
                }
            }
            return {
                hash: args.shift() || '',
                args: args
            };
        },
        //设置请求参数
        setRequestParam: function() {
            $.extend(this.request, this.getHashArg());
            return this;
        },
        //设置hash参数
        bulidArgs: function() {
            var self = this,
                currView = self.view[self.currHash],
                args = currView.args || [],
                vals = self.request.args || [],
                len = args.length;

            currView.isParamChange = false;
            self.args = {};
            for (var i = 0; i < len; i++) {
                self.args[args[i]] = vals[i];
                //参数是否已经变了
                if (currView.param[args[i]] && currView.param[args[i]] != vals[i]) {
                    currView.isParamChange = true;
                }
                currView.param[args[i]] = vals[i];
            }
            return self;
        },
        //页面路由
        when: function(url, option) {
            var view = this.hashView(url, option);
            this.view[view.hash] = view;
            return this;
        },
        //默认页面路由
        other: function(url, option) {
            if (typeof url == 'function') {
                this.otherView = url;
                return this;
            }
            var view = this.hashView(url, option);
            this.otherView=this.view[view.hash] = view;
            return this;
        },
        //添加视图对象
        hashView: function(url, option) {
            return $.extend({
                temId: '',
                temUrl: '',
                param: {},
                isParamChange: false,
                create: function() {},
                init: function() {}
            }, option, this.getHashArg(url));
        }
    };

    window.WebApp = function(opt) {
        return new App(opt);
    }
}());
export default function(opt) {
    return window.WebApp(opt);
};
