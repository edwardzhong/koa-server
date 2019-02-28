//------------------------------------------------------------------------------
// OBJParser
//------------------------------------------------------------------------------
/**
 * obj
 * v 几何体顶点 (Geometric vertices)
 * vt 贴图坐标点 (Texture vertices)
 * vn 顶点法线 (Vertex nIndexs)
 * f 面 (Face) 每项格式: 顶点索引 / 纹理坐标索引 / 法线索引
 * s off 表示关闭光滑组。

 * mtl
 * Ka 环境色  rgb
 * Kd 漫反射色,材质颜色  rgb
 * Ks 高光色，材质高光颜色 rgb
 * Ns 反射高光度 指定材质的反射指数
 * Ni 折射值 指定材质表面的光密度
 * d 透明度  
 * illum  光照模型
 */
;(function() {
    /**
     * contructor
     * @param {String} fileName 
     * @param {String} objStr   obj字符串
     * @param {String} mtlStr   mtl字符串
     */
    var OBJDoc = function(fileName, objStr, mtlStr) {
        this.fileName = fileName;
        this.objStr = objStr;
        this.mtlStr = mtlStr;
        this.mtls = []; // Initialize the property for MTL
        this.objects = []; // Initialize the property for Object
        this.vertices = []; // Initialize the property for Vertex
        this.normals = []; // Initialize the property for Normal
    }

    /**
     * 解析字符串
     * @param  {Number} scale   缩放比例
     * @param  {Boolen} reverse 是否反转法线
     * @return {Object}
     */
    OBJDoc.prototype.parse = function(scale, reverse) {
        var lines = this.objStr.split('\n'), // Break up into lines and store them as array
            index = 0,
            currentObject = null,
            currentMaterialName = "",
            line,
            sp = new StringParser(); // Create StringParser
        lines.push(null); // Append null

        while ((line = lines[index++]) != null) {
            sp.init(line); // init StringParser
            var command = sp.getWord(); // Get command
            if (command == null) continue; // check null command

            switch (command) {
                case '#':
                    continue; // Skip comments
                case 'mtllib': // Read Material chunk
                    var path = this.parseMtllib(sp, this.fileName);
                    var mtl = new MTLDoc(); // Create MTL instance
                    this.mtls.push(mtl);
                    mtl.readMTLFile(this.mtlStr);
                    continue; // Go to the next line
                case 'o':
                case 'g': // Read Object name
                    var object = this.parseObjectName(sp);
                    this.objects.push(object);
                    currentObject = object;
                    continue; // Go to the next line
                case 'v': // Read vertex
                    var vertex = this.parseVertex(sp, scale);
                    this.vertices.push(vertex);
                    continue; // Go to the next line
                case 'vn': // Read normal
                    var normal = this.parseNormal(sp);
                    this.normals.push(normal);
                    continue; // Go to the next line
                case 'usemtl': // Read Material name
                    currentMaterialName = this.parseUsemtl(sp);
                    continue; // Go to the next line
                case 'f': // Read face
                    var face = this.parseFace(sp, currentMaterialName, this.vertices, reverse);
                    currentObject.addFace(face);
                    continue; // Go to the next line
            }
        }
        return true;
    }

    OBJDoc.prototype.parseMtllib = function(sp, fileName) {
        // Get directory path
        var i = fileName.lastIndexOf("/");
        var dirPath = "";
        if (i > 0) dirPath = fileName.substr(0, i + 1);

        return dirPath + sp.getWord(); // Get path
    }

    OBJDoc.prototype.parseObjectName = function(sp) {
        var name = sp.getWord();
        return (new OBJObject(name));
    }

    OBJDoc.prototype.parseVertex = function(sp, scale) {
        var x = sp.getFloat() * scale;
        var y = sp.getFloat() * scale;
        var z = sp.getFloat() * scale;
        return (new Vertex(x, y, z));
    }

    OBJDoc.prototype.parseNormal = function(sp) {
        var x = sp.getFloat();
        var y = sp.getFloat();
        var z = sp.getFloat();
        return (new Normal(x, y, z));
    }

    OBJDoc.prototype.parseUsemtl = function(sp) {
        return sp.getWord();
    }

    OBJDoc.prototype.parseFace = function(sp, materialName, vertices, reverse) {
        var face = new Face(materialName);
        // get indices
        for (;;) {
            var word = sp.getWord();
            if (word == null) break;
            var subWords = word.split('/');
            //顶点索引
            if (subWords.length >= 1) {
                var vi = parseInt(subWords[0]) - 1;
                face.vIndices.push(vi);
            }
            //法线索引
            if (subWords.length >= 3) {
                var ni = parseInt(subWords[2]) - 1;
                face.nIndices.push(ni);
            } else {
                face.nIndices.push(-1);
            }
        }

        // 根据顶点索引构建该面包含的顶点
        var v0 = [
            vertices[face.vIndices[0]].x,
            vertices[face.vIndices[0]].y,
            vertices[face.vIndices[0]].z
        ];
        var v1 = [
            vertices[face.vIndices[1]].x,
            vertices[face.vIndices[1]].y,
            vertices[face.vIndices[1]].z
        ];
        var v2 = [
            vertices[face.vIndices[2]].x,
            vertices[face.vIndices[2]].y,
            vertices[face.vIndices[2]].z
        ];

        // 计算面的法线并归一化
        var normal = calcNormal(v0, v1, v2);
        // 法线不存在
        if (normal == null) {
            if (face.vIndices.length >= 4) { // 有4个顶点的情况
                var v3 = [
                    vertices[face.vIndices[3]].x,
                    vertices[face.vIndices[3]].y,
                    vertices[face.vIndices[3]].z
                ];
                normal = calcNormal(v1, v2, v3);
            }
            if (normal == null) { // 默认返回的法线
                normal = [0.0, 1.0, 0.0];
            }
        }
        if (reverse) {
            normal[0] = -normal[0];
            normal[1] = -normal[1];
            normal[2] = -normal[2];
        }
        face.normal = new Normal(normal[0], normal[1], normal[2]);

        // 面的顶点大于3时,则将面分割为多个三角形
        if (face.vIndices.length > 3) {
            var n = face.vIndices.length - 2;
            var newVIndices = new Array(n * 3);
            var newNIndices = new Array(n * 3);
            for (var i = 0; i < n; i++) {
                newVIndices[i * 3 + 0] = face.vIndices[0];
                newVIndices[i * 3 + 1] = face.vIndices[i + 1];
                newVIndices[i * 3 + 2] = face.vIndices[i + 2];
                newNIndices[i * 3 + 0] = face.nIndices[0];
                newNIndices[i * 3 + 1] = face.nIndices[i + 1];
                newNIndices[i * 3 + 2] = face.nIndices[i + 2];
            }
            face.vIndices = newVIndices;
            face.nIndices = newNIndices;
        }
        face.numIndices = face.vIndices.length;

        return face;
    }

    // Check Materials
    OBJDoc.prototype.isMTLComplete = function() {
        if (this.mtls.length == 0) return true;
        for (var i = 0; i < this.mtls.length; i++) {
            if (!this.mtls[i].complete) return false;
        }
        return true;
    }

    // Find color by material name
    OBJDoc.prototype.findMtl = function(name) {
        for (var i = 0; i < this.mtls.length; i++) {
            if (this.mtls[i].materials[name]) {
                return this.mtls[i].materials[name];
            }
        }
        return new Color(0.8, 0.8, 0.8, 1);
    }

    //------------------------------------------------------------------------------
    // Retrieve the information for drawing 3D model
    OBJDoc.prototype.getDrawingInfo = function() {
        // 将所有的图形的索引长度相加
        var numIndices = 0;
        for (var i = 0; i < this.objects.length; i++) {
            numIndices += this.objects[i].numIndices;
        }
        // 构造顶点,法线,颜色,高光色,索引的类型化数组
        var numVertices = numIndices;
        var vertices = new Float32Array(numVertices * 3);
        var normals = new Float32Array(numVertices * 3);
        var colors = new Float32Array(numVertices * 4);
        var sColors = new Float32Array(numVertices * 4);
        var indices = new Uint16Array(numIndices);

        // 将所有的分模型合并输出为一个单一的模型
        var index_indices = 0;
        for (var i = 0; i < this.objects.length; i++) {
            var object = this.objects[i];
            for (var j = 0; j < object.faces.length; j++) {
                var face = object.faces[j];
                var mtl = this.findMtl(face.materialName);
                var faceNormal = face.normal;
                for (var k = 0; k < face.vIndices.length; k++) {
                    // Set index
                    indices[index_indices] = index_indices;
                    // Copy vertex
                    var vIdx = face.vIndices[k];
                    var vertex = this.vertices[vIdx];
                    vertices[index_indices * 3 + 0] = vertex.x;
                    vertices[index_indices * 3 + 1] = vertex.y;
                    vertices[index_indices * 3 + 2] = vertex.z;
                    // Copy color
                    colors[index_indices * 4 + 0] = mtl.color.r;
                    colors[index_indices * 4 + 1] = mtl.color.g;
                    colors[index_indices * 4 + 2] = mtl.color.b;
                    colors[index_indices * 4 + 3] = mtl.color.a;

                    sColors[index_indices * 4 + 0] = mtl.sColor.r;
                    sColors[index_indices * 4 + 1] = mtl.sColor.g;
                    sColors[index_indices * 4 + 2] = mtl.sColor.b;
                    sColors[index_indices * 4 + 3] = mtl.sColor.a;

                    // Copy normal
                    var nIdx = face.nIndices[k];
                    if (nIdx >= 0) {
                        var normal = this.normals[nIdx];
                        normals[index_indices * 3 + 0] = normal.x;
                        normals[index_indices * 3 + 1] = normal.y;
                        normals[index_indices * 3 + 2] = normal.z;
                    } else {
                        normals[index_indices * 3 + 0] = faceNormal.x;
                        normals[index_indices * 3 + 1] = faceNormal.y;
                        normals[index_indices * 3 + 2] = faceNormal.z;
                    }
                    index_indices++;
                }
            }
        }

        return new DrawingInfo(vertices, normals, colors, sColors, indices);
    }

    //------------------------------------------------------------------------------
    // MTLDoc Object
    //------------------------------------------------------------------------------
    var MTLDoc = function() {
        this.complete = false; // MTL is configured correctly
        this.materials = {};
    }
    MTLDoc.prototype.readMTLFile = function(fileString) {
        var lines = fileString.split('\n'); // Break up into lines and store them as array
        lines.push(null); // Append null
        var index = 0,
            line,
            name = "",
            material = null,
            sp = new StringParser(); // Create StringParser
        while ((line = lines[index++]) != null) {
            sp.init(line); // init StringParser
            var command = sp.getWord(); // Get command
            if (command == null) continue; // check null command

            switch (command) {
                case '#':
                    continue; // Skip comments
                case 'newmtl': // Read Material chunk
                    name = this.parseNewmtl(sp); // Get name
                    material = new Material(name);
                    continue; // Go to the next line
                case 'Kd': // Read normal
                    if (name == "") continue; // Go to the next line because of Error
                    material.color = this.parseRGB(sp);
                    continue; // Go to the next line
                case 'Ks':
                    if (name == "") continue; // Go to the next line because of Error
                    material.sColor = this.parseRGB(sp);
                    continue; // Go to the next line
                case 'd':
                    if (name == "") continue; // Go to the next line because of Error
                    material.setOpacity(sp);
                    this.materials[name] = material;;
                    name = "";
            }
        }
        this.complete = true;
    }
    MTLDoc.prototype.parseNewmtl = function(sp) {
        return sp.getWord(); // Get name
    }

    MTLDoc.prototype.parseRGB = function(sp) {
        var r = sp.getFloat();
        var g = sp.getFloat();
        var b = sp.getFloat();
        return new Color(r, g, b, 1);
    }

    //------------------------------------------------------------------------------
    // Material Object
    //------------------------------------------------------------------------------
    var Material = function(name) {
        this.name = name;
        this.color = {};
        this.sColor = {};
    }
    Material.prototype.setOpacity = function(sp) {
        this.color.a = this.sColor.a = sp.getFloat();
    }

    //------------------------------------------------------------------------------
    // Vertex Object
    //------------------------------------------------------------------------------
    var Vertex = function(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    //------------------------------------------------------------------------------
    // Vector3 Object
    //------------------------------------------------------------------------------
    var Vector3 = function(opt_src) {
        var v = new Float32Array(3);
        if (opt_src && typeof opt_src === 'object') {
            v[0] = opt_src[0];
            v[1] = opt_src[1];
            v[2] = opt_src[2];
        }
        this.elements = v;
    }

    Vector3.prototype.normalize = function() {
        var v = this.elements;
        var c = v[0],
            d = v[1],
            e = v[2],
            g = Math.sqrt(c * c + d * d + e * e);
        if (!g) {
            v[0] = 0;
            v[1] = 0;
            v[2] = 0;
            return this;
        }
        if (g == 1) return this;
        g = 1 / g;
        v[0] = c * g;
        v[1] = d * g;
        v[2] = e * g;
        return this;
    };
    
    //------------------------------------------------------------------------------
    // Normal Object
    //------------------------------------------------------------------------------
    var Normal = function(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    //------------------------------------------------------------------------------
    // Color Object
    //------------------------------------------------------------------------------
    var Color = function(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    //------------------------------------------------------------------------------
    // OBJObject Object
    //------------------------------------------------------------------------------
    var OBJObject = function(name) {
        this.name = name;
        this.faces = [];
        this.numIndices = 0;
    }

    OBJObject.prototype.addFace = function(face) {
        this.faces.push(face);
        this.numIndices += face.numIndices;
    }

    //------------------------------------------------------------------------------
    // Face Object
    //------------------------------------------------------------------------------
    var Face = function(materialName) {
        this.materialName = materialName;
        if (materialName == null) this.materialName = "";
        this.vIndices = [];
        this.nIndices = [];
    }

    //------------------------------------------------------------------------------
    // DrawInfo Object
    //------------------------------------------------------------------------------
    var DrawingInfo = function(vertices, normals, colors, sColors, indices) {
        this.vertices = vertices;
        this.normals = normals;
        this.colors = colors;
        this.sColors = sColors;
        this.indices = indices;
    }

    //------------------------------------------------------------------------------
    // Constructor
    var StringParser = function(str) {
            this.str; // Store the string specified by the argument
            this.index; // Position in the string to be processed
            this.init(str);
        }
        // Initialize StringParser object
    StringParser.prototype.init = function(str) {
        this.str = str;
        this.index = 0;
    }

    // Skip delimiters
    StringParser.prototype.skipDelimiters = function() {
        for (var i = this.index, len = this.str.length; i < len; i++) {
            var c = this.str.charAt(i);
            // Skip TAB, Space, '(', ')
            if (c == '\t' || c == ' ' || c == '(' || c == ')' || c == '"') continue;
            break;
        }
        this.index = i;
    }

    // Skip to the next word
    StringParser.prototype.skipToNextWord = function() {
        this.skipDelimiters();
        var n = getWordLength(this.str, this.index);
        this.index += (n + 1);
    }

    // Get word
    StringParser.prototype.getWord = function() {
        this.skipDelimiters();
        var n = getWordLength(this.str, this.index);
        if (n == 0) return null;
        var word = this.str.substr(this.index, n);
        this.index += (n + 1);

        return word;
    }

    // Get integer
    StringParser.prototype.getInt = function() {
        return parseInt(this.getWord());
    }

    // Get floating number
    StringParser.prototype.getFloat = function() {
        return parseFloat(this.getWord());
    }

    // Get the length of word
    function getWordLength(str, start) {
        var n = 0;
        for (var i = start, len = str.length; i < len; i++) {
            var c = str.charAt(i);
            if (c == '\t' || c == ' ' || c == '(' || c == ')' || c == '"')
                break;
        }
        return i - start;
    }

    //------------------------------------------------------------------------------
    // Common function
    //------------------------------------------------------------------------------
    function calcNormal(p0, p1, p2) {
        // v0: a vector from p1 to p0, v1; a vector from p1 to p2
        var v0 = new Float32Array(3);
        var v1 = new Float32Array(3);
        for (var i = 0; i < 3; i++) {
            v0[i] = p0[i] - p1[i];
            v1[i] = p2[i] - p1[i];
        }

        // The cross product of v0 and v1
        var c = new Float32Array(3);
        c[0] = v0[1] * v1[2] - v0[2] * v1[1];
        c[1] = v0[2] * v1[0] - v0[0] * v1[2];
        c[2] = v0[0] * v1[1] - v0[1] * v1[0];

        // Normalize the result
        var v = new Vector3(c);
        v.normalize();
        return v.elements;
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports.OBJDoc = OBJDoc;
    } else {
        window.OBJDoc = OBJDoc;
    }
}());
