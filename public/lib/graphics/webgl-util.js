/**
 * WebGL library
 * author jeff zhong
 * date 2017/12/29
 * version 1.0
 */
;(function() {
    /**
     * webgl采用的是右手坐标系
     * z正值表示该对象是在屏幕/观众近，而z的负值表示该对象远离屏幕 
     */
     
    /**
     * 获取webgl上下文
     */
    function get3DContext(canvas, opt) {
        var names = ["webgl2", "webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
        var context = null;
        for (var i = 0, len = names.length; i < len; i++) {
            try {
                context = canvas.getContext(names[i], opt);
            } catch (e) {}
            if (context) {
                break;
            }
        }
        return context;
    }

    /**
     * 根据script id创建program
     * 参数形式(gl,[vid,sid],true)/(gl,vid,sid,true)
     * @param  {Object}        gl          context
     * @param  {Array/String}  ids         script id
     * @param  {Boolean}       useProgram  是否将program设置为当前使用
     * @return {Object} 
     */
    function initProgram(gl) {
        var args = Array.prototype.slice.call(arguments, 1),
            last = args.slice(-1)[0],
            useProgram = typeof last == 'boolean' ? useProgram = args.pop() : false;

        var shaders = getShaderString(args);
        if (!shaders.length) return null;
        var program = createProgram(gl, shaders[0], shaders[1]);
        if (!program) {
            console.log('Failed to create program');
            return null;
        }
        // 使用程序对象
        if (useProgram) {
            gl.useProgram(program);
            gl.program = program;
        }
        return program;
    }


    /**
     * 获取着色器代码字符串
     * @param  {Object}       gl  context
     * @param  {String/Array} vid script id
     * @return {Array}
     */
    function getShaderString(vid, fid) {
        var args = Array.prototype.slice.call(arguments),
            arr = [],
            vshader, fshader, element;

        String(args).replace(new RegExp('[^\\,\\s]+', 'g'), function(item) {
            if (item) { arr.push(item); }
        });

        arr.forEach(function(id) {
            element = document.getElementById(id);
            if (element) {
                switch (element.type) {
                    // 顶点着色器的时候  
                    case 'x-shader/x-vertex':
                        vshader = element.text;
                        break;
                        // 片段着色器的时候  
                    case 'x-shader/x-fragment':
                        fshader = element.text;
                        break;
                    default:
                        break;
                }
            }
        });
        if (!vshader) {
            console.log('VERTEX_SHADER String not exist');
            return [];
        }
        if (!fshader) {
            console.log('FRAGMENT_SHADER String not exist');
            return [];
        }
        return [vshader, fshader];
    }

    /**
     * 创建连接程序对象
     * @param  {Object} gl       上下文
     * @param  {String} vshader  顶点着色器代码
     * @param  {String} fshader  片元着色器代码
     * @return {Object}         
     */
    function createProgram(gl, vshader, fshader) {
        // 创建着色器对象
        var vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);
        var fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);
        if (!vertexShader || !fragmentShader) {
            return null;
        }

        // 创建程序对象
        var program = gl.createProgram();
        if (!program) {
            return null;
        }

        // 为程序对象分配着色器
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        // 连接程序对象
        gl.linkProgram(program);

        // 检查连接结果
        var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!linked) {
            var error = gl.getProgramInfoLog(program);
            console.log('Failed to link program: ' + error);
            gl.deleteProgram(program);
            gl.deleteShader(fragmentShader);
            gl.deleteShader(vertexShader);
            return null;
        }
        return program;
    }

    /**
     * 加载着色器
     * @param  {Object} gl     上下文
     * @param  {Object} type   类型
     * @param  {String} source 代码字符串
     * @return {Object}       
     */
    function loadShader(gl, type, source) {
        // 创建着色器对象
        var shader = gl.createShader(type);
        if (!shader) {
            console.log('unable to create shader');
            return null;
        }

        // 向着色器程序填充代码
        gl.shaderSource(shader, source);

        // 编译着色器
        gl.compileShader(shader);

        // 检查编译结果
        var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!compiled) {
            var error = gl.getShaderInfoLog(shader);
            console.log('Failed to compile shader: ' + error);
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    /**
     * 创建程序对象
     * @param  {Object} gl            
     * @param  {Array}  shaderSources 着色器id或字符串
     * @return {Object}               
     */
    function createProgramInfo(gl, shaderSources) {
        var program;
        // Lets assume if there is no \n it's an id
        if (shaderSources[0].indexOf("\n") < 0) {
            program = initProgram(gl, shaderSources, false);
        } else {
            program = createProgram(gl, shaderSources[0], shaderSources[1]);
        }
        var uniformSetters = createUniformSetters(gl, program);
        var attribSetters = createAttributeSetters(gl, program);
        return {
            program: program,
            uniformSetters: uniformSetters,
            attribSetters: attribSetters,
        };
    }

    /**
     * 绑定缓冲区,设置attributes
     */
    function setBuffersAndAttributes(gl, programInfo, buffers) {
        if (buffers.vertexArrayObject) {
            gl.bindVertexArray(buffers.vertexArrayObject);
        } else {
            setAttributes(programInfo.attribSetters || programInfo, buffers.attribs);
            if (buffers.indices) {
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
            }
        }
    }

    /**
     * 给program 的 attributes 创建设置方法
     */
    function createAttributeSetters(gl, program) {
        var attribSetters = {},
            numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        for (var ii = 0; ii < numAttribs; ++ii) {
            var attribInfo = gl.getActiveAttrib(program, ii);
            if (!attribInfo) {
                break;
            }
            var index = gl.getAttribLocation(program, attribInfo.name);
            attribSetters[attribInfo.name] = createAttribSetter(index);
        }
        /**
         * 绑定缓冲区,输出数据
         */
        function createAttribSetter(index) {
            return function(b) {
                gl.bindBuffer(gl.ARRAY_BUFFER, b.buffer);
                gl.enableVertexAttribArray(index);
                gl.vertexAttribPointer(index, b.num || b.size, b.type || gl.FLOAT, b.normalize || false, b.stride || 0, b.offset || 0);
            };
        }

        return attribSetters;
    }

    /**
     * 绑定缓冲区,设置attributes
     * Properties of attribs. For each attrib you can add
     * properties:
     *   type: the type of data in the buffer. Default = gl.FLOAT
     *   normalize: whether or not to normalize the data. Default = false
     *   stride: the stride. Default = 0
     *   offset: offset into the buffer. Default = 0
     *
     * For example if you had 3 value float positions, 2 value
     * float texcoord and 4 value uint8 colors you'd setup your attribs like this
     *
     *     var attribs = {
     *       a_position: {buffer: positionBuffer, num: 3},
     *       a_texcoord: {buffer: texcoordBuffer, num: 2},
     *       a_color: {
     *         buffer: colorBuffer,
     *         num: 4,
     *         type: gl.UNSIGNED_BYTE,
     *         normalize: true,
     *       },
     *     };
     */
    function setAttributes(setters, attribs) {
        setters = setters.attribSetters || setters;
        Object.keys(attribs).forEach(function(name) {
            var setter = setters[name];
            if (setter) {
                setter(attribs[name]);
            }
        });
    }

    /**
     * 给program 的 uniforms 创建设置方法
     */
    function createUniformSetters(gl, program) {
        var textureUnit = 0,
            uniformSetters = {},
            numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

        for (var ii = 0; ii < numUniforms; ++ii) {
            var uniformInfo = gl.getActiveUniform(program, ii);
            if (!uniformInfo) {
                break;
            }
            var name = uniformInfo.name;
            // remove the array suffix.
            if (name.substr(-3) === "[0]") {
                name = name.substr(0, name.length - 3);
            }
            var setter = createUniformSetter(program, uniformInfo);
            uniformSetters[name] = setter;
        }
        function createUniformSetter(program, uniformInfo) {
            var location = gl.getUniformLocation(program, uniformInfo.name);
            var type = uniformInfo.type;
            // Check if this uniform is an array
            var isArray = (uniformInfo.size > 1 && uniformInfo.name.substr(-3) === "[0]");
            if (type === gl.FLOAT && isArray) {
                return function(v) {
                    gl.uniform1fv(location, v);
                };
            }
            if (type === gl.FLOAT) {
                return function(v) {
                    gl.uniform1f(location, v);
                };
            }
            if (type === gl.FLOAT_VEC2) {
                return function(v) {
                    gl.uniform2fv(location, v);
                };
            }
            if (type === gl.FLOAT_VEC3) {
                return function(v) {
                    gl.uniform3fv(location, v);
                };
            }
            if (type === gl.FLOAT_VEC4) {
                return function(v) {
                    gl.uniform4fv(location, v);
                };
            }
            if (type === gl.INT && isArray) {
                return function(v) {
                    gl.uniform1iv(location, v);
                };
            }
            if (type === gl.INT) {
                return function(v) {
                    gl.uniform1i(location, v);
                };
            }
            if (type === gl.INT_VEC2) {
                return function(v) {
                    gl.uniform2iv(location, v);
                };
            }
            if (type === gl.INT_VEC3) {
                return function(v) {
                    gl.uniform3iv(location, v);
                };
            }
            if (type === gl.INT_VEC4) {
                return function(v) {
                    gl.uniform4iv(location, v);
                };
            }
            if (type === gl.BOOL) {
                return function(v) {
                    gl.uniform1iv(location, v);
                };
            }
            if (type === gl.BOOL_VEC2) {
                return function(v) {
                    gl.uniform2iv(location, v);
                };
            }
            if (type === gl.BOOL_VEC3) {
                return function(v) {
                    gl.uniform3iv(location, v);
                };
            }
            if (type === gl.BOOL_VEC4) {
                return function(v) {
                    gl.uniform4iv(location, v);
                };
            }
            if (type === gl.FLOAT_MAT2) {
                return function(v) {
                    gl.uniformMatrix2fv(location, false, v);
                };
            }
            if (type === gl.FLOAT_MAT3) {
                return function(v) {
                    gl.uniformMatrix3fv(location, false, v);
                };
            }
            if (type === gl.FLOAT_MAT4) {
                return function(v) {
                    gl.uniformMatrix4fv(location, false, v);
                };
            }
            if ((type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) && isArray) {
                var units = [];
                for (var ii = 0; ii < info.size; ++ii) {
                    units.push(textureUnit++);
                }
                return function(bindPoint, units) {
                    return function(textures) {
                        gl.uniform1iv(location, units);
                        textures.forEach(function(texture, index) {
                            gl.activeTexture(gl.TEXTURE0 + units[index]);
                            gl.bindTexture(bindPoint, texture);
                        });
                    };
                }(getBindPointForSamplerType(gl, type), units);
            }
            if (type === gl.SAMPLER_2D || type === gl.SAMPLER_CUBE) {
                return function(bindPoint, unit) {
                    return function(texture) {
                        gl.uniform1i(location, unit);
                        // gl.activeTexture(gl.TEXTURE0);
                        // gl.bindTexture(bindPoint, texture);
                    };
                }(getBindPointForSamplerType(gl, type), textureUnit++);
            }
            throw ("unknown type: 0x" + type.toString(16)); // we should never get here.
        }
        return uniformSetters;
    }

    /**
     * 绑定缓冲区,设置uniforms
     *
     * example:
     *     var programInfo = createProgramInfo(
     *         gl, ["some-vs", "some-fs");
     *
     *     var tex1 = gl.createTexture();
     *     var tex2 = gl.createTexture();
     *
     *     var uniforms = {
     *       u_someSampler: tex1,
     *       u_someOtherSampler: tex2,
     *       u_someColor: [1,0,0,1],
     *       u_somePosition: [0,1,1],
     *       u_someMatrix: [
     *         1,0,0,0,
     *         0,1,0,0,
     *         0,0,1,0,
     *         0,0,0,0,
     *       ],
     *     };
     *
     *     gl.useProgram(program);
     *     setUniforms(programInfo.uniformSetters, uniforms);
     */
    function setUniforms(setters, values) {
        setters = setters.uniformSetters || setters;
        Object.keys(values).forEach(function(name) {
            var setter = setters[name];
            if (setter) {
                setter(values[name]);
            }
        });
    }


    /**
     * 根据数组创建缓冲区信息对象(attribute的维度)
     * Given an object like
     *
     *     var arrays = {
     *       position: { num: 3, data: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0], },
     *       texcoord: { num: 2, data: [0, 0, 0, 1, 1, 0, 1, 1],                 },
     *       normal:   { num: 3, data: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],     },
     *       indices:  { num: 3, data: [0, 1, 2, 1, 2, 3],                       },
     *     };
     *
     *  Creates an BufferInfo like this
     *
     *     bufferInfo = {
     *       indexType:gl.UNSIGNED_BYTE,
     *       numElements: 4,        // or whatever the number of elements is
     *       indices: WebGLBuffer,  // this property will not exist if there are no indices
     *       attribs: {
     *         a_position: { buffer: WebGLBuffer, num: 3, },
     *         a_normal:   { buffer: WebGLBuffer, num: 3, },
     *         a_texcoord: { buffer: WebGLBuffer, num: 2, },
     *       },
     *     };
     *
     *  The properties of arrays can be JavaScript arrays in which case the number of components
     *  will be guessed.
     *
     *     var arrays = {
     *        position: [0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0],
     *        texcoord: [0, 0, 0, 1, 1, 0, 1, 1],
     *        normal:   [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
     *        indices:  [0, 1, 2, 1, 2, 3],
     *     };
     *
     *  They can also by TypedArrays
     *
     *     var arrays = {
     *        position: new Float32Array([0, 0, 0, 10, 0, 0, 0, 10, 0, 10, 10, 0]),
     *        texcoord: new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]),
     *        normal:   new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]),
     *        indices:  new Uint16Array([0, 1, 2, 1, 2, 3]),
     *     };
     *
     */
    function createBufferInfoFromArrays(gl, arrays, opt_mapping) {
        var bufferInfo = {
            attribs: createAttribsFromArrays(gl, arrays, opt_mapping),
        };
        var indices = arrays.indices;
        if (indices) {
            indices = makeTypedArray(indices, "indices");
            bufferInfo.indices = createBufferFromTypedArray(gl, indices, gl.ELEMENT_ARRAY_BUFFER);
            bufferInfo.numElements = indices.length;
            bufferInfo.indexType=getGLTypeForTypedArray(gl,indices);
        } else {
            bufferInfo.numElements = getNumElementsFromNonIndexedArrays(arrays);
        }

        return bufferInfo;
    }

    /**
     * 根据数组创建缓冲区对象(buffer的维度)
     */
    function createBuffersFromArrays(gl, arrays) {
        var buffers = {};
        Object.keys(arrays).forEach(function(key) {
            var type = key === "indices" ? gl.ELEMENT_ARRAY_BUFFER : gl.ARRAY_BUFFER;
            var array = makeTypedArray(arrays[key], name);
            buffers[key] = createBufferFromTypedArray(gl, array, type);
        });

        // hrm
        if (arrays.indices) {
            buffers.numElements = arrays.indices.length;
        } else if (arrays.position) {
            buffers.numElements = arrays.position.length / 3;
        }
        return buffers;
    }

    /**
     * 根据数组创建attributes信息
     */
    function createAttribsFromArrays(gl, arrays, opt_mapping) {
        var mapping = opt_mapping || createMapping(arrays);
        var attribs = {};
        Object.keys(mapping).forEach(function(attribName) {
            var bufferName = mapping[attribName];
            var array = makeTypedArray(arrays[bufferName], bufferName);
            attribs[attribName] = {
                buffer: createBufferFromTypedArray(gl, array),
                num: array.num || guessNumFromName(bufferName),
                type: getGLTypeForTypedArray(gl, array),
                normalize: getNormalizationForTypedArray(array),
            };
        });
        return attribs;
    }

    /**
     *  创建attribute的名称映射
     */
    function createMapping(obj) {
        var mapping = {};
        Object.keys(obj).filter(allButIndices).forEach(function(key) {
            mapping["a_" + key] = key;
        });
        return mapping;
    }

    /**
     * 排除索引
     */
    function allButIndices(name) {
        return name !== "indices";
    }

    /**
     * 创建类型化数组
     */
  function makeTypedArray(array, name) {
      if (isArrayBuffer(array)) {
          return array;
      }

      if (Array.isArray(array)) {
          array = {
              data: array,
          };
      }

      if (!array.num) {
          array.num = guessNumFromName(name, array.length);
      }

      var type = array.type;
      if (!type) {
          if (name === "indices") {
              type = Uint16Array;
          }
      }
      var typedArray = createAugmentedTypedArray(array.num, array.data.length / array.num | 0, type);
      typedArray.push(array.data);
      return typedArray;
  }

  function createAugmentedTypedArray(num, numElements, opt_type) {
      var Type = opt_type || Float32Array;
      return augmentTypedArray(new Type(num * numElements), num);
  }

  // Add `push` to a typed array. It just keeps a 'cursor'
  // and allows use to `push` values into the array so we
  // don't have to manually compute offsets
  function augmentTypedArray(typedArray, num) {
      var cursor = 0;
      typedArray.push = function() {
          for (var i = 0; i < arguments.length; ++i) {
              var value = arguments[i];
              if (value instanceof Array || (value.buffer && value.buffer instanceof ArrayBuffer)) {
                  for (var j = 0; j < value.length; ++j) {
                      typedArray[cursor++] = value[j];
                  }
              } else {
                  typedArray[cursor++] = value;
              }
          }
      };
      typedArray.reset = function(opt_index) {
          cursor = opt_index || 0;
      };
      typedArray.num = num;
      Object.defineProperty(typedArray, 'numElements', {
          get: function() {
              return this.length / this.num | 0;
          },
      });
      return typedArray;
  }


    /**
     * 是否为类型化数组
     */
    function isArrayBuffer(a) {
        return a.buffer && a.buffer instanceof ArrayBuffer;
    }

    /**
     * 根据名字猜测元素个数
     */
    function guessNumFromName(name, length) {
        var num;
        if (name.indexOf("coord") >= 0) {
            num = 2;
        } else if (name.indexOf("color") >= 0) {
            num = 4;
        } else {
            num = 3; // position, normals, indices ...
        }

        if (length % num > 0) {
            throw "can not guess num. You should specify it.";
        }

        return num;
    }

    /**
     * 根据类型化数组创建缓冲区
     */
    function createBufferFromTypedArray(gl, array, type, drawType) {
        type = type || gl.ARRAY_BUFFER;
        var buffer = gl.createBuffer();
        gl.bindBuffer(type, buffer);
        gl.bufferData(type, array, drawType || gl.STATIC_DRAW);
        return buffer;
    }

    /**
     * 根据构造函数获取对应的元素类型
     */
    function getGLTypeForTypedArray(gl, typedArray) {
        if (typedArray instanceof Int8Array) {return gl.BYTE; }
        if (typedArray instanceof Uint8Array) {return gl.UNSIGNED_BYTE; }
        if (typedArray instanceof Int16Array) {return gl.SHORT; }
        if (typedArray instanceof Uint16Array) {return gl.UNSIGNED_SHORT; }
        if (typedArray instanceof Int32Array) {return gl.INT; }
        if (typedArray instanceof Uint32Array) {return gl.UNSIGNED_INT; }
        if (typedArray instanceof Float32Array) {return gl.FLOAT; }
        throw "unsupported typed array type";
    }

    /**
    * Returns the corresponding bind point for a given sampler type
    */
    function getBindPointForSamplerType(gl, type) {
        if (type === gl.SAMPLER_2D) return gl.TEXTURE_2D;
        if (type === gl.SAMPLER_CUBE) return gl.TEXTURE_CUBE_MAP;
        return undefined;
    }

    /**
     * 猜测是否归一化
     */
    function getNormalizationForTypedArray(typedArray) {
        if (typedArray instanceof Int8Array) {return true; }
        if (typedArray instanceof Uint8Array) {return true; }
        return false;
    }

    /**
     * 获取元素个数
     */
    function getNumElementsFromNonIndexedArrays(arrays) {
        var key = Object.keys(arrays)[0];
        var array = arrays[key];
        if (isArrayBuffer(array)) {
            return array.numElements;
        } else {
            return array.data.length / array.num;
        }
    }

    /**
     * 初始化帧缓冲区对象 (FBO)  
     * @param  {Object} gl 上下文
     * @return {Object}    
     */
    function initFramebufferObject(gl,w,h) {
        var framebuffer, texture, depthBuffer;
        w = w||1024;
        h = h||1024;
        // Define the error handling function
        var error = function() {
            if (framebuffer) gl.deleteFramebuffer(framebuffer);
            if (texture) gl.deleteTexture(texture);
            if (depthBuffer) gl.deleteRenderbuffer(depthBuffer);
            return null;
        }

        // Create a framebuffer object (FBO)
        framebuffer = gl.createFramebuffer();
        if (!framebuffer) {
            console.log('Failed to create frame buffer object');
            return error();
        }

        // Create a texture object
        texture = gl.createTexture(); 
        if (!texture) {
            console.log('Failed to create texture object');
            return error();
        }
        // set texture object size and parameters
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        // Create a renderbuffer object
        depthBuffer = gl.createRenderbuffer(); 
        if (!depthBuffer) {
            console.log('Failed to create renderbuffer object');
            return error();
        }
        // Set renderbuffer object size and parameters
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h);

        // Attach the texture and the renderbuffer object to the FBO
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

        // Check if FBO is configured correctly
        var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        if (gl.FRAMEBUFFER_COMPLETE !== e) {
            console.log('Frame buffer object is incomplete: ' + e.toString());
            return error();
        }

        framebuffer.texture = texture; // keep the required object

        // Unbind the buffer object
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        return framebuffer;
    }

    var output = {
        get3DContext: get3DContext,
        getShaderString: getShaderString,
        loadShader: loadShader,
        initProgram: initProgram,
        createProgram: createProgram,
        createProgramInfo: createProgramInfo,
        createAttributeSetters: createAttributeSetters,
        createUniformSetters:createUniformSetters,
        setBuffersAndAttributes: setBuffersAndAttributes,
        setUniforms:setUniforms,
        setAttributes: setAttributes,
        createBufferInfoFromArrays:createBufferInfoFromArrays,
        createBuffersFromArrays:createBuffersFromArrays,
        createAttribsFromArrays:createAttribsFromArrays,
        initFramebufferObject:initFramebufferObject
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports=output;
    } else {
        for(var n in output){
            window[n]=output[n];
        }
    }
}());