/**
 * graphics util
 * author jeff zhong
 * date 2017/12/29
 * version 1.0
 */
; (function () {
    // PI约等于3.14
    // 180度 = PI弧度
    // 1弧度 =（PI/180）* 度
    // 1度 = （180/PI）* 弧度
    // 反正切:atan(y/x)=弧度; 正切:tan(y/x)*x=y边的长度 
    // 反正切:atan2(y,x)使用范围更广: PI ~ -PI,可以处理除数和被除数为0的情况，即90度和270的情况,推荐使用atan2
    window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
        return window.setTimeout(callback, 1000 / 60);
    },
        window.cancelAnimationFrame = window.cancelRequestAnimationFrame || window.webkitCancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.mozCancelRequestAnimationFrame || window.oCancelRequestAnimationFrame || window.msCancelRequestAnimationFrame || clearTimeout;

    /**
     * 获取 a~b 区间的随机数
     * @param {Number} a 
     * @param {Number} b
     */
    function random(a, b) {
        return Math.random() * (b - a) + a;
    }

    /**
     * 获取#aabbcc 格式的随机颜色
     */
    function randomColor() {
        var c = Math.floor(Math.random() * 16777216);
        return '#' + ('000' + c.toString(16)).slice(-6);
    }

    /**
     * 获取 [h,s,l] 随机颜色
     */
    function randomHsl() {
        var h = Math.floor(Math.random() * 360);
        var s = Math.floor(Math.random() * 50 + 50);
        var l = Math.floor(Math.random() * 20 + 40);
        return [h, s, l];
    }

    var Color = {
        /**
         * rgb转换为16进制颜色
         * @param {String} txt rgba(255,255,255,1)
         * return #ffffff
         */
        rgbToHex: function (txt) {
            var ret = '';
            if (/^rgba?|RGBA?/.test(txt)) {
                var arr = txt.match(/\d+/g),
                    hex = '';
                if (!arr || arr.length < 3) {
                    return ret;
                }
                for (var i = 0; i < 3; i++) {
                    hex = Math.min(parseInt(arr[i], 10), 255).toString(16);
                    ret += ('0' + hex).slice(-2);
                }
                ret = '#' + ret;
            }
            return ret;
        },
        /**
         * 16进制转换为rgb
         * @param {String} txt #ffffff
         * return rgb(255,255,255)
         */
        hexToRgb: function (txt) {
            var ret = [];
            var hex = txt.toLowerCase();
            if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/.test(hex)) {
                var step = hex.length == 4 ? 1 : 2;
                for (var i = 1; i < 3 * step + 1; i += step) {
                    ret.push(parseInt("0x" + new Array(4 - step).join(hex.slice(i, i + step))));
                }
            }
            return ret;
        },
        /**
         * rgb转换为hsl
         * @param {Array} rgb [255,255,255]
         * return [0,0,100]
         */
        rgbToHsl: function (rgb) {
            var H, S, L;
            var r = rgb[0] / 255,
                g = rgb[1] / 255,
                b = rgb[2] / 255;
            var max = Math.max(r, g, b);
            var min = Math.min(r, g, b);
            L = (max + min) / 2;
            var diff = max - min;
            S = diff == 0 ? 0 : diff / (1 - Math.abs(2 * L - 1));
            if (S == 0) {
                H = 0;
            } else if (r == max) {
                H = (g - b) / diff % 6;
            } else if (g == max) {
                H = (b - r) / diff + 2;
            } else {
                H = (r - g) / diff + 4;
            }
            H *= 60;
            if (H < 0) H += 360;
            return [Math.round(H), (S * 100).toFixed(1), (L * 100).toFixed(1)];
        },

        /**
         * hsl转换为rgb
         * @param {String} hsl [0,0,100]
         * return [255,255,255]
         */
        hslToRgb: function (hsl) {
            var H = parseFloat(hsl[0] / 360, 10),
                S = parseFloat(hsl[1] / 100, 10),
                L = parseFloat(hsl[2] / 100, 10);
            if (S == 0) {
                var r = g = b = Math.ceil(L * 255);
                return [r, g, b];
            } else {
                var t2 = L >= 0.5 ? L + S - L * S : L * (1 + S);
                var t1 = 2 * L - t2;

                var tempRGB = [1 / 3, 0, -1 / 3];
                for (var i = 0; i < 3; i++) {
                    var t = H + tempRGB[i];
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (6 * t < 1) {
                        t = t1 + (t2 - t1) * 6 * t;
                    } else if (2 * t < 1) {
                        t = t2;
                    } else if (3 * t < 2) {
                        t = t1 + (t2 - t1) * (2 / 3 - t) * 6;
                    } else {
                        t = t1;
                    }
                    tempRGB[i] = Math.ceil(t * 255);
                }
                return tempRGB;
            }
        },
        /**
         * 16进制转换为hsl
         * @param {String} txt #ffffff
         * return [h,s,l]
         */
        hexToHsl: function (txt) {
            return this.rgbToHsl(this.hexToRgb(txt))
        },
        /**
         * hsl转换为16进制
         * @param {String} hsla(h,s,l,a)
         * return #aabbcc
         */
        hslToHex: function (txt) {
            var ret = ''
            if (/^hsla?|HSLA?/.test(txt)) {
                var hsl = txt.match(/\d+/g);
                if (hsl && hsl.length >= 3) {
                    var rgb = 'rgb(' + this.hslToRgb(hsl).join(',') + ')'
                    return this.rgbToHex(rgb);
                }
            }
            return ret;
        },
        /**
         * rgb转换为webgl形式的rgb
         * @param {Array} rgb [255,255,255]
         * return [0.0,0.0,1.0]
         */
        rgbToWebgl: function (rgb) {
            return [
                rgb[0] / 255,
                rgb[1] / 255,
                rgb[2] / 255,
                rgb[3] || 1.0
            ];
        }
    };

    /**
     * 捕获canvas坐标
     * @param {Object}  canvas 
     * @param {Boolean} isWebGL 是否为webgl
     */
    function captureMouse(canvas, isWebGL) {
        if (!canvas) {
            console.log('canvas not exist');
            return { x: 0, y: 0 };
        }
        var mouse = { x: canvas.width / 2 + 50, y: canvas.height / 2 + 50 };
        canvas.addEventListener('mousemove', function (e) {
            var pos = isWebGL ? WindowToWebgl(canvas, e.clientX, e.clientY) : WindowToCanvas(canvas, e.clientX, e.clientY);
            mouse.x = pos.x;
            mouse.y = pos.y;
        }, false);
        return mouse;
    }

    /**
     * 获取canvas坐标系中的鼠标位置
     * @param {Object} canvas 
     * @param {Number} x 
     * @param {Number} y
     */
    function windowToCanvas(canvas, x, y) {
        if (!canvas) {
            console.log('canvas not exist');
            return { x: 0, y: 0 };
        }
        var box = canvas.getBoundingClientRect();
        return {
            x: x - box.left * (canvas.width / box.width),
            y: y - box.top * (canvas.height / box.height)
        };
    }

    /**
     * 获取webgl坐标系中的鼠标位置
     * @param {Object} canvas 
     * @param {Number} x 
     * @param {Number} y
     */
    function windowToWebgl(canvas, x, y) {
        if (!canvas) {
            console.log('canvas not exist');
            return { x: 0, y: 0 };
        }
        var box = canvas.getBoundingClientRect(),
            w = canvas.width,
            h = canvas.height,
            x1 = x - box.left * (w / box.width),
            y1 = y - box.top * (h / box.height);
        return {
            x: (x1 - w / 2) / (w / 2),
            y: (h / 2 - y1) / (h / 2)
        };
    }

    /**
     * 光线投射法检测是否碰撞
     * @param  {Object}  a 坐标1
     * @param  {Object}  b 坐标2
     * @param  {Object}  c 坐标3
     * @param  {Object}  d 坐标4
     * @return {Boolean}   
     */
    function isCollision(a, b, c, d) {
        var m1 = (a.y - b.y) / (a.x - b.x),
            m2 = (d.y - c.y) / (d.x - b.x),
            b1 = a.y - m1 * a.x,
            b2 = c.y - m2 * c.x,
            collisionPoint = {
                x: (b2 - b1) / (m1 - m2),
                y: m1 * (b2 - b1) / (m1 - m2) + b1
            };

        return collisionPoint.x > c.x && collisionPoint.x < d.x && b.y > c.y && b.x < d.x;
    }

    /**
     * 获取三次贝塞尔曲线坐标
     * @param  {Number} p0 [起始点]
     * @param  {Number} p1 [控制点1]
     * @param  {Number} p2 [控制点2]
     * @param  {Number} p3 [结束点]
     * @param  {Number} t  [取值范围：0～1]
     * @return {Number}    
     */
    function bezierPos(p0, p1, p2, p3, t) {
        return p0 * Math.pow(1 - t, 3) + 3 * p1 * t * Math.pow(1 - t, 2) + 3 * p2 * Math.pow(t, 2) * (1 - t) + p3 * Math.pow(t, 3);
    }
    /**
     * 获取二次贝塞尔曲线坐标
     * @param  {Number} p0 [起始点]
     * @param  {Number} p1 [控制点]
     * @param  {Number} p2 [结束点]
     * @param  {Number} t  [取值范围：0～1]
     * @return {Number}   
     */
    function quadraticPos(p0, p1, p2, t) {
        return p0 * Math.pow(1 - t, 2) + 2 * p1 * t * (1 - t) + p2 * t * t;
    }

    /**
     * 获取三次贝塞尔曲线切线弧度
     * @param  {Number} p0 [起始点]
     * @param  {Number} p1 [控制点1]
     * @param  {Number} p2 [控制点2]
     * @param  {Number} p3 [结束点]
     * @param  {Number} t  [取值范围：0～1]
     * @return {Number}    
     */
    function getBezierAngle(p0, p1, p2, p3, t) {
        var x = p0.x * 3 * Math.pow(1 - t, 2) * -1 +
            3 * p1.x * (Math.pow(1 - t, 2) + t * 2 * (1 - t) * -1) +
            3 * p2.x * (2 * t * (1 - t) + t * t * -1) + p3.x * 3 * t * t,

            y = p0.y * 3 * Math.pow(1 - t, 2) * -1 +
                3 * p1.y * (Math.pow(1 - t, 2) + t * 2 * (1 - t) * -1) +
                3 * p2.y * (2 * t * (1 - t) + t * t * -1) + p3.y * 3 * t * t;

        return Math.atan2(y, x);
    }

    /**
     * 获取三次贝塞尔曲线坐标
     * @param  {Number} p0 [起始点]
     * @param  {Number} p1 [控制点1]
     * @param  {Number} p2 [控制点2]
     * @param  {Number} p3 [结束点]
     * @param  {Number} t  [取值范围：0～1]
     * @return {Number}    
     */
    function getBezierPosition(p0, p1, p2, p3, t) {
        return {
            x: bezierPos(p0.x, p1.x, p2.x, p3.x, t),
            y: bezierPos(p0.y, p1.y, p2.y, p3.y, t)
        };
    }
    /**
     * 获取贝塞尔二次曲线切线弧度
     * @param  {Number} p0 [起始点]
     * @param  {Number} p1 [控制点]
     * @param  {Number} p2 [结束点]
     * @param  {Number} t  [取值范围：0～1]
     * @return {Number}   
     */
    function getQuadraticAngle(p0, p1, p2, t) {
        var x = p0.x * 2 * (1 - t) * -1 + 2 * p1.x * ((1 - t) + (-1) * t) + p2.x * 2 * t,
            y = p0.y * 2 * (1 - t) * -1 + 2 * p1.y * ((1 - t) + (-1) * t) + p2.y * 2 * t;
        return Math.atan2(y, x);
    }

    /**
     * 获取二次贝塞尔曲线坐标
     * @param  {Number} p0 [起始点]
     * @param  {Number} p1 [控制点]
     * @param  {Number} p2 [结束点]
     * @param  {Number} t  [取值范围：0～1]
     * @return {Number}   
     */
    function getQuadraticPosition(p0, p1, p2, t) {
        return {
            x: quadraticPos(p0.x, p1.x, p2.x, t),
            y: quadraticPos(p0.y, p1.y, p2.y, t)
        };
    }

    /**
     * 3d旋转公式，根据当前的坐标，返回旋转一定角度后的新坐标
     * @param  {Object} pos   {x,y,z}
     * @param  {Number} angel 弧度
     * 绕某个中心点做旋转  
     	var x1 = ball.x - centerX; //相对中心点的位置
        var y1 = ball.y - centerY;
    	
    	var pos=rotateZ({x:x1,y:y1},rad);

    	ball.x = centerX + pos.x; //更新球的位置
    	ball.y = centerY + pos.y;
     */
    // 绕x轴旋转
    function rotateX(pos, angleX) {
        var cos = Math.cos(angleX),
            sin = Math.sin(angleX),
            y = pos.y * cos - pos.z * sin,
            z = pos.z * cos + pos.y * sin;

        return { y: y, z: z };
    }
    // 绕y轴旋转
    function rotateY(pos, angleY) {
        var cos = Math.cos(angleY),
            sin = Math.sin(angleY),
            x = pos.x * cos - pos.z * sin,
            z = pos.z * cos + pos.x * sin;

        return { x: x, z: z };
    }
    // 绕z轴旋转,等于2维绕中心点做旋转
    function rotateZ(pos, angleZ) {
        var cos = Math.cos(angleZ),
            sin = Math.sin(angleZ),
            x = pos.x * cos - pos.y * sin,
            y = pos.y * cos + pos.x * sin;

        return { x: x, y: y };
    }
    
    var output = {
        random: random,
        randomColor: randomColor,
        randomHsl: randomHsl,
        captureMouse: captureMouse,
        windowToCanvas: windowToCanvas,
        windowToWebgl: windowToWebgl,
        getBezierAngle: getBezierAngle,
        getBezierPosition: getBezierPosition,
        getQuadraticAngle: getQuadraticAngle,
        getQuadraticPosition: getQuadraticPosition,
        rotateX: rotateX,
        rotateY: rotateY,
        rotateZ: rotateZ,
        Color: Color
    };
    
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = output
    } else {
        for (var n in output) {
            window[n] = output[n]
        }
    }
}());
