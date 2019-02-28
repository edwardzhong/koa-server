/**
 * canvas library
 * author jeff zhong
 * date 2017/12/29
 * version 1.0
 */
; (function () {
    /**
     * canvas画网格线
     * @param  {Object} ctx canvas 绘图对象
     * @param  {String} color 
     * @param  {Number} stepx x轴间隔大小
     * @param  {Number} stepy y轴间隔大小
     */
    function grid(ctx, color, stepx, stepy) {
        if (!ctx) {
            console.log('canvas context is not exist');
            return;
        }
        ctx.save();
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = color;

        for (var i = stepx + 0.5; i < ctx.canvas.width; i += stepx) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, ctx.canvas.height);
            ctx.stroke();
        }

        for (var i = stepy + 0.5; i < ctx.canvas.height; i += stepy) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(ctx.canvas.width, i);
            ctx.stroke();
        }
        ctx.restore();
    }
    /**
     * 使用三次贝塞尔曲线模拟椭圆，此方法也会产生当lineWidth较宽，椭圆较扁时，长轴端较尖锐，不平滑的现象
     * @param {Object} ctx canvas 绘图对象
     * @param {Number} x   中心横坐标
     * @param {Number} y   中心纵坐标
     * @param {Number} a   椭圆横半轴长
     * @param {Number} b   椭圆纵半轴长
     */
    function ellipse(ctx, x, y, a, b) {
        if (!ctx) {
            console.log('canvas context is not exist');
            return;
        }
        var k = .5522848,
            ox = a * k, // 水平控制点偏移量
            oy = b * k; // 垂直控制点偏移量
        ctx.beginPath();
        //从椭圆的左端点开始顺时针绘制四条三次贝塞尔曲线
        ctx.moveTo(x - a, y);
        ctx.bezierCurveTo(x - a, y - oy, x - ox, y - b, x, y - b);
        ctx.bezierCurveTo(x + ox, y - b, x + a, y - oy, x + a, y);
        ctx.bezierCurveTo(x + a, y + oy, x + ox, y + b, x, y + b);
        ctx.bezierCurveTo(x - ox, y + b, x - a, y + oy, x - a, y);
        ctx.closePath();
        ctx.stroke();
    }

    /**
     * arcTo 创建圆角矩形
     */
    function roundRect(ctx, x, y, width, height, radius) {
        if (!ctx) {
            console.log('canvas context is not exist');
            return;
        }
        ctx.beginPath();
        if (width > 0) {
            ctx.moveTo(x + radius, y);
        } else {
            ctx.moveTo(x - radius, y);
        }

        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);

        if (width > 0) {
            ctx.arcTo(x, y, x + radius, y, radius);
        } else {
            ctx.arcTo(x, y, x - radius, y, radius);
        }
    }

    /**
     * 2D圆球
     * @param {Number} radius 
     * @param {String} color 
     */
    function Ball(radius, color) {
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.radius = radius || 20;
        this.rotation = 0;
        this.mass = 1;
        this.scaleX = 1;
        this.scaleY = 1;
        this.name = "";
        this.color = color || '#ff0000';
        this.lineWidth = 1;
    }

    Ball.prototype.draw = function (context) {
        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.rotation);
        context.scale(this.scaleX, this.scaleY);
        context.lineWidth = this.lineWidth;
        context.fillStyle = this.color;
        context.strokeStyle = this.color;
        context.beginPath();
        context.arc(0, 0, this.radius, 0, Math.PI * 2, false);
        context.closePath();
        context.fill();
        context.stroke();
        context.restore();
    };

    //得到球体的左上角坐标
    Ball.prototype.getBounds = function () {
        return {
            x: this.x - this.radius,
            y: this.y - this.radius,
            width: this.radius * 2,
            height: this.radius * 2
        };
    };

    /**
     * 3D圆球
     * @param {Number} radius 
     * @param {String} color 
     */
    function Ball3d(radius, color) {
        this.x = 0;
        this.y = 0;
        this.xpos = 0; //三维坐标
        this.ypos = 0;
        this.zpos = 0;
        this.vz = 0; //三维中的速度
        this.vx = 0;
        this.vy = 0;
        this.radius = radius || 20;
        this.rotation = 0;
        this.mass = 1;
        this.scaleX = 1;
        this.scaleY = 1;
        this.name = "";
        this.color = color || '#0000ff';
        this.lineWidth = 1;
        this.visible = true;
    }

    Ball3d.prototype.draw = function (context) {
        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.rotation);
        context.scale(this.scaleX, this.scaleY);
        context.lineWidth = this.lineWidth;
        context.fillStyle = this.color;
        context.strokeStyle = this.color;
        context.beginPath();
        context.arc(0, 0, this.radius, 0, Math.PI * 2, false);
        context.closePath();
        context.fill();
        context.stroke();
        context.restore();
    };

    /**
     * 2D canvas 绘制3D效果的点, 用于连线用,并不绘制出来
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} z 
     */
    function Point3d(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }

    Point3d.prototype = {
        rotateX: function (angleX) {
            var cosX = Math.cos(angleX),
                sinX = Math.sin(angleX),
                y1 = this.y * cosX - this.z * sinX,
                z1 = this.z * cosX + this.y * sinX;

            this.y = y1;
            this.z = z1;
        },

        rotateY: function (angleY) {
            var cosY = Math.cos(angleY),
                sinY = Math.sin(angleY),
                x1 = this.x * cosY - this.z * sinY,
                z1 = this.z * cosY + this.x * sinY;

            this.x = x1;
            this.z = z1;
        },

        rotateZ: function (angleZ) {
            var cosZ = Math.cos(angleZ),
                sinZ = Math.sin(angleZ),
                x1 = this.x * cosZ - this.y * sinZ,
                y1 = this.y * cosZ + this.x * sinZ;

            this.x = x1;
            this.y = y1;
        }
    };
    var output = {
        grid: grid,
        ellipse: ellipse,
        roundRect: roundRect,
        Ball: Ball,
        Ball3d: Ball3d,
        Point3d: Point3d
    };

    if (typeof module !== 'undefined' && module.exports) {//CommonJS
        module.exports = output;
    } else {
        for (var n in output) {
            window[n] = output[n];
        }
    }
}());
