	// var va = vec4(0.0, 0.0, -1.0,1);
	// var vb = vec4(0.0, 0.942809, 0.333333, 1);
	// var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
	// var vd = vec4(0.816497, -0.471405, 0.333333,1);	

	function Polygon(position,normal,color,indices){
		this.position=position;
		this.normal=normal;
		this.color=color;
		this.indices=indices;
	}
	/**
	 * 平面(2*0*2)
	 */
	function Plane(color){
		//  v0------v1
	    //  |        | 
	    //  |        |
	    //  |        |
	    //  v3------v2
		color=color||[1,1,1,1];
		var positions = [-1,0,-1,  1,0,-1,  1,0,1,  -1,0,1],
	        normals = [0,1,0, 0,1,0, 0,1,0, 0,1,0],
	        colors = [],
	        indices = new Uint8Array([0,2,3,0,1,2]);
	    for(var i=0;i<4;i++){
	    	colors=colors.concat(color);
	    }

	    return new Polygon(positions,normals,colors,indices);
	}

	/**
	 * 立方体(1*1*1)
	 */
	function Cube(color){
	    //    v4----- v7
	    //   /|      /|
	    //  v0------v1|
	    //  | |     | |
	    //  | |v5---|-|v6
	    //  |/      |/
	    //  v3------v2
	    //
	    color=color||[1,1,1,1];
	    var colors=[];
	    for(var i=0;i<24;i++){
	    	colors.push(...color);
	    }

	    // 顶点
	    var positions = [
	         -1, 1, 1,   1, 1, 1,   1, -1, 1,  -1, -1, 1, // v0-v1-v2-v3 front
	         1, 1, 1,    1, 1, -1,  1, -1,-1,  1, -1, 1, // v1-v7-v6-v2 right
	         -1,1, -1,   1, 1, -1,  1, 1, 1,   -1, 1, 1, // v4-v7-v1-v0 up
	         -1, 1, 1,   -1,1, -1,  -1,-1,-1,  -1, -1, 1, // v0-v4-v5-v3 left
             -1,-1,-1,  -1, -1, 1,  1, -1, 1,  1, -1,-1, // v5-v3-v2-v6 down
	         -1,1, -1,  -1,-1,-1,   1, -1,-1,  1, 1, -1  // v4-v5-v6-v7 back
	    ];

	    // 法向量
	    var normals = [
	        0, 0, 1,   0, 0, 1,   0, 0, 1,  0, 0, 1,     // v0-v1-v2-v3 front
	        1, 0, 0,   1, 0, 0,   1, 0, 0,  1, 0, 0,     // v1-v7-v6-v2 right
	        0, 1, 0,   0, 1, 0,   0, 1, 0,  0, 1, 0,     // v4-v7-v1-v0 up
	        -1, 0, 0,  -1, 0, 0,  -1, 0, 0, -1, 0, 0,     // v0-v4-v5-v3 left
	        0, -1, 0,  0, -1, 0,  0, -1, 0, 0, -1, 0,　   // v5-v3-v2-v6 down
	        0, 0, -1,  0, 0, -1,  0, 0, -1, 0, 0, -1      // v4-v5-v6-v7 back
	    ];

	    // 顶点索引
	    var indices = new Uint8Array([
	         0, 1, 2,   0, 2, 3,    // front
	         4, 5, 6,   4, 6, 7,    // right
	         8, 9,10,   8,10,11,    // up
	        12,13,14,  12,14,15,    // left
	        16,17,18,  16,18,19,    // down
	        20,21,22,  20,22,23     // back
	    ]);

	    return new Polygon(positions,normals,colors,indices);
	}

	/**
	 * 圆球(1*1*1)
	 */
	function Sphere(len, color) {
	    len = len || 15;
	    color=color||[1,1,1,1];

	    var i, ai, si, ci;
	    var j, aj, sj, cj;
	    var p1, p2;
	    var pos = [],nor=[];

	    var positions = [],
	        normals = [],
	        colors = [],
	        indices = [];

	    // 创建顶点坐标
	    for (j = 0; j <= len; j++) {
	        aj = j * Math.PI / len;
	        sj = Math.sin(aj);
	        cj = Math.cos(aj);
	        for (i = 0; i <= len; i++) {
	            ai = i * 2 * Math.PI / len;
	            si = Math.sin(ai);
	            ci = Math.cos(ai);

	            pos = [si * sj, cj, ci * sj];// x y z
	            positions.push(...pos);

	            nor=normalize(pos);// 归一化后的顶点坐标就是法向量
	            normals.push(...nor);

	            colors.push(...color);// 颜色
	        }
	    }
	    // 创建顶点索引
	    for (j = 0; j < len; j++) {
	        for (i = 0; i < len; i++) {
	            p1 = j * (len + 1) + i;
	            p2 = p1 + (len + 1);

	            indices.push(p1);
	            indices.push(p2);
	            indices.push(p1 + 1);

	            indices.push(p1 + 1);
	            indices.push(p2);
	            indices.push(p2 + 1);
	        }
	    }

	    return new Polygon(positions,normals,colors,indices);
	}

	/**
	 * 圆柱体
	 */
	function Cylinder(r,h,l,color){
		// 8

		// 1 5
		// 0 4

		// 2 6
		// 3 7

		// 9
		var angle=Math.PI*2/l,
			x=0, z=0,
			color=color||[1,1,1,1],
			colors=[],
			positions=[],
			normals=[],
			indices=[];

		for(var i=0;i<l;i++){
			x=r*Math.cos(angle*i);
			z=r*Math.sin(angle*i);
			
			pushVertex([x,h/2,z],normalize([x,h/2,z]));
			pushVertex([x,h/2,z],[0,1,0]);
			pushVertex([x,-h/2,z],normalize([x,-h/2,z]));
			pushVertex([x,-h/2,z],[0,-1,0]);

			if(i%2){
				pushVertex([0,h/2,0],[0,1,0]);
				pushVertex([0,-h/2,0],[0,-1,0]);
			}
		}

		for(var i=0,len=positions.length/3;i<len;i+=10){
			indices.push(i+8,i+1,i+5);
			indices.push(i+9,i+3,i+7);
			indices.push(i,i+2,i+6);
			indices.push(i,i+6,i+4);

			if(i<len-10){
				indices.push(i+8,i+5,i+10+1);
				indices.push(i+9,i+7,i+10+3);
				indices.push(i+4,i+10+2,i+6);
				indices.push(i+4,i+10,i+10+2);
			} else {
				indices.push(i+8,i+5,1);
				indices.push(i+9,i+7,3);
				indices.push(i+4,2,i+6);
				indices.push(i+4,0,2);
			}
		}

		function pushVertex(pos,nor){
			positions.push(...pos);
			normals.push(...nor);
			colors.push(...color);
		}

		return new Polygon(positions,normals,colors,new Uint8Array(indices));
	}

	/**
	 * 圆锥体
	 */
	function Cone(r,h,l,color){
		var angle=Math.PI*2/l,
			x=0, z=0, pos,theTa,normal,
			color=color||[1,1,1,1],
			colors=[],
			positions=[],
			normals=[],
			indices=[];

		for(var i=0;i<l;i++){
			x=r*Math.cos(angle*i);
			z=r*Math.sin(angle*i);
			pos=[x,-h/2,z];
			theTa=Math.atan2(r,h);
			normal=[x,r*Math.cos(theTa)*Math.sin(theTa),z];

			positions.push(...pos);
			positions.push(...pos);

			normals.push(...normalize(normal));
			normals.push(0,-1,0);

			colors.push(...color);
			colors.push(...color);

			if(i%2){
				positions.push(0,h/2,0);
				positions.push(0,-h/2,0);
				normals.push(0,1,0);
				normals.push(0,-1,0);
				colors.push(...color);
				colors.push(...color);	
			}
		}
				
		for(var i=0,l=positions.length/3;i<l;i+=6){
			indices.push(i+4,i,i+2);
			indices.push(i+5,i+1,i+3);
			if(i<l-6){
				indices.push(i+4,i+2,i+6);
				indices.push(i+5,i+3,i+6+1);
			} else {
				indices.push(i+4,i+2,0);
				indices.push(i+5,i+3,1);
			}
		}

		return new Polygon(positions,normals,colors,new Uint8Array(indices));
	}
	
	function Torus(ra,rb,l,color){
		
	}
	
    function normalize(v) {
        var c = v[0],
            d = v[1],
            e = v[2],
            g = Math.sqrt(c * c + d * d + e * e);
        if (!g) {
            v[0] = 0;
            v[1] = 0;
            v[2] = 0;
            return v;
        }
        if (g == 1) return v;
        g = 1 / g;
        v[0] = c * g;
        v[1] = d * g;
        v[2] = e * g;
        return v;
    }




