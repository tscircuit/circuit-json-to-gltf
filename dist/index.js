import {
  __commonJS,
  __toESM
} from "./chunk-QGM4M3NI.js";

// node_modules/@jscad/modeling/src/utils/flatten.js
var require_flatten = __commonJS({
  "node_modules/@jscad/modeling/src/utils/flatten.js"(exports, module) {
    "use strict";
    var flatten = (arr) => arr.flat(Infinity);
    module.exports = flatten;
  }
});

// node_modules/@jscad/modeling/src/geometries/geom2/clone.js
var require_clone = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/geom2/clone.js"(exports, module) {
    "use strict";
    var clone = (geometry) => Object.assign({}, geometry);
    module.exports = clone;
  }
});

// node_modules/@jscad/modeling/src/maths/mat4/add.js
var require_add = __commonJS({
  "node_modules/@jscad/modeling/src/maths/mat4/add.js"(exports, module) {
    "use strict";
    var add = (out, a, b) => {
      out[0] = a[0] + b[0];
      out[1] = a[1] + b[1];
      out[2] = a[2] + b[2];
      out[3] = a[3] + b[3];
      out[4] = a[4] + b[4];
      out[5] = a[5] + b[5];
      out[6] = a[6] + b[6];
      out[7] = a[7] + b[7];
      out[8] = a[8] + b[8];
      out[9] = a[9] + b[9];
      out[10] = a[10] + b[10];
      out[11] = a[11] + b[11];
      out[12] = a[12] + b[12];
      out[13] = a[13] + b[13];
      out[14] = a[14] + b[14];
      out[15] = a[15] + b[15];
      return out;
    };
    module.exports = add;
  }
});

// node_modules/@jscad/modeling/src/maths/mat4/create.js
var require_create = __commonJS({
  "node_modules/@jscad/modeling/src/maths/mat4/create.js"(exports, module) {
    "use strict";
    var create = () => [
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ];
    module.exports = create;
  }
});

// node_modules/@jscad/modeling/src/maths/mat4/clone.js
var require_clone2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/mat4/clone.js"(exports, module) {
    "use strict";
    var create = require_create();
    var clone = (matrix) => {
      const out = create();
      out[0] = matrix[0];
      out[1] = matrix[1];
      out[2] = matrix[2];
      out[3] = matrix[3];
      out[4] = matrix[4];
      out[5] = matrix[5];
      out[6] = matrix[6];
      out[7] = matrix[7];
      out[8] = matrix[8];
      out[9] = matrix[9];
      out[10] = matrix[10];
      out[11] = matrix[11];
      out[12] = matrix[12];
      out[13] = matrix[13];
      out[14] = matrix[14];
      out[15] = matrix[15];
      return out;
    };
    module.exports = clone;
  }
});

// node_modules/@jscad/modeling/src/maths/mat4/copy.js
var require_copy = __commonJS({
  "node_modules/@jscad/modeling/src/maths/mat4/copy.js"(exports, module) {
    "use strict";
    var copy = (out, matrix) => {
      out[0] = matrix[0];
      out[1] = matrix[1];
      out[2] = matrix[2];
      out[3] = matrix[3];
      out[4] = matrix[4];
      out[5] = matrix[5];
      out[6] = matrix[6];
      out[7] = matrix[7];
      out[8] = matrix[8];
      out[9] = matrix[9];
      out[10] = matrix[10];
      out[11] = matrix[11];
      out[12] = matrix[12];
      out[13] = matrix[13];
      out[14] = matrix[14];
      out[15] = matrix[15];
      return out;
    };
    module.exports = copy;
  }
});

// node_modules/@jscad/modeling/src/maths/mat4/invert.js
var require_invert = __commonJS({
  "node_modules/@jscad/modeling/src/maths/mat4/invert.js"(exports, module) {
    "use strict";
    var invert = (out, matrix) => {
      const a00 = matrix[0];
      const a01 = matrix[1];
      const a02 = matrix[2];
      const a03 = matrix[3];
      const a10 = matrix[4];
      const a11 = matrix[5];
      const a12 = matrix[6];
      const a13 = matrix[7];
      const a20 = matrix[8];
      const a21 = matrix[9];
      const a22 = matrix[10];
      const a23 = matrix[11];
      const a30 = matrix[12];
      const a31 = matrix[13];
      const a32 = matrix[14];
      const a33 = matrix[15];
      const b00 = a00 * a11 - a01 * a10;
      const b01 = a00 * a12 - a02 * a10;
      const b02 = a00 * a13 - a03 * a10;
      const b03 = a01 * a12 - a02 * a11;
      const b04 = a01 * a13 - a03 * a11;
      const b05 = a02 * a13 - a03 * a12;
      const b06 = a20 * a31 - a21 * a30;
      const b07 = a20 * a32 - a22 * a30;
      const b08 = a20 * a33 - a23 * a30;
      const b09 = a21 * a32 - a22 * a31;
      const b10 = a21 * a33 - a23 * a31;
      const b11 = a22 * a33 - a23 * a32;
      let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
      if (!det) {
        return null;
      }
      det = 1 / det;
      out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
      out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
      out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
      out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
      out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
      out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
      out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
      out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
      out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
      out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
      out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
      out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
      out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
      out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
      out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
      out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
      return out;
    };
    module.exports = invert;
  }
});

// node_modules/@jscad/modeling/src/maths/mat4/equals.js
var require_equals = __commonJS({
  "node_modules/@jscad/modeling/src/maths/mat4/equals.js"(exports, module) {
    "use strict";
    var equals = (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] && a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] && a[8] === b[8] && a[9] === b[9] && a[10] === b[10] && a[11] === b[11] && a[12] === b[12] && a[13] === b[13] && a[14] === b[14] && a[15] === b[15];
    module.exports = equals;
  }
});

// node_modules/@jscad/modeling/src/maths/constants.js
var require_constants = __commonJS({
  "node_modules/@jscad/modeling/src/maths/constants.js"(exports, module) {
    "use strict";
    var spatialResolution = 1e5;
    var EPS = 1e-5;
    var NEPS = 1e-13;
    var TAU = Math.PI * 2;
    module.exports = {
      EPS,
      NEPS,
      TAU,
      spatialResolution
    };
  }
});

// node_modules/@jscad/modeling/src/maths/utils/trigonometry.js
var require_trigonometry = __commonJS({
  "node_modules/@jscad/modeling/src/maths/utils/trigonometry.js"(exports, module) {
    "use strict";
    var { NEPS } = require_constants();
    var rezero = (n) => Math.abs(n) < NEPS ? 0 : n;
    var sin = (radians) => rezero(Math.sin(radians));
    var cos = (radians) => rezero(Math.cos(radians));
    module.exports = { sin, cos };
  }
});

// node_modules/@jscad/modeling/src/maths/mat4/identity.js
var require_identity = __commonJS({
  "node_modules/@jscad/modeling/src/maths/mat4/identity.js"(exports, module) {
    "use strict";
    var identity = (out) => {
      out[0] = 1;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[5] = 1;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[10] = 1;
      out[11] = 0;
      out[12] = 0;
      out[13] = 0;
      out[14] = 0;
      out[15] = 1;
      return out;
    };
    module.exports = identity;
  }
});

// node_modules/@jscad/modeling/src/maths/mat4/fromRotation.js
var require_fromRotation = __commonJS({
  "node_modules/@jscad/modeling/src/maths/mat4/fromRotation.js"(exports, module) {
    "use strict";
    var { EPS } = require_constants();
    var { sin, cos } = require_trigonometry();
    var identity = require_identity();
    var fromRotation = (out, rad, axis) => {
      let [x, y, z] = axis;
      const lengthSquared = x * x + y * y + z * z;
      if (Math.abs(lengthSquared) < EPS) {
        return identity(out);
      }
      const len = 1 / Math.sqrt(lengthSquared);
      x *= len;
      y *= len;
      z *= len;
      const s = sin(rad);
      const c = cos(rad);
      const t = 1 - c;
      out[0] = x * x * t + c;
      out[1] = y * x * t + z * s;
      out[2] = z * x * t - y * s;
      out[3] = 0;
      out[4] = x * y * t - z * s;
      out[5] = y * y * t + c;
      out[6] = z * y * t + x * s;
      out[7] = 0;
      out[8] = x * z * t + y * s;
      out[9] = y * z * t - x * s;
      out[10] = z * z * t + c;
      out[11] = 0;
      out[12] = 0;
      out[13] = 0;
      out[14] = 0;
      out[15] = 1;
      return out;
    };
    module.exports = fromRotation;
  }
});

// node_modules/@jscad/modeling/src/maths/mat4/fromScaling.js
var require_fromScaling = __commonJS({
  "node_modules/@jscad/modeling/src/maths/mat4/fromScaling.js"(exports, module) {
    "use strict";
    var fromScaling = (out, vector) => {
      out[0] = vector[0];
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[5] = vector[1];
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[10] = vector[2];
      out[11] = 0;
      out[12] = 0;
      out[13] = 0;
      out[14] = 0;
      out[15] = 1;
      return out;
    };
    module.exports = fromScaling;
  }
});

// node_modules/@jscad/modeling/src/maths/mat4/fromTaitBryanRotation.js
var require_fromTaitBryanRotation = __commonJS({
  "node_modules/@jscad/modeling/src/maths/mat4/fromTaitBryanRotation.js"(exports, module) {
    "use strict";
    var { sin, cos } = require_trigonometry();
    var fromTaitBryanRotation = (out, yaw, pitch, roll) => {
      const sy = sin(yaw);
      const cy = cos(yaw);
      const sp = sin(pitch);
      const cp = cos(pitch);
      const sr = sin(roll);
      const cr = cos(roll);
      out[0] = cp * cy;
      out[1] = cp * sy;
      out[2] = -sp;
      out[3] = 0;
      out[4] = sr * sp * cy - cr * sy;
      out[5] = cr * cy + sr * sp * sy;
      out[6] = sr * cp;
      out[7] = 0;
      out[8] = sr * sy + cr * sp * cy;
      out[9] = cr * sp * sy - sr * cy;
      out[10] = cr * cp;
      out[11] = 0;
      out[12] = 0;
      out[13] = 0;
      out[14] = 0;
      out[15] = 1;
      return out;
    };
    module.exports = fromTaitBryanRotation;
  }
});

// node_modules/@jscad/modeling/src/maths/mat4/fromTranslation.js
var require_fromTranslation = __commonJS({
  "node_modules/@jscad/modeling/src/maths/mat4/fromTranslation.js"(exports, module) {
    "use strict";
    var fromTranslation = (out, vector) => {
      out[0] = 1;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[5] = 1;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[10] = 1;
      out[11] = 0;
      out[12] = vector[0];
      out[13] = vector[1];
      out[14] = vector[2];
      out[15] = 1;
      return out;
    };
    module.exports = fromTranslation;
  }
});

// node_modules/@jscad/modeling/src/maths/mat4/fromValues.js
var require_fromValues = __commonJS({
  "node_modules/@jscad/modeling/src/maths/mat4/fromValues.js"(exports, module) {
    "use strict";
    var create = require_create();
    var fromValues = (m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) => {
      const out = create();
      out[0] = m00;
      out[1] = m01;
      out[2] = m02;
      out[3] = m03;
      out[4] = m10;
      out[5] = m11;
      out[6] = m12;
      out[7] = m13;
      out[8] = m20;
      out[9] = m21;
      out[10] = m22;
      out[11] = m23;
      out[12] = m30;
      out[13] = m31;
      out[14] = m32;
      out[15] = m33;
      return out;
    };
    module.exports = fromValues;
  }
});

// node_modules/@jscad/modeling/src/maths/vec3/abs.js
var require_abs = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec3/abs.js"(exports, module) {
    "use strict";
    var abs = (out, vector) => {
      out[0] = Math.abs(vector[0]);
      out[1] = Math.abs(vector[1]);
      out[2] = Math.abs(vector[2]);
      return out;
    };
    module.exports = abs;
  }
});

// node_modules/@jscad/modeling/src/maths/vec3/add.js
var require_add2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec3/add.js"(exports, module) {
    "use strict";
    var add = (out, a, b) => {
      out[0] = a[0] + b[0];
      out[1] = a[1] + b[1];
      out[2] = a[2] + b[2];
      return out;
    };
    module.exports = add;
  }
});

// node_modules/@jscad/modeling/src/maths/vec3/dot.js
var require_dot = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec3/dot.js"(exports, module) {
    "use strict";
    var dot2 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    module.exports = dot2;
  }
});

// node_modules/@jscad/modeling/src/maths/vec3/angle.js
var require_angle = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec3/angle.js"(exports, module) {
    "use strict";
    var dot2 = require_dot();
    var angle = (a, b) => {
      const ax = a[0];
      const ay = a[1];
      const az = a[2];
      const bx = b[0];
      const by = b[1];
      const bz = b[2];
      const mag1 = Math.sqrt(ax * ax + ay * ay + az * az);
      const mag2 = Math.sqrt(bx * bx + by * by + bz * bz);
      const mag = mag1 * mag2;
      const cosine = mag && dot2(a, b) / mag;
      return Math.acos(Math.min(Math.max(cosine, -1), 1));
    };
    module.exports = angle;
  }
});

// node_modules/@jscad/modeling/src/maths/vec3/create.js
var require_create2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec3/create.js"(exports, module) {
    "use strict";
    var create = () => [0, 0, 0];
    module.exports = create;
  }
});

// node_modules/@jscad/modeling/src/maths/vec3/clone.js
var require_clone3 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec3/clone.js"(exports, module) {
    "use strict";
    var create = require_create2();
    var clone = (vector) => {
      const out = create();
      out[0] = vector[0];
      out[1] = vector[1];
      out[2] = vector[2];
      return out;
    };
    module.exports = clone;
  }
});

// node_modules/@jscad/modeling/src/maths/vec3/copy.js
var require_copy2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec3/copy.js"(exports, module) {
    "use strict";
    var copy = (out, vector) => {
      out[0] = vector[0];
      out[1] = vector[1];
      out[2] = vector[2];
      return out;
    };
    module.exports = copy;
  }
});

// node_modules/@jscad/modeling/src/maths/vec3/cross.js
var require_cross = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec3/cross.js"(exports, module) {
    "use strict";
    var cross2 = (out, a, b) => {
      const ax = a[0];
      const ay = a[1];
      const az = a[2];
      const bx = b[0];
      const by = b[1];
      const bz = b[2];
      out[0] = ay * bz - az * by;
      out[1] = az * bx - ax * bz;
      out[2] = ax * by - ay * bx;
      return out;
    };
    module.exports = cross2;
  }
});

// node_modules/@jscad/modeling/src/maths/vec3/distance.js
var require_distance = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec3/distance.js"(exports, module) {
    "use strict";
    var distance = (a, b) => {
      const x = b[0] - a[0];
      const y = b[1] - a[1];
      const z = b[2] - a[2];
      return Math.sqrt(x * x + y * y + z * z);
    };
    module.exports = distance;
  }
});

// node_modules/@jscad/modeling/src/maths/vec3/divide.js
var require_divide = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec3/divide.js"(exports, module) {
    "use strict";
    var divide = (out, a, b) => {
      out[0] = a[0] / b[0];
      out[1] = a[1] / b[1];
      out[2] = a[2] / b[2];
      return out;
    };
    module.exports = divide;
  }
});

// node_modules/@jscad/modeling/src/maths/vec3/equals.js
var require_equals2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec3/equals.js"(exports, module) {
    "use strict";
    var equals = (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
    module.exports = equals;
  }
});

// node_modules/@jscad/modeling/src/maths/vec3/fromScalar.js
var require_fromScalar = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec3/fromScalar.js"(exports, module) {
    "use strict";
    var fromScalar = (out, scalar) => {
      out[0] = scalar;
      out[1] = scalar;
      out[2] = scalar;
      return out;
    };
    module.exports = fromScalar;
  }
});

// node_modules/@jscad/modeling/src/maths/vec3/fromValues.js
var require_fromValues2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec3/fromValues.js"(exports, module) {
    "use strict";
    var create = require_create2();
    var fromValues = (x, y, z) => {
      const out = create();
      out[0] = x;
      out[1] = y;
      out[2] = z;
      return out;
    };
    module.exports = fromValues;
  }
});

// node_modules/@jscad/modeling/src/maths/vec3/fromVec2.js
var require_fromVec2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec3/fromVec2.js"(exports, module) {
    "use strict";
    var fromVector2 = (out, vector, z = 0) => {
      out[0] = vector[0];
      out[1] = vector[1];
      out[2] = z;
      return out;
    };
    module.exports = fromVector2;
  }
});

// node_modules/@jscad/modeling/src/maths/vec3/length.js
var require_length = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec3/length.js"(exports, module) {
    "use strict";
    var length = (vector) => {
      const x = vector[0];
      const y = vector[1];
      const z = vector[2];
      return Math.sqrt(x * x + y * y + z * z);
    };
    module.exports = length;
  }
});

// node_modules/@jscad/modeling/src/maths/vec3/lerp.js
var require_lerp = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec3/lerp.js"(exports, module) {
    "use strict";
    var lerp = (out, a, b, t) => {
      out[0] = a[0] + t * (b[0] - a[0]);
      out[1] = a[1] + t * (b[1] - a[1]);
      out[2] = a[2] + t * (b[2] - a[2]);
      return out;
    };
    module.exports = lerp;
  }
});

// node_modules/@jscad/modeling/src/maths/vec3/max.js
var require_max = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec3/max.js"(exports, module) {
    "use strict";
    var max = (out, a, b) => {
      out[0] = Math.max(a[0], b[0]);
      out[1] = Math.max(a[1], b[1]);
      out[2] = Math.max(a[2], b[2]);
      return out;
    };
    module.exports = max;
  }
});

// node_modules/@jscad/modeling/src/maths/vec3/min.js
var require_min = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec3/min.js"(exports, module) {
    "use strict";
    var min = (out, a, b) => {
      out[0] = Math.min(a[0], b[0]);
      out[1] = Math.min(a[1], b[1]);
      out[2] = Math.min(a[2], b[2]);
      return out;
    };
    module.exports = min;
  }
});

// node_modules/@jscad/modeling/src/maths/vec3/multiply.js
var require_multiply = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec3/multiply.js"(exports, module) {
    "use strict";
    var multiply = (out, a, b) => {
      out[0] = a[0] * b[0];
      out[1] = a[1] * b[1];
      out[2] = a[2] * b[2];
      return out;
    };
    module.exports = multiply;
  }
});

// node_modules/@jscad/modeling/src/maths/vec3/negate.js
var require_negate = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec3/negate.js"(exports, module) {
    "use strict";
    var negate = (out, vector) => {
      out[0] = -vector[0];
      out[1] = -vector[1];
      out[2] = -vector[2];
      return out;
    };
    module.exports = negate;
  }
});

// node_modules/@jscad/modeling/src/maths/vec3/normalize.js
var require_normalize = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec3/normalize.js"(exports, module) {
    "use strict";
    var normalize = (out, vector) => {
      const x = vector[0];
      const y = vector[1];
      const z = vector[2];
      let len = x * x + y * y + z * z;
      if (len > 0) {
        len = 1 / Math.sqrt(len);
      }
      out[0] = x * len;
      out[1] = y * len;
      out[2] = z * len;
      return out;
    };
    module.exports = normalize;
  }
});

// node_modules/@jscad/modeling/src/maths/vec3/orthogonal.js
var require_orthogonal = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec3/orthogonal.js"(exports, module) {
    "use strict";
    var abs = require_abs();
    var create = require_create2();
    var cross2 = require_cross();
    var orthogonal = (out, vector) => {
      const bV = abs(create(), vector);
      const b0 = 0 + (bV[0] < bV[1] && bV[0] < bV[2]);
      const b1 = 0 + (bV[1] <= bV[0] && bV[1] < bV[2]);
      const b2 = 0 + (bV[2] <= bV[0] && bV[2] <= bV[1]);
      return cross2(out, vector, [b0, b1, b2]);
    };
    module.exports = orthogonal;
  }
});

// node_modules/@jscad/modeling/src/maths/vec3/rotateX.js
var require_rotateX = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec3/rotateX.js"(exports, module) {
    "use strict";
    var rotateX3 = (out, vector, origin, radians) => {
      const p = [];
      const r = [];
      p[0] = vector[0] - origin[0];
      p[1] = vector[1] - origin[1];
      p[2] = vector[2] - origin[2];
      r[0] = p[0];
      r[1] = p[1] * Math.cos(radians) - p[2] * Math.sin(radians);
      r[2] = p[1] * Math.sin(radians) + p[2] * Math.cos(radians);
      out[0] = r[0] + origin[0];
      out[1] = r[1] + origin[1];
      out[2] = r[2] + origin[2];
      return out;
    };
    module.exports = rotateX3;
  }
});

// node_modules/@jscad/modeling/src/maths/vec3/rotateY.js
var require_rotateY = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec3/rotateY.js"(exports, module) {
    "use strict";
    var rotateY = (out, vector, origin, radians) => {
      const p = [];
      const r = [];
      p[0] = vector[0] - origin[0];
      p[1] = vector[1] - origin[1];
      p[2] = vector[2] - origin[2];
      r[0] = p[2] * Math.sin(radians) + p[0] * Math.cos(radians);
      r[1] = p[1];
      r[2] = p[2] * Math.cos(radians) - p[0] * Math.sin(radians);
      out[0] = r[0] + origin[0];
      out[1] = r[1] + origin[1];
      out[2] = r[2] + origin[2];
      return out;
    };
    module.exports = rotateY;
  }
});

// node_modules/@jscad/modeling/src/maths/vec3/rotateZ.js
var require_rotateZ = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec3/rotateZ.js"(exports, module) {
    "use strict";
    var rotateZ3 = (out, vector, origin, radians) => {
      const p = [];
      const r = [];
      p[0] = vector[0] - origin[0];
      p[1] = vector[1] - origin[1];
      r[0] = p[0] * Math.cos(radians) - p[1] * Math.sin(radians);
      r[1] = p[0] * Math.sin(radians) + p[1] * Math.cos(radians);
      out[0] = r[0] + origin[0];
      out[1] = r[1] + origin[1];
      out[2] = vector[2];
      return out;
    };
    module.exports = rotateZ3;
  }
});

// node_modules/@jscad/modeling/src/maths/vec3/scale.js
var require_scale = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec3/scale.js"(exports, module) {
    "use strict";
    var scale = (out, vector, amount) => {
      out[0] = vector[0] * amount;
      out[1] = vector[1] * amount;
      out[2] = vector[2] * amount;
      return out;
    };
    module.exports = scale;
  }
});

// node_modules/@jscad/modeling/src/maths/vec3/snap.js
var require_snap = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec3/snap.js"(exports, module) {
    "use strict";
    var snap = (out, vector, epsilon) => {
      out[0] = Math.round(vector[0] / epsilon) * epsilon + 0;
      out[1] = Math.round(vector[1] / epsilon) * epsilon + 0;
      out[2] = Math.round(vector[2] / epsilon) * epsilon + 0;
      return out;
    };
    module.exports = snap;
  }
});

// node_modules/@jscad/modeling/src/maths/vec3/squaredDistance.js
var require_squaredDistance = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec3/squaredDistance.js"(exports, module) {
    "use strict";
    var squaredDistance = (a, b) => {
      const x = b[0] - a[0];
      const y = b[1] - a[1];
      const z = b[2] - a[2];
      return x * x + y * y + z * z;
    };
    module.exports = squaredDistance;
  }
});

// node_modules/@jscad/modeling/src/maths/vec3/squaredLength.js
var require_squaredLength = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec3/squaredLength.js"(exports, module) {
    "use strict";
    var squaredLength = (vector) => {
      const x = vector[0];
      const y = vector[1];
      const z = vector[2];
      return x * x + y * y + z * z;
    };
    module.exports = squaredLength;
  }
});

// node_modules/@jscad/modeling/src/maths/vec3/subtract.js
var require_subtract = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec3/subtract.js"(exports, module) {
    "use strict";
    var subtract3 = (out, a, b) => {
      out[0] = a[0] - b[0];
      out[1] = a[1] - b[1];
      out[2] = a[2] - b[2];
      return out;
    };
    module.exports = subtract3;
  }
});

// node_modules/@jscad/modeling/src/maths/vec3/toString.js
var require_toString = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec3/toString.js"(exports, module) {
    "use strict";
    var toString = (vec) => `[${vec[0].toFixed(7)}, ${vec[1].toFixed(7)}, ${vec[2].toFixed(7)}]`;
    module.exports = toString;
  }
});

// node_modules/@jscad/modeling/src/maths/vec3/transform.js
var require_transform = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec3/transform.js"(exports, module) {
    "use strict";
    var transform = (out, vector, matrix) => {
      const x = vector[0];
      const y = vector[1];
      const z = vector[2];
      let w = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15];
      w = w || 1;
      out[0] = (matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12]) / w;
      out[1] = (matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13]) / w;
      out[2] = (matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]) / w;
      return out;
    };
    module.exports = transform;
  }
});

// node_modules/@jscad/modeling/src/maths/vec3/index.js
var require_vec3 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec3/index.js"(exports, module) {
    "use strict";
    module.exports = {
      abs: require_abs(),
      add: require_add2(),
      angle: require_angle(),
      clone: require_clone3(),
      copy: require_copy2(),
      create: require_create2(),
      cross: require_cross(),
      distance: require_distance(),
      divide: require_divide(),
      dot: require_dot(),
      equals: require_equals2(),
      fromScalar: require_fromScalar(),
      fromValues: require_fromValues2(),
      fromVec2: require_fromVec2(),
      length: require_length(),
      lerp: require_lerp(),
      max: require_max(),
      min: require_min(),
      multiply: require_multiply(),
      negate: require_negate(),
      normalize: require_normalize(),
      orthogonal: require_orthogonal(),
      rotateX: require_rotateX(),
      rotateY: require_rotateY(),
      rotateZ: require_rotateZ(),
      scale: require_scale(),
      snap: require_snap(),
      squaredDistance: require_squaredDistance(),
      squaredLength: require_squaredLength(),
      subtract: require_subtract(),
      toString: require_toString(),
      transform: require_transform()
    };
  }
});

// node_modules/@jscad/modeling/src/maths/mat4/fromVectorRotation.js
var require_fromVectorRotation = __commonJS({
  "node_modules/@jscad/modeling/src/maths/mat4/fromVectorRotation.js"(exports, module) {
    "use strict";
    var vec3 = require_vec3();
    var fromRotation = require_fromRotation();
    var fromVectorRotation = (out, source, target) => {
      const sourceNormal = vec3.normalize(vec3.create(), source);
      const targetNormal = vec3.normalize(vec3.create(), target);
      const axis = vec3.cross(vec3.create(), targetNormal, sourceNormal);
      const cosA = vec3.dot(targetNormal, sourceNormal);
      if (cosA === -1) return fromRotation(out, Math.PI, vec3.orthogonal(axis, sourceNormal));
      const k = 1 / (1 + cosA);
      out[0] = axis[0] * axis[0] * k + cosA;
      out[1] = axis[1] * axis[0] * k - axis[2];
      out[2] = axis[2] * axis[0] * k + axis[1];
      out[3] = 0;
      out[4] = axis[0] * axis[1] * k + axis[2];
      out[5] = axis[1] * axis[1] * k + cosA;
      out[6] = axis[2] * axis[1] * k - axis[0];
      out[7] = 0;
      out[8] = axis[0] * axis[2] * k - axis[1];
      out[9] = axis[1] * axis[2] * k + axis[0];
      out[10] = axis[2] * axis[2] * k + cosA;
      out[11] = 0;
      out[12] = 0;
      out[13] = 0;
      out[14] = 0;
      out[15] = 1;
      return out;
    };
    module.exports = fromVectorRotation;
  }
});

// node_modules/@jscad/modeling/src/maths/mat4/fromXRotation.js
var require_fromXRotation = __commonJS({
  "node_modules/@jscad/modeling/src/maths/mat4/fromXRotation.js"(exports, module) {
    "use strict";
    var { sin, cos } = require_trigonometry();
    var fromXRotation = (out, radians) => {
      const s = sin(radians);
      const c = cos(radians);
      out[0] = 1;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[5] = c;
      out[6] = s;
      out[7] = 0;
      out[8] = 0;
      out[9] = -s;
      out[10] = c;
      out[11] = 0;
      out[12] = 0;
      out[13] = 0;
      out[14] = 0;
      out[15] = 1;
      return out;
    };
    module.exports = fromXRotation;
  }
});

// node_modules/@jscad/modeling/src/maths/mat4/fromYRotation.js
var require_fromYRotation = __commonJS({
  "node_modules/@jscad/modeling/src/maths/mat4/fromYRotation.js"(exports, module) {
    "use strict";
    var { sin, cos } = require_trigonometry();
    var fromYRotation = (out, radians) => {
      const s = sin(radians);
      const c = cos(radians);
      out[0] = c;
      out[1] = 0;
      out[2] = -s;
      out[3] = 0;
      out[4] = 0;
      out[5] = 1;
      out[6] = 0;
      out[7] = 0;
      out[8] = s;
      out[9] = 0;
      out[10] = c;
      out[11] = 0;
      out[12] = 0;
      out[13] = 0;
      out[14] = 0;
      out[15] = 1;
      return out;
    };
    module.exports = fromYRotation;
  }
});

// node_modules/@jscad/modeling/src/maths/mat4/fromZRotation.js
var require_fromZRotation = __commonJS({
  "node_modules/@jscad/modeling/src/maths/mat4/fromZRotation.js"(exports, module) {
    "use strict";
    var { sin, cos } = require_trigonometry();
    var fromZRotation = (out, radians) => {
      const s = sin(radians);
      const c = cos(radians);
      out[0] = c;
      out[1] = s;
      out[2] = 0;
      out[3] = 0;
      out[4] = -s;
      out[5] = c;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[10] = 1;
      out[11] = 0;
      out[12] = 0;
      out[13] = 0;
      out[14] = 0;
      out[15] = 1;
      return out;
    };
    module.exports = fromZRotation;
  }
});

// node_modules/@jscad/modeling/src/maths/mat4/isIdentity.js
var require_isIdentity = __commonJS({
  "node_modules/@jscad/modeling/src/maths/mat4/isIdentity.js"(exports, module) {
    "use strict";
    var isIdentity = (matrix) => matrix[0] === 1 && matrix[1] === 0 && matrix[2] === 0 && matrix[3] === 0 && matrix[4] === 0 && matrix[5] === 1 && matrix[6] === 0 && matrix[7] === 0 && matrix[8] === 0 && matrix[9] === 0 && matrix[10] === 1 && matrix[11] === 0 && matrix[12] === 0 && matrix[13] === 0 && matrix[14] === 0 && matrix[15] === 1;
    module.exports = isIdentity;
  }
});

// node_modules/@jscad/modeling/src/maths/mat4/isOnlyTransformScale.js
var require_isOnlyTransformScale = __commonJS({
  "node_modules/@jscad/modeling/src/maths/mat4/isOnlyTransformScale.js"(exports, module) {
    "use strict";
    var isOnlyTransformScale = (matrix) => (
      // TODO check if it is worth the effort to add recognition of 90 deg rotations
      isZero(matrix[1]) && isZero(matrix[2]) && isZero(matrix[3]) && isZero(matrix[4]) && isZero(matrix[6]) && isZero(matrix[7]) && isZero(matrix[8]) && isZero(matrix[9]) && isZero(matrix[11]) && matrix[15] === 1
    );
    var isZero = (num) => Math.abs(num) < Number.EPSILON;
    module.exports = isOnlyTransformScale;
  }
});

// node_modules/@jscad/modeling/src/maths/mat4/isMirroring.js
var require_isMirroring = __commonJS({
  "node_modules/@jscad/modeling/src/maths/mat4/isMirroring.js"(exports, module) {
    "use strict";
    var isMirroring = (matrix) => {
      const x = matrix[4] * matrix[9] - matrix[8] * matrix[5];
      const y = matrix[8] * matrix[1] - matrix[0] * matrix[9];
      const z = matrix[0] * matrix[5] - matrix[4] * matrix[1];
      const d = x * matrix[2] + y * matrix[6] + z * matrix[10];
      return d < 0;
    };
    module.exports = isMirroring;
  }
});

// node_modules/@jscad/modeling/src/maths/mat4/mirrorByPlane.js
var require_mirrorByPlane = __commonJS({
  "node_modules/@jscad/modeling/src/maths/mat4/mirrorByPlane.js"(exports, module) {
    "use strict";
    var mirrorByPlane = (out, plane) => {
      const [nx, ny, nz, w] = plane;
      out[0] = 1 - 2 * nx * nx;
      out[1] = -2 * ny * nx;
      out[2] = -2 * nz * nx;
      out[3] = 0;
      out[4] = -2 * nx * ny;
      out[5] = 1 - 2 * ny * ny;
      out[6] = -2 * nz * ny;
      out[7] = 0;
      out[8] = -2 * nx * nz;
      out[9] = -2 * ny * nz;
      out[10] = 1 - 2 * nz * nz;
      out[11] = 0;
      out[12] = 2 * nx * w;
      out[13] = 2 * ny * w;
      out[14] = 2 * nz * w;
      out[15] = 1;
      return out;
    };
    module.exports = mirrorByPlane;
  }
});

// node_modules/@jscad/modeling/src/maths/mat4/multiply.js
var require_multiply2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/mat4/multiply.js"(exports, module) {
    "use strict";
    var multiply = (out, a, b) => {
      const a00 = a[0];
      const a01 = a[1];
      const a02 = a[2];
      const a03 = a[3];
      const a10 = a[4];
      const a11 = a[5];
      const a12 = a[6];
      const a13 = a[7];
      const a20 = a[8];
      const a21 = a[9];
      const a22 = a[10];
      const a23 = a[11];
      const a30 = a[12];
      const a31 = a[13];
      const a32 = a[14];
      const a33 = a[15];
      let b0 = b[0];
      let b1 = b[1];
      let b2 = b[2];
      let b3 = b[3];
      out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      b0 = b[4];
      b1 = b[5];
      b2 = b[6];
      b3 = b[7];
      out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      b0 = b[8];
      b1 = b[9];
      b2 = b[10];
      b3 = b[11];
      out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      b0 = b[12];
      b1 = b[13];
      b2 = b[14];
      b3 = b[15];
      out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      return out;
    };
    module.exports = multiply;
  }
});

// node_modules/@jscad/modeling/src/maths/mat4/rotate.js
var require_rotate = __commonJS({
  "node_modules/@jscad/modeling/src/maths/mat4/rotate.js"(exports, module) {
    "use strict";
    var { EPS } = require_constants();
    var { sin, cos } = require_trigonometry();
    var copy = require_copy();
    var rotate = (out, matrix, radians, axis) => {
      let [x, y, z] = axis;
      const lengthSquared = x * x + y * y + z * z;
      if (Math.abs(lengthSquared) < EPS) {
        return copy(out, matrix);
      }
      const len = 1 / Math.sqrt(lengthSquared);
      x *= len;
      y *= len;
      z *= len;
      const s = sin(radians);
      const c = cos(radians);
      const t = 1 - c;
      const a00 = matrix[0];
      const a01 = matrix[1];
      const a02 = matrix[2];
      const a03 = matrix[3];
      const a10 = matrix[4];
      const a11 = matrix[5];
      const a12 = matrix[6];
      const a13 = matrix[7];
      const a20 = matrix[8];
      const a21 = matrix[9];
      const a22 = matrix[10];
      const a23 = matrix[11];
      const b00 = x * x * t + c;
      const b01 = y * x * t + z * s;
      const b02 = z * x * t - y * s;
      const b10 = x * y * t - z * s;
      const b11 = y * y * t + c;
      const b12 = z * y * t + x * s;
      const b20 = x * z * t + y * s;
      const b21 = y * z * t - x * s;
      const b22 = z * z * t + c;
      out[0] = a00 * b00 + a10 * b01 + a20 * b02;
      out[1] = a01 * b00 + a11 * b01 + a21 * b02;
      out[2] = a02 * b00 + a12 * b01 + a22 * b02;
      out[3] = a03 * b00 + a13 * b01 + a23 * b02;
      out[4] = a00 * b10 + a10 * b11 + a20 * b12;
      out[5] = a01 * b10 + a11 * b11 + a21 * b12;
      out[6] = a02 * b10 + a12 * b11 + a22 * b12;
      out[7] = a03 * b10 + a13 * b11 + a23 * b12;
      out[8] = a00 * b20 + a10 * b21 + a20 * b22;
      out[9] = a01 * b20 + a11 * b21 + a21 * b22;
      out[10] = a02 * b20 + a12 * b21 + a22 * b22;
      out[11] = a03 * b20 + a13 * b21 + a23 * b22;
      if (matrix !== out) {
        out[12] = matrix[12];
        out[13] = matrix[13];
        out[14] = matrix[14];
        out[15] = matrix[15];
      }
      return out;
    };
    module.exports = rotate;
  }
});

// node_modules/@jscad/modeling/src/maths/mat4/rotateX.js
var require_rotateX2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/mat4/rotateX.js"(exports, module) {
    "use strict";
    var { sin, cos } = require_trigonometry();
    var rotateX3 = (out, matrix, radians) => {
      const s = sin(radians);
      const c = cos(radians);
      const a10 = matrix[4];
      const a11 = matrix[5];
      const a12 = matrix[6];
      const a13 = matrix[7];
      const a20 = matrix[8];
      const a21 = matrix[9];
      const a22 = matrix[10];
      const a23 = matrix[11];
      if (matrix !== out) {
        out[0] = matrix[0];
        out[1] = matrix[1];
        out[2] = matrix[2];
        out[3] = matrix[3];
        out[12] = matrix[12];
        out[13] = matrix[13];
        out[14] = matrix[14];
        out[15] = matrix[15];
      }
      out[4] = a10 * c + a20 * s;
      out[5] = a11 * c + a21 * s;
      out[6] = a12 * c + a22 * s;
      out[7] = a13 * c + a23 * s;
      out[8] = a20 * c - a10 * s;
      out[9] = a21 * c - a11 * s;
      out[10] = a22 * c - a12 * s;
      out[11] = a23 * c - a13 * s;
      return out;
    };
    module.exports = rotateX3;
  }
});

// node_modules/@jscad/modeling/src/maths/mat4/rotateY.js
var require_rotateY2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/mat4/rotateY.js"(exports, module) {
    "use strict";
    var { sin, cos } = require_trigonometry();
    var rotateY = (out, matrix, radians) => {
      const s = sin(radians);
      const c = cos(radians);
      const a00 = matrix[0];
      const a01 = matrix[1];
      const a02 = matrix[2];
      const a03 = matrix[3];
      const a20 = matrix[8];
      const a21 = matrix[9];
      const a22 = matrix[10];
      const a23 = matrix[11];
      if (matrix !== out) {
        out[4] = matrix[4];
        out[5] = matrix[5];
        out[6] = matrix[6];
        out[7] = matrix[7];
        out[12] = matrix[12];
        out[13] = matrix[13];
        out[14] = matrix[14];
        out[15] = matrix[15];
      }
      out[0] = a00 * c - a20 * s;
      out[1] = a01 * c - a21 * s;
      out[2] = a02 * c - a22 * s;
      out[3] = a03 * c - a23 * s;
      out[8] = a00 * s + a20 * c;
      out[9] = a01 * s + a21 * c;
      out[10] = a02 * s + a22 * c;
      out[11] = a03 * s + a23 * c;
      return out;
    };
    module.exports = rotateY;
  }
});

// node_modules/@jscad/modeling/src/maths/mat4/rotateZ.js
var require_rotateZ2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/mat4/rotateZ.js"(exports, module) {
    "use strict";
    var { sin, cos } = require_trigonometry();
    var rotateZ3 = (out, matrix, radians) => {
      const s = sin(radians);
      const c = cos(radians);
      const a00 = matrix[0];
      const a01 = matrix[1];
      const a02 = matrix[2];
      const a03 = matrix[3];
      const a10 = matrix[4];
      const a11 = matrix[5];
      const a12 = matrix[6];
      const a13 = matrix[7];
      if (matrix !== out) {
        out[8] = matrix[8];
        out[9] = matrix[9];
        out[10] = matrix[10];
        out[11] = matrix[11];
        out[12] = matrix[12];
        out[13] = matrix[13];
        out[14] = matrix[14];
        out[15] = matrix[15];
      }
      out[0] = a00 * c + a10 * s;
      out[1] = a01 * c + a11 * s;
      out[2] = a02 * c + a12 * s;
      out[3] = a03 * c + a13 * s;
      out[4] = a10 * c - a00 * s;
      out[5] = a11 * c - a01 * s;
      out[6] = a12 * c - a02 * s;
      out[7] = a13 * c - a03 * s;
      return out;
    };
    module.exports = rotateZ3;
  }
});

// node_modules/@jscad/modeling/src/maths/mat4/scale.js
var require_scale2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/mat4/scale.js"(exports, module) {
    "use strict";
    var scale = (out, matrix, dimensions) => {
      const x = dimensions[0];
      const y = dimensions[1];
      const z = dimensions[2];
      out[0] = matrix[0] * x;
      out[1] = matrix[1] * x;
      out[2] = matrix[2] * x;
      out[3] = matrix[3] * x;
      out[4] = matrix[4] * y;
      out[5] = matrix[5] * y;
      out[6] = matrix[6] * y;
      out[7] = matrix[7] * y;
      out[8] = matrix[8] * z;
      out[9] = matrix[9] * z;
      out[10] = matrix[10] * z;
      out[11] = matrix[11] * z;
      out[12] = matrix[12];
      out[13] = matrix[13];
      out[14] = matrix[14];
      out[15] = matrix[15];
      return out;
    };
    module.exports = scale;
  }
});

// node_modules/@jscad/modeling/src/maths/mat4/subtract.js
var require_subtract2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/mat4/subtract.js"(exports, module) {
    "use strict";
    var subtract3 = (out, a, b) => {
      out[0] = a[0] - b[0];
      out[1] = a[1] - b[1];
      out[2] = a[2] - b[2];
      out[3] = a[3] - b[3];
      out[4] = a[4] - b[4];
      out[5] = a[5] - b[5];
      out[6] = a[6] - b[6];
      out[7] = a[7] - b[7];
      out[8] = a[8] - b[8];
      out[9] = a[9] - b[9];
      out[10] = a[10] - b[10];
      out[11] = a[11] - b[11];
      out[12] = a[12] - b[12];
      out[13] = a[13] - b[13];
      out[14] = a[14] - b[14];
      out[15] = a[15] - b[15];
      return out;
    };
    module.exports = subtract3;
  }
});

// node_modules/@jscad/modeling/src/maths/mat4/toString.js
var require_toString2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/mat4/toString.js"(exports, module) {
    "use strict";
    var toString = (mat) => mat.map((n) => n.toFixed(7)).toString();
    module.exports = toString;
  }
});

// node_modules/@jscad/modeling/src/maths/mat4/translate.js
var require_translate = __commonJS({
  "node_modules/@jscad/modeling/src/maths/mat4/translate.js"(exports, module) {
    "use strict";
    var translate3 = (out, matrix, offsets) => {
      const x = offsets[0];
      const y = offsets[1];
      const z = offsets[2];
      let a00;
      let a01;
      let a02;
      let a03;
      let a10;
      let a11;
      let a12;
      let a13;
      let a20;
      let a21;
      let a22;
      let a23;
      if (matrix === out) {
        out[12] = matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12];
        out[13] = matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13];
        out[14] = matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14];
        out[15] = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15];
      } else {
        a00 = matrix[0];
        a01 = matrix[1];
        a02 = matrix[2];
        a03 = matrix[3];
        a10 = matrix[4];
        a11 = matrix[5];
        a12 = matrix[6];
        a13 = matrix[7];
        a20 = matrix[8];
        a21 = matrix[9];
        a22 = matrix[10];
        a23 = matrix[11];
        out[0] = a00;
        out[1] = a01;
        out[2] = a02;
        out[3] = a03;
        out[4] = a10;
        out[5] = a11;
        out[6] = a12;
        out[7] = a13;
        out[8] = a20;
        out[9] = a21;
        out[10] = a22;
        out[11] = a23;
        out[12] = a00 * x + a10 * y + a20 * z + matrix[12];
        out[13] = a01 * x + a11 * y + a21 * z + matrix[13];
        out[14] = a02 * x + a12 * y + a22 * z + matrix[14];
        out[15] = a03 * x + a13 * y + a23 * z + matrix[15];
      }
      return out;
    };
    module.exports = translate3;
  }
});

// node_modules/@jscad/modeling/src/maths/mat4/index.js
var require_mat4 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/mat4/index.js"(exports, module) {
    "use strict";
    module.exports = {
      add: require_add(),
      clone: require_clone2(),
      copy: require_copy(),
      create: require_create(),
      invert: require_invert(),
      equals: require_equals(),
      fromRotation: require_fromRotation(),
      fromScaling: require_fromScaling(),
      fromTaitBryanRotation: require_fromTaitBryanRotation(),
      fromTranslation: require_fromTranslation(),
      fromValues: require_fromValues(),
      fromVectorRotation: require_fromVectorRotation(),
      fromXRotation: require_fromXRotation(),
      fromYRotation: require_fromYRotation(),
      fromZRotation: require_fromZRotation(),
      identity: require_identity(),
      isIdentity: require_isIdentity(),
      isOnlyTransformScale: require_isOnlyTransformScale(),
      isMirroring: require_isMirroring(),
      mirrorByPlane: require_mirrorByPlane(),
      multiply: require_multiply2(),
      rotate: require_rotate(),
      rotateX: require_rotateX2(),
      rotateY: require_rotateY2(),
      rotateZ: require_rotateZ2(),
      scale: require_scale2(),
      subtract: require_subtract2(),
      toString: require_toString2(),
      translate: require_translate()
    };
  }
});

// node_modules/@jscad/modeling/src/geometries/geom2/create.js
var require_create3 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/geom2/create.js"(exports, module) {
    "use strict";
    var mat4 = require_mat4();
    var create = (sides) => {
      if (sides === void 0) {
        sides = [];
      }
      return {
        sides,
        transforms: mat4.create()
      };
    };
    module.exports = create;
  }
});

// node_modules/@jscad/modeling/src/maths/vec2/abs.js
var require_abs2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec2/abs.js"(exports, module) {
    "use strict";
    var abs = (out, vector) => {
      out[0] = Math.abs(vector[0]);
      out[1] = Math.abs(vector[1]);
      return out;
    };
    module.exports = abs;
  }
});

// node_modules/@jscad/modeling/src/maths/vec2/add.js
var require_add3 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec2/add.js"(exports, module) {
    "use strict";
    var add = (out, a, b) => {
      out[0] = a[0] + b[0];
      out[1] = a[1] + b[1];
      return out;
    };
    module.exports = add;
  }
});

// node_modules/@jscad/modeling/src/maths/vec2/angleRadians.js
var require_angleRadians = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec2/angleRadians.js"(exports, module) {
    "use strict";
    var angleRadians = (vector) => Math.atan2(vector[1], vector[0]);
    module.exports = angleRadians;
  }
});

// node_modules/@jscad/modeling/src/maths/vec2/angle.js
var require_angle2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec2/angle.js"(exports, module) {
    "use strict";
    module.exports = require_angleRadians();
  }
});

// node_modules/@jscad/modeling/src/maths/vec2/angleDegrees.js
var require_angleDegrees = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec2/angleDegrees.js"(exports, module) {
    "use strict";
    var angleRadians = require_angleRadians();
    var angleDegrees = (vector) => angleRadians(vector) * 57.29577951308232;
    module.exports = angleDegrees;
  }
});

// node_modules/@jscad/modeling/src/maths/vec2/create.js
var require_create4 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec2/create.js"(exports, module) {
    "use strict";
    var create = () => [0, 0];
    module.exports = create;
  }
});

// node_modules/@jscad/modeling/src/maths/vec2/clone.js
var require_clone4 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec2/clone.js"(exports, module) {
    "use strict";
    var create = require_create4();
    var clone = (vector) => {
      const out = create();
      out[0] = vector[0];
      out[1] = vector[1];
      return out;
    };
    module.exports = clone;
  }
});

// node_modules/@jscad/modeling/src/maths/vec2/copy.js
var require_copy3 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec2/copy.js"(exports, module) {
    "use strict";
    var copy = (out, vector) => {
      out[0] = vector[0];
      out[1] = vector[1];
      return out;
    };
    module.exports = copy;
  }
});

// node_modules/@jscad/modeling/src/maths/vec2/cross.js
var require_cross2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec2/cross.js"(exports, module) {
    "use strict";
    var cross2 = (out, a, b) => {
      out[0] = 0;
      out[1] = 0;
      out[2] = a[0] * b[1] - a[1] * b[0];
      return out;
    };
    module.exports = cross2;
  }
});

// node_modules/@jscad/modeling/src/maths/vec2/distance.js
var require_distance2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec2/distance.js"(exports, module) {
    "use strict";
    var distance = (a, b) => {
      const x = b[0] - a[0];
      const y = b[1] - a[1];
      return Math.sqrt(x * x + y * y);
    };
    module.exports = distance;
  }
});

// node_modules/@jscad/modeling/src/maths/vec2/divide.js
var require_divide2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec2/divide.js"(exports, module) {
    "use strict";
    var divide = (out, a, b) => {
      out[0] = a[0] / b[0];
      out[1] = a[1] / b[1];
      return out;
    };
    module.exports = divide;
  }
});

// node_modules/@jscad/modeling/src/maths/vec2/dot.js
var require_dot2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec2/dot.js"(exports, module) {
    "use strict";
    var dot2 = (a, b) => a[0] * b[0] + a[1] * b[1];
    module.exports = dot2;
  }
});

// node_modules/@jscad/modeling/src/maths/vec2/equals.js
var require_equals3 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec2/equals.js"(exports, module) {
    "use strict";
    var equals = (a, b) => a[0] === b[0] && a[1] === b[1];
    module.exports = equals;
  }
});

// node_modules/@jscad/modeling/src/maths/vec2/fromAngleRadians.js
var require_fromAngleRadians = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec2/fromAngleRadians.js"(exports, module) {
    "use strict";
    var { sin, cos } = require_trigonometry();
    var fromAngleRadians = (out, radians) => {
      out[0] = cos(radians);
      out[1] = sin(radians);
      return out;
    };
    module.exports = fromAngleRadians;
  }
});

// node_modules/@jscad/modeling/src/maths/vec2/fromAngleDegrees.js
var require_fromAngleDegrees = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec2/fromAngleDegrees.js"(exports, module) {
    "use strict";
    var fromAngleRadians = require_fromAngleRadians();
    var fromAngleDegrees = (out, degrees) => fromAngleRadians(out, degrees * 0.017453292519943295);
    module.exports = fromAngleDegrees;
  }
});

// node_modules/@jscad/modeling/src/maths/vec2/fromScalar.js
var require_fromScalar2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec2/fromScalar.js"(exports, module) {
    "use strict";
    var fromScalar = (out, scalar) => {
      out[0] = scalar;
      out[1] = scalar;
      return out;
    };
    module.exports = fromScalar;
  }
});

// node_modules/@jscad/modeling/src/maths/vec2/fromValues.js
var require_fromValues3 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec2/fromValues.js"(exports, module) {
    "use strict";
    var create = require_create4();
    var fromValues = (x, y) => {
      const out = create();
      out[0] = x;
      out[1] = y;
      return out;
    };
    module.exports = fromValues;
  }
});

// node_modules/@jscad/modeling/src/maths/vec2/length.js
var require_length2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec2/length.js"(exports, module) {
    "use strict";
    var length = (vector) => Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
    module.exports = length;
  }
});

// node_modules/@jscad/modeling/src/maths/vec2/lerp.js
var require_lerp2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec2/lerp.js"(exports, module) {
    "use strict";
    var lerp = (out, a, b, t) => {
      const ax = a[0];
      const ay = a[1];
      out[0] = ax + t * (b[0] - ax);
      out[1] = ay + t * (b[1] - ay);
      return out;
    };
    module.exports = lerp;
  }
});

// node_modules/@jscad/modeling/src/maths/vec2/max.js
var require_max2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec2/max.js"(exports, module) {
    "use strict";
    var max = (out, a, b) => {
      out[0] = Math.max(a[0], b[0]);
      out[1] = Math.max(a[1], b[1]);
      return out;
    };
    module.exports = max;
  }
});

// node_modules/@jscad/modeling/src/maths/vec2/min.js
var require_min2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec2/min.js"(exports, module) {
    "use strict";
    var min = (out, a, b) => {
      out[0] = Math.min(a[0], b[0]);
      out[1] = Math.min(a[1], b[1]);
      return out;
    };
    module.exports = min;
  }
});

// node_modules/@jscad/modeling/src/maths/vec2/multiply.js
var require_multiply3 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec2/multiply.js"(exports, module) {
    "use strict";
    var multiply = (out, a, b) => {
      out[0] = a[0] * b[0];
      out[1] = a[1] * b[1];
      return out;
    };
    module.exports = multiply;
  }
});

// node_modules/@jscad/modeling/src/maths/vec2/negate.js
var require_negate2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec2/negate.js"(exports, module) {
    "use strict";
    var negate = (out, vector) => {
      out[0] = -vector[0];
      out[1] = -vector[1];
      return out;
    };
    module.exports = negate;
  }
});

// node_modules/@jscad/modeling/src/maths/vec2/rotate.js
var require_rotate2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec2/rotate.js"(exports, module) {
    "use strict";
    var rotate = (out, vector, origin, radians) => {
      const x = vector[0] - origin[0];
      const y = vector[1] - origin[1];
      const c = Math.cos(radians);
      const s = Math.sin(radians);
      out[0] = x * c - y * s + origin[0];
      out[1] = x * s + y * c + origin[1];
      return out;
    };
    module.exports = rotate;
  }
});

// node_modules/@jscad/modeling/src/maths/vec2/normal.js
var require_normal = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec2/normal.js"(exports, module) {
    "use strict";
    var { TAU } = require_constants();
    var create = require_create4();
    var rotate = require_rotate2();
    var normal = (out, vector) => rotate(out, vector, create(), TAU / 4);
    module.exports = normal;
  }
});

// node_modules/@jscad/modeling/src/maths/vec2/normalize.js
var require_normalize2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec2/normalize.js"(exports, module) {
    "use strict";
    var normalize = (out, vector) => {
      const x = vector[0];
      const y = vector[1];
      let len = x * x + y * y;
      if (len > 0) {
        len = 1 / Math.sqrt(len);
      }
      out[0] = x * len;
      out[1] = y * len;
      return out;
    };
    module.exports = normalize;
  }
});

// node_modules/@jscad/modeling/src/maths/vec2/scale.js
var require_scale3 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec2/scale.js"(exports, module) {
    "use strict";
    var scale = (out, vector, amount) => {
      out[0] = vector[0] * amount;
      out[1] = vector[1] * amount;
      return out;
    };
    module.exports = scale;
  }
});

// node_modules/@jscad/modeling/src/maths/vec2/snap.js
var require_snap2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec2/snap.js"(exports, module) {
    "use strict";
    var snap = (out, vector, epsilon) => {
      out[0] = Math.round(vector[0] / epsilon) * epsilon + 0;
      out[1] = Math.round(vector[1] / epsilon) * epsilon + 0;
      return out;
    };
    module.exports = snap;
  }
});

// node_modules/@jscad/modeling/src/maths/vec2/squaredDistance.js
var require_squaredDistance2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec2/squaredDistance.js"(exports, module) {
    "use strict";
    var squaredDistance = (a, b) => {
      const x = b[0] - a[0];
      const y = b[1] - a[1];
      return x * x + y * y;
    };
    module.exports = squaredDistance;
  }
});

// node_modules/@jscad/modeling/src/maths/vec2/squaredLength.js
var require_squaredLength2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec2/squaredLength.js"(exports, module) {
    "use strict";
    var squaredLength = (vector) => {
      const x = vector[0];
      const y = vector[1];
      return x * x + y * y;
    };
    module.exports = squaredLength;
  }
});

// node_modules/@jscad/modeling/src/maths/vec2/subtract.js
var require_subtract3 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec2/subtract.js"(exports, module) {
    "use strict";
    var subtract3 = (out, a, b) => {
      out[0] = a[0] - b[0];
      out[1] = a[1] - b[1];
      return out;
    };
    module.exports = subtract3;
  }
});

// node_modules/@jscad/modeling/src/maths/vec2/toString.js
var require_toString3 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec2/toString.js"(exports, module) {
    "use strict";
    var toString = (vector) => `[${vector[0].toFixed(7)}, ${vector[1].toFixed(7)}]`;
    module.exports = toString;
  }
});

// node_modules/@jscad/modeling/src/maths/vec2/transform.js
var require_transform2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec2/transform.js"(exports, module) {
    "use strict";
    var transform = (out, vector, matrix) => {
      const x = vector[0];
      const y = vector[1];
      out[0] = matrix[0] * x + matrix[4] * y + matrix[12];
      out[1] = matrix[1] * x + matrix[5] * y + matrix[13];
      return out;
    };
    module.exports = transform;
  }
});

// node_modules/@jscad/modeling/src/maths/vec2/index.js
var require_vec2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec2/index.js"(exports, module) {
    "use strict";
    module.exports = {
      abs: require_abs2(),
      add: require_add3(),
      angle: require_angle2(),
      angleDegrees: require_angleDegrees(),
      angleRadians: require_angleRadians(),
      clone: require_clone4(),
      copy: require_copy3(),
      create: require_create4(),
      cross: require_cross2(),
      distance: require_distance2(),
      divide: require_divide2(),
      dot: require_dot2(),
      equals: require_equals3(),
      fromAngleDegrees: require_fromAngleDegrees(),
      fromAngleRadians: require_fromAngleRadians(),
      fromScalar: require_fromScalar2(),
      fromValues: require_fromValues3(),
      length: require_length2(),
      lerp: require_lerp2(),
      max: require_max2(),
      min: require_min2(),
      multiply: require_multiply3(),
      negate: require_negate2(),
      normal: require_normal(),
      normalize: require_normalize2(),
      rotate: require_rotate2(),
      scale: require_scale3(),
      snap: require_snap2(),
      squaredDistance: require_squaredDistance2(),
      squaredLength: require_squaredLength2(),
      subtract: require_subtract3(),
      toString: require_toString3(),
      transform: require_transform2()
    };
  }
});

// node_modules/@jscad/modeling/src/geometries/geom2/fromPoints.js
var require_fromPoints = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/geom2/fromPoints.js"(exports, module) {
    "use strict";
    var vec2 = require_vec2();
    var create = require_create3();
    var fromPoints = (points) => {
      if (!Array.isArray(points)) {
        throw new Error("the given points must be an array");
      }
      let length = points.length;
      if (length < 3) {
        throw new Error("the given points must define a closed geometry with three or more points");
      }
      if (vec2.equals(points[0], points[length - 1])) --length;
      const sides = [];
      let prevpoint = points[length - 1];
      for (let i = 0; i < length; i++) {
        const point = points[i];
        sides.push([vec2.clone(prevpoint), vec2.clone(point)]);
        prevpoint = point;
      }
      return create(sides);
    };
    module.exports = fromPoints;
  }
});

// node_modules/@jscad/modeling/src/geometries/geom2/fromCompactBinary.js
var require_fromCompactBinary = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/geom2/fromCompactBinary.js"(exports, module) {
    "use strict";
    var mat4 = require_mat4();
    var vec2 = require_vec2();
    var create = require_create3();
    var fromCompactBinary = (data) => {
      if (data[0] !== 0) throw new Error("invalid compact binary data");
      const created = create();
      created.transforms = mat4.clone(data.slice(1, 17));
      for (let i = 21; i < data.length; i += 4) {
        const point0 = vec2.fromValues(data[i + 0], data[i + 1]);
        const point1 = vec2.fromValues(data[i + 2], data[i + 3]);
        created.sides.push([point0, point1]);
      }
      if (data[17] >= 0) {
        created.color = [data[17], data[18], data[19], data[20]];
      }
      return created;
    };
    module.exports = fromCompactBinary;
  }
});

// node_modules/@jscad/modeling/src/geometries/geom2/isA.js
var require_isA = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/geom2/isA.js"(exports, module) {
    "use strict";
    var isA = (object) => {
      if (object && typeof object === "object") {
        if ("sides" in object && "transforms" in object) {
          if (Array.isArray(object.sides) && "length" in object.transforms) {
            return true;
          }
        }
      }
      return false;
    };
    module.exports = isA;
  }
});

// node_modules/@jscad/modeling/src/geometries/geom2/applyTransforms.js
var require_applyTransforms = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/geom2/applyTransforms.js"(exports, module) {
    "use strict";
    var mat4 = require_mat4();
    var vec2 = require_vec2();
    var applyTransforms = (geometry) => {
      if (mat4.isIdentity(geometry.transforms)) return geometry;
      geometry.sides = geometry.sides.map((side) => {
        const p0 = vec2.transform(vec2.create(), side[0], geometry.transforms);
        const p1 = vec2.transform(vec2.create(), side[1], geometry.transforms);
        return [p0, p1];
      });
      geometry.transforms = mat4.create();
      return geometry;
    };
    module.exports = applyTransforms;
  }
});

// node_modules/@jscad/modeling/src/geometries/geom2/toSides.js
var require_toSides = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/geom2/toSides.js"(exports, module) {
    "use strict";
    var applyTransforms = require_applyTransforms();
    var toSides = (geometry) => applyTransforms(geometry).sides;
    module.exports = toSides;
  }
});

// node_modules/@jscad/modeling/src/geometries/geom2/reverse.js
var require_reverse = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/geom2/reverse.js"(exports, module) {
    "use strict";
    var create = require_create3();
    var toSides = require_toSides();
    var reverse = (geometry) => {
      const oldsides = toSides(geometry);
      const newsides = oldsides.map((side) => [side[1], side[0]]);
      newsides.reverse();
      return create(newsides);
    };
    module.exports = reverse;
  }
});

// node_modules/@jscad/modeling/src/geometries/geom2/toOutlines.js
var require_toOutlines = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/geom2/toOutlines.js"(exports, module) {
    "use strict";
    var vec2 = require_vec2();
    var toSides = require_toSides();
    var toSharedVertices = (sides) => {
      const unique = /* @__PURE__ */ new Map();
      const getUniqueVertex = (vertex) => {
        const key = vertex.toString();
        if (unique.has(key)) {
          return unique.get(key);
        } else {
          unique.set(key, vertex);
          return vertex;
        }
      };
      return sides.map((side) => side.map(getUniqueVertex));
    };
    var toVertexMap = (sides) => {
      const vertexMap = /* @__PURE__ */ new Map();
      const edges = toSharedVertices(sides);
      edges.forEach((edge) => {
        if (vertexMap.has(edge[0])) {
          vertexMap.get(edge[0]).push(edge);
        } else {
          vertexMap.set(edge[0], [edge]);
        }
      });
      return vertexMap;
    };
    var toOutlines = (geometry) => {
      const vertexMap = toVertexMap(toSides(geometry));
      const outlines = [];
      while (true) {
        let startSide;
        for (const [vertex, edges] of vertexMap) {
          startSide = edges.shift();
          if (!startSide) {
            vertexMap.delete(vertex);
            continue;
          }
          break;
        }
        if (startSide === void 0) break;
        const connectedVertexPoints = [];
        const startVertex = startSide[0];
        while (true) {
          connectedVertexPoints.push(startSide[0]);
          const nextVertex = startSide[1];
          if (nextVertex === startVertex) break;
          const nextPossibleSides = vertexMap.get(nextVertex);
          if (!nextPossibleSides) {
            throw new Error(`geometry is not closed at vertex ${nextVertex}`);
          }
          const nextSide = popNextSide(startSide, nextPossibleSides);
          if (nextPossibleSides.length === 0) {
            vertexMap.delete(nextVertex);
          }
          startSide = nextSide;
        }
        if (connectedVertexPoints.length > 0) {
          connectedVertexPoints.push(connectedVertexPoints.shift());
        }
        outlines.push(connectedVertexPoints);
      }
      vertexMap.clear();
      return outlines;
    };
    var popNextSide = (startSide, nextSides) => {
      if (nextSides.length === 1) {
        return nextSides.pop();
      }
      const v0 = vec2.create();
      const startAngle = vec2.angleDegrees(vec2.subtract(v0, startSide[1], startSide[0]));
      let bestAngle;
      let bestIndex;
      nextSides.forEach((nextSide2, index) => {
        const nextAngle = vec2.angleDegrees(vec2.subtract(v0, nextSide2[1], nextSide2[0]));
        let angle = nextAngle - startAngle;
        if (angle < -180) angle += 360;
        if (angle >= 180) angle -= 360;
        if (bestIndex === void 0 || angle > bestAngle) {
          bestIndex = index;
          bestAngle = angle;
        }
      });
      const nextSide = nextSides[bestIndex];
      nextSides.splice(bestIndex, 1);
      return nextSide;
    };
    module.exports = toOutlines;
  }
});

// node_modules/@jscad/modeling/src/geometries/geom2/toPoints.js
var require_toPoints = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/geom2/toPoints.js"(exports, module) {
    "use strict";
    var toSides = require_toSides();
    var toPoints = (geometry) => {
      const sides = toSides(geometry);
      const points = sides.map((side) => side[0]);
      if (points.length > 0) {
        points.push(points.shift());
      }
      return points;
    };
    module.exports = toPoints;
  }
});

// node_modules/@jscad/modeling/src/geometries/geom2/toString.js
var require_toString4 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/geom2/toString.js"(exports, module) {
    "use strict";
    var vec2 = require_vec2();
    var toSides = require_toSides();
    var toString = (geometry) => {
      const sides = toSides(geometry);
      let result = "geom2 (" + sides.length + " sides):\n[\n";
      sides.forEach((side) => {
        result += "  [" + vec2.toString(side[0]) + ", " + vec2.toString(side[1]) + "]\n";
      });
      result += "]\n";
      return result;
    };
    module.exports = toString;
  }
});

// node_modules/@jscad/modeling/src/geometries/geom2/toCompactBinary.js
var require_toCompactBinary = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/geom2/toCompactBinary.js"(exports, module) {
    "use strict";
    var toCompactBinary = (geometry) => {
      const sides = geometry.sides;
      const transforms = geometry.transforms;
      let color = [-1, -1, -1, -1];
      if (geometry.color) color = geometry.color;
      const compacted = new Float32Array(1 + 16 + 4 + sides.length * 4);
      compacted[0] = 0;
      compacted[1] = transforms[0];
      compacted[2] = transforms[1];
      compacted[3] = transforms[2];
      compacted[4] = transforms[3];
      compacted[5] = transforms[4];
      compacted[6] = transforms[5];
      compacted[7] = transforms[6];
      compacted[8] = transforms[7];
      compacted[9] = transforms[8];
      compacted[10] = transforms[9];
      compacted[11] = transforms[10];
      compacted[12] = transforms[11];
      compacted[13] = transforms[12];
      compacted[14] = transforms[13];
      compacted[15] = transforms[14];
      compacted[16] = transforms[15];
      compacted[17] = color[0];
      compacted[18] = color[1];
      compacted[19] = color[2];
      compacted[20] = color[3];
      for (let i = 0; i < sides.length; i++) {
        const ci = i * 4 + 21;
        const point0 = sides[i][0];
        const point1 = sides[i][1];
        compacted[ci + 0] = point0[0];
        compacted[ci + 1] = point0[1];
        compacted[ci + 2] = point1[0];
        compacted[ci + 3] = point1[1];
      }
      return compacted;
    };
    module.exports = toCompactBinary;
  }
});

// node_modules/@jscad/modeling/src/geometries/geom2/transform.js
var require_transform3 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/geom2/transform.js"(exports, module) {
    "use strict";
    var mat4 = require_mat4();
    var reverse = require_reverse();
    var transform = (matrix, geometry) => {
      const transforms = mat4.multiply(mat4.create(), matrix, geometry.transforms);
      const transformed = Object.assign({}, geometry, { transforms });
      if (matrix[0] * matrix[5] - matrix[4] * matrix[1] < 0) {
        return reverse(transformed);
      }
      return transformed;
    };
    module.exports = transform;
  }
});

// node_modules/@jscad/modeling/src/geometries/geom2/validate.js
var require_validate = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/geom2/validate.js"(exports, module) {
    "use strict";
    var vec2 = require_vec2();
    var isA = require_isA();
    var toOutlines = require_toOutlines();
    var validate = (object) => {
      if (!isA(object)) {
        throw new Error("invalid geom2 structure");
      }
      toOutlines(object);
      object.sides.forEach((side) => {
        if (vec2.equals(side[0], side[1])) {
          throw new Error(`geom2 self-edge ${side[0]}`);
        }
      });
      if (!object.transforms.every(Number.isFinite)) {
        throw new Error(`geom2 invalid transforms ${object.transforms}`);
      }
    };
    module.exports = validate;
  }
});

// node_modules/@jscad/modeling/src/geometries/geom2/index.js
var require_geom2 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/geom2/index.js"(exports, module) {
    "use strict";
    module.exports = {
      clone: require_clone(),
      create: require_create3(),
      fromPoints: require_fromPoints(),
      fromCompactBinary: require_fromCompactBinary(),
      isA: require_isA(),
      reverse: require_reverse(),
      toOutlines: require_toOutlines(),
      toPoints: require_toPoints(),
      toSides: require_toSides(),
      toString: require_toString4(),
      toCompactBinary: require_toCompactBinary(),
      transform: require_transform3(),
      validate: require_validate()
    };
  }
});

// node_modules/@jscad/modeling/src/geometries/geom3/clone.js
var require_clone5 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/geom3/clone.js"(exports, module) {
    "use strict";
    var clone = (geometry) => Object.assign({}, geometry);
    module.exports = clone;
  }
});

// node_modules/@jscad/modeling/src/geometries/geom3/create.js
var require_create5 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/geom3/create.js"(exports, module) {
    "use strict";
    var mat4 = require_mat4();
    var create = (polygons) => {
      if (polygons === void 0) {
        polygons = [];
      }
      return {
        polygons,
        transforms: mat4.create()
      };
    };
    module.exports = create;
  }
});

// node_modules/@jscad/modeling/src/operations/hulls/quickhull/point-line-distance.js
var require_point_line_distance = __commonJS({
  "node_modules/@jscad/modeling/src/operations/hulls/quickhull/point-line-distance.js"(exports, module) {
    "use strict";
    var cross2 = require_cross();
    var subtract3 = require_subtract();
    var squaredLength = require_squaredLength();
    var distanceSquared = (p, a, b) => {
      const ab = [];
      const ap = [];
      const cr = [];
      subtract3(ab, b, a);
      subtract3(ap, p, a);
      const area = squaredLength(cross2(cr, ap, ab));
      const s = squaredLength(ab);
      if (s === 0) {
        throw Error("a and b are the same point");
      }
      return area / s;
    };
    var pointLineDistance = (point, a, b) => Math.sqrt(distanceSquared(point, a, b));
    module.exports = pointLineDistance;
  }
});

// node_modules/@jscad/modeling/src/operations/hulls/quickhull/get-plane-normal.js
var require_get_plane_normal = __commonJS({
  "node_modules/@jscad/modeling/src/operations/hulls/quickhull/get-plane-normal.js"(exports, module) {
    "use strict";
    var cross2 = require_cross();
    var normalize = require_normalize();
    var subtract3 = require_subtract();
    var planeNormal = (out, point1, point2, point3) => {
      const tmp = [0, 0, 0];
      subtract3(out, point1, point2);
      subtract3(tmp, point2, point3);
      cross2(out, out, tmp);
      return normalize(out, out);
    };
    module.exports = planeNormal;
  }
});

// node_modules/@jscad/modeling/src/operations/hulls/quickhull/VertexList.js
var require_VertexList = __commonJS({
  "node_modules/@jscad/modeling/src/operations/hulls/quickhull/VertexList.js"(exports, module) {
    "use strict";
    var VertexList = class {
      constructor() {
        this.head = null;
        this.tail = null;
      }
      clear() {
        this.head = this.tail = null;
      }
      /**
       * Inserts a `node` before `target`, it's assumed that
       * `target` belongs to this doubly linked list
       *
       * @param {*} target
       * @param {*} node
       */
      insertBefore(target, node) {
        node.prev = target.prev;
        node.next = target;
        if (!node.prev) {
          this.head = node;
        } else {
          node.prev.next = node;
        }
        target.prev = node;
      }
      /**
       * Inserts a `node` after `target`, it's assumed that
       * `target` belongs to this doubly linked list
       *
       * @param {Vertex} target
       * @param {Vertex} node
       */
      insertAfter(target, node) {
        node.prev = target;
        node.next = target.next;
        if (!node.next) {
          this.tail = node;
        } else {
          node.next.prev = node;
        }
        target.next = node;
      }
      /**
       * Appends a `node` to the end of this doubly linked list
       * Note: `node.next` will be unlinked from `node`
       * Note: if `node` is part of another linked list call `addAll` instead
       *
       * @param {*} node
       */
      add(node) {
        if (!this.head) {
          this.head = node;
        } else {
          this.tail.next = node;
        }
        node.prev = this.tail;
        node.next = null;
        this.tail = node;
      }
      /**
       * Appends a chain of nodes where `node` is the head,
       * the difference with `add` is that it correctly sets the position
       * of the node list `tail` property
       *
       * @param {*} node
       */
      addAll(node) {
        if (!this.head) {
          this.head = node;
        } else {
          this.tail.next = node;
        }
        node.prev = this.tail;
        while (node.next) {
          node = node.next;
        }
        this.tail = node;
      }
      /**
       * Deletes a `node` from this linked list, it's assumed that `node` is a
       * member of this linked list
       *
       * @param {*} node
       */
      remove(node) {
        if (!node.prev) {
          this.head = node.next;
        } else {
          node.prev.next = node.next;
        }
        if (!node.next) {
          this.tail = node.prev;
        } else {
          node.next.prev = node.prev;
        }
      }
      /**
       * Removes a chain of nodes whose head is `a` and whose tail is `b`,
       * it's assumed that `a` and `b` belong to this list and also that `a`
       * comes before `b` in the linked list
       *
       * @param {*} a
       * @param {*} b
       */
      removeChain(a, b) {
        if (!a.prev) {
          this.head = b.next;
        } else {
          a.prev.next = b.next;
        }
        if (!b.next) {
          this.tail = a.prev;
        } else {
          b.next.prev = a.prev;
        }
      }
      first() {
        return this.head;
      }
      isEmpty() {
        return !this.head;
      }
    };
    module.exports = VertexList;
  }
});

// node_modules/@jscad/modeling/src/operations/hulls/quickhull/Vertex.js
var require_Vertex = __commonJS({
  "node_modules/@jscad/modeling/src/operations/hulls/quickhull/Vertex.js"(exports, module) {
    "use strict";
    var Vertex = class {
      constructor(point, index) {
        this.point = point;
        this.index = index;
        this.next = null;
        this.prev = null;
        this.face = null;
      }
    };
    module.exports = Vertex;
  }
});

// node_modules/@jscad/modeling/src/operations/hulls/quickhull/HalfEdge.js
var require_HalfEdge = __commonJS({
  "node_modules/@jscad/modeling/src/operations/hulls/quickhull/HalfEdge.js"(exports, module) {
    "use strict";
    var distance = require_distance();
    var squaredDistance = require_squaredDistance();
    var HalfEdge = class {
      constructor(vertex, face) {
        this.vertex = vertex;
        this.face = face;
        this.next = null;
        this.prev = null;
        this.opposite = null;
      }
      head() {
        return this.vertex;
      }
      tail() {
        return this.prev ? this.prev.vertex : null;
      }
      length() {
        if (this.tail()) {
          return distance(
            this.tail().point,
            this.head().point
          );
        }
        return -1;
      }
      lengthSquared() {
        if (this.tail()) {
          return squaredDistance(
            this.tail().point,
            this.head().point
          );
        }
        return -1;
      }
      setOpposite(edge) {
        this.opposite = edge;
        edge.opposite = this;
      }
    };
    module.exports = HalfEdge;
  }
});

// node_modules/@jscad/modeling/src/operations/hulls/quickhull/Face.js
var require_Face = __commonJS({
  "node_modules/@jscad/modeling/src/operations/hulls/quickhull/Face.js"(exports, module) {
    "use strict";
    var add = require_add2();
    var copy = require_copy2();
    var cross2 = require_cross();
    var dot2 = require_dot();
    var length = require_length();
    var normalize = require_normalize();
    var scale = require_scale();
    var subtract3 = require_subtract();
    var HalfEdge = require_HalfEdge();
    var VISIBLE = 0;
    var NON_CONVEX = 1;
    var DELETED = 2;
    var Face = class _Face {
      constructor() {
        this.normal = [];
        this.centroid = [];
        this.offset = 0;
        this.outside = null;
        this.mark = VISIBLE;
        this.edge = null;
        this.nVertices = 0;
      }
      getEdge(i) {
        if (typeof i !== "number") {
          throw Error("requires a number");
        }
        let it = this.edge;
        while (i > 0) {
          it = it.next;
          i -= 1;
        }
        while (i < 0) {
          it = it.prev;
          i += 1;
        }
        return it;
      }
      computeNormal() {
        const e0 = this.edge;
        const e1 = e0.next;
        let e2 = e1.next;
        const v2 = subtract3([], e1.head().point, e0.head().point);
        const t = [];
        const v1 = [];
        this.nVertices = 2;
        this.normal = [0, 0, 0];
        while (e2 !== e0) {
          copy(v1, v2);
          subtract3(v2, e2.head().point, e0.head().point);
          add(this.normal, this.normal, cross2(t, v1, v2));
          e2 = e2.next;
          this.nVertices += 1;
        }
        this.area = length(this.normal);
        this.normal = scale(this.normal, this.normal, 1 / this.area);
      }
      computeNormalMinArea(minArea) {
        this.computeNormal();
        if (this.area < minArea) {
          let maxEdge;
          let maxSquaredLength = 0;
          let edge = this.edge;
          do {
            const lengthSquared = edge.lengthSquared();
            if (lengthSquared > maxSquaredLength) {
              maxEdge = edge;
              maxSquaredLength = lengthSquared;
            }
            edge = edge.next;
          } while (edge !== this.edge);
          const p1 = maxEdge.tail().point;
          const p2 = maxEdge.head().point;
          const maxVector = subtract3([], p2, p1);
          const maxLength = Math.sqrt(maxSquaredLength);
          scale(maxVector, maxVector, 1 / maxLength);
          const maxProjection = dot2(this.normal, maxVector);
          scale(maxVector, maxVector, -maxProjection);
          add(this.normal, this.normal, maxVector);
          normalize(this.normal, this.normal);
        }
      }
      computeCentroid() {
        this.centroid = [0, 0, 0];
        let edge = this.edge;
        do {
          add(this.centroid, this.centroid, edge.head().point);
          edge = edge.next;
        } while (edge !== this.edge);
        scale(this.centroid, this.centroid, 1 / this.nVertices);
      }
      computeNormalAndCentroid(minArea) {
        if (typeof minArea !== "undefined") {
          this.computeNormalMinArea(minArea);
        } else {
          this.computeNormal();
        }
        this.computeCentroid();
        this.offset = dot2(this.normal, this.centroid);
      }
      distanceToPlane(point) {
        return dot2(this.normal, point) - this.offset;
      }
      /**
       * @private
       *
       * Connects two edges assuming that prev.head().point === next.tail().point
       *
       * @param {HalfEdge} prev
       * @param {HalfEdge} next
       */
      connectHalfEdges(prev, next) {
        let discardedFace;
        if (prev.opposite.face === next.opposite.face) {
          const oppositeFace = next.opposite.face;
          let oppositeEdge;
          if (prev === this.edge) {
            this.edge = next;
          }
          if (oppositeFace.nVertices === 3) {
            oppositeEdge = next.opposite.prev.opposite;
            oppositeFace.mark = DELETED;
            discardedFace = oppositeFace;
          } else {
            oppositeEdge = next.opposite.next;
            if (oppositeFace.edge === oppositeEdge.prev) {
              oppositeFace.edge = oppositeEdge;
            }
            oppositeEdge.prev = oppositeEdge.prev.prev;
            oppositeEdge.prev.next = oppositeEdge;
          }
          next.prev = prev.prev;
          next.prev.next = next;
          next.setOpposite(oppositeEdge);
          oppositeFace.computeNormalAndCentroid();
        } else {
          prev.next = next;
          next.prev = prev;
        }
        return discardedFace;
      }
      mergeAdjacentFaces(adjacentEdge, discardedFaces) {
        const oppositeEdge = adjacentEdge.opposite;
        const oppositeFace = oppositeEdge.face;
        discardedFaces.push(oppositeFace);
        oppositeFace.mark = DELETED;
        let adjacentEdgePrev = adjacentEdge.prev;
        let adjacentEdgeNext = adjacentEdge.next;
        let oppositeEdgePrev = oppositeEdge.prev;
        let oppositeEdgeNext = oppositeEdge.next;
        while (adjacentEdgePrev.opposite.face === oppositeFace) {
          adjacentEdgePrev = adjacentEdgePrev.prev;
          oppositeEdgeNext = oppositeEdgeNext.next;
        }
        while (adjacentEdgeNext.opposite.face === oppositeFace) {
          adjacentEdgeNext = adjacentEdgeNext.next;
          oppositeEdgePrev = oppositeEdgePrev.prev;
        }
        let edge;
        for (edge = oppositeEdgeNext; edge !== oppositeEdgePrev.next; edge = edge.next) {
          edge.face = this;
        }
        this.edge = adjacentEdgeNext;
        let discardedFace;
        discardedFace = this.connectHalfEdges(oppositeEdgePrev, adjacentEdgeNext);
        if (discardedFace) {
          discardedFaces.push(discardedFace);
        }
        discardedFace = this.connectHalfEdges(adjacentEdgePrev, oppositeEdgeNext);
        if (discardedFace) {
          discardedFaces.push(discardedFace);
        }
        this.computeNormalAndCentroid();
        return discardedFaces;
      }
      collectIndices() {
        const indices = [];
        let edge = this.edge;
        do {
          indices.push(edge.head().index);
          edge = edge.next;
        } while (edge !== this.edge);
        return indices;
      }
      static createTriangle(v0, v1, v2, minArea = 0) {
        const face = new _Face();
        const e0 = new HalfEdge(v0, face);
        const e1 = new HalfEdge(v1, face);
        const e2 = new HalfEdge(v2, face);
        e0.next = e2.prev = e1;
        e1.next = e0.prev = e2;
        e2.next = e1.prev = e0;
        face.edge = e0;
        face.computeNormalAndCentroid(minArea);
        return face;
      }
    };
    module.exports = {
      VISIBLE,
      NON_CONVEX,
      DELETED,
      Face
    };
  }
});

// node_modules/@jscad/modeling/src/operations/hulls/quickhull/QuickHull.js
var require_QuickHull = __commonJS({
  "node_modules/@jscad/modeling/src/operations/hulls/quickhull/QuickHull.js"(exports, module) {
    "use strict";
    var dot2 = require_dot();
    var pointLineDistance = require_point_line_distance();
    var getPlaneNormal = require_get_plane_normal();
    var VertexList = require_VertexList();
    var Vertex = require_Vertex();
    var { Face, VISIBLE, NON_CONVEX, DELETED } = require_Face();
    var MERGE_NON_CONVEX_WRT_LARGER_FACE = 1;
    var MERGE_NON_CONVEX = 2;
    var QuickHull = class {
      constructor(points) {
        if (!Array.isArray(points)) {
          throw TypeError("input is not a valid array");
        }
        if (points.length < 4) {
          throw Error("cannot build a simplex out of <4 points");
        }
        this.tolerance = -1;
        this.nFaces = 0;
        this.nPoints = points.length;
        this.faces = [];
        this.newFaces = [];
        this.claimed = new VertexList();
        this.unclaimed = new VertexList();
        this.vertices = [];
        for (let i = 0; i < points.length; i += 1) {
          this.vertices.push(new Vertex(points[i], i));
        }
        this.discardedFaces = [];
        this.vertexPointIndices = [];
      }
      addVertexToFace(vertex, face) {
        vertex.face = face;
        if (!face.outside) {
          this.claimed.add(vertex);
        } else {
          this.claimed.insertBefore(face.outside, vertex);
        }
        face.outside = vertex;
      }
      /**
       * Removes `vertex` for the `claimed` list of vertices, it also makes sure
       * that the link from `face` to the first vertex it sees in `claimed` is
       * linked correctly after the removal
       *
       * @param {Vertex} vertex
       * @param {Face} face
       */
      removeVertexFromFace(vertex, face) {
        if (vertex === face.outside) {
          if (vertex.next && vertex.next.face === face) {
            face.outside = vertex.next;
          } else {
            face.outside = null;
          }
        }
        this.claimed.remove(vertex);
      }
      /**
       * Removes all the visible vertices that `face` is able to see which are
       * stored in the `claimed` vertext list
       *
       * @param {Face} face
       * @return {Vertex|undefined} If face had visible vertices returns
       * `face.outside`, otherwise undefined
       */
      removeAllVerticesFromFace(face) {
        if (face.outside) {
          let end = face.outside;
          while (end.next && end.next.face === face) {
            end = end.next;
          }
          this.claimed.removeChain(face.outside, end);
          end.next = null;
          return face.outside;
        }
      }
      /**
       * Removes all the visible vertices that `face` is able to see, additionally
       * checking the following:
       *
       * If `absorbingFace` doesn't exist then all the removed vertices will be
       * added to the `unclaimed` vertex list
       *
       * If `absorbingFace` exists then this method will assign all the vertices of
       * `face` that can see `absorbingFace`, if a vertex cannot see `absorbingFace`
       * it's added to the `unclaimed` vertex list
       *
       * @param {Face} face
       * @param {Face} [absorbingFace]
       */
      deleteFaceVertices(face, absorbingFace) {
        const faceVertices = this.removeAllVerticesFromFace(face);
        if (faceVertices) {
          if (!absorbingFace) {
            this.unclaimed.addAll(faceVertices);
          } else {
            let nextVertex;
            for (let vertex = faceVertices; vertex; vertex = nextVertex) {
              nextVertex = vertex.next;
              const distance = absorbingFace.distanceToPlane(vertex.point);
              if (distance > this.tolerance) {
                this.addVertexToFace(vertex, absorbingFace);
              } else {
                this.unclaimed.add(vertex);
              }
            }
          }
        }
      }
      /**
       * Reassigns as many vertices as possible from the unclaimed list to the new
       * faces
       *
       * @param {Faces[]} newFaces
       */
      resolveUnclaimedPoints(newFaces) {
        let vertexNext = this.unclaimed.first();
        for (let vertex = vertexNext; vertex; vertex = vertexNext) {
          vertexNext = vertex.next;
          let maxDistance = this.tolerance;
          let maxFace;
          for (let i = 0; i < newFaces.length; i += 1) {
            const face = newFaces[i];
            if (face.mark === VISIBLE) {
              const dist = face.distanceToPlane(vertex.point);
              if (dist > maxDistance) {
                maxDistance = dist;
                maxFace = face;
              }
              if (maxDistance > 1e3 * this.tolerance) {
                break;
              }
            }
          }
          if (maxFace) {
            this.addVertexToFace(vertex, maxFace);
          }
        }
      }
      /**
       * Computes the extremes of a tetrahedron which will be the initial hull
       *
       * @return {number[]} The min/max vertices in the x,y,z directions
       */
      computeExtremes() {
        const min = [];
        const max = [];
        const minVertices = [];
        const maxVertices = [];
        let i, j;
        for (i = 0; i < 3; i += 1) {
          minVertices[i] = maxVertices[i] = this.vertices[0];
        }
        for (i = 0; i < 3; i += 1) {
          min[i] = max[i] = this.vertices[0].point[i];
        }
        for (i = 1; i < this.vertices.length; i += 1) {
          const vertex = this.vertices[i];
          const point = vertex.point;
          for (j = 0; j < 3; j += 1) {
            if (point[j] < min[j]) {
              min[j] = point[j];
              minVertices[j] = vertex;
            }
          }
          for (j = 0; j < 3; j += 1) {
            if (point[j] > max[j]) {
              max[j] = point[j];
              maxVertices[j] = vertex;
            }
          }
        }
        this.tolerance = 3 * Number.EPSILON * (Math.max(Math.abs(min[0]), Math.abs(max[0])) + Math.max(Math.abs(min[1]), Math.abs(max[1])) + Math.max(Math.abs(min[2]), Math.abs(max[2])));
        return [minVertices, maxVertices];
      }
      /**
       * Compues the initial tetrahedron assigning to its faces all the points that
       * are candidates to form part of the hull
       */
      createInitialSimplex() {
        const vertices = this.vertices;
        const [min, max] = this.computeExtremes();
        let v2, v3;
        let i, j;
        let maxDistance = 0;
        let indexMax = 0;
        for (i = 0; i < 3; i += 1) {
          const distance = max[i].point[i] - min[i].point[i];
          if (distance > maxDistance) {
            maxDistance = distance;
            indexMax = i;
          }
        }
        const v0 = min[indexMax];
        const v1 = max[indexMax];
        maxDistance = 0;
        for (i = 0; i < this.vertices.length; i += 1) {
          const vertex = this.vertices[i];
          if (vertex !== v0 && vertex !== v1) {
            const distance = pointLineDistance(
              vertex.point,
              v0.point,
              v1.point
            );
            if (distance > maxDistance) {
              maxDistance = distance;
              v2 = vertex;
            }
          }
        }
        const normal = getPlaneNormal([], v0.point, v1.point, v2.point);
        const distPO = dot2(v0.point, normal);
        maxDistance = -1;
        for (i = 0; i < this.vertices.length; i += 1) {
          const vertex = this.vertices[i];
          if (vertex !== v0 && vertex !== v1 && vertex !== v2) {
            const distance = Math.abs(dot2(normal, vertex.point) - distPO);
            if (distance > maxDistance) {
              maxDistance = distance;
              v3 = vertex;
            }
          }
        }
        const faces = [];
        if (dot2(v3.point, normal) - distPO < 0) {
          faces.push(
            Face.createTriangle(v0, v1, v2),
            Face.createTriangle(v3, v1, v0),
            Face.createTriangle(v3, v2, v1),
            Face.createTriangle(v3, v0, v2)
          );
          for (i = 0; i < 3; i += 1) {
            const j2 = (i + 1) % 3;
            faces[i + 1].getEdge(2).setOpposite(faces[0].getEdge(j2));
            faces[i + 1].getEdge(1).setOpposite(faces[j2 + 1].getEdge(0));
          }
        } else {
          faces.push(
            Face.createTriangle(v0, v2, v1),
            Face.createTriangle(v3, v0, v1),
            Face.createTriangle(v3, v1, v2),
            Face.createTriangle(v3, v2, v0)
          );
          for (i = 0; i < 3; i += 1) {
            const j2 = (i + 1) % 3;
            faces[i + 1].getEdge(2).setOpposite(faces[0].getEdge((3 - i) % 3));
            faces[i + 1].getEdge(0).setOpposite(faces[j2 + 1].getEdge(1));
          }
        }
        for (i = 0; i < 4; i += 1) {
          this.faces.push(faces[i]);
        }
        for (i = 0; i < vertices.length; i += 1) {
          const vertex = vertices[i];
          if (vertex !== v0 && vertex !== v1 && vertex !== v2 && vertex !== v3) {
            maxDistance = this.tolerance;
            let maxFace;
            for (j = 0; j < 4; j += 1) {
              const distance = faces[j].distanceToPlane(vertex.point);
              if (distance > maxDistance) {
                maxDistance = distance;
                maxFace = faces[j];
              }
            }
            if (maxFace) {
              this.addVertexToFace(vertex, maxFace);
            }
          }
        }
      }
      reindexFaceAndVertices() {
        const activeFaces = [];
        for (let i = 0; i < this.faces.length; i += 1) {
          const face = this.faces[i];
          if (face.mark === VISIBLE) {
            activeFaces.push(face);
          }
        }
        this.faces = activeFaces;
      }
      collectFaces(skipTriangulation) {
        const faceIndices = [];
        for (let i = 0; i < this.faces.length; i += 1) {
          if (this.faces[i].mark !== VISIBLE) {
            throw Error("attempt to include a destroyed face in the hull");
          }
          const indices = this.faces[i].collectIndices();
          if (skipTriangulation) {
            faceIndices.push(indices);
          } else {
            for (let j = 0; j < indices.length - 2; j += 1) {
              faceIndices.push(
                [indices[0], indices[j + 1], indices[j + 2]]
              );
            }
          }
        }
        return faceIndices;
      }
      /**
       * Finds the next vertex to make faces with the current hull
       *
       * - let `face` be the first face existing in the `claimed` vertex list
       *  - if `face` doesn't exist then return since there're no vertices left
       *  - otherwise for each `vertex` that face sees find the one furthest away
       *  from `face`
       *
       * @return {Vertex|undefined} Returns undefined when there're no more
       * visible vertices
       */
      nextVertexToAdd() {
        if (!this.claimed.isEmpty()) {
          let eyeVertex, vertex;
          let maxDistance = 0;
          const eyeFace = this.claimed.first().face;
          for (vertex = eyeFace.outside; vertex && vertex.face === eyeFace; vertex = vertex.next) {
            const distance = eyeFace.distanceToPlane(vertex.point);
            if (distance > maxDistance) {
              maxDistance = distance;
              eyeVertex = vertex;
            }
          }
          return eyeVertex;
        }
      }
      /**
       * Computes a chain of half edges in ccw order called the `horizon`, for an
       * edge to be part of the horizon it must join a face that can see
       * `eyePoint` and a face that cannot see `eyePoint`
       *
       * @param {number[]} eyePoint - The coordinates of a point
       * @param {HalfEdge} crossEdge - The edge used to jump to the current `face`
       * @param {Face} face - The current face being tested
       * @param {HalfEdge[]} horizon - The edges that form part of the horizon in
       * ccw order
       */
      computeHorizon(eyePoint, crossEdge, face, horizon) {
        this.deleteFaceVertices(face);
        face.mark = DELETED;
        let edge;
        if (!crossEdge) {
          edge = crossEdge = face.getEdge(0);
        } else {
          edge = crossEdge.next;
        }
        do {
          const oppositeEdge = edge.opposite;
          const oppositeFace = oppositeEdge.face;
          if (oppositeFace.mark === VISIBLE) {
            if (oppositeFace.distanceToPlane(eyePoint) > this.tolerance) {
              this.computeHorizon(eyePoint, oppositeEdge, oppositeFace, horizon);
            } else {
              horizon.push(edge);
            }
          }
          edge = edge.next;
        } while (edge !== crossEdge);
      }
      /**
       * Creates a face with the points `eyeVertex.point`, `horizonEdge.tail` and
       * `horizonEdge.tail` in ccw order
       *
       * @param {Vertex} eyeVertex
       * @param {HalfEdge} horizonEdge
       * @return {HalfEdge} The half edge whose vertex is the eyeVertex
       */
      addAdjoiningFace(eyeVertex, horizonEdge) {
        const face = Face.createTriangle(
          eyeVertex,
          horizonEdge.tail(),
          horizonEdge.head()
        );
        this.faces.push(face);
        face.getEdge(-1).setOpposite(horizonEdge.opposite);
        return face.getEdge(0);
      }
      /**
       * Adds horizon.length faces to the hull, each face will be 'linked' with the
       * horizon opposite face and the face on the left/right
       *
       * @param {Vertex} eyeVertex
       * @param {HalfEdge[]} horizon - A chain of half edges in ccw order
       */
      addNewFaces(eyeVertex, horizon) {
        this.newFaces = [];
        let firstSideEdge, previousSideEdge;
        for (let i = 0; i < horizon.length; i += 1) {
          const horizonEdge = horizon[i];
          const sideEdge = this.addAdjoiningFace(eyeVertex, horizonEdge);
          if (!firstSideEdge) {
            firstSideEdge = sideEdge;
          } else {
            sideEdge.next.setOpposite(previousSideEdge);
          }
          this.newFaces.push(sideEdge.face);
          previousSideEdge = sideEdge;
        }
        firstSideEdge.next.setOpposite(previousSideEdge);
      }
      /**
       * Computes the distance from `edge` opposite face's centroid to
       * `edge.face`
       *
       * @param {HalfEdge} edge
       * @return {number}
       * - A positive number when the centroid of the opposite face is above the
       *   face i.e. when the faces are concave
       * - A negative number when the centroid of the opposite face is below the
       *   face i.e. when the faces are convex
       */
      oppositeFaceDistance(edge) {
        return edge.face.distanceToPlane(edge.opposite.face.centroid);
      }
      /**
       * Merges a face with none/any/all its neighbors according to the strategy
       * used
       *
       * if `mergeType` is MERGE_NON_CONVEX_WRT_LARGER_FACE then the merge will be
       * decided based on the face with the larger area, the centroid of the face
       * with the smaller area will be checked against the one with the larger area
       * to see if it's in the merge range [tolerance, -tolerance] i.e.
       *
       *    dot(centroid smaller face, larger face normal) - larger face offset > -tolerance
       *
       * Note that the first check (with +tolerance) was done on `computeHorizon`
       *
       * If the above is not true then the check is done with respect to the smaller
       * face i.e.
       *
       *    dot(centroid larger face, smaller face normal) - smaller face offset > -tolerance
       *
       * If true then it means that two faces are non convex (concave), even if the
       * dot(...) - offset value is > 0 (that's the point of doing the merge in the
       * first place)
       *
       * If two faces are concave then the check must also be done on the other face
       * but this is done in another merge pass, for this to happen the face is
       * marked in a temporal NON_CONVEX state
       *
       * if `mergeType` is MERGE_NON_CONVEX then two faces will be merged only if
       * they pass the following conditions
       *
       *    dot(centroid smaller face, larger face normal) - larger face offset > -tolerance
       *    dot(centroid larger face, smaller face normal) - smaller face offset > -tolerance
       *
       * @param {Face} face
       * @param {number} mergeType - Either MERGE_NON_CONVEX_WRT_LARGER_FACE or
       * MERGE_NON_CONVEX
       */
      doAdjacentMerge(face, mergeType) {
        let edge = face.edge;
        let convex = true;
        let it = 0;
        do {
          if (it >= face.nVertices) {
            throw Error("merge recursion limit exceeded");
          }
          const oppositeFace = edge.opposite.face;
          let merge = false;
          if (mergeType === MERGE_NON_CONVEX) {
            if (this.oppositeFaceDistance(edge) > -this.tolerance || this.oppositeFaceDistance(edge.opposite) > -this.tolerance) {
              merge = true;
            }
          } else {
            if (face.area > oppositeFace.area) {
              if (this.oppositeFaceDistance(edge) > -this.tolerance) {
                merge = true;
              } else if (this.oppositeFaceDistance(edge.opposite) > -this.tolerance) {
                convex = false;
              }
            } else {
              if (this.oppositeFaceDistance(edge.opposite) > -this.tolerance) {
                merge = true;
              } else if (this.oppositeFaceDistance(edge) > -this.tolerance) {
                convex = false;
              }
            }
          }
          if (merge) {
            const discardedFaces = face.mergeAdjacentFaces(edge, []);
            for (let i = 0; i < discardedFaces.length; i += 1) {
              this.deleteFaceVertices(discardedFaces[i], face);
            }
            return true;
          }
          edge = edge.next;
          it += 1;
        } while (edge !== face.edge);
        if (!convex) {
          face.mark = NON_CONVEX;
        }
        return false;
      }
      /**
       * Adds a vertex to the hull with the following algorithm
       *
       * - Compute the `horizon` which is a chain of half edges, for an edge to
       *   belong to this group it must be the edge connecting a face that can
       *   see `eyeVertex` and a face which cannot see `eyeVertex`
       * - All the faces that can see `eyeVertex` have its visible vertices removed
       *   from the claimed VertexList
       * - A new set of faces is created with each edge of the `horizon` and
       *   `eyeVertex`, each face is connected with the opposite horizon face and
       *   the face on the left/right
       * - The new faces are merged if possible with the opposite horizon face first
       *   and then the faces on the right/left
       * - The vertices removed from all the visible faces are assigned to the new
       *   faces if possible
       *
       * @param {Vertex} eyeVertex
       */
      addVertexToHull(eyeVertex) {
        const horizon = [];
        this.unclaimed.clear();
        this.removeVertexFromFace(eyeVertex, eyeVertex.face);
        this.computeHorizon(eyeVertex.point, null, eyeVertex.face, horizon);
        this.addNewFaces(eyeVertex, horizon);
        for (let i = 0; i < this.newFaces.length; i += 1) {
          const face = this.newFaces[i];
          if (face.mark === VISIBLE) {
            while (this.doAdjacentMerge(face, MERGE_NON_CONVEX_WRT_LARGER_FACE)) {
            }
          }
        }
        for (let i = 0; i < this.newFaces.length; i += 1) {
          const face = this.newFaces[i];
          if (face.mark === NON_CONVEX) {
            face.mark = VISIBLE;
            while (this.doAdjacentMerge(face, MERGE_NON_CONVEX)) {
            }
          }
        }
        this.resolveUnclaimedPoints(this.newFaces);
      }
      build() {
        let eyeVertex;
        this.createInitialSimplex();
        while (eyeVertex = this.nextVertexToAdd()) {
          this.addVertexToHull(eyeVertex);
        }
        this.reindexFaceAndVertices();
      }
    };
    module.exports = QuickHull;
  }
});

// node_modules/@jscad/modeling/src/operations/hulls/quickhull/index.js
var require_quickhull = __commonJS({
  "node_modules/@jscad/modeling/src/operations/hulls/quickhull/index.js"(exports, module) {
    "use strict";
    var QuickHull = require_QuickHull();
    var runner = (points, options = {}) => {
      const instance = new QuickHull(points);
      instance.build();
      return instance.collectFaces(options.skipTriangulation);
    };
    module.exports = runner;
  }
});

// node_modules/@jscad/modeling/src/geometries/poly3/create.js
var require_create6 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/poly3/create.js"(exports, module) {
    "use strict";
    var create = (vertices) => {
      if (vertices === void 0 || vertices.length < 3) {
        vertices = [];
      }
      return { vertices };
    };
    module.exports = create;
  }
});

// node_modules/@jscad/modeling/src/geometries/poly3/clone.js
var require_clone6 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/poly3/clone.js"(exports, module) {
    "use strict";
    var create = require_create6();
    var vec3 = require_vec3();
    var clone = (...params) => {
      let out;
      let poly3;
      if (params.length === 1) {
        out = create();
        poly3 = params[0];
      } else {
        out = params[0];
        poly3 = params[1];
      }
      out.vertices = poly3.vertices.map((vec) => vec3.clone(vec));
      return out;
    };
    module.exports = clone;
  }
});

// node_modules/@jscad/modeling/src/geometries/poly3/fromPoints.js
var require_fromPoints2 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/poly3/fromPoints.js"(exports, module) {
    "use strict";
    var vec3 = require_vec3();
    var create = require_create6();
    var fromPoints = (points) => {
      const vertices = points.map((point) => vec3.clone(point));
      return create(vertices);
    };
    module.exports = fromPoints;
  }
});

// node_modules/@jscad/modeling/src/geometries/poly3/fromPointsAndPlane.js
var require_fromPointsAndPlane = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/poly3/fromPointsAndPlane.js"(exports, module) {
    "use strict";
    var create = require_create6();
    var fromPointsAndPlane = (vertices, plane) => {
      const poly = create(vertices);
      poly.plane = plane;
      return poly;
    };
    module.exports = fromPointsAndPlane;
  }
});

// node_modules/@jscad/modeling/src/maths/vec4/create.js
var require_create7 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec4/create.js"(exports, module) {
    "use strict";
    var create = () => [0, 0, 0, 0];
    module.exports = create;
  }
});

// node_modules/@jscad/modeling/src/maths/vec4/clone.js
var require_clone7 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec4/clone.js"(exports, module) {
    "use strict";
    var create = require_create7();
    var clone = (vector) => {
      const out = create();
      out[0] = vector[0];
      out[1] = vector[1];
      out[2] = vector[2];
      out[3] = vector[3];
      return out;
    };
    module.exports = clone;
  }
});

// node_modules/@jscad/modeling/src/maths/vec4/copy.js
var require_copy4 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec4/copy.js"(exports, module) {
    "use strict";
    var copy = (out, vector) => {
      out[0] = vector[0];
      out[1] = vector[1];
      out[2] = vector[2];
      out[3] = vector[3];
      return out;
    };
    module.exports = copy;
  }
});

// node_modules/@jscad/modeling/src/maths/vec4/equals.js
var require_equals4 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec4/equals.js"(exports, module) {
    "use strict";
    var equals = (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
    module.exports = equals;
  }
});

// node_modules/@jscad/modeling/src/maths/plane/flip.js
var require_flip = __commonJS({
  "node_modules/@jscad/modeling/src/maths/plane/flip.js"(exports, module) {
    "use strict";
    var flip = (out, plane) => {
      out[0] = -plane[0];
      out[1] = -plane[1];
      out[2] = -plane[2];
      out[3] = -plane[3];
      return out;
    };
    module.exports = flip;
  }
});

// node_modules/@jscad/modeling/src/maths/plane/fromNormalAndPoint.js
var require_fromNormalAndPoint = __commonJS({
  "node_modules/@jscad/modeling/src/maths/plane/fromNormalAndPoint.js"(exports, module) {
    "use strict";
    var vec3 = require_vec3();
    var fromNormalAndPoint = (out, normal, point) => {
      const u = vec3.normalize(vec3.create(), normal);
      const w = vec3.dot(point, u);
      out[0] = u[0];
      out[1] = u[1];
      out[2] = u[2];
      out[3] = w;
      return out;
    };
    module.exports = fromNormalAndPoint;
  }
});

// node_modules/@jscad/modeling/src/maths/vec4/fromValues.js
var require_fromValues4 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec4/fromValues.js"(exports, module) {
    "use strict";
    var create = require_create7();
    var fromValues = (x, y, z, w) => {
      const out = create();
      out[0] = x;
      out[1] = y;
      out[2] = z;
      out[3] = w;
      return out;
    };
    module.exports = fromValues;
  }
});

// node_modules/@jscad/modeling/src/maths/plane/fromNoisyPoints.js
var require_fromNoisyPoints = __commonJS({
  "node_modules/@jscad/modeling/src/maths/plane/fromNoisyPoints.js"(exports, module) {
    "use strict";
    var vec3 = require_vec3();
    var fromNormalAndPoint = require_fromNormalAndPoint();
    var fromNoisyPoints = (out, ...vertices) => {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      const n = vertices.length;
      vertices.forEach((v) => {
        vec3.add(out, out, v);
      });
      vec3.scale(out, out, 1 / n);
      let xx = 0;
      let xy = 0;
      let xz = 0;
      let yy = 0;
      let yz = 0;
      let zz = 0;
      const vn = vec3.create();
      vertices.forEach((v) => {
        vec3.subtract(vn, v, out);
        xx += vn[0] * vn[0];
        xy += vn[0] * vn[1];
        xz += vn[0] * vn[2];
        yy += vn[1] * vn[1];
        yz += vn[1] * vn[2];
        zz += vn[2] * vn[2];
      });
      xx /= n;
      xy /= n;
      xz /= n;
      yy /= n;
      yz /= n;
      zz /= n;
      vn[0] = 0;
      vn[1] = 0;
      vn[2] = 0;
      const wdv = vec3.create();
      let det = yy * zz - yz * yz;
      wdv[0] = det;
      wdv[1] = xz * yz - xy * zz;
      wdv[2] = xy * yz - xz * yy;
      let weight = det * det;
      vec3.add(vn, vn, vec3.scale(wdv, wdv, weight));
      det = xx * zz - xz * xz;
      wdv[0] = xz * yz - xy * zz;
      wdv[1] = det;
      wdv[2] = xy * xz - yz * xx;
      weight = det * det;
      if (vec3.dot(vn, wdv) < 0) {
        weight = -weight;
      }
      vec3.add(vn, vn, vec3.scale(wdv, wdv, weight));
      det = xx * yy - xy * xy;
      wdv[0] = xy * yz - xz * yy;
      wdv[1] = xy * xz - yz * xx;
      wdv[2] = det;
      weight = det * det;
      if (vec3.dot(vn, wdv) < 0) {
        weight = -weight;
      }
      vec3.add(vn, vn, vec3.scale(wdv, wdv, weight));
      return fromNormalAndPoint(out, vn, out);
    };
    module.exports = fromNoisyPoints;
  }
});

// node_modules/@jscad/modeling/src/maths/plane/fromPoints.js
var require_fromPoints3 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/plane/fromPoints.js"(exports, module) {
    "use strict";
    var vec3 = require_vec3();
    var fromPoints = (out, ...vertices) => {
      const len = vertices.length;
      const ba = vec3.create();
      const ca = vec3.create();
      const vertexNormal = (index) => {
        const a = vertices[index];
        const b = vertices[(index + 1) % len];
        const c = vertices[(index + 2) % len];
        vec3.subtract(ba, b, a);
        vec3.subtract(ca, c, a);
        vec3.cross(ba, ba, ca);
        vec3.normalize(ba, ba);
        return ba;
      };
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
      if (len === 3) {
        vec3.copy(out, vertexNormal(0));
      } else {
        vertices.forEach((v, i) => {
          vec3.add(out, out, vertexNormal(i));
        });
        vec3.normalize(out, out);
      }
      out[3] = vec3.dot(out, vertices[0]);
      return out;
    };
    module.exports = fromPoints;
  }
});

// node_modules/@jscad/modeling/src/maths/plane/fromPointsRandom.js
var require_fromPointsRandom = __commonJS({
  "node_modules/@jscad/modeling/src/maths/plane/fromPointsRandom.js"(exports, module) {
    "use strict";
    var { EPS } = require_constants();
    var vec3 = require_vec3();
    var fromPointsRandom = (out, a, b, c) => {
      let ba = vec3.subtract(vec3.create(), b, a);
      let ca = vec3.subtract(vec3.create(), c, a);
      if (vec3.length(ba) < EPS) {
        ba = vec3.orthogonal(ba, ca);
      }
      if (vec3.length(ca) < EPS) {
        ca = vec3.orthogonal(ca, ba);
      }
      let normal = vec3.cross(vec3.create(), ba, ca);
      if (vec3.length(normal) < EPS) {
        ca = vec3.orthogonal(ca, ba);
        normal = vec3.cross(normal, ba, ca);
      }
      normal = vec3.normalize(normal, normal);
      const w = vec3.dot(normal, a);
      out[0] = normal[0];
      out[1] = normal[1];
      out[2] = normal[2];
      out[3] = w;
      return out;
    };
    module.exports = fromPointsRandom;
  }
});

// node_modules/@jscad/modeling/src/maths/plane/projectionOfPoint.js
var require_projectionOfPoint = __commonJS({
  "node_modules/@jscad/modeling/src/maths/plane/projectionOfPoint.js"(exports, module) {
    "use strict";
    var vec3 = require_vec3();
    var projectionOfPoint = (plane, point) => {
      const a = point[0] * plane[0] + point[1] * plane[1] + point[2] * plane[2] - plane[3];
      const x = point[0] - a * plane[0];
      const y = point[1] - a * plane[1];
      const z = point[2] - a * plane[2];
      return vec3.fromValues(x, y, z);
    };
    module.exports = projectionOfPoint;
  }
});

// node_modules/@jscad/modeling/src/maths/plane/signedDistanceToPoint.js
var require_signedDistanceToPoint = __commonJS({
  "node_modules/@jscad/modeling/src/maths/plane/signedDistanceToPoint.js"(exports, module) {
    "use strict";
    var vec3 = require_vec3();
    var signedDistanceToPoint = (plane, point) => vec3.dot(plane, point) - plane[3];
    module.exports = signedDistanceToPoint;
  }
});

// node_modules/@jscad/modeling/src/maths/vec4/toString.js
var require_toString5 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec4/toString.js"(exports, module) {
    "use strict";
    var toString = (vec) => `(${vec[0].toFixed(9)}, ${vec[1].toFixed(9)}, ${vec[2].toFixed(9)}, ${vec[3].toFixed(9)})`;
    module.exports = toString;
  }
});

// node_modules/@jscad/modeling/src/maths/plane/transform.js
var require_transform4 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/plane/transform.js"(exports, module) {
    "use strict";
    var mat4 = require_mat4();
    var vec3 = require_vec3();
    var fromPoints = require_fromPoints3();
    var flip = require_flip();
    var transform = (out, plane, matrix) => {
      const ismirror = mat4.isMirroring(matrix);
      const r = vec3.orthogonal(vec3.create(), plane);
      const u = vec3.cross(r, plane, r);
      const v = vec3.cross(vec3.create(), plane, u);
      let point1 = vec3.fromScalar(vec3.create(), plane[3]);
      vec3.multiply(point1, point1, plane);
      let point2 = vec3.add(vec3.create(), point1, u);
      let point3 = vec3.add(vec3.create(), point1, v);
      point1 = vec3.transform(point1, point1, matrix);
      point2 = vec3.transform(point2, point2, matrix);
      point3 = vec3.transform(point3, point3, matrix);
      fromPoints(out, point1, point2, point3);
      if (ismirror) {
        flip(out, out);
      }
      return out;
    };
    module.exports = transform;
  }
});

// node_modules/@jscad/modeling/src/maths/plane/index.js
var require_plane = __commonJS({
  "node_modules/@jscad/modeling/src/maths/plane/index.js"(exports, module) {
    "use strict";
    module.exports = {
      /**
       * @see [vec4.clone()]{@link module:modeling/maths/vec4.clone}
       * @function clone
       */
      clone: require_clone7(),
      /**
       * @see [vec4.copy()]{@link module:modeling/maths/vec4.copy}
       * @function copy
       */
      copy: require_copy4(),
      /**
       * @see [vec4.create()]{@link module:modeling/maths/vec4.create}
       * @function create
       */
      create: require_create7(),
      /**
       * @see [vec4.equals()]{@link module:modeling/maths/vec4.equals}
       * @function equals
       */
      equals: require_equals4(),
      flip: require_flip(),
      fromNormalAndPoint: require_fromNormalAndPoint(),
      /**
       * @see [vec4.fromValues()]{@link module:modeling/maths/vec4.fromValues}
       * @function fromValues
       */
      fromValues: require_fromValues4(),
      fromNoisyPoints: require_fromNoisyPoints(),
      fromPoints: require_fromPoints3(),
      fromPointsRandom: require_fromPointsRandom(),
      projectionOfPoint: require_projectionOfPoint(),
      signedDistanceToPoint: require_signedDistanceToPoint(),
      /**
       * @see [vec4.toString()]{@link module:modeling/maths/vec4.toString}
       * @function toString
       */
      toString: require_toString5(),
      transform: require_transform4()
    };
  }
});

// node_modules/@jscad/modeling/src/geometries/poly3/invert.js
var require_invert2 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/poly3/invert.js"(exports, module) {
    "use strict";
    var plane = require_plane();
    var create = require_create6();
    var invert = (polygon3) => {
      const vertices = polygon3.vertices.slice().reverse();
      const inverted = create(vertices);
      if (polygon3.plane) {
        inverted.plane = plane.flip(plane.create(), polygon3.plane);
      }
      return inverted;
    };
    module.exports = invert;
  }
});

// node_modules/@jscad/modeling/src/geometries/poly3/isA.js
var require_isA2 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/poly3/isA.js"(exports, module) {
    "use strict";
    var isA = (object) => {
      if (object && typeof object === "object") {
        if ("vertices" in object) {
          if (Array.isArray(object.vertices)) {
            return true;
          }
        }
      }
      return false;
    };
    module.exports = isA;
  }
});

// node_modules/@jscad/modeling/src/geometries/poly3/isConvex.js
var require_isConvex = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/poly3/isConvex.js"(exports, module) {
    "use strict";
    var plane = require_plane();
    var vec3 = require_vec3();
    var isConvex = (polygon3) => areVerticesConvex(polygon3.vertices);
    var areVerticesConvex = (vertices) => {
      const numvertices = vertices.length;
      if (numvertices > 2) {
        const normal = plane.fromPoints(plane.create(), ...vertices);
        let prevprevpos = vertices[numvertices - 2];
        let prevpos = vertices[numvertices - 1];
        for (let i = 0; i < numvertices; i++) {
          const pos = vertices[i];
          if (!isConvexPoint(prevprevpos, prevpos, pos, normal)) {
            return false;
          }
          prevprevpos = prevpos;
          prevpos = pos;
        }
      }
      return true;
    };
    var isConvexPoint = (prevpoint, point, nextpoint, normal) => {
      const crossproduct = vec3.cross(
        vec3.create(),
        vec3.subtract(vec3.create(), point, prevpoint),
        vec3.subtract(vec3.create(), nextpoint, point)
      );
      const crossdotnormal = vec3.dot(crossproduct, normal);
      return crossdotnormal >= 0;
    };
    module.exports = isConvex;
  }
});

// node_modules/@jscad/modeling/src/geometries/poly3/plane.js
var require_plane2 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/poly3/plane.js"(exports, module) {
    "use strict";
    var mplane = require_plane();
    var plane = (polygon3) => {
      if (!polygon3.plane) {
        polygon3.plane = mplane.fromPoints(mplane.create(), ...polygon3.vertices);
      }
      return polygon3.plane;
    };
    module.exports = plane;
  }
});

// node_modules/@jscad/modeling/src/geometries/poly3/measureArea.js
var require_measureArea = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/poly3/measureArea.js"(exports, module) {
    "use strict";
    var plane = require_plane2();
    var measureArea = (polygon3) => {
      const n = polygon3.vertices.length;
      if (n < 3) {
        return 0;
      }
      const vertices = polygon3.vertices;
      const normal = plane(polygon3);
      const ax = Math.abs(normal[0]);
      const ay = Math.abs(normal[1]);
      const az = Math.abs(normal[2]);
      if (ax + ay + az === 0) {
        return 0;
      }
      let coord = 3;
      if (ax > ay && ax > az) {
        coord = 1;
      } else if (ay > az) {
        coord = 2;
      }
      let area = 0;
      let h = 0;
      let i = 1;
      let j = 2;
      switch (coord) {
        case 1:
          for (i = 1; i < n; i++) {
            h = i - 1;
            j = (i + 1) % n;
            area += vertices[i][1] * (vertices[j][2] - vertices[h][2]);
          }
          area += vertices[0][1] * (vertices[1][2] - vertices[n - 1][2]);
          area /= 2 * normal[0];
          break;
        case 2:
          for (i = 1; i < n; i++) {
            h = i - 1;
            j = (i + 1) % n;
            area += vertices[i][2] * (vertices[j][0] - vertices[h][0]);
          }
          area += vertices[0][2] * (vertices[1][0] - vertices[n - 1][0]);
          area /= 2 * normal[1];
          break;
        case 3:
        // ignore Z coordinates
        default:
          for (i = 1; i < n; i++) {
            h = i - 1;
            j = (i + 1) % n;
            area += vertices[i][0] * (vertices[j][1] - vertices[h][1]);
          }
          area += vertices[0][0] * (vertices[1][1] - vertices[n - 1][1]);
          area /= 2 * normal[2];
          break;
      }
      return area;
    };
    module.exports = measureArea;
  }
});

// node_modules/@jscad/modeling/src/geometries/poly3/measureBoundingBox.js
var require_measureBoundingBox = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/poly3/measureBoundingBox.js"(exports, module) {
    "use strict";
    var vec3 = require_vec3();
    var measureBoundingBox3 = (polygon3) => {
      const vertices = polygon3.vertices;
      const numvertices = vertices.length;
      const min = numvertices === 0 ? vec3.create() : vec3.clone(vertices[0]);
      const max = vec3.clone(min);
      for (let i = 1; i < numvertices; i++) {
        vec3.min(min, min, vertices[i]);
        vec3.max(max, max, vertices[i]);
      }
      return [min, max];
    };
    module.exports = measureBoundingBox3;
  }
});

// node_modules/@jscad/modeling/src/maths/vec4/dot.js
var require_dot3 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec4/dot.js"(exports, module) {
    "use strict";
    var dot2 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
    module.exports = dot2;
  }
});

// node_modules/@jscad/modeling/src/maths/vec4/fromScalar.js
var require_fromScalar3 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec4/fromScalar.js"(exports, module) {
    "use strict";
    var fromScalar = (out, scalar) => {
      out[0] = scalar;
      out[1] = scalar;
      out[2] = scalar;
      out[3] = scalar;
      return out;
    };
    module.exports = fromScalar;
  }
});

// node_modules/@jscad/modeling/src/maths/vec4/transform.js
var require_transform5 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec4/transform.js"(exports, module) {
    "use strict";
    var transform = (out, vector, matrix) => {
      const [x, y, z, w] = vector;
      out[0] = matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12] * w;
      out[1] = matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13] * w;
      out[2] = matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14] * w;
      out[3] = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15] * w;
      return out;
    };
    module.exports = transform;
  }
});

// node_modules/@jscad/modeling/src/maths/vec4/index.js
var require_vec4 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/vec4/index.js"(exports, module) {
    "use strict";
    module.exports = {
      clone: require_clone7(),
      copy: require_copy4(),
      create: require_create7(),
      dot: require_dot3(),
      equals: require_equals4(),
      fromScalar: require_fromScalar3(),
      fromValues: require_fromValues4(),
      toString: require_toString5(),
      transform: require_transform5()
    };
  }
});

// node_modules/@jscad/modeling/src/geometries/poly3/measureBoundingSphere.js
var require_measureBoundingSphere = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/poly3/measureBoundingSphere.js"(exports, module) {
    "use strict";
    var vec4 = require_vec4();
    var cache = /* @__PURE__ */ new WeakMap();
    var measureBoundingSphere = (polygon3) => {
      const boundingSphere = cache.get(polygon3);
      if (boundingSphere) return boundingSphere;
      const vertices = polygon3.vertices;
      const out = vec4.create();
      if (vertices.length === 0) {
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        return out;
      }
      let minx = vertices[0];
      let miny = minx;
      let minz = minx;
      let maxx = minx;
      let maxy = minx;
      let maxz = minx;
      vertices.forEach((v) => {
        if (minx[0] > v[0]) minx = v;
        if (miny[1] > v[1]) miny = v;
        if (minz[2] > v[2]) minz = v;
        if (maxx[0] < v[0]) maxx = v;
        if (maxy[1] < v[1]) maxy = v;
        if (maxz[2] < v[2]) maxz = v;
      });
      out[0] = (minx[0] + maxx[0]) * 0.5;
      out[1] = (miny[1] + maxy[1]) * 0.5;
      out[2] = (minz[2] + maxz[2]) * 0.5;
      const x = out[0] - maxx[0];
      const y = out[1] - maxy[1];
      const z = out[2] - maxz[2];
      out[3] = Math.sqrt(x * x + y * y + z * z);
      cache.set(polygon3, out);
      return out;
    };
    module.exports = measureBoundingSphere;
  }
});

// node_modules/@jscad/modeling/src/geometries/poly3/measureSignedVolume.js
var require_measureSignedVolume = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/poly3/measureSignedVolume.js"(exports, module) {
    "use strict";
    var vec3 = require_vec3();
    var measureSignedVolume = (polygon3) => {
      let signedVolume = 0;
      const vertices = polygon3.vertices;
      const cross2 = vec3.create();
      for (let i = 0; i < vertices.length - 2; i++) {
        vec3.cross(cross2, vertices[i + 1], vertices[i + 2]);
        signedVolume += vec3.dot(vertices[0], cross2);
      }
      signedVolume /= 6;
      return signedVolume;
    };
    module.exports = measureSignedVolume;
  }
});

// node_modules/@jscad/modeling/src/geometries/poly3/toPoints.js
var require_toPoints2 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/poly3/toPoints.js"(exports, module) {
    "use strict";
    var toPoints = (polygon3) => polygon3.vertices;
    module.exports = toPoints;
  }
});

// node_modules/@jscad/modeling/src/geometries/poly3/toString.js
var require_toString6 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/poly3/toString.js"(exports, module) {
    "use strict";
    var vec3 = require_vec3();
    var toString = (polygon3) => {
      let result = "poly3: vertices: [";
      polygon3.vertices.forEach((vertex) => {
        result += `${vec3.toString(vertex)}, `;
      });
      result += "]";
      return result;
    };
    module.exports = toString;
  }
});

// node_modules/@jscad/modeling/src/geometries/poly3/transform.js
var require_transform6 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/poly3/transform.js"(exports, module) {
    "use strict";
    var mat4 = require_mat4();
    var vec3 = require_vec3();
    var create = require_create6();
    var transform = (matrix, polygon3) => {
      const vertices = polygon3.vertices.map((vertex) => vec3.transform(vec3.create(), vertex, matrix));
      if (mat4.isMirroring(matrix)) {
        vertices.reverse();
      }
      return create(vertices);
    };
    module.exports = transform;
  }
});

// node_modules/@jscad/modeling/src/geometries/poly3/validate.js
var require_validate2 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/poly3/validate.js"(exports, module) {
    "use strict";
    var signedDistanceToPoint = require_signedDistanceToPoint();
    var { NEPS } = require_constants();
    var vec3 = require_vec3();
    var isA = require_isA2();
    var isConvex = require_isConvex();
    var measureArea = require_measureArea();
    var plane = require_plane2();
    var validate = (object) => {
      if (!isA(object)) {
        throw new Error("invalid poly3 structure");
      }
      if (object.vertices.length < 3) {
        throw new Error(`poly3 not enough vertices ${object.vertices.length}`);
      }
      if (measureArea(object) <= 0) {
        throw new Error("poly3 area must be greater than zero");
      }
      for (let i = 0; i < object.vertices.length; i++) {
        if (vec3.equals(object.vertices[i], object.vertices[(i + 1) % object.vertices.length])) {
          throw new Error(`poly3 duplicate vertex ${object.vertices[i]}`);
        }
      }
      if (!isConvex(object)) {
        throw new Error("poly3 must be convex");
      }
      object.vertices.forEach((vertex) => {
        if (!vertex.every(Number.isFinite)) {
          throw new Error(`poly3 invalid vertex ${vertex}`);
        }
      });
      if (object.vertices.length > 3) {
        const normal = plane(object);
        object.vertices.forEach((vertex) => {
          const dist = Math.abs(signedDistanceToPoint(normal, vertex));
          if (dist > NEPS) {
            throw new Error(`poly3 must be coplanar: vertex ${vertex} distance ${dist}`);
          }
        });
      }
    };
    module.exports = validate;
  }
});

// node_modules/@jscad/modeling/src/geometries/poly3/index.js
var require_poly3 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/poly3/index.js"(exports, module) {
    "use strict";
    module.exports = {
      clone: require_clone6(),
      create: require_create6(),
      fromPoints: require_fromPoints2(),
      fromPointsAndPlane: require_fromPointsAndPlane(),
      invert: require_invert2(),
      isA: require_isA2(),
      isConvex: require_isConvex(),
      measureArea: require_measureArea(),
      measureBoundingBox: require_measureBoundingBox(),
      measureBoundingSphere: require_measureBoundingSphere(),
      measureSignedVolume: require_measureSignedVolume(),
      plane: require_plane2(),
      toPoints: require_toPoints2(),
      toString: require_toString6(),
      transform: require_transform6(),
      validate: require_validate2()
    };
  }
});

// node_modules/@jscad/modeling/src/geometries/geom3/fromPointsConvex.js
var require_fromPointsConvex = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/geom3/fromPointsConvex.js"(exports, module) {
    "use strict";
    var quickhull = require_quickhull();
    var create = require_create5();
    var poly3 = require_poly3();
    var fromPointsConvex = (uniquePoints) => {
      if (!Array.isArray(uniquePoints)) {
        throw new Error("the given points must be an array");
      }
      const faces = quickhull(uniquePoints, { skipTriangulation: true });
      const polygons = faces.map((face) => {
        const vertices = face.map((index) => uniquePoints[index]);
        return poly3.create(vertices);
      });
      return create(polygons);
    };
    module.exports = fromPointsConvex;
  }
});

// node_modules/@jscad/modeling/src/geometries/geom3/fromPoints.js
var require_fromPoints4 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/geom3/fromPoints.js"(exports, module) {
    "use strict";
    var poly3 = require_poly3();
    var create = require_create5();
    var fromPoints = (listofpoints) => {
      if (!Array.isArray(listofpoints)) {
        throw new Error("the given points must be an array");
      }
      const polygons = listofpoints.map((points, index) => {
        const polygon3 = poly3.create(points);
        return polygon3;
      });
      const result = create(polygons);
      return result;
    };
    module.exports = fromPoints;
  }
});

// node_modules/@jscad/modeling/src/geometries/geom3/fromCompactBinary.js
var require_fromCompactBinary2 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/geom3/fromCompactBinary.js"(exports, module) {
    "use strict";
    var vec3 = require_vec3();
    var mat4 = require_mat4();
    var poly3 = require_poly3();
    var create = require_create5();
    var fromCompactBinary = (data) => {
      if (data[0] !== 1) throw new Error("invalid compact binary data");
      const created = create();
      created.transforms = mat4.clone(data.slice(1, 17));
      const numberOfVertices = data[21];
      let ci = 22;
      let vi = data.length - numberOfVertices * 3;
      while (vi < data.length) {
        const verticesPerPolygon = data[ci];
        ci++;
        const vertices = [];
        for (let i = 0; i < verticesPerPolygon; i++) {
          vertices.push(vec3.fromValues(data[vi], data[vi + 1], data[vi + 2]));
          vi += 3;
        }
        created.polygons.push(poly3.create(vertices));
      }
      if (data[17] >= 0) {
        created.color = [data[17], data[18], data[19], data[20]];
      }
      return created;
    };
    module.exports = fromCompactBinary;
  }
});

// node_modules/@jscad/modeling/src/geometries/geom3/applyTransforms.js
var require_applyTransforms2 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/geom3/applyTransforms.js"(exports, module) {
    "use strict";
    var mat4 = require_mat4();
    var poly3 = require_poly3();
    var applyTransforms = (geometry) => {
      if (mat4.isIdentity(geometry.transforms)) return geometry;
      geometry.polygons = geometry.polygons.map((polygon3) => poly3.transform(geometry.transforms, polygon3));
      geometry.transforms = mat4.create();
      return geometry;
    };
    module.exports = applyTransforms;
  }
});

// node_modules/@jscad/modeling/src/geometries/geom3/toPolygons.js
var require_toPolygons = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/geom3/toPolygons.js"(exports, module) {
    "use strict";
    var applyTransforms = require_applyTransforms2();
    var toPolygons4 = (geometry) => applyTransforms(geometry).polygons;
    module.exports = toPolygons4;
  }
});

// node_modules/@jscad/modeling/src/geometries/geom3/invert.js
var require_invert3 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/geom3/invert.js"(exports, module) {
    "use strict";
    var poly3 = require_poly3();
    var create = require_create5();
    var toPolygons4 = require_toPolygons();
    var invert = (geometry) => {
      const polygons = toPolygons4(geometry);
      const newpolygons = polygons.map((polygon3) => poly3.invert(polygon3));
      return create(newpolygons);
    };
    module.exports = invert;
  }
});

// node_modules/@jscad/modeling/src/geometries/geom3/isA.js
var require_isA3 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/geom3/isA.js"(exports, module) {
    "use strict";
    var isA = (object) => {
      if (object && typeof object === "object") {
        if ("polygons" in object && "transforms" in object) {
          if (Array.isArray(object.polygons) && "length" in object.transforms) {
            return true;
          }
        }
      }
      return false;
    };
    module.exports = isA;
  }
});

// node_modules/@jscad/modeling/src/geometries/geom3/isConvex.js
var require_isConvex2 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/geom3/isConvex.js"(exports, module) {
    "use strict";
    var { EPS } = require_constants();
    var vec3 = require_vec3();
    var geom34 = require_isA3();
    var toPolygons4 = require_toPolygons();
    var poly3 = require_poly3();
    var isConvex = (geometry) => {
      if (!geom34(geometry)) {
        throw new Error("isConvex requires a geom3 geometry");
      }
      const polygons = toPolygons4(geometry);
      if (polygons.length === 0) {
        return true;
      }
      const vertices = [];
      const found = /* @__PURE__ */ new Set();
      for (let i = 0; i < polygons.length; i++) {
        const verts = polygons[i].vertices;
        for (let j = 0; j < verts.length; j++) {
          const v = verts[j];
          const key = `${v[0]},${v[1]},${v[2]}`;
          if (!found.has(key)) {
            found.add(key);
            vertices.push(v);
          }
        }
      }
      for (let i = 0; i < polygons.length; i++) {
        const plane = poly3.plane(polygons[i]);
        for (let j = 0; j < vertices.length; j++) {
          const v = vertices[j];
          const distance = vec3.dot(plane, v) - plane[3];
          if (distance > EPS) {
            return false;
          }
        }
      }
      return true;
    };
    module.exports = isConvex;
  }
});

// node_modules/@jscad/modeling/src/geometries/geom3/toPoints.js
var require_toPoints3 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/geom3/toPoints.js"(exports, module) {
    "use strict";
    var poly3 = require_poly3();
    var toPolygons4 = require_toPolygons();
    var toPoints = (geometry) => {
      const polygons = toPolygons4(geometry);
      const listofpoints = polygons.map((polygon3) => poly3.toPoints(polygon3));
      return listofpoints;
    };
    module.exports = toPoints;
  }
});

// node_modules/@jscad/modeling/src/geometries/geom3/toString.js
var require_toString7 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/geom3/toString.js"(exports, module) {
    "use strict";
    var poly3 = require_poly3();
    var toPolygons4 = require_toPolygons();
    var toString = (geometry) => {
      const polygons = toPolygons4(geometry);
      let result = "geom3 (" + polygons.length + " polygons):\n";
      polygons.forEach((polygon3) => {
        result += "  " + poly3.toString(polygon3) + "\n";
      });
      return result;
    };
    module.exports = toString;
  }
});

// node_modules/@jscad/modeling/src/geometries/geom3/toCompactBinary.js
var require_toCompactBinary2 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/geom3/toCompactBinary.js"(exports, module) {
    "use strict";
    var poly3 = require_poly3();
    var toCompactBinary = (geometry) => {
      const polygons = geometry.polygons;
      const transforms = geometry.transforms;
      const numberOfPolygons = polygons.length;
      const numberOfVertices = polygons.reduce((count, polygon3) => count + polygon3.vertices.length, 0);
      let color = [-1, -1, -1, -1];
      if (geometry.color) color = geometry.color;
      const compacted = new Float32Array(1 + 16 + 4 + 1 + numberOfPolygons + numberOfVertices * 3);
      compacted[0] = 1;
      compacted[1] = transforms[0];
      compacted[2] = transforms[1];
      compacted[3] = transforms[2];
      compacted[4] = transforms[3];
      compacted[5] = transforms[4];
      compacted[6] = transforms[5];
      compacted[7] = transforms[6];
      compacted[8] = transforms[7];
      compacted[9] = transforms[8];
      compacted[10] = transforms[9];
      compacted[11] = transforms[10];
      compacted[12] = transforms[11];
      compacted[13] = transforms[12];
      compacted[14] = transforms[13];
      compacted[15] = transforms[14];
      compacted[16] = transforms[15];
      compacted[17] = color[0];
      compacted[18] = color[1];
      compacted[19] = color[2];
      compacted[20] = color[3];
      compacted[21] = numberOfVertices;
      let ci = 22;
      let vi = ci + numberOfPolygons;
      polygons.forEach((polygon3) => {
        const points = poly3.toPoints(polygon3);
        compacted[ci] = points.length;
        ci++;
        for (let i = 0; i < points.length; i++) {
          const point = points[i];
          compacted[vi + 0] = point[0];
          compacted[vi + 1] = point[1];
          compacted[vi + 2] = point[2];
          vi += 3;
        }
      });
      return compacted;
    };
    module.exports = toCompactBinary;
  }
});

// node_modules/@jscad/modeling/src/geometries/geom3/transform.js
var require_transform7 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/geom3/transform.js"(exports, module) {
    "use strict";
    var mat4 = require_mat4();
    var transform = (matrix, geometry) => {
      const transforms = mat4.multiply(mat4.create(), matrix, geometry.transforms);
      return Object.assign({}, geometry, { transforms });
    };
    module.exports = transform;
  }
});

// node_modules/@jscad/modeling/src/geometries/geom3/validate.js
var require_validate3 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/geom3/validate.js"(exports, module) {
    "use strict";
    var poly3 = require_poly3();
    var isA = require_isA3();
    var validate = (object) => {
      if (!isA(object)) {
        throw new Error("invalid geom3 structure");
      }
      object.polygons.forEach(poly3.validate);
      validateManifold(object);
      if (!object.transforms.every(Number.isFinite)) {
        throw new Error(`geom3 invalid transforms ${object.transforms}`);
      }
    };
    var validateManifold = (object) => {
      const edgeCount = /* @__PURE__ */ new Map();
      object.polygons.forEach(({ vertices }) => {
        vertices.forEach((v, i) => {
          const v1 = `${v}`;
          const v2 = `${vertices[(i + 1) % vertices.length]}`;
          const edge = `${v1}/${v2}`;
          const count = edgeCount.has(edge) ? edgeCount.get(edge) : 0;
          edgeCount.set(edge, count + 1);
        });
      });
      const nonManifold = [];
      edgeCount.forEach((count, edge) => {
        const complementEdge = edge.split("/").reverse().join("/");
        const complementCount = edgeCount.get(complementEdge);
        if (count !== complementCount) {
          nonManifold.push(edge.replace("/", " -> "));
        }
      });
      if (nonManifold.length > 0) {
        throw new Error(`non-manifold edges ${nonManifold.length}
${nonManifold.join("\n")}`);
      }
    };
    module.exports = validate;
  }
});

// node_modules/@jscad/modeling/src/geometries/geom3/index.js
var require_geom3 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/geom3/index.js"(exports, module) {
    "use strict";
    module.exports = {
      clone: require_clone5(),
      create: require_create5(),
      fromPointsConvex: require_fromPointsConvex(),
      fromPoints: require_fromPoints4(),
      fromCompactBinary: require_fromCompactBinary2(),
      invert: require_invert3(),
      isA: require_isA3(),
      isConvex: require_isConvex2(),
      toPoints: require_toPoints3(),
      toPolygons: require_toPolygons(),
      toString: require_toString7(),
      toCompactBinary: require_toCompactBinary2(),
      transform: require_transform7(),
      validate: require_validate3()
    };
  }
});

// node_modules/@jscad/modeling/src/geometries/path2/clone.js
var require_clone8 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/path2/clone.js"(exports, module) {
    "use strict";
    var clone = (geometry) => Object.assign({}, geometry);
    module.exports = clone;
  }
});

// node_modules/@jscad/modeling/src/geometries/path2/close.js
var require_close = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/path2/close.js"(exports, module) {
    "use strict";
    var { EPS } = require_constants();
    var vec2 = require_vec2();
    var clone = require_clone8();
    var close = (geometry) => {
      if (geometry.isClosed) return geometry;
      const cloned = clone(geometry);
      cloned.isClosed = true;
      if (cloned.points.length > 1) {
        const points = cloned.points;
        const p0 = points[0];
        let pn = points[points.length - 1];
        while (vec2.distance(p0, pn) < EPS * EPS) {
          points.pop();
          if (points.length === 1) break;
          pn = points[points.length - 1];
        }
      }
      return cloned;
    };
    module.exports = close;
  }
});

// node_modules/@jscad/modeling/src/geometries/path2/create.js
var require_create8 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/path2/create.js"(exports, module) {
    "use strict";
    var mat4 = require_mat4();
    var create = (points) => {
      if (points === void 0) {
        points = [];
      }
      return {
        points,
        isClosed: false,
        transforms: mat4.create()
      };
    };
    module.exports = create;
  }
});

// node_modules/@jscad/modeling/src/geometries/path2/fromPoints.js
var require_fromPoints5 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/path2/fromPoints.js"(exports, module) {
    "use strict";
    var { EPS } = require_constants();
    var vec2 = require_vec2();
    var close = require_close();
    var create = require_create8();
    var fromPoints = (options, points) => {
      const defaults = { closed: false };
      let { closed } = Object.assign({}, defaults, options);
      let created = create();
      created.points = points.map((point) => vec2.clone(point));
      if (created.points.length > 1) {
        const p0 = created.points[0];
        const pn = created.points[created.points.length - 1];
        if (vec2.distance(p0, pn) < EPS * EPS) {
          closed = true;
        }
      }
      if (closed === true) created = close(created);
      return created;
    };
    module.exports = fromPoints;
  }
});

// node_modules/@jscad/modeling/src/geometries/path2/applyTransforms.js
var require_applyTransforms3 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/path2/applyTransforms.js"(exports, module) {
    "use strict";
    var mat4 = require_mat4();
    var vec2 = require_vec2();
    var applyTransforms = (geometry) => {
      if (mat4.isIdentity(geometry.transforms)) return geometry;
      geometry.points = geometry.points.map((point) => vec2.transform(vec2.create(), point, geometry.transforms));
      geometry.transforms = mat4.create();
      return geometry;
    };
    module.exports = applyTransforms;
  }
});

// node_modules/@jscad/modeling/src/geometries/path2/toPoints.js
var require_toPoints4 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/path2/toPoints.js"(exports, module) {
    "use strict";
    var applyTransforms = require_applyTransforms3();
    var toPoints = (geometry) => applyTransforms(geometry).points;
    module.exports = toPoints;
  }
});

// node_modules/@jscad/modeling/src/geometries/path2/appendArc.js
var require_appendArc = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/path2/appendArc.js"(exports, module) {
    "use strict";
    var { TAU } = require_constants();
    var vec2 = require_vec2();
    var fromPoints = require_fromPoints5();
    var toPoints = require_toPoints4();
    var appendArc = (options, geometry) => {
      const defaults = {
        radius: [0, 0],
        // X and Y radius
        xaxisrotation: 0,
        clockwise: false,
        large: false,
        segments: 16
      };
      let { endpoint, radius, xaxisrotation, clockwise, large, segments } = Object.assign({}, defaults, options);
      if (!Array.isArray(endpoint)) throw new Error("endpoint must be an array of X and Y values");
      if (endpoint.length < 2) throw new Error("endpoint must contain X and Y values");
      endpoint = vec2.clone(endpoint);
      if (!Array.isArray(radius)) throw new Error("radius must be an array of X and Y values");
      if (radius.length < 2) throw new Error("radius must contain X and Y values");
      if (segments < 4) throw new Error("segments must be four or more");
      const decimals = 1e5;
      if (geometry.isClosed) {
        throw new Error("the given path cannot be closed");
      }
      const points = toPoints(geometry);
      if (points.length < 1) {
        throw new Error("the given path must contain one or more points (as the starting point for the arc)");
      }
      let xradius = radius[0];
      let yradius = radius[1];
      const startpoint = points[points.length - 1];
      xradius = Math.round(xradius * decimals) / decimals;
      yradius = Math.round(yradius * decimals) / decimals;
      endpoint = vec2.fromValues(Math.round(endpoint[0] * decimals) / decimals, Math.round(endpoint[1] * decimals) / decimals);
      const sweepFlag = !clockwise;
      let newpoints = [];
      if (xradius === 0 || yradius === 0) {
        newpoints.push(endpoint);
      } else {
        xradius = Math.abs(xradius);
        yradius = Math.abs(yradius);
        const phi = xaxisrotation;
        const cosphi = Math.cos(phi);
        const sinphi = Math.sin(phi);
        const minushalfdistance = vec2.subtract(vec2.create(), startpoint, endpoint);
        vec2.scale(minushalfdistance, minushalfdistance, 0.5);
        const x = Math.round((cosphi * minushalfdistance[0] + sinphi * minushalfdistance[1]) * decimals) / decimals;
        const y = Math.round((-sinphi * minushalfdistance[0] + cosphi * minushalfdistance[1]) * decimals) / decimals;
        const startTranslated = vec2.fromValues(x, y);
        const biglambda = startTranslated[0] * startTranslated[0] / (xradius * xradius) + startTranslated[1] * startTranslated[1] / (yradius * yradius);
        if (biglambda > 1) {
          const sqrtbiglambda = Math.sqrt(biglambda);
          xradius *= sqrtbiglambda;
          yradius *= sqrtbiglambda;
          xradius = Math.round(xradius * decimals) / decimals;
          yradius = Math.round(yradius * decimals) / decimals;
        }
        let multiplier1 = Math.sqrt((xradius * xradius * yradius * yradius - xradius * xradius * startTranslated[1] * startTranslated[1] - yradius * yradius * startTranslated[0] * startTranslated[0]) / (xradius * xradius * startTranslated[1] * startTranslated[1] + yradius * yradius * startTranslated[0] * startTranslated[0]));
        if (sweepFlag === large) multiplier1 = -multiplier1;
        const centerTranslated = vec2.fromValues(xradius * startTranslated[1] / yradius, -yradius * startTranslated[0] / xradius);
        vec2.scale(centerTranslated, centerTranslated, multiplier1);
        let center = vec2.fromValues(cosphi * centerTranslated[0] - sinphi * centerTranslated[1], sinphi * centerTranslated[0] + cosphi * centerTranslated[1]);
        center = vec2.add(center, center, vec2.scale(vec2.create(), vec2.add(vec2.create(), startpoint, endpoint), 0.5));
        const vector1 = vec2.fromValues((startTranslated[0] - centerTranslated[0]) / xradius, (startTranslated[1] - centerTranslated[1]) / yradius);
        const vector2 = vec2.fromValues((-startTranslated[0] - centerTranslated[0]) / xradius, (-startTranslated[1] - centerTranslated[1]) / yradius);
        const theta1 = vec2.angleRadians(vector1);
        const theta2 = vec2.angleRadians(vector2);
        let deltatheta = theta2 - theta1;
        deltatheta = deltatheta % TAU;
        if (!sweepFlag && deltatheta > 0) {
          deltatheta -= TAU;
        } else if (sweepFlag && deltatheta < 0) {
          deltatheta += TAU;
        }
        let numsteps = Math.floor(segments * (Math.abs(deltatheta) / TAU));
        if (numsteps < 1) numsteps = 1;
        for (let step = 1; step < numsteps; step++) {
          const theta = theta1 + step / numsteps * deltatheta;
          const costheta = Math.cos(theta);
          const sintheta = Math.sin(theta);
          const point = vec2.fromValues(cosphi * xradius * costheta - sinphi * yradius * sintheta, sinphi * xradius * costheta + cosphi * yradius * sintheta);
          vec2.add(point, point, center);
          newpoints.push(point);
        }
        if (numsteps) newpoints.push(options.endpoint);
      }
      newpoints = points.concat(newpoints);
      const result = fromPoints({}, newpoints);
      return result;
    };
    module.exports = appendArc;
  }
});

// node_modules/@jscad/modeling/src/geometries/path2/concat.js
var require_concat = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/path2/concat.js"(exports, module) {
    "use strict";
    var fromPoints = require_fromPoints5();
    var toPoints = require_toPoints4();
    var { equals } = require_vec2();
    var concat = (...paths) => {
      let isClosed = false;
      let newpoints = [];
      paths.forEach((path, i) => {
        const tmp = toPoints(path).slice();
        if (newpoints.length > 0 && tmp.length > 0 && equals(tmp[0], newpoints[newpoints.length - 1])) tmp.shift();
        if (tmp.length > 0 && isClosed) {
          throw new Error(`Cannot concatenate to a closed path; check the ${i}th path`);
        }
        isClosed = path.isClosed;
        newpoints = newpoints.concat(tmp);
      });
      return fromPoints({ closed: isClosed }, newpoints);
    };
    module.exports = concat;
  }
});

// node_modules/@jscad/modeling/src/geometries/path2/appendPoints.js
var require_appendPoints = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/path2/appendPoints.js"(exports, module) {
    "use strict";
    var concat = require_concat();
    var create = require_create8();
    var appendPoints = (points, geometry) => concat(geometry, create(points));
    module.exports = appendPoints;
  }
});

// node_modules/@jscad/modeling/src/geometries/path2/appendBezier.js
var require_appendBezier = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/path2/appendBezier.js"(exports, module) {
    "use strict";
    var { TAU } = require_constants();
    var vec2 = require_vec2();
    var vec3 = require_vec2();
    var appendPoints = require_appendPoints();
    var toPoints = require_toPoints4();
    var appendBezier = (options, geometry) => {
      const defaults = {
        segments: 16
      };
      let { controlPoints, segments } = Object.assign({}, defaults, options);
      if (!Array.isArray(controlPoints)) throw new Error("controlPoints must be an array of one or more points");
      if (controlPoints.length < 1) throw new Error("controlPoints must be an array of one or more points");
      if (segments < 4) throw new Error("segments must be four or more");
      if (geometry.isClosed) {
        throw new Error("the given geometry cannot be closed");
      }
      const points = toPoints(geometry);
      if (points.length < 1) {
        throw new Error("the given path must contain one or more points (as the starting point for the bezier curve)");
      }
      controlPoints = controlPoints.slice();
      const firstControlPoint = controlPoints[0];
      if (firstControlPoint === null) {
        if (controlPoints.length < 2) {
          throw new Error("a null control point must be passed with one more control points");
        }
        let lastBezierControlPoint = points[points.length - 2];
        if ("lastBezierControlPoint" in geometry) {
          lastBezierControlPoint = geometry.lastBezierControlPoint;
        }
        if (!Array.isArray(lastBezierControlPoint)) {
          throw new Error("the given path must contain TWO or more points if given a null control point");
        }
        const controlpoint = vec2.scale(vec2.create(), points[points.length - 1], 2);
        vec2.subtract(controlpoint, controlpoint, lastBezierControlPoint);
        controlPoints[0] = controlpoint;
      }
      controlPoints.unshift(points[points.length - 1]);
      const bezierOrder = controlPoints.length - 1;
      const factorials = [];
      let fact = 1;
      for (let i = 0; i <= bezierOrder; ++i) {
        if (i > 0) fact *= i;
        factorials.push(fact);
      }
      const binomials = [];
      for (let i = 0; i <= bezierOrder; ++i) {
        const binomial = factorials[bezierOrder] / (factorials[i] * factorials[bezierOrder - i]);
        binomials.push(binomial);
      }
      const v0 = vec2.create();
      const v1 = vec2.create();
      const v3 = vec3.create();
      const getPointForT = (t) => {
        let tk = 1;
        let oneMinusTNMinusK = Math.pow(1 - t, bezierOrder);
        const invOneMinusT = t !== 1 ? 1 / (1 - t) : 1;
        const point = vec2.create();
        for (let k = 0; k <= bezierOrder; ++k) {
          if (k === bezierOrder) oneMinusTNMinusK = 1;
          const bernsteinCoefficient = binomials[k] * tk * oneMinusTNMinusK;
          const derivativePoint = vec2.scale(v0, controlPoints[k], bernsteinCoefficient);
          vec2.add(point, point, derivativePoint);
          tk *= t;
          oneMinusTNMinusK *= invOneMinusT;
        }
        return point;
      };
      const newpoints = [];
      const newpointsT = [];
      const numsteps = bezierOrder + 1;
      for (let i = 0; i < numsteps; ++i) {
        const t = i / (numsteps - 1);
        const point = getPointForT(t);
        newpoints.push(point);
        newpointsT.push(t);
      }
      let subdivideBase = 1;
      const maxangle = TAU / segments;
      const maxsinangle = Math.sin(maxangle);
      while (subdivideBase < newpoints.length - 1) {
        const dir1 = vec2.subtract(v0, newpoints[subdivideBase], newpoints[subdivideBase - 1]);
        vec2.normalize(dir1, dir1);
        const dir2 = vec2.subtract(v1, newpoints[subdivideBase + 1], newpoints[subdivideBase]);
        vec2.normalize(dir2, dir2);
        const sinangle = vec2.cross(v3, dir1, dir2);
        if (Math.abs(sinangle[2]) > maxsinangle) {
          const t0 = newpointsT[subdivideBase - 1];
          const t1 = newpointsT[subdivideBase + 1];
          const newt0 = t0 + (t1 - t0) * 1 / 3;
          const newt1 = t0 + (t1 - t0) * 2 / 3;
          const point0 = getPointForT(newt0);
          const point1 = getPointForT(newt1);
          newpoints.splice(subdivideBase, 1, point0, point1);
          newpointsT.splice(subdivideBase, 1, newt0, newt1);
          subdivideBase--;
          if (subdivideBase < 1) subdivideBase = 1;
        } else {
          ++subdivideBase;
        }
      }
      newpoints.shift();
      const result = appendPoints(newpoints, geometry);
      result.lastBezierControlPoint = controlPoints[controlPoints.length - 2];
      return result;
    };
    module.exports = appendBezier;
  }
});

// node_modules/@jscad/modeling/src/geometries/path2/equals.js
var require_equals5 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/path2/equals.js"(exports, module) {
    "use strict";
    var vec2 = require_vec2();
    var toPoints = require_toPoints4();
    var equals = (a, b) => {
      if (a.isClosed !== b.isClosed) {
        return false;
      }
      if (a.points.length !== b.points.length) {
        return false;
      }
      const apoints = toPoints(a);
      const bpoints = toPoints(b);
      const length = apoints.length;
      let offset = 0;
      do {
        let unequal = false;
        for (let i = 0; i < length; i++) {
          if (!vec2.equals(apoints[i], bpoints[(i + offset) % length])) {
            unequal = true;
            break;
          }
        }
        if (unequal === false) {
          return true;
        }
        if (!a.isClosed) {
          return false;
        }
      } while (++offset < length);
      return false;
    };
    module.exports = equals;
  }
});

// node_modules/@jscad/modeling/src/geometries/path2/fromCompactBinary.js
var require_fromCompactBinary3 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/path2/fromCompactBinary.js"(exports, module) {
    "use strict";
    var mat4 = require_mat4();
    var vec2 = require_vec2();
    var create = require_create8();
    var fromCompactBinary = (data) => {
      if (data[0] !== 2) throw new Error("invalid compact binary data");
      const created = create();
      created.transforms = mat4.clone(data.slice(1, 17));
      created.isClosed = !!data[17];
      for (let i = 22; i < data.length; i += 2) {
        const point = vec2.fromValues(data[i], data[i + 1]);
        created.points.push(point);
      }
      if (data[18] >= 0) {
        created.color = [data[18], data[19], data[20], data[21]];
      }
      return created;
    };
    module.exports = fromCompactBinary;
  }
});

// node_modules/@jscad/modeling/src/geometries/path2/isA.js
var require_isA4 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/path2/isA.js"(exports, module) {
    "use strict";
    var isA = (object) => {
      if (object && typeof object === "object") {
        if ("points" in object && "transforms" in object && "isClosed" in object) {
          if (Array.isArray(object.points) && "length" in object.transforms) {
            return true;
          }
        }
      }
      return false;
    };
    module.exports = isA;
  }
});

// node_modules/@jscad/modeling/src/geometries/path2/reverse.js
var require_reverse2 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/path2/reverse.js"(exports, module) {
    "use strict";
    var clone = require_clone8();
    var reverse = (geometry) => {
      const cloned = clone(geometry);
      cloned.points = geometry.points.slice().reverse();
      return cloned;
    };
    module.exports = reverse;
  }
});

// node_modules/@jscad/modeling/src/geometries/path2/toString.js
var require_toString8 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/path2/toString.js"(exports, module) {
    "use strict";
    var vec2 = require_vec2();
    var toPoints = require_toPoints4();
    var toString = (geometry) => {
      const points = toPoints(geometry);
      let result = "path (" + points.length + " points, " + geometry.isClosed + "):\n[\n";
      points.forEach((point) => {
        result += "  " + vec2.toString(point) + ",\n";
      });
      result += "]\n";
      return result;
    };
    module.exports = toString;
  }
});

// node_modules/@jscad/modeling/src/geometries/path2/toCompactBinary.js
var require_toCompactBinary3 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/path2/toCompactBinary.js"(exports, module) {
    "use strict";
    var toCompactBinary = (geometry) => {
      const points = geometry.points;
      const transforms = geometry.transforms;
      let color = [-1, -1, -1, -1];
      if (geometry.color) color = geometry.color;
      const compacted = new Float32Array(1 + 16 + 1 + 4 + points.length * 2);
      compacted[0] = 2;
      compacted[1] = transforms[0];
      compacted[2] = transforms[1];
      compacted[3] = transforms[2];
      compacted[4] = transforms[3];
      compacted[5] = transforms[4];
      compacted[6] = transforms[5];
      compacted[7] = transforms[6];
      compacted[8] = transforms[7];
      compacted[9] = transforms[8];
      compacted[10] = transforms[9];
      compacted[11] = transforms[10];
      compacted[12] = transforms[11];
      compacted[13] = transforms[12];
      compacted[14] = transforms[13];
      compacted[15] = transforms[14];
      compacted[16] = transforms[15];
      compacted[17] = geometry.isClosed ? 1 : 0;
      compacted[18] = color[0];
      compacted[19] = color[1];
      compacted[20] = color[2];
      compacted[21] = color[3];
      for (let j = 0; j < points.length; j++) {
        const ci = j * 2 + 22;
        const point = points[j];
        compacted[ci] = point[0];
        compacted[ci + 1] = point[1];
      }
      return compacted;
    };
    module.exports = toCompactBinary;
  }
});

// node_modules/@jscad/modeling/src/geometries/path2/transform.js
var require_transform8 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/path2/transform.js"(exports, module) {
    "use strict";
    var mat4 = require_mat4();
    var transform = (matrix, geometry) => {
      const transforms = mat4.multiply(mat4.create(), matrix, geometry.transforms);
      return Object.assign({}, geometry, { transforms });
    };
    module.exports = transform;
  }
});

// node_modules/@jscad/modeling/src/geometries/path2/validate.js
var require_validate4 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/path2/validate.js"(exports, module) {
    "use strict";
    var vec2 = require_vec2();
    var isA = require_isA4();
    var validate = (object) => {
      if (!isA(object)) {
        throw new Error("invalid path2 structure");
      }
      if (object.points.length > 1) {
        for (let i = 0; i < object.points.length; i++) {
          if (vec2.equals(object.points[i], object.points[(i + 1) % object.points.length])) {
            throw new Error(`path2 duplicate points ${object.points[i]}`);
          }
        }
      }
      object.points.forEach((point) => {
        if (!point.every(Number.isFinite)) {
          throw new Error(`path2 invalid point ${point}`);
        }
      });
      if (!object.transforms.every(Number.isFinite)) {
        throw new Error(`path2 invalid transforms ${object.transforms}`);
      }
    };
    module.exports = validate;
  }
});

// node_modules/@jscad/modeling/src/geometries/path2/index.js
var require_path2 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/path2/index.js"(exports, module) {
    "use strict";
    module.exports = {
      appendArc: require_appendArc(),
      appendBezier: require_appendBezier(),
      appendPoints: require_appendPoints(),
      clone: require_clone8(),
      close: require_close(),
      concat: require_concat(),
      create: require_create8(),
      equals: require_equals5(),
      fromPoints: require_fromPoints5(),
      fromCompactBinary: require_fromCompactBinary3(),
      isA: require_isA4(),
      reverse: require_reverse2(),
      toPoints: require_toPoints4(),
      toString: require_toString8(),
      toCompactBinary: require_toCompactBinary3(),
      transform: require_transform8(),
      validate: require_validate4()
    };
  }
});

// node_modules/@jscad/modeling/src/colors/colorize.js
var require_colorize = __commonJS({
  "node_modules/@jscad/modeling/src/colors/colorize.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var geom2 = require_geom2();
    var geom34 = require_geom3();
    var path2 = require_path2();
    var poly3 = require_poly3();
    var colorGeom2 = (color, object) => {
      const newgeom2 = geom2.clone(object);
      newgeom2.color = color;
      return newgeom2;
    };
    var colorGeom3 = (color, object) => {
      const newgeom3 = geom34.clone(object);
      newgeom3.color = color;
      return newgeom3;
    };
    var colorPath2 = (color, object) => {
      const newpath2 = path2.clone(object);
      newpath2.color = color;
      return newpath2;
    };
    var colorPoly3 = (color, object) => {
      const newpoly = poly3.clone(object);
      newpoly.color = color;
      return newpoly;
    };
    var colorize = (color, ...objects) => {
      if (!Array.isArray(color)) throw new Error("color must be an array");
      if (color.length < 3) throw new Error("color must contain R, G and B values");
      if (color.length === 3) color = [color[0], color[1], color[2], 1];
      objects = flatten(objects);
      if (objects.length === 0) throw new Error("wrong number of arguments");
      const results = objects.map((object) => {
        if (geom2.isA(object)) return colorGeom2(color, object);
        if (geom34.isA(object)) return colorGeom3(color, object);
        if (path2.isA(object)) return colorPath2(color, object);
        if (poly3.isA(object)) return colorPoly3(color, object);
        object.color = color;
        return object;
      });
      return results.length === 1 ? results[0] : results;
    };
    module.exports = colorize;
  }
});

// node_modules/@jscad/modeling/src/colors/cssColors.js
var require_cssColors = __commonJS({
  "node_modules/@jscad/modeling/src/colors/cssColors.js"(exports, module) {
    "use strict";
    var cssColors = {
      // basic color keywords
      black: [0 / 255, 0 / 255, 0 / 255],
      silver: [192 / 255, 192 / 255, 192 / 255],
      gray: [128 / 255, 128 / 255, 128 / 255],
      white: [255 / 255, 255 / 255, 255 / 255],
      maroon: [128 / 255, 0 / 255, 0 / 255],
      red: [255 / 255, 0 / 255, 0 / 255],
      purple: [128 / 255, 0 / 255, 128 / 255],
      fuchsia: [255 / 255, 0 / 255, 255 / 255],
      green: [0 / 255, 128 / 255, 0 / 255],
      lime: [0 / 255, 255 / 255, 0 / 255],
      olive: [128 / 255, 128 / 255, 0 / 255],
      yellow: [255 / 255, 255 / 255, 0 / 255],
      navy: [0 / 255, 0 / 255, 128 / 255],
      blue: [0 / 255, 0 / 255, 255 / 255],
      teal: [0 / 255, 128 / 255, 128 / 255],
      aqua: [0 / 255, 255 / 255, 255 / 255],
      // extended color keywords
      aliceblue: [240 / 255, 248 / 255, 255 / 255],
      antiquewhite: [250 / 255, 235 / 255, 215 / 255],
      // 'aqua': [ 0 / 255, 255 / 255, 255 / 255 ],
      aquamarine: [127 / 255, 255 / 255, 212 / 255],
      azure: [240 / 255, 255 / 255, 255 / 255],
      beige: [245 / 255, 245 / 255, 220 / 255],
      bisque: [255 / 255, 228 / 255, 196 / 255],
      // 'black': [ 0 / 255, 0 / 255, 0 / 255 ],
      blanchedalmond: [255 / 255, 235 / 255, 205 / 255],
      // 'blue': [ 0 / 255, 0 / 255, 255 / 255 ],
      blueviolet: [138 / 255, 43 / 255, 226 / 255],
      brown: [165 / 255, 42 / 255, 42 / 255],
      burlywood: [222 / 255, 184 / 255, 135 / 255],
      cadetblue: [95 / 255, 158 / 255, 160 / 255],
      chartreuse: [127 / 255, 255 / 255, 0 / 255],
      chocolate: [210 / 255, 105 / 255, 30 / 255],
      coral: [255 / 255, 127 / 255, 80 / 255],
      cornflowerblue: [100 / 255, 149 / 255, 237 / 255],
      cornsilk: [255 / 255, 248 / 255, 220 / 255],
      crimson: [220 / 255, 20 / 255, 60 / 255],
      cyan: [0 / 255, 255 / 255, 255 / 255],
      darkblue: [0 / 255, 0 / 255, 139 / 255],
      darkcyan: [0 / 255, 139 / 255, 139 / 255],
      darkgoldenrod: [184 / 255, 134 / 255, 11 / 255],
      darkgray: [169 / 255, 169 / 255, 169 / 255],
      darkgreen: [0 / 255, 100 / 255, 0 / 255],
      darkgrey: [169 / 255, 169 / 255, 169 / 255],
      darkkhaki: [189 / 255, 183 / 255, 107 / 255],
      darkmagenta: [139 / 255, 0 / 255, 139 / 255],
      darkolivegreen: [85 / 255, 107 / 255, 47 / 255],
      darkorange: [255 / 255, 140 / 255, 0 / 255],
      darkorchid: [153 / 255, 50 / 255, 204 / 255],
      darkred: [139 / 255, 0 / 255, 0 / 255],
      darksalmon: [233 / 255, 150 / 255, 122 / 255],
      darkseagreen: [143 / 255, 188 / 255, 143 / 255],
      darkslateblue: [72 / 255, 61 / 255, 139 / 255],
      darkslategray: [47 / 255, 79 / 255, 79 / 255],
      darkslategrey: [47 / 255, 79 / 255, 79 / 255],
      darkturquoise: [0 / 255, 206 / 255, 209 / 255],
      darkviolet: [148 / 255, 0 / 255, 211 / 255],
      deeppink: [255 / 255, 20 / 255, 147 / 255],
      deepskyblue: [0 / 255, 191 / 255, 255 / 255],
      dimgray: [105 / 255, 105 / 255, 105 / 255],
      dimgrey: [105 / 255, 105 / 255, 105 / 255],
      dodgerblue: [30 / 255, 144 / 255, 255 / 255],
      firebrick: [178 / 255, 34 / 255, 34 / 255],
      floralwhite: [255 / 255, 250 / 255, 240 / 255],
      forestgreen: [34 / 255, 139 / 255, 34 / 255],
      // 'fuchsia': [ 255 / 255, 0 / 255, 255 / 255 ],
      gainsboro: [220 / 255, 220 / 255, 220 / 255],
      ghostwhite: [248 / 255, 248 / 255, 255 / 255],
      gold: [255 / 255, 215 / 255, 0 / 255],
      goldenrod: [218 / 255, 165 / 255, 32 / 255],
      // 'gray': [ 128 / 255, 128 / 255, 128 / 255 ],
      // 'green': [ 0 / 255, 128 / 255, 0 / 255 ],
      greenyellow: [173 / 255, 255 / 255, 47 / 255],
      grey: [128 / 255, 128 / 255, 128 / 255],
      honeydew: [240 / 255, 255 / 255, 240 / 255],
      hotpink: [255 / 255, 105 / 255, 180 / 255],
      indianred: [205 / 255, 92 / 255, 92 / 255],
      indigo: [75 / 255, 0 / 255, 130 / 255],
      ivory: [255 / 255, 255 / 255, 240 / 255],
      khaki: [240 / 255, 230 / 255, 140 / 255],
      lavender: [230 / 255, 230 / 255, 250 / 255],
      lavenderblush: [255 / 255, 240 / 255, 245 / 255],
      lawngreen: [124 / 255, 252 / 255, 0 / 255],
      lemonchiffon: [255 / 255, 250 / 255, 205 / 255],
      lightblue: [173 / 255, 216 / 255, 230 / 255],
      lightcoral: [240 / 255, 128 / 255, 128 / 255],
      lightcyan: [224 / 255, 255 / 255, 255 / 255],
      lightgoldenrodyellow: [250 / 255, 250 / 255, 210 / 255],
      lightgray: [211 / 255, 211 / 255, 211 / 255],
      lightgreen: [144 / 255, 238 / 255, 144 / 255],
      lightgrey: [211 / 255, 211 / 255, 211 / 255],
      lightpink: [255 / 255, 182 / 255, 193 / 255],
      lightsalmon: [255 / 255, 160 / 255, 122 / 255],
      lightseagreen: [32 / 255, 178 / 255, 170 / 255],
      lightskyblue: [135 / 255, 206 / 255, 250 / 255],
      lightslategray: [119 / 255, 136 / 255, 153 / 255],
      lightslategrey: [119 / 255, 136 / 255, 153 / 255],
      lightsteelblue: [176 / 255, 196 / 255, 222 / 255],
      lightyellow: [255 / 255, 255 / 255, 224 / 255],
      // 'lime': [ 0 / 255, 255 / 255, 0 / 255 ],
      limegreen: [50 / 255, 205 / 255, 50 / 255],
      linen: [250 / 255, 240 / 255, 230 / 255],
      magenta: [255 / 255, 0 / 255, 255 / 255],
      // 'maroon': [ 128 / 255, 0 / 255, 0 / 255 ],
      mediumaquamarine: [102 / 255, 205 / 255, 170 / 255],
      mediumblue: [0 / 255, 0 / 255, 205 / 255],
      mediumorchid: [186 / 255, 85 / 255, 211 / 255],
      mediumpurple: [147 / 255, 112 / 255, 219 / 255],
      mediumseagreen: [60 / 255, 179 / 255, 113 / 255],
      mediumslateblue: [123 / 255, 104 / 255, 238 / 255],
      mediumspringgreen: [0 / 255, 250 / 255, 154 / 255],
      mediumturquoise: [72 / 255, 209 / 255, 204 / 255],
      mediumvioletred: [199 / 255, 21 / 255, 133 / 255],
      midnightblue: [25 / 255, 25 / 255, 112 / 255],
      mintcream: [245 / 255, 255 / 255, 250 / 255],
      mistyrose: [255 / 255, 228 / 255, 225 / 255],
      moccasin: [255 / 255, 228 / 255, 181 / 255],
      navajowhite: [255 / 255, 222 / 255, 173 / 255],
      // 'navy': [ 0 / 255, 0 / 255, 128 / 255 ],
      oldlace: [253 / 255, 245 / 255, 230 / 255],
      // 'olive': [ 128 / 255, 128 / 255, 0 / 255 ],
      olivedrab: [107 / 255, 142 / 255, 35 / 255],
      orange: [255 / 255, 165 / 255, 0 / 255],
      orangered: [255 / 255, 69 / 255, 0 / 255],
      orchid: [218 / 255, 112 / 255, 214 / 255],
      palegoldenrod: [238 / 255, 232 / 255, 170 / 255],
      palegreen: [152 / 255, 251 / 255, 152 / 255],
      paleturquoise: [175 / 255, 238 / 255, 238 / 255],
      palevioletred: [219 / 255, 112 / 255, 147 / 255],
      papayawhip: [255 / 255, 239 / 255, 213 / 255],
      peachpuff: [255 / 255, 218 / 255, 185 / 255],
      peru: [205 / 255, 133 / 255, 63 / 255],
      pink: [255 / 255, 192 / 255, 203 / 255],
      plum: [221 / 255, 160 / 255, 221 / 255],
      powderblue: [176 / 255, 224 / 255, 230 / 255],
      // 'purple': [ 128 / 255, 0 / 255, 128 / 255 ],
      // 'red': [ 255 / 255, 0 / 255, 0 / 255 ],
      rosybrown: [188 / 255, 143 / 255, 143 / 255],
      royalblue: [65 / 255, 105 / 255, 225 / 255],
      saddlebrown: [139 / 255, 69 / 255, 19 / 255],
      salmon: [250 / 255, 128 / 255, 114 / 255],
      sandybrown: [244 / 255, 164 / 255, 96 / 255],
      seagreen: [46 / 255, 139 / 255, 87 / 255],
      seashell: [255 / 255, 245 / 255, 238 / 255],
      sienna: [160 / 255, 82 / 255, 45 / 255],
      // 'silver': [ 192 / 255, 192 / 255, 192 / 255 ],
      skyblue: [135 / 255, 206 / 255, 235 / 255],
      slateblue: [106 / 255, 90 / 255, 205 / 255],
      slategray: [112 / 255, 128 / 255, 144 / 255],
      slategrey: [112 / 255, 128 / 255, 144 / 255],
      snow: [255 / 255, 250 / 255, 250 / 255],
      springgreen: [0 / 255, 255 / 255, 127 / 255],
      steelblue: [70 / 255, 130 / 255, 180 / 255],
      tan: [210 / 255, 180 / 255, 140 / 255],
      // 'teal': [ 0 / 255, 128 / 255, 128 / 255 ],
      thistle: [216 / 255, 191 / 255, 216 / 255],
      tomato: [255 / 255, 99 / 255, 71 / 255],
      turquoise: [64 / 255, 224 / 255, 208 / 255],
      violet: [238 / 255, 130 / 255, 238 / 255],
      wheat: [245 / 255, 222 / 255, 179 / 255],
      // 'white': [ 255 / 255, 255 / 255, 255 / 255 ],
      whitesmoke: [245 / 255, 245 / 255, 245 / 255],
      // 'yellow': [ 255 / 255, 255 / 255, 0 / 255 ],
      yellowgreen: [154 / 255, 205 / 255, 50 / 255]
    };
    module.exports = cssColors;
  }
});

// node_modules/@jscad/modeling/src/colors/colorNameToRgb.js
var require_colorNameToRgb = __commonJS({
  "node_modules/@jscad/modeling/src/colors/colorNameToRgb.js"(exports, module) {
    "use strict";
    var cssColors = require_cssColors();
    var colorNameToRgb = (s) => cssColors[s.toLowerCase()];
    module.exports = colorNameToRgb;
  }
});

// node_modules/@jscad/modeling/src/colors/hexToRgb.js
var require_hexToRgb = __commonJS({
  "node_modules/@jscad/modeling/src/colors/hexToRgb.js"(exports, module) {
    "use strict";
    var hexToRgb = (notation) => {
      notation = notation.replace("#", "");
      if (notation.length < 6) throw new Error("the given notation must contain 3 or more hex values");
      const r = parseInt(notation.substring(0, 2), 16) / 255;
      const g = parseInt(notation.substring(2, 4), 16) / 255;
      const b = parseInt(notation.substring(4, 6), 16) / 255;
      if (notation.length >= 8) {
        const a = parseInt(notation.substring(6, 8), 16) / 255;
        return [r, g, b, a];
      }
      return [r, g, b];
    };
    module.exports = hexToRgb;
  }
});

// node_modules/@jscad/modeling/src/colors/hueToColorComponent.js
var require_hueToColorComponent = __commonJS({
  "node_modules/@jscad/modeling/src/colors/hueToColorComponent.js"(exports, module) {
    "use strict";
    var hueToColorComponent = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    module.exports = hueToColorComponent;
  }
});

// node_modules/@jscad/modeling/src/colors/hslToRgb.js
var require_hslToRgb = __commonJS({
  "node_modules/@jscad/modeling/src/colors/hslToRgb.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var hueToColorComponent = require_hueToColorComponent();
    var hslToRgb = (...values) => {
      values = flatten(values);
      if (values.length < 3) throw new Error("values must contain H, S and L values");
      const h = values[0];
      const s = values[1];
      const l = values[2];
      let r = l;
      let g = l;
      let b = l;
      if (s !== 0) {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hueToColorComponent(p, q, h + 1 / 3);
        g = hueToColorComponent(p, q, h);
        b = hueToColorComponent(p, q, h - 1 / 3);
      }
      if (values.length > 3) {
        const a = values[3];
        return [r, g, b, a];
      }
      return [r, g, b];
    };
    module.exports = hslToRgb;
  }
});

// node_modules/@jscad/modeling/src/colors/hsvToRgb.js
var require_hsvToRgb = __commonJS({
  "node_modules/@jscad/modeling/src/colors/hsvToRgb.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var hsvToRgb = (...values) => {
      values = flatten(values);
      if (values.length < 3) throw new Error("values must contain H, S and V values");
      const h = values[0];
      const s = values[1];
      const v = values[2];
      let r = 0;
      let g = 0;
      let b = 0;
      const i = Math.floor(h * 6);
      const f = h * 6 - i;
      const p = v * (1 - s);
      const q = v * (1 - f * s);
      const t = v * (1 - (1 - f) * s);
      switch (i % 6) {
        case 0:
          r = v;
          g = t;
          b = p;
          break;
        case 1:
          r = q;
          g = v;
          b = p;
          break;
        case 2:
          r = p;
          g = v;
          b = t;
          break;
        case 3:
          r = p;
          g = q;
          b = v;
          break;
        case 4:
          r = t;
          g = p;
          b = v;
          break;
        case 5:
          r = v;
          g = p;
          b = q;
          break;
      }
      if (values.length > 3) {
        const a = values[3];
        return [r, g, b, a];
      }
      return [r, g, b];
    };
    module.exports = hsvToRgb;
  }
});

// node_modules/@jscad/modeling/src/colors/rgbToHex.js
var require_rgbToHex = __commonJS({
  "node_modules/@jscad/modeling/src/colors/rgbToHex.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var rgbToHex = (...values) => {
      values = flatten(values);
      if (values.length < 3) throw new Error("values must contain R, G and B values");
      const r = values[0] * 255;
      const g = values[1] * 255;
      const b = values[2] * 255;
      let s = `#${Number(16777216 + r * 65536 + g * 256 + b).toString(16).substring(1, 7)}`;
      if (values.length > 3) {
        s = s + Number(values[3] * 255).toString(16);
      }
      return s;
    };
    module.exports = rgbToHex;
  }
});

// node_modules/@jscad/modeling/src/colors/rgbToHsl.js
var require_rgbToHsl = __commonJS({
  "node_modules/@jscad/modeling/src/colors/rgbToHsl.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var rgbToHsl = (...values) => {
      values = flatten(values);
      if (values.length < 3) throw new Error("values must contain R, G and B values");
      const r = values[0];
      const g = values[1];
      const b = values[2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h;
      let s;
      const l = (max + min) / 2;
      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / d + 2;
            break;
          case b:
            h = (r - g) / d + 4;
            break;
        }
        h /= 6;
      }
      if (values.length > 3) {
        const a = values[3];
        return [h, s, l, a];
      }
      return [h, s, l];
    };
    module.exports = rgbToHsl;
  }
});

// node_modules/@jscad/modeling/src/colors/rgbToHsv.js
var require_rgbToHsv = __commonJS({
  "node_modules/@jscad/modeling/src/colors/rgbToHsv.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var rgbToHsv = (...values) => {
      values = flatten(values);
      if (values.length < 3) throw new Error("values must contain R, G and B values");
      const r = values[0];
      const g = values[1];
      const b = values[2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h;
      const v = max;
      const d = max - min;
      const s = max === 0 ? 0 : d / max;
      if (max === min) {
        h = 0;
      } else {
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / d + 2;
            break;
          case b:
            h = (r - g) / d + 4;
            break;
        }
        h /= 6;
      }
      if (values.length > 3) {
        const a = values[3];
        return [h, s, v, a];
      }
      return [h, s, v];
    };
    module.exports = rgbToHsv;
  }
});

// node_modules/@jscad/modeling/src/colors/index.js
var require_colors = __commonJS({
  "node_modules/@jscad/modeling/src/colors/index.js"(exports, module) {
    "use strict";
    module.exports = {
      colorize: require_colorize(),
      colorNameToRgb: require_colorNameToRgb(),
      cssColors: require_cssColors(),
      hexToRgb: require_hexToRgb(),
      hslToRgb: require_hslToRgb(),
      hsvToRgb: require_hsvToRgb(),
      hueToColorComponent: require_hueToColorComponent(),
      rgbToHex: require_rgbToHex(),
      rgbToHsl: require_rgbToHsl(),
      rgbToHsv: require_rgbToHsv()
    };
  }
});

// node_modules/@jscad/modeling/src/curves/bezier/create.js
var require_create9 = __commonJS({
  "node_modules/@jscad/modeling/src/curves/bezier/create.js"(exports, module) {
    "use strict";
    var create = (points) => {
      if (!Array.isArray(points)) throw new Error("Bezier points must be a valid array/");
      if (points.length < 2) throw new Error("Bezier points must contain at least 2 values.");
      const pointType = getPointType(points);
      return {
        points,
        pointType,
        dimensions: pointType === "float_single" ? 0 : points[0].length,
        permutations: getPermutations(points.length - 1),
        tangentPermutations: getPermutations(points.length - 2)
      };
    };
    var getPointType = function(points) {
      let firstPointType = null;
      points.forEach((point) => {
        let pType = "";
        if (Number.isFinite(point)) {
          pType = "float_single";
        } else if (Array.isArray(point)) {
          point.forEach((val) => {
            if (!Number.isFinite(val)) throw new Error("Bezier point values must all be numbers.");
          });
          pType = "float_" + point.length;
        } else throw new Error("Bezier points must all be numbers or arrays of number.");
        if (firstPointType == null) {
          firstPointType = pType;
        } else {
          if (firstPointType !== pType) {
            throw new Error("Bezier points must be either all numbers or all arrays of numbers of the same size.");
          }
        }
      });
      return firstPointType;
    };
    var getPermutations = function(c) {
      const permutations = [];
      for (let i = 0; i <= c; i++) {
        permutations.push(factorial(c) / (factorial(i) * factorial(c - i)));
      }
      return permutations;
    };
    var factorial = function(b) {
      let out = 1;
      for (let i = 2; i <= b; i++) {
        out *= i;
      }
      return out;
    };
    module.exports = create;
  }
});

// node_modules/@jscad/modeling/src/curves/bezier/valueAt.js
var require_valueAt = __commonJS({
  "node_modules/@jscad/modeling/src/curves/bezier/valueAt.js"(exports, module) {
    "use strict";
    var valueAt = (t, bezier) => {
      if (t < 0 || t > 1) {
        throw new Error("Bezier valueAt() input must be between 0 and 1");
      }
      if (bezier.pointType === "float_single") {
        return bezierFunction(bezier, bezier.points, t);
      } else {
        const result = [];
        for (let i = 0; i < bezier.dimensions; i++) {
          const singleDimensionPoints = [];
          for (let j = 0; j < bezier.points.length; j++) {
            singleDimensionPoints.push(bezier.points[j][i]);
          }
          result.push(bezierFunction(bezier, singleDimensionPoints, t));
        }
        return result;
      }
    };
    var bezierFunction = function(bezier, p, t) {
      const n = p.length - 1;
      let result = 0;
      for (let i = 0; i <= n; i++) {
        result += bezier.permutations[i] * Math.pow(1 - t, n - i) * Math.pow(t, i) * p[i];
      }
      return result;
    };
    module.exports = valueAt;
  }
});

// node_modules/@jscad/modeling/src/curves/bezier/tangentAt.js
var require_tangentAt = __commonJS({
  "node_modules/@jscad/modeling/src/curves/bezier/tangentAt.js"(exports, module) {
    "use strict";
    var tangentAt = (t, bezier) => {
      if (t < 0 || t > 1) {
        throw new Error("Bezier tangentAt() input must be between 0 and 1");
      }
      if (bezier.pointType === "float_single") {
        return bezierTangent(bezier, bezier.points, t);
      } else {
        const result = [];
        for (let i = 0; i < bezier.dimensions; i++) {
          const singleDimensionPoints = [];
          for (let j = 0; j < bezier.points.length; j++) {
            singleDimensionPoints.push(bezier.points[j][i]);
          }
          result.push(bezierTangent(bezier, singleDimensionPoints, t));
        }
        return result;
      }
    };
    var bezierTangent = function(bezier, p, t) {
      const n = p.length - 1;
      let result = 0;
      for (let i = 0; i < n; i++) {
        const q = n * (p[i + 1] - p[i]);
        result += bezier.tangentPermutations[i] * Math.pow(1 - t, n - 1 - i) * Math.pow(t, i) * q;
      }
      return result;
    };
    module.exports = tangentAt;
  }
});

// node_modules/@jscad/modeling/src/curves/bezier/lengths.js
var require_lengths = __commonJS({
  "node_modules/@jscad/modeling/src/curves/bezier/lengths.js"(exports, module) {
    "use strict";
    var valueAt = require_valueAt();
    var lengths = (segments, bezier) => {
      let sum = 0;
      const lengths2 = [0];
      let previous = valueAt(0, bezier);
      for (let index = 1; index <= segments; index++) {
        const current = valueAt(index / segments, bezier);
        sum += distanceBetween(current, previous);
        lengths2.push(sum);
        previous = current;
      }
      return lengths2;
    };
    var distanceBetween = (a, b) => {
      if (Number.isFinite(a) && Number.isFinite(b)) {
        return Math.abs(a - b);
      } else if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) {
          throw new Error("The operands must have the same number of dimensions.");
        }
        let sum = 0;
        for (let i = 0; i < a.length; i++) {
          sum += (b[i] - a[i]) * (b[i] - a[i]);
        }
        return Math.sqrt(sum);
      } else {
        throw new Error("The operands must be of the same type, either number or array.");
      }
    };
    module.exports = lengths;
  }
});

// node_modules/@jscad/modeling/src/curves/bezier/length.js
var require_length3 = __commonJS({
  "node_modules/@jscad/modeling/src/curves/bezier/length.js"(exports, module) {
    "use strict";
    var lengths = require_lengths();
    var length = (segments, bezier) => lengths(segments, bezier)[segments];
    module.exports = length;
  }
});

// node_modules/@jscad/modeling/src/curves/bezier/arcLengthToT.js
var require_arcLengthToT = __commonJS({
  "node_modules/@jscad/modeling/src/curves/bezier/arcLengthToT.js"(exports, module) {
    "use strict";
    var lengths = require_lengths();
    var arcLengthToT = (options, bezier) => {
      const defaults = {
        distance: 0,
        segments: 100
      };
      const { distance, segments } = Object.assign({}, defaults, options);
      const arcLengths = lengths(segments, bezier);
      let startIndex = 0;
      let endIndex = segments;
      while (startIndex <= endIndex) {
        const middleIndex = Math.floor(startIndex + (endIndex - startIndex) / 2);
        const diff = arcLengths[middleIndex] - distance;
        if (diff < 0) {
          startIndex = middleIndex + 1;
        } else if (diff > 0) {
          endIndex = middleIndex - 1;
        } else {
          endIndex = middleIndex;
          break;
        }
      }
      const targetIndex = endIndex;
      if (arcLengths[targetIndex] === distance) {
        return targetIndex / segments;
      }
      const lengthBefore = arcLengths[targetIndex];
      const lengthAfter = arcLengths[targetIndex + 1];
      const segmentLength = lengthAfter - lengthBefore;
      const segmentFraction = (distance - lengthBefore) / segmentLength;
      return (targetIndex + segmentFraction) / segments;
    };
    module.exports = arcLengthToT;
  }
});

// node_modules/@jscad/modeling/src/curves/bezier/index.js
var require_bezier = __commonJS({
  "node_modules/@jscad/modeling/src/curves/bezier/index.js"(exports, module) {
    "use strict";
    module.exports = {
      create: require_create9(),
      valueAt: require_valueAt(),
      tangentAt: require_tangentAt(),
      lengths: require_lengths(),
      length: require_length3(),
      arcLengthToT: require_arcLengthToT()
    };
  }
});

// node_modules/@jscad/modeling/src/curves/index.js
var require_curves = __commonJS({
  "node_modules/@jscad/modeling/src/curves/index.js"(exports, module) {
    "use strict";
    module.exports = {
      bezier: require_bezier()
    };
  }
});

// node_modules/@jscad/modeling/src/maths/utils/area.js
var require_area = __commonJS({
  "node_modules/@jscad/modeling/src/maths/utils/area.js"(exports, module) {
    "use strict";
    var area = (points) => {
      let area2 = 0;
      for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        area2 += points[i][0] * points[j][1];
        area2 -= points[j][0] * points[i][1];
      }
      return area2 / 2;
    };
    module.exports = area;
  }
});

// node_modules/@jscad/modeling/src/geometries/poly2/measureArea.js
var require_measureArea2 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/poly2/measureArea.js"(exports, module) {
    "use strict";
    var area = require_area();
    var measureArea = (polygon3) => area(polygon3.vertices);
    module.exports = measureArea;
  }
});

// node_modules/@jscad/modeling/src/geometries/poly2/create.js
var require_create10 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/poly2/create.js"(exports, module) {
    "use strict";
    var create = (vertices) => {
      if (vertices === void 0 || vertices.length < 3) {
        vertices = [];
      }
      return { vertices };
    };
    module.exports = create;
  }
});

// node_modules/@jscad/modeling/src/geometries/poly2/flip.js
var require_flip2 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/poly2/flip.js"(exports, module) {
    "use strict";
    var create = require_create10();
    var flip = (polygon3) => {
      const vertices = polygon3.vertices.slice().reverse();
      return create(vertices);
    };
    module.exports = flip;
  }
});

// node_modules/@jscad/modeling/src/geometries/poly2/arePointsInside.js
var require_arePointsInside = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/poly2/arePointsInside.js"(exports, module) {
    "use strict";
    var measureArea = require_measureArea2();
    var flip = require_flip2();
    var arePointsInside = (points, polygon3) => {
      if (points.length === 0) return 0;
      const vertices = polygon3.vertices;
      if (vertices.length < 3) return 0;
      if (measureArea(polygon3) < 0) {
        polygon3 = flip(polygon3);
      }
      const sum = points.reduce((acc, point) => acc + isPointInside(point, vertices), 0);
      return sum === points.length ? 1 : 0;
    };
    var isPointInside = (point, polygon3) => {
      const numverts = polygon3.length;
      const tx = point[0];
      const ty = point[1];
      let vtx0 = polygon3[numverts - 1];
      let vtx1 = polygon3[0];
      let yflag0 = vtx0[1] > ty;
      let insideFlag = 0;
      let i = 0;
      for (let j = numverts + 1; --j; ) {
        const yflag1 = vtx1[1] > ty;
        if (yflag0 !== yflag1) {
          const xflag0 = vtx0[0] > tx;
          const xflag1 = vtx1[0] > tx;
          if (xflag0 && xflag1) {
            insideFlag = !insideFlag;
          } else {
            if (vtx1[0] - (vtx1[1] - ty) * (vtx0[0] - vtx1[0]) / (vtx0[1] - vtx1[1]) >= tx) {
              insideFlag = !insideFlag;
            }
          }
        }
        yflag0 = yflag1;
        vtx0 = vtx1;
        vtx1 = polygon3[++i];
      }
      return insideFlag;
    };
    module.exports = arePointsInside;
  }
});

// node_modules/@jscad/modeling/src/geometries/poly2/index.js
var require_poly2 = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/poly2/index.js"(exports, module) {
    "use strict";
    module.exports = {
      arePointsInside: require_arePointsInside(),
      create: require_create10(),
      flip: require_flip2(),
      measureArea: require_measureArea2()
    };
  }
});

// node_modules/@jscad/modeling/src/geometries/index.js
var require_geometries = __commonJS({
  "node_modules/@jscad/modeling/src/geometries/index.js"(exports, module) {
    "use strict";
    module.exports = {
      geom2: require_geom2(),
      geom3: require_geom3(),
      path2: require_path2(),
      poly2: require_poly2(),
      poly3: require_poly3()
    };
  }
});

// node_modules/@jscad/modeling/src/maths/line2/create.js
var require_create11 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/line2/create.js"(exports, module) {
    "use strict";
    var create = () => [0, 1, 0];
    module.exports = create;
  }
});

// node_modules/@jscad/modeling/src/maths/line2/clone.js
var require_clone9 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/line2/clone.js"(exports, module) {
    "use strict";
    var create = require_create11();
    var clone = (line) => {
      const out = create();
      out[0] = line[0];
      out[1] = line[1];
      out[2] = line[2];
      return out;
    };
    module.exports = clone;
  }
});

// node_modules/@jscad/modeling/src/maths/line2/direction.js
var require_direction = __commonJS({
  "node_modules/@jscad/modeling/src/maths/line2/direction.js"(exports, module) {
    "use strict";
    var vec2 = require_vec2();
    var direction = (line) => {
      const vector = vec2.normal(vec2.create(), line);
      vec2.negate(vector, vector);
      return vector;
    };
    module.exports = direction;
  }
});

// node_modules/@jscad/modeling/src/maths/line2/origin.js
var require_origin = __commonJS({
  "node_modules/@jscad/modeling/src/maths/line2/origin.js"(exports, module) {
    "use strict";
    var vec2 = require_vec2();
    var origin = (line) => vec2.scale(vec2.create(), line, line[2]);
    module.exports = origin;
  }
});

// node_modules/@jscad/modeling/src/maths/line2/closestPoint.js
var require_closestPoint = __commonJS({
  "node_modules/@jscad/modeling/src/maths/line2/closestPoint.js"(exports, module) {
    "use strict";
    var vec2 = require_vec2();
    var direction = require_direction();
    var origin = require_origin();
    var closestPoint = (line, point) => {
      const orig = origin(line);
      const dir = direction(line);
      const v = vec2.subtract(vec2.create(), point, orig);
      const dist = vec2.dot(v, dir);
      vec2.scale(v, dir, dist);
      vec2.add(v, v, orig);
      return v;
    };
    module.exports = closestPoint;
  }
});

// node_modules/@jscad/modeling/src/maths/line2/copy.js
var require_copy5 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/line2/copy.js"(exports, module) {
    "use strict";
    var copy = (out, line) => {
      out[0] = line[0];
      out[1] = line[1];
      out[2] = line[2];
      return out;
    };
    module.exports = copy;
  }
});

// node_modules/@jscad/modeling/src/maths/line2/distanceToPoint.js
var require_distanceToPoint = __commonJS({
  "node_modules/@jscad/modeling/src/maths/line2/distanceToPoint.js"(exports, module) {
    "use strict";
    var vec2 = require_vec2();
    var distanceToPoint = (line, point) => {
      let distance = vec2.dot(point, line);
      distance = Math.abs(distance - line[2]);
      return distance;
    };
    module.exports = distanceToPoint;
  }
});

// node_modules/@jscad/modeling/src/maths/line2/equals.js
var require_equals6 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/line2/equals.js"(exports, module) {
    "use strict";
    var equals = (line1, line2) => line1[0] === line2[0] && (line1[1] === line2[1] && line1[2] === line2[2]);
    module.exports = equals;
  }
});

// node_modules/@jscad/modeling/src/maths/line2/fromPoints.js
var require_fromPoints6 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/line2/fromPoints.js"(exports, module) {
    "use strict";
    var vec2 = require_vec2();
    var fromPoints = (out, point1, point2) => {
      const vector = vec2.subtract(vec2.create(), point2, point1);
      vec2.normal(vector, vector);
      vec2.normalize(vector, vector);
      const distance = vec2.dot(point1, vector);
      out[0] = vector[0];
      out[1] = vector[1];
      out[2] = distance;
      return out;
    };
    module.exports = fromPoints;
  }
});

// node_modules/@jscad/modeling/src/maths/line2/fromValues.js
var require_fromValues5 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/line2/fromValues.js"(exports, module) {
    "use strict";
    var create = require_create11();
    var fromValues = (x, y, d) => {
      const out = create();
      out[0] = x;
      out[1] = y;
      out[2] = d;
      return out;
    };
    module.exports = fromValues;
  }
});

// node_modules/@jscad/modeling/src/maths/utils/aboutEqualNormals.js
var require_aboutEqualNormals = __commonJS({
  "node_modules/@jscad/modeling/src/maths/utils/aboutEqualNormals.js"(exports, module) {
    "use strict";
    var { NEPS } = require_constants();
    var aboutEqualNormals = (a, b) => Math.abs(a[0] - b[0]) <= NEPS && Math.abs(a[1] - b[1]) <= NEPS && Math.abs(a[2] - b[2]) <= NEPS;
    module.exports = aboutEqualNormals;
  }
});

// node_modules/@jscad/modeling/src/maths/utils/interpolateBetween2DPointsForY.js
var require_interpolateBetween2DPointsForY = __commonJS({
  "node_modules/@jscad/modeling/src/maths/utils/interpolateBetween2DPointsForY.js"(exports, module) {
    "use strict";
    var interpolateBetween2DPointsForY = (point1, point2, y) => {
      let f1 = y - point1[1];
      let f2 = point2[1] - point1[1];
      if (f2 < 0) {
        f1 = -f1;
        f2 = -f2;
      }
      let t;
      if (f1 <= 0) {
        t = 0;
      } else if (f1 >= f2) {
        t = 1;
      } else if (f2 < 1e-10) {
        t = 0.5;
      } else {
        t = f1 / f2;
      }
      const result = point1[0] + t * (point2[0] - point1[0]);
      return result;
    };
    module.exports = interpolateBetween2DPointsForY;
  }
});

// node_modules/@jscad/modeling/src/maths/utils/intersect.js
var require_intersect = __commonJS({
  "node_modules/@jscad/modeling/src/maths/utils/intersect.js"(exports, module) {
    "use strict";
    var intersect = (p1, p2, p3, p4) => {
      if (p1[0] === p2[0] && p1[1] === p2[1] || p3[0] === p4[0] && p3[1] === p4[1]) {
        return void 0;
      }
      const denominator = (p4[1] - p3[1]) * (p2[0] - p1[0]) - (p4[0] - p3[0]) * (p2[1] - p1[1]);
      if (Math.abs(denominator) < Number.MIN_VALUE) {
        return void 0;
      }
      const ua = ((p4[0] - p3[0]) * (p1[1] - p3[1]) - (p4[1] - p3[1]) * (p1[0] - p3[0])) / denominator;
      const ub = ((p2[0] - p1[0]) * (p1[1] - p3[1]) - (p2[1] - p1[1]) * (p1[0] - p3[0])) / denominator;
      if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
        return void 0;
      }
      const x = p1[0] + ua * (p2[0] - p1[0]);
      const y = p1[1] + ua * (p2[1] - p1[1]);
      return [x, y];
    };
    module.exports = intersect;
  }
});

// node_modules/@jscad/modeling/src/maths/utils/solve2Linear.js
var require_solve2Linear = __commonJS({
  "node_modules/@jscad/modeling/src/maths/utils/solve2Linear.js"(exports, module) {
    "use strict";
    var solve2Linear = (a, b, c, d, u, v) => {
      const det = a * d - b * c;
      const invdet = 1 / det;
      let x = u * d - b * v;
      let y = -u * c + a * v;
      x *= invdet;
      y *= invdet;
      return [x, y];
    };
    module.exports = solve2Linear;
  }
});

// node_modules/@jscad/modeling/src/maths/utils/index.js
var require_utils = __commonJS({
  "node_modules/@jscad/modeling/src/maths/utils/index.js"(exports, module) {
    "use strict";
    module.exports = {
      aboutEqualNormals: require_aboutEqualNormals(),
      area: require_area(),
      cos: require_trigonometry().cos,
      interpolateBetween2DPointsForY: require_interpolateBetween2DPointsForY(),
      intersect: require_intersect(),
      sin: require_trigonometry().sin,
      solve2Linear: require_solve2Linear()
    };
  }
});

// node_modules/@jscad/modeling/src/maths/line2/intersectPointOfLines.js
var require_intersectPointOfLines = __commonJS({
  "node_modules/@jscad/modeling/src/maths/line2/intersectPointOfLines.js"(exports, module) {
    "use strict";
    var vec2 = require_vec2();
    var { solve2Linear } = require_utils();
    var intersectToLine = (line1, line2) => {
      const point = solve2Linear(line1[0], line1[1], line2[0], line2[1], line1[2], line2[2]);
      return vec2.clone(point);
    };
    module.exports = intersectToLine;
  }
});

// node_modules/@jscad/modeling/src/maths/line2/reverse.js
var require_reverse3 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/line2/reverse.js"(exports, module) {
    "use strict";
    var vec2 = require_vec2();
    var copy = require_copy5();
    var fromValues = require_fromValues5();
    var reverse = (out, line) => {
      const normal = vec2.negate(vec2.create(), line);
      const distance = -line[2];
      return copy(out, fromValues(normal[0], normal[1], distance));
    };
    module.exports = reverse;
  }
});

// node_modules/@jscad/modeling/src/maths/line2/toString.js
var require_toString9 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/line2/toString.js"(exports, module) {
    "use strict";
    var toString = (line) => `line2: (${line[0].toFixed(7)}, ${line[1].toFixed(7)}, ${line[2].toFixed(7)})`;
    module.exports = toString;
  }
});

// node_modules/@jscad/modeling/src/maths/line2/transform.js
var require_transform9 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/line2/transform.js"(exports, module) {
    "use strict";
    var vec2 = require_vec2();
    var fromPoints = require_fromPoints6();
    var origin = require_origin();
    var direction = require_direction();
    var transform = (out, line, matrix) => {
      const org = origin(line);
      const dir = direction(line);
      vec2.transform(org, org, matrix);
      vec2.transform(dir, dir, matrix);
      return fromPoints(out, org, dir);
    };
    module.exports = transform;
  }
});

// node_modules/@jscad/modeling/src/maths/line2/xAtY.js
var require_xAtY = __commonJS({
  "node_modules/@jscad/modeling/src/maths/line2/xAtY.js"(exports, module) {
    "use strict";
    var origin = require_origin();
    var xAtY = (line, y) => {
      let x = (line[2] - line[1] * y) / line[0];
      if (Number.isNaN(x)) {
        const org = origin(line);
        x = org[0];
      }
      return x;
    };
    module.exports = xAtY;
  }
});

// node_modules/@jscad/modeling/src/maths/line2/index.js
var require_line2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/line2/index.js"(exports, module) {
    "use strict";
    module.exports = {
      clone: require_clone9(),
      closestPoint: require_closestPoint(),
      copy: require_copy5(),
      create: require_create11(),
      direction: require_direction(),
      distanceToPoint: require_distanceToPoint(),
      equals: require_equals6(),
      fromPoints: require_fromPoints6(),
      fromValues: require_fromValues5(),
      intersectPointOfLines: require_intersectPointOfLines(),
      origin: require_origin(),
      reverse: require_reverse3(),
      toString: require_toString9(),
      transform: require_transform9(),
      xAtY: require_xAtY()
    };
  }
});

// node_modules/@jscad/modeling/src/maths/line3/create.js
var require_create12 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/line3/create.js"(exports, module) {
    "use strict";
    var vec3 = require_vec3();
    var create = () => [
      vec3.fromValues(0, 0, 0),
      // origin
      vec3.fromValues(0, 0, 1)
      // direction
    ];
    module.exports = create;
  }
});

// node_modules/@jscad/modeling/src/maths/line3/clone.js
var require_clone10 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/line3/clone.js"(exports, module) {
    "use strict";
    var vec3 = require_vec3();
    var create = require_create12();
    var clone = (line) => {
      const out = create();
      vec3.copy(out[0], line[0]);
      vec3.copy(out[1], line[1]);
      return out;
    };
    module.exports = clone;
  }
});

// node_modules/@jscad/modeling/src/maths/line3/closestPoint.js
var require_closestPoint2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/line3/closestPoint.js"(exports, module) {
    "use strict";
    var vec3 = require_vec3();
    var closestPoint = (line, point) => {
      const lpoint = line[0];
      const ldirection = line[1];
      const a = vec3.dot(vec3.subtract(vec3.create(), point, lpoint), ldirection);
      const b = vec3.dot(ldirection, ldirection);
      const t = a / b;
      const closestpoint = vec3.scale(vec3.create(), ldirection, t);
      vec3.add(closestpoint, closestpoint, lpoint);
      return closestpoint;
    };
    module.exports = closestPoint;
  }
});

// node_modules/@jscad/modeling/src/maths/line3/copy.js
var require_copy6 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/line3/copy.js"(exports, module) {
    "use strict";
    var vec3 = require_vec3();
    var copy = (out, line) => {
      vec3.copy(out[0], line[0]);
      vec3.copy(out[1], line[1]);
      return out;
    };
    module.exports = copy;
  }
});

// node_modules/@jscad/modeling/src/maths/line3/direction.js
var require_direction2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/line3/direction.js"(exports, module) {
    "use strict";
    var direction = (line) => line[1];
    module.exports = direction;
  }
});

// node_modules/@jscad/modeling/src/maths/line3/distanceToPoint.js
var require_distanceToPoint2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/line3/distanceToPoint.js"(exports, module) {
    "use strict";
    var vec3 = require_vec3();
    var closestPoint = require_closestPoint2();
    var distanceToPoint = (line, point) => {
      const closest = closestPoint(line, point);
      const distancevector = vec3.subtract(vec3.create(), point, closest);
      return vec3.length(distancevector);
    };
    module.exports = distanceToPoint;
  }
});

// node_modules/@jscad/modeling/src/maths/line3/equals.js
var require_equals7 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/line3/equals.js"(exports, module) {
    "use strict";
    var vec3 = require_vec3();
    var equals = (line1, line2) => {
      if (!vec3.equals(line1[1], line2[1])) return false;
      if (!vec3.equals(line1[0], line2[0])) return false;
      return true;
    };
    module.exports = equals;
  }
});

// node_modules/@jscad/modeling/src/maths/line3/fromPointAndDirection.js
var require_fromPointAndDirection = __commonJS({
  "node_modules/@jscad/modeling/src/maths/line3/fromPointAndDirection.js"(exports, module) {
    "use strict";
    var vec3 = require_vec3();
    var fromPointAndDirection = (out, point, direction) => {
      const unit = vec3.normalize(vec3.create(), direction);
      vec3.copy(out[0], point);
      vec3.copy(out[1], unit);
      return out;
    };
    module.exports = fromPointAndDirection;
  }
});

// node_modules/@jscad/modeling/src/maths/line3/fromPlanes.js
var require_fromPlanes = __commonJS({
  "node_modules/@jscad/modeling/src/maths/line3/fromPlanes.js"(exports, module) {
    "use strict";
    var vec3 = require_vec3();
    var { solve2Linear } = require_utils();
    var { EPS } = require_constants();
    var fromPointAndDirection = require_fromPointAndDirection();
    var fromPlanes = (out, plane1, plane2) => {
      let direction = vec3.cross(vec3.create(), plane1, plane2);
      let length = vec3.length(direction);
      if (length < EPS) {
        throw new Error("parallel planes do not intersect");
      }
      length = 1 / length;
      direction = vec3.scale(direction, direction, length);
      const absx = Math.abs(direction[0]);
      const absy = Math.abs(direction[1]);
      const absz = Math.abs(direction[2]);
      let origin;
      let r;
      if (absx >= absy && absx >= absz) {
        r = solve2Linear(plane1[1], plane1[2], plane2[1], plane2[2], plane1[3], plane2[3]);
        origin = vec3.fromValues(0, r[0], r[1]);
      } else if (absy >= absx && absy >= absz) {
        r = solve2Linear(plane1[0], plane1[2], plane2[0], plane2[2], plane1[3], plane2[3]);
        origin = vec3.fromValues(r[0], 0, r[1]);
      } else {
        r = solve2Linear(plane1[0], plane1[1], plane2[0], plane2[1], plane1[3], plane2[3]);
        origin = vec3.fromValues(r[0], r[1], 0);
      }
      return fromPointAndDirection(out, origin, direction);
    };
    module.exports = fromPlanes;
  }
});

// node_modules/@jscad/modeling/src/maths/line3/fromPoints.js
var require_fromPoints7 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/line3/fromPoints.js"(exports, module) {
    "use strict";
    var vec3 = require_vec3();
    var fromPointAndDirection = require_fromPointAndDirection();
    var fromPoints = (out, point1, point2) => {
      const direction = vec3.subtract(vec3.create(), point2, point1);
      return fromPointAndDirection(out, point1, direction);
    };
    module.exports = fromPoints;
  }
});

// node_modules/@jscad/modeling/src/maths/line3/intersectPointOfLineAndPlane.js
var require_intersectPointOfLineAndPlane = __commonJS({
  "node_modules/@jscad/modeling/src/maths/line3/intersectPointOfLineAndPlane.js"(exports, module) {
    "use strict";
    var vec3 = require_vec3();
    var intersectToPlane = (line, plane) => {
      const pnormal = plane;
      const pw = plane[3];
      const lpoint = line[0];
      const ldirection = line[1];
      const labda = (pw - vec3.dot(pnormal, lpoint)) / vec3.dot(pnormal, ldirection);
      const point = vec3.add(vec3.create(), lpoint, vec3.scale(vec3.create(), ldirection, labda));
      return point;
    };
    module.exports = intersectToPlane;
  }
});

// node_modules/@jscad/modeling/src/maths/line3/origin.js
var require_origin2 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/line3/origin.js"(exports, module) {
    "use strict";
    var origin = (line) => line[0];
    module.exports = origin;
  }
});

// node_modules/@jscad/modeling/src/maths/line3/reverse.js
var require_reverse4 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/line3/reverse.js"(exports, module) {
    "use strict";
    var vec3 = require_vec3();
    var fromPointAndDirection = require_fromPointAndDirection();
    var reverse = (out, line) => {
      const point = vec3.clone(line[0]);
      const direction = vec3.negate(vec3.create(), line[1]);
      return fromPointAndDirection(out, point, direction);
    };
    module.exports = reverse;
  }
});

// node_modules/@jscad/modeling/src/maths/line3/toString.js
var require_toString10 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/line3/toString.js"(exports, module) {
    "use strict";
    var toString = (line) => {
      const point = line[0];
      const direction = line[1];
      return `line3: point: (${point[0].toFixed(7)}, ${point[1].toFixed(7)}, ${point[2].toFixed(7)}) direction: (${direction[0].toFixed(7)}, ${direction[1].toFixed(7)}, ${direction[2].toFixed(7)})`;
    };
    module.exports = toString;
  }
});

// node_modules/@jscad/modeling/src/maths/line3/transform.js
var require_transform10 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/line3/transform.js"(exports, module) {
    "use strict";
    var vec3 = require_vec3();
    var fromPointAndDirection = require_fromPointAndDirection();
    var transform = (out, line, matrix) => {
      const point = line[0];
      const direction = line[1];
      const pointPlusDirection = vec3.add(vec3.create(), point, direction);
      const newpoint = vec3.transform(vec3.create(), point, matrix);
      const newPointPlusDirection = vec3.transform(pointPlusDirection, pointPlusDirection, matrix);
      const newdirection = vec3.subtract(newPointPlusDirection, newPointPlusDirection, newpoint);
      return fromPointAndDirection(out, newpoint, newdirection);
    };
    module.exports = transform;
  }
});

// node_modules/@jscad/modeling/src/maths/line3/index.js
var require_line3 = __commonJS({
  "node_modules/@jscad/modeling/src/maths/line3/index.js"(exports, module) {
    "use strict";
    module.exports = {
      clone: require_clone10(),
      closestPoint: require_closestPoint2(),
      copy: require_copy6(),
      create: require_create12(),
      direction: require_direction2(),
      distanceToPoint: require_distanceToPoint2(),
      equals: require_equals7(),
      fromPlanes: require_fromPlanes(),
      fromPointAndDirection: require_fromPointAndDirection(),
      fromPoints: require_fromPoints7(),
      intersectPointOfLineAndPlane: require_intersectPointOfLineAndPlane(),
      origin: require_origin2(),
      reverse: require_reverse4(),
      toString: require_toString10(),
      transform: require_transform10()
    };
  }
});

// node_modules/@jscad/modeling/src/maths/index.js
var require_maths = __commonJS({
  "node_modules/@jscad/modeling/src/maths/index.js"(exports, module) {
    "use strict";
    module.exports = {
      constants: require_constants(),
      line2: require_line2(),
      line3: require_line3(),
      mat4: require_mat4(),
      plane: require_plane(),
      utils: require_utils(),
      vec2: require_vec2(),
      vec3: require_vec3(),
      vec4: require_vec4()
    };
  }
});

// node_modules/@jscad/modeling/src/measurements/measureArea.js
var require_measureArea3 = __commonJS({
  "node_modules/@jscad/modeling/src/measurements/measureArea.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var geom2 = require_geom2();
    var geom34 = require_geom3();
    var path2 = require_path2();
    var poly3 = require_poly3();
    var cache = /* @__PURE__ */ new WeakMap();
    var measureAreaOfPath2 = () => 0;
    var measureAreaOfGeom2 = (geometry) => {
      let area = cache.get(geometry);
      if (area) return area;
      const sides = geom2.toSides(geometry);
      area = sides.reduce((area2, side) => area2 + (side[0][0] * side[1][1] - side[0][1] * side[1][0]), 0);
      area *= 0.5;
      cache.set(geometry, area);
      return area;
    };
    var measureAreaOfGeom3 = (geometry) => {
      let area = cache.get(geometry);
      if (area) return area;
      const polygons = geom34.toPolygons(geometry);
      area = polygons.reduce((area2, polygon3) => area2 + poly3.measureArea(polygon3), 0);
      cache.set(geometry, area);
      return area;
    };
    var measureArea = (...geometries) => {
      geometries = flatten(geometries);
      if (geometries.length === 0) throw new Error("wrong number of arguments");
      const results = geometries.map((geometry) => {
        if (path2.isA(geometry)) return measureAreaOfPath2(geometry);
        if (geom2.isA(geometry)) return measureAreaOfGeom2(geometry);
        if (geom34.isA(geometry)) return measureAreaOfGeom3(geometry);
        return 0;
      });
      return results.length === 1 ? results[0] : results;
    };
    module.exports = measureArea;
  }
});

// node_modules/@jscad/modeling/src/measurements/measureAggregateArea.js
var require_measureAggregateArea = __commonJS({
  "node_modules/@jscad/modeling/src/measurements/measureAggregateArea.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var measureArea = require_measureArea3();
    var measureAggregateArea = (...geometries) => {
      geometries = flatten(geometries);
      if (geometries.length === 0) throw new Error("measureAggregateArea: no geometries supplied");
      const areas = measureArea(geometries);
      if (geometries.length === 1) {
        return areas;
      }
      const result = 0;
      return areas.reduce((result2, area) => result2 + area, result);
    };
    module.exports = measureAggregateArea;
  }
});

// node_modules/@jscad/modeling/src/measurements/measureBoundingBox.js
var require_measureBoundingBox2 = __commonJS({
  "node_modules/@jscad/modeling/src/measurements/measureBoundingBox.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var vec2 = require_vec2();
    var vec3 = require_vec3();
    var geom2 = require_geom2();
    var geom34 = require_geom3();
    var path2 = require_path2();
    var poly3 = require_poly3();
    var cache = /* @__PURE__ */ new WeakMap();
    var measureBoundingBoxOfPath2 = (geometry) => {
      let boundingBox = cache.get(geometry);
      if (boundingBox) return boundingBox;
      const points = path2.toPoints(geometry);
      let minpoint;
      if (points.length === 0) {
        minpoint = vec2.create();
      } else {
        minpoint = vec2.clone(points[0]);
      }
      let maxpoint = vec2.clone(minpoint);
      points.forEach((point) => {
        vec2.min(minpoint, minpoint, point);
        vec2.max(maxpoint, maxpoint, point);
      });
      minpoint = [minpoint[0], minpoint[1], 0];
      maxpoint = [maxpoint[0], maxpoint[1], 0];
      boundingBox = [minpoint, maxpoint];
      cache.set(geometry, boundingBox);
      return boundingBox;
    };
    var measureBoundingBoxOfGeom2 = (geometry) => {
      let boundingBox = cache.get(geometry);
      if (boundingBox) return boundingBox;
      const points = geom2.toPoints(geometry);
      let minpoint;
      if (points.length === 0) {
        minpoint = vec2.create();
      } else {
        minpoint = vec2.clone(points[0]);
      }
      let maxpoint = vec2.clone(minpoint);
      points.forEach((point) => {
        vec2.min(minpoint, minpoint, point);
        vec2.max(maxpoint, maxpoint, point);
      });
      minpoint = [minpoint[0], minpoint[1], 0];
      maxpoint = [maxpoint[0], maxpoint[1], 0];
      boundingBox = [minpoint, maxpoint];
      cache.set(geometry, boundingBox);
      return boundingBox;
    };
    var measureBoundingBoxOfGeom3 = (geometry) => {
      let boundingBox = cache.get(geometry);
      if (boundingBox) return boundingBox;
      const polygons = geom34.toPolygons(geometry);
      let minpoint = vec3.create();
      if (polygons.length > 0) {
        const points = poly3.toPoints(polygons[0]);
        vec3.copy(minpoint, points[0]);
      }
      let maxpoint = vec3.clone(minpoint);
      polygons.forEach((polygon3) => {
        poly3.toPoints(polygon3).forEach((point) => {
          vec3.min(minpoint, minpoint, point);
          vec3.max(maxpoint, maxpoint, point);
        });
      });
      minpoint = [minpoint[0], minpoint[1], minpoint[2]];
      maxpoint = [maxpoint[0], maxpoint[1], maxpoint[2]];
      boundingBox = [minpoint, maxpoint];
      cache.set(geometry, boundingBox);
      return boundingBox;
    };
    var measureBoundingBox3 = (...geometries) => {
      geometries = flatten(geometries);
      if (geometries.length === 0) throw new Error("wrong number of arguments");
      const results = geometries.map((geometry) => {
        if (path2.isA(geometry)) return measureBoundingBoxOfPath2(geometry);
        if (geom2.isA(geometry)) return measureBoundingBoxOfGeom2(geometry);
        if (geom34.isA(geometry)) return measureBoundingBoxOfGeom3(geometry);
        return [[0, 0, 0], [0, 0, 0]];
      });
      return results.length === 1 ? results[0] : results;
    };
    module.exports = measureBoundingBox3;
  }
});

// node_modules/@jscad/modeling/src/measurements/measureAggregateBoundingBox.js
var require_measureAggregateBoundingBox = __commonJS({
  "node_modules/@jscad/modeling/src/measurements/measureAggregateBoundingBox.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var vec3min = require_min();
    var vec3max = require_max();
    var measureBoundingBox3 = require_measureBoundingBox2();
    var measureAggregateBoundingBox = (...geometries) => {
      geometries = flatten(geometries);
      if (geometries.length === 0) throw new Error("measureAggregateBoundingBox: no geometries supplied");
      const bounds = measureBoundingBox3(geometries);
      if (geometries.length === 1) {
        return bounds;
      }
      const result = [[Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE], [-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE]];
      return bounds.reduce((result2, item) => {
        result2 = [vec3min(result2[0], result2[0], item[0]), vec3max(result2[1], result2[1], item[1])];
        return result2;
      }, result);
    };
    module.exports = measureAggregateBoundingBox;
  }
});

// node_modules/@jscad/modeling/src/measurements/calculateEpsilonFromBounds.js
var require_calculateEpsilonFromBounds = __commonJS({
  "node_modules/@jscad/modeling/src/measurements/calculateEpsilonFromBounds.js"(exports, module) {
    "use strict";
    var { EPS } = require_constants();
    var calculateEpsilonFromBounds = (bounds, dimensions) => {
      let total = 0;
      for (let i = 0; i < dimensions; i++) {
        total += bounds[1][i] - bounds[0][i];
      }
      return EPS * total / dimensions;
    };
    module.exports = calculateEpsilonFromBounds;
  }
});

// node_modules/@jscad/modeling/src/measurements/measureAggregateEpsilon.js
var require_measureAggregateEpsilon = __commonJS({
  "node_modules/@jscad/modeling/src/measurements/measureAggregateEpsilon.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var measureAggregateBoundingBox = require_measureAggregateBoundingBox();
    var calculateEpsilonFromBounds = require_calculateEpsilonFromBounds();
    var { geom2, geom3: geom34, path2 } = require_geometries();
    var measureAggregateEpsilon = (...geometries) => {
      geometries = flatten(geometries);
      if (geometries.length === 0) throw new Error("measureAggregateEpsilon: no geometries supplied");
      const bounds = measureAggregateBoundingBox(geometries);
      let dimensions = 0;
      dimensions = geometries.reduce((dimensions2, geometry) => {
        if (path2.isA(geometry) || geom2.isA(geometry)) return Math.max(dimensions2, 2);
        if (geom34.isA(geometry)) return Math.max(dimensions2, 3);
        return 0;
      }, dimensions);
      return calculateEpsilonFromBounds(bounds, dimensions);
    };
    module.exports = measureAggregateEpsilon;
  }
});

// node_modules/@jscad/modeling/src/measurements/measureVolume.js
var require_measureVolume = __commonJS({
  "node_modules/@jscad/modeling/src/measurements/measureVolume.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var geom2 = require_geom2();
    var geom34 = require_geom3();
    var path2 = require_path2();
    var poly3 = require_poly3();
    var cache = /* @__PURE__ */ new WeakMap();
    var measureVolumeOfPath2 = () => 0;
    var measureVolumeOfGeom2 = () => 0;
    var measureVolumeOfGeom3 = (geometry) => {
      let volume = cache.get(geometry);
      if (volume) return volume;
      const polygons = geom34.toPolygons(geometry);
      volume = polygons.reduce((volume2, polygon3) => volume2 + poly3.measureSignedVolume(polygon3), 0);
      cache.set(geometry, volume);
      return volume;
    };
    var measureVolume = (...geometries) => {
      geometries = flatten(geometries);
      if (geometries.length === 0) throw new Error("wrong number of arguments");
      const results = geometries.map((geometry) => {
        if (path2.isA(geometry)) return measureVolumeOfPath2(geometry);
        if (geom2.isA(geometry)) return measureVolumeOfGeom2(geometry);
        if (geom34.isA(geometry)) return measureVolumeOfGeom3(geometry);
        return 0;
      });
      return results.length === 1 ? results[0] : results;
    };
    module.exports = measureVolume;
  }
});

// node_modules/@jscad/modeling/src/measurements/measureAggregateVolume.js
var require_measureAggregateVolume = __commonJS({
  "node_modules/@jscad/modeling/src/measurements/measureAggregateVolume.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var measureVolume = require_measureVolume();
    var measureAggregateVolume = (...geometries) => {
      geometries = flatten(geometries);
      if (geometries.length === 0) throw new Error("measureAggregateVolume: no geometries supplied");
      const volumes = measureVolume(geometries);
      if (geometries.length === 1) {
        return volumes;
      }
      const result = 0;
      return volumes.reduce((result2, volume) => result2 + volume, result);
    };
    module.exports = measureAggregateVolume;
  }
});

// node_modules/@jscad/modeling/src/measurements/measureBoundingSphere.js
var require_measureBoundingSphere2 = __commonJS({
  "node_modules/@jscad/modeling/src/measurements/measureBoundingSphere.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var vec2 = require_vec2();
    var vec3 = require_vec3();
    var geom2 = require_geom2();
    var geom34 = require_geom3();
    var path2 = require_path2();
    var poly3 = require_poly3();
    var cacheOfBoundingSpheres = /* @__PURE__ */ new WeakMap();
    var measureBoundingSphereOfPath2 = (geometry) => {
      let boundingSphere = cacheOfBoundingSpheres.get(geometry);
      if (boundingSphere !== void 0) return boundingSphere;
      const centroid = vec3.create();
      let radius = 0;
      const points = path2.toPoints(geometry);
      if (points.length > 0) {
        let numPoints = 0;
        const temp = vec3.create();
        points.forEach((point) => {
          vec3.add(centroid, centroid, vec3.fromVec2(temp, point, 0));
          numPoints++;
        });
        vec3.scale(centroid, centroid, 1 / numPoints);
        points.forEach((point) => {
          radius = Math.max(radius, vec2.squaredDistance(centroid, point));
        });
        radius = Math.sqrt(radius);
      }
      boundingSphere = [centroid, radius];
      cacheOfBoundingSpheres.set(geometry, boundingSphere);
      return boundingSphere;
    };
    var measureBoundingSphereOfGeom2 = (geometry) => {
      let boundingSphere = cacheOfBoundingSpheres.get(geometry);
      if (boundingSphere !== void 0) return boundingSphere;
      const centroid = vec3.create();
      let radius = 0;
      const sides = geom2.toSides(geometry);
      if (sides.length > 0) {
        let numPoints = 0;
        const temp = vec3.create();
        sides.forEach((side) => {
          vec3.add(centroid, centroid, vec3.fromVec2(temp, side[0], 0));
          numPoints++;
        });
        vec3.scale(centroid, centroid, 1 / numPoints);
        sides.forEach((side) => {
          radius = Math.max(radius, vec2.squaredDistance(centroid, side[0]));
        });
        radius = Math.sqrt(radius);
      }
      boundingSphere = [centroid, radius];
      cacheOfBoundingSpheres.set(geometry, boundingSphere);
      return boundingSphere;
    };
    var measureBoundingSphereOfGeom3 = (geometry) => {
      let boundingSphere = cacheOfBoundingSpheres.get(geometry);
      if (boundingSphere !== void 0) return boundingSphere;
      const centroid = vec3.create();
      let radius = 0;
      const polygons = geom34.toPolygons(geometry);
      if (polygons.length > 0) {
        let numPoints = 0;
        polygons.forEach((polygon3) => {
          poly3.toPoints(polygon3).forEach((point) => {
            vec3.add(centroid, centroid, point);
            numPoints++;
          });
        });
        vec3.scale(centroid, centroid, 1 / numPoints);
        polygons.forEach((polygon3) => {
          poly3.toPoints(polygon3).forEach((point) => {
            radius = Math.max(radius, vec3.squaredDistance(centroid, point));
          });
        });
        radius = Math.sqrt(radius);
      }
      boundingSphere = [centroid, radius];
      cacheOfBoundingSpheres.set(geometry, boundingSphere);
      return boundingSphere;
    };
    var measureBoundingSphere = (...geometries) => {
      geometries = flatten(geometries);
      const results = geometries.map((geometry) => {
        if (path2.isA(geometry)) return measureBoundingSphereOfPath2(geometry);
        if (geom2.isA(geometry)) return measureBoundingSphereOfGeom2(geometry);
        if (geom34.isA(geometry)) return measureBoundingSphereOfGeom3(geometry);
        return [[0, 0, 0], 0];
      });
      return results.length === 1 ? results[0] : results;
    };
    module.exports = measureBoundingSphere;
  }
});

// node_modules/@jscad/modeling/src/measurements/measureCenter.js
var require_measureCenter = __commonJS({
  "node_modules/@jscad/modeling/src/measurements/measureCenter.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var measureBoundingBox3 = require_measureBoundingBox2();
    var measureCenter = (...geometries) => {
      geometries = flatten(geometries);
      const results = geometries.map((geometry) => {
        const bounds = measureBoundingBox3(geometry);
        return [
          bounds[0][0] + (bounds[1][0] - bounds[0][0]) / 2,
          bounds[0][1] + (bounds[1][1] - bounds[0][1]) / 2,
          bounds[0][2] + (bounds[1][2] - bounds[0][2]) / 2
        ];
      });
      return results.length === 1 ? results[0] : results;
    };
    module.exports = measureCenter;
  }
});

// node_modules/@jscad/modeling/src/measurements/measureCenterOfMass.js
var require_measureCenterOfMass = __commonJS({
  "node_modules/@jscad/modeling/src/measurements/measureCenterOfMass.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var vec3 = require_vec3();
    var geom2 = require_geom2();
    var geom34 = require_geom3();
    var cacheOfCenterOfMass = /* @__PURE__ */ new WeakMap();
    var measureCenterOfMassGeom2 = (geometry) => {
      let centerOfMass = cacheOfCenterOfMass.get(geometry);
      if (centerOfMass !== void 0) return centerOfMass;
      const sides = geom2.toSides(geometry);
      let area = 0;
      let x = 0;
      let y = 0;
      if (sides.length > 0) {
        for (let i = 0; i < sides.length; i++) {
          const p1 = sides[i][0];
          const p2 = sides[i][1];
          const a = p1[0] * p2[1] - p1[1] * p2[0];
          area += a;
          x += (p1[0] + p2[0]) * a;
          y += (p1[1] + p2[1]) * a;
        }
        area /= 2;
        const f = 1 / (area * 6);
        x *= f;
        y *= f;
      }
      centerOfMass = vec3.fromValues(x, y, 0);
      cacheOfCenterOfMass.set(geometry, centerOfMass);
      return centerOfMass;
    };
    var measureCenterOfMassGeom3 = (geometry) => {
      let centerOfMass = cacheOfCenterOfMass.get(geometry);
      if (centerOfMass !== void 0) return centerOfMass;
      centerOfMass = vec3.create();
      const polygons = geom34.toPolygons(geometry);
      if (polygons.length === 0) return centerOfMass;
      let totalVolume = 0;
      const vector = vec3.create();
      polygons.forEach((polygon3) => {
        const vertices = polygon3.vertices;
        for (let i = 0; i < vertices.length - 2; i++) {
          vec3.cross(vector, vertices[i + 1], vertices[i + 2]);
          const volume = vec3.dot(vertices[0], vector) / 6;
          totalVolume += volume;
          vec3.add(vector, vertices[0], vertices[i + 1]);
          vec3.add(vector, vector, vertices[i + 2]);
          const weightedCenter = vec3.scale(vector, vector, 1 / 4 * volume);
          vec3.add(centerOfMass, centerOfMass, weightedCenter);
        }
      });
      vec3.scale(centerOfMass, centerOfMass, 1 / totalVolume);
      cacheOfCenterOfMass.set(geometry, centerOfMass);
      return centerOfMass;
    };
    var measureCenterOfMass = (...geometries) => {
      geometries = flatten(geometries);
      const results = geometries.map((geometry) => {
        if (geom2.isA(geometry)) return measureCenterOfMassGeom2(geometry);
        if (geom34.isA(geometry)) return measureCenterOfMassGeom3(geometry);
        return [0, 0, 0];
      });
      return results.length === 1 ? results[0] : results;
    };
    module.exports = measureCenterOfMass;
  }
});

// node_modules/@jscad/modeling/src/measurements/measureDimensions.js
var require_measureDimensions = __commonJS({
  "node_modules/@jscad/modeling/src/measurements/measureDimensions.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var measureBoundingBox3 = require_measureBoundingBox2();
    var measureDimensions = (...geometries) => {
      geometries = flatten(geometries);
      const results = geometries.map((geometry) => {
        const boundingBox = measureBoundingBox3(geometry);
        return [
          boundingBox[1][0] - boundingBox[0][0],
          boundingBox[1][1] - boundingBox[0][1],
          boundingBox[1][2] - boundingBox[0][2]
        ];
      });
      return results.length === 1 ? results[0] : results;
    };
    module.exports = measureDimensions;
  }
});

// node_modules/@jscad/modeling/src/measurements/measureEpsilon.js
var require_measureEpsilon = __commonJS({
  "node_modules/@jscad/modeling/src/measurements/measureEpsilon.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var { geom2, geom3: geom34, path2 } = require_geometries();
    var calculateEpsilonFromBounds = require_calculateEpsilonFromBounds();
    var measureBoundingBox3 = require_measureBoundingBox2();
    var measureEpsilonOfPath2 = (geometry) => calculateEpsilonFromBounds(measureBoundingBox3(geometry), 2);
    var measureEpsilonOfGeom2 = (geometry) => calculateEpsilonFromBounds(measureBoundingBox3(geometry), 2);
    var measureEpsilonOfGeom3 = (geometry) => calculateEpsilonFromBounds(measureBoundingBox3(geometry), 3);
    var measureEpsilon = (...geometries) => {
      geometries = flatten(geometries);
      if (geometries.length === 0) throw new Error("wrong number of arguments");
      const results = geometries.map((geometry) => {
        if (path2.isA(geometry)) return measureEpsilonOfPath2(geometry);
        if (geom2.isA(geometry)) return measureEpsilonOfGeom2(geometry);
        if (geom34.isA(geometry)) return measureEpsilonOfGeom3(geometry);
        return 0;
      });
      return results.length === 1 ? results[0] : results;
    };
    module.exports = measureEpsilon;
  }
});

// node_modules/@jscad/modeling/src/measurements/index.js
var require_measurements = __commonJS({
  "node_modules/@jscad/modeling/src/measurements/index.js"(exports, module) {
    "use strict";
    module.exports = {
      measureAggregateArea: require_measureAggregateArea(),
      measureAggregateBoundingBox: require_measureAggregateBoundingBox(),
      measureAggregateEpsilon: require_measureAggregateEpsilon(),
      measureAggregateVolume: require_measureAggregateVolume(),
      measureArea: require_measureArea3(),
      measureBoundingBox: require_measureBoundingBox2(),
      measureBoundingSphere: require_measureBoundingSphere2(),
      measureCenter: require_measureCenter(),
      measureCenterOfMass: require_measureCenterOfMass(),
      measureDimensions: require_measureDimensions(),
      measureEpsilon: require_measureEpsilon(),
      measureVolume: require_measureVolume()
    };
  }
});

// node_modules/@jscad/modeling/src/primitives/commonChecks.js
var require_commonChecks = __commonJS({
  "node_modules/@jscad/modeling/src/primitives/commonChecks.js"(exports, module) {
    "use strict";
    var isNumberArray = (array, dimension) => {
      if (Array.isArray(array) && array.length >= dimension) {
        return array.every((n) => Number.isFinite(n));
      }
      return false;
    };
    var isGT = (value, constant) => Number.isFinite(value) && value > constant;
    var isGTE = (value, constant) => Number.isFinite(value) && value >= constant;
    module.exports = {
      isNumberArray,
      isGT,
      isGTE
    };
  }
});

// node_modules/@jscad/modeling/src/primitives/arc.js
var require_arc = __commonJS({
  "node_modules/@jscad/modeling/src/primitives/arc.js"(exports, module) {
    "use strict";
    var { EPS, TAU } = require_constants();
    var vec2 = require_vec2();
    var path2 = require_path2();
    var { isGT, isGTE, isNumberArray } = require_commonChecks();
    var arc = (options) => {
      const defaults = {
        center: [0, 0],
        radius: 1,
        startAngle: 0,
        endAngle: TAU,
        makeTangent: false,
        segments: 32
      };
      let { center, radius, startAngle, endAngle, makeTangent, segments } = Object.assign({}, defaults, options);
      if (!isNumberArray(center, 2)) throw new Error("center must be an array of X and Y values");
      if (!isGT(radius, 0)) throw new Error("radius must be greater than zero");
      if (!isGTE(startAngle, 0)) throw new Error("startAngle must be positive");
      if (!isGTE(endAngle, 0)) throw new Error("endAngle must be positive");
      if (!isGTE(segments, 4)) throw new Error("segments must be four or more");
      startAngle = startAngle % TAU;
      endAngle = endAngle % TAU;
      let rotation = TAU;
      if (startAngle < endAngle) {
        rotation = endAngle - startAngle;
      }
      if (startAngle > endAngle) {
        rotation = endAngle + (TAU - startAngle);
      }
      const minangle = Math.acos((radius * radius + radius * radius - EPS * EPS) / (2 * radius * radius));
      const centerv = vec2.clone(center);
      let point;
      const pointArray = [];
      if (rotation < minangle) {
        point = vec2.fromAngleRadians(vec2.create(), startAngle);
        vec2.scale(point, point, radius);
        vec2.add(point, point, centerv);
        pointArray.push(point);
      } else {
        const numsteps = Math.floor(segments * (Math.abs(rotation) / TAU));
        let edgestepsize = numsteps * 0.5 / rotation;
        if (edgestepsize > 0.25) edgestepsize = 0.25;
        const totalsteps = makeTangent ? numsteps + 2 : numsteps;
        for (let i = 0; i <= totalsteps; i++) {
          let step = i;
          if (makeTangent) {
            step = (i - 1) * (numsteps - 2 * edgestepsize) / numsteps + edgestepsize;
            if (step < 0) step = 0;
            if (step > numsteps) step = numsteps;
          }
          const angle = startAngle + step * (rotation / numsteps);
          point = vec2.fromAngleRadians(vec2.create(), angle);
          vec2.scale(point, point, radius);
          vec2.add(point, point, centerv);
          pointArray.push(point);
        }
      }
      return path2.fromPoints({ closed: false }, pointArray);
    };
    module.exports = arc;
  }
});

// node_modules/@jscad/modeling/src/primitives/ellipse.js
var require_ellipse = __commonJS({
  "node_modules/@jscad/modeling/src/primitives/ellipse.js"(exports, module) {
    "use strict";
    var { EPS, TAU } = require_constants();
    var vec2 = require_vec2();
    var geom2 = require_geom2();
    var { sin, cos } = require_trigonometry();
    var { isGTE, isNumberArray } = require_commonChecks();
    var ellipse = (options) => {
      const defaults = {
        center: [0, 0],
        radius: [1, 1],
        startAngle: 0,
        endAngle: TAU,
        segments: 32
      };
      let { center, radius, startAngle, endAngle, segments } = Object.assign({}, defaults, options);
      if (!isNumberArray(center, 2)) throw new Error("center must be an array of X and Y values");
      if (!isNumberArray(radius, 2)) throw new Error("radius must be an array of X and Y values");
      if (!radius.every((n) => n >= 0)) throw new Error("radius values must be positive");
      if (!isGTE(startAngle, 0)) throw new Error("startAngle must be positive");
      if (!isGTE(endAngle, 0)) throw new Error("endAngle must be positive");
      if (!isGTE(segments, 3)) throw new Error("segments must be three or more");
      if (radius[0] === 0 || radius[1] === 0) return geom2.create();
      startAngle = startAngle % TAU;
      endAngle = endAngle % TAU;
      let rotation = TAU;
      if (startAngle < endAngle) {
        rotation = endAngle - startAngle;
      }
      if (startAngle > endAngle) {
        rotation = endAngle + (TAU - startAngle);
      }
      const minradius = Math.min(radius[0], radius[1]);
      const minangle = Math.acos((minradius * minradius + minradius * minradius - EPS * EPS) / (2 * minradius * minradius));
      if (rotation < minangle) throw new Error("startAngle and endAngle do not define a significant rotation");
      segments = Math.floor(segments * (rotation / TAU));
      const centerv = vec2.clone(center);
      const step = rotation / segments;
      const points = [];
      segments = rotation < TAU ? segments + 1 : segments;
      for (let i = 0; i < segments; i++) {
        const angle = step * i + startAngle;
        const point = vec2.fromValues(radius[0] * cos(angle), radius[1] * sin(angle));
        vec2.add(point, centerv, point);
        points.push(point);
      }
      if (rotation < TAU) points.push(centerv);
      return geom2.fromPoints(points);
    };
    module.exports = ellipse;
  }
});

// node_modules/@jscad/modeling/src/primitives/circle.js
var require_circle = __commonJS({
  "node_modules/@jscad/modeling/src/primitives/circle.js"(exports, module) {
    "use strict";
    var { TAU } = require_constants();
    var ellipse = require_ellipse();
    var { isGTE } = require_commonChecks();
    var circle = (options) => {
      const defaults = {
        center: [0, 0],
        radius: 1,
        startAngle: 0,
        endAngle: TAU,
        segments: 32
      };
      let { center, radius, startAngle, endAngle, segments } = Object.assign({}, defaults, options);
      if (!isGTE(radius, 0)) throw new Error("radius must be positive");
      radius = [radius, radius];
      return ellipse({ center, radius, startAngle, endAngle, segments });
    };
    module.exports = circle;
  }
});

// node_modules/@jscad/modeling/src/primitives/cuboid.js
var require_cuboid = __commonJS({
  "node_modules/@jscad/modeling/src/primitives/cuboid.js"(exports, module) {
    "use strict";
    var geom34 = require_geom3();
    var poly3 = require_poly3();
    var { isNumberArray } = require_commonChecks();
    var cuboid = (options) => {
      const defaults = {
        center: [0, 0, 0],
        size: [2, 2, 2]
      };
      const { center, size } = Object.assign({}, defaults, options);
      if (!isNumberArray(center, 3)) throw new Error("center must be an array of X, Y and Z values");
      if (!isNumberArray(size, 3)) throw new Error("size must be an array of width, depth and height values");
      if (!size.every((n) => n >= 0)) throw new Error("size values must be positive");
      if (size[0] === 0 || size[1] === 0 || size[2] === 0) return geom34.create();
      const result = geom34.create(
        // adjust a basic shape to size
        [
          [[0, 4, 6, 2], [-1, 0, 0]],
          [[1, 3, 7, 5], [1, 0, 0]],
          [[0, 1, 5, 4], [0, -1, 0]],
          [[2, 6, 7, 3], [0, 1, 0]],
          [[0, 2, 3, 1], [0, 0, -1]],
          [[4, 5, 7, 6], [0, 0, 1]]
        ].map((info) => {
          const points = info[0].map((i) => {
            const pos = [
              center[0] + size[0] / 2 * (2 * !!(i & 1) - 1),
              center[1] + size[1] / 2 * (2 * !!(i & 2) - 1),
              center[2] + size[2] / 2 * (2 * !!(i & 4) - 1)
            ];
            return pos;
          });
          return poly3.create(points);
        })
      );
      return result;
    };
    module.exports = cuboid;
  }
});

// node_modules/@jscad/modeling/src/primitives/cube.js
var require_cube = __commonJS({
  "node_modules/@jscad/modeling/src/primitives/cube.js"(exports, module) {
    "use strict";
    var cuboid = require_cuboid();
    var { isGTE } = require_commonChecks();
    var cube = (options) => {
      const defaults = {
        center: [0, 0, 0],
        size: 2
      };
      let { center, size } = Object.assign({}, defaults, options);
      if (!isGTE(size, 0)) throw new Error("size must be positive");
      size = [size, size, size];
      return cuboid({ center, size });
    };
    module.exports = cube;
  }
});

// node_modules/@jscad/modeling/src/primitives/cylinderElliptic.js
var require_cylinderElliptic = __commonJS({
  "node_modules/@jscad/modeling/src/primitives/cylinderElliptic.js"(exports, module) {
    "use strict";
    var { EPS, TAU } = require_constants();
    var vec3 = require_vec3();
    var geom34 = require_geom3();
    var poly3 = require_poly3();
    var { sin, cos } = require_trigonometry();
    var { isGT, isGTE, isNumberArray } = require_commonChecks();
    var cylinderElliptic = (options) => {
      const defaults = {
        center: [0, 0, 0],
        height: 2,
        startRadius: [1, 1],
        startAngle: 0,
        endRadius: [1, 1],
        endAngle: TAU,
        segments: 32
      };
      let { center, height, startRadius, startAngle, endRadius, endAngle, segments } = Object.assign({}, defaults, options);
      if (!isNumberArray(center, 3)) throw new Error("center must be an array of X, Y and Z values");
      if (!isGT(height, 0)) throw new Error("height must be greater then zero");
      if (!isNumberArray(startRadius, 2)) throw new Error("startRadius must be an array of X and Y values");
      if (!startRadius.every((n) => n >= 0)) throw new Error("startRadius values must be positive");
      if (!isNumberArray(endRadius, 2)) throw new Error("endRadius must be an array of X and Y values");
      if (!endRadius.every((n) => n >= 0)) throw new Error("endRadius values must be positive");
      if (endRadius.every((n) => n === 0) && startRadius.every((n) => n === 0)) throw new Error("at least one radius must be positive");
      if (!isGTE(startAngle, 0)) throw new Error("startAngle must be positive");
      if (!isGTE(endAngle, 0)) throw new Error("endAngle must be positive");
      if (!isGTE(segments, 4)) throw new Error("segments must be four or more");
      startAngle = startAngle % TAU;
      endAngle = endAngle % TAU;
      let rotation = TAU;
      if (startAngle < endAngle) {
        rotation = endAngle - startAngle;
      }
      if (startAngle > endAngle) {
        rotation = endAngle + (TAU - startAngle);
      }
      const minradius = Math.min(startRadius[0], startRadius[1], endRadius[0], endRadius[1]);
      const minangle = Math.acos((minradius * minradius + minradius * minradius - EPS * EPS) / (2 * minradius * minradius));
      if (rotation < minangle) throw new Error("startAngle and endAngle do not define a significant rotation");
      const slices = Math.floor(segments * (rotation / TAU));
      const start = vec3.fromValues(0, 0, -(height / 2));
      const end = vec3.fromValues(0, 0, height / 2);
      const ray = vec3.subtract(vec3.create(), end, start);
      const axisX = vec3.fromValues(1, 0, 0);
      const axisY = vec3.fromValues(0, 1, 0);
      const v1 = vec3.create();
      const v2 = vec3.create();
      const v3 = vec3.create();
      const point = (stack, slice, radius) => {
        const angle = slice * rotation + startAngle;
        vec3.scale(v1, axisX, radius[0] * cos(angle));
        vec3.scale(v2, axisY, radius[1] * sin(angle));
        vec3.add(v1, v1, v2);
        vec3.scale(v3, ray, stack);
        vec3.add(v3, v3, start);
        return vec3.add(vec3.create(), v1, v3);
      };
      const fromPoints = (...points) => {
        const newpoints = points.map((point2) => vec3.add(vec3.create(), point2, center));
        return poly3.create(newpoints);
      };
      const polygons = [];
      for (let i = 0; i < slices; i++) {
        const t0 = i / slices;
        let t1 = (i + 1) / slices;
        if (rotation === TAU && i === slices - 1) t1 = 0;
        if (endRadius[0] === startRadius[0] && endRadius[1] === startRadius[1]) {
          polygons.push(fromPoints(start, point(0, t1, endRadius), point(0, t0, endRadius)));
          polygons.push(fromPoints(point(0, t1, endRadius), point(1, t1, endRadius), point(1, t0, endRadius), point(0, t0, endRadius)));
          polygons.push(fromPoints(end, point(1, t0, endRadius), point(1, t1, endRadius)));
        } else {
          if (startRadius[0] > 0 && startRadius[1] > 0) {
            polygons.push(fromPoints(start, point(0, t1, startRadius), point(0, t0, startRadius)));
          }
          if (startRadius[0] > 0 || startRadius[1] > 0) {
            polygons.push(fromPoints(point(0, t0, startRadius), point(0, t1, startRadius), point(1, t0, endRadius)));
          }
          if (endRadius[0] > 0 && endRadius[1] > 0) {
            polygons.push(fromPoints(end, point(1, t0, endRadius), point(1, t1, endRadius)));
          }
          if (endRadius[0] > 0 || endRadius[1] > 0) {
            polygons.push(fromPoints(point(1, t0, endRadius), point(0, t1, startRadius), point(1, t1, endRadius)));
          }
        }
      }
      if (rotation < TAU) {
        polygons.push(fromPoints(start, point(0, 0, startRadius), end));
        polygons.push(fromPoints(point(0, 0, startRadius), point(1, 0, endRadius), end));
        polygons.push(fromPoints(start, end, point(0, 1, startRadius)));
        polygons.push(fromPoints(point(0, 1, startRadius), end, point(1, 1, endRadius)));
      }
      const result = geom34.create(polygons);
      return result;
    };
    module.exports = cylinderElliptic;
  }
});

// node_modules/@jscad/modeling/src/primitives/cylinder.js
var require_cylinder = __commonJS({
  "node_modules/@jscad/modeling/src/primitives/cylinder.js"(exports, module) {
    "use strict";
    var geom34 = require_geom3();
    var cylinderElliptic = require_cylinderElliptic();
    var { isGTE } = require_commonChecks();
    var cylinder2 = (options) => {
      const defaults = {
        center: [0, 0, 0],
        height: 2,
        radius: 1,
        segments: 32
      };
      const { center, height, radius, segments } = Object.assign({}, defaults, options);
      if (!isGTE(radius, 0)) throw new Error("radius must be positive");
      if (height === 0 || radius === 0) return geom34.create();
      const newoptions = {
        center,
        height,
        startRadius: [radius, radius],
        endRadius: [radius, radius],
        segments
      };
      return cylinderElliptic(newoptions);
    };
    module.exports = cylinder2;
  }
});

// node_modules/@jscad/modeling/src/primitives/ellipsoid.js
var require_ellipsoid = __commonJS({
  "node_modules/@jscad/modeling/src/primitives/ellipsoid.js"(exports, module) {
    "use strict";
    var { TAU } = require_constants();
    var vec3 = require_vec3();
    var geom34 = require_geom3();
    var poly3 = require_poly3();
    var { sin, cos } = require_trigonometry();
    var { isGTE, isNumberArray } = require_commonChecks();
    var ellipsoid = (options) => {
      const defaults = {
        center: [0, 0, 0],
        radius: [1, 1, 1],
        segments: 32,
        axes: [[1, 0, 0], [0, -1, 0], [0, 0, 1]]
      };
      const { center, radius, segments, axes } = Object.assign({}, defaults, options);
      if (!isNumberArray(center, 3)) throw new Error("center must be an array of X, Y and Z values");
      if (!isNumberArray(radius, 3)) throw new Error("radius must be an array of X, Y and Z values");
      if (!radius.every((n) => n >= 0)) throw new Error("radius values must be positive");
      if (!isGTE(segments, 4)) throw new Error("segments must be four or more");
      if (radius[0] === 0 || radius[1] === 0 || radius[2] === 0) return geom34.create();
      const xvector = vec3.scale(vec3.create(), vec3.normalize(vec3.create(), axes[0]), radius[0]);
      const yvector = vec3.scale(vec3.create(), vec3.normalize(vec3.create(), axes[1]), radius[1]);
      const zvector = vec3.scale(vec3.create(), vec3.normalize(vec3.create(), axes[2]), radius[2]);
      const qsegments = Math.round(segments / 4);
      let prevcylinderpoint;
      const polygons = [];
      const p1 = vec3.create();
      const p2 = vec3.create();
      for (let slice1 = 0; slice1 <= segments; slice1++) {
        const angle = TAU * slice1 / segments;
        const cylinderpoint = vec3.add(vec3.create(), vec3.scale(p1, xvector, cos(angle)), vec3.scale(p2, yvector, sin(angle)));
        if (slice1 > 0) {
          let prevcospitch, prevsinpitch;
          for (let slice2 = 0; slice2 <= qsegments; slice2++) {
            const pitch = TAU / 4 * slice2 / qsegments;
            const cospitch = cos(pitch);
            const sinpitch = sin(pitch);
            if (slice2 > 0) {
              let points = [];
              let point;
              point = vec3.subtract(vec3.create(), vec3.scale(p1, prevcylinderpoint, prevcospitch), vec3.scale(p2, zvector, prevsinpitch));
              points.push(vec3.add(point, point, center));
              point = vec3.subtract(vec3.create(), vec3.scale(p1, cylinderpoint, prevcospitch), vec3.scale(p2, zvector, prevsinpitch));
              points.push(vec3.add(point, point, center));
              if (slice2 < qsegments) {
                point = vec3.subtract(vec3.create(), vec3.scale(p1, cylinderpoint, cospitch), vec3.scale(p2, zvector, sinpitch));
                points.push(vec3.add(point, point, center));
              }
              point = vec3.subtract(vec3.create(), vec3.scale(p1, prevcylinderpoint, cospitch), vec3.scale(p2, zvector, sinpitch));
              points.push(vec3.add(point, point, center));
              polygons.push(poly3.create(points));
              points = [];
              point = vec3.add(vec3.create(), vec3.scale(p1, prevcylinderpoint, prevcospitch), vec3.scale(p2, zvector, prevsinpitch));
              points.push(vec3.add(vec3.create(), center, point));
              point = vec3.add(point, vec3.scale(p1, cylinderpoint, prevcospitch), vec3.scale(p2, zvector, prevsinpitch));
              points.push(vec3.add(vec3.create(), center, point));
              if (slice2 < qsegments) {
                point = vec3.add(point, vec3.scale(p1, cylinderpoint, cospitch), vec3.scale(p2, zvector, sinpitch));
                points.push(vec3.add(vec3.create(), center, point));
              }
              point = vec3.add(point, vec3.scale(p1, prevcylinderpoint, cospitch), vec3.scale(p2, zvector, sinpitch));
              points.push(vec3.add(vec3.create(), center, point));
              points.reverse();
              polygons.push(poly3.create(points));
            }
            prevcospitch = cospitch;
            prevsinpitch = sinpitch;
          }
        }
        prevcylinderpoint = cylinderpoint;
      }
      return geom34.create(polygons);
    };
    module.exports = ellipsoid;
  }
});

// node_modules/@jscad/modeling/src/primitives/polyhedron.js
var require_polyhedron = __commonJS({
  "node_modules/@jscad/modeling/src/primitives/polyhedron.js"(exports, module) {
    "use strict";
    var geom34 = require_geom3();
    var poly3 = require_poly3();
    var { isNumberArray } = require_commonChecks();
    var polyhedron = (options) => {
      const defaults = {
        points: [],
        faces: [],
        colors: void 0,
        orientation: "outward"
      };
      const { points, faces, colors, orientation } = Object.assign({}, defaults, options);
      if (!(Array.isArray(points) && Array.isArray(faces))) {
        throw new Error("points and faces must be arrays");
      }
      if (points.length < 3) {
        throw new Error("three or more points are required");
      }
      if (faces.length < 1) {
        throw new Error("one or more faces are required");
      }
      if (colors) {
        if (!Array.isArray(colors)) {
          throw new Error("colors must be an array");
        }
        if (colors.length !== faces.length) {
          throw new Error("faces and colors must have the same length");
        }
      }
      points.forEach((point, i) => {
        if (!isNumberArray(point, 3)) throw new Error(`point ${i} must be an array of X, Y, Z values`);
      });
      faces.forEach((face, i) => {
        if (face.length < 3) throw new Error(`face ${i} must contain 3 or more indexes`);
        if (!isNumberArray(face, face.length)) throw new Error(`face ${i} must be an array of numbers`);
      });
      if (orientation !== "outward") {
        faces.forEach((face) => face.reverse());
      }
      const polygons = faces.map((face, findex) => {
        const polygon3 = poly3.create(face.map((pindex) => points[pindex]));
        if (colors && colors[findex]) polygon3.color = colors[findex];
        return polygon3;
      });
      return geom34.create(polygons);
    };
    module.exports = polyhedron;
  }
});

// node_modules/@jscad/modeling/src/primitives/geodesicSphere.js
var require_geodesicSphere = __commonJS({
  "node_modules/@jscad/modeling/src/primitives/geodesicSphere.js"(exports, module) {
    "use strict";
    var mat4 = require_mat4();
    var vec3 = require_vec3();
    var geom34 = require_geom3();
    var polyhedron = require_polyhedron();
    var { isGTE } = require_commonChecks();
    var geodesicSphere = (options) => {
      const defaults = {
        radius: 1,
        frequency: 6
      };
      let { radius, frequency } = Object.assign({}, defaults, options);
      if (!isGTE(radius, 0)) throw new Error("radius must be positive");
      if (!isGTE(frequency, 6)) throw new Error("frequency must be six or more");
      if (radius === 0) return geom34.create();
      frequency = Math.floor(frequency / 6);
      const ci = [
        // hard-coded data of icosahedron (20 faces, all triangles)
        [0.850651, 0, -0.525731],
        [0.850651, -0, 0.525731],
        [-0.850651, -0, 0.525731],
        [-0.850651, 0, -0.525731],
        [0, -0.525731, 0.850651],
        [0, 0.525731, 0.850651],
        [0, 0.525731, -0.850651],
        [0, -0.525731, -0.850651],
        [-0.525731, -0.850651, -0],
        [0.525731, -0.850651, -0],
        [0.525731, 0.850651, 0],
        [-0.525731, 0.850651, 0]
      ];
      const ti = [
        [0, 9, 1],
        [1, 10, 0],
        [6, 7, 0],
        [10, 6, 0],
        [7, 9, 0],
        [5, 1, 4],
        [4, 1, 9],
        [5, 10, 1],
        [2, 8, 3],
        [3, 11, 2],
        [2, 5, 4],
        [4, 8, 2],
        [2, 11, 5],
        [3, 7, 6],
        [6, 11, 3],
        [8, 7, 3],
        [9, 8, 4],
        [11, 10, 5],
        [10, 11, 6],
        [8, 9, 7]
      ];
      const geodesicSubDivide = (p, frequency2, offset2) => {
        const p1 = p[0];
        const p2 = p[1];
        const p3 = p[2];
        let n = offset2;
        const c = [];
        const f = [];
        for (let i = 0; i < frequency2; i++) {
          for (let j = 0; j < frequency2 - i; j++) {
            const t0 = i / frequency2;
            const t1 = (i + 1) / frequency2;
            const s0 = j / (frequency2 - i);
            const s1 = (j + 1) / (frequency2 - i);
            const s2 = frequency2 - i - 1 ? j / (frequency2 - i - 1) : 1;
            const q = [];
            q[0] = mix3(mix3(p1, p2, s0), p3, t0);
            q[1] = mix3(mix3(p1, p2, s1), p3, t0);
            q[2] = mix3(mix3(p1, p2, s2), p3, t1);
            for (let k = 0; k < 3; k++) {
              const r = vec3.length(q[k]);
              for (let l = 0; l < 3; l++) {
                q[k][l] /= r;
              }
            }
            c.push(q[0], q[1], q[2]);
            f.push([n, n + 1, n + 2]);
            n += 3;
            if (j < frequency2 - i - 1) {
              const s3 = frequency2 - i - 1 ? (j + 1) / (frequency2 - i - 1) : 1;
              q[0] = mix3(mix3(p1, p2, s1), p3, t0);
              q[1] = mix3(mix3(p1, p2, s3), p3, t1);
              q[2] = mix3(mix3(p1, p2, s2), p3, t1);
              for (let k = 0; k < 3; k++) {
                const r = vec3.length(q[k]);
                for (let l = 0; l < 3; l++) {
                  q[k][l] /= r;
                }
              }
              c.push(q[0], q[1], q[2]);
              f.push([n, n + 1, n + 2]);
              n += 3;
            }
          }
        }
        return { points: c, triangles: f, offset: n };
      };
      const mix3 = (a, b, f) => {
        const _f = 1 - f;
        const c = [];
        for (let i = 0; i < 3; i++) {
          c[i] = a[i] * _f + b[i] * f;
        }
        return c;
      };
      let points = [];
      let faces = [];
      let offset = 0;
      for (let i = 0; i < ti.length; i++) {
        const g = geodesicSubDivide([ci[ti[i][0]], ci[ti[i][1]], ci[ti[i][2]]], frequency, offset);
        points = points.concat(g.points);
        faces = faces.concat(g.triangles);
        offset = g.offset;
      }
      let geometry = polyhedron({ points, faces, orientation: "inward" });
      if (radius !== 1) geometry = geom34.transform(mat4.fromScaling(mat4.create(), [radius, radius, radius]), geometry);
      return geometry;
    };
    module.exports = geodesicSphere;
  }
});

// node_modules/@jscad/modeling/src/primitives/line.js
var require_line = __commonJS({
  "node_modules/@jscad/modeling/src/primitives/line.js"(exports, module) {
    "use strict";
    var path2 = require_path2();
    var line = (points) => {
      if (!Array.isArray(points)) throw new Error("points must be an array");
      return path2.fromPoints({}, points);
    };
    module.exports = line;
  }
});

// node_modules/@jscad/modeling/src/primitives/polygon.js
var require_polygon = __commonJS({
  "node_modules/@jscad/modeling/src/primitives/polygon.js"(exports, module) {
    "use strict";
    var geom2 = require_geom2();
    var polygon3 = (options) => {
      const defaults = {
        points: [],
        paths: [],
        orientation: "counterclockwise"
      };
      const { points, paths, orientation } = Object.assign({}, defaults, options);
      if (!(Array.isArray(points) && Array.isArray(paths))) throw new Error("points and paths must be arrays");
      let listofpolys = points;
      if (Array.isArray(points[0])) {
        if (!Array.isArray(points[0][0])) {
          listofpolys = [points];
        }
      }
      listofpolys.forEach((list, i) => {
        if (!Array.isArray(list)) throw new Error("list of points " + i + " must be an array");
        if (list.length < 3) throw new Error("list of points " + i + " must contain three or more points");
        list.forEach((point, j) => {
          if (!Array.isArray(point)) throw new Error("list of points " + i + ", point " + j + " must be an array");
          if (point.length < 2) throw new Error("list of points " + i + ", point " + j + " must contain by X and Y values");
        });
      });
      let listofpaths = paths;
      if (paths.length === 0) {
        let count = 0;
        listofpaths = listofpolys.map((list) => list.map((point) => count++));
      }
      const allpoints = [];
      listofpolys.forEach((list) => list.forEach((point) => allpoints.push(point)));
      let sides = [];
      listofpaths.forEach((path) => {
        const setofpoints = path.map((index) => allpoints[index]);
        const geometry2 = geom2.fromPoints(setofpoints);
        sides = sides.concat(geom2.toSides(geometry2));
      });
      let geometry = geom2.create(sides);
      if (orientation === "clockwise") {
        geometry = geom2.reverse(geometry);
      }
      return geometry;
    };
    module.exports = polygon3;
  }
});

// node_modules/@jscad/modeling/src/primitives/rectangle.js
var require_rectangle = __commonJS({
  "node_modules/@jscad/modeling/src/primitives/rectangle.js"(exports, module) {
    "use strict";
    var vec2 = require_vec2();
    var geom2 = require_geom2();
    var { isNumberArray } = require_commonChecks();
    var rectangle3 = (options) => {
      const defaults = {
        center: [0, 0],
        size: [2, 2]
      };
      const { center, size } = Object.assign({}, defaults, options);
      if (!isNumberArray(center, 2)) throw new Error("center must be an array of X and Y values");
      if (!isNumberArray(size, 2)) throw new Error("size must be an array of X and Y values");
      if (!size.every((n) => n >= 0)) throw new Error("size values must be positive");
      if (size[0] === 0 || size[1] === 0) return geom2.create();
      const point = [size[0] / 2, size[1] / 2];
      const pswap = [point[0], -point[1]];
      const points = [
        vec2.subtract(vec2.create(), center, point),
        vec2.add(vec2.create(), center, pswap),
        vec2.add(vec2.create(), center, point),
        vec2.subtract(vec2.create(), center, pswap)
      ];
      return geom2.fromPoints(points);
    };
    module.exports = rectangle3;
  }
});

// node_modules/@jscad/modeling/src/primitives/roundedCuboid.js
var require_roundedCuboid = __commonJS({
  "node_modules/@jscad/modeling/src/primitives/roundedCuboid.js"(exports, module) {
    "use strict";
    var { EPS, TAU } = require_constants();
    var vec2 = require_vec2();
    var vec3 = require_vec3();
    var geom34 = require_geom3();
    var poly3 = require_poly3();
    var { sin, cos } = require_trigonometry();
    var { isGTE, isNumberArray } = require_commonChecks();
    var cuboid = require_cuboid();
    var createCorners = (center, size, radius, segments, slice, positive) => {
      const pitch = TAU / 4 * slice / segments;
      const cospitch = cos(pitch);
      const sinpitch = sin(pitch);
      const layersegments = segments - slice;
      let layerradius = radius * cospitch;
      let layeroffset = size[2] - (radius - radius * sinpitch);
      if (!positive) layeroffset = radius - radius * sinpitch - size[2];
      layerradius = layerradius > EPS ? layerradius : 0;
      const corner0 = vec3.add(vec3.create(), center, [size[0] - radius, size[1] - radius, layeroffset]);
      const corner1 = vec3.add(vec3.create(), center, [radius - size[0], size[1] - radius, layeroffset]);
      const corner2 = vec3.add(vec3.create(), center, [radius - size[0], radius - size[1], layeroffset]);
      const corner3 = vec3.add(vec3.create(), center, [size[0] - radius, radius - size[1], layeroffset]);
      const corner0Points = [];
      const corner1Points = [];
      const corner2Points = [];
      const corner3Points = [];
      for (let i = 0; i <= layersegments; i++) {
        const radians = layersegments > 0 ? TAU / 4 * i / layersegments : 0;
        const point2d = vec2.fromAngleRadians(vec2.create(), radians);
        vec2.scale(point2d, point2d, layerradius);
        const point3d = vec3.fromVec2(vec3.create(), point2d);
        corner0Points.push(vec3.add(vec3.create(), corner0, point3d));
        vec3.rotateZ(point3d, point3d, [0, 0, 0], TAU / 4);
        corner1Points.push(vec3.add(vec3.create(), corner1, point3d));
        vec3.rotateZ(point3d, point3d, [0, 0, 0], TAU / 4);
        corner2Points.push(vec3.add(vec3.create(), corner2, point3d));
        vec3.rotateZ(point3d, point3d, [0, 0, 0], TAU / 4);
        corner3Points.push(vec3.add(vec3.create(), corner3, point3d));
      }
      if (!positive) {
        corner0Points.reverse();
        corner1Points.reverse();
        corner2Points.reverse();
        corner3Points.reverse();
        return [corner3Points, corner2Points, corner1Points, corner0Points];
      }
      return [corner0Points, corner1Points, corner2Points, corner3Points];
    };
    var stitchCorners = (previousCorners, currentCorners) => {
      const polygons = [];
      for (let i = 0; i < previousCorners.length; i++) {
        const previous = previousCorners[i];
        const current = currentCorners[i];
        for (let j = 0; j < previous.length - 1; j++) {
          polygons.push(poly3.create([previous[j], previous[j + 1], current[j]]));
          if (j < current.length - 1) {
            polygons.push(poly3.create([current[j], previous[j + 1], current[j + 1]]));
          }
        }
      }
      return polygons;
    };
    var stitchWalls = (previousCorners, currentCorners) => {
      const polygons = [];
      for (let i = 0; i < previousCorners.length; i++) {
        let previous = previousCorners[i];
        let current = currentCorners[i];
        const p0 = previous[previous.length - 1];
        const c0 = current[current.length - 1];
        const j = (i + 1) % previousCorners.length;
        previous = previousCorners[j];
        current = currentCorners[j];
        const p1 = previous[0];
        const c1 = current[0];
        polygons.push(poly3.create([p0, p1, c1, c0]));
      }
      return polygons;
    };
    var stitchSides = (bottomCorners, topCorners) => {
      bottomCorners = [bottomCorners[3], bottomCorners[2], bottomCorners[1], bottomCorners[0]];
      bottomCorners = bottomCorners.map((corner) => corner.slice().reverse());
      const bottomPoints = [];
      bottomCorners.forEach((corner) => {
        corner.forEach((point) => bottomPoints.push(point));
      });
      const topPoints = [];
      topCorners.forEach((corner) => {
        corner.forEach((point) => topPoints.push(point));
      });
      const polygons = [];
      for (let i = 0; i < topPoints.length; i++) {
        const j = (i + 1) % topPoints.length;
        polygons.push(poly3.create([bottomPoints[i], bottomPoints[j], topPoints[j], topPoints[i]]));
      }
      return polygons;
    };
    var roundedCuboid = (options) => {
      const defaults = {
        center: [0, 0, 0],
        size: [2, 2, 2],
        roundRadius: 0.2,
        segments: 32
      };
      let { center, size, roundRadius, segments } = Object.assign({}, defaults, options);
      if (!isNumberArray(center, 3)) throw new Error("center must be an array of X, Y and Z values");
      if (!isNumberArray(size, 3)) throw new Error("size must be an array of X, Y and Z values");
      if (!size.every((n) => n >= 0)) throw new Error("size values must be positive");
      if (!isGTE(roundRadius, 0)) throw new Error("roundRadius must be positive");
      if (!isGTE(segments, 4)) throw new Error("segments must be four or more");
      if (size[0] === 0 || size[1] === 0 || size[2] === 0) return geom34.create();
      if (roundRadius === 0) return cuboid({ center, size });
      size = size.map((v) => v / 2);
      if (roundRadius > size[0] - EPS || roundRadius > size[1] - EPS || roundRadius > size[2] - EPS) throw new Error("roundRadius must be smaller than the radius of all dimensions");
      segments = Math.floor(segments / 4);
      let prevCornersPos = null;
      let prevCornersNeg = null;
      let polygons = [];
      for (let slice = 0; slice <= segments; slice++) {
        const cornersPos = createCorners(center, size, roundRadius, segments, slice, true);
        const cornersNeg = createCorners(center, size, roundRadius, segments, slice, false);
        if (slice === 0) {
          polygons = polygons.concat(stitchSides(cornersNeg, cornersPos));
        }
        if (prevCornersPos) {
          polygons = polygons.concat(
            stitchCorners(prevCornersPos, cornersPos),
            stitchWalls(prevCornersPos, cornersPos)
          );
        }
        if (prevCornersNeg) {
          polygons = polygons.concat(
            stitchCorners(prevCornersNeg, cornersNeg),
            stitchWalls(prevCornersNeg, cornersNeg)
          );
        }
        if (slice === segments) {
          let points = cornersPos.map((corner) => corner[0]);
          polygons.push(poly3.create(points));
          points = cornersNeg.map((corner) => corner[0]);
          polygons.push(poly3.create(points));
        }
        prevCornersPos = cornersPos;
        prevCornersNeg = cornersNeg;
      }
      return geom34.create(polygons);
    };
    module.exports = roundedCuboid;
  }
});

// node_modules/@jscad/modeling/src/primitives/roundedCylinder.js
var require_roundedCylinder = __commonJS({
  "node_modules/@jscad/modeling/src/primitives/roundedCylinder.js"(exports, module) {
    "use strict";
    var { EPS, TAU } = require_constants();
    var vec3 = require_vec3();
    var geom34 = require_geom3();
    var poly3 = require_poly3();
    var { sin, cos } = require_trigonometry();
    var { isGTE, isNumberArray } = require_commonChecks();
    var cylinder2 = require_cylinder();
    var roundedCylinder = (options) => {
      const defaults = {
        center: [0, 0, 0],
        height: 2,
        radius: 1,
        roundRadius: 0.2,
        segments: 32
      };
      const { center, height, radius, roundRadius, segments } = Object.assign({}, defaults, options);
      if (!isNumberArray(center, 3)) throw new Error("center must be an array of X, Y and Z values");
      if (!isGTE(height, 0)) throw new Error("height must be positive");
      if (!isGTE(radius, 0)) throw new Error("radius must be positive");
      if (!isGTE(roundRadius, 0)) throw new Error("roundRadius must be positive");
      if (roundRadius > radius) throw new Error("roundRadius must be smaller than the radius");
      if (!isGTE(segments, 4)) throw new Error("segments must be four or more");
      if (height === 0 || radius === 0) return geom34.create();
      if (roundRadius === 0) return cylinder2({ center, height, radius });
      const start = [0, 0, -(height / 2)];
      const end = [0, 0, height / 2];
      const direction = vec3.subtract(vec3.create(), end, start);
      const length = vec3.length(direction);
      if (2 * roundRadius > length - EPS) throw new Error("height must be larger than twice roundRadius");
      let defaultnormal;
      if (Math.abs(direction[0]) > Math.abs(direction[1])) {
        defaultnormal = vec3.fromValues(0, 1, 0);
      } else {
        defaultnormal = vec3.fromValues(1, 0, 0);
      }
      const zvector = vec3.scale(vec3.create(), vec3.normalize(vec3.create(), direction), roundRadius);
      const xvector = vec3.scale(vec3.create(), vec3.normalize(vec3.create(), vec3.cross(vec3.create(), zvector, defaultnormal)), radius);
      const yvector = vec3.scale(vec3.create(), vec3.normalize(vec3.create(), vec3.cross(vec3.create(), xvector, zvector)), radius);
      vec3.add(start, start, zvector);
      vec3.subtract(end, end, zvector);
      const qsegments = Math.floor(0.25 * segments);
      const fromPoints = (points) => {
        const newpoints = points.map((point) => vec3.add(point, point, center));
        return poly3.create(newpoints);
      };
      const polygons = [];
      const v1 = vec3.create();
      const v2 = vec3.create();
      let prevcylinderpoint;
      for (let slice1 = 0; slice1 <= segments; slice1++) {
        const angle = TAU * slice1 / segments;
        const cylinderpoint = vec3.add(vec3.create(), vec3.scale(v1, xvector, cos(angle)), vec3.scale(v2, yvector, sin(angle)));
        if (slice1 > 0) {
          let points = [];
          points.push(vec3.add(vec3.create(), start, cylinderpoint));
          points.push(vec3.add(vec3.create(), start, prevcylinderpoint));
          points.push(vec3.add(vec3.create(), end, prevcylinderpoint));
          points.push(vec3.add(vec3.create(), end, cylinderpoint));
          polygons.push(fromPoints(points));
          let prevcospitch, prevsinpitch;
          for (let slice2 = 0; slice2 <= qsegments; slice2++) {
            const pitch = TAU / 4 * slice2 / qsegments;
            const cospitch = cos(pitch);
            const sinpitch = sin(pitch);
            if (slice2 > 0) {
              points = [];
              let point;
              point = vec3.add(vec3.create(), start, vec3.subtract(v1, vec3.scale(v1, prevcylinderpoint, prevcospitch), vec3.scale(v2, zvector, prevsinpitch)));
              points.push(point);
              point = vec3.add(vec3.create(), start, vec3.subtract(v1, vec3.scale(v1, cylinderpoint, prevcospitch), vec3.scale(v2, zvector, prevsinpitch)));
              points.push(point);
              if (slice2 < qsegments) {
                point = vec3.add(vec3.create(), start, vec3.subtract(v1, vec3.scale(v1, cylinderpoint, cospitch), vec3.scale(v2, zvector, sinpitch)));
                points.push(point);
              }
              point = vec3.add(vec3.create(), start, vec3.subtract(v1, vec3.scale(v1, prevcylinderpoint, cospitch), vec3.scale(v2, zvector, sinpitch)));
              points.push(point);
              polygons.push(fromPoints(points));
              points = [];
              point = vec3.add(vec3.create(), vec3.scale(v1, prevcylinderpoint, prevcospitch), vec3.scale(v2, zvector, prevsinpitch));
              vec3.add(point, point, end);
              points.push(point);
              point = vec3.add(vec3.create(), vec3.scale(v1, cylinderpoint, prevcospitch), vec3.scale(v2, zvector, prevsinpitch));
              vec3.add(point, point, end);
              points.push(point);
              if (slice2 < qsegments) {
                point = vec3.add(vec3.create(), vec3.scale(v1, cylinderpoint, cospitch), vec3.scale(v2, zvector, sinpitch));
                vec3.add(point, point, end);
                points.push(point);
              }
              point = vec3.add(vec3.create(), vec3.scale(v1, prevcylinderpoint, cospitch), vec3.scale(v2, zvector, sinpitch));
              vec3.add(point, point, end);
              points.push(point);
              points.reverse();
              polygons.push(fromPoints(points));
            }
            prevcospitch = cospitch;
            prevsinpitch = sinpitch;
          }
        }
        prevcylinderpoint = cylinderpoint;
      }
      const result = geom34.create(polygons);
      return result;
    };
    module.exports = roundedCylinder;
  }
});

// node_modules/@jscad/modeling/src/primitives/roundedRectangle.js
var require_roundedRectangle = __commonJS({
  "node_modules/@jscad/modeling/src/primitives/roundedRectangle.js"(exports, module) {
    "use strict";
    var { EPS, TAU } = require_constants();
    var vec2 = require_vec2();
    var geom2 = require_geom2();
    var { isGTE, isNumberArray } = require_commonChecks();
    var rectangle3 = require_rectangle();
    var roundedRectangle2 = (options) => {
      const defaults = {
        center: [0, 0],
        size: [2, 2],
        roundRadius: 0.2,
        segments: 32
      };
      let { center, size, roundRadius, segments } = Object.assign({}, defaults, options);
      if (!isNumberArray(center, 2)) throw new Error("center must be an array of X and Y values");
      if (!isNumberArray(size, 2)) throw new Error("size must be an array of X and Y values");
      if (!size.every((n) => n >= 0)) throw new Error("size values must be positive");
      if (!isGTE(roundRadius, 0)) throw new Error("roundRadius must be positive");
      if (!isGTE(segments, 4)) throw new Error("segments must be four or more");
      if (size[0] === 0 || size[1] === 0) return geom2.create();
      if (roundRadius === 0) return rectangle3({ center, size });
      size = size.map((v) => v / 2);
      if (roundRadius > size[0] - EPS || roundRadius > size[1] - EPS) throw new Error("roundRadius must be smaller than the radius of all dimensions");
      const cornersegments = Math.floor(segments / 4);
      const corner0 = vec2.add(vec2.create(), center, [size[0] - roundRadius, size[1] - roundRadius]);
      const corner1 = vec2.add(vec2.create(), center, [roundRadius - size[0], size[1] - roundRadius]);
      const corner2 = vec2.add(vec2.create(), center, [roundRadius - size[0], roundRadius - size[1]]);
      const corner3 = vec2.add(vec2.create(), center, [size[0] - roundRadius, roundRadius - size[1]]);
      const corner0Points = [];
      const corner1Points = [];
      const corner2Points = [];
      const corner3Points = [];
      for (let i = 0; i <= cornersegments; i++) {
        const radians = TAU / 4 * i / cornersegments;
        const point = vec2.fromAngleRadians(vec2.create(), radians);
        vec2.scale(point, point, roundRadius);
        corner0Points.push(vec2.add(vec2.create(), corner0, point));
        vec2.rotate(point, point, vec2.create(), TAU / 4);
        corner1Points.push(vec2.add(vec2.create(), corner1, point));
        vec2.rotate(point, point, vec2.create(), TAU / 4);
        corner2Points.push(vec2.add(vec2.create(), corner2, point));
        vec2.rotate(point, point, vec2.create(), TAU / 4);
        corner3Points.push(vec2.add(vec2.create(), corner3, point));
      }
      return geom2.fromPoints(corner0Points.concat(corner1Points, corner2Points, corner3Points));
    };
    module.exports = roundedRectangle2;
  }
});

// node_modules/@jscad/modeling/src/primitives/sphere.js
var require_sphere = __commonJS({
  "node_modules/@jscad/modeling/src/primitives/sphere.js"(exports, module) {
    "use strict";
    var ellipsoid = require_ellipsoid();
    var { isGTE } = require_commonChecks();
    var sphere = (options) => {
      const defaults = {
        center: [0, 0, 0],
        radius: 1,
        segments: 32,
        axes: [[1, 0, 0], [0, -1, 0], [0, 0, 1]]
      };
      let { center, radius, segments, axes } = Object.assign({}, defaults, options);
      if (!isGTE(radius, 0)) throw new Error("radius must be positive");
      radius = [radius, radius, radius];
      return ellipsoid({ center, radius, segments, axes });
    };
    module.exports = sphere;
  }
});

// node_modules/@jscad/modeling/src/primitives/square.js
var require_square = __commonJS({
  "node_modules/@jscad/modeling/src/primitives/square.js"(exports, module) {
    "use strict";
    var rectangle3 = require_rectangle();
    var { isGTE } = require_commonChecks();
    var square = (options) => {
      const defaults = {
        center: [0, 0],
        size: 2
      };
      let { center, size } = Object.assign({}, defaults, options);
      if (!isGTE(size, 0)) throw new Error("size must be positive");
      size = [size, size];
      return rectangle3({ center, size });
    };
    module.exports = square;
  }
});

// node_modules/@jscad/modeling/src/primitives/star.js
var require_star = __commonJS({
  "node_modules/@jscad/modeling/src/primitives/star.js"(exports, module) {
    "use strict";
    var { TAU } = require_constants();
    var vec2 = require_vec2();
    var geom2 = require_geom2();
    var { isGT, isGTE, isNumberArray } = require_commonChecks();
    var getRadiusRatio = (vertices, density) => {
      if (vertices > 0 && density > 1 && density < vertices / 2) {
        return Math.cos(Math.PI * density / vertices) / Math.cos(Math.PI * (density - 1) / vertices);
      }
      return 0;
    };
    var getPoints = (vertices, radius, startAngle, center) => {
      const a = TAU / vertices;
      const points = [];
      for (let i = 0; i < vertices; i++) {
        const point = vec2.fromAngleRadians(vec2.create(), a * i + startAngle);
        vec2.scale(point, point, radius);
        vec2.add(point, center, point);
        points.push(point);
      }
      return points;
    };
    var star = (options) => {
      const defaults = {
        center: [0, 0],
        vertices: 5,
        outerRadius: 1,
        innerRadius: 0,
        density: 2,
        startAngle: 0
      };
      let { center, vertices, outerRadius, innerRadius, density, startAngle } = Object.assign({}, defaults, options);
      if (!isNumberArray(center, 2)) throw new Error("center must be an array of X and Y values");
      if (!isGTE(vertices, 2)) throw new Error("vertices must be two or more");
      if (!isGT(outerRadius, 0)) throw new Error("outerRadius must be greater than zero");
      if (!isGTE(innerRadius, 0)) throw new Error("innerRadius must be greater than zero");
      if (!isGTE(startAngle, 0)) throw new Error("startAngle must be greater than zero");
      vertices = Math.floor(vertices);
      density = Math.floor(density);
      startAngle = startAngle % TAU;
      if (innerRadius === 0) {
        if (!isGTE(density, 2)) throw new Error("density must be two or more");
        innerRadius = outerRadius * getRadiusRatio(vertices, density);
      }
      const centerv = vec2.clone(center);
      const outerPoints = getPoints(vertices, outerRadius, startAngle, centerv);
      const innerPoints = getPoints(vertices, innerRadius, startAngle + Math.PI / vertices, centerv);
      const allPoints = [];
      for (let i = 0; i < vertices; i++) {
        allPoints.push(outerPoints[i]);
        allPoints.push(innerPoints[i]);
      }
      return geom2.fromPoints(allPoints);
    };
    module.exports = star;
  }
});

// node_modules/@jscad/modeling/src/operations/transforms/mirror.js
var require_mirror = __commonJS({
  "node_modules/@jscad/modeling/src/operations/transforms/mirror.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var mat4 = require_mat4();
    var plane = require_plane();
    var geom2 = require_geom2();
    var geom34 = require_geom3();
    var path2 = require_path2();
    var mirror = (options, ...objects) => {
      const defaults = {
        origin: [0, 0, 0],
        normal: [0, 0, 1]
        // Z axis
      };
      const { origin, normal } = Object.assign({}, defaults, options);
      objects = flatten(objects);
      if (objects.length === 0) throw new Error("wrong number of arguments");
      const planeOfMirror = plane.fromNormalAndPoint(plane.create(), normal, origin);
      if (Number.isNaN(planeOfMirror[0])) {
        throw new Error("the given origin and normal do not define a proper plane");
      }
      const matrix = mat4.mirrorByPlane(mat4.create(), planeOfMirror);
      const results = objects.map((object) => {
        if (path2.isA(object)) return path2.transform(matrix, object);
        if (geom2.isA(object)) return geom2.transform(matrix, object);
        if (geom34.isA(object)) return geom34.transform(matrix, object);
        return object;
      });
      return results.length === 1 ? results[0] : results;
    };
    var mirrorX = (...objects) => mirror({ normal: [1, 0, 0] }, objects);
    var mirrorY = (...objects) => mirror({ normal: [0, 1, 0] }, objects);
    var mirrorZ = (...objects) => mirror({ normal: [0, 0, 1] }, objects);
    module.exports = {
      mirror,
      mirrorX,
      mirrorY,
      mirrorZ
    };
  }
});

// node_modules/@jscad/modeling/src/operations/extrusions/slice/calculatePlane.js
var require_calculatePlane = __commonJS({
  "node_modules/@jscad/modeling/src/operations/extrusions/slice/calculatePlane.js"(exports, module) {
    "use strict";
    var plane = require_plane();
    var vec3 = require_vec3();
    var calculatePlane = (slice) => {
      const edges = slice.edges;
      if (edges.length < 3) throw new Error("slices must have 3 or more edges to calculate a plane");
      const midpoint = edges.reduce((point, edge) => vec3.add(vec3.create(), point, edge[0]), vec3.create());
      vec3.scale(midpoint, midpoint, 1 / edges.length);
      let farthestEdge;
      let distance = 0;
      edges.forEach((edge) => {
        if (!vec3.equals(edge[0], edge[1])) {
          const d = vec3.squaredDistance(midpoint, edge[0]);
          if (d > distance) {
            farthestEdge = edge;
            distance = d;
          }
        }
      });
      const beforeEdge = edges.find((edge) => vec3.equals(edge[1], farthestEdge[0]));
      return plane.fromPoints(plane.create(), beforeEdge[0], farthestEdge[0], farthestEdge[1]);
    };
    module.exports = calculatePlane;
  }
});

// node_modules/@jscad/modeling/src/operations/extrusions/slice/create.js
var require_create13 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/extrusions/slice/create.js"(exports, module) {
    "use strict";
    var create = (edges) => {
      if (!edges) {
        edges = [];
      }
      return { edges };
    };
    module.exports = create;
  }
});

// node_modules/@jscad/modeling/src/operations/extrusions/slice/clone.js
var require_clone11 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/extrusions/slice/clone.js"(exports, module) {
    "use strict";
    var create = require_create13();
    var vec3 = require_vec3();
    var clone = (...params) => {
      let out;
      let slice;
      if (params.length === 1) {
        out = create();
        slice = params[0];
      } else {
        out = params[0];
        slice = params[1];
      }
      out.edges = slice.edges.map((edge) => [vec3.clone(edge[0]), vec3.clone(edge[1])]);
      return out;
    };
    module.exports = clone;
  }
});

// node_modules/@jscad/modeling/src/operations/extrusions/slice/equals.js
var require_equals8 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/extrusions/slice/equals.js"(exports, module) {
    "use strict";
    var vec3 = require_vec3();
    var equals = (a, b) => {
      const aedges = a.edges;
      const bedges = b.edges;
      if (aedges.length !== bedges.length) {
        return false;
      }
      const isEqual = aedges.reduce((acc, aedge, i) => {
        const bedge = bedges[i];
        const d = vec3.squaredDistance(aedge[0], bedge[0]);
        return acc && d < Number.EPSILON;
      }, true);
      return isEqual;
    };
    module.exports = equals;
  }
});

// node_modules/@jscad/modeling/src/operations/extrusions/slice/fromPoints.js
var require_fromPoints8 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/extrusions/slice/fromPoints.js"(exports, module) {
    "use strict";
    var vec3 = require_vec3();
    var create = require_create13();
    var fromPoints = (points) => {
      if (!Array.isArray(points)) throw new Error("the given points must be an array");
      if (points.length < 3) throw new Error("the given points must contain THREE or more points");
      const edges = [];
      let prevpoint = points[points.length - 1];
      points.forEach((point) => {
        if (point.length === 2) edges.push([vec3.fromVec2(vec3.create(), prevpoint), vec3.fromVec2(vec3.create(), point)]);
        if (point.length === 3) edges.push([prevpoint, point]);
        prevpoint = point;
      });
      return create(edges);
    };
    module.exports = fromPoints;
  }
});

// node_modules/@jscad/modeling/src/operations/extrusions/slice/fromSides.js
var require_fromSides = __commonJS({
  "node_modules/@jscad/modeling/src/operations/extrusions/slice/fromSides.js"(exports, module) {
    "use strict";
    var vec3 = require_vec3();
    var create = require_create13();
    var fromSides = (sides) => {
      if (!Array.isArray(sides)) throw new Error("the given sides must be an array");
      const edges = [];
      sides.forEach((side) => {
        edges.push([vec3.fromVec2(vec3.create(), side[0]), vec3.fromVec2(vec3.create(), side[1])]);
      });
      return create(edges);
    };
    module.exports = fromSides;
  }
});

// node_modules/@jscad/modeling/src/operations/extrusions/slice/isA.js
var require_isA5 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/extrusions/slice/isA.js"(exports, module) {
    "use strict";
    var isA = (object) => {
      if (object && typeof object === "object") {
        if ("edges" in object) {
          if (Array.isArray(object.edges)) {
            return true;
          }
        }
      }
      return false;
    };
    module.exports = isA;
  }
});

// node_modules/@jscad/modeling/src/operations/extrusions/slice/reverse.js
var require_reverse5 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/extrusions/slice/reverse.js"(exports, module) {
    "use strict";
    var create = require_create13();
    var reverse = (...params) => {
      let out;
      let slice;
      if (params.length === 1) {
        out = create();
        slice = params[0];
      } else {
        out = params[0];
        slice = params[1];
      }
      out.edges = slice.edges.map((edge) => [edge[1], edge[0]]);
      return out;
    };
    module.exports = reverse;
  }
});

// node_modules/@jscad/modeling/src/operations/extrusions/slice/toEdges.js
var require_toEdges = __commonJS({
  "node_modules/@jscad/modeling/src/operations/extrusions/slice/toEdges.js"(exports, module) {
    "use strict";
    var toEdges = (slice) => slice.edges;
    module.exports = toEdges;
  }
});

// node_modules/@jscad/modeling/src/operations/extrusions/earcut/linkedListSort.js
var require_linkedListSort = __commonJS({
  "node_modules/@jscad/modeling/src/operations/extrusions/earcut/linkedListSort.js"(exports, module) {
    "use strict";
    var sortLinked = (list, fn) => {
      let i, p, q, e, numMerges;
      let inSize = 1;
      do {
        p = list;
        list = null;
        let tail = null;
        numMerges = 0;
        while (p) {
          numMerges++;
          q = p;
          let pSize = 0;
          for (i = 0; i < inSize; i++) {
            pSize++;
            q = q.nextZ;
            if (!q) break;
          }
          let qSize = inSize;
          while (pSize > 0 || qSize > 0 && q) {
            if (pSize !== 0 && (qSize === 0 || !q || fn(p) <= fn(q))) {
              e = p;
              p = p.nextZ;
              pSize--;
            } else {
              e = q;
              q = q.nextZ;
              qSize--;
            }
            if (tail) tail.nextZ = e;
            else list = e;
            e.prevZ = tail;
            tail = e;
          }
          p = q;
        }
        tail.nextZ = null;
        inSize *= 2;
      } while (numMerges > 1);
      return list;
    };
    module.exports = sortLinked;
  }
});

// node_modules/@jscad/modeling/src/operations/extrusions/earcut/linkedList.js
var require_linkedList = __commonJS({
  "node_modules/@jscad/modeling/src/operations/extrusions/earcut/linkedList.js"(exports, module) {
    "use strict";
    var sortLinked = require_linkedListSort();
    var Node = class {
      constructor(i, x, y) {
        this.i = i;
        this.x = x;
        this.y = y;
        this.prev = null;
        this.next = null;
        this.z = null;
        this.prevZ = null;
        this.nextZ = null;
        this.steiner = false;
      }
    };
    var insertNode = (i, x, y, last) => {
      const p = new Node(i, x, y);
      if (!last) {
        p.prev = p;
        p.next = p;
      } else {
        p.next = last.next;
        p.prev = last;
        last.next.prev = p;
        last.next = p;
      }
      return p;
    };
    var removeNode = (p) => {
      p.next.prev = p.prev;
      p.prev.next = p.next;
      if (p.prevZ) p.prevZ.nextZ = p.nextZ;
      if (p.nextZ) p.nextZ.prevZ = p.prevZ;
    };
    module.exports = { Node, insertNode, removeNode, sortLinked };
  }
});

// node_modules/@jscad/modeling/src/operations/extrusions/earcut/triangle.js
var require_triangle = __commonJS({
  "node_modules/@jscad/modeling/src/operations/extrusions/earcut/triangle.js"(exports, module) {
    "use strict";
    var pointInTriangle = (ax, ay, bx, by, cx, cy, px, py) => (cx - px) * (ay - py) - (ax - px) * (cy - py) >= 0 && (ax - px) * (by - py) - (bx - px) * (ay - py) >= 0 && (bx - px) * (cy - py) - (cx - px) * (by - py) >= 0;
    var area = (p, q, r) => (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    module.exports = { area, pointInTriangle };
  }
});

// node_modules/@jscad/modeling/src/operations/extrusions/earcut/linkedPolygon.js
var require_linkedPolygon = __commonJS({
  "node_modules/@jscad/modeling/src/operations/extrusions/earcut/linkedPolygon.js"(exports, module) {
    "use strict";
    var { Node, insertNode, removeNode } = require_linkedList();
    var { area } = require_triangle();
    var linkedPolygon = (data, start, end, dim, clockwise) => {
      let last;
      if (clockwise === signedArea2(data, start, end, dim) > 0) {
        for (let i = start; i < end; i += dim) {
          last = insertNode(i, data[i], data[i + 1], last);
        }
      } else {
        for (let i = end - dim; i >= start; i -= dim) {
          last = insertNode(i, data[i], data[i + 1], last);
        }
      }
      if (last && equals(last, last.next)) {
        removeNode(last);
        last = last.next;
      }
      return last;
    };
    var filterPoints = (start, end) => {
      if (!start) return start;
      if (!end) end = start;
      let p = start;
      let again;
      do {
        again = false;
        if (!p.steiner && (equals(p, p.next) || area(p.prev, p, p.next) === 0)) {
          removeNode(p);
          p = end = p.prev;
          if (p === p.next) break;
          again = true;
        } else {
          p = p.next;
        }
      } while (again || p !== end);
      return end;
    };
    var cureLocalIntersections = (start, triangles, dim) => {
      let p = start;
      do {
        const a = p.prev;
        const b = p.next.next;
        if (!equals(a, b) && intersects(a, p, p.next, b) && locallyInside(a, b) && locallyInside(b, a)) {
          triangles.push(a.i / dim);
          triangles.push(p.i / dim);
          triangles.push(b.i / dim);
          removeNode(p);
          removeNode(p.next);
          p = start = b;
        }
        p = p.next;
      } while (p !== start);
      return filterPoints(p);
    };
    var intersectsPolygon = (a, b) => {
      let p = a;
      do {
        if (p.i !== a.i && p.next.i !== a.i && p.i !== b.i && p.next.i !== b.i && intersects(p, p.next, a, b)) return true;
        p = p.next;
      } while (p !== a);
      return false;
    };
    var locallyInside = (a, b) => area(a.prev, a, a.next) < 0 ? area(a, b, a.next) >= 0 && area(a, a.prev, b) >= 0 : area(a, b, a.prev) < 0 || area(a, a.next, b) < 0;
    var middleInside = (a, b) => {
      let p = a;
      let inside = false;
      const px = (a.x + b.x) / 2;
      const py = (a.y + b.y) / 2;
      do {
        if (p.y > py !== p.next.y > py && p.next.y !== p.y && px < (p.next.x - p.x) * (py - p.y) / (p.next.y - p.y) + p.x) {
          inside = !inside;
        }
        p = p.next;
      } while (p !== a);
      return inside;
    };
    var splitPolygon = (a, b) => {
      const a2 = new Node(a.i, a.x, a.y);
      const b2 = new Node(b.i, b.x, b.y);
      const an = a.next;
      const bp = b.prev;
      a.next = b;
      b.prev = a;
      a2.next = an;
      an.prev = a2;
      b2.next = a2;
      a2.prev = b2;
      bp.next = b2;
      b2.prev = bp;
      return b2;
    };
    var isValidDiagonal = (a, b) => a.next.i !== b.i && a.prev.i !== b.i && !intersectsPolygon(a, b) && // doesn't intersect other edges
    (locallyInside(a, b) && locallyInside(b, a) && middleInside(a, b) && // locally visible
    (area(a.prev, a, b.prev) || area(a, b.prev, b)) || // does not create opposite-facing sectors
    equals(a, b) && area(a.prev, a, a.next) > 0 && area(b.prev, b, b.next) > 0);
    var intersects = (p1, q1, p2, q2) => {
      const o1 = Math.sign(area(p1, q1, p2));
      const o2 = Math.sign(area(p1, q1, q2));
      const o3 = Math.sign(area(p2, q2, p1));
      const o4 = Math.sign(area(p2, q2, q1));
      if (o1 !== o2 && o3 !== o4) return true;
      if (o1 === 0 && onSegment(p1, p2, q1)) return true;
      if (o2 === 0 && onSegment(p1, q2, q1)) return true;
      if (o3 === 0 && onSegment(p2, p1, q2)) return true;
      if (o4 === 0 && onSegment(p2, q1, q2)) return true;
      return false;
    };
    var onSegment = (p, q, r) => q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);
    var signedArea2 = (data, start, end, dim) => {
      let sum = 0;
      for (let i = start, j = end - dim; i < end; i += dim) {
        sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);
        j = i;
      }
      return sum;
    };
    var equals = (p1, p2) => p1.x === p2.x && p1.y === p2.y;
    module.exports = { cureLocalIntersections, filterPoints, isValidDiagonal, linkedPolygon, locallyInside, splitPolygon };
  }
});

// node_modules/@jscad/modeling/src/operations/extrusions/earcut/eliminateHoles.js
var require_eliminateHoles = __commonJS({
  "node_modules/@jscad/modeling/src/operations/extrusions/earcut/eliminateHoles.js"(exports, module) {
    "use strict";
    var { filterPoints, linkedPolygon, locallyInside, splitPolygon } = require_linkedPolygon();
    var { area, pointInTriangle } = require_triangle();
    var eliminateHoles = (data, holeIndices, outerNode, dim) => {
      const queue = [];
      for (let i = 0, len = holeIndices.length; i < len; i++) {
        const start = holeIndices[i] * dim;
        const end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
        const list = linkedPolygon(data, start, end, dim, false);
        if (list === list.next) list.steiner = true;
        queue.push(getLeftmost(list));
      }
      queue.sort((a, b) => a.x - b.x);
      for (let i = 0; i < queue.length; i++) {
        outerNode = eliminateHole(queue[i], outerNode);
        outerNode = filterPoints(outerNode, outerNode.next);
      }
      return outerNode;
    };
    var eliminateHole = (hole, outerNode) => {
      const bridge = findHoleBridge(hole, outerNode);
      if (!bridge) {
        return outerNode;
      }
      const bridgeReverse = splitPolygon(bridge, hole);
      const filteredBridge = filterPoints(bridge, bridge.next);
      filterPoints(bridgeReverse, bridgeReverse.next);
      return outerNode === bridge ? filteredBridge : outerNode;
    };
    var findHoleBridge = (hole, outerNode) => {
      let p = outerNode;
      const hx = hole.x;
      const hy = hole.y;
      let qx = -Infinity;
      let m;
      do {
        if (hy <= p.y && hy >= p.next.y && p.next.y !== p.y) {
          const x = p.x + (hy - p.y) * (p.next.x - p.x) / (p.next.y - p.y);
          if (x <= hx && x > qx) {
            qx = x;
            if (x === hx) {
              if (hy === p.y) return p;
              if (hy === p.next.y) return p.next;
            }
            m = p.x < p.next.x ? p : p.next;
          }
        }
        p = p.next;
      } while (p !== outerNode);
      if (!m) return null;
      if (hx === qx) return m;
      const stop = m;
      const mx = m.x;
      const my = m.y;
      let tanMin = Infinity;
      p = m;
      do {
        if (hx >= p.x && p.x >= mx && hx !== p.x && pointInTriangle(hy < my ? hx : qx, hy, mx, my, hy < my ? qx : hx, hy, p.x, p.y)) {
          const tan = Math.abs(hy - p.y) / (hx - p.x);
          if (locallyInside(p, hole) && (tan < tanMin || tan === tanMin && (p.x > m.x || p.x === m.x && sectorContainsSector(m, p)))) {
            m = p;
            tanMin = tan;
          }
        }
        p = p.next;
      } while (p !== stop);
      return m;
    };
    var sectorContainsSector = (m, p) => area(m.prev, m, p.prev) < 0 && area(p.next, m, m.next) < 0;
    var getLeftmost = (start) => {
      let p = start;
      let leftmost = start;
      do {
        if (p.x < leftmost.x || p.x === leftmost.x && p.y < leftmost.y) leftmost = p;
        p = p.next;
      } while (p !== start);
      return leftmost;
    };
    module.exports = eliminateHoles;
  }
});

// node_modules/@jscad/modeling/src/operations/extrusions/earcut/index.js
var require_earcut = __commonJS({
  "node_modules/@jscad/modeling/src/operations/extrusions/earcut/index.js"(exports, module) {
    "use strict";
    var eliminateHoles = require_eliminateHoles();
    var { removeNode, sortLinked } = require_linkedList();
    var { cureLocalIntersections, filterPoints, isValidDiagonal, linkedPolygon, splitPolygon } = require_linkedPolygon();
    var { area, pointInTriangle } = require_triangle();
    var triangulate = (data, holeIndices, dim = 2) => {
      const hasHoles = holeIndices && holeIndices.length;
      const outerLen = hasHoles ? holeIndices[0] * dim : data.length;
      let outerNode = linkedPolygon(data, 0, outerLen, dim, true);
      const triangles = [];
      if (!outerNode || outerNode.next === outerNode.prev) return triangles;
      let minX, minY, maxX, maxY, invSize;
      if (hasHoles) outerNode = eliminateHoles(data, holeIndices, outerNode, dim);
      if (data.length > 80 * dim) {
        minX = maxX = data[0];
        minY = maxY = data[1];
        for (let i = dim; i < outerLen; i += dim) {
          const x = data[i];
          const y = data[i + 1];
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
        invSize = Math.max(maxX - minX, maxY - minY);
        invSize = invSize !== 0 ? 1 / invSize : 0;
      }
      earcutLinked(outerNode, triangles, dim, minX, minY, invSize);
      return triangles;
    };
    var earcutLinked = (ear, triangles, dim, minX, minY, invSize, pass) => {
      if (!ear) return;
      if (!pass && invSize) indexCurve(ear, minX, minY, invSize);
      let stop = ear;
      let prev;
      let next;
      while (ear.prev !== ear.next) {
        prev = ear.prev;
        next = ear.next;
        if (invSize ? isEarHashed(ear, minX, minY, invSize) : isEar(ear)) {
          triangles.push(prev.i / dim);
          triangles.push(ear.i / dim);
          triangles.push(next.i / dim);
          removeNode(ear);
          ear = next.next;
          stop = next.next;
          continue;
        }
        ear = next;
        if (ear === stop) {
          if (!pass) {
            earcutLinked(filterPoints(ear), triangles, dim, minX, minY, invSize, 1);
          } else if (pass === 1) {
            ear = cureLocalIntersections(filterPoints(ear), triangles, dim);
            earcutLinked(ear, triangles, dim, minX, minY, invSize, 2);
          } else if (pass === 2) {
            splitEarcut(ear, triangles, dim, minX, minY, invSize);
          }
          break;
        }
      }
    };
    var isEar = (ear) => {
      const a = ear.prev;
      const b = ear;
      const c = ear.next;
      if (area(a, b, c) >= 0) return false;
      let p = ear.next.next;
      while (p !== ear.prev) {
        if (pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) && area(p.prev, p, p.next) >= 0) {
          return false;
        }
        p = p.next;
      }
      return true;
    };
    var isEarHashed = (ear, minX, minY, invSize) => {
      const a = ear.prev;
      const b = ear;
      const c = ear.next;
      if (area(a, b, c) >= 0) return false;
      const minTX = a.x < b.x ? a.x < c.x ? a.x : c.x : b.x < c.x ? b.x : c.x;
      const minTY = a.y < b.y ? a.y < c.y ? a.y : c.y : b.y < c.y ? b.y : c.y;
      const maxTX = a.x > b.x ? a.x > c.x ? a.x : c.x : b.x > c.x ? b.x : c.x;
      const maxTY = a.y > b.y ? a.y > c.y ? a.y : c.y : b.y > c.y ? b.y : c.y;
      const minZ = zOrder(minTX, minTY, minX, minY, invSize);
      const maxZ = zOrder(maxTX, maxTY, minX, minY, invSize);
      let p = ear.prevZ;
      let n = ear.nextZ;
      while (p && p.z >= minZ && n && n.z <= maxZ) {
        if (p !== ear.prev && p !== ear.next && pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) && area(p.prev, p, p.next) >= 0) return false;
        p = p.prevZ;
        if (n !== ear.prev && n !== ear.next && pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, n.x, n.y) && area(n.prev, n, n.next) >= 0) return false;
        n = n.nextZ;
      }
      while (p && p.z >= minZ) {
        if (p !== ear.prev && p !== ear.next && pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) && area(p.prev, p, p.next) >= 0) return false;
        p = p.prevZ;
      }
      while (n && n.z <= maxZ) {
        if (n !== ear.prev && n !== ear.next && pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, n.x, n.y) && area(n.prev, n, n.next) >= 0) return false;
        n = n.nextZ;
      }
      return true;
    };
    var splitEarcut = (start, triangles, dim, minX, minY, invSize) => {
      let a = start;
      do {
        let b = a.next.next;
        while (b !== a.prev) {
          if (a.i !== b.i && isValidDiagonal(a, b)) {
            let c = splitPolygon(a, b);
            a = filterPoints(a, a.next);
            c = filterPoints(c, c.next);
            earcutLinked(a, triangles, dim, minX, minY, invSize);
            earcutLinked(c, triangles, dim, minX, minY, invSize);
            return;
          }
          b = b.next;
        }
        a = a.next;
      } while (a !== start);
    };
    var indexCurve = (start, minX, minY, invSize) => {
      let p = start;
      do {
        if (p.z === null) p.z = zOrder(p.x, p.y, minX, minY, invSize);
        p.prevZ = p.prev;
        p.nextZ = p.next;
        p = p.next;
      } while (p !== start);
      p.prevZ.nextZ = null;
      p.prevZ = null;
      sortLinked(p, (p2) => p2.z);
    };
    var zOrder = (x, y, minX, minY, invSize) => {
      x = 32767 * (x - minX) * invSize;
      y = 32767 * (y - minY) * invSize;
      x = (x | x << 8) & 16711935;
      x = (x | x << 4) & 252645135;
      x = (x | x << 2) & 858993459;
      x = (x | x << 1) & 1431655765;
      y = (y | y << 8) & 16711935;
      y = (y | y << 4) & 252645135;
      y = (y | y << 2) & 858993459;
      y = (y | y << 1) & 1431655765;
      return x | y << 1;
    };
    module.exports = triangulate;
  }
});

// node_modules/@jscad/modeling/src/operations/extrusions/earcut/assignHoles.js
var require_assignHoles = __commonJS({
  "node_modules/@jscad/modeling/src/operations/extrusions/earcut/assignHoles.js"(exports, module) {
    "use strict";
    var { area } = require_utils();
    var { toOutlines } = require_geom2();
    var { arePointsInside } = require_poly2();
    var assignHoles = (geometry) => {
      const outlines = toOutlines(geometry);
      const solids = [];
      const holes = [];
      outlines.forEach((outline, i) => {
        const a = area(outline);
        if (a < 0) {
          holes.push(i);
        } else if (a > 0) {
          solids.push(i);
        }
      });
      const children = [];
      const parents = [];
      solids.forEach((s, i) => {
        const solid = outlines[s];
        children[i] = [];
        holes.forEach((h, j) => {
          const hole = outlines[h];
          if (arePointsInside([hole[0]], { vertices: solid })) {
            children[i].push(h);
            if (!parents[j]) parents[j] = [];
            parents[j].push(i);
          }
        });
      });
      holes.forEach((h, j) => {
        if (parents[j] && parents[j].length > 1) {
          const directParent = minIndex(parents[j], (p) => children[p].length);
          parents[j].forEach((p, i) => {
            if (i !== directParent) {
              children[p] = children[p].filter((c) => c !== h);
            }
          });
        }
      });
      return children.map((holes2, i) => ({
        solid: outlines[solids[i]],
        holes: holes2.map((h) => outlines[h])
      }));
    };
    var minIndex = (list, score) => {
      let bestIndex;
      let best;
      list.forEach((item, index) => {
        const value = score(item);
        if (best === void 0 || value < best) {
          bestIndex = index;
          best = value;
        }
      });
      return bestIndex;
    };
    module.exports = assignHoles;
  }
});

// node_modules/@jscad/modeling/src/operations/extrusions/earcut/polygonHierarchy.js
var require_polygonHierarchy = __commonJS({
  "node_modules/@jscad/modeling/src/operations/extrusions/earcut/polygonHierarchy.js"(exports, module) {
    "use strict";
    var geom2 = require_geom2();
    var plane = require_plane();
    var vec2 = require_vec2();
    var vec3 = require_vec3();
    var calculatePlane = require_calculatePlane();
    var assignHoles = require_assignHoles();
    var PolygonHierarchy = class {
      constructor(slice) {
        this.plane = calculatePlane(slice);
        const rightvector = vec3.orthogonal(vec3.create(), this.plane);
        const perp = vec3.cross(vec3.create(), this.plane, rightvector);
        this.v = vec3.normalize(perp, perp);
        this.u = vec3.cross(vec3.create(), this.v, this.plane);
        this.basisMap = /* @__PURE__ */ new Map();
        const projected = slice.edges.map((e) => e.map((v) => this.to2D(v)));
        const geometry = geom2.create(projected);
        this.roots = assignHoles(geometry);
      }
      /*
       * project a 3D point onto the 2D plane
       */
      to2D(vector3) {
        const vector2 = vec2.fromValues(vec3.dot(vector3, this.u), vec3.dot(vector3, this.v));
        this.basisMap.set(vector2, vector3);
        return vector2;
      }
      /*
       * un-project a 2D point back into 3D
       */
      to3D(vector2) {
        const original = this.basisMap.get(vector2);
        if (original) {
          return original;
        } else {
          console.log("Warning: point not in original slice");
          const v1 = vec3.scale(vec3.create(), this.u, vector2[0]);
          const v2 = vec3.scale(vec3.create(), this.v, vector2[1]);
          const planeOrigin = vec3.scale(vec3.create(), plane, plane[3]);
          const v3 = vec3.add(v1, v1, planeOrigin);
          return vec3.add(v2, v2, v3);
        }
      }
    };
    module.exports = PolygonHierarchy;
  }
});

// node_modules/@jscad/modeling/src/operations/extrusions/slice/toPolygons.js
var require_toPolygons2 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/extrusions/slice/toPolygons.js"(exports, module) {
    "use strict";
    var poly3 = require_poly3();
    var earcut2 = require_earcut();
    var PolygonHierarchy = require_polygonHierarchy();
    var toPolygons4 = (slice) => {
      const hierarchy = new PolygonHierarchy(slice);
      const polygons = [];
      hierarchy.roots.forEach(({ solid, holes }) => {
        let index = solid.length;
        const holesIndex = [];
        holes.forEach((hole, i) => {
          holesIndex.push(index);
          index += hole.length;
        });
        const vertices = [solid, ...holes].flat();
        const data = vertices.flat();
        const getVertex = (i) => hierarchy.to3D(vertices[i]);
        const indices = earcut2(data, holesIndex);
        for (let i = 0; i < indices.length; i += 3) {
          const tri = indices.slice(i, i + 3).map(getVertex);
          polygons.push(poly3.fromPointsAndPlane(tri, hierarchy.plane));
        }
      });
      return polygons;
    };
    module.exports = toPolygons4;
  }
});

// node_modules/@jscad/modeling/src/operations/extrusions/slice/toString.js
var require_toString11 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/extrusions/slice/toString.js"(exports, module) {
    "use strict";
    var vec3 = require_vec3();
    var edgesToString = (edges) => edges.reduce((result, edge) => result += `[${vec3.toString(edge[0])}, ${vec3.toString(edge[1])}], `, "");
    var toString = (slice) => `[${edgesToString(slice.edges)}]`;
    module.exports = toString;
  }
});

// node_modules/@jscad/modeling/src/operations/extrusions/slice/transform.js
var require_transform11 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/extrusions/slice/transform.js"(exports, module) {
    "use strict";
    var vec3 = require_vec3();
    var create = require_create13();
    var transform = (matrix, slice) => {
      const edges = slice.edges.map((edge) => [vec3.transform(vec3.create(), edge[0], matrix), vec3.transform(vec3.create(), edge[1], matrix)]);
      return create(edges);
    };
    module.exports = transform;
  }
});

// node_modules/@jscad/modeling/src/operations/extrusions/slice/index.js
var require_slice = __commonJS({
  "node_modules/@jscad/modeling/src/operations/extrusions/slice/index.js"(exports, module) {
    "use strict";
    module.exports = {
      calculatePlane: require_calculatePlane(),
      clone: require_clone11(),
      create: require_create13(),
      equals: require_equals8(),
      fromPoints: require_fromPoints8(),
      fromSides: require_fromSides(),
      isA: require_isA5(),
      reverse: require_reverse5(),
      toEdges: require_toEdges(),
      toPolygons: require_toPolygons2(),
      toString: require_toString11(),
      transform: require_transform11()
    };
  }
});

// node_modules/@jscad/modeling/src/operations/extrusions/slice/repair.js
var require_repair = __commonJS({
  "node_modules/@jscad/modeling/src/operations/extrusions/slice/repair.js"(exports, module) {
    "use strict";
    var vec3 = require_vec3();
    var create = require_create13();
    var repair = (slice) => {
      if (!slice.edges) return slice;
      let edges = slice.edges;
      const vertexMap = /* @__PURE__ */ new Map();
      const edgeCount = /* @__PURE__ */ new Map();
      edges = edges.filter((e) => !vec3.equals(e[0], e[1]));
      edges.forEach((edge) => {
        const inKey = edge[0].toString();
        const outKey = edge[1].toString();
        vertexMap.set(inKey, edge[0]);
        vertexMap.set(outKey, edge[1]);
        edgeCount.set(inKey, (edgeCount.get(inKey) || 0) + 1);
        edgeCount.set(outKey, (edgeCount.get(outKey) || 0) - 1);
      });
      const missingIn = [];
      const missingOut = [];
      edgeCount.forEach((count, vertex) => {
        if (count < 0) missingIn.push(vertex);
        if (count > 0) missingOut.push(vertex);
      });
      missingIn.forEach((key1) => {
        const v1 = vertexMap.get(key1);
        let bestDistance = Infinity;
        let bestReplacement;
        missingOut.forEach((key2) => {
          const v2 = vertexMap.get(key2);
          const distance = vec3.distance(v1, v2);
          if (distance < bestDistance) {
            bestDistance = distance;
            bestReplacement = v2;
          }
        });
        console.warn(`slice.repair: repairing vertex gap ${v1} to ${bestReplacement} distance ${bestDistance}`);
        edges = edges.map((edge) => {
          if (edge[0].toString() === key1) return [bestReplacement, edge[1]];
          if (edge[1].toString() === key1) return [edge[0], bestReplacement];
          return edge;
        });
      });
      return create(edges);
    };
    module.exports = repair;
  }
});

// node_modules/@jscad/modeling/src/operations/extrusions/extrudeWalls.js
var require_extrudeWalls = __commonJS({
  "node_modules/@jscad/modeling/src/operations/extrusions/extrudeWalls.js"(exports, module) {
    "use strict";
    var { EPS } = require_constants();
    var vec3 = require_vec3();
    var poly3 = require_poly3();
    var slice = require_slice();
    var gcd = (a, b) => {
      if (a === b) {
        return a;
      }
      if (a < b) {
        return gcd(b, a);
      }
      if (b === 1) {
        return 1;
      }
      if (b === 0) {
        return a;
      }
      return gcd(b, a % b);
    };
    var lcm = (a, b) => a * b / gcd(a, b);
    var repartitionEdges = (newlength, edges) => {
      const multiple = newlength / edges.length;
      if (multiple === 1) {
        return edges;
      }
      const divisor = vec3.fromValues(multiple, multiple, multiple);
      const increment = vec3.create();
      const newEdges = [];
      edges.forEach((edge) => {
        vec3.subtract(increment, edge[1], edge[0]);
        vec3.divide(increment, increment, divisor);
        let prev = edge[0];
        for (let i = 1; i <= multiple; ++i) {
          const next = vec3.add(vec3.create(), prev, increment);
          newEdges.push([prev, next]);
          prev = next;
        }
      });
      return newEdges;
    };
    var EPSAREA = EPS * EPS / 2 * Math.sin(Math.PI / 3);
    var extrudeWalls = (slice0, slice1) => {
      let edges0 = slice.toEdges(slice0);
      let edges1 = slice.toEdges(slice1);
      if (edges0.length !== edges1.length) {
        const newlength = lcm(edges0.length, edges1.length);
        if (newlength !== edges0.length) edges0 = repartitionEdges(newlength, edges0);
        if (newlength !== edges1.length) edges1 = repartitionEdges(newlength, edges1);
      }
      const walls = [];
      edges0.forEach((edge0, i) => {
        const edge1 = edges1[i];
        const poly0 = poly3.create([edge0[0], edge0[1], edge1[1]]);
        const poly0area = poly3.measureArea(poly0);
        if (Number.isFinite(poly0area) && poly0area > EPSAREA) walls.push(poly0);
        const poly1 = poly3.create([edge0[0], edge1[1], edge1[0]]);
        const poly1area = poly3.measureArea(poly1);
        if (Number.isFinite(poly1area) && poly1area > EPSAREA) walls.push(poly1);
      });
      return walls;
    };
    module.exports = extrudeWalls;
  }
});

// node_modules/@jscad/modeling/src/operations/extrusions/extrudeFromSlices.js
var require_extrudeFromSlices = __commonJS({
  "node_modules/@jscad/modeling/src/operations/extrusions/extrudeFromSlices.js"(exports, module) {
    "use strict";
    var mat4 = require_mat4();
    var geom2 = require_geom2();
    var geom34 = require_geom3();
    var poly3 = require_poly3();
    var slice = require_slice();
    var repairSlice = require_repair();
    var extrudeWalls = require_extrudeWalls();
    var defaultCallback = (progress, index, base) => {
      let baseSlice = null;
      if (geom2.isA(base)) baseSlice = slice.fromSides(geom2.toSides(base));
      if (poly3.isA(base)) baseSlice = slice.fromPoints(poly3.toPoints(base));
      return progress === 0 || progress === 1 ? slice.transform(mat4.fromTranslation(mat4.create(), [0, 0, progress]), baseSlice) : null;
    };
    var extrudeFromSlices = (options, base) => {
      const defaults = {
        numberOfSlices: 2,
        capStart: true,
        capEnd: true,
        close: false,
        repair: true,
        callback: defaultCallback
      };
      const { numberOfSlices, capStart, capEnd, close, repair, callback: generate } = Object.assign({}, defaults, options);
      if (numberOfSlices < 2) throw new Error("numberOfSlices must be 2 or more");
      if (repair) {
        base = repairSlice(base);
      }
      const sMax = numberOfSlices - 1;
      let startSlice = null;
      let endSlice = null;
      let prevSlice = null;
      let polygons = [];
      for (let s = 0; s < numberOfSlices; s++) {
        const currentSlice = generate(s / sMax, s, base);
        if (currentSlice) {
          if (!slice.isA(currentSlice)) throw new Error("the callback function must return slice objects");
          const edges = slice.toEdges(currentSlice);
          if (edges.length === 0) throw new Error("the callback function must return slices with one or more edges");
          if (prevSlice) {
            const walls = extrudeWalls(prevSlice, currentSlice);
            for (let i = 0; i < walls.length; i++) {
              polygons.push(walls[i]);
            }
          }
          if (s === 0) startSlice = currentSlice;
          if (s === numberOfSlices - 1) endSlice = currentSlice;
          prevSlice = currentSlice;
        }
      }
      if (capEnd) {
        const endPolygons = slice.toPolygons(endSlice);
        for (let i = 0; i < endPolygons.length; i++) {
          polygons.push(endPolygons[i]);
        }
      }
      if (capStart) {
        const startPolygons = slice.toPolygons(startSlice).map(poly3.invert);
        for (let i = 0; i < startPolygons.length; i++) {
          polygons.push(startPolygons[i]);
        }
      }
      if (!capStart && !capEnd) {
        if (close && !slice.equals(endSlice, startSlice)) {
          const walls = extrudeWalls(endSlice, startSlice);
          for (let i = 0; i < walls.length; i++) {
            polygons.push(walls[i]);
          }
        }
      }
      return geom34.create(polygons);
    };
    module.exports = extrudeFromSlices;
  }
});

// node_modules/@jscad/modeling/src/operations/extrusions/extrudeRotate.js
var require_extrudeRotate = __commonJS({
  "node_modules/@jscad/modeling/src/operations/extrusions/extrudeRotate.js"(exports, module) {
    "use strict";
    var { TAU } = require_constants();
    var mat4 = require_mat4();
    var { mirrorX } = require_mirror();
    var geom2 = require_geom2();
    var slice = require_slice();
    var extrudeFromSlices = require_extrudeFromSlices();
    var extrudeRotate = (options, geometry) => {
      const defaults = {
        segments: 12,
        startAngle: 0,
        angle: TAU,
        overflow: "cap"
      };
      let { segments, startAngle, angle, overflow } = Object.assign({}, defaults, options);
      if (segments < 3) throw new Error("segments must be greater then 3");
      startAngle = Math.abs(startAngle) > TAU ? startAngle % TAU : startAngle;
      angle = Math.abs(angle) > TAU ? angle % TAU : angle;
      let endAngle = startAngle + angle;
      endAngle = Math.abs(endAngle) > TAU ? endAngle % TAU : endAngle;
      if (endAngle < startAngle) {
        const x = startAngle;
        startAngle = endAngle;
        endAngle = x;
      }
      let totalRotation = endAngle - startAngle;
      if (totalRotation <= 0) totalRotation = TAU;
      if (Math.abs(totalRotation) < TAU) {
        const anglePerSegment = TAU / segments;
        segments = Math.floor(Math.abs(totalRotation) / anglePerSegment);
        if (Math.abs(totalRotation) > segments * anglePerSegment) segments++;
      }
      let shapeSides = geom2.toSides(geometry);
      if (shapeSides.length === 0) throw new Error("the given geometry cannot be empty");
      const pointsWithNegativeX = shapeSides.filter((s) => s[0][0] < 0);
      const pointsWithPositiveX = shapeSides.filter((s) => s[0][0] >= 0);
      const arePointsWithNegAndPosX = pointsWithNegativeX.length > 0 && pointsWithPositiveX.length > 0;
      if (arePointsWithNegAndPosX && overflow === "cap") {
        if (pointsWithNegativeX.length > pointsWithPositiveX.length) {
          shapeSides = shapeSides.map((side) => {
            let point0 = side[0];
            let point1 = side[1];
            point0 = [Math.min(point0[0], 0), point0[1]];
            point1 = [Math.min(point1[0], 0), point1[1]];
            return [point0, point1];
          });
          geometry = geom2.create(shapeSides);
          geometry = mirrorX(geometry);
        } else if (pointsWithPositiveX.length >= pointsWithNegativeX.length) {
          shapeSides = shapeSides.map((side) => {
            let point0 = side[0];
            let point1 = side[1];
            point0 = [Math.max(point0[0], 0), point0[1]];
            point1 = [Math.max(point1[0], 0), point1[1]];
            return [point0, point1];
          });
          geometry = geom2.create(shapeSides);
        }
      }
      const rotationPerSlice = totalRotation / segments;
      const isCapped = Math.abs(totalRotation) < TAU;
      const baseSlice = slice.fromSides(geom2.toSides(geometry));
      slice.reverse(baseSlice, baseSlice);
      const matrix = mat4.create();
      const xRotationMatrix = mat4.fromXRotation(mat4.create(), TAU / 4);
      const zRotationMatrix = mat4.create();
      const createSlice = (progress, index, base) => {
        let Zrotation = rotationPerSlice * index + startAngle;
        if (totalRotation === TAU && index === segments) {
          Zrotation = startAngle;
        }
        mat4.fromZRotation(zRotationMatrix, Zrotation);
        mat4.multiply(matrix, zRotationMatrix, xRotationMatrix);
        return slice.transform(matrix, base);
      };
      options = {
        numberOfSlices: segments + 1,
        capStart: isCapped,
        capEnd: isCapped,
        close: !isCapped,
        callback: createSlice
      };
      return extrudeFromSlices(options, baseSlice);
    };
    module.exports = extrudeRotate;
  }
});

// node_modules/@jscad/modeling/src/operations/transforms/rotate.js
var require_rotate3 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/transforms/rotate.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var mat4 = require_mat4();
    var geom2 = require_geom2();
    var geom34 = require_geom3();
    var path2 = require_path2();
    var rotate = (angles, ...objects) => {
      if (!Array.isArray(angles)) throw new Error("angles must be an array");
      objects = flatten(objects);
      if (objects.length === 0) throw new Error("wrong number of arguments");
      angles = angles.slice();
      while (angles.length < 3) angles.push(0);
      const yaw = angles[2];
      const pitch = angles[1];
      const roll = angles[0];
      const matrix = mat4.fromTaitBryanRotation(mat4.create(), yaw, pitch, roll);
      const results = objects.map((object) => {
        if (path2.isA(object)) return path2.transform(matrix, object);
        if (geom2.isA(object)) return geom2.transform(matrix, object);
        if (geom34.isA(object)) return geom34.transform(matrix, object);
        return object;
      });
      return results.length === 1 ? results[0] : results;
    };
    var rotateX3 = (angle, ...objects) => rotate([angle, 0, 0], objects);
    var rotateY = (angle, ...objects) => rotate([0, angle, 0], objects);
    var rotateZ3 = (angle, ...objects) => rotate([0, 0, angle], objects);
    module.exports = {
      rotate,
      rotateX: rotateX3,
      rotateY,
      rotateZ: rotateZ3
    };
  }
});

// node_modules/@jscad/modeling/src/operations/transforms/translate.js
var require_translate2 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/transforms/translate.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var mat4 = require_mat4();
    var geom2 = require_geom2();
    var geom34 = require_geom3();
    var path2 = require_path2();
    var translate3 = (offset, ...objects) => {
      if (!Array.isArray(offset)) throw new Error("offset must be an array");
      objects = flatten(objects);
      if (objects.length === 0) throw new Error("wrong number of arguments");
      offset = offset.slice();
      while (offset.length < 3) offset.push(0);
      const matrix = mat4.fromTranslation(mat4.create(), offset);
      const results = objects.map((object) => {
        if (path2.isA(object)) return path2.transform(matrix, object);
        if (geom2.isA(object)) return geom2.transform(matrix, object);
        if (geom34.isA(object)) return geom34.transform(matrix, object);
        return object;
      });
      return results.length === 1 ? results[0] : results;
    };
    var translateX = (offset, ...objects) => translate3([offset, 0, 0], objects);
    var translateY = (offset, ...objects) => translate3([0, offset, 0], objects);
    var translateZ = (offset, ...objects) => translate3([0, 0, offset], objects);
    module.exports = {
      translate: translate3,
      translateX,
      translateY,
      translateZ
    };
  }
});

// node_modules/@jscad/modeling/src/primitives/torus.js
var require_torus = __commonJS({
  "node_modules/@jscad/modeling/src/primitives/torus.js"(exports, module) {
    "use strict";
    var { TAU } = require_constants();
    var extrudeRotate = require_extrudeRotate();
    var { rotate } = require_rotate3();
    var { translate: translate3 } = require_translate2();
    var circle = require_circle();
    var { isGT, isGTE } = require_commonChecks();
    var torus = (options) => {
      const defaults = {
        innerRadius: 1,
        innerSegments: 32,
        outerRadius: 4,
        outerSegments: 32,
        innerRotation: 0,
        startAngle: 0,
        outerRotation: TAU
      };
      const { innerRadius, innerSegments, outerRadius, outerSegments, innerRotation, startAngle, outerRotation } = Object.assign({}, defaults, options);
      if (!isGT(innerRadius, 0)) throw new Error("innerRadius must be greater than zero");
      if (!isGTE(innerSegments, 3)) throw new Error("innerSegments must be three or more");
      if (!isGT(outerRadius, 0)) throw new Error("outerRadius must be greater than zero");
      if (!isGTE(outerSegments, 3)) throw new Error("outerSegments must be three or more");
      if (!isGTE(startAngle, 0)) throw new Error("startAngle must be positive");
      if (!isGT(outerRotation, 0)) throw new Error("outerRotation must be greater than zero");
      if (innerRadius >= outerRadius) throw new Error("inner circle is too large to rotate about the outer circle");
      let innerCircle = circle({ radius: innerRadius, segments: innerSegments });
      if (innerRotation !== 0) {
        innerCircle = rotate([0, 0, innerRotation], innerCircle);
      }
      innerCircle = translate3([outerRadius, 0], innerCircle);
      const extrudeOptions = {
        startAngle,
        angle: outerRotation,
        segments: outerSegments
      };
      return extrudeRotate(extrudeOptions, innerCircle);
    };
    module.exports = torus;
  }
});

// node_modules/@jscad/modeling/src/primitives/triangle.js
var require_triangle2 = __commonJS({
  "node_modules/@jscad/modeling/src/primitives/triangle.js"(exports, module) {
    "use strict";
    var { NEPS } = require_constants();
    var vec2 = require_vec2();
    var geom2 = require_geom2();
    var { isNumberArray } = require_commonChecks();
    var solveAngleFromSSS = (a, b, c) => Math.acos((a * a + b * b - c * c) / (2 * a * b));
    var solveSideFromSAS = (a, C, b) => {
      if (C > NEPS) {
        return Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(C));
      }
      return Math.sqrt((a - b) * (a - b) + a * b * C * C * (1 - C * C / 12));
    };
    var solveAAA = (angles) => {
      const eps = Math.abs(angles[0] + angles[1] + angles[2] - Math.PI);
      if (eps > NEPS) throw new Error("AAA triangles require angles that sum to PI");
      const A = angles[0];
      const B = angles[1];
      const C = Math.PI - A - B;
      const c = 1;
      const a = c / Math.sin(C) * Math.sin(A);
      const b = c / Math.sin(C) * Math.sin(B);
      return createTriangle(A, B, C, a, b, c);
    };
    var solveAAS = (values) => {
      const A = values[0];
      const B = values[1];
      const C = Math.PI + NEPS - A - B;
      if (C < NEPS) throw new Error("AAS triangles require angles that sum to PI");
      const a = values[2];
      const b = a / Math.sin(A) * Math.sin(B);
      const c = a / Math.sin(A) * Math.sin(C);
      return createTriangle(A, B, C, a, b, c);
    };
    var solveASA = (values) => {
      const A = values[0];
      const B = values[2];
      const C = Math.PI + NEPS - A - B;
      if (C < NEPS) throw new Error("ASA triangles require angles that sum to PI");
      const c = values[1];
      const a = c / Math.sin(C) * Math.sin(A);
      const b = c / Math.sin(C) * Math.sin(B);
      return createTriangle(A, B, C, a, b, c);
    };
    var solveSAS = (values) => {
      const c = values[0];
      const B = values[1];
      const a = values[2];
      const b = solveSideFromSAS(c, B, a);
      const A = solveAngleFromSSS(b, c, a);
      const C = Math.PI - A - B;
      return createTriangle(A, B, C, a, b, c);
    };
    var solveSSA = (values) => {
      const c = values[0];
      const a = values[1];
      const C = values[2];
      const A = Math.asin(a * Math.sin(C) / c);
      const B = Math.PI - A - C;
      const b = c / Math.sin(C) * Math.sin(B);
      return createTriangle(A, B, C, a, b, c);
    };
    var solveSSS = (lengths) => {
      const a = lengths[1];
      const b = lengths[2];
      const c = lengths[0];
      if (a + b <= c || b + c <= a || c + a <= b) {
        throw new Error("SSS triangle is incorrect, as the longest side is longer than the sum of the other sides");
      }
      const A = solveAngleFromSSS(b, c, a);
      const B = solveAngleFromSSS(c, a, b);
      const C = Math.PI - A - B;
      return createTriangle(A, B, C, a, b, c);
    };
    var createTriangle = (A, B, C, a, b, c) => {
      const p0 = vec2.fromValues(0, 0);
      const p1 = vec2.fromValues(c, 0);
      const p2 = vec2.fromValues(a, 0);
      vec2.add(p2, vec2.rotate(p2, p2, [0, 0], Math.PI - B), p1);
      return geom2.fromPoints([p0, p1, p2]);
    };
    var triangle = (options) => {
      const defaults = {
        type: "SSS",
        values: [1, 1, 1]
      };
      let { type, values } = Object.assign({}, defaults, options);
      if (typeof type !== "string") throw new Error("triangle type must be a string");
      type = type.toUpperCase();
      if (!((type[0] === "A" || type[0] === "S") && (type[1] === "A" || type[1] === "S") && (type[2] === "A" || type[2] === "S"))) throw new Error("triangle type must contain three letters; A or S");
      if (!isNumberArray(values, 3)) throw new Error("triangle values must contain three values");
      if (!values.every((n) => n > 0)) throw new Error("triangle values must be greater than zero");
      switch (type) {
        case "AAA":
          return solveAAA(values);
        case "AAS":
          return solveAAS(values);
        case "ASA":
          return solveASA(values);
        case "SAS":
          return solveSAS(values);
        case "SSA":
          return solveSSA(values);
        case "SSS":
          return solveSSS(values);
        default:
          throw new Error("invalid triangle type, try again");
      }
    };
    module.exports = triangle;
  }
});

// node_modules/@jscad/modeling/src/primitives/index.js
var require_primitives = __commonJS({
  "node_modules/@jscad/modeling/src/primitives/index.js"(exports, module) {
    "use strict";
    module.exports = {
      arc: require_arc(),
      circle: require_circle(),
      cube: require_cube(),
      cuboid: require_cuboid(),
      cylinder: require_cylinder(),
      cylinderElliptic: require_cylinderElliptic(),
      ellipse: require_ellipse(),
      ellipsoid: require_ellipsoid(),
      geodesicSphere: require_geodesicSphere(),
      line: require_line(),
      polygon: require_polygon(),
      polyhedron: require_polyhedron(),
      rectangle: require_rectangle(),
      roundedCuboid: require_roundedCuboid(),
      roundedCylinder: require_roundedCylinder(),
      roundedRectangle: require_roundedRectangle(),
      sphere: require_sphere(),
      square: require_square(),
      star: require_star(),
      torus: require_torus(),
      triangle: require_triangle2()
    };
  }
});

// node_modules/@jscad/modeling/src/text/fonts/single-line/hershey/simplex.js
var require_simplex = __commonJS({
  "node_modules/@jscad/modeling/src/text/fonts/single-line/hershey/simplex.js"(exports, module) {
    "use strict";
    module.exports = {
      height: 14,
      32: [16],
      33: [10, 5, 21, 5, 7, void 0, 5, 2, 4, 1, 5, 0, 6, 1, 5, 2],
      34: [16, 4, 21, 4, 14, void 0, 12, 21, 12, 14],
      35: [21, 11, 25, 4, -7, void 0, 17, 25, 10, -7, void 0, 4, 12, 18, 12, void 0, 3, 6, 17, 6],
      36: [20, 8, 25, 8, -4, void 0, 12, 25, 12, -4, void 0, 17, 18, 15, 20, 12, 21, 8, 21, 5, 20, 3, 18, 3, 16, 4, 14, 5, 13, 7, 12, 13, 10, 15, 9, 16, 8, 17, 6, 17, 3, 15, 1, 12, 0, 8, 0, 5, 1, 3, 3],
      37: [24, 21, 21, 3, 0, void 0, 8, 21, 10, 19, 10, 17, 9, 15, 7, 14, 5, 14, 3, 16, 3, 18, 4, 20, 6, 21, 8, 21, 10, 20, 13, 19, 16, 19, 19, 20, 21, 21, void 0, 17, 7, 15, 6, 14, 4, 14, 2, 16, 0, 18, 0, 20, 1, 21, 3, 21, 5, 19, 7, 17, 7],
      38: [26, 23, 12, 23, 13, 22, 14, 21, 14, 20, 13, 19, 11, 17, 6, 15, 3, 13, 1, 11, 0, 7, 0, 5, 1, 4, 2, 3, 4, 3, 6, 4, 8, 5, 9, 12, 13, 13, 14, 14, 16, 14, 18, 13, 20, 11, 21, 9, 20, 8, 18, 8, 16, 9, 13, 11, 10, 16, 3, 18, 1, 20, 0, 22, 0, 23, 1, 23, 2],
      39: [10, 5, 19, 4, 20, 5, 21, 6, 20, 6, 18, 5, 16, 4, 15],
      40: [14, 11, 25, 9, 23, 7, 20, 5, 16, 4, 11, 4, 7, 5, 2, 7, -2, 9, -5, 11, -7],
      41: [14, 3, 25, 5, 23, 7, 20, 9, 16, 10, 11, 10, 7, 9, 2, 7, -2, 5, -5, 3, -7],
      42: [16, 8, 21, 8, 9, void 0, 3, 18, 13, 12, void 0, 13, 18, 3, 12],
      43: [26, 13, 18, 13, 0, void 0, 4, 9, 22, 9],
      44: [10, 6, 1, 5, 0, 4, 1, 5, 2, 6, 1, 6, -1, 5, -3, 4, -4],
      45: [26, 4, 9, 22, 9],
      46: [10, 5, 2, 4, 1, 5, 0, 6, 1, 5, 2],
      47: [22, 20, 25, 2, -7],
      48: [20, 9, 21, 6, 20, 4, 17, 3, 12, 3, 9, 4, 4, 6, 1, 9, 0, 11, 0, 14, 1, 16, 4, 17, 9, 17, 12, 16, 17, 14, 20, 11, 21, 9, 21],
      49: [20, 6, 17, 8, 18, 11, 21, 11, 0],
      50: [20, 4, 16, 4, 17, 5, 19, 6, 20, 8, 21, 12, 21, 14, 20, 15, 19, 16, 17, 16, 15, 15, 13, 13, 10, 3, 0, 17, 0],
      51: [20, 5, 21, 16, 21, 10, 13, 13, 13, 15, 12, 16, 11, 17, 8, 17, 6, 16, 3, 14, 1, 11, 0, 8, 0, 5, 1, 4, 2, 3, 4],
      52: [20, 13, 21, 3, 7, 18, 7, void 0, 13, 21, 13, 0],
      53: [20, 15, 21, 5, 21, 4, 12, 5, 13, 8, 14, 11, 14, 14, 13, 16, 11, 17, 8, 17, 6, 16, 3, 14, 1, 11, 0, 8, 0, 5, 1, 4, 2, 3, 4],
      54: [20, 16, 18, 15, 20, 12, 21, 10, 21, 7, 20, 5, 17, 4, 12, 4, 7, 5, 3, 7, 1, 10, 0, 11, 0, 14, 1, 16, 3, 17, 6, 17, 7, 16, 10, 14, 12, 11, 13, 10, 13, 7, 12, 5, 10, 4, 7],
      55: [20, 17, 21, 7, 0, void 0, 3, 21, 17, 21],
      56: [20, 8, 21, 5, 20, 4, 18, 4, 16, 5, 14, 7, 13, 11, 12, 14, 11, 16, 9, 17, 7, 17, 4, 16, 2, 15, 1, 12, 0, 8, 0, 5, 1, 4, 2, 3, 4, 3, 7, 4, 9, 6, 11, 9, 12, 13, 13, 15, 14, 16, 16, 16, 18, 15, 20, 12, 21, 8, 21],
      57: [20, 16, 14, 15, 11, 13, 9, 10, 8, 9, 8, 6, 9, 4, 11, 3, 14, 3, 15, 4, 18, 6, 20, 9, 21, 10, 21, 13, 20, 15, 18, 16, 14, 16, 9, 15, 4, 13, 1, 10, 0, 8, 0, 5, 1, 4, 3],
      58: [10, 5, 14, 4, 13, 5, 12, 6, 13, 5, 14, void 0, 5, 2, 4, 1, 5, 0, 6, 1, 5, 2],
      59: [10, 5, 14, 4, 13, 5, 12, 6, 13, 5, 14, void 0, 6, 1, 5, 0, 4, 1, 5, 2, 6, 1, 6, -1, 5, -3, 4, -4],
      60: [24, 20, 18, 4, 9, 20, 0],
      61: [26, 4, 12, 22, 12, void 0, 4, 6, 22, 6],
      62: [24, 4, 18, 20, 9, 4, 0],
      63: [18, 3, 16, 3, 17, 4, 19, 5, 20, 7, 21, 11, 21, 13, 20, 14, 19, 15, 17, 15, 15, 14, 13, 13, 12, 9, 10, 9, 7, void 0, 9, 2, 8, 1, 9, 0, 10, 1, 9, 2],
      64: [27, 18, 13, 17, 15, 15, 16, 12, 16, 10, 15, 9, 14, 8, 11, 8, 8, 9, 6, 11, 5, 14, 5, 16, 6, 17, 8, void 0, 12, 16, 10, 14, 9, 11, 9, 8, 10, 6, 11, 5, void 0, 18, 16, 17, 8, 17, 6, 19, 5, 21, 5, 23, 7, 24, 10, 24, 12, 23, 15, 22, 17, 20, 19, 18, 20, 15, 21, 12, 21, 9, 20, 7, 19, 5, 17, 4, 15, 3, 12, 3, 9, 4, 6, 5, 4, 7, 2, 9, 1, 12, 0, 15, 0, 18, 1, 20, 2, 21, 3, void 0, 19, 16, 18, 8, 18, 6, 19, 5],
      65: [18, 9, 21, 1, 0, void 0, 9, 21, 17, 0, void 0, 4, 7, 14, 7],
      66: [21, 4, 21, 4, 0, void 0, 4, 21, 13, 21, 16, 20, 17, 19, 18, 17, 18, 15, 17, 13, 16, 12, 13, 11, void 0, 4, 11, 13, 11, 16, 10, 17, 9, 18, 7, 18, 4, 17, 2, 16, 1, 13, 0, 4, 0],
      67: [21, 18, 16, 17, 18, 15, 20, 13, 21, 9, 21, 7, 20, 5, 18, 4, 16, 3, 13, 3, 8, 4, 5, 5, 3, 7, 1, 9, 0, 13, 0, 15, 1, 17, 3, 18, 5],
      68: [21, 4, 21, 4, 0, void 0, 4, 21, 11, 21, 14, 20, 16, 18, 17, 16, 18, 13, 18, 8, 17, 5, 16, 3, 14, 1, 11, 0, 4, 0],
      69: [19, 4, 21, 4, 0, void 0, 4, 21, 17, 21, void 0, 4, 11, 12, 11, void 0, 4, 0, 17, 0],
      70: [18, 4, 21, 4, 0, void 0, 4, 21, 17, 21, void 0, 4, 11, 12, 11],
      71: [21, 18, 16, 17, 18, 15, 20, 13, 21, 9, 21, 7, 20, 5, 18, 4, 16, 3, 13, 3, 8, 4, 5, 5, 3, 7, 1, 9, 0, 13, 0, 15, 1, 17, 3, 18, 5, 18, 8, void 0, 13, 8, 18, 8],
      72: [22, 4, 21, 4, 0, void 0, 18, 21, 18, 0, void 0, 4, 11, 18, 11],
      73: [8, 4, 21, 4, 0],
      74: [16, 12, 21, 12, 5, 11, 2, 10, 1, 8, 0, 6, 0, 4, 1, 3, 2, 2, 5, 2, 7],
      75: [21, 4, 21, 4, 0, void 0, 18, 21, 4, 7, void 0, 9, 12, 18, 0],
      76: [17, 4, 21, 4, 0, void 0, 4, 0, 16, 0],
      77: [24, 4, 21, 4, 0, void 0, 4, 21, 12, 0, void 0, 20, 21, 12, 0, void 0, 20, 21, 20, 0],
      78: [22, 4, 21, 4, 0, void 0, 4, 21, 18, 0, void 0, 18, 21, 18, 0],
      79: [22, 9, 21, 7, 20, 5, 18, 4, 16, 3, 13, 3, 8, 4, 5, 5, 3, 7, 1, 9, 0, 13, 0, 15, 1, 17, 3, 18, 5, 19, 8, 19, 13, 18, 16, 17, 18, 15, 20, 13, 21, 9, 21],
      80: [21, 4, 21, 4, 0, void 0, 4, 21, 13, 21, 16, 20, 17, 19, 18, 17, 18, 14, 17, 12, 16, 11, 13, 10, 4, 10],
      81: [22, 9, 21, 7, 20, 5, 18, 4, 16, 3, 13, 3, 8, 4, 5, 5, 3, 7, 1, 9, 0, 13, 0, 15, 1, 17, 3, 18, 5, 19, 8, 19, 13, 18, 16, 17, 18, 15, 20, 13, 21, 9, 21, void 0, 12, 4, 18, -2],
      82: [21, 4, 21, 4, 0, void 0, 4, 21, 13, 21, 16, 20, 17, 19, 18, 17, 18, 15, 17, 13, 16, 12, 13, 11, 4, 11, void 0, 11, 11, 18, 0],
      83: [20, 17, 18, 15, 20, 12, 21, 8, 21, 5, 20, 3, 18, 3, 16, 4, 14, 5, 13, 7, 12, 13, 10, 15, 9, 16, 8, 17, 6, 17, 3, 15, 1, 12, 0, 8, 0, 5, 1, 3, 3],
      84: [16, 8, 21, 8, 0, void 0, 1, 21, 15, 21],
      85: [22, 4, 21, 4, 6, 5, 3, 7, 1, 10, 0, 12, 0, 15, 1, 17, 3, 18, 6, 18, 21],
      86: [18, 1, 21, 9, 0, void 0, 17, 21, 9, 0],
      87: [24, 2, 21, 7, 0, void 0, 12, 21, 7, 0, void 0, 12, 21, 17, 0, void 0, 22, 21, 17, 0],
      88: [20, 3, 21, 17, 0, void 0, 17, 21, 3, 0],
      89: [18, 1, 21, 9, 11, 9, 0, void 0, 17, 21, 9, 11],
      90: [20, 17, 21, 3, 0, void 0, 3, 21, 17, 21, void 0, 3, 0, 17, 0],
      91: [14, 4, 25, 4, -7, void 0, 5, 25, 5, -7, void 0, 4, 25, 11, 25, void 0, 4, -7, 11, -7],
      92: [14, 0, 21, 14, -3],
      93: [14, 9, 25, 9, -7, void 0, 10, 25, 10, -7, void 0, 3, 25, 10, 25, void 0, 3, -7, 10, -7],
      94: [16, 6, 15, 8, 18, 10, 15, void 0, 3, 12, 8, 17, 13, 12, void 0, 8, 17, 8, 0],
      95: [16, 0, -2, 16, -2],
      96: [10, 6, 21, 5, 20, 4, 18, 4, 16, 5, 15, 6, 16, 5, 17],
      97: [19, 15, 14, 15, 0, void 0, 15, 11, 13, 13, 11, 14, 8, 14, 6, 13, 4, 11, 3, 8, 3, 6, 4, 3, 6, 1, 8, 0, 11, 0, 13, 1, 15, 3],
      98: [19, 4, 21, 4, 0, void 0, 4, 11, 6, 13, 8, 14, 11, 14, 13, 13, 15, 11, 16, 8, 16, 6, 15, 3, 13, 1, 11, 0, 8, 0, 6, 1, 4, 3],
      99: [18, 15, 11, 13, 13, 11, 14, 8, 14, 6, 13, 4, 11, 3, 8, 3, 6, 4, 3, 6, 1, 8, 0, 11, 0, 13, 1, 15, 3],
      100: [19, 15, 21, 15, 0, void 0, 15, 11, 13, 13, 11, 14, 8, 14, 6, 13, 4, 11, 3, 8, 3, 6, 4, 3, 6, 1, 8, 0, 11, 0, 13, 1, 15, 3],
      101: [18, 3, 8, 15, 8, 15, 10, 14, 12, 13, 13, 11, 14, 8, 14, 6, 13, 4, 11, 3, 8, 3, 6, 4, 3, 6, 1, 8, 0, 11, 0, 13, 1, 15, 3],
      102: [12, 10, 21, 8, 21, 6, 20, 5, 17, 5, 0, void 0, 2, 14, 9, 14],
      103: [19, 15, 14, 15, -2, 14, -5, 13, -6, 11, -7, 8, -7, 6, -6, void 0, 15, 11, 13, 13, 11, 14, 8, 14, 6, 13, 4, 11, 3, 8, 3, 6, 4, 3, 6, 1, 8, 0, 11, 0, 13, 1, 15, 3],
      104: [19, 4, 21, 4, 0, void 0, 4, 10, 7, 13, 9, 14, 12, 14, 14, 13, 15, 10, 15, 0],
      105: [8, 3, 21, 4, 20, 5, 21, 4, 22, 3, 21, void 0, 4, 14, 4, 0],
      106: [10, 5, 21, 6, 20, 7, 21, 6, 22, 5, 21, void 0, 6, 14, 6, -3, 5, -6, 3, -7, 1, -7],
      107: [17, 4, 21, 4, 0, void 0, 14, 14, 4, 4, void 0, 8, 8, 15, 0],
      108: [8, 4, 21, 4, 0],
      109: [30, 4, 14, 4, 0, void 0, 4, 10, 7, 13, 9, 14, 12, 14, 14, 13, 15, 10, 15, 0, void 0, 15, 10, 18, 13, 20, 14, 23, 14, 25, 13, 26, 10, 26, 0],
      110: [19, 4, 14, 4, 0, void 0, 4, 10, 7, 13, 9, 14, 12, 14, 14, 13, 15, 10, 15, 0],
      111: [19, 8, 14, 6, 13, 4, 11, 3, 8, 3, 6, 4, 3, 6, 1, 8, 0, 11, 0, 13, 1, 15, 3, 16, 6, 16, 8, 15, 11, 13, 13, 11, 14, 8, 14],
      112: [19, 4, 14, 4, -7, void 0, 4, 11, 6, 13, 8, 14, 11, 14, 13, 13, 15, 11, 16, 8, 16, 6, 15, 3, 13, 1, 11, 0, 8, 0, 6, 1, 4, 3],
      113: [19, 15, 14, 15, -7, void 0, 15, 11, 13, 13, 11, 14, 8, 14, 6, 13, 4, 11, 3, 8, 3, 6, 4, 3, 6, 1, 8, 0, 11, 0, 13, 1, 15, 3],
      114: [13, 4, 14, 4, 0, void 0, 4, 8, 5, 11, 7, 13, 9, 14, 12, 14],
      115: [17, 14, 11, 13, 13, 10, 14, 7, 14, 4, 13, 3, 11, 4, 9, 6, 8, 11, 7, 13, 6, 14, 4, 14, 3, 13, 1, 10, 0, 7, 0, 4, 1, 3, 3],
      116: [12, 5, 21, 5, 4, 6, 1, 8, 0, 10, 0, void 0, 2, 14, 9, 14],
      117: [19, 4, 14, 4, 4, 5, 1, 7, 0, 10, 0, 12, 1, 15, 4, void 0, 15, 14, 15, 0],
      118: [16, 2, 14, 8, 0, void 0, 14, 14, 8, 0],
      119: [22, 3, 14, 7, 0, void 0, 11, 14, 7, 0, void 0, 11, 14, 15, 0, void 0, 19, 14, 15, 0],
      120: [17, 3, 14, 14, 0, void 0, 14, 14, 3, 0],
      121: [16, 2, 14, 8, 0, void 0, 14, 14, 8, 0, 6, -4, 4, -6, 2, -7, 1, -7],
      122: [17, 14, 14, 3, 0, void 0, 3, 14, 14, 14, void 0, 3, 0, 14, 0],
      123: [14, 9, 25, 7, 24, 6, 23, 5, 21, 5, 19, 6, 17, 7, 16, 8, 14, 8, 12, 6, 10, void 0, 7, 24, 6, 22, 6, 20, 7, 18, 8, 17, 9, 15, 9, 13, 8, 11, 4, 9, 8, 7, 9, 5, 9, 3, 8, 1, 7, 0, 6, -2, 6, -4, 7, -6, void 0, 6, 8, 8, 6, 8, 4, 7, 2, 6, 1, 5, -1, 5, -3, 6, -5, 7, -6, 9, -7],
      124: [8, 4, 25, 4, -7],
      125: [14, 5, 25, 7, 24, 8, 23, 9, 21, 9, 19, 8, 17, 7, 16, 6, 14, 6, 12, 8, 10, void 0, 7, 24, 8, 22, 8, 20, 7, 18, 6, 17, 5, 15, 5, 13, 6, 11, 10, 9, 6, 7, 5, 5, 5, 3, 6, 1, 7, 0, 8, -2, 8, -4, 7, -6, void 0, 8, 8, 6, 6, 6, 4, 7, 2, 8, 1, 9, -1, 9, -3, 8, -5, 7, -6, 5, -7],
      126: [24, 3, 6, 3, 8, 4, 11, 6, 12, 8, 12, 10, 11, 14, 8, 16, 7, 18, 7, 20, 8, 21, 10, void 0, 3, 8, 4, 10, 6, 11, 8, 11, 10, 10, 14, 7, 16, 6, 18, 6, 20, 7, 21, 10, 21, 12]
    };
  }
});

// node_modules/@jscad/modeling/src/text/vectorParams.js
var require_vectorParams = __commonJS({
  "node_modules/@jscad/modeling/src/text/vectorParams.js"(exports, module) {
    "use strict";
    var defaultFont = require_simplex();
    var defaultsVectorParams = {
      xOffset: 0,
      yOffset: 0,
      input: "?",
      align: "left",
      font: defaultFont,
      height: 14,
      // == old vector_xxx simplex font height
      lineSpacing: 2.142857142857143,
      // == 30/14 == old vector_xxx ratio
      letterSpacing: 1,
      extrudeOffset: 0
    };
    var vectorParams = (options, input) => {
      if (!input && typeof options === "string") {
        options = { input: options };
      }
      options = options || {};
      const params = Object.assign({}, defaultsVectorParams, options);
      params.input = input || params.input;
      return params;
    };
    module.exports = vectorParams;
  }
});

// node_modules/@jscad/modeling/src/text/vectorChar.js
var require_vectorChar = __commonJS({
  "node_modules/@jscad/modeling/src/text/vectorChar.js"(exports, module) {
    "use strict";
    var vectorParams = require_vectorParams();
    var vectorChar = (options, char) => {
      const {
        xOffset,
        yOffset,
        input,
        font,
        height,
        extrudeOffset
      } = vectorParams(options, char);
      let code = input.charCodeAt(0);
      if (!code || !font[code]) {
        code = 63;
      }
      const glyph = [].concat(font[code]);
      const ratio = (height - extrudeOffset) / font.height;
      const extrudeYOffset = extrudeOffset / 2;
      const width = glyph.shift() * ratio;
      const segments = [];
      let polyline = [];
      for (let i = 0, il = glyph.length; i < il; i += 2) {
        const gx = ratio * glyph[i] + xOffset;
        const gy = ratio * glyph[i + 1] + yOffset + extrudeYOffset;
        if (glyph[i] !== void 0) {
          polyline.push([gx, gy]);
          continue;
        }
        segments.push(polyline);
        polyline = [];
        i--;
      }
      if (polyline.length) {
        segments.push(polyline);
      }
      return { width, height, segments };
    };
    module.exports = vectorChar;
  }
});

// node_modules/@jscad/modeling/src/text/vectorText.js
var require_vectorText = __commonJS({
  "node_modules/@jscad/modeling/src/text/vectorText.js"(exports, module) {
    "use strict";
    var vectorChar = require_vectorChar();
    var vectorParams = require_vectorParams();
    var translateLine = (options, line) => {
      const { x, y } = Object.assign({ x: 0, y: 0 }, options || {});
      const segments = line.segments;
      let segment = null;
      let point = null;
      for (let i = 0, il = segments.length; i < il; i++) {
        segment = segments[i];
        for (let j = 0, jl = segment.length; j < jl; j++) {
          point = segment[j];
          segment[j] = [point[0] + x, point[1] + y];
        }
      }
      return line;
    };
    var vectorText = (options, text) => {
      const {
        xOffset,
        yOffset,
        input,
        font,
        height,
        align,
        extrudeOffset,
        lineSpacing,
        letterSpacing
      } = vectorParams(options, text);
      let [x, y] = [xOffset, yOffset];
      let i, il, char, vect, width, diff;
      let line = { width: 0, segments: [] };
      const lines = [];
      let output = [];
      let maxWidth = 0;
      const lineStart = x;
      const pushLine = () => {
        lines.push(line);
        maxWidth = Math.max(maxWidth, line.width);
        line = { width: 0, segments: [] };
      };
      for (i = 0, il = input.length; i < il; i++) {
        char = input[i];
        vect = vectorChar({ xOffset: x, yOffset: y, font, height, extrudeOffset }, char);
        if (char === "\n") {
          x = lineStart;
          y -= vect.height * lineSpacing;
          pushLine();
          continue;
        }
        width = vect.width * letterSpacing;
        line.width += width;
        x += width;
        if (char !== " ") {
          line.segments = line.segments.concat(vect.segments);
        }
      }
      if (line.segments.length) {
        pushLine();
      }
      for (i = 0, il = lines.length; i < il; i++) {
        line = lines[i];
        if (maxWidth > line.width) {
          diff = maxWidth - line.width;
          if (align === "right") {
            line = translateLine({ x: diff }, line);
          } else if (align === "center") {
            line = translateLine({ x: diff / 2 }, line);
          }
        }
        output = output.concat(line.segments);
      }
      return output;
    };
    module.exports = vectorText;
  }
});

// node_modules/@jscad/modeling/src/text/index.js
var require_text = __commonJS({
  "node_modules/@jscad/modeling/src/text/index.js"(exports, module) {
    "use strict";
    module.exports = {
      vectorChar: require_vectorChar(),
      vectorText: require_vectorText()
    };
  }
});

// node_modules/@jscad/modeling/src/utils/areAllShapesTheSameType.js
var require_areAllShapesTheSameType = __commonJS({
  "node_modules/@jscad/modeling/src/utils/areAllShapesTheSameType.js"(exports, module) {
    "use strict";
    var geom2 = require_geom2();
    var geom34 = require_geom3();
    var path2 = require_path2();
    var areAllShapesTheSameType = (shapes) => {
      let previousType;
      for (const shape of shapes) {
        let currentType = 0;
        if (geom2.isA(shape)) currentType = 1;
        if (geom34.isA(shape)) currentType = 2;
        if (path2.isA(shape)) currentType = 3;
        if (previousType && currentType !== previousType) return false;
        previousType = currentType;
      }
      return true;
    };
    module.exports = areAllShapesTheSameType;
  }
});

// node_modules/@jscad/modeling/src/utils/degToRad.js
var require_degToRad = __commonJS({
  "node_modules/@jscad/modeling/src/utils/degToRad.js"(exports, module) {
    "use strict";
    var degToRad = (degrees) => degrees * 0.017453292519943295;
    module.exports = degToRad;
  }
});

// node_modules/@jscad/modeling/src/utils/fnNumberSort.js
var require_fnNumberSort = __commonJS({
  "node_modules/@jscad/modeling/src/utils/fnNumberSort.js"(exports, module) {
    "use strict";
    var fnNumberSort = (a, b) => a - b;
    module.exports = fnNumberSort;
  }
});

// node_modules/@jscad/modeling/src/utils/insertSorted.js
var require_insertSorted = __commonJS({
  "node_modules/@jscad/modeling/src/utils/insertSorted.js"(exports, module) {
    "use strict";
    var insertSorted = (array, element, comparefunc) => {
      let leftbound = 0;
      let rightbound = array.length;
      while (rightbound > leftbound) {
        const testindex = Math.floor((leftbound + rightbound) / 2);
        const testelement = array[testindex];
        const compareresult = comparefunc(element, testelement);
        if (compareresult > 0) {
          leftbound = testindex + 1;
        } else {
          rightbound = testindex;
        }
      }
      array.splice(leftbound, 0, element);
    };
    module.exports = insertSorted;
  }
});

// node_modules/@jscad/modeling/src/utils/radiusToSegments.js
var require_radiusToSegments = __commonJS({
  "node_modules/@jscad/modeling/src/utils/radiusToSegments.js"(exports, module) {
    "use strict";
    var { TAU } = require_constants();
    var radiusToSegments = (radius, minimumLength, minimumAngle) => {
      const ss = minimumLength > 0 ? radius * TAU / minimumLength : 0;
      const as = minimumAngle > 0 ? TAU / minimumAngle : 0;
      return Math.ceil(Math.max(ss, as, 4));
    };
    module.exports = radiusToSegments;
  }
});

// node_modules/@jscad/modeling/src/utils/radToDeg.js
var require_radToDeg = __commonJS({
  "node_modules/@jscad/modeling/src/utils/radToDeg.js"(exports, module) {
    "use strict";
    var radToDeg = (radians) => radians * 57.29577951308232;
    module.exports = radToDeg;
  }
});

// node_modules/@jscad/modeling/src/utils/index.js
var require_utils2 = __commonJS({
  "node_modules/@jscad/modeling/src/utils/index.js"(exports, module) {
    "use strict";
    module.exports = {
      areAllShapesTheSameType: require_areAllShapesTheSameType(),
      degToRad: require_degToRad(),
      flatten: require_flatten(),
      fnNumberSort: require_fnNumberSort(),
      insertSorted: require_insertSorted(),
      radiusToSegments: require_radiusToSegments(),
      radToDeg: require_radToDeg()
    };
  }
});

// node_modules/@jscad/modeling/src/operations/booleans/fromFakePolygons.js
var require_fromFakePolygons = __commonJS({
  "node_modules/@jscad/modeling/src/operations/booleans/fromFakePolygons.js"(exports, module) {
    "use strict";
    var vec2 = require_vec2();
    var geom2 = require_geom2();
    var fromFakePolygon = (epsilon, polygon3) => {
      if (polygon3.vertices.length < 4) {
        return null;
      }
      const vert1Indices = [];
      const points3D = polygon3.vertices.filter((vertex, i) => {
        if (vertex[2] > 0) {
          vert1Indices.push(i);
          return true;
        }
        return false;
      });
      if (points3D.length !== 2) {
        throw new Error("Assertion failed: fromFakePolygon: not enough points found");
      }
      const points2D = points3D.map((v3) => {
        const x = Math.round(v3[0] / epsilon) * epsilon + 0;
        const y = Math.round(v3[1] / epsilon) * epsilon + 0;
        return vec2.fromValues(x, y);
      });
      if (vec2.equals(points2D[0], points2D[1])) return null;
      const d = vert1Indices[1] - vert1Indices[0];
      if (d === 1 || d === 3) {
        if (d === 1) {
          points2D.reverse();
        }
      } else {
        throw new Error("Assertion failed: fromFakePolygon: unknown index ordering");
      }
      return points2D;
    };
    var fromFakePolygons = (epsilon, polygons) => {
      const sides = polygons.map((polygon3) => fromFakePolygon(epsilon, polygon3)).filter((polygon3) => polygon3 !== null);
      return geom2.create(sides);
    };
    module.exports = fromFakePolygons;
  }
});

// node_modules/@jscad/modeling/src/operations/booleans/to3DWalls.js
var require_to3DWalls = __commonJS({
  "node_modules/@jscad/modeling/src/operations/booleans/to3DWalls.js"(exports, module) {
    "use strict";
    var vec3 = require_vec3();
    var geom2 = require_geom2();
    var geom34 = require_geom3();
    var poly3 = require_poly3();
    var to3DWall = (z0, z1, side) => {
      const points = [
        vec3.fromVec2(vec3.create(), side[0], z0),
        vec3.fromVec2(vec3.create(), side[1], z0),
        vec3.fromVec2(vec3.create(), side[1], z1),
        vec3.fromVec2(vec3.create(), side[0], z1)
      ];
      return poly3.create(points);
    };
    var to3DWalls = (options, geometry) => {
      const sides = geom2.toSides(geometry);
      const polygons = sides.map((side) => to3DWall(options.z0, options.z1, side));
      const result = geom34.create(polygons);
      return result;
    };
    module.exports = to3DWalls;
  }
});

// node_modules/@jscad/modeling/src/maths/OrthoNormalBasis.js
var require_OrthoNormalBasis = __commonJS({
  "node_modules/@jscad/modeling/src/maths/OrthoNormalBasis.js"(exports, module) {
    "use strict";
    var mat4 = require_mat4();
    var vec2 = require_vec2();
    var vec3 = require_vec3();
    var OrthoNormalBasis = function(plane, rightvector) {
      if (arguments.length < 2) {
        rightvector = vec3.orthogonal(vec3.create(), plane);
      }
      this.v = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), plane, rightvector));
      this.u = vec3.cross(vec3.create(), this.v, plane);
      this.plane = plane;
      this.planeorigin = vec3.scale(vec3.create(), plane, plane[3]);
    };
    OrthoNormalBasis.prototype = {
      getProjectionMatrix: function() {
        return mat4.fromValues(
          this.u[0],
          this.v[0],
          this.plane[0],
          0,
          this.u[1],
          this.v[1],
          this.plane[1],
          0,
          this.u[2],
          this.v[2],
          this.plane[2],
          0,
          0,
          0,
          -this.plane[3],
          1
        );
      },
      getInverseProjectionMatrix: function() {
        const p = vec3.scale(vec3.create(), this.plane, this.plane[3]);
        return mat4.fromValues(
          this.u[0],
          this.u[1],
          this.u[2],
          0,
          this.v[0],
          this.v[1],
          this.v[2],
          0,
          this.plane[0],
          this.plane[1],
          this.plane[2],
          0,
          p[0],
          p[1],
          p[2],
          1
        );
      },
      to2D: function(point) {
        return vec2.fromValues(vec3.dot(point, this.u), vec3.dot(point, this.v));
      },
      to3D: function(point) {
        const v1 = vec3.scale(vec3.create(), this.u, point[0]);
        const v2 = vec3.scale(vec3.create(), this.v, point[1]);
        const v3 = vec3.add(v1, v1, this.planeorigin);
        const v4 = vec3.add(v2, v2, v3);
        return v4;
      }
    };
    module.exports = OrthoNormalBasis;
  }
});

// node_modules/@jscad/modeling/src/operations/modifiers/reTesselateCoplanarPolygons.js
var require_reTesselateCoplanarPolygons = __commonJS({
  "node_modules/@jscad/modeling/src/operations/modifiers/reTesselateCoplanarPolygons.js"(exports, module) {
    "use strict";
    var { EPS } = require_constants();
    var line2 = require_line2();
    var vec2 = require_vec2();
    var OrthoNormalBasis = require_OrthoNormalBasis();
    var interpolateBetween2DPointsForY = require_interpolateBetween2DPointsForY();
    var { insertSorted, fnNumberSort } = require_utils2();
    var poly3 = require_poly3();
    var reTesselateCoplanarPolygons = (sourcepolygons) => {
      if (sourcepolygons.length < 2) return sourcepolygons;
      const destpolygons = [];
      const numpolygons = sourcepolygons.length;
      const plane = poly3.plane(sourcepolygons[0]);
      const orthobasis = new OrthoNormalBasis(plane);
      const polygonvertices2d = [];
      const polygontopvertexindexes = [];
      const topy2polygonindexes = /* @__PURE__ */ new Map();
      const ycoordinatetopolygonindexes = /* @__PURE__ */ new Map();
      const ycoordinatebins = /* @__PURE__ */ new Map();
      const ycoordinateBinningFactor = 10 / EPS;
      for (let polygonindex = 0; polygonindex < numpolygons; polygonindex++) {
        const poly3d = sourcepolygons[polygonindex];
        let vertices2d = [];
        let numvertices = poly3d.vertices.length;
        let minindex = -1;
        if (numvertices > 0) {
          let miny;
          let maxy;
          for (let i = 0; i < numvertices; i++) {
            let pos2d = orthobasis.to2D(poly3d.vertices[i]);
            const ycoordinatebin = Math.floor(pos2d[1] * ycoordinateBinningFactor);
            let newy;
            if (ycoordinatebins.has(ycoordinatebin)) {
              newy = ycoordinatebins.get(ycoordinatebin);
            } else if (ycoordinatebins.has(ycoordinatebin + 1)) {
              newy = ycoordinatebins.get(ycoordinatebin + 1);
            } else if (ycoordinatebins.has(ycoordinatebin - 1)) {
              newy = ycoordinatebins.get(ycoordinatebin - 1);
            } else {
              newy = pos2d[1];
              ycoordinatebins.set(ycoordinatebin, pos2d[1]);
            }
            pos2d = vec2.fromValues(pos2d[0], newy);
            vertices2d.push(pos2d);
            const y = pos2d[1];
            if (i === 0 || y < miny) {
              miny = y;
              minindex = i;
            }
            if (i === 0 || y > maxy) {
              maxy = y;
            }
            let polygonindexes = ycoordinatetopolygonindexes.get(y);
            if (!polygonindexes) {
              polygonindexes = {};
              ycoordinatetopolygonindexes.set(y, polygonindexes);
            }
            polygonindexes[polygonindex] = true;
          }
          if (miny >= maxy) {
            vertices2d = [];
            numvertices = 0;
            minindex = -1;
          } else {
            let polygonindexes = topy2polygonindexes.get(miny);
            if (!polygonindexes) {
              polygonindexes = [];
              topy2polygonindexes.set(miny, polygonindexes);
            }
            polygonindexes.push(polygonindex);
          }
        }
        vertices2d.reverse();
        minindex = numvertices - minindex - 1;
        polygonvertices2d.push(vertices2d);
        polygontopvertexindexes.push(minindex);
      }
      const ycoordinates = [];
      ycoordinatetopolygonindexes.forEach((polylist, y) => ycoordinates.push(y));
      ycoordinates.sort(fnNumberSort);
      let activepolygons = [];
      let prevoutpolygonrow = [];
      for (let yindex = 0; yindex < ycoordinates.length; yindex++) {
        const newoutpolygonrow = [];
        const ycoordinate = ycoordinates[yindex];
        const polygonindexeswithcorner = ycoordinatetopolygonindexes.get(ycoordinate);
        let removeCount = 0;
        for (let activepolygonindex = 0; activepolygonindex < activepolygons.length; ++activepolygonindex) {
          const activepolygon = activepolygons[activepolygonindex];
          const polygonindex = activepolygon.polygonindex;
          if (polygonindexeswithcorner[polygonindex]) {
            const vertices2d = polygonvertices2d[polygonindex];
            const numvertices = vertices2d.length;
            let newleftvertexindex = activepolygon.leftvertexindex;
            let newrightvertexindex = activepolygon.rightvertexindex;
            while (true) {
              let nextleftvertexindex = newleftvertexindex + 1;
              if (nextleftvertexindex >= numvertices) nextleftvertexindex = 0;
              if (vertices2d[nextleftvertexindex][1] !== ycoordinate) break;
              newleftvertexindex = nextleftvertexindex;
            }
            let nextrightvertexindex = newrightvertexindex - 1;
            if (nextrightvertexindex < 0) nextrightvertexindex = numvertices - 1;
            if (vertices2d[nextrightvertexindex][1] === ycoordinate) {
              newrightvertexindex = nextrightvertexindex;
            }
            if (newleftvertexindex !== activepolygon.leftvertexindex && newleftvertexindex === newrightvertexindex) {
              activepolygon._remove = true;
              removeCount++;
            } else {
              activepolygon.leftvertexindex = newleftvertexindex;
              activepolygon.rightvertexindex = newrightvertexindex;
              activepolygon.topleft = vertices2d[newleftvertexindex];
              activepolygon.topright = vertices2d[newrightvertexindex];
              let nextleftvertexindex = newleftvertexindex + 1;
              if (nextleftvertexindex >= numvertices) nextleftvertexindex = 0;
              activepolygon.bottomleft = vertices2d[nextleftvertexindex];
              let nextrightvertexindex2 = newrightvertexindex - 1;
              if (nextrightvertexindex2 < 0) nextrightvertexindex2 = numvertices - 1;
              activepolygon.bottomright = vertices2d[nextrightvertexindex2];
            }
          }
        }
        if (removeCount > 0) {
          activepolygons = activepolygons.filter((p) => !p._remove);
        }
        let nextycoordinate;
        if (yindex >= ycoordinates.length - 1) {
          activepolygons = [];
          nextycoordinate = null;
        } else {
          nextycoordinate = Number(ycoordinates[yindex + 1]);
          const middleycoordinate = 0.5 * (ycoordinate + nextycoordinate);
          const startingpolygonindexes = topy2polygonindexes.get(ycoordinate);
          for (const polygonindexKey in startingpolygonindexes) {
            const polygonindex = startingpolygonindexes[polygonindexKey];
            const vertices2d = polygonvertices2d[polygonindex];
            const numvertices = vertices2d.length;
            const topvertexindex = polygontopvertexindexes[polygonindex];
            let topleftvertexindex = topvertexindex;
            while (true) {
              let i = topleftvertexindex + 1;
              if (i >= numvertices) i = 0;
              if (vertices2d[i][1] !== ycoordinate) break;
              if (i === topvertexindex) break;
              topleftvertexindex = i;
            }
            let toprightvertexindex = topvertexindex;
            while (true) {
              let i = toprightvertexindex - 1;
              if (i < 0) i = numvertices - 1;
              if (vertices2d[i][1] !== ycoordinate) break;
              if (i === topleftvertexindex) break;
              toprightvertexindex = i;
            }
            let nextleftvertexindex = topleftvertexindex + 1;
            if (nextleftvertexindex >= numvertices) nextleftvertexindex = 0;
            let nextrightvertexindex = toprightvertexindex - 1;
            if (nextrightvertexindex < 0) nextrightvertexindex = numvertices - 1;
            const newactivepolygon = {
              polygonindex,
              leftvertexindex: topleftvertexindex,
              rightvertexindex: toprightvertexindex,
              topleft: vertices2d[topleftvertexindex],
              topright: vertices2d[toprightvertexindex],
              bottomleft: vertices2d[nextleftvertexindex],
              bottomright: vertices2d[nextrightvertexindex]
            };
            insertSorted(activepolygons, newactivepolygon, (el1, el2) => {
              const x1 = interpolateBetween2DPointsForY(el1.topleft, el1.bottomleft, middleycoordinate);
              const x2 = interpolateBetween2DPointsForY(el2.topleft, el2.bottomleft, middleycoordinate);
              if (x1 > x2) return 1;
              if (x1 < x2) return -1;
              return 0;
            });
          }
        }
        for (const activepolygonKey in activepolygons) {
          const activepolygon = activepolygons[activepolygonKey];
          let x = interpolateBetween2DPointsForY(activepolygon.topleft, activepolygon.bottomleft, ycoordinate);
          const topleft = vec2.fromValues(x, ycoordinate);
          x = interpolateBetween2DPointsForY(activepolygon.topright, activepolygon.bottomright, ycoordinate);
          const topright = vec2.fromValues(x, ycoordinate);
          x = interpolateBetween2DPointsForY(activepolygon.topleft, activepolygon.bottomleft, nextycoordinate);
          const bottomleft = vec2.fromValues(x, nextycoordinate);
          x = interpolateBetween2DPointsForY(activepolygon.topright, activepolygon.bottomright, nextycoordinate);
          const bottomright = vec2.fromValues(x, nextycoordinate);
          const outpolygon = {
            topleft,
            topright,
            bottomleft,
            bottomright,
            leftline: line2.fromPoints(line2.create(), topleft, bottomleft),
            rightline: line2.fromPoints(line2.create(), bottomright, topright)
          };
          if (newoutpolygonrow.length > 0) {
            const prevoutpolygon = newoutpolygonrow[newoutpolygonrow.length - 1];
            const d1 = vec2.distance(outpolygon.topleft, prevoutpolygon.topright);
            const d2 = vec2.distance(outpolygon.bottomleft, prevoutpolygon.bottomright);
            if (d1 < EPS && d2 < EPS) {
              outpolygon.topleft = prevoutpolygon.topleft;
              outpolygon.leftline = prevoutpolygon.leftline;
              outpolygon.bottomleft = prevoutpolygon.bottomleft;
              newoutpolygonrow.splice(newoutpolygonrow.length - 1, 1);
            }
          }
          newoutpolygonrow.push(outpolygon);
        }
        if (yindex > 0) {
          const prevcontinuedindexes = /* @__PURE__ */ new Set();
          const matchedindexes = /* @__PURE__ */ new Set();
          for (let i = 0; i < newoutpolygonrow.length; i++) {
            const thispolygon = newoutpolygonrow[i];
            for (let ii = 0; ii < prevoutpolygonrow.length; ii++) {
              if (!matchedindexes.has(ii)) {
                const prevpolygon = prevoutpolygonrow[ii];
                if (vec2.distance(prevpolygon.bottomleft, thispolygon.topleft) < EPS) {
                  if (vec2.distance(prevpolygon.bottomright, thispolygon.topright) < EPS) {
                    matchedindexes.add(ii);
                    const v1 = line2.direction(thispolygon.leftline);
                    const v2 = line2.direction(prevpolygon.leftline);
                    const d1 = v1[0] - v2[0];
                    const v3 = line2.direction(thispolygon.rightline);
                    const v4 = line2.direction(prevpolygon.rightline);
                    const d2 = v3[0] - v4[0];
                    const leftlinecontinues = Math.abs(d1) < EPS;
                    const rightlinecontinues = Math.abs(d2) < EPS;
                    const leftlineisconvex = leftlinecontinues || d1 >= 0;
                    const rightlineisconvex = rightlinecontinues || d2 >= 0;
                    if (leftlineisconvex && rightlineisconvex) {
                      thispolygon.outpolygon = prevpolygon.outpolygon;
                      thispolygon.leftlinecontinues = leftlinecontinues;
                      thispolygon.rightlinecontinues = rightlinecontinues;
                      prevcontinuedindexes.add(ii);
                    }
                    break;
                  }
                }
              }
            }
          }
          for (let ii = 0; ii < prevoutpolygonrow.length; ii++) {
            if (!prevcontinuedindexes.has(ii)) {
              const prevpolygon = prevoutpolygonrow[ii];
              prevpolygon.outpolygon.rightpoints.push(prevpolygon.bottomright);
              if (vec2.distance(prevpolygon.bottomright, prevpolygon.bottomleft) > EPS) {
                prevpolygon.outpolygon.leftpoints.push(prevpolygon.bottomleft);
              }
              prevpolygon.outpolygon.leftpoints.reverse();
              const points2d = prevpolygon.outpolygon.rightpoints.concat(prevpolygon.outpolygon.leftpoints);
              const vertices3d = points2d.map((point2d) => orthobasis.to3D(point2d));
              const polygon3 = poly3.fromPointsAndPlane(vertices3d, plane);
              if (polygon3.vertices.length) destpolygons.push(polygon3);
            }
          }
        }
        for (let i = 0; i < newoutpolygonrow.length; i++) {
          const thispolygon = newoutpolygonrow[i];
          if (!thispolygon.outpolygon) {
            thispolygon.outpolygon = {
              leftpoints: [],
              rightpoints: []
            };
            thispolygon.outpolygon.leftpoints.push(thispolygon.topleft);
            if (vec2.distance(thispolygon.topleft, thispolygon.topright) > EPS) {
              thispolygon.outpolygon.rightpoints.push(thispolygon.topright);
            }
          } else {
            if (!thispolygon.leftlinecontinues) {
              thispolygon.outpolygon.leftpoints.push(thispolygon.topleft);
            }
            if (!thispolygon.rightlinecontinues) {
              thispolygon.outpolygon.rightpoints.push(thispolygon.topright);
            }
          }
        }
        prevoutpolygonrow = newoutpolygonrow;
      }
      return destpolygons;
    };
    module.exports = reTesselateCoplanarPolygons;
  }
});

// node_modules/@jscad/modeling/src/operations/modifiers/retessellate.js
var require_retessellate = __commonJS({
  "node_modules/@jscad/modeling/src/operations/modifiers/retessellate.js"(exports, module) {
    "use strict";
    var geom34 = require_geom3();
    var poly3 = require_poly3();
    var { NEPS } = require_constants();
    var reTesselateCoplanarPolygons = require_reTesselateCoplanarPolygons();
    var retessellate = (geometry) => {
      if (geometry.isRetesselated) {
        return geometry;
      }
      const polygons = geom34.toPolygons(geometry).map((polygon3, index) => ({ vertices: polygon3.vertices, plane: poly3.plane(polygon3), index }));
      const classified = classifyPolygons(polygons);
      const destPolygons = [];
      classified.forEach((group) => {
        if (Array.isArray(group)) {
          const coplanarPolygons = reTesselateCoplanarPolygons(group);
          for (let i = 0; i < coplanarPolygons.length; i++) {
            destPolygons.push(coplanarPolygons[i]);
          }
        } else {
          destPolygons.push(group);
        }
      });
      const result = geom34.create(destPolygons);
      result.isRetesselated = true;
      return result;
    };
    var classifyPolygons = (polygons) => {
      let clusters = [polygons];
      const nonCoplanar = [];
      for (let component = 3; component >= 0; component--) {
        const maybeCoplanar = [];
        const tolerance = component === 3 ? 15e-9 : NEPS;
        clusters.forEach((cluster) => {
          cluster.sort(byPlaneComponent(component, tolerance));
          let startIndex = 0;
          for (let i = 1; i < cluster.length; i++) {
            if (cluster[i].plane[component] - cluster[startIndex].plane[component] > tolerance) {
              if (i - startIndex === 1) {
                nonCoplanar.push(cluster[startIndex]);
              } else {
                maybeCoplanar.push(cluster.slice(startIndex, i));
              }
              startIndex = i;
            }
          }
          if (cluster.length - startIndex === 1) {
            nonCoplanar.push(cluster[startIndex]);
          } else {
            maybeCoplanar.push(cluster.slice(startIndex));
          }
        });
        clusters = maybeCoplanar;
      }
      const result = [];
      clusters.forEach((cluster) => {
        if (cluster[0]) result[cluster[0].index] = cluster;
      });
      nonCoplanar.forEach((polygon3) => {
        result[polygon3.index] = polygon3;
      });
      return result;
    };
    var byPlaneComponent = (component, tolerance) => (a, b) => {
      if (a.plane[component] - b.plane[component] > tolerance) {
        return 1;
      } else if (b.plane[component] - a.plane[component] > tolerance) {
        return -1;
      }
      return 0;
    };
    module.exports = retessellate;
  }
});

// node_modules/@jscad/modeling/src/operations/booleans/mayOverlap.js
var require_mayOverlap = __commonJS({
  "node_modules/@jscad/modeling/src/operations/booleans/mayOverlap.js"(exports, module) {
    "use strict";
    var { EPS } = require_constants();
    var measureBoundingBox3 = require_measureBoundingBox2();
    var mayOverlap = (geometry1, geometry2) => {
      if (geometry1.polygons.length === 0 || geometry2.polygons.length === 0) {
        return false;
      }
      const bounds1 = measureBoundingBox3(geometry1);
      const min1 = bounds1[0];
      const max1 = bounds1[1];
      const bounds2 = measureBoundingBox3(geometry2);
      const min2 = bounds2[0];
      const max2 = bounds2[1];
      if (min2[0] - max1[0] > EPS) return false;
      if (min1[0] - max2[0] > EPS) return false;
      if (min2[1] - max1[1] > EPS) return false;
      if (min1[1] - max2[1] > EPS) return false;
      if (min2[2] - max1[2] > EPS) return false;
      if (min1[2] - max2[2] > EPS) return false;
      return true;
    };
    module.exports = mayOverlap;
  }
});

// node_modules/@jscad/modeling/src/operations/booleans/trees/Node.js
var require_Node = __commonJS({
  "node_modules/@jscad/modeling/src/operations/booleans/trees/Node.js"(exports, module) {
    "use strict";
    var plane = require_plane();
    var poly3 = require_poly3();
    var Node = class _Node {
      constructor(parent) {
        this.plane = null;
        this.front = null;
        this.back = null;
        this.polygontreenodes = [];
        this.parent = parent;
      }
      // Convert solid space to empty space and empty space to solid space.
      invert() {
        const queue = [this];
        let node;
        for (let i = 0; i < queue.length; i++) {
          node = queue[i];
          if (node.plane) node.plane = plane.flip(plane.create(), node.plane);
          if (node.front) queue.push(node.front);
          if (node.back) queue.push(node.back);
          const temp = node.front;
          node.front = node.back;
          node.back = temp;
        }
      }
      // clip polygontreenodes to our plane
      // calls remove() for all clipped PolygonTreeNodes
      clipPolygons(polygontreenodes, alsoRemovecoplanarFront) {
        let current = { node: this, polygontreenodes };
        let node;
        const stack = [];
        do {
          node = current.node;
          polygontreenodes = current.polygontreenodes;
          if (node.plane) {
            const plane2 = node.plane;
            const backnodes = [];
            const frontnodes = [];
            const coplanarfrontnodes = alsoRemovecoplanarFront ? backnodes : frontnodes;
            const numpolygontreenodes = polygontreenodes.length;
            for (let i = 0; i < numpolygontreenodes; i++) {
              const treenode = polygontreenodes[i];
              if (!treenode.isRemoved()) {
                treenode.splitByPlane(plane2, coplanarfrontnodes, backnodes, frontnodes, backnodes);
              }
            }
            if (node.front && frontnodes.length > 0) {
              stack.push({ node: node.front, polygontreenodes: frontnodes });
            }
            const numbacknodes = backnodes.length;
            if (node.back && numbacknodes > 0) {
              stack.push({ node: node.back, polygontreenodes: backnodes });
            } else {
              for (let i = 0; i < numbacknodes; i++) {
                backnodes[i].remove();
              }
            }
          }
          current = stack.pop();
        } while (current !== void 0);
      }
      // Remove all polygons in this BSP tree that are inside the other BSP tree
      // `tree`.
      clipTo(tree, alsoRemovecoplanarFront) {
        let node = this;
        const stack = [];
        do {
          if (node.polygontreenodes.length > 0) {
            tree.rootnode.clipPolygons(node.polygontreenodes, alsoRemovecoplanarFront);
          }
          if (node.front) stack.push(node.front);
          if (node.back) stack.push(node.back);
          node = stack.pop();
        } while (node !== void 0);
      }
      addPolygonTreeNodes(newpolygontreenodes) {
        let current = { node: this, polygontreenodes: newpolygontreenodes };
        const stack = [];
        do {
          const node = current.node;
          const polygontreenodes = current.polygontreenodes;
          if (polygontreenodes.length === 0) {
            current = stack.pop();
            continue;
          }
          if (!node.plane) {
            let index = 0;
            index = Math.floor(polygontreenodes.length / 2);
            const bestpoly = polygontreenodes[index].getPolygon();
            node.plane = poly3.plane(bestpoly);
          }
          const frontnodes = [];
          const backnodes = [];
          const n = polygontreenodes.length;
          for (let i = 0; i < n; ++i) {
            polygontreenodes[i].splitByPlane(node.plane, node.polygontreenodes, backnodes, frontnodes, backnodes);
          }
          if (frontnodes.length > 0) {
            if (!node.front) node.front = new _Node(node);
            const stopCondition = n === frontnodes.length && backnodes.length === 0;
            if (stopCondition) node.front.polygontreenodes = frontnodes;
            else stack.push({ node: node.front, polygontreenodes: frontnodes });
          }
          if (backnodes.length > 0) {
            if (!node.back) node.back = new _Node(node);
            const stopCondition = n === backnodes.length && frontnodes.length === 0;
            if (stopCondition) node.back.polygontreenodes = backnodes;
            else stack.push({ node: node.back, polygontreenodes: backnodes });
          }
          current = stack.pop();
        } while (current !== void 0);
      }
    };
    module.exports = Node;
  }
});

// node_modules/@jscad/modeling/src/operations/booleans/trees/splitLineSegmentByPlane.js
var require_splitLineSegmentByPlane = __commonJS({
  "node_modules/@jscad/modeling/src/operations/booleans/trees/splitLineSegmentByPlane.js"(exports, module) {
    "use strict";
    var vec3 = require_vec3();
    var splitLineSegmentByPlane = (plane, p1, p2) => {
      const direction = vec3.subtract(vec3.create(), p2, p1);
      let lambda = (plane[3] - vec3.dot(plane, p1)) / vec3.dot(plane, direction);
      if (Number.isNaN(lambda)) lambda = 0;
      if (lambda > 1) lambda = 1;
      if (lambda < 0) lambda = 0;
      vec3.scale(direction, direction, lambda);
      vec3.add(direction, p1, direction);
      return direction;
    };
    module.exports = splitLineSegmentByPlane;
  }
});

// node_modules/@jscad/modeling/src/operations/booleans/trees/splitPolygonByPlane.js
var require_splitPolygonByPlane = __commonJS({
  "node_modules/@jscad/modeling/src/operations/booleans/trees/splitPolygonByPlane.js"(exports, module) {
    "use strict";
    var { EPS } = require_constants();
    var plane = require_plane();
    var vec3 = require_vec3();
    var poly3 = require_poly3();
    var splitLineSegmentByPlane = require_splitLineSegmentByPlane();
    var EPS_SQUARED = EPS * EPS;
    var removeConsecutiveDuplicates = (vertices) => {
      const result = [];
      let prevvertex = vertices[vertices.length - 1];
      for (let i = 0; i < vertices.length; i++) {
        const vertex = vertices[i];
        if (vec3.squaredDistance(vertex, prevvertex) >= EPS_SQUARED) {
          result.push(vertex);
        }
        prevvertex = vertex;
      }
      return result;
    };
    var splitPolygonByPlane = (splane, polygon3) => {
      const result = {
        type: null,
        front: null,
        back: null
      };
      const vertices = polygon3.vertices;
      const numvertices = vertices.length;
      const pplane = poly3.plane(polygon3);
      if (plane.equals(pplane, splane)) {
        result.type = 0;
      } else {
        let hasfront = false;
        let hasback = false;
        const vertexIsBack = [];
        const MINEPS = -EPS;
        for (let i = 0; i < numvertices; i++) {
          const t = vec3.dot(splane, vertices[i]) - splane[3];
          const isback = t < MINEPS;
          vertexIsBack.push(isback);
          if (t > EPS) hasfront = true;
          if (t < MINEPS) hasback = true;
        }
        if (!hasfront && !hasback) {
          const t = vec3.dot(splane, pplane);
          result.type = t >= 0 ? 0 : 1;
        } else if (!hasback) {
          result.type = 2;
        } else if (!hasfront) {
          result.type = 3;
        } else {
          result.type = 4;
          const frontvertices = [];
          const backvertices = [];
          let isback = vertexIsBack[0];
          for (let vertexindex = 0; vertexindex < numvertices; vertexindex++) {
            const vertex = vertices[vertexindex];
            let nextvertexindex = vertexindex + 1;
            if (nextvertexindex >= numvertices) nextvertexindex = 0;
            const nextisback = vertexIsBack[nextvertexindex];
            if (isback === nextisback) {
              if (isback) {
                backvertices.push(vertex);
              } else {
                frontvertices.push(vertex);
              }
            } else {
              const nextpoint = vertices[nextvertexindex];
              const intersectionpoint = splitLineSegmentByPlane(splane, vertex, nextpoint);
              if (isback) {
                backvertices.push(vertex);
                backvertices.push(intersectionpoint);
                frontvertices.push(intersectionpoint);
              } else {
                frontvertices.push(vertex);
                frontvertices.push(intersectionpoint);
                backvertices.push(intersectionpoint);
              }
            }
            isback = nextisback;
          }
          if (frontvertices.length >= 3) {
            const frontFiltered = removeConsecutiveDuplicates(frontvertices);
            if (frontFiltered.length >= 3) {
              result.front = poly3.fromPointsAndPlane(frontFiltered, pplane);
            }
          }
          if (backvertices.length >= 3) {
            const backFiltered = removeConsecutiveDuplicates(backvertices);
            if (backFiltered.length >= 3) {
              result.back = poly3.fromPointsAndPlane(backFiltered, pplane);
            }
          }
        }
      }
      return result;
    };
    module.exports = splitPolygonByPlane;
  }
});

// node_modules/@jscad/modeling/src/operations/booleans/trees/PolygonTreeNode.js
var require_PolygonTreeNode = __commonJS({
  "node_modules/@jscad/modeling/src/operations/booleans/trees/PolygonTreeNode.js"(exports, module) {
    "use strict";
    var { EPS } = require_constants();
    var vec3 = require_vec3();
    var poly3 = require_poly3();
    var splitPolygonByPlane = require_splitPolygonByPlane();
    var PolygonTreeNode = class _PolygonTreeNode {
      // constructor creates the root node
      constructor(parent, polygon3) {
        this.parent = parent;
        this.children = [];
        this.polygon = polygon3;
        this.removed = false;
      }
      // fill the tree with polygons. Should be called on the root node only; child nodes must
      // always be a derivate (split) of the parent node.
      addPolygons(polygons) {
        if (!this.isRootNode()) {
          throw new Error("Assertion failed");
        }
        const _this = this;
        polygons.forEach((polygon3) => {
          _this.addChild(polygon3);
        });
      }
      // remove a node
      // - the siblings become toplevel nodes
      // - the parent is removed recursively
      remove() {
        if (!this.removed) {
          this.removed = true;
          this.polygon = null;
          this.parent.recursivelyInvalidatePolygon();
        }
      }
      isRemoved() {
        return this.removed;
      }
      isRootNode() {
        return !this.parent;
      }
      // invert all polygons in the tree. Call on the root node
      invert() {
        if (!this.isRootNode()) throw new Error("Assertion failed");
        this.invertSub();
      }
      getPolygon() {
        if (!this.polygon) throw new Error("Assertion failed");
        return this.polygon;
      }
      getPolygons(result) {
        if (this.isRootNode() && this.children.length > 0) {
          const compacted = [];
          for (let i2 = 0; i2 < this.children.length; i2++) {
            if (!this.children[i2].removed) compacted.push(this.children[i2]);
          }
          this.children = compacted;
        }
        let children = [this];
        const queue = [children];
        let i, j, l, node;
        for (i = 0; i < queue.length; ++i) {
          children = queue[i];
          for (j = 0, l = children.length; j < l; j++) {
            node = children[j];
            if (node.polygon) {
              result.push(node.polygon);
            } else {
              if (node.children.length > 0) queue.push(node.children);
            }
          }
        }
      }
      // split the node by a plane; add the resulting nodes to the frontnodes and backnodes array
      // If the plane doesn't intersect the polygon, the 'this' object is added to one of the arrays
      // If the plane does intersect the polygon, two new child nodes are created for the front and back fragments,
      //  and added to both arrays.
      splitByPlane(plane, coplanarfrontnodes, coplanarbacknodes, frontnodes, backnodes) {
        if (this.children.length) {
          const queue = [this.children];
          let i;
          let j;
          let l;
          let node;
          let nodes;
          for (i = 0; i < queue.length; i++) {
            nodes = queue[i];
            for (j = 0, l = nodes.length; j < l; j++) {
              node = nodes[j];
              if (node.children.length > 0) {
                queue.push(node.children);
              } else {
                node._splitByPlane(plane, coplanarfrontnodes, coplanarbacknodes, frontnodes, backnodes);
              }
            }
          }
        } else {
          this._splitByPlane(plane, coplanarfrontnodes, coplanarbacknodes, frontnodes, backnodes);
        }
      }
      // only to be called for nodes with no children
      _splitByPlane(splane, coplanarfrontnodes, coplanarbacknodes, frontnodes, backnodes) {
        const polygon3 = this.polygon;
        if (polygon3) {
          const bound = poly3.measureBoundingSphere(polygon3);
          const sphereradius = bound[3] + EPS;
          const spherecenter = bound;
          const d = vec3.dot(splane, spherecenter) - splane[3];
          if (d > sphereradius) {
            frontnodes.push(this);
          } else if (d < -sphereradius) {
            backnodes.push(this);
          } else {
            const splitresult = splitPolygonByPlane(splane, polygon3);
            switch (splitresult.type) {
              case 0:
                coplanarfrontnodes.push(this);
                break;
              case 1:
                coplanarbacknodes.push(this);
                break;
              case 2:
                frontnodes.push(this);
                break;
              case 3:
                backnodes.push(this);
                break;
              case 4:
                if (splitresult.front) {
                  const frontnode = this.addChild(splitresult.front);
                  frontnodes.push(frontnode);
                }
                if (splitresult.back) {
                  const backnode = this.addChild(splitresult.back);
                  backnodes.push(backnode);
                }
                break;
            }
          }
        }
      }
      // PRIVATE methods from here:
      // add child to a node
      // this should be called whenever the polygon is split
      // a child should be created for every fragment of the split polygon
      // returns the newly created child
      addChild(polygon3) {
        const newchild = new _PolygonTreeNode(this, polygon3);
        this.children.push(newchild);
        return newchild;
      }
      invertSub() {
        let children = [this];
        const queue = [children];
        let i, j, l, node;
        for (i = 0; i < queue.length; i++) {
          children = queue[i];
          for (j = 0, l = children.length; j < l; j++) {
            node = children[j];
            if (node.polygon) {
              node.polygon = poly3.invert(node.polygon);
            }
            if (node.children.length > 0) queue.push(node.children);
          }
        }
      }
      // private method
      // remove the polygon from the node, and all parent nodes above it
      // called to invalidate parents of removed nodes
      recursivelyInvalidatePolygon() {
        this.polygon = null;
        if (this.parent) {
          this.parent.recursivelyInvalidatePolygon();
        }
      }
      clear() {
        let children = [this];
        const queue = [children];
        for (let i = 0; i < queue.length; ++i) {
          children = queue[i];
          const l = children.length;
          for (let j = 0; j < l; j++) {
            const node = children[j];
            if (node.polygon) {
              node.polygon = null;
            }
            if (node.parent) {
              node.parent = null;
            }
            if (node.children.length > 0) queue.push(node.children);
            node.children = [];
          }
        }
      }
      toString() {
        let result = "";
        let children = [this];
        const queue = [children];
        let i, j, l, node;
        for (i = 0; i < queue.length; ++i) {
          children = queue[i];
          const prefix = " ".repeat(i);
          for (j = 0, l = children.length; j < l; j++) {
            node = children[j];
            result += `${prefix}PolygonTreeNode (${node.isRootNode()}): ${node.children.length}`;
            if (node.polygon) {
              result += `
 ${prefix}polygon: ${node.polygon.vertices}
`;
            } else {
              result += "\n";
            }
            if (node.children.length > 0) queue.push(node.children);
          }
        }
        return result;
      }
    };
    module.exports = PolygonTreeNode;
  }
});

// node_modules/@jscad/modeling/src/operations/booleans/trees/Tree.js
var require_Tree = __commonJS({
  "node_modules/@jscad/modeling/src/operations/booleans/trees/Tree.js"(exports, module) {
    "use strict";
    var Node = require_Node();
    var PolygonTreeNode = require_PolygonTreeNode();
    var Tree = class {
      constructor(polygons) {
        this.polygonTree = new PolygonTreeNode();
        this.rootnode = new Node(null);
        if (polygons) this.addPolygons(polygons);
      }
      invert() {
        this.polygonTree.invert();
        this.rootnode.invert();
      }
      // Remove all polygons in this BSP tree that are inside the other BSP tree
      // `tree`.
      clipTo(tree, alsoRemovecoplanarFront = false) {
        this.rootnode.clipTo(tree, alsoRemovecoplanarFront);
      }
      allPolygons() {
        const result = [];
        this.polygonTree.getPolygons(result);
        return result;
      }
      addPolygons(polygons) {
        const polygontreenodes = new Array(polygons.length);
        for (let i = 0; i < polygons.length; i++) {
          polygontreenodes[i] = this.polygonTree.addChild(polygons[i]);
        }
        this.rootnode.addPolygonTreeNodes(polygontreenodes);
      }
      clear() {
        this.polygonTree.clear();
      }
      toString() {
        const result = "Tree: " + this.polygonTree.toString("");
        return result;
      }
    };
    module.exports = Tree;
  }
});

// node_modules/@jscad/modeling/src/operations/booleans/trees/index.js
var require_trees = __commonJS({
  "node_modules/@jscad/modeling/src/operations/booleans/trees/index.js"(exports, module) {
    "use strict";
    module.exports = {
      Tree: require_Tree()
    };
  }
});

// node_modules/@jscad/modeling/src/operations/booleans/intersectGeom3Sub.js
var require_intersectGeom3Sub = __commonJS({
  "node_modules/@jscad/modeling/src/operations/booleans/intersectGeom3Sub.js"(exports, module) {
    "use strict";
    var geom34 = require_geom3();
    var mayOverlap = require_mayOverlap();
    var { Tree } = require_trees();
    var intersectGeom3Sub = (geometry1, geometry2) => {
      if (!mayOverlap(geometry1, geometry2)) {
        return geom34.create();
      }
      const a = new Tree(geom34.toPolygons(geometry1));
      const b = new Tree(geom34.toPolygons(geometry2));
      a.invert();
      b.clipTo(a);
      b.invert();
      a.clipTo(b);
      b.clipTo(a);
      a.addPolygons(b.allPolygons());
      a.invert();
      const newpolygons = a.allPolygons();
      return geom34.create(newpolygons);
    };
    module.exports = intersectGeom3Sub;
  }
});

// node_modules/@jscad/modeling/src/operations/booleans/intersectGeom3.js
var require_intersectGeom3 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/booleans/intersectGeom3.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var retessellate = require_retessellate();
    var intersectSub = require_intersectGeom3Sub();
    var intersect = (...geometries) => {
      geometries = flatten(geometries);
      let newgeometry = geometries.shift();
      geometries.forEach((geometry) => {
        newgeometry = intersectSub(newgeometry, geometry);
      });
      newgeometry = retessellate(newgeometry);
      return newgeometry;
    };
    module.exports = intersect;
  }
});

// node_modules/@jscad/modeling/src/operations/booleans/intersectGeom2.js
var require_intersectGeom2 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/booleans/intersectGeom2.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var geom34 = require_geom3();
    var measureEpsilon = require_measureEpsilon();
    var fromFakePolygons = require_fromFakePolygons();
    var to3DWalls = require_to3DWalls();
    var intersectGeom3 = require_intersectGeom3();
    var intersect = (...geometries) => {
      geometries = flatten(geometries);
      const newgeometries = geometries.map((geometry) => to3DWalls({ z0: -1, z1: 1 }, geometry));
      const newgeom3 = intersectGeom3(newgeometries);
      const epsilon = measureEpsilon(newgeom3);
      return fromFakePolygons(epsilon, geom34.toPolygons(newgeom3));
    };
    module.exports = intersect;
  }
});

// node_modules/@jscad/modeling/src/operations/booleans/intersect.js
var require_intersect2 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/booleans/intersect.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var areAllShapesTheSameType = require_areAllShapesTheSameType();
    var geom2 = require_geom2();
    var geom34 = require_geom3();
    var intersectGeom2 = require_intersectGeom2();
    var intersectGeom3 = require_intersectGeom3();
    var intersect = (...geometries) => {
      geometries = flatten(geometries);
      if (geometries.length === 0) throw new Error("wrong number of arguments");
      if (!areAllShapesTheSameType(geometries)) {
        throw new Error("only intersect of the types are supported");
      }
      const geometry = geometries[0];
      if (geom2.isA(geometry)) return intersectGeom2(geometries);
      if (geom34.isA(geometry)) return intersectGeom3(geometries);
      return geometry;
    };
    module.exports = intersect;
  }
});

// node_modules/@jscad/modeling/src/operations/hulls/hullPoints3.js
var require_hullPoints3 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/hulls/hullPoints3.js"(exports, module) {
    "use strict";
    var poly3 = require_poly3();
    var quickhull = require_quickhull();
    var hullPoints3 = (uniquePoints) => {
      const faces = quickhull(uniquePoints, { skipTriangulation: true });
      const polygons = faces.map((face) => {
        const vertices = face.map((index) => uniquePoints[index]);
        return poly3.create(vertices);
      });
      return polygons;
    };
    module.exports = hullPoints3;
  }
});

// node_modules/@jscad/modeling/src/operations/booleans/unionGeom3Sub.js
var require_unionGeom3Sub = __commonJS({
  "node_modules/@jscad/modeling/src/operations/booleans/unionGeom3Sub.js"(exports, module) {
    "use strict";
    var geom34 = require_geom3();
    var mayOverlap = require_mayOverlap();
    var { Tree } = require_trees();
    var unionSub = (geometry1, geometry2) => {
      if (!mayOverlap(geometry1, geometry2)) {
        return unionForNonIntersecting(geometry1, geometry2);
      }
      const a = new Tree(geom34.toPolygons(geometry1));
      const b = new Tree(geom34.toPolygons(geometry2));
      a.clipTo(b, false);
      b.clipTo(a);
      b.invert();
      b.clipTo(a);
      b.invert();
      const newpolygons = a.allPolygons().concat(b.allPolygons());
      const result = geom34.create(newpolygons);
      return result;
    };
    var unionForNonIntersecting = (geometry1, geometry2) => {
      let newpolygons = geom34.toPolygons(geometry1);
      newpolygons = newpolygons.concat(geom34.toPolygons(geometry2));
      return geom34.create(newpolygons);
    };
    module.exports = unionSub;
  }
});

// node_modules/@jscad/modeling/src/operations/booleans/unionGeom3.js
var require_unionGeom3 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/booleans/unionGeom3.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var retessellate = require_retessellate();
    var unionSub = require_unionGeom3Sub();
    var union2 = (...geometries) => {
      geometries = flatten(geometries);
      let i;
      for (i = 1; i < geometries.length; i += 2) {
        geometries.push(unionSub(geometries[i - 1], geometries[i]));
      }
      let newgeometry = geometries[i - 1];
      newgeometry = retessellate(newgeometry);
      return newgeometry;
    };
    module.exports = union2;
  }
});

// node_modules/@jscad/modeling/src/operations/minkowski/minkowskiSum.js
var require_minkowskiSum = __commonJS({
  "node_modules/@jscad/modeling/src/operations/minkowski/minkowskiSum.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var geom34 = require_geom3();
    var poly3 = require_poly3();
    var hullPoints3 = require_hullPoints3();
    var unionGeom3 = require_unionGeom3();
    var minkowskiSum = (...geometries) => {
      geometries = flatten(geometries);
      if (geometries.length !== 2) {
        throw new Error("minkowskiSum requires exactly two geometries");
      }
      const [geomA, geomB] = geometries;
      if (!geom34.isA(geomA) || !geom34.isA(geomB)) {
        throw new Error("minkowskiSum requires geom3 geometries");
      }
      const aConvex = geom34.isConvex(geomA);
      const bConvex = geom34.isConvex(geomB);
      if (aConvex && bConvex) {
        return minkowskiSumConvex(geomA, geomB);
      }
      if (!aConvex && bConvex) {
        return minkowskiSumNonConvexConvex(geomA, geomB);
      }
      if (aConvex && !bConvex) {
        return minkowskiSumNonConvexConvex(geomB, geomA);
      }
      throw new Error("minkowskiSum of two non-convex geometries is not yet supported");
    };
    var minkowskiSumNonConvexConvex = (geomA, geomB) => {
      const tetrahedra = decomposeIntoTetrahedra(geomA);
      if (tetrahedra.length === 0) {
        return geom34.create();
      }
      const parts = tetrahedra.map((tet) => minkowskiSumConvex(tet, geomB));
      if (parts.length === 1) {
        return parts[0];
      }
      return unionGeom3(parts);
    };
    var decomposeIntoTetrahedra = (geometry) => {
      const polygons = geom34.toPolygons(geometry);
      if (polygons.length === 0) {
        return [];
      }
      const tetrahedra = [];
      for (let i = 0; i < polygons.length; i++) {
        const polygon3 = polygons[i];
        const vertices = polygon3.vertices;
        let cx = 0, cy = 0, cz = 0;
        for (let k = 0; k < vertices.length; k++) {
          cx += vertices[k][0];
          cy += vertices[k][1];
          cz += vertices[k][2];
        }
        cx /= vertices.length;
        cy /= vertices.length;
        cz /= vertices.length;
        const plane = poly3.plane(polygon3);
        const nx = plane[0], ny = plane[1], nz = plane[2];
        const offset = 0.1;
        const apex = [
          // Vertex used as apex in tetrahedron polygons below
          cx - nx * offset,
          cy - ny * offset,
          cz - nz * offset
        ];
        for (let j = 1; j < vertices.length - 1; j++) {
          const v0 = vertices[0];
          const v1 = vertices[j];
          const v2 = vertices[j + 1];
          const tetPolygons = createTetrahedronPolygons(apex, v0, v1, v2);
          tetrahedra.push(geom34.create(tetPolygons));
        }
      }
      return tetrahedra;
    };
    var createTetrahedronPolygons = (p0, p1, p2, p3) => {
      return [
        poly3.create([p0, p2, p1]),
        // base seen from p3
        poly3.create([p0, p1, p3]),
        // face opposite p2
        poly3.create([p1, p2, p3]),
        // face opposite p0
        poly3.create([p2, p0, p3])
        // face opposite p1
      ];
    };
    var minkowskiSumConvex = (geomA, geomB) => {
      const pointsA = extractUniqueVertices(geomA);
      const pointsB = extractUniqueVertices(geomB);
      if (pointsA.length === 0 || pointsB.length === 0) {
        return geom34.create();
      }
      const summedPoints = [];
      for (let i = 0; i < pointsA.length; i++) {
        const a = pointsA[i];
        for (let j = 0; j < pointsB.length; j++) {
          const b = pointsB[j];
          summedPoints.push([a[0] + b[0], a[1] + b[1], a[2] + b[2]]);
        }
      }
      const hullPolygons = hullPoints3(summedPoints);
      return geom34.create(hullPolygons);
    };
    var extractUniqueVertices = (geometry) => {
      const found = /* @__PURE__ */ new Set();
      const unique = [];
      const polygons = geom34.toPolygons(geometry);
      for (let i = 0; i < polygons.length; i++) {
        const vertices = polygons[i].vertices;
        for (let j = 0; j < vertices.length; j++) {
          const v = vertices[j];
          const key = `${v[0]},${v[1]},${v[2]}`;
          if (!found.has(key)) {
            found.add(key);
            unique.push(v);
          }
        }
      }
      return unique;
    };
    module.exports = minkowskiSum;
  }
});

// node_modules/@jscad/modeling/src/operations/booleans/scissionGeom3.js
var require_scissionGeom3 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/booleans/scissionGeom3.js"(exports, module) {
    "use strict";
    var vec3 = require_vec3();
    var measureEpsilon = require_measureEpsilon();
    var geom34 = require_geom3();
    var sortNb = (array) => array.sort((a, b) => a - b).filter((item, pos, ary) => !pos || item !== ary[pos - 1]);
    var insertMapping = (map, point, index) => {
      const key = `${point}`;
      const mapping = map.get(key);
      if (mapping === void 0) {
        map.set(key, [index]);
      } else {
        mapping.push(index);
      }
    };
    var findMapping = (map, point) => {
      const key = `${point}`;
      return map.get(key);
    };
    var scissionGeom3 = (geometry) => {
      const eps = measureEpsilon(geometry);
      const polygons = geom34.toPolygons(geometry);
      const pl = polygons.length;
      const indexesPerPoint = /* @__PURE__ */ new Map();
      const temp = vec3.create();
      polygons.forEach((polygon3, index) => {
        polygon3.vertices.forEach((point) => {
          insertMapping(indexesPerPoint, vec3.snap(temp, point, eps), index);
        });
      });
      const indexesPerPolygon = polygons.map((polygon3) => {
        let indexes = [];
        polygon3.vertices.forEach((point) => {
          indexes = indexes.concat(findMapping(indexesPerPoint, vec3.snap(temp, point, eps)));
        });
        return { e: 1, d: sortNb(indexes) };
      });
      indexesPerPoint.clear();
      let merges = 0;
      const ippl = indexesPerPolygon.length;
      for (let i = 0; i < ippl; i++) {
        const mapi = indexesPerPolygon[i];
        if (mapi.e > 0) {
          const indexes = new Array(pl);
          indexes[i] = true;
          do {
            merges = 0;
            indexes.forEach((e, j) => {
              const mapj = indexesPerPolygon[j];
              if (mapj.e > 0) {
                mapj.e = -1;
                for (let d = 0; d < mapj.d.length; d++) {
                  indexes[mapj.d[d]] = true;
                }
                merges++;
              }
            });
          } while (merges > 0);
          mapi.indexes = indexes;
        }
      }
      const newgeometries = [];
      for (let i = 0; i < ippl; i++) {
        if (indexesPerPolygon[i].indexes) {
          const newpolygons = [];
          indexesPerPolygon[i].indexes.forEach((e, p) => newpolygons.push(polygons[p]));
          newgeometries.push(geom34.create(newpolygons));
        }
      }
      return newgeometries;
    };
    module.exports = scissionGeom3;
  }
});

// node_modules/@jscad/modeling/src/operations/booleans/scission.js
var require_scission = __commonJS({
  "node_modules/@jscad/modeling/src/operations/booleans/scission.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var geom34 = require_geom3();
    var scissionGeom3 = require_scissionGeom3();
    var scission = (...objects) => {
      objects = flatten(objects);
      if (objects.length === 0) throw new Error("wrong number of arguments");
      const results = objects.map((object) => {
        if (geom34.isA(object)) return scissionGeom3(object);
        return object;
      });
      return results.length === 1 ? results[0] : results;
    };
    module.exports = scission;
  }
});

// node_modules/@jscad/modeling/src/operations/booleans/subtractGeom3Sub.js
var require_subtractGeom3Sub = __commonJS({
  "node_modules/@jscad/modeling/src/operations/booleans/subtractGeom3Sub.js"(exports, module) {
    "use strict";
    var geom34 = require_geom3();
    var mayOverlap = require_mayOverlap();
    var { Tree } = require_trees();
    var subtractGeom3Sub = (geometry1, geometry2) => {
      if (!mayOverlap(geometry1, geometry2)) {
        return geom34.clone(geometry1);
      }
      const a = new Tree(geom34.toPolygons(geometry1));
      const b = new Tree(geom34.toPolygons(geometry2));
      a.invert();
      a.clipTo(b);
      b.clipTo(a, true);
      a.addPolygons(b.allPolygons());
      a.invert();
      const newpolygons = a.allPolygons();
      return geom34.create(newpolygons);
    };
    module.exports = subtractGeom3Sub;
  }
});

// node_modules/@jscad/modeling/src/operations/booleans/subtractGeom3.js
var require_subtractGeom3 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/booleans/subtractGeom3.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var retessellate = require_retessellate();
    var subtractSub = require_subtractGeom3Sub();
    var subtract3 = (...geometries) => {
      geometries = flatten(geometries);
      let newgeometry = geometries.shift();
      geometries.forEach((geometry) => {
        newgeometry = subtractSub(newgeometry, geometry);
      });
      newgeometry = retessellate(newgeometry);
      return newgeometry;
    };
    module.exports = subtract3;
  }
});

// node_modules/@jscad/modeling/src/operations/booleans/subtractGeom2.js
var require_subtractGeom2 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/booleans/subtractGeom2.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var geom34 = require_geom3();
    var measureEpsilon = require_measureEpsilon();
    var fromFakePolygons = require_fromFakePolygons();
    var to3DWalls = require_to3DWalls();
    var subtractGeom3 = require_subtractGeom3();
    var subtract3 = (...geometries) => {
      geometries = flatten(geometries);
      const newgeometries = geometries.map((geometry) => to3DWalls({ z0: -1, z1: 1 }, geometry));
      const newgeom3 = subtractGeom3(newgeometries);
      const epsilon = measureEpsilon(newgeom3);
      return fromFakePolygons(epsilon, geom34.toPolygons(newgeom3));
    };
    module.exports = subtract3;
  }
});

// node_modules/@jscad/modeling/src/operations/booleans/subtract.js
var require_subtract4 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/booleans/subtract.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var areAllShapesTheSameType = require_areAllShapesTheSameType();
    var geom2 = require_geom2();
    var geom34 = require_geom3();
    var subtractGeom2 = require_subtractGeom2();
    var subtractGeom3 = require_subtractGeom3();
    var subtract3 = (...geometries) => {
      geometries = flatten(geometries);
      if (geometries.length === 0) throw new Error("wrong number of arguments");
      if (!areAllShapesTheSameType(geometries)) {
        throw new Error("only subtract of the types are supported");
      }
      const geometry = geometries[0];
      if (geom2.isA(geometry)) return subtractGeom2(geometries);
      if (geom34.isA(geometry)) return subtractGeom3(geometries);
      return geometry;
    };
    module.exports = subtract3;
  }
});

// node_modules/@jscad/modeling/src/operations/booleans/unionGeom2.js
var require_unionGeom2 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/booleans/unionGeom2.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var geom34 = require_geom3();
    var measureEpsilon = require_measureEpsilon();
    var fromFakePolygons = require_fromFakePolygons();
    var to3DWalls = require_to3DWalls();
    var unionGeom3 = require_unionGeom3();
    var union2 = (...geometries) => {
      geometries = flatten(geometries);
      const newgeometries = geometries.map((geometry) => to3DWalls({ z0: -1, z1: 1 }, geometry));
      const newgeom3 = unionGeom3(newgeometries);
      const epsilon = measureEpsilon(newgeom3);
      return fromFakePolygons(epsilon, geom34.toPolygons(newgeom3));
    };
    module.exports = union2;
  }
});

// node_modules/@jscad/modeling/src/operations/booleans/union.js
var require_union = __commonJS({
  "node_modules/@jscad/modeling/src/operations/booleans/union.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var areAllShapesTheSameType = require_areAllShapesTheSameType();
    var geom2 = require_geom2();
    var geom34 = require_geom3();
    var unionGeom2 = require_unionGeom2();
    var unionGeom3 = require_unionGeom3();
    var union2 = (...geometries) => {
      geometries = flatten(geometries);
      if (geometries.length === 0) throw new Error("wrong number of arguments");
      if (!areAllShapesTheSameType(geometries)) {
        throw new Error("only unions of the same type are supported");
      }
      const geometry = geometries[0];
      if (geom2.isA(geometry)) return unionGeom2(geometries);
      if (geom34.isA(geometry)) return unionGeom3(geometries);
      return geometry;
    };
    module.exports = union2;
  }
});

// node_modules/@jscad/modeling/src/operations/booleans/index.js
var require_booleans = __commonJS({
  "node_modules/@jscad/modeling/src/operations/booleans/index.js"(exports, module) {
    "use strict";
    module.exports = {
      intersect: require_intersect2(),
      minkowski: require_minkowskiSum(),
      scission: require_scission(),
      subtract: require_subtract4(),
      union: require_union()
    };
  }
});

// node_modules/@jscad/modeling/src/operations/expansions/offsetFromPoints.js
var require_offsetFromPoints = __commonJS({
  "node_modules/@jscad/modeling/src/operations/expansions/offsetFromPoints.js"(exports, module) {
    "use strict";
    var { EPS, TAU } = require_constants();
    var intersect = require_intersect();
    var line2 = require_line2();
    var vec2 = require_vec2();
    var area = require_area();
    var offsetFromPoints = (options, points) => {
      const defaults = {
        delta: 1,
        corners: "edge",
        closed: false,
        segments: 16
      };
      let { delta, corners, closed, segments } = Object.assign({}, defaults, options);
      if (Math.abs(delta) < EPS) return points;
      let rotation = options.closed ? area(points) : 1;
      if (rotation === 0) rotation = 1;
      const orientation = rotation > 0 && delta >= 0 || rotation < 0 && delta < 0;
      delta = Math.abs(delta);
      let previousSegment = null;
      let newPoints = [];
      const newCorners = [];
      const of = vec2.create();
      const n = points.length;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const p0 = points[i];
        const p1 = points[j];
        orientation ? vec2.subtract(of, p0, p1) : vec2.subtract(of, p1, p0);
        vec2.normal(of, of);
        vec2.normalize(of, of);
        vec2.scale(of, of, delta);
        const n0 = vec2.add(vec2.create(), p0, of);
        const n1 = vec2.add(vec2.create(), p1, of);
        const currentSegment = [n0, n1];
        if (previousSegment != null) {
          if (closed || !closed && j !== 0) {
            const ip = intersect(previousSegment[0], previousSegment[1], currentSegment[0], currentSegment[1]);
            if (ip) {
              newPoints.pop();
              currentSegment[0] = ip;
            } else {
              newCorners.push({ c: p0, s0: previousSegment, s1: currentSegment });
            }
          }
        }
        previousSegment = [n0, n1];
        if (j === 0 && !closed) continue;
        newPoints.push(currentSegment[0]);
        newPoints.push(currentSegment[1]);
      }
      if (closed && previousSegment != null) {
        const n0 = newPoints[0];
        const n1 = newPoints[1];
        const ip = intersect(previousSegment[0], previousSegment[1], n0, n1);
        if (ip) {
          newPoints[0] = ip;
          newPoints.pop();
        } else {
          const p0 = points[0];
          const cursegment = [n0, n1];
          newCorners.push({ c: p0, s0: previousSegment, s1: cursegment });
        }
      }
      if (corners === "edge") {
        const pointIndex = /* @__PURE__ */ new Map();
        newPoints.forEach((point, index) => pointIndex.set(point, index));
        const line0 = line2.create();
        const line1 = line2.create();
        newCorners.forEach((corner) => {
          line2.fromPoints(line0, corner.s0[0], corner.s0[1]);
          line2.fromPoints(line1, corner.s1[0], corner.s1[1]);
          const ip = line2.intersectPointOfLines(line0, line1);
          if (Number.isFinite(ip[0]) && Number.isFinite(ip[1])) {
            const p0 = corner.s0[1];
            const i = pointIndex.get(p0);
            newPoints[i] = ip;
            newPoints[(i + 1) % newPoints.length] = void 0;
          } else {
            const p0 = corner.s1[0];
            const i = pointIndex.get(p0);
            newPoints[i] = void 0;
          }
        });
        newPoints = newPoints.filter((p) => p !== void 0);
      }
      if (corners === "round") {
        let cornersegments = Math.floor(segments / 4);
        const v0 = vec2.create();
        newCorners.forEach((corner) => {
          let rotation2 = vec2.angle(vec2.subtract(v0, corner.s1[0], corner.c));
          rotation2 -= vec2.angle(vec2.subtract(v0, corner.s0[1], corner.c));
          if (orientation && rotation2 < 0) {
            rotation2 = rotation2 + Math.PI;
            if (rotation2 < 0) rotation2 = rotation2 + Math.PI;
          }
          if (!orientation && rotation2 > 0) {
            rotation2 = rotation2 - Math.PI;
            if (rotation2 > 0) rotation2 = rotation2 - Math.PI;
          }
          if (rotation2 !== 0) {
            cornersegments = Math.floor(segments * (Math.abs(rotation2) / TAU));
            const step = rotation2 / cornersegments;
            const start = vec2.angle(vec2.subtract(v0, corner.s0[1], corner.c));
            const cornerpoints = [];
            for (let i = 1; i < cornersegments; i++) {
              const radians = start + step * i;
              const point = vec2.fromAngleRadians(vec2.create(), radians);
              vec2.scale(point, point, delta);
              vec2.add(point, point, corner.c);
              cornerpoints.push(point);
            }
            if (cornerpoints.length > 0) {
              const p0 = corner.s0[1];
              let i = newPoints.findIndex((point) => vec2.equals(p0, point));
              i = (i + 1) % newPoints.length;
              newPoints.splice(i, 0, ...cornerpoints);
            }
          } else {
            const p0 = corner.s1[0];
            const i = newPoints.findIndex((point) => vec2.equals(p0, point));
            newPoints.splice(i, 1);
          }
        });
      }
      return newPoints;
    };
    module.exports = offsetFromPoints;
  }
});

// node_modules/@jscad/modeling/src/operations/expansions/expandGeom2.js
var require_expandGeom2 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/expansions/expandGeom2.js"(exports, module) {
    "use strict";
    var geom2 = require_geom2();
    var offsetFromPoints = require_offsetFromPoints();
    var expandGeom2 = (options, geometry) => {
      const defaults = {
        delta: 1,
        corners: "edge",
        segments: 16
      };
      const { delta, corners, segments } = Object.assign({}, defaults, options);
      if (!(corners === "edge" || corners === "chamfer" || corners === "round")) {
        throw new Error('corners must be "edge", "chamfer", or "round"');
      }
      const outlines = geom2.toOutlines(geometry);
      const newoutlines = outlines.map((outline) => {
        options = {
          delta,
          corners,
          closed: true,
          segments
        };
        return offsetFromPoints(options, outline);
      });
      const allsides = newoutlines.reduce((sides, newoutline) => sides.concat(geom2.toSides(geom2.fromPoints(newoutline))), []);
      return geom2.create(allsides);
    };
    module.exports = expandGeom2;
  }
});

// node_modules/@jscad/modeling/src/operations/expansions/extrudePolygon.js
var require_extrudePolygon = __commonJS({
  "node_modules/@jscad/modeling/src/operations/expansions/extrudePolygon.js"(exports, module) {
    "use strict";
    var mat4 = require_mat4();
    var vec3 = require_vec3();
    var geom34 = require_geom3();
    var poly3 = require_poly3();
    var extrudePolygon = (offsetvector, polygon1) => {
      const direction = vec3.dot(poly3.plane(polygon1), offsetvector);
      if (direction > 0) {
        polygon1 = poly3.invert(polygon1);
      }
      const newpolygons = [polygon1];
      const polygon22 = poly3.transform(mat4.fromTranslation(mat4.create(), offsetvector), polygon1);
      const numvertices = polygon1.vertices.length;
      for (let i = 0; i < numvertices; i++) {
        const nexti = i < numvertices - 1 ? i + 1 : 0;
        const sideFacePolygon = poly3.create([
          polygon1.vertices[i],
          polygon22.vertices[i],
          polygon22.vertices[nexti],
          polygon1.vertices[nexti]
        ]);
        newpolygons.push(sideFacePolygon);
      }
      newpolygons.push(poly3.invert(polygon22));
      return geom34.create(newpolygons);
    };
    module.exports = extrudePolygon;
  }
});

// node_modules/@jscad/modeling/src/operations/expansions/expandShell.js
var require_expandShell = __commonJS({
  "node_modules/@jscad/modeling/src/operations/expansions/expandShell.js"(exports, module) {
    "use strict";
    var { EPS, TAU } = require_constants();
    var mat4 = require_mat4();
    var vec3 = require_vec3();
    var fnNumberSort = require_fnNumberSort();
    var geom34 = require_geom3();
    var poly3 = require_poly3();
    var sphere = require_sphere();
    var retessellate = require_retessellate();
    var unionGeom3Sub = require_unionGeom3Sub();
    var extrudePolygon = require_extrudePolygon();
    var mapPlaneToVertex = (map, vertex, plane) => {
      const key = vertex.toString();
      if (!map.has(key)) {
        const entry = [vertex, [plane]];
        map.set(key, entry);
      } else {
        const planes = map.get(key)[1];
        planes.push(plane);
      }
    };
    var mapPlaneToEdge = (map, edge, plane) => {
      const key0 = edge[0].toString();
      const key1 = edge[1].toString();
      const key = key0 < key1 ? `${key0},${key1}` : `${key1},${key0}`;
      if (!map.has(key)) {
        const entry = [edge, [plane]];
        map.set(key, entry);
      } else {
        const planes = map.get(key)[1];
        planes.push(plane);
      }
    };
    var addUniqueAngle = (map, angle) => {
      const i = map.findIndex((item) => item === angle);
      if (i < 0) {
        map.push(angle);
      }
    };
    var expandShell = (options, geometry) => {
      const defaults = {
        delta: 1,
        segments: 12
      };
      const { delta, segments } = Object.assign({}, defaults, options);
      let result = geom34.create();
      const vertices2planes = /* @__PURE__ */ new Map();
      const edges2planes = /* @__PURE__ */ new Map();
      const v1 = vec3.create();
      const v2 = vec3.create();
      const polygons = geom34.toPolygons(geometry);
      polygons.forEach((polygon3, index) => {
        const extrudevector = vec3.scale(vec3.create(), poly3.plane(polygon3), 2 * delta);
        const translatedpolygon = poly3.transform(mat4.fromTranslation(mat4.create(), vec3.scale(vec3.create(), extrudevector, -0.5)), polygon3);
        const extrudedface = extrudePolygon(extrudevector, translatedpolygon);
        result = unionGeom3Sub(result, extrudedface);
        const vertices = polygon3.vertices;
        for (let i = 0; i < vertices.length; i++) {
          mapPlaneToVertex(vertices2planes, vertices[i], poly3.plane(polygon3));
          const j = (i + 1) % vertices.length;
          const edge = [vertices[i], vertices[j]];
          mapPlaneToEdge(edges2planes, edge, poly3.plane(polygon3));
        }
      });
      edges2planes.forEach((item) => {
        const edge = item[0];
        const planes = item[1];
        const startpoint = edge[0];
        const endpoint = edge[1];
        const zbase = vec3.subtract(vec3.create(), endpoint, startpoint);
        vec3.normalize(zbase, zbase);
        const xbase = planes[0];
        const ybase = vec3.cross(vec3.create(), xbase, zbase);
        let angles = [];
        for (let i = 0; i < segments; i++) {
          addUniqueAngle(angles, i * TAU / segments);
        }
        for (let i = 0, iMax = planes.length; i < iMax; i++) {
          const planenormal = planes[i];
          const si = vec3.dot(ybase, planenormal);
          const co = vec3.dot(xbase, planenormal);
          let angle = Math.atan2(si, co);
          if (angle < 0) angle += TAU;
          addUniqueAngle(angles, angle);
          angle = Math.atan2(-si, -co);
          if (angle < 0) angle += TAU;
          addUniqueAngle(angles, angle);
        }
        angles = angles.sort(fnNumberSort);
        const numangles = angles.length;
        let prevp1;
        let prevp2;
        const startfacevertices = [];
        const endfacevertices = [];
        const polygons2 = [];
        for (let i = -1; i < numangles; i++) {
          const angle = angles[i < 0 ? i + numangles : i];
          const si = Math.sin(angle);
          const co = Math.cos(angle);
          vec3.scale(v1, xbase, co * delta);
          vec3.scale(v2, ybase, si * delta);
          vec3.add(v1, v1, v2);
          const p1 = vec3.add(vec3.create(), startpoint, v1);
          const p2 = vec3.add(vec3.create(), endpoint, v1);
          let skip = false;
          if (i >= 0) {
            if (vec3.distance(p1, prevp1) < EPS) {
              skip = true;
            }
          }
          if (!skip) {
            if (i >= 0) {
              startfacevertices.push(p1);
              endfacevertices.push(p2);
              const points = [prevp2, p2, p1, prevp1];
              const polygon3 = poly3.create(points);
              polygons2.push(polygon3);
            }
            prevp1 = p1;
            prevp2 = p2;
          }
        }
        endfacevertices.reverse();
        polygons2.push(poly3.create(startfacevertices));
        polygons2.push(poly3.create(endfacevertices));
        const cylinder2 = geom34.create(polygons2);
        result = unionGeom3Sub(result, cylinder2);
      });
      vertices2planes.forEach((item) => {
        const vertex = item[0];
        const planes = item[1];
        const xaxis = planes[0];
        let bestzaxis = null;
        let bestzaxisorthogonality = 0;
        for (let i = 1; i < planes.length; i++) {
          const normal = planes[i];
          const cross2 = vec3.cross(v1, xaxis, normal);
          const crosslength = vec3.length(cross2);
          if (crosslength > 0.05) {
            if (crosslength > bestzaxisorthogonality) {
              bestzaxisorthogonality = crosslength;
              bestzaxis = normal;
            }
          }
        }
        if (!bestzaxis) {
          bestzaxis = vec3.orthogonal(v1, xaxis);
        }
        const yaxis = vec3.cross(v1, xaxis, bestzaxis);
        vec3.normalize(yaxis, yaxis);
        const zaxis = vec3.cross(v2, yaxis, xaxis);
        const corner = sphere({
          center: [vertex[0], vertex[1], vertex[2]],
          radius: delta,
          segments,
          axes: [xaxis, yaxis, zaxis]
        });
        result = unionGeom3Sub(result, corner);
      });
      return retessellate(result);
    };
    module.exports = expandShell;
  }
});

// node_modules/@jscad/modeling/src/operations/expansions/expandGeom3.js
var require_expandGeom3 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/expansions/expandGeom3.js"(exports, module) {
    "use strict";
    var geom34 = require_geom3();
    var union2 = require_union();
    var expandShell = require_expandShell();
    var expandGeom3 = (options, geometry) => {
      const defaults = {
        delta: 1,
        corners: "round",
        segments: 12
      };
      const { delta, corners, segments } = Object.assign({}, defaults, options);
      if (!(corners === "round")) {
        throw new Error('corners must be "round" for 3D geometries');
      }
      const polygons = geom34.toPolygons(geometry);
      if (polygons.length === 0) throw new Error("the given geometry cannot be empty");
      options = { delta, corners, segments };
      const expanded = expandShell(options, geometry);
      return union2(geometry, expanded);
    };
    module.exports = expandGeom3;
  }
});

// node_modules/@jscad/modeling/src/operations/expansions/expandPath2.js
var require_expandPath2 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/expansions/expandPath2.js"(exports, module) {
    "use strict";
    var area = require_area();
    var vec2 = require_vec2();
    var geom2 = require_geom2();
    var path2 = require_path2();
    var offsetFromPoints = require_offsetFromPoints();
    var createGeometryFromClosedOffsets = (paths) => {
      let { external, internal } = paths;
      if (area(external) < 0) {
        external = external.reverse();
      } else {
        internal = internal.reverse();
      }
      const externalPath = path2.fromPoints({ closed: true }, external);
      const internalPath = path2.fromPoints({ closed: true }, internal);
      const externalSides = geom2.toSides(geom2.fromPoints(path2.toPoints(externalPath)));
      const internalSides = geom2.toSides(geom2.fromPoints(path2.toPoints(internalPath)));
      externalSides.push(...internalSides);
      return geom2.create(externalSides);
    };
    var createGeometryFromExpandedOpenPath = (paths, segments, corners, delta) => {
      const { points, external, internal } = paths;
      const capSegments = Math.floor(segments / 2);
      const e2iCap = [];
      const i2eCap = [];
      if (corners === "round" && capSegments > 0) {
        const step = Math.PI / capSegments;
        const eCorner = points[points.length - 1];
        const e2iStart = vec2.angle(vec2.subtract(vec2.create(), external[external.length - 1], eCorner));
        const iCorner = points[0];
        const i2eStart = vec2.angle(vec2.subtract(vec2.create(), internal[0], iCorner));
        for (let i = 1; i < capSegments; i++) {
          let radians = e2iStart + step * i;
          let point = vec2.fromAngleRadians(vec2.create(), radians);
          vec2.scale(point, point, delta);
          vec2.add(point, point, eCorner);
          e2iCap.push(point);
          radians = i2eStart + step * i;
          point = vec2.fromAngleRadians(vec2.create(), radians);
          vec2.scale(point, point, delta);
          vec2.add(point, point, iCorner);
          i2eCap.push(point);
        }
      }
      const allPoints = [];
      allPoints.push(...external, ...e2iCap, ...internal.reverse(), ...i2eCap);
      return geom2.fromPoints(allPoints);
    };
    var expandPath2 = (options, geometry) => {
      const defaults = {
        delta: 1,
        corners: "edge",
        segments: 16
      };
      options = Object.assign({}, defaults, options);
      const { delta, corners, segments } = options;
      if (delta <= 0) throw new Error("the given delta must be positive for paths");
      if (!(corners === "edge" || corners === "chamfer" || corners === "round")) {
        throw new Error('corners must be "edge", "chamfer", or "round"');
      }
      const closed = geometry.isClosed;
      const points = path2.toPoints(geometry);
      if (points.length === 0) throw new Error("the given geometry cannot be empty");
      const paths = {
        points,
        external: offsetFromPoints({ delta, corners, segments, closed }, points),
        internal: offsetFromPoints({ delta: -delta, corners, segments, closed }, points)
      };
      if (geometry.isClosed) {
        return createGeometryFromClosedOffsets(paths);
      } else {
        return createGeometryFromExpandedOpenPath(paths, segments, corners, delta);
      }
    };
    module.exports = expandPath2;
  }
});

// node_modules/@jscad/modeling/src/operations/expansions/expand.js
var require_expand = __commonJS({
  "node_modules/@jscad/modeling/src/operations/expansions/expand.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var geom2 = require_geom2();
    var geom34 = require_geom3();
    var path2 = require_path2();
    var expandGeom2 = require_expandGeom2();
    var expandGeom3 = require_expandGeom3();
    var expandPath2 = require_expandPath2();
    var expand = (options, ...objects) => {
      objects = flatten(objects);
      if (objects.length === 0) throw new Error("wrong number of arguments");
      const results = objects.map((object) => {
        if (path2.isA(object)) return expandPath2(options, object);
        if (geom2.isA(object)) return expandGeom2(options, object);
        if (geom34.isA(object)) return expandGeom3(options, object);
        return object;
      });
      return results.length === 1 ? results[0] : results;
    };
    module.exports = expand;
  }
});

// node_modules/@jscad/modeling/src/operations/expansions/offsetGeom2.js
var require_offsetGeom2 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/expansions/offsetGeom2.js"(exports, module) {
    "use strict";
    var geom2 = require_geom2();
    var poly2 = require_poly2();
    var offsetFromPoints = require_offsetFromPoints();
    var offsetGeom2 = (options, geometry) => {
      const defaults = {
        delta: 1,
        corners: "edge",
        segments: 0
      };
      const { delta, corners, segments } = Object.assign({}, defaults, options);
      if (!(corners === "edge" || corners === "chamfer" || corners === "round")) {
        throw new Error('corners must be "edge", "chamfer", or "round"');
      }
      const outlines = geom2.toOutlines(geometry);
      const newoutlines = outlines.map((outline) => {
        const level = outlines.reduce((acc, polygon3) => acc + poly2.arePointsInside(outline, poly2.create(polygon3)), 0);
        const outside = level % 2 === 0;
        options = {
          delta: outside ? delta : -delta,
          corners,
          closed: true,
          segments
        };
        return offsetFromPoints(options, outline);
      });
      const allsides = newoutlines.reduce((sides, newoutline) => sides.concat(geom2.toSides(geom2.fromPoints(newoutline))), []);
      return geom2.create(allsides);
    };
    module.exports = offsetGeom2;
  }
});

// node_modules/@jscad/modeling/src/operations/expansions/offsetPath2.js
var require_offsetPath2 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/expansions/offsetPath2.js"(exports, module) {
    "use strict";
    var path2 = require_path2();
    var offsetFromPoints = require_offsetFromPoints();
    var offsetPath2 = (options, geometry) => {
      const defaults = {
        delta: 1,
        corners: "edge",
        closed: geometry.isClosed,
        segments: 16
      };
      const { delta, corners, closed, segments } = Object.assign({}, defaults, options);
      if (!(corners === "edge" || corners === "chamfer" || corners === "round")) {
        throw new Error('corners must be "edge", "chamfer", or "round"');
      }
      options = { delta, corners, closed, segments };
      const newpoints = offsetFromPoints(options, path2.toPoints(geometry));
      return path2.fromPoints({ closed }, newpoints);
    };
    module.exports = offsetPath2;
  }
});

// node_modules/@jscad/modeling/src/operations/expansions/offset.js
var require_offset = __commonJS({
  "node_modules/@jscad/modeling/src/operations/expansions/offset.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var geom2 = require_geom2();
    var path2 = require_path2();
    var offsetGeom2 = require_offsetGeom2();
    var offsetPath2 = require_offsetPath2();
    var offset = (options, ...objects) => {
      objects = flatten(objects);
      if (objects.length === 0) throw new Error("wrong number of arguments");
      const results = objects.map((object) => {
        if (path2.isA(object)) return offsetPath2(options, object);
        if (geom2.isA(object)) return offsetGeom2(options, object);
        return object;
      });
      return results.length === 1 ? results[0] : results;
    };
    module.exports = offset;
  }
});

// node_modules/@jscad/modeling/src/operations/expansions/index.js
var require_expansions = __commonJS({
  "node_modules/@jscad/modeling/src/operations/expansions/index.js"(exports, module) {
    "use strict";
    module.exports = {
      expand: require_expand(),
      offset: require_offset()
    };
  }
});

// node_modules/@jscad/modeling/src/operations/extrusions/extrudeLinearGeom2.js
var require_extrudeLinearGeom2 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/extrusions/extrudeLinearGeom2.js"(exports, module) {
    "use strict";
    var mat4 = require_mat4();
    var vec3 = require_vec3();
    var geom2 = require_geom2();
    var slice = require_slice();
    var extrudeFromSlices = require_extrudeFromSlices();
    var extrudeGeom2 = (options, geometry) => {
      const defaults = {
        offset: [0, 0, 1],
        twistAngle: 0,
        twistSteps: 12,
        repair: true
      };
      let { offset, twistAngle, twistSteps, repair } = Object.assign({}, defaults, options);
      if (twistSteps < 1) throw new Error("twistSteps must be 1 or more");
      if (twistAngle === 0) {
        twistSteps = 1;
      }
      const offsetv = vec3.clone(offset);
      const baseSides = geom2.toSides(geometry);
      if (baseSides.length === 0) throw new Error("the given geometry cannot be empty");
      const baseSlice = slice.fromSides(baseSides);
      if (offsetv[2] < 0) slice.reverse(baseSlice, baseSlice);
      const matrix = mat4.create();
      const createTwist = (progress, index, base) => {
        const Zrotation = index / twistSteps * twistAngle;
        const Zoffset = vec3.scale(vec3.create(), offsetv, index / twistSteps);
        mat4.multiply(matrix, mat4.fromZRotation(matrix, Zrotation), mat4.fromTranslation(mat4.create(), Zoffset));
        return slice.transform(matrix, base);
      };
      options = {
        numberOfSlices: twistSteps + 1,
        capStart: true,
        capEnd: true,
        repair,
        callback: createTwist
      };
      return extrudeFromSlices(options, baseSlice);
    };
    module.exports = extrudeGeom2;
  }
});

// node_modules/@jscad/modeling/src/operations/extrusions/extrudeLinearPath2.js
var require_extrudeLinearPath2 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/extrusions/extrudeLinearPath2.js"(exports, module) {
    "use strict";
    var geom2 = require_geom2();
    var path2 = require_path2();
    var extrudeLinearGeom2 = require_extrudeLinearGeom2();
    var extrudePath2 = (options, geometry) => {
      if (!geometry.isClosed) throw new Error("extruded path must be closed");
      const points = path2.toPoints(geometry);
      const geometry2 = geom2.fromPoints(points);
      return extrudeLinearGeom2(options, geometry2);
    };
    module.exports = extrudePath2;
  }
});

// node_modules/@jscad/modeling/src/operations/extrusions/extrudeLinear.js
var require_extrudeLinear = __commonJS({
  "node_modules/@jscad/modeling/src/operations/extrusions/extrudeLinear.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var geom2 = require_geom2();
    var path2 = require_path2();
    var extrudeLinearGeom2 = require_extrudeLinearGeom2();
    var extrudeLinearPath2 = require_extrudeLinearPath2();
    var extrudeLinear3 = (options, ...objects) => {
      const defaults = {
        height: 1,
        twistAngle: 0,
        twistSteps: 1,
        repair: true
      };
      const { height, twistAngle, twistSteps, repair } = Object.assign({}, defaults, options);
      objects = flatten(objects);
      if (objects.length === 0) throw new Error("wrong number of arguments");
      options = { offset: [0, 0, height], twistAngle, twistSteps, repair };
      const results = objects.map((object) => {
        if (path2.isA(object)) return extrudeLinearPath2(options, object);
        if (geom2.isA(object)) return extrudeLinearGeom2(options, object);
        return object;
      });
      return results.length === 1 ? results[0] : results;
    };
    module.exports = extrudeLinear3;
  }
});

// node_modules/@jscad/modeling/src/operations/extrusions/extrudeRectangularPath2.js
var require_extrudeRectangularPath2 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/extrusions/extrudeRectangularPath2.js"(exports, module) {
    "use strict";
    var path2 = require_path2();
    var expand = require_expand();
    var extrudeLinearGeom2 = require_extrudeLinearGeom2();
    var extrudeRectangularPath2 = (options, geometry) => {
      const defaults = {
        size: 1,
        height: 1
      };
      const { size, height } = Object.assign({}, defaults, options);
      options.delta = size;
      options.offset = [0, 0, height];
      const points = path2.toPoints(geometry);
      if (points.length === 0) throw new Error("the given geometry cannot be empty");
      const newgeometry = expand(options, geometry);
      return extrudeLinearGeom2(options, newgeometry);
    };
    module.exports = extrudeRectangularPath2;
  }
});

// node_modules/@jscad/modeling/src/operations/extrusions/extrudeRectangularGeom2.js
var require_extrudeRectangularGeom2 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/extrusions/extrudeRectangularGeom2.js"(exports, module) {
    "use strict";
    var { area } = require_utils();
    var geom2 = require_geom2();
    var path2 = require_path2();
    var expand = require_expand();
    var extrudeLinearGeom2 = require_extrudeLinearGeom2();
    var extrudeRectangularGeom2 = (options, geometry) => {
      const defaults = {
        size: 1,
        height: 1
      };
      const { size, height } = Object.assign({}, defaults, options);
      options.delta = size;
      options.offset = [0, 0, height];
      const outlines = geom2.toOutlines(geometry);
      if (outlines.length === 0) throw new Error("the given geometry cannot be empty");
      const newparts = outlines.map((outline) => {
        if (area(outline) < 0) outline.reverse();
        return expand(options, path2.fromPoints({ closed: true }, outline));
      });
      const allsides = newparts.reduce((sides, part) => sides.concat(geom2.toSides(part)), []);
      const newgeometry = geom2.create(allsides);
      return extrudeLinearGeom2(options, newgeometry);
    };
    module.exports = extrudeRectangularGeom2;
  }
});

// node_modules/@jscad/modeling/src/operations/extrusions/extrudeRectangular.js
var require_extrudeRectangular = __commonJS({
  "node_modules/@jscad/modeling/src/operations/extrusions/extrudeRectangular.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var geom2 = require_geom2();
    var path2 = require_path2();
    var extrudeRectangularPath2 = require_extrudeRectangularPath2();
    var extrudeRectangularGeom2 = require_extrudeRectangularGeom2();
    var extrudeRectangular = (options, ...objects) => {
      const defaults = {
        size: 1,
        height: 1
      };
      const { size, height } = Object.assign({}, defaults, options);
      objects = flatten(objects);
      if (objects.length === 0) throw new Error("wrong number of arguments");
      if (size <= 0) throw new Error("size must be positive");
      if (height <= 0) throw new Error("height must be positive");
      const results = objects.map((object) => {
        if (path2.isA(object)) return extrudeRectangularPath2(options, object);
        if (geom2.isA(object)) return extrudeRectangularGeom2(options, object);
        return object;
      });
      return results.length === 1 ? results[0] : results;
    };
    module.exports = extrudeRectangular;
  }
});

// node_modules/@jscad/modeling/src/operations/extrusions/extrudeHelical.js
var require_extrudeHelical = __commonJS({
  "node_modules/@jscad/modeling/src/operations/extrusions/extrudeHelical.js"(exports, module) {
    "use strict";
    var { TAU } = require_constants();
    var mat4 = require_mat4();
    var geom2 = require_geom2();
    var extrudeFromSlices = require_extrudeFromSlices();
    var slice = require_slice();
    var extrudeHelical = (options, geometry) => {
      const defaults = {
        angle: TAU,
        startAngle: 0,
        pitch: 10,
        height: 0,
        endOffset: 0,
        segmentsPerRotation: 32
      };
      let { angle, startAngle, pitch, height, endOffset, segmentsPerRotation } = Object.assign({}, defaults, options);
      if (height != 0) {
        pitch = height / (angle / TAU);
      }
      const minNumberOfSegments = 3;
      if (segmentsPerRotation < minNumberOfSegments) {
        throw new Error("The number of segments per rotation needs to be at least 3.");
      }
      const shapeSides = geom2.toSides(geometry);
      if (shapeSides.length === 0) throw new Error("The given geometry cannot be empty");
      const pointsWithPositiveX = shapeSides.filter((s) => s[0][0] >= 0);
      let baseSlice = slice.fromSides(shapeSides);
      if (pointsWithPositiveX.length === 0) {
        baseSlice = slice.reverse(baseSlice);
      }
      const calculatedSegments = Math.round(segmentsPerRotation / TAU * Math.abs(angle));
      const segments = calculatedSegments >= 2 ? calculatedSegments : 2;
      const step1 = mat4.create();
      const step2 = mat4.create();
      const sliceCallback = (progress, index, base) => {
        const zRotation = startAngle + angle / segments * index;
        const xOffset = endOffset / segments * index;
        const zOffset = (zRotation - startAngle) / TAU * pitch;
        mat4.multiply(
          step1,
          // then apply offsets
          mat4.fromTranslation(mat4.create(), [xOffset, 0, zOffset * Math.sign(angle)]),
          // first rotate "flat" 2D shape from XY to XZ plane
          mat4.fromXRotation(mat4.create(), -TAU / 4 * Math.sign(angle))
          // rotate the slice correctly to not create inside-out polygon
        );
        mat4.multiply(
          step2,
          // finally rotate around Z axis
          mat4.fromZRotation(mat4.create(), zRotation),
          step1
        );
        return slice.transform(step2, base);
      };
      return extrudeFromSlices(
        {
          // "base" slice is counted as segment, so add one for complete final rotation
          numberOfSlices: segments + 1,
          callback: sliceCallback
        },
        baseSlice
      );
    };
    module.exports = extrudeHelical;
  }
});

// node_modules/@jscad/modeling/src/operations/extrusions/project.js
var require_project = __commonJS({
  "node_modules/@jscad/modeling/src/operations/extrusions/project.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var aboutEqualNormals = require_aboutEqualNormals();
    var plane = require_plane();
    var mat4 = require_mat4();
    var geom2 = require_geom2();
    var geom34 = require_geom3();
    var poly3 = require_poly3();
    var measureEpsilon = require_measureEpsilon();
    var unionGeom2 = require_unionGeom2();
    var projectGeom3 = (options, geometry) => {
      const projplane = plane.fromNormalAndPoint(plane.create(), options.axis, options.origin);
      if (Number.isNaN(projplane[0]) || Number.isNaN(projplane[1]) || Number.isNaN(projplane[2]) || Number.isNaN(projplane[3])) {
        throw new Error("project: invalid axis or origin");
      }
      const epsilon = measureEpsilon(geometry);
      const epsilonArea = epsilon * epsilon * Math.sqrt(3) / 4;
      if (epsilon === 0) return geom2.create();
      const polygons = geom34.toPolygons(geometry);
      let projpolys = [];
      for (let i = 0; i < polygons.length; i++) {
        const newpoints = polygons[i].vertices.map((v) => plane.projectionOfPoint(projplane, v));
        const newpoly = poly3.create(newpoints);
        const newplane = poly3.plane(newpoly);
        if (!aboutEqualNormals(projplane, newplane)) continue;
        if (poly3.measureArea(newpoly) < epsilonArea) continue;
        projpolys.push(newpoly);
      }
      if (!aboutEqualNormals(projplane, [0, 0, 1])) {
        const rotation = mat4.fromVectorRotation(mat4.create(), projplane, [0, 0, 1]);
        projpolys = projpolys.map((p) => poly3.transform(rotation, p));
      }
      projpolys = projpolys.sort((a, b) => poly3.measureArea(b) - poly3.measureArea(a));
      const projgeoms = projpolys.map((p) => geom2.fromPoints(p.vertices));
      return unionGeom2(projgeoms);
    };
    var project = (options, ...objects) => {
      const defaults = {
        axis: [0, 0, 1],
        // Z axis
        origin: [0, 0, 0]
      };
      const { axis, origin } = Object.assign({}, defaults, options);
      objects = flatten(objects);
      if (objects.length === 0) throw new Error("wrong number of arguments");
      options = { axis, origin };
      const results = objects.map((object) => {
        if (geom34.isA(object)) return projectGeom3(options, object);
        return object;
      });
      return results.length === 1 ? results[0] : results;
    };
    module.exports = project;
  }
});

// node_modules/@jscad/modeling/src/operations/extrusions/index.js
var require_extrusions = __commonJS({
  "node_modules/@jscad/modeling/src/operations/extrusions/index.js"(exports, module) {
    "use strict";
    module.exports = {
      extrudeFromSlices: require_extrudeFromSlices(),
      extrudeLinear: require_extrudeLinear(),
      extrudeRectangular: require_extrudeRectangular(),
      extrudeRotate: require_extrudeRotate(),
      extrudeHelical: require_extrudeHelical(),
      project: require_project(),
      slice: require_slice()
    };
  }
});

// node_modules/@jscad/modeling/src/operations/hulls/hullPoints2.js
var require_hullPoints2 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/hulls/hullPoints2.js"(exports, module) {
    "use strict";
    var vec2 = require_vec2();
    var hullPoints2 = (uniquePoints) => {
      let min = vec2.fromValues(Infinity, Infinity);
      uniquePoints.forEach((point) => {
        if (point[1] < min[1] || point[1] === min[1] && point[0] < min[0]) {
          min = point;
        }
      });
      const points = [];
      uniquePoints.forEach((point) => {
        const angle = fakeAtan2(point[1] - min[1], point[0] - min[0]);
        const distSq = vec2.squaredDistance(point, min);
        points.push({ point, angle, distSq });
      });
      points.sort((pt1, pt2) => pt1.angle !== pt2.angle ? pt1.angle - pt2.angle : pt1.distSq - pt2.distSq);
      const stack = [];
      points.forEach((point) => {
        let cnt = stack.length;
        while (cnt > 1 && ccw(stack[cnt - 2], stack[cnt - 1], point.point) <= Number.EPSILON) {
          stack.pop();
          cnt = stack.length;
        }
        stack.push(point.point);
      });
      return stack;
    };
    var ccw = (v1, v2, v3) => (v2[0] - v1[0]) * (v3[1] - v1[1]) - (v2[1] - v1[1]) * (v3[0] - v1[0]);
    var fakeAtan2 = (y, x) => {
      if (y === 0 && x === 0) {
        return -Infinity;
      } else {
        return -x / y;
      }
    };
    module.exports = hullPoints2;
  }
});

// node_modules/@jscad/modeling/src/operations/hulls/toUniquePoints.js
var require_toUniquePoints = __commonJS({
  "node_modules/@jscad/modeling/src/operations/hulls/toUniquePoints.js"(exports, module) {
    "use strict";
    var geom2 = require_geom2();
    var geom34 = require_geom3();
    var path2 = require_path2();
    var toUniquePoints = (geometries) => {
      const found = /* @__PURE__ */ new Set();
      const uniquePoints = [];
      const addPoint = (point) => {
        const key = point.toString();
        if (!found.has(key)) {
          uniquePoints.push(point);
          found.add(key);
        }
      };
      geometries.forEach((geometry) => {
        if (geom2.isA(geometry)) {
          geom2.toPoints(geometry).forEach(addPoint);
        } else if (geom34.isA(geometry)) {
          geom34.toPoints(geometry).forEach((points) => points.forEach(addPoint));
        } else if (path2.isA(geometry)) {
          path2.toPoints(geometry).forEach(addPoint);
        }
      });
      return uniquePoints;
    };
    module.exports = toUniquePoints;
  }
});

// node_modules/@jscad/modeling/src/operations/hulls/hullPath2.js
var require_hullPath2 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/hulls/hullPath2.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var path2 = require_path2();
    var hullPoints2 = require_hullPoints2();
    var toUniquePoints = require_toUniquePoints();
    var hullPath2 = (...geometries) => {
      geometries = flatten(geometries);
      const unique = toUniquePoints(geometries);
      const hullPoints = hullPoints2(unique);
      return path2.fromPoints({ closed: true }, hullPoints);
    };
    module.exports = hullPath2;
  }
});

// node_modules/@jscad/modeling/src/operations/hulls/hullGeom2.js
var require_hullGeom2 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/hulls/hullGeom2.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var geom2 = require_geom2();
    var hullPoints2 = require_hullPoints2();
    var toUniquePoints = require_toUniquePoints();
    var hullGeom2 = (...geometries) => {
      geometries = flatten(geometries);
      const unique = toUniquePoints(geometries);
      const hullPoints = hullPoints2(unique);
      if (hullPoints.length < 3) return geom2.create();
      return geom2.fromPoints(hullPoints);
    };
    module.exports = hullGeom2;
  }
});

// node_modules/@jscad/modeling/src/operations/hulls/hullGeom3.js
var require_hullGeom3 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/hulls/hullGeom3.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var geom34 = require_geom3();
    var toUniquePoints = require_toUniquePoints();
    var hullPoints3 = require_hullPoints3();
    var hullGeom3 = (...geometries) => {
      geometries = flatten(geometries);
      const unique = toUniquePoints(geometries);
      if (unique.length === 0) return geom34.create();
      return geom34.create(hullPoints3(unique));
    };
    module.exports = hullGeom3;
  }
});

// node_modules/@jscad/modeling/src/operations/hulls/hull.js
var require_hull = __commonJS({
  "node_modules/@jscad/modeling/src/operations/hulls/hull.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var areAllShapesTheSameType = require_areAllShapesTheSameType();
    var geom2 = require_geom2();
    var geom34 = require_geom3();
    var path2 = require_path2();
    var hullPath2 = require_hullPath2();
    var hullGeom2 = require_hullGeom2();
    var hullGeom3 = require_hullGeom3();
    var hull = (...geometries) => {
      geometries = flatten(geometries);
      if (geometries.length === 0) throw new Error("wrong number of arguments");
      if (!areAllShapesTheSameType(geometries)) {
        throw new Error("only hulls of the same type are supported");
      }
      const geometry = geometries[0];
      if (path2.isA(geometry)) return hullPath2(geometries);
      if (geom2.isA(geometry)) return hullGeom2(geometries);
      if (geom34.isA(geometry)) return hullGeom3(geometries);
      return geometry;
    };
    module.exports = hull;
  }
});

// node_modules/@jscad/modeling/src/operations/hulls/hullChain.js
var require_hullChain = __commonJS({
  "node_modules/@jscad/modeling/src/operations/hulls/hullChain.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var union2 = require_union();
    var hull = require_hull();
    var hullChain = (...geometries) => {
      geometries = flatten(geometries);
      if (geometries.length < 2) throw new Error("wrong number of arguments");
      const hulls = [];
      for (let i = 1; i < geometries.length; i++) {
        hulls.push(hull(geometries[i - 1], geometries[i]));
      }
      return union2(hulls);
    };
    module.exports = hullChain;
  }
});

// node_modules/@jscad/modeling/src/operations/hulls/index.js
var require_hulls = __commonJS({
  "node_modules/@jscad/modeling/src/operations/hulls/index.js"(exports, module) {
    "use strict";
    module.exports = {
      hull: require_hull(),
      hullChain: require_hullChain(),
      hullPoints2: require_hullPoints2(),
      hullPoints3: require_hullPoints3()
    };
  }
});

// node_modules/@jscad/modeling/src/operations/minkowski/index.js
var require_minkowski = __commonJS({
  "node_modules/@jscad/modeling/src/operations/minkowski/index.js"(exports, module) {
    "use strict";
    module.exports = {
      minkowskiSum: require_minkowskiSum()
    };
  }
});

// node_modules/@jscad/modeling/src/operations/modifiers/snapPolygons.js
var require_snapPolygons = __commonJS({
  "node_modules/@jscad/modeling/src/operations/modifiers/snapPolygons.js"(exports, module) {
    "use strict";
    var vec3 = require_vec3();
    var poly3 = require_poly3();
    var isValidPoly3 = (epsilon, polygon3) => {
      const area = Math.abs(poly3.measureArea(polygon3));
      return Number.isFinite(area) && area > epsilon;
    };
    var snapPolygons = (epsilon, polygons) => {
      let newpolygons = polygons.map((polygon3) => {
        const snapvertices = polygon3.vertices.map((vertice) => vec3.snap(vec3.create(), vertice, epsilon));
        const newvertices = [];
        for (let i = 0; i < snapvertices.length; i++) {
          const j = (i + 1) % snapvertices.length;
          if (!vec3.equals(snapvertices[i], snapvertices[j])) newvertices.push(snapvertices[i]);
        }
        const newpolygon = poly3.create(newvertices);
        if (polygon3.color) newpolygon.color = polygon3.color;
        return newpolygon;
      });
      const epsilonArea = epsilon * epsilon * Math.sqrt(3) / 4;
      newpolygons = newpolygons.filter((polygon3) => isValidPoly3(epsilonArea, polygon3));
      return newpolygons;
    };
    module.exports = snapPolygons;
  }
});

// node_modules/@jscad/modeling/src/operations/modifiers/mergePolygons.js
var require_mergePolygons = __commonJS({
  "node_modules/@jscad/modeling/src/operations/modifiers/mergePolygons.js"(exports, module) {
    "use strict";
    var aboutEqualNormals = require_aboutEqualNormals();
    var vec3 = require_vec3();
    var poly3 = require_poly3();
    var createEdges = (polygon3) => {
      const points = poly3.toPoints(polygon3);
      const edges = [];
      for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        const edge = {
          v1: points[i],
          v2: points[j]
        };
        edges.push(edge);
      }
      for (let i = 0; i < edges.length; i++) {
        const j = (i + 1) % points.length;
        edges[i].next = edges[j];
        edges[j].prev = edges[i];
      }
      return edges;
    };
    var insertEdge = (edges, edge) => {
      const key = `${edge.v1}:${edge.v2}`;
      edges.set(key, edge);
    };
    var deleteEdge = (edges, edge) => {
      const key = `${edge.v1}:${edge.v2}`;
      edges.delete(key);
    };
    var findOppositeEdge = (edges, edge) => {
      const key = `${edge.v2}:${edge.v1}`;
      return edges.get(key);
    };
    var calculateAnglesBetween = (current, opposite, normal) => {
      let v0 = current.prev.v1;
      let v12 = current.prev.v2;
      let v22 = opposite.next.v2;
      const angle1 = calculateAngle(v0, v12, v22, normal);
      v0 = opposite.prev.v1;
      v12 = opposite.prev.v2;
      v22 = current.next.v2;
      const angle2 = calculateAngle(v0, v12, v22, normal);
      return [angle1, angle2];
    };
    var v1 = vec3.create();
    var v2 = vec3.create();
    var calculateAngle = (prevpoint, point, nextpoint, normal) => {
      const d0 = vec3.subtract(v1, point, prevpoint);
      const d1 = vec3.subtract(v2, nextpoint, point);
      vec3.cross(d0, d0, d1);
      return vec3.dot(d0, normal);
    };
    var createPolygonAnd = (edge) => {
      let polygon3;
      const points = [];
      while (edge.next) {
        const next = edge.next;
        points.push(edge.v1);
        edge.v1 = null;
        edge.v2 = null;
        edge.next = null;
        edge.prev = null;
        edge = next;
      }
      if (points.length > 0) polygon3 = poly3.create(points);
      return polygon3;
    };
    var mergeCoplanarPolygons = (sourcepolygons) => {
      if (sourcepolygons.length < 2) return sourcepolygons;
      const normal = sourcepolygons[0].plane;
      const polygons = sourcepolygons.slice();
      const edgeList = /* @__PURE__ */ new Map();
      while (polygons.length > 0) {
        const polygon3 = polygons.shift();
        const edges = createEdges(polygon3);
        for (let i = 0; i < edges.length; i++) {
          const current = edges[i];
          const opposite = findOppositeEdge(edgeList, current);
          if (opposite) {
            const angles = calculateAnglesBetween(current, opposite, normal);
            if (angles[0] >= 0 && angles[1] >= 0) {
              const edge1 = opposite.next;
              const edge2 = current.next;
              current.prev.next = opposite.next;
              current.next.prev = opposite.prev;
              opposite.prev.next = current.next;
              opposite.next.prev = current.prev;
              current.v1 = null;
              current.v2 = null;
              current.next = null;
              current.prev = null;
              deleteEdge(edgeList, opposite);
              opposite.v1 = null;
              opposite.v2 = null;
              opposite.next = null;
              opposite.prev = null;
              const mergeEdges = (list, e1, e2) => {
                const newedge = {
                  v1: e2.v1,
                  v2: e1.v2,
                  next: e1.next,
                  prev: e2.prev
                };
                e2.prev.next = newedge;
                e1.next.prev = newedge;
                deleteEdge(list, e1);
                e1.v1 = null;
                e1.v2 = null;
                e1.next = null;
                e1.prev = null;
                deleteEdge(list, e2);
                e2.v1 = null;
                e2.v2 = null;
                e2.next = null;
                e2.prev = null;
              };
              if (angles[0] === 0) {
                mergeEdges(edgeList, edge1, edge1.prev);
              }
              if (angles[1] === 0) {
                mergeEdges(edgeList, edge2, edge2.prev);
              }
            }
          } else {
            if (current.next) insertEdge(edgeList, current);
          }
        }
      }
      const destpolygons = [];
      edgeList.forEach((edge) => {
        const polygon3 = createPolygonAnd(edge);
        if (polygon3) destpolygons.push(polygon3);
      });
      edgeList.clear();
      return destpolygons;
    };
    var coplanar = (plane1, plane2) => {
      if (Math.abs(plane1[3] - plane2[3]) < 15e-8) {
        return aboutEqualNormals(plane1, plane2);
      }
      return false;
    };
    var mergePolygons = (epsilon, polygons) => {
      const polygonsPerPlane = [];
      polygons.forEach((polygon3) => {
        const mapping = polygonsPerPlane.find((element) => coplanar(element[0], poly3.plane(polygon3)));
        if (mapping) {
          const polygons2 = mapping[1];
          polygons2.push(polygon3);
        } else {
          polygonsPerPlane.push([poly3.plane(polygon3), [polygon3]]);
        }
      });
      let destpolygons = [];
      polygonsPerPlane.forEach((mapping) => {
        const sourcepolygons = mapping[1];
        const retesselayedpolygons = mergeCoplanarPolygons(sourcepolygons);
        destpolygons = destpolygons.concat(retesselayedpolygons);
      });
      return destpolygons;
    };
    module.exports = mergePolygons;
  }
});

// node_modules/@jscad/modeling/src/operations/modifiers/insertTjunctions.js
var require_insertTjunctions = __commonJS({
  "node_modules/@jscad/modeling/src/operations/modifiers/insertTjunctions.js"(exports, module) {
    "use strict";
    var constants = require_constants();
    var vec3 = require_vec3();
    var poly3 = require_poly3();
    var assert = false;
    var getTag = (vertex) => `${vertex}`;
    var addSide = (sidemap, vertextag2sidestart, vertextag2sideend, vertex0, vertex1, polygonindex) => {
      const starttag = getTag(vertex0);
      const endtag = getTag(vertex1);
      if (assert && starttag === endtag) throw new Error("assert failed");
      const newsidetag = `${starttag}/${endtag}`;
      const reversesidetag = `${endtag}/${starttag}`;
      if (sidemap.has(reversesidetag)) {
        deleteSide(sidemap, vertextag2sidestart, vertextag2sideend, vertex1, vertex0, null);
        return null;
      }
      const newsideobj = {
        vertex0,
        vertex1,
        polygonindex
      };
      if (!sidemap.has(newsidetag)) {
        sidemap.set(newsidetag, [newsideobj]);
      } else {
        sidemap.get(newsidetag).push(newsideobj);
      }
      if (vertextag2sidestart.has(starttag)) {
        vertextag2sidestart.get(starttag).push(newsidetag);
      } else {
        vertextag2sidestart.set(starttag, [newsidetag]);
      }
      if (vertextag2sideend.has(endtag)) {
        vertextag2sideend.get(endtag).push(newsidetag);
      } else {
        vertextag2sideend.set(endtag, [newsidetag]);
      }
      return newsidetag;
    };
    var deleteSide = (sidemap, vertextag2sidestart, vertextag2sideend, vertex0, vertex1, polygonindex) => {
      const starttag = getTag(vertex0);
      const endtag = getTag(vertex1);
      const sidetag = `${starttag}/${endtag}`;
      if (assert && !sidemap.has(sidetag)) throw new Error("assert failed");
      let idx = -1;
      const sideobjs = sidemap.get(sidetag);
      for (let i = 0; i < sideobjs.length; i++) {
        const sideobj = sideobjs[i];
        let sidetag2 = getTag(sideobj.vertex0);
        if (sidetag2 !== starttag) continue;
        sidetag2 = getTag(sideobj.vertex1);
        if (sidetag2 !== endtag) continue;
        if (polygonindex !== null) {
          if (sideobj.polygonindex !== polygonindex) continue;
        }
        idx = i;
        break;
      }
      if (assert && idx < 0) throw new Error("assert failed");
      sideobjs.splice(idx, 1);
      if (sideobjs.length === 0) {
        sidemap.delete(sidetag);
      }
      idx = vertextag2sidestart.get(starttag).indexOf(sidetag);
      if (assert && idx < 0) throw new Error("assert failed");
      vertextag2sidestart.get(starttag).splice(idx, 1);
      if (vertextag2sidestart.get(starttag).length === 0) {
        vertextag2sidestart.delete(starttag);
      }
      idx = vertextag2sideend.get(endtag).indexOf(sidetag);
      if (assert && idx < 0) throw new Error("assert failed");
      vertextag2sideend.get(endtag).splice(idx, 1);
      if (vertextag2sideend.get(endtag).length === 0) {
        vertextag2sideend.delete(endtag);
      }
    };
    var insertTjunctions = (polygons) => {
      const sidemap = /* @__PURE__ */ new Map();
      for (let polygonindex = 0; polygonindex < polygons.length; polygonindex++) {
        const polygon3 = polygons[polygonindex];
        const numvertices = polygon3.vertices.length;
        if (numvertices >= 3) {
          let vertex = polygon3.vertices[0];
          let vertextag = getTag(vertex);
          for (let vertexindex = 0; vertexindex < numvertices; vertexindex++) {
            let nextvertexindex = vertexindex + 1;
            if (nextvertexindex === numvertices) nextvertexindex = 0;
            const nextvertex = polygon3.vertices[nextvertexindex];
            const nextvertextag = getTag(nextvertex);
            const sidetag = `${vertextag}/${nextvertextag}`;
            const reversesidetag = `${nextvertextag}/${vertextag}`;
            if (sidemap.has(reversesidetag)) {
              const ar = sidemap.get(reversesidetag);
              ar.splice(-1, 1);
              if (ar.length === 0) {
                sidemap.delete(reversesidetag);
              }
            } else {
              const sideobj = {
                vertex0: vertex,
                vertex1: nextvertex,
                polygonindex
              };
              if (!sidemap.has(sidetag)) {
                sidemap.set(sidetag, [sideobj]);
              } else {
                sidemap.get(sidetag).push(sideobj);
              }
            }
            vertex = nextvertex;
            vertextag = nextvertextag;
          }
        } else {
          console.warn("warning: invalid polygon found during insertTjunctions");
        }
      }
      if (sidemap.size > 0) {
        const vertextag2sidestart = /* @__PURE__ */ new Map();
        const vertextag2sideend = /* @__PURE__ */ new Map();
        const sidesToCheck = /* @__PURE__ */ new Map();
        for (const [sidetag, sideobjs] of sidemap) {
          sidesToCheck.set(sidetag, true);
          sideobjs.forEach((sideobj) => {
            const starttag = getTag(sideobj.vertex0);
            const endtag = getTag(sideobj.vertex1);
            if (vertextag2sidestart.has(starttag)) {
              vertextag2sidestart.get(starttag).push(sidetag);
            } else {
              vertextag2sidestart.set(starttag, [sidetag]);
            }
            if (vertextag2sideend.has(endtag)) {
              vertextag2sideend.get(endtag).push(sidetag);
            } else {
              vertextag2sideend.set(endtag, [sidetag]);
            }
          });
        }
        const newpolygons = polygons.slice(0);
        while (true) {
          if (sidemap.size === 0) break;
          for (const sidetag of sidemap.keys()) {
            sidesToCheck.set(sidetag, true);
          }
          let donesomething = false;
          while (true) {
            const sidetags = Array.from(sidesToCheck.keys());
            if (sidetags.length === 0) break;
            const sidetagtocheck = sidetags[0];
            let donewithside = true;
            if (sidemap.has(sidetagtocheck)) {
              const sideobjs = sidemap.get(sidetagtocheck);
              if (assert && sideobjs.length === 0) throw new Error("assert failed");
              const sideobj = sideobjs[0];
              for (let directionindex = 0; directionindex < 2; directionindex++) {
                const startvertex = directionindex === 0 ? sideobj.vertex0 : sideobj.vertex1;
                const endvertex = directionindex === 0 ? sideobj.vertex1 : sideobj.vertex0;
                const startvertextag = getTag(startvertex);
                const endvertextag = getTag(endvertex);
                let matchingsides = [];
                if (directionindex === 0) {
                  if (vertextag2sideend.has(startvertextag)) {
                    matchingsides = vertextag2sideend.get(startvertextag);
                  }
                } else {
                  if (vertextag2sidestart.has(startvertextag)) {
                    matchingsides = vertextag2sidestart.get(startvertextag);
                  }
                }
                for (let matchingsideindex = 0; matchingsideindex < matchingsides.length; matchingsideindex++) {
                  const matchingsidetag = matchingsides[matchingsideindex];
                  const matchingside = sidemap.get(matchingsidetag)[0];
                  const matchingsidestartvertex = directionindex === 0 ? matchingside.vertex0 : matchingside.vertex1;
                  const matchingsideendvertex = directionindex === 0 ? matchingside.vertex1 : matchingside.vertex0;
                  const matchingsidestartvertextag = getTag(matchingsidestartvertex);
                  const matchingsideendvertextag = getTag(matchingsideendvertex);
                  if (assert && matchingsideendvertextag !== startvertextag) throw new Error("assert failed");
                  if (matchingsidestartvertextag === endvertextag) {
                    deleteSide(sidemap, vertextag2sidestart, vertextag2sideend, startvertex, endvertex, null);
                    deleteSide(sidemap, vertextag2sidestart, vertextag2sideend, endvertex, startvertex, null);
                    donewithside = false;
                    directionindex = 2;
                    donesomething = true;
                    break;
                  } else {
                    const startpos = startvertex;
                    const endpos = endvertex;
                    const checkpos = matchingsidestartvertex;
                    const direction = vec3.subtract(vec3.create(), checkpos, startpos);
                    const t = vec3.dot(vec3.subtract(vec3.create(), endpos, startpos), direction) / vec3.dot(direction, direction);
                    if (t > 0 && t < 1) {
                      const closestpoint = vec3.scale(vec3.create(), direction, t);
                      vec3.add(closestpoint, closestpoint, startpos);
                      const distancesquared = vec3.squaredDistance(closestpoint, endpos);
                      if (distancesquared < constants.EPS * constants.EPS) {
                        const polygonindex = matchingside.polygonindex;
                        const polygon3 = newpolygons[polygonindex];
                        const insertionvertextag = getTag(matchingside.vertex1);
                        let insertionvertextagindex = -1;
                        for (let i = 0; i < polygon3.vertices.length; i++) {
                          if (getTag(polygon3.vertices[i]) === insertionvertextag) {
                            insertionvertextagindex = i;
                            break;
                          }
                        }
                        if (assert && insertionvertextagindex < 0) throw new Error("assert failed");
                        const newvertices = polygon3.vertices.slice(0);
                        newvertices.splice(insertionvertextagindex, 0, endvertex);
                        const newpolygon = poly3.create(newvertices);
                        newpolygons[polygonindex] = newpolygon;
                        deleteSide(sidemap, vertextag2sidestart, vertextag2sideend, matchingside.vertex0, matchingside.vertex1, polygonindex);
                        const newsidetag1 = addSide(sidemap, vertextag2sidestart, vertextag2sideend, matchingside.vertex0, endvertex, polygonindex);
                        const newsidetag2 = addSide(sidemap, vertextag2sidestart, vertextag2sideend, endvertex, matchingside.vertex1, polygonindex);
                        if (newsidetag1 !== null) sidesToCheck.set(newsidetag1, true);
                        if (newsidetag2 !== null) sidesToCheck.set(newsidetag2, true);
                        donewithside = false;
                        directionindex = 2;
                        donesomething = true;
                        break;
                      }
                    }
                  }
                }
              }
            }
            if (donewithside) {
              sidesToCheck.delete(sidetagtocheck);
            }
          }
          if (!donesomething) break;
        }
        polygons = newpolygons;
      }
      sidemap.clear();
      return polygons;
    };
    module.exports = insertTjunctions;
  }
});

// node_modules/@jscad/modeling/src/operations/modifiers/triangulatePolygons.js
var require_triangulatePolygons = __commonJS({
  "node_modules/@jscad/modeling/src/operations/modifiers/triangulatePolygons.js"(exports, module) {
    "use strict";
    var vec3 = require_vec3();
    var poly3 = require_poly3();
    var triangulatePolygon = (epsilon, polygon3, triangles) => {
      const nv = polygon3.vertices.length;
      if (nv > 3) {
        if (nv > 4) {
          const midpoint = [0, 0, 0];
          polygon3.vertices.forEach((vertice) => vec3.add(midpoint, midpoint, vertice));
          vec3.snap(midpoint, vec3.divide(midpoint, midpoint, [nv, nv, nv]), epsilon);
          for (let i = 0; i < nv; i++) {
            const poly = poly3.create([midpoint, polygon3.vertices[i], polygon3.vertices[(i + 1) % nv]]);
            if (polygon3.color) poly.color = polygon3.color;
            triangles.push(poly);
          }
          return;
        }
        const poly0 = poly3.create([polygon3.vertices[0], polygon3.vertices[1], polygon3.vertices[2]]);
        const poly1 = poly3.create([polygon3.vertices[0], polygon3.vertices[2], polygon3.vertices[3]]);
        if (polygon3.color) {
          poly0.color = polygon3.color;
          poly1.color = polygon3.color;
        }
        triangles.push(poly0, poly1);
        return;
      }
      triangles.push(polygon3);
    };
    var triangulatePolygons = (epsilon, polygons) => {
      const triangles = [];
      polygons.forEach((polygon3) => {
        triangulatePolygon(epsilon, polygon3, triangles);
      });
      return triangles;
    };
    module.exports = triangulatePolygons;
  }
});

// node_modules/@jscad/modeling/src/operations/modifiers/generalize.js
var require_generalize = __commonJS({
  "node_modules/@jscad/modeling/src/operations/modifiers/generalize.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var measureEpsilon = require_measureEpsilon();
    var geom2 = require_geom2();
    var geom34 = require_geom3();
    var path2 = require_path2();
    var snapPolygons = require_snapPolygons();
    var mergePolygons = require_mergePolygons();
    var insertTjunctions = require_insertTjunctions();
    var triangulatePolygons = require_triangulatePolygons();
    var generalizePath2 = (options, geometry) => geometry;
    var generalizeGeom2 = (options, geometry) => geometry;
    var generalizeGeom3 = (options, geometry) => {
      const defaults = {
        snap: false,
        simplify: false,
        triangulate: false
      };
      const { snap, simplify, triangulate } = Object.assign({}, defaults, options);
      const epsilon = measureEpsilon(geometry);
      let polygons = geom34.toPolygons(geometry);
      if (snap) {
        polygons = snapPolygons(epsilon, polygons);
      }
      if (simplify) {
        polygons = mergePolygons(epsilon, polygons);
      }
      if (triangulate) {
        polygons = insertTjunctions(polygons);
        polygons = triangulatePolygons(epsilon, polygons);
      }
      const clone = Object.assign({}, geometry);
      clone.polygons = polygons;
      return clone;
    };
    var generalize = (options, ...geometries) => {
      geometries = flatten(geometries);
      if (geometries.length === 0) throw new Error("wrong number of arguments");
      const results = geometries.map((geometry) => {
        if (path2.isA(geometry)) return generalizePath2(options, geometry);
        if (geom2.isA(geometry)) return generalizeGeom2(options, geometry);
        if (geom34.isA(geometry)) return generalizeGeom3(options, geometry);
        throw new Error("invalid geometry");
      });
      return results.length === 1 ? results[0] : results;
    };
    module.exports = generalize;
  }
});

// node_modules/@jscad/modeling/src/operations/modifiers/snap.js
var require_snap3 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/modifiers/snap.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var vec2 = require_vec2();
    var geom2 = require_geom2();
    var geom34 = require_geom3();
    var path2 = require_path2();
    var measureEpsilon = require_measureEpsilon();
    var snapPolygons = require_snapPolygons();
    var snapPath2 = (geometry) => {
      const epsilon = measureEpsilon(geometry);
      const points = path2.toPoints(geometry);
      const newpoints = points.map((point) => vec2.snap(vec2.create(), point, epsilon));
      return path2.create(newpoints);
    };
    var snapGeom2 = (geometry) => {
      const epsilon = measureEpsilon(geometry);
      const sides = geom2.toSides(geometry);
      let newsides = sides.map((side) => [vec2.snap(vec2.create(), side[0], epsilon), vec2.snap(vec2.create(), side[1], epsilon)]);
      newsides = newsides.filter((side) => !vec2.equals(side[0], side[1]));
      return geom2.create(newsides);
    };
    var snapGeom3 = (geometry) => {
      const epsilon = measureEpsilon(geometry);
      const polygons = geom34.toPolygons(geometry);
      const newpolygons = snapPolygons(epsilon, polygons);
      return geom34.create(newpolygons);
    };
    var snap = (...geometries) => {
      geometries = flatten(geometries);
      if (geometries.length === 0) throw new Error("wrong number of arguments");
      const results = geometries.map((geometry) => {
        if (path2.isA(geometry)) return snapPath2(geometry);
        if (geom2.isA(geometry)) return snapGeom2(geometry);
        if (geom34.isA(geometry)) return snapGeom3(geometry);
        return geometry;
      });
      return results.length === 1 ? results[0] : results;
    };
    module.exports = snap;
  }
});

// node_modules/@jscad/modeling/src/operations/modifiers/index.js
var require_modifiers = __commonJS({
  "node_modules/@jscad/modeling/src/operations/modifiers/index.js"(exports, module) {
    "use strict";
    module.exports = {
      generalize: require_generalize(),
      snap: require_snap3(),
      retessellate: require_retessellate()
    };
  }
});

// node_modules/@jscad/modeling/src/utils/padArrayToLength.js
var require_padArrayToLength = __commonJS({
  "node_modules/@jscad/modeling/src/utils/padArrayToLength.js"(exports, module) {
    "use strict";
    var padArrayToLength = (anArray, padding, targetLength) => {
      anArray = anArray.slice();
      while (anArray.length < targetLength) {
        anArray.push(padding);
      }
      return anArray;
    };
    module.exports = padArrayToLength;
  }
});

// node_modules/@jscad/modeling/src/operations/transforms/align.js
var require_align = __commonJS({
  "node_modules/@jscad/modeling/src/operations/transforms/align.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var padArrayToLength = require_padArrayToLength();
    var measureAggregateBoundingBox = require_measureAggregateBoundingBox();
    var { translate: translate3 } = require_translate2();
    var validateOptions = (options) => {
      if (!Array.isArray(options.modes) || options.modes.length > 3) throw new Error("align(): modes must be an array of length <= 3");
      options.modes = padArrayToLength(options.modes, "none", 3);
      if (options.modes.filter((mode) => ["center", "max", "min", "none"].includes(mode)).length !== 3) throw new Error('align(): all modes must be one of "center", "max" or "min"');
      if (!Array.isArray(options.relativeTo) || options.relativeTo.length > 3) throw new Error("align(): relativeTo must be an array of length <= 3");
      options.relativeTo = padArrayToLength(options.relativeTo, 0, 3);
      if (options.relativeTo.filter((alignVal) => Number.isFinite(alignVal) || alignVal == null).length !== 3) throw new Error("align(): all relativeTo values must be a number, or null.");
      if (typeof options.grouped !== "boolean") throw new Error("align(): grouped must be a boolean value.");
      return options;
    };
    var populateRelativeToFromBounds = (relativeTo, modes, bounds) => {
      for (let i = 0; i < 3; i++) {
        if (relativeTo[i] == null) {
          if (modes[i] === "center") {
            relativeTo[i] = (bounds[0][i] + bounds[1][i]) / 2;
          } else if (modes[i] === "max") {
            relativeTo[i] = bounds[1][i];
          } else if (modes[i] === "min") {
            relativeTo[i] = bounds[0][i];
          }
        }
      }
      return relativeTo;
    };
    var alignGeometries = (geometry, modes, relativeTo) => {
      const bounds = measureAggregateBoundingBox(geometry);
      const translation = [0, 0, 0];
      for (let i = 0; i < 3; i++) {
        if (modes[i] === "center") {
          translation[i] = relativeTo[i] - (bounds[0][i] + bounds[1][i]) / 2;
        } else if (modes[i] === "max") {
          translation[i] = relativeTo[i] - bounds[1][i];
        } else if (modes[i] === "min") {
          translation[i] = relativeTo[i] - bounds[0][i];
        }
      }
      return translate3(translation, geometry);
    };
    var align = (options, ...geometries) => {
      const defaults = {
        modes: ["center", "center", "min"],
        relativeTo: [0, 0, 0],
        grouped: false
      };
      options = Object.assign({}, defaults, options);
      options = validateOptions(options);
      let { modes, relativeTo, grouped } = options;
      geometries = flatten(geometries);
      if (geometries.length === 0) throw new Error("align(): No geometries were provided to act upon");
      if (relativeTo.filter((val) => val == null).length) {
        const bounds = measureAggregateBoundingBox(geometries);
        relativeTo = populateRelativeToFromBounds(relativeTo, modes, bounds);
      }
      if (grouped) {
        geometries = alignGeometries(geometries, modes, relativeTo);
      } else {
        geometries = geometries.map((geometry) => alignGeometries(geometry, modes, relativeTo));
      }
      return geometries.length === 1 ? geometries[0] : geometries;
    };
    module.exports = align;
  }
});

// node_modules/@jscad/modeling/src/operations/transforms/center.js
var require_center = __commonJS({
  "node_modules/@jscad/modeling/src/operations/transforms/center.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var geom2 = require_geom2();
    var geom34 = require_geom3();
    var path2 = require_path2();
    var measureBoundingBox3 = require_measureBoundingBox2();
    var { translate: translate3 } = require_translate2();
    var centerGeometry = (options, object) => {
      const defaults = {
        axes: [true, true, true],
        relativeTo: [0, 0, 0]
      };
      const { axes, relativeTo } = Object.assign({}, defaults, options);
      const bounds = measureBoundingBox3(object);
      const offset = [0, 0, 0];
      if (axes[0]) offset[0] = relativeTo[0] - (bounds[0][0] + (bounds[1][0] - bounds[0][0]) / 2);
      if (axes[1]) offset[1] = relativeTo[1] - (bounds[0][1] + (bounds[1][1] - bounds[0][1]) / 2);
      if (axes[2]) offset[2] = relativeTo[2] - (bounds[0][2] + (bounds[1][2] - bounds[0][2]) / 2);
      return translate3(offset, object);
    };
    var center = (options, ...objects) => {
      const defaults = {
        axes: [true, true, true],
        relativeTo: [0, 0, 0]
        // TODO: Add additional 'methods' of centering: midpoint, centroid
      };
      const { axes, relativeTo } = Object.assign({}, defaults, options);
      objects = flatten(objects);
      if (objects.length === 0) throw new Error("wrong number of arguments");
      if (relativeTo.length !== 3) throw new Error("relativeTo must be an array of length 3");
      options = { axes, relativeTo };
      const results = objects.map((object) => {
        if (path2.isA(object)) return centerGeometry(options, object);
        if (geom2.isA(object)) return centerGeometry(options, object);
        if (geom34.isA(object)) return centerGeometry(options, object);
        return object;
      });
      return results.length === 1 ? results[0] : results;
    };
    var centerX = (...objects) => center({ axes: [true, false, false] }, objects);
    var centerY = (...objects) => center({ axes: [false, true, false] }, objects);
    var centerZ = (...objects) => center({ axes: [false, false, true] }, objects);
    module.exports = {
      center,
      centerX,
      centerY,
      centerZ
    };
  }
});

// node_modules/@jscad/modeling/src/operations/transforms/scale.js
var require_scale4 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/transforms/scale.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var mat4 = require_mat4();
    var geom2 = require_geom2();
    var geom34 = require_geom3();
    var path2 = require_path2();
    var scale = (factors, ...objects) => {
      if (!Array.isArray(factors)) throw new Error("factors must be an array");
      objects = flatten(objects);
      if (objects.length === 0) throw new Error("wrong number of arguments");
      factors = factors.slice();
      while (factors.length < 3) factors.push(1);
      if (factors[0] <= 0 || factors[1] <= 0 || factors[2] <= 0) throw new Error("factors must be positive");
      const matrix = mat4.fromScaling(mat4.create(), factors);
      const results = objects.map((object) => {
        if (path2.isA(object)) return path2.transform(matrix, object);
        if (geom2.isA(object)) return geom2.transform(matrix, object);
        if (geom34.isA(object)) return geom34.transform(matrix, object);
        return object;
      });
      return results.length === 1 ? results[0] : results;
    };
    var scaleX = (factor, ...objects) => scale([factor, 1, 1], objects);
    var scaleY = (factor, ...objects) => scale([1, factor, 1], objects);
    var scaleZ = (factor, ...objects) => scale([1, 1, factor], objects);
    module.exports = {
      scale,
      scaleX,
      scaleY,
      scaleZ
    };
  }
});

// node_modules/@jscad/modeling/src/operations/transforms/transform.js
var require_transform12 = __commonJS({
  "node_modules/@jscad/modeling/src/operations/transforms/transform.js"(exports, module) {
    "use strict";
    var flatten = require_flatten();
    var geom2 = require_geom2();
    var geom34 = require_geom3();
    var path2 = require_path2();
    var transform = (matrix, ...objects) => {
      objects = flatten(objects);
      if (objects.length === 0) throw new Error("wrong number of arguments");
      const results = objects.map((object) => {
        if (path2.isA(object)) return path2.transform(matrix, object);
        if (geom2.isA(object)) return geom2.transform(matrix, object);
        if (geom34.isA(object)) return geom34.transform(matrix, object);
        return object;
      });
      return results.length === 1 ? results[0] : results;
    };
    module.exports = transform;
  }
});

// node_modules/@jscad/modeling/src/operations/transforms/index.js
var require_transforms = __commonJS({
  "node_modules/@jscad/modeling/src/operations/transforms/index.js"(exports, module) {
    "use strict";
    module.exports = {
      align: require_align(),
      center: require_center().center,
      centerX: require_center().centerX,
      centerY: require_center().centerY,
      centerZ: require_center().centerZ,
      mirror: require_mirror().mirror,
      mirrorX: require_mirror().mirrorX,
      mirrorY: require_mirror().mirrorY,
      mirrorZ: require_mirror().mirrorZ,
      rotate: require_rotate3().rotate,
      rotateX: require_rotate3().rotateX,
      rotateY: require_rotate3().rotateY,
      rotateZ: require_rotate3().rotateZ,
      scale: require_scale4().scale,
      scaleX: require_scale4().scaleX,
      scaleY: require_scale4().scaleY,
      scaleZ: require_scale4().scaleZ,
      transform: require_transform12(),
      translate: require_translate2().translate,
      translateX: require_translate2().translateX,
      translateY: require_translate2().translateY,
      translateZ: require_translate2().translateZ
    };
  }
});

// node_modules/@jscad/modeling/src/index.js
var require_src = __commonJS({
  "node_modules/@jscad/modeling/src/index.js"(exports, module) {
    "use strict";
    module.exports = {
      colors: require_colors(),
      curves: require_curves(),
      geometries: require_geometries(),
      maths: require_maths(),
      measurements: require_measurements(),
      primitives: require_primitives(),
      text: require_text(),
      utils: require_utils2(),
      booleans: require_booleans(),
      expansions: require_expansions(),
      extrusions: require_extrusions(),
      hulls: require_hulls(),
      minkowski: require_minkowski(),
      modifiers: require_modifiers(),
      transforms: require_transforms()
    };
  }
});

// lib/converters/circuit-to-3d.ts
import { cju, findBoundsAndCenter } from "@tscircuit/circuit-json-util";

// lib/loaders/footprinter.ts
var jscadModeling = __toESM(require_src(), 1);
import { getJscadModelForFootprint } from "jscad-electronics/vanilla";
import { convertJscadModelToGltf } from "jscad-to-gltf";

// lib/utils/coordinate-transform.ts
function applyCoordinateTransform(point, config) {
  let { x, y, z } = point;
  if (config.axisMapping) {
    const original = { x, y, z };
    if (config.axisMapping.x) {
      x = getAxisValue(original, config.axisMapping.x);
    }
    if (config.axisMapping.y) {
      y = getAxisValue(original, config.axisMapping.y);
    }
    if (config.axisMapping.z) {
      z = getAxisValue(original, config.axisMapping.z);
    }
  }
  x *= config.flipX ?? 1;
  y *= config.flipY ?? 1;
  z *= config.flipZ ?? 1;
  if (config.rotation) {
    if (config.rotation.x) {
      const rad = config.rotation.x * Math.PI / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const newY = y * cos - z * sin;
      const newZ = y * sin + z * cos;
      y = newY;
      z = newZ;
    }
    if (config.rotation.y) {
      const rad = config.rotation.y * Math.PI / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const newX = x * cos + z * sin;
      const newZ = -x * sin + z * cos;
      x = newX;
      z = newZ;
    }
    if (config.rotation.z) {
      const rad = config.rotation.z * Math.PI / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const newX = x * cos - y * sin;
      const newY = x * sin + y * cos;
      x = newX;
      y = newY;
    }
  }
  return { x, y, z };
}
function getAxisValue(original, mapping) {
  switch (mapping) {
    case "x":
      return original.x;
    case "y":
      return original.y;
    case "z":
      return original.z;
    case "-x":
      return -original.x;
    case "-y":
      return -original.y;
    case "-z":
      return -original.z;
    default:
      return 0;
  }
}
function transformTriangles(triangles, config) {
  return triangles.map((triangle) => ({
    ...triangle,
    vertices: triangle.vertices.map(
      (v) => applyCoordinateTransform(v, config)
    ),
    normal: applyCoordinateTransform(triangle.normal, config)
  }));
}
var COORDINATE_TRANSFORMS = {
  // Default: Z-up to Y-up (current STL behavior)
  Z_UP_TO_Y_UP: {
    axisMapping: { x: "x", y: "-z", z: "y" }
  },
  // For models where Z+ should point "out of top of board"
  Z_OUT_OF_TOP: {
    axisMapping: { x: "x", y: "z", z: "-y" }
  },
  // STEP models need Y/Z remap without the extra 180-degree board-direction flip.
  STEP_INVERTED: {
    axisMapping: { x: "x", y: "z", z: "y" }
  },
  // USB port fix: flip to top of board (flip Y axis after Z-up conversion)
  USB_PORT_FIX: {
    flipY: -1
  },
  // Combined: Z-up to Y-up + USB port fix (flip Z to face outward)
  Z_UP_TO_Y_UP_USB_FIX: {
    axisMapping: { x: "x", y: "-z", z: "y" },
    flipZ: -1
  },
  // No transformation
  IDENTITY: {},
  // Additional test orientations for USB port
  TEST_ROTATE_X_90: {
    axisMapping: { x: "x", y: "-z", z: "y" },
    rotation: { x: 90 }
  },
  TEST_ROTATE_X_270: {
    axisMapping: { x: "x", y: "-z", z: "y" },
    rotation: { x: 270 }
  },
  TEST_ROTATE_Y_90: {
    axisMapping: { x: "x", y: "-z", z: "y" },
    rotation: { y: 90 }
  },
  TEST_ROTATE_Y_270: {
    axisMapping: { x: "x", y: "-z", z: "y" },
    rotation: { y: 270 }
  },
  TEST_ROTATE_Z_90: {
    axisMapping: { x: "x", y: "-z", z: "y" },
    rotation: { z: 90 }
  },
  TEST_ROTATE_Z_270: {
    axisMapping: { x: "x", y: "-z", z: "y" },
    rotation: { z: 270 }
  },
  // Flip combinations
  TEST_FLIP_X: {
    axisMapping: { x: "x", y: "-z", z: "y" },
    flipX: -1
  },
  TEST_FLIP_Z: {
    axisMapping: { x: "x", y: "-z", z: "y" },
    flipZ: -1
  },
  FOOTPRINTER_MODEL_TRANSFORM: {
    axisMapping: { x: "x", y: "-z", z: "y" },
    flipX: -1,
    rotation: { x: 180, y: 180 }
  },
  // OBJ models: Z-up to Y-up with Y→Z (no negation to preserve winding order)
  OBJ_Z_UP_TO_Y_UP: {
    axisMapping: { x: "x", y: "z", z: "y" }
  }
};

// lib/utils/gltf-node-transforms.ts
function applyQuaternion(p, q) {
  const [qx, qy, qz, qw] = q;
  const { x, y, z } = p;
  const ix = qw * x + qy * z - qz * y;
  const iy = qw * y + qz * x - qx * z;
  const iz = qw * z + qx * y - qy * x;
  const iw = -qx * x - qy * y - qz * z;
  return {
    x: ix * qw + iw * -qx + iy * -qz - iz * -qy,
    y: iy * qw + iw * -qy + iz * -qx - ix * -qz,
    z: iz * qw + iw * -qz + ix * -qy - iy * -qx
  };
}
function applyNodeTransform(p, node) {
  let result = { ...p };
  if (node.scale) {
    result = {
      x: result.x * node.scale[0],
      y: result.y * node.scale[1],
      z: result.z * node.scale[2]
    };
  }
  if (node.rotation) {
    result = applyQuaternion(
      result,
      node.rotation
    );
  }
  if (node.translation) {
    result = {
      x: result.x + node.translation[0],
      y: result.y + node.translation[1],
      z: result.z + node.translation[2]
    };
  }
  return result;
}
function buildMeshTransforms(gltf) {
  const meshTransforms = /* @__PURE__ */ new Map();
  if (!gltf.nodes) return meshTransforms;
  function processNode(nodeIndex, parentTransforms) {
    const node = gltf.nodes[nodeIndex];
    if (!node) return;
    const currentTransforms = [...parentTransforms];
    if (node.translation || node.rotation || node.scale) {
      currentTransforms.push({
        translation: node.translation,
        rotation: node.rotation,
        scale: node.scale
      });
    }
    if (node.mesh !== void 0) {
      meshTransforms.set(node.mesh, currentTransforms);
    }
    if (node.children) {
      for (const childIndex of node.children) {
        processNode(childIndex, currentTransforms);
      }
    }
  }
  if (gltf.scenes && gltf.scenes[0]?.nodes) {
    for (const rootNodeIndex of gltf.scenes[0].nodes) {
      processNode(rootNodeIndex, []);
    }
  }
  return meshTransforms;
}

// lib/loaders/fetch-with-timeout.ts
var DEFAULT_FETCH_TIMEOUT_MS = 3e4;
async function fetchWithTimeout(url, {
  authHeaders,
  timeoutMs = DEFAULT_FETCH_TIMEOUT_MS
} = {}) {
  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  try {
    return await fetch(url, {
      headers: authHeaders,
      signal: controller.signal
    });
  } catch (error) {
    if (timedOut) {
      throw new Error(`Request timed out after ${timeoutMs}ms: ${url}`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// lib/loaders/resolve-model-url.ts
var URL_SCHEME_REGEX = /^[a-zA-Z][a-zA-Z\d+.-]*:\/\//;
var WINDOWS_ABSOLUTE_PATH_REGEX = /^[A-Za-z]:[\\/]/;
var isNodeRuntime = typeof process !== "undefined" && Boolean(process.versions?.node);
function ensureTrailingSlash(url) {
  return url.endsWith("/") ? url : `${url}/`;
}
function normalizeWindowsPath(path) {
  return path.replace(/\\/g, "/");
}
function toFileUrlFromAbsolutePath(path) {
  if (WINDOWS_ABSOLUTE_PATH_REGEX.test(path)) {
    const normalized = normalizeWindowsPath(path);
    return `file:///${normalized}`;
  }
  return `file://${path}`;
}
function extractPackageInfoFromNodeModulesPath(requestPath) {
  let path = requestPath.replace(/^\/?(\.\/)?/, "");
  if (!path.startsWith("node_modules/")) {
    return null;
  }
  path = path.slice("node_modules/".length);
  let packageName;
  let filePath;
  if (path.startsWith("@")) {
    const parts = path.split("/");
    if (parts.length < 3) {
      return null;
    }
    const scope = parts[0];
    const scopedName = parts[1];
    filePath = parts.slice(2).join("/");
    if (scope === "@tsci" && scopedName.includes(".")) {
      const dotIndex = scopedName.indexOf(".");
      const author = scopedName.slice(0, dotIndex);
      const pkg = scopedName.slice(dotIndex + 1);
      packageName = `@${author}/${pkg}`;
    } else {
      packageName = `${scope}/${scopedName}`;
    }
  } else {
    const parts = path.split("/");
    if (parts.length < 2) {
      return null;
    }
    packageName = parts[0];
    filePath = parts.slice(1).join("/");
  }
  if (!packageName || !filePath) {
    return null;
  }
  return { packageName, filePath };
}
function toPackageFilePath(filePath) {
  return filePath.startsWith("dist/") ? filePath : `dist/${filePath}`;
}
function createPackageFileDownloadUrl(projectBaseUrl, packageName, filePath) {
  const baseUrl = new URL(
    "package_files/download",
    ensureTrailingSlash(projectBaseUrl)
  );
  baseUrl.searchParams.set("package_name_with_version", `${packageName}@latest`);
  baseUrl.searchParams.set("file_path", toPackageFilePath(filePath));
  return baseUrl.toString();
}
async function resolveModelUrl(url, projectBaseUrl) {
  if (URL_SCHEME_REGEX.test(url)) {
    return url;
  }
  const nodeModulesInfo = extractPackageInfoFromNodeModulesPath(url);
  if (nodeModulesInfo && projectBaseUrl) {
    return createPackageFileDownloadUrl(
      projectBaseUrl,
      nodeModulesInfo.packageName,
      nodeModulesInfo.filePath
    ).toString();
  }
  if (url.startsWith("/") || WINDOWS_ABSOLUTE_PATH_REGEX.test(url)) {
    return toFileUrlFromAbsolutePath(url);
  }
  if (projectBaseUrl) {
    const baseUrl = ensureTrailingSlash(projectBaseUrl);
    const relative = url.replace(/^\.\//, "");
    return new URL(relative, baseUrl).toString();
  }
  if (isNodeRuntime) {
    const cwd = normalizeWindowsPath(process.cwd());
    const cwdAsBase = ensureTrailingSlash(cwd);
    return new URL(url, `file://${cwdAsBase}`).toString();
  }
  return url;
}

// lib/loaders/glb.ts
var glbCache = /* @__PURE__ */ new Map();
async function loadGLB({
  url,
  transform,
  projectBaseUrl,
  authHeaders
}) {
  const resolvedUrl = await resolveModelUrl(url, projectBaseUrl);
  const cacheKey = `${resolvedUrl}:${JSON.stringify(transform ?? {})}`;
  if (glbCache.has(cacheKey)) {
    return glbCache.get(cacheKey);
  }
  const response = await fetchWithTimeout(resolvedUrl, { authHeaders });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch GLB: ${response.status} ${response.statusText}`
    );
  }
  const buffer = await response.arrayBuffer();
  const mesh = parseGLB(buffer, transform);
  glbCache.set(cacheKey, mesh);
  return mesh;
}
function parseGLB(buffer, transform) {
  const view = new DataView(buffer);
  let offset = 0;
  const magic = view.getUint32(offset, true);
  offset += 4;
  if (magic !== 1179937895) {
    throw new Error("Invalid GLB file: incorrect magic number");
  }
  const version = view.getUint32(offset, true);
  offset += 4;
  if (version !== 2) {
    throw new Error(`Unsupported GLB version: ${version}`);
  }
  const length = view.getUint32(offset, true);
  offset += 4;
  const jsonChunkLength = view.getUint32(offset, true);
  offset += 4;
  const jsonChunkType = view.getUint32(offset, true);
  offset += 4;
  if (jsonChunkType !== 1313821514) {
    throw new Error("Expected JSON chunk");
  }
  const jsonBytes = new Uint8Array(buffer, offset, jsonChunkLength);
  const jsonString = new TextDecoder().decode(jsonBytes);
  const gltf = JSON.parse(jsonString);
  offset += jsonChunkLength;
  let binaryBuffer;
  if (offset < length) {
    const binaryChunkLength = view.getUint32(offset, true);
    offset += 4;
    const binaryChunkType = view.getUint32(offset, true);
    offset += 4;
    if (binaryChunkType === 5130562) {
      binaryBuffer = buffer.slice(offset, offset + binaryChunkLength);
    }
  }
  const triangles = extractTrianglesFromGLTF(gltf, binaryBuffer);
  const finalConfig = transform ?? {
    axisMapping: { x: "x", y: "z", z: "y" }
  };
  const transformedTriangles = transformTriangles(triangles, finalConfig);
  const hasColors = transformedTriangles.some((t) => t.color !== void 0);
  if (hasColors) {
    return convertToOBJMesh(transformedTriangles);
  }
  return {
    triangles: transformedTriangles,
    boundingBox: calculateBoundingBox(transformedTriangles)
  };
}
function convertToOBJMesh(triangles) {
  const colorGroups = /* @__PURE__ */ new Map();
  for (const triangle of triangles) {
    const colorKey = triangle.color ? JSON.stringify(triangle.color) : "default";
    if (!colorGroups.has(colorKey)) {
      colorGroups.set(colorKey, []);
    }
    colorGroups.get(colorKey).push(triangle);
  }
  const materials = /* @__PURE__ */ new Map();
  const materialIndexMap = /* @__PURE__ */ new Map();
  let materialIndex = 0;
  const trianglesWithMaterialIndex = [];
  for (const [colorKey, groupTriangles] of colorGroups) {
    const materialName = `Material_${materialIndex}`;
    materialIndexMap.set(materialName, materialIndex);
    if (colorKey === "default") {
      materials.set(materialName, {
        name: materialName,
        color: [179, 179, 179, 1]
        // 0.7 * 255 = 179
      });
    } else {
      const color = JSON.parse(colorKey);
      materials.set(materialName, {
        name: materialName,
        color
      });
    }
    for (const triangle of groupTriangles) {
      trianglesWithMaterialIndex.push({
        ...triangle,
        materialIndex
      });
    }
    materialIndex++;
  }
  return {
    triangles: trianglesWithMaterialIndex,
    boundingBox: calculateBoundingBox(trianglesWithMaterialIndex),
    materials,
    materialIndexMap
  };
}
function extractTrianglesFromGLTF(gltf, binaryBuffer) {
  const triangles = [];
  if (!gltf.meshes || !gltf.accessors || !gltf.bufferViews) {
    return triangles;
  }
  const meshTransforms = buildMeshTransforms(gltf);
  for (let meshIndex = 0; meshIndex < gltf.meshes.length; meshIndex++) {
    const mesh = gltf.meshes[meshIndex];
    const transforms = meshTransforms.get(meshIndex) || [];
    for (const primitive of mesh.primitives) {
      const mode = primitive.mode ?? 4;
      if (mode !== 4) {
        continue;
      }
      const positionAccessorIndex = primitive.attributes.POSITION;
      if (positionAccessorIndex === void 0) {
        continue;
      }
      const positionAccessor = gltf.accessors[positionAccessorIndex];
      const positions = getAccessorData(
        positionAccessor,
        gltf.bufferViews,
        binaryBuffer
      );
      let normals;
      const normalAccessorIndex = primitive.attributes.NORMAL;
      if (normalAccessorIndex !== void 0) {
        const normalAccessor = gltf.accessors[normalAccessorIndex];
        normals = getAccessorData(
          normalAccessor,
          gltf.bufferViews,
          binaryBuffer
        );
      }
      let vertexColors;
      const colorAccessorIndex = primitive.attributes.COLOR_0;
      if (colorAccessorIndex !== void 0) {
        const colorAccessor = gltf.accessors[colorAccessorIndex];
        vertexColors = getAccessorData(
          colorAccessor,
          gltf.bufferViews,
          binaryBuffer
        );
      }
      let materialColor;
      if (!vertexColors && primitive.material !== void 0 && gltf.materials) {
        const material = gltf.materials[primitive.material];
        if (material?.pbrMetallicRoughness?.baseColorFactor) {
          const factor = material.pbrMetallicRoughness.baseColorFactor;
          materialColor = [
            Math.round(factor[0] * 255),
            Math.round(factor[1] * 255),
            Math.round(factor[2] * 255),
            factor[3]
          ];
        }
      }
      let indices;
      if (primitive.indices !== void 0) {
        const indexAccessor = gltf.accessors[primitive.indices];
        indices = getAccessorData(indexAccessor, gltf.bufferViews, binaryBuffer);
      }
      const vertexCount = positions.length / 3;
      if (indices) {
        for (let i = 0; i < indices.length; i += 3) {
          const i0 = indices[i];
          const i1 = indices[i + 1];
          const i2 = indices[i + 2];
          let v0 = {
            x: positions[i0 * 3],
            y: positions[i0 * 3 + 1],
            z: positions[i0 * 3 + 2]
          };
          let v1 = {
            x: positions[i1 * 3],
            y: positions[i1 * 3 + 1],
            z: positions[i1 * 3 + 2]
          };
          let v2 = {
            x: positions[i2 * 3],
            y: positions[i2 * 3 + 1],
            z: positions[i2 * 3 + 2]
          };
          for (const transform of transforms) {
            v0 = applyNodeTransform(v0, transform);
            v1 = applyNodeTransform(v1, transform);
            v2 = applyNodeTransform(v2, transform);
          }
          let normal;
          if (normals) {
            let n = {
              x: (normals[i0 * 3] + normals[i1 * 3] + normals[i2 * 3]) / 3,
              y: (normals[i0 * 3 + 1] + normals[i1 * 3 + 1] + normals[i2 * 3 + 1]) / 3,
              z: (normals[i0 * 3 + 2] + normals[i1 * 3 + 2] + normals[i2 * 3 + 2]) / 3
            };
            for (const transform of transforms) {
              if (transform.rotation) {
                n = applyQuaternion(
                  n,
                  transform.rotation
                );
              }
            }
            normal = n;
          } else {
            normal = computeNormal(v0, v1, v2);
          }
          let triangleColor;
          if (vertexColors) {
            const componentsPerColor = vertexColors.length / vertexCount;
            if (componentsPerColor === 3) {
              triangleColor = [
                Math.round(
                  (vertexColors[i0 * 3] + vertexColors[i1 * 3] + vertexColors[i2 * 3]) / 3 * 255
                ),
                Math.round(
                  (vertexColors[i0 * 3 + 1] + vertexColors[i1 * 3 + 1] + vertexColors[i2 * 3 + 1]) / 3 * 255
                ),
                Math.round(
                  (vertexColors[i0 * 3 + 2] + vertexColors[i1 * 3 + 2] + vertexColors[i2 * 3 + 2]) / 3 * 255
                ),
                1
              ];
            } else if (componentsPerColor === 4) {
              triangleColor = [
                Math.round(
                  (vertexColors[i0 * 4] + vertexColors[i1 * 4] + vertexColors[i2 * 4]) / 3 * 255
                ),
                Math.round(
                  (vertexColors[i0 * 4 + 1] + vertexColors[i1 * 4 + 1] + vertexColors[i2 * 4 + 1]) / 3 * 255
                ),
                Math.round(
                  (vertexColors[i0 * 4 + 2] + vertexColors[i1 * 4 + 2] + vertexColors[i2 * 4 + 2]) / 3 * 255
                ),
                (vertexColors[i0 * 4 + 3] + vertexColors[i1 * 4 + 3] + vertexColors[i2 * 4 + 3]) / 3
              ];
            }
          } else {
            triangleColor = materialColor;
          }
          triangles.push({
            vertices: [v0, v1, v2],
            normal,
            color: triangleColor
          });
        }
      } else {
        for (let i = 0; i < vertexCount; i += 3) {
          let v0 = {
            x: positions[i * 3],
            y: positions[i * 3 + 1],
            z: positions[i * 3 + 2]
          };
          let v1 = {
            x: positions[(i + 1) * 3],
            y: positions[(i + 1) * 3 + 1],
            z: positions[(i + 1) * 3 + 2]
          };
          let v2 = {
            x: positions[(i + 2) * 3],
            y: positions[(i + 2) * 3 + 1],
            z: positions[(i + 2) * 3 + 2]
          };
          for (const transform of transforms) {
            v0 = applyNodeTransform(v0, transform);
            v1 = applyNodeTransform(v1, transform);
            v2 = applyNodeTransform(v2, transform);
          }
          let normal;
          if (normals) {
            let n = {
              x: (normals[i * 3] + normals[(i + 1) * 3] + normals[(i + 2) * 3]) / 3,
              y: (normals[i * 3 + 1] + normals[(i + 1) * 3 + 1] + normals[(i + 2) * 3 + 1]) / 3,
              z: (normals[i * 3 + 2] + normals[(i + 1) * 3 + 2] + normals[(i + 2) * 3 + 2]) / 3
            };
            for (const transform of transforms) {
              if (transform.rotation) {
                n = applyQuaternion(
                  n,
                  transform.rotation
                );
              }
            }
            normal = n;
          } else {
            normal = computeNormal(v0, v1, v2);
          }
          let triangleColor;
          if (vertexColors) {
            const componentsPerColor = vertexColors.length / vertexCount;
            if (componentsPerColor === 3) {
              triangleColor = [
                Math.round(
                  (vertexColors[i * 3] + vertexColors[(i + 1) * 3] + vertexColors[(i + 2) * 3]) / 3 * 255
                ),
                Math.round(
                  (vertexColors[i * 3 + 1] + vertexColors[(i + 1) * 3 + 1] + vertexColors[(i + 2) * 3 + 1]) / 3 * 255
                ),
                Math.round(
                  (vertexColors[i * 3 + 2] + vertexColors[(i + 1) * 3 + 2] + vertexColors[(i + 2) * 3 + 2]) / 3 * 255
                ),
                1
              ];
            } else if (componentsPerColor === 4) {
              triangleColor = [
                Math.round(
                  (vertexColors[i * 4] + vertexColors[(i + 1) * 4] + vertexColors[(i + 2) * 4]) / 3 * 255
                ),
                Math.round(
                  (vertexColors[i * 4 + 1] + vertexColors[(i + 1) * 4 + 1] + vertexColors[(i + 2) * 4 + 1]) / 3 * 255
                ),
                Math.round(
                  (vertexColors[i * 4 + 2] + vertexColors[(i + 1) * 4 + 2] + vertexColors[(i + 2) * 4 + 2]) / 3 * 255
                ),
                (vertexColors[i * 4 + 3] + vertexColors[(i + 1) * 4 + 3] + vertexColors[(i + 2) * 4 + 3]) / 3
              ];
            }
          } else {
            triangleColor = materialColor;
          }
          triangles.push({
            vertices: [v0, v1, v2],
            normal,
            color: triangleColor
          });
        }
      }
    }
  }
  return triangles;
}
function getAccessorData(accessor, bufferViews, binaryBuffer) {
  const bufferView = bufferViews[accessor.bufferView];
  if (!bufferView || !binaryBuffer) {
    throw new Error("Missing buffer data");
  }
  const byteOffset = (bufferView.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
  const componentType = accessor.componentType;
  const count = accessor.count;
  const type = accessor.type;
  const componentsPerElement = type === "SCALAR" ? 1 : type === "VEC2" ? 2 : type === "VEC3" ? 3 : type === "VEC4" ? 4 : 1;
  const totalComponents = count * componentsPerElement;
  if (componentType === 5126) {
    return new Float32Array(binaryBuffer, byteOffset, totalComponents);
  } else if (componentType === 5123) {
    const uint16Array = new Uint16Array(
      binaryBuffer,
      byteOffset,
      totalComponents
    );
    return new Float32Array(uint16Array);
  } else if (componentType === 5125) {
    const uint32Array = new Uint32Array(
      binaryBuffer,
      byteOffset,
      totalComponents
    );
    return new Float32Array(uint32Array);
  } else if (componentType === 5122) {
    const int16Array = new Int16Array(binaryBuffer, byteOffset, totalComponents);
    return new Float32Array(int16Array);
  } else if (componentType === 5124) {
    const int32Array = new Int32Array(binaryBuffer, byteOffset, totalComponents);
    return new Float32Array(int32Array);
  } else if (componentType === 5121) {
    const uint8Array = new Uint8Array(binaryBuffer, byteOffset, totalComponents);
    return new Float32Array(uint8Array);
  } else if (componentType === 5120) {
    const int8Array = new Int8Array(binaryBuffer, byteOffset, totalComponents);
    return new Float32Array(int8Array);
  }
  throw new Error(`Unsupported component type: ${componentType}`);
}
function computeNormal(v0, v1, v2) {
  const edge1 = {
    x: v1.x - v0.x,
    y: v1.y - v0.y,
    z: v1.z - v0.z
  };
  const edge2 = {
    x: v2.x - v0.x,
    y: v2.y - v0.y,
    z: v2.z - v0.z
  };
  return {
    x: edge1.y * edge2.z - edge1.z * edge2.y,
    y: edge1.z * edge2.x - edge1.x * edge2.z,
    z: edge1.x * edge2.y - edge1.y * edge2.x
  };
}
function calculateBoundingBox(triangles) {
  if (triangles.length === 0) {
    return {
      min: { x: 0, y: 0, z: 0 },
      max: { x: 0, y: 0, z: 0 }
    };
  }
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  for (const triangle of triangles) {
    for (const vertex of triangle.vertices) {
      minX = Math.min(minX, vertex.x);
      minY = Math.min(minY, vertex.y);
      minZ = Math.min(minZ, vertex.z);
      maxX = Math.max(maxX, vertex.x);
      maxY = Math.max(maxY, vertex.y);
      maxZ = Math.max(maxZ, vertex.z);
    }
  }
  return {
    min: { x: minX, y: minY, z: minZ },
    max: { x: maxX, y: maxY, z: maxZ }
  };
}
function clearGLBCache() {
  glbCache.clear();
}

// lib/loaders/footprinter.ts
var footprinterCache = /* @__PURE__ */ new Map();
async function generateFootprinterMesh(footprinterString, transform) {
  const renderedModel = getJscadModelForFootprint(
    footprinterString,
    jscadModeling
  );
  if (!renderedModel?.geometries?.length) {
    return void 0;
  }
  const glbResult = await convertJscadModelToGltf(renderedModel, {
    format: "glb"
  });
  if (!(glbResult.data instanceof ArrayBuffer)) {
    throw new Error("Expected GLB data to be an ArrayBuffer");
  }
  return parseGLB(glbResult.data, transform);
}
function loadFootprinterModel(footprinterString, transform) {
  const cacheKey = `${footprinterString}:${JSON.stringify(transform ?? {})}`;
  if (!footprinterCache.has(cacheKey)) {
    footprinterCache.set(
      cacheKey,
      generateFootprinterMesh(footprinterString, transform).catch((error) => {
        footprinterCache.delete(cacheKey);
        console.warn(
          `Failed to generate footprinter model for ${footprinterString}:`,
          error
        );
        return void 0;
      })
    );
  }
  return footprinterCache.get(cacheKey);
}

// lib/loaders/gltf.ts
async function fetchAsArrayBuffer(url, authHeaders) {
  const response = await fetchWithTimeout(url, { authHeaders });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  return response.arrayBuffer();
}
function dataUriToArrayBuffer(uri) {
  const a = uri.split(",");
  const byteString = atob(a[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return ab;
}
async function fetchGltfAndConvertToGlb(url, authHeaders) {
  const gltfResponse = await fetchWithTimeout(url, { authHeaders });
  if (!gltfResponse.ok) {
    throw new Error(`Failed to fetch glTF file: ${gltfResponse.statusText}`);
  }
  const gltf = await gltfResponse.json();
  const bufferPromises = [];
  if (gltf.buffers) {
    for (const buffer of gltf.buffers) {
      if (buffer.uri) {
        if (buffer.uri.startsWith("data:")) {
          bufferPromises.push(Promise.resolve(dataUriToArrayBuffer(buffer.uri)));
        } else {
          const bufferUrl = new URL(buffer.uri, url).toString();
          bufferPromises.push(fetchAsArrayBuffer(bufferUrl, authHeaders));
        }
      }
    }
  }
  const buffers = await Promise.all(bufferPromises);
  let binaryBuffer = new ArrayBuffer(0);
  if (buffers.length > 0 && buffers[0]) {
    binaryBuffer = buffers[0];
  }
  if (gltf.buffers && gltf.buffers.length > 0) {
    delete gltf.buffers[0].uri;
    gltf.buffers[0].byteLength = binaryBuffer.byteLength;
  }
  const jsonString = JSON.stringify(gltf);
  const jsonBuffer = new TextEncoder().encode(jsonString);
  const jsonPadding = (4 - jsonBuffer.length % 4) % 4;
  const binaryPadding = (4 - binaryBuffer.byteLength % 4) % 4;
  const totalLength = 12 + // header
  (8 + jsonBuffer.length + jsonPadding) + // json chunk
  (binaryBuffer.byteLength > 0 ? 8 + binaryBuffer.byteLength + binaryPadding : 0);
  const glbBuffer = new ArrayBuffer(totalLength);
  const dataView = new DataView(glbBuffer);
  let offset = 0;
  dataView.setUint32(offset, 1179937895, true);
  offset += 4;
  dataView.setUint32(offset, 2, true);
  offset += 4;
  dataView.setUint32(offset, totalLength, true);
  offset += 4;
  dataView.setUint32(offset, jsonBuffer.length + jsonPadding, true);
  offset += 4;
  dataView.setUint32(offset, 1313821514, true);
  offset += 4;
  new Uint8Array(glbBuffer, offset).set(jsonBuffer);
  offset += jsonBuffer.length;
  for (let i = 0; i < jsonPadding; i++) {
    dataView.setUint8(offset++, 32);
  }
  if (binaryBuffer.byteLength > 0) {
    dataView.setUint32(offset, binaryBuffer.byteLength + binaryPadding, true);
    offset += 4;
    dataView.setUint32(offset, 5130562, true);
    offset += 4;
    new Uint8Array(glbBuffer, offset).set(new Uint8Array(binaryBuffer));
    offset += binaryBuffer.byteLength;
    for (let i = 0; i < binaryPadding; i++) {
      dataView.setUint8(offset++, 0);
    }
  }
  return glbBuffer;
}
async function loadGLTF({
  url,
  transform,
  projectBaseUrl,
  authHeaders
}) {
  const resolvedUrl = await resolveModelUrl(url, projectBaseUrl);
  const glb_buffer = await fetchGltfAndConvertToGlb(resolvedUrl, authHeaders);
  return parseGLB(glb_buffer, transform);
}

// lib/loaders/obj.ts
var objCache = /* @__PURE__ */ new Map();
async function loadOBJ({
  url,
  transform,
  projectBaseUrl,
  authHeaders
}) {
  const resolvedUrl = await resolveModelUrl(url, projectBaseUrl);
  const cacheKey = `${resolvedUrl}:${JSON.stringify(transform ?? {})}`;
  if (objCache.has(cacheKey)) {
    return objCache.get(cacheKey);
  }
  const response = await fetchWithTimeout(resolvedUrl, { authHeaders });
  const text = await response.text();
  const mesh = parseOBJ(text, transform);
  objCache.set(cacheKey, mesh);
  return mesh;
}
function parseOBJ(text, transform) {
  const lines = text.split(/\r?\n/);
  const vertices = [];
  const vertexColors = [];
  const normals = [];
  const triangles = [];
  const materials = /* @__PURE__ */ new Map();
  let activeMaterial;
  let materialIndex = 0;
  const materialIndexMap = /* @__PURE__ */ new Map();
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("v ")) {
      const parts = trimmed.split(/\s+/);
      const x = parts[1];
      const y = parts[2];
      const z = parts[3];
      vertices.push({ x: parseFloat(x), y: parseFloat(y), z: parseFloat(z) });
      if (parts.length >= 7) {
        const [rStr, gStr, bStr] = parts.slice(4, 7);
        let r = Number(rStr);
        let g = Number(gStr);
        let b = Number(bStr);
        if (r <= 1 && g <= 1 && b <= 1) {
          r *= 255;
          g *= 255;
          b *= 255;
        }
        vertexColors.push([r, g, b, 1]);
      } else {
        vertexColors.push(void 0);
      }
    } else if (trimmed.startsWith("vn ")) {
      const parts = trimmed.split(/\s+/);
      const x = parts[1];
      const y = parts[2];
      const z = parts[3];
      normals.push({ x: parseFloat(x), y: parseFloat(y), z: parseFloat(z) });
    } else if (trimmed.startsWith("newmtl ")) {
      const name = trimmed.split(/\s+/)[1];
      materials.set(name, { name });
      materialIndexMap.set(name, materialIndex++);
      activeMaterial = name;
    } else if (trimmed.startsWith("Kd ") && activeMaterial) {
      const parts = trimmed.split(/\s+/);
      const rStr = parts[1];
      const gStr = parts[2];
      const bStr = parts[3];
      let r = parseFloat(rStr);
      let g = parseFloat(gStr);
      let b = parseFloat(bStr);
      if (r <= 1 && g <= 1 && b <= 1) {
        r *= 255;
        g *= 255;
        b *= 255;
      }
      const mat = materials.get(activeMaterial);
      mat.color = [r, g, b, 1];
    } else if (trimmed.startsWith("Ka ") && activeMaterial) {
      const parts = trimmed.split(/\s+/);
      const rStr = parts[1];
      const gStr = parts[2];
      const bStr = parts[3];
      let r = parseFloat(rStr);
      let g = parseFloat(gStr);
      let b = parseFloat(bStr);
      if (r <= 1 && g <= 1 && b <= 1) {
        r *= 255;
        g *= 255;
        b *= 255;
      }
      const mat = materials.get(activeMaterial);
      mat.ambient = [r, g, b, 1];
    } else if (trimmed.startsWith("Ks ") && activeMaterial) {
      const parts = trimmed.split(/\s+/);
      const rStr = parts[1];
      const gStr = parts[2];
      const bStr = parts[3];
      let r = parseFloat(rStr);
      let g = parseFloat(gStr);
      let b = parseFloat(bStr);
      if (r <= 1 && g <= 1 && b <= 1) {
        r *= 255;
        g *= 255;
        b *= 255;
      }
      const mat = materials.get(activeMaterial);
      mat.specular = [r, g, b, 1];
    } else if (trimmed.startsWith("Ns ") && activeMaterial) {
      const shininess = parseFloat(trimmed.split(/\s+/)[1]);
      const mat = materials.get(activeMaterial);
      mat.shininess = shininess;
    } else if (trimmed.startsWith("d ") && activeMaterial) {
      const dissolve = parseFloat(trimmed.split(/\s+/)[1]);
      const mat = materials.get(activeMaterial);
      mat.dissolve = dissolve;
    } else if (trimmed === "endmtl") {
      activeMaterial = void 0;
    } else if (trimmed.startsWith("usemtl ")) {
      activeMaterial = trimmed.split(/\s+/)[1];
    } else if (trimmed.startsWith("f ")) {
      const parts = trimmed.slice(2).trim().split(/\s+/);
      const idxs = parts.map((p) => {
        const [vi, ti, ni] = p.split("/");
        return {
          v: parseInt(vi) - 1,
          n: ni ? parseInt(ni) - 1 : void 0
        };
      });
      for (let i = 1; i < idxs.length - 1; i++) {
        const a = idxs[0];
        const b = idxs[i];
        const c = idxs[i + 1];
        const v0 = vertices[a.v];
        const v1 = vertices[b.v];
        const v2 = vertices[c.v];
        let normal;
        if (a.n !== void 0 && normals[a.n]) {
          normal = normals[a.n];
        } else if (b.n !== void 0 && normals[b.n]) {
          normal = normals[b.n];
        } else if (c.n !== void 0 && normals[c.n]) {
          normal = normals[c.n];
        } else {
          const edge1 = {
            x: v1.x - v0.x,
            y: v1.y - v0.y,
            z: v1.z - v0.z
          };
          const edge2 = {
            x: v2.x - v0.x,
            y: v2.y - v0.y,
            z: v2.z - v0.z
          };
          normal = {
            x: edge1.y * edge2.z - edge1.z * edge2.y,
            y: edge1.z * edge2.x - edge1.x * edge2.z,
            z: edge1.x * edge2.y - edge1.y * edge2.x
          };
        }
        const triangle = {
          vertices: [v0, v1, v2],
          normal
        };
        if (activeMaterial && materialIndexMap.has(activeMaterial)) {
          triangle.materialIndex = materialIndexMap.get(activeMaterial);
        }
        const vColor = vertexColors[a.v] ?? vertexColors[b.v] ?? vertexColors[c.v];
        if (vColor) {
          triangle.color = vColor;
        }
        triangles.push(triangle);
      }
    }
  }
  const finalConfig = transform ?? COORDINATE_TRANSFORMS.IDENTITY;
  const transformedTriangles = transformTriangles(triangles, finalConfig);
  return {
    triangles: transformedTriangles,
    boundingBox: calculateBoundingBox2(transformedTriangles),
    materials: materials.size > 0 ? materials : void 0,
    materialIndexMap: materials.size > 0 ? materialIndexMap : void 0
  };
}
function calculateBoundingBox2(triangles) {
  if (triangles.length === 0) {
    return { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } };
  }
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  for (const tri of triangles) {
    for (const v of tri.vertices) {
      if (v.x < minX) minX = v.x;
      if (v.y < minY) minY = v.y;
      if (v.z < minZ) minZ = v.z;
      if (v.x > maxX) maxX = v.x;
      if (v.y > maxY) maxY = v.y;
      if (v.z > maxZ) maxZ = v.z;
    }
  }
  return {
    min: { x: minX, y: minY, z: minZ },
    max: { x: maxX, y: maxY, z: maxZ }
  };
}
function clearOBJCache() {
  objCache.clear();
}

// lib/loaders/step.ts
var stepCache = /* @__PURE__ */ new Map();
var occtModulePromise = null;
async function getOcctModule() {
  if (!occtModulePromise) {
    const occtimportjs = (await import("occt-import-js")).default;
    const isBrowser = typeof window !== "undefined" || typeof self !== "undefined";
    if (isBrowser) {
      let wasmUrl;
      try {
        wasmUrl = (await import("occt-import-js/dist/occt-import-js.wasm?url")).default;
      } catch {
        wasmUrl = void 0;
      }
      occtModulePromise = occtimportjs({
        locateFile: (path) => path.endsWith(".wasm") && wasmUrl ? wasmUrl : path
      });
    } else {
      occtModulePromise = occtimportjs();
    }
  }
  return occtModulePromise;
}
async function loadSTEP({
  url,
  transform,
  projectBaseUrl,
  authHeaders
}) {
  const resolvedUrl = await resolveModelUrl(url, projectBaseUrl);
  const cacheKey = `${resolvedUrl}:${JSON.stringify(transform ?? {})}`;
  if (stepCache.has(cacheKey)) {
    return stepCache.get(cacheKey);
  }
  const response = await fetchWithTimeout(resolvedUrl, { authHeaders });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch STEP file: ${response.status} ${response.statusText}`
    );
  }
  const buffer = await response.arrayBuffer();
  const fileBuffer = new Uint8Array(buffer);
  const occt = await getOcctModule();
  const result = occt.ReadStepFile(fileBuffer, {
    linearUnit: "millimeter"
  });
  if (!result.success) {
    throw new Error("Failed to parse STEP file");
  }
  const mesh = convertOcctResultToMesh(result, transform);
  stepCache.set(cacheKey, mesh);
  return mesh;
}
function convertOcctResultToMesh(result, transform) {
  const allTriangles = [];
  for (const mesh of result.meshes) {
    const positions = mesh.attributes.position.array;
    const normals = mesh.attributes?.normal?.array;
    const indices = mesh.index.array;
    const brepFaces = mesh.brep_faces ?? [];
    const sortedBrepFaces = brepFaces.length > 1 ? [...brepFaces].sort((a, b) => a.first - b.first) : brepFaces;
    const meshColor = mesh.color ? [mesh.color[0], mesh.color[1], mesh.color[2]] : void 0;
    const numTriangles = indices.length / 3;
    let brepFaceIndex = 0;
    for (let t = 0; t < numTriangles; t++) {
      const i0 = indices[t * 3];
      const i1 = indices[t * 3 + 1];
      const i2 = indices[t * 3 + 2];
      const v0 = {
        x: positions[i0 * 3],
        y: positions[i0 * 3 + 1],
        z: positions[i0 * 3 + 2]
      };
      const v1 = {
        x: positions[i1 * 3],
        y: positions[i1 * 3 + 1],
        z: positions[i1 * 3 + 2]
      };
      const v2 = {
        x: positions[i2 * 3],
        y: positions[i2 * 3 + 1],
        z: positions[i2 * 3 + 2]
      };
      let normal;
      if (normals) {
        normal = {
          x: (normals[i0 * 3] + normals[i1 * 3] + normals[i2 * 3]) / 3,
          y: (normals[i0 * 3 + 1] + normals[i1 * 3 + 1] + normals[i2 * 3 + 1]) / 3,
          z: (normals[i0 * 3 + 2] + normals[i1 * 3 + 2] + normals[i2 * 3 + 2]) / 3
        };
      } else {
        normal = computeNormal2(v0, v1, v2);
      }
      let triangleColor;
      let foundFaceColor = false;
      while (brepFaceIndex < sortedBrepFaces.length && t > sortedBrepFaces[brepFaceIndex].last) {
        brepFaceIndex++;
      }
      const currentBrepFace = sortedBrepFaces[brepFaceIndex];
      if (currentBrepFace && t >= currentBrepFace.first && t <= currentBrepFace.last && currentBrepFace.color) {
        triangleColor = [
          Math.round(currentBrepFace.color[0] * 255),
          Math.round(currentBrepFace.color[1] * 255),
          Math.round(currentBrepFace.color[2] * 255),
          1
        ];
        foundFaceColor = true;
      }
      if (!foundFaceColor && meshColor) {
        triangleColor = [
          Math.round(meshColor[0] * 255),
          Math.round(meshColor[1] * 255),
          Math.round(meshColor[2] * 255),
          1
        ];
      }
      allTriangles.push({
        vertices: [v0, v1, v2],
        normal,
        color: triangleColor
      });
    }
  }
  const finalConfig = transform ?? COORDINATE_TRANSFORMS.Z_UP_TO_Y_UP;
  const transformedTriangles = transformTriangles(allTriangles, finalConfig);
  const hasColors = transformedTriangles.some((t) => t.color !== void 0);
  if (hasColors) {
    return convertToOBJMesh2(transformedTriangles);
  }
  return {
    triangles: transformedTriangles,
    boundingBox: calculateBoundingBox3(transformedTriangles)
  };
}
function convertToOBJMesh2(triangles) {
  const colorGroups = /* @__PURE__ */ new Map();
  for (const triangle of triangles) {
    const colorKey = triangle.color ? JSON.stringify(triangle.color) : "default";
    if (!colorGroups.has(colorKey)) {
      colorGroups.set(colorKey, []);
    }
    colorGroups.get(colorKey).push(triangle);
  }
  const materials = /* @__PURE__ */ new Map();
  const materialIndexMap = /* @__PURE__ */ new Map();
  let materialIndex = 0;
  const trianglesWithMaterialIndex = [];
  for (const [colorKey, groupTriangles] of colorGroups) {
    const materialName = `Material_${materialIndex}`;
    materialIndexMap.set(materialName, materialIndex);
    if (colorKey === "default") {
      materials.set(materialName, {
        name: materialName,
        color: [179, 179, 179, 1]
      });
    } else {
      const color = JSON.parse(colorKey);
      materials.set(materialName, {
        name: materialName,
        color
      });
    }
    for (const triangle of groupTriangles) {
      trianglesWithMaterialIndex.push({
        ...triangle,
        materialIndex
      });
    }
    materialIndex++;
  }
  return {
    triangles: trianglesWithMaterialIndex,
    boundingBox: calculateBoundingBox3(trianglesWithMaterialIndex),
    materials,
    materialIndexMap
  };
}
function computeNormal2(v0, v1, v2) {
  const edge1 = {
    x: v1.x - v0.x,
    y: v1.y - v0.y,
    z: v1.z - v0.z
  };
  const edge2 = {
    x: v2.x - v0.x,
    y: v2.y - v0.y,
    z: v2.z - v0.z
  };
  return {
    x: edge1.y * edge2.z - edge1.z * edge2.y,
    y: edge1.z * edge2.x - edge1.x * edge2.z,
    z: edge1.x * edge2.y - edge1.y * edge2.x
  };
}
function calculateBoundingBox3(triangles) {
  if (triangles.length === 0) {
    return {
      min: { x: 0, y: 0, z: 0 },
      max: { x: 0, y: 0, z: 0 }
    };
  }
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  for (const triangle of triangles) {
    for (const vertex of triangle.vertices) {
      minX = Math.min(minX, vertex.x);
      minY = Math.min(minY, vertex.y);
      minZ = Math.min(minZ, vertex.z);
      maxX = Math.max(maxX, vertex.x);
      maxY = Math.max(maxY, vertex.y);
      maxZ = Math.max(maxZ, vertex.z);
    }
  }
  return {
    min: { x: minX, y: minY, z: minZ },
    max: { x: maxX, y: maxY, z: maxZ }
  };
}

// lib/loaders/stl.ts
var stlCache = /* @__PURE__ */ new Map();
async function loadSTL({
  url,
  transform,
  projectBaseUrl,
  authHeaders
}) {
  const resolvedUrl = await resolveModelUrl(url, projectBaseUrl);
  const cacheKey = `${resolvedUrl}:${JSON.stringify(transform ?? {})}`;
  if (stlCache.has(cacheKey)) {
    return stlCache.get(cacheKey);
  }
  const response = await fetchWithTimeout(resolvedUrl, { authHeaders });
  const buffer = await response.arrayBuffer();
  const mesh = parseSTL(buffer, transform);
  stlCache.set(cacheKey, mesh);
  return mesh;
}
function parseSTL(buffer, transform) {
  const view = new DataView(buffer);
  const header = new TextDecoder().decode(buffer.slice(0, 5));
  if (header.toLowerCase() === "solid") {
    return parseASCIISTL(buffer, transform);
  } else {
    return parseBinarySTL(view, transform);
  }
}
function parseASCIISTL(buffer, transform) {
  const text = new TextDecoder().decode(buffer);
  const lines = text.split("\n").map((line) => line.trim());
  const triangles = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line && line.startsWith("facet normal")) {
      const normalMatch = line.match(
        /facet normal\s+([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)\s+([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)\s+([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)/
      );
      const normal = normalMatch ? {
        x: parseFloat(normalMatch[1]),
        y: parseFloat(normalMatch[2]),
        z: parseFloat(normalMatch[3])
      } : { x: 0, y: 0, z: 1 };
      i++;
      const vertices = [];
      while (i < lines.length && lines[i] && !lines[i].startsWith("endfacet")) {
        const vertexLine = lines[i];
        if (vertexLine.startsWith("vertex")) {
          const vertexMatch = vertexLine.match(
            /vertex\s+([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)\s+([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)\s+([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)/
          );
          if (vertexMatch) {
            vertices.push({
              x: parseFloat(vertexMatch[1]),
              y: parseFloat(vertexMatch[2]),
              z: parseFloat(vertexMatch[3])
            });
          }
        }
        i++;
      }
      if (vertices.length === 3) {
        triangles.push({
          vertices: [vertices[0], vertices[1], vertices[2]],
          normal
        });
      }
    }
    i++;
  }
  const finalConfig = transform ?? COORDINATE_TRANSFORMS.Z_UP_TO_Y_UP;
  const transformedTriangles = transformTriangles(triangles, finalConfig);
  return {
    triangles: transformedTriangles,
    boundingBox: calculateBoundingBox4(transformedTriangles)
  };
}
function parseBinarySTL(view, transform) {
  let offset = 80;
  const numTriangles = view.getUint32(offset, true);
  offset += 4;
  const triangles = [];
  for (let i = 0; i < numTriangles; i++) {
    const normal = {
      x: view.getFloat32(offset, true),
      y: view.getFloat32(offset + 4, true),
      z: view.getFloat32(offset + 8, true)
    };
    offset += 12;
    const vertices = [
      {
        x: view.getFloat32(offset, true),
        y: view.getFloat32(offset + 4, true),
        z: view.getFloat32(offset + 8, true)
      },
      {
        x: view.getFloat32(offset + 12, true),
        y: view.getFloat32(offset + 16, true),
        z: view.getFloat32(offset + 20, true)
      },
      {
        x: view.getFloat32(offset + 24, true),
        y: view.getFloat32(offset + 28, true),
        z: view.getFloat32(offset + 32, true)
      }
    ];
    offset += 36;
    offset += 2;
    triangles.push({ vertices, normal });
  }
  const finalConfig = transform ?? COORDINATE_TRANSFORMS.Z_UP_TO_Y_UP;
  const transformedTriangles = transformTriangles(triangles, finalConfig);
  return {
    triangles: transformedTriangles,
    boundingBox: calculateBoundingBox4(transformedTriangles)
  };
}
function calculateBoundingBox4(triangles) {
  if (triangles.length === 0) {
    return {
      min: { x: 0, y: 0, z: 0 },
      max: { x: 0, y: 0, z: 0 }
    };
  }
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  for (const triangle of triangles) {
    for (const vertex of triangle.vertices) {
      minX = Math.min(minX, vertex.x);
      minY = Math.min(minY, vertex.y);
      minZ = Math.min(minZ, vertex.z);
      maxX = Math.max(maxX, vertex.x);
      maxY = Math.max(maxY, vertex.y);
      maxZ = Math.max(maxZ, vertex.z);
    }
  }
  return {
    min: { x: minX, y: minY, z: minZ },
    max: { x: maxX, y: maxY, z: maxZ }
  };
}
function clearSTLCache() {
  stlCache.clear();
}

// lib/utils/mesh-scale.ts
function scalePoint(point, scale) {
  return {
    x: point.x * scale,
    y: point.y * scale,
    z: point.z * scale
  };
}
function scalePointByAxis(point, scale) {
  return {
    x: point.x * scale.x,
    y: point.y * scale.y,
    z: point.z * scale.z
  };
}
function rotatePoint(point, rotationDeg) {
  let { x, y, z } = point;
  if (rotationDeg.x !== 0) {
    const rad = rotationDeg.x * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const newY = y * cos - z * sin;
    const newZ = y * sin + z * cos;
    y = newY;
    z = newZ;
  }
  if (rotationDeg.y !== 0) {
    const rad = rotationDeg.y * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const newX = x * cos + z * sin;
    const newZ = -x * sin + z * cos;
    x = newX;
    z = newZ;
  }
  if (rotationDeg.z !== 0) {
    const rad = rotationDeg.z * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const newX = x * cos - y * sin;
    const newY = x * sin + y * cos;
    x = newX;
    y = newY;
  }
  return { x, y, z };
}
function scaleTriangle(triangle, scale) {
  return {
    ...triangle,
    vertices: triangle.vertices.map((vertex) => scalePoint(vertex, scale))
  };
}
function scaleMesh(mesh, scale) {
  if (!Number.isFinite(scale) || scale === 1) {
    return mesh;
  }
  const scaledTriangles = mesh.triangles.map(
    (triangle) => scaleTriangle(triangle, scale)
  );
  const scaledBoundingBox = {
    min: scalePoint(mesh.boundingBox.min, scale),
    max: scalePoint(mesh.boundingBox.max, scale)
  };
  return {
    ...mesh,
    triangles: scaledTriangles,
    boundingBox: scaledBoundingBox
  };
}
function scaleMeshByAxis(mesh, scale) {
  if (!Number.isFinite(scale.x) || !Number.isFinite(scale.y) || !Number.isFinite(scale.z) || scale.x === 1 && scale.y === 1 && scale.z === 1) {
    return mesh;
  }
  const scaledTriangles = mesh.triangles.map((triangle) => ({
    ...triangle,
    vertices: triangle.vertices.map(
      (vertex) => scalePointByAxis(vertex, scale)
    )
  }));
  return {
    ...mesh,
    triangles: scaledTriangles,
    boundingBox: calculateBoundingBox5(scaledTriangles)
  };
}
function translateMesh(mesh, offset) {
  if (offset.x === 0 && offset.y === 0 && offset.z === 0) {
    return mesh;
  }
  const translatedTriangles = mesh.triangles.map((triangle) => ({
    ...triangle,
    vertices: triangle.vertices.map((vertex) => ({
      x: vertex.x + offset.x,
      y: vertex.y + offset.y,
      z: vertex.z + offset.z
    }))
  }));
  return {
    ...mesh,
    triangles: translatedTriangles,
    boundingBox: {
      min: {
        x: mesh.boundingBox.min.x + offset.x,
        y: mesh.boundingBox.min.y + offset.y,
        z: mesh.boundingBox.min.z + offset.z
      },
      max: {
        x: mesh.boundingBox.max.x + offset.x,
        y: mesh.boundingBox.max.y + offset.y,
        z: mesh.boundingBox.max.z + offset.z
      }
    }
  };
}
function rotateMesh(mesh, rotationDeg) {
  if (rotationDeg.x === 0 && rotationDeg.y === 0 && rotationDeg.z === 0) {
    return mesh;
  }
  const rotatedTriangles = mesh.triangles.map((triangle) => ({
    ...triangle,
    vertices: triangle.vertices.map(
      (vertex) => rotatePoint(vertex, rotationDeg)
    ),
    normal: rotatePoint(triangle.normal, rotationDeg)
  }));
  return {
    ...mesh,
    triangles: rotatedTriangles,
    boundingBox: calculateBoundingBox5(rotatedTriangles)
  };
}
function getBoundingBoxSize(bounds) {
  return {
    x: bounds.max.x - bounds.min.x,
    y: bounds.max.y - bounds.min.y,
    z: bounds.max.z - bounds.min.z
  };
}
function calculateBoundingBox5(triangles) {
  if (triangles.length === 0) {
    return {
      min: { x: 0, y: 0, z: 0 },
      max: { x: 0, y: 0, z: 0 }
    };
  }
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  for (const triangle of triangles) {
    for (const vertex of triangle.vertices) {
      minX = Math.min(minX, vertex.x);
      minY = Math.min(minY, vertex.y);
      minZ = Math.min(minZ, vertex.z);
      maxX = Math.max(maxX, vertex.x);
      maxY = Math.max(maxY, vertex.y);
      maxZ = Math.max(maxZ, vertex.z);
    }
  }
  return {
    min: { x: minX, y: minY, z: minZ },
    max: { x: maxX, y: maxY, z: maxZ }
  };
}

// lib/utils/cad-mesh-placement.ts
function getOrientationRotationForBoardNormal(modelBoardNormalDirection) {
  if (!modelBoardNormalDirection || modelBoardNormalDirection === "z+") {
    return { x: 0, y: 0, z: 0 };
  }
  switch (modelBoardNormalDirection) {
    case "x+":
      return { x: 0, y: 0, z: 90 };
    case "x-":
      return { x: 0, y: 0, z: -90 };
    case "y+":
      return { x: 0, y: 0, z: 0 };
    case "y-":
      return { x: 0, y: 0, z: 180 };
    case "z-":
      return { x: 180, y: 0, z: 0 };
    default:
      return { x: 0, y: 0, z: 0 };
  }
}
function getMeshWithBoardNormalTransform(mesh, modelBoardNormalDirection) {
  return rotateMesh(
    mesh,
    getOrientationRotationForBoardNormal(modelBoardNormalDirection)
  );
}
function getMeshOrigin(cad, meshBounds, options) {
  if (cad.model_origin_position) {
    let origin = {
      x: cad.model_origin_position.x,
      y: cad.model_origin_position.y,
      z: cad.model_origin_position.z
    };
    if (options?.loaderTransform) {
      origin = applyCoordinateTransform(origin, options.loaderTransform);
    }
    if (options?.modelBoardNormalDirection) {
      origin = rotatePoint(
        origin,
        getOrientationRotationForBoardNormal(options.modelBoardNormalDirection)
      );
    }
    return origin;
  }
  return { x: 0, y: 0, z: 0 };
}
function fitMeshToCadBounds(mesh, targetSize, fitMode) {
  const meshSize = getBoundingBoxSize(mesh.boundingBox);
  const safeScale = {
    x: meshSize.x > 0 ? targetSize.x / meshSize.x : 1,
    y: meshSize.y > 0 ? targetSize.y / meshSize.y : 1,
    z: meshSize.z > 0 ? targetSize.z / meshSize.z : 1
  };
  if (fitMode === "fill_bounds") {
    return scaleMeshByAxis(mesh, safeScale);
  }
  const uniformScale = Math.min(safeScale.x, safeScale.y, safeScale.z);
  return scaleMesh(mesh, uniformScale);
}

// lib/utils/get-default-model-transform.ts
function getDefaultModelTransform(cad, options) {
  if (options.coordinateTransform) {
    return options.coordinateTransform;
  }
  const modelBoardNormalDirection = cad.model_board_normal_direction;
  if (modelBoardNormalDirection === "x-" || modelBoardNormalDirection === "y+" || modelBoardNormalDirection === "y-") {
    return COORDINATE_TRANSFORMS.IDENTITY;
  }
  if (options.usingGlbCoordinates) {
    return void 0;
  }
  if (options.hasFootprinterModel) {
    return COORDINATE_TRANSFORMS.FOOTPRINTER_MODEL_TRANSFORM;
  }
  if (options.usingObjFormat) {
    return COORDINATE_TRANSFORMS.OBJ_Z_UP_TO_Y_UP;
  }
  if (options.usingStepFormat) {
    return COORDINATE_TRANSFORMS.STEP_INVERTED;
  }
  return COORDINATE_TRANSFORMS.Z_UP_TO_Y_UP_USB_FIX;
}

// lib/utils/pcb-board-cutouts.ts
var import_extrusions = __toESM(require_extrusions(), 1);
var import_transforms = __toESM(require_transforms(), 1);
var import_primitives = __toESM(require_primitives(), 1);
var DEFAULT_QUALITY_MODE_SEGMENTS = 24;
var REDUCED_QUALITY_MODE_SEGMENTS = 8;
var HIGH_QUALITY_MODE_SEGMENTS = 64;
var HIGH_QUALITY_MODE_REDUCED_SEGMENTS = 16;
var HOLE_COUNT_THRESHOLD = 50;
var toBoardSpaceVec2 = (point, center) => [point.x - center.x, -(point.y - center.y)];
var isFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value);
var getCutoutRotationRadians = (rotation) => {
  if (typeof rotation === "number" && Number.isFinite(rotation)) {
    return rotation * Math.PI / 180;
  }
  if (rotation && typeof rotation === "object") {
    const record = rotation;
    const degreeCandidate = [
      record.deg,
      record.degs,
      record.degree,
      record.degrees,
      record.ccw,
      record.ccw_degrees,
      record.ccw_degree
    ].find(
      (value) => typeof value === "number" && Number.isFinite(value)
    );
    if (degreeCandidate !== void 0) {
      return degreeCandidate * Math.PI / 180;
    }
    const radCandidate = [
      record.rad,
      record.rads,
      record.radian,
      record.radians,
      record.ccw_radians
    ].find(
      (value) => typeof value === "number" && Number.isFinite(value)
    );
    if (radCandidate !== void 0) {
      return radCandidate;
    }
  }
  return 0;
};
var arePointsClockwise = (points) => {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i][0] * points[j][1];
    area -= points[j][0] * points[i][1];
  }
  const signedArea2 = area / 2;
  return signedArea2 <= 0;
};
var createCircularHole = (x, y, radius, thickness, segments = DEFAULT_QUALITY_MODE_SEGMENTS) => (0, import_primitives.cylinder)({
  center: [x, y, 0],
  height: thickness + 1,
  radius,
  segments
});
var createCutoutGeoms = (boardCenter, thickness, cutouts = [], segments = DEFAULT_QUALITY_MODE_SEGMENTS) => {
  const geoms = [];
  for (const cutout of cutouts) {
    if (!cutout) continue;
    switch (cutout.shape) {
      case "rect": {
        const { center } = cutout;
        if (!center || !isFiniteNumber(center.x) || !isFiniteNumber(center.y)) {
          continue;
        }
        const width = typeof cutout.width === "number" && Number.isFinite(cutout.width) ? cutout.width : void 0;
        const height = typeof cutout.height === "number" && Number.isFinite(cutout.height) ? cutout.height : void 0;
        if (!width || !height) continue;
        const relX = center.x - boardCenter.x;
        const relY = -(center.y - boardCenter.y);
        const rect2d = (0, import_primitives.rectangle)({ size: [width, height] });
        let geom = (0, import_extrusions.extrudeLinear)({ height: thickness + 1 }, rect2d);
        geom = (0, import_transforms.translate)([0, 0, -(thickness + 1) / 2], geom);
        const rotationRad = getCutoutRotationRadians(cutout.rotation);
        if (rotationRad) {
          geom = (0, import_transforms.rotateZ)(-rotationRad, geom);
        }
        geoms.push((0, import_transforms.translate)([relX, relY, 0], geom));
        break;
      }
      case "circle": {
        const { center } = cutout;
        if (!center || !isFiniteNumber(center.x) || !isFiniteNumber(center.y)) {
          continue;
        }
        const radius = (() => {
          if (typeof cutout.radius === "number" && Number.isFinite(cutout.radius)) {
            return cutout.radius;
          }
          if ("diameter" in cutout && typeof cutout.diameter === "number" && Number.isFinite(cutout.diameter)) {
            return cutout.diameter / 2;
          }
          return void 0;
        })();
        if (!radius) continue;
        const relX = center.x - boardCenter.x;
        const relY = -(center.y - boardCenter.y);
        geoms.push(createCircularHole(relX, relY, radius, thickness, segments));
        break;
      }
      case "polygon": {
        const { points } = cutout;
        if (!Array.isArray(points) || points.length < 3) continue;
        let polygonPoints = points.filter(
          (point) => point !== void 0 && isFiniteNumber(point.x) && isFiniteNumber(point.y)
        ).map((point) => toBoardSpaceVec2(point, boardCenter));
        if (polygonPoints.length < 3) continue;
        if (arePointsClockwise(polygonPoints)) {
          polygonPoints = polygonPoints.slice().reverse();
        }
        const polygon2d = (0, import_primitives.polygon)({ points: polygonPoints });
        let geom = (0, import_extrusions.extrudeLinear)({ height: thickness + 1 }, polygon2d);
        geom = (0, import_transforms.translate)([0, 0, -(thickness + 1) / 2], geom);
        geoms.push(geom);
        break;
      }
      default:
        break;
    }
  }
  return geoms;
};
var filterCutoutsForBoard = (cutouts, board) => {
  return cutouts.filter((cutout) => {
    return !cutout.pcb_board_id || cutout.pcb_board_id === board.pcb_board_id;
  });
};

// lib/utils/pcb-board-geometry.ts
var geom32 = __toESM(require_geom3(), 1);
var import_extrusions2 = __toESM(require_extrusions(), 1);
var import_transforms3 = __toESM(require_transforms(), 1);
var import_primitives2 = __toESM(require_primitives(), 1);

// lib/utils/cut-board-mesh-outside-board-boundary.ts
var geom3 = __toESM(require_geom3(), 1);
var import_measureBoundingBox = __toESM(require_measureBoundingBox2(), 1);
var import_booleans2 = __toESM(require_booleans(), 1);
var import_transforms2 = __toESM(require_transforms(), 1);

// lib/utils/batched-union.ts
var import_booleans = __toESM(require_booleans(), 1);
var batchedUnion = (geoms, batchSize = 50) => {
  if (geoms.length === 0) {
    throw new Error("Cannot union empty array");
  }
  if (geoms.length === 1) {
    return geoms[0];
  }
  let results = [...geoms];
  while (results.length > 1) {
    const newResults = [];
    for (let i = 0; i < results.length; i += batchSize) {
      const batch = results.slice(i, i + batchSize);
      if (batch.length === 1) {
        newResults.push(batch[0]);
      } else {
        newResults.push((0, import_booleans.union)(...batch));
      }
    }
    results = newResults;
  }
  return results[0];
};

// lib/utils/cut-board-mesh-outside-board-boundary.ts
var cutBoardMeshOutsideBoardBoundary = ({
  board,
  center,
  thickness,
  holes,
  platedHoles,
  cutouts,
  segments
}) => {
  let boardGeom = createBoardOutlineGeom(board, center, thickness);
  const subtractGeoms = [
    ...createHoleGeoms(center, thickness, holes, platedHoles, segments),
    ...createCutoutGeoms(center, thickness, cutouts, segments)
  ];
  if (subtractGeoms.length > 0) {
    boardGeom = (0, import_booleans2.subtract)(boardGeom, batchedUnion(subtractGeoms));
  }
  boardGeom = (0, import_transforms2.rotateX)(-Math.PI / 2, boardGeom);
  const polygons = geom3.toPolygons(boardGeom);
  return {
    triangles: geom3ToTriangles(boardGeom, polygons),
    boundingBox: createBoundingBox((0, import_measureBoundingBox.default)(boardGeom))
  };
};

// lib/utils/has-boundary-crossing-loops.ts
var LOOP_CONTAINMENT_EPSILON = 1e-8;
var hasBoundaryCrossingLoops = (outerLoop, innerLoops) => {
  return innerLoops.some(
    (loop) => loop.some((point) => !isPointStrictlyInsideLoop(point, outerLoop))
  );
};
var isPointStrictlyInsideLoop = (point, loop) => {
  let inside = false;
  for (let i = 0, j = loop.length - 1; i < loop.length; j = i++) {
    const a = loop[i];
    const b = loop[j];
    if (isPointOnSegment(point, a, b)) {
      return false;
    }
    const intersects = a.y > point.y !== b.y > point.y && point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x;
    if (intersects) {
      inside = !inside;
    }
  }
  return inside;
};
var isPointOnSegment = (point, a, b) => {
  const cross2 = (point.y - a.y) * (b.x - a.x) - (point.x - a.x) * (b.y - a.y);
  if (Math.abs(cross2) > LOOP_CONTAINMENT_EPSILON) return false;
  const dot2 = (point.x - a.x) * (b.x - a.x) + (point.y - a.y) * (b.y - a.y);
  if (dot2 < -LOOP_CONTAINMENT_EPSILON) return false;
  const squaredLength = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
  return dot2 <= squaredLength + LOOP_CONTAINMENT_EPSILON;
};

// lib/utils/geometry-loops.ts
var POINT_EPSILON = 1e-8;
var RADIUS_EPSILON = 1e-4;
var signedArea = (loop) => {
  let area = 0;
  for (let i = 0; i < loop.length; i++) {
    const a = loop[i];
    const b = loop[(i + 1) % loop.length];
    area += a.x * b.y - b.x * a.y;
  }
  return area / 2;
};
var removeDuplicateAdjacentPoints = (points) => {
  if (points.length === 0) return points;
  const filtered = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const prev = filtered[filtered.length - 1];
    const curr = points[i];
    if (Math.hypot(curr.x - prev.x, curr.y - prev.y) > POINT_EPSILON) {
      filtered.push(curr);
    }
  }
  if (filtered.length > 2) {
    const first = filtered[0];
    const last = filtered[filtered.length - 1];
    if (Math.hypot(first.x - last.x, first.y - last.y) <= POINT_EPSILON) {
      filtered.pop();
    }
  }
  return filtered;
};
var normalizeLoop = (loop) => removeDuplicateAdjacentPoints(loop);
var isValidLoop = (loop) => loop.length >= 3 && Math.abs(signedArea(loop)) > 1e-10;
var rotateLoop = ({
  loop,
  angle
}) => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return loop.map((p) => ({
    x: p.x * cos - p.y * sin,
    y: p.x * sin + p.y * cos
  }));
};
var translateLoop = ({
  loop,
  offset
}) => loop.map((p) => ({ x: p.x + offset.x, y: p.y + offset.y }));
var createCircleLoop = ({
  center,
  radius,
  segments
}) => {
  const points = [];
  const count = Math.max(8, segments);
  for (let i = 0; i < count; i++) {
    const angle = i / count * Math.PI * 2;
    points.push({
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius
    });
  }
  return points;
};
var createRoundedRectLoop = ({
  width,
  height,
  segments
}) => {
  const minDimension = Math.min(width, height);
  const maxAllowedRadius = Math.max(0, minDimension / 2 - RADIUS_EPSILON);
  const radius = maxAllowedRadius <= 0 ? 0 : Math.min(height / 2, maxAllowedRadius);
  if (radius <= POINT_EPSILON) {
    return [
      { x: -width / 2, y: -height / 2 },
      { x: width / 2, y: -height / 2 },
      { x: width / 2, y: height / 2 },
      { x: -width / 2, y: height / 2 }
    ];
  }
  const points = [];
  const cornerSteps = Math.max(3, Math.floor(segments / 4));
  const left = -width / 2;
  const right = width / 2;
  const bottom = -height / 2;
  const top = height / 2;
  const corners = [
    {
      cx: right - radius,
      cy: bottom + radius,
      start: -Math.PI / 2,
      end: 0
    },
    { cx: right - radius, cy: top - radius, start: 0, end: Math.PI / 2 },
    {
      cx: left + radius,
      cy: top - radius,
      start: Math.PI / 2,
      end: Math.PI
    },
    {
      cx: left + radius,
      cy: bottom + radius,
      start: Math.PI,
      end: Math.PI * 3 / 2
    }
  ];
  for (let c = 0; c < corners.length; c++) {
    const corner = corners[c];
    for (let i = 0; i < cornerSteps; i++) {
      if (c > 0 && i === 0) continue;
      const t = i / (cornerSteps - 1);
      const angle = corner.start + (corner.end - corner.start) * t;
      points.push({
        x: corner.cx + Math.cos(angle) * radius,
        y: corner.cy + Math.sin(angle) * radius
      });
    }
  }
  return removeDuplicateAdjacentPoints(points);
};

// lib/utils/pcb-cutout-loops.ts
var createCutoutLoops = ({
  boardCenter,
  cutouts,
  segments
}) => {
  const loops = [];
  for (const cutout of cutouts) {
    if (!cutout) continue;
    switch (cutout.shape) {
      case "rect": {
        const { center } = cutout;
        if (!center || !isFiniteNumber(center.x) || !isFiniteNumber(center.y)) {
          continue;
        }
        const width = isFiniteNumber(cutout.width) ? cutout.width : void 0;
        const height = isFiniteNumber(cutout.height) ? cutout.height : void 0;
        if (!width || !height) continue;
        let loop = [
          { x: -width / 2, y: -height / 2 },
          { x: width / 2, y: -height / 2 },
          { x: width / 2, y: height / 2 },
          { x: -width / 2, y: height / 2 }
        ];
        const rotationRad = getCutoutRotationRadians(cutout.rotation);
        if (rotationRad !== 0) {
          loop = rotateLoop({ loop, angle: -rotationRad });
        }
        const relX = center.x - boardCenter.x;
        const relY = -(center.y - boardCenter.y);
        loops.push(translateLoop({ loop, offset: { x: relX, y: relY } }));
        break;
      }
      case "circle": {
        const { center } = cutout;
        if (!center || !isFiniteNumber(center.x) || !isFiniteNumber(center.y)) {
          continue;
        }
        const radius = isFiniteNumber(cutout.radius) ? cutout.radius : getRadiusFromDiameter(cutout);
        if (!radius) continue;
        const relX = center.x - boardCenter.x;
        const relY = -(center.y - boardCenter.y);
        loops.push(
          createCircleLoop({
            center: { x: relX, y: relY },
            radius,
            segments
          })
        );
        break;
      }
      case "polygon": {
        if (!Array.isArray(cutout.points) || cutout.points.length < 3) continue;
        const polygonPoints = cutout.points.filter(
          (point) => point !== void 0 && isFiniteNumber(point.x) && isFiniteNumber(point.y)
        ).map((point) => ({
          x: point.x - boardCenter.x,
          y: -(point.y - boardCenter.y)
        }));
        if (polygonPoints.length >= 3) {
          loops.push(polygonPoints);
        }
        break;
      }
      default:
        break;
    }
  }
  return loops.map(normalizeLoop).filter(isValidLoop);
};
var getRadiusFromDiameter = (cutout) => {
  if ("diameter" in cutout && typeof cutout.diameter === "number" && Number.isFinite(cutout.diameter)) {
    return cutout.diameter / 2;
  }
  return void 0;
};

// lib/utils/pcb-hole-loops.ts
var getNumberProperty = (obj, key) => {
  const value = obj[key];
  return typeof value === "number" ? value : void 0;
};
var createHoleLoops = ({
  boardCenter,
  holes,
  platedHoles,
  segments
}) => {
  const loops = [];
  for (const hole of holes) {
    const holeRecord = hole;
    const relX = hole.x - boardCenter.x;
    const relY = -(hole.y - boardCenter.y);
    const holeShape = holeRecord.hole_shape;
    if (holeShape === "pill") {
      const holeWidth = getNumberProperty(holeRecord, "hole_width");
      const holeHeight = getNumberProperty(holeRecord, "hole_height");
      if (!holeWidth || !holeHeight) continue;
      const rotate = holeHeight > holeWidth;
      const width = rotate ? holeHeight : holeWidth;
      const height = rotate ? holeWidth : holeHeight;
      let loop = createRoundedRectLoop({ width, height, segments });
      if (rotate) {
        loop = rotateLoop({ loop, angle: Math.PI / 2 });
      }
      loops.push(translateLoop({ loop, offset: { x: relX, y: relY } }));
      continue;
    }
    if (holeShape === "rotated_pill") {
      const holeWidth = getNumberProperty(holeRecord, "hole_width");
      const holeHeight = getNumberProperty(holeRecord, "hole_height");
      if (!holeWidth || !holeHeight) continue;
      const rotation = getNumberProperty(holeRecord, "ccw_rotation") ?? 0;
      const rotationRad = -(rotation * Math.PI) / 180;
      let loop = createRoundedRectLoop({
        width: holeWidth,
        height: holeHeight,
        segments
      });
      if (rotationRad !== 0) {
        loop = rotateLoop({ loop, angle: rotationRad });
      }
      loops.push(translateLoop({ loop, offset: { x: relX, y: relY } }));
      continue;
    }
    const diameter = getNumberProperty(holeRecord, "hole_diameter") ?? getNumberProperty(holeRecord, "diameter");
    if (!diameter) continue;
    loops.push(
      createCircleLoop({
        center: { x: relX, y: relY },
        radius: diameter / 2,
        segments
      })
    );
  }
  for (const plated of platedHoles) {
    const platedRecord = plated;
    const holeOffsetX = getNumberProperty(platedRecord, "hole_offset_x") ?? 0;
    const holeOffsetY = getNumberProperty(platedRecord, "hole_offset_y") ?? 0;
    const relX = plated.x - boardCenter.x + holeOffsetX;
    const relY = -(plated.y - boardCenter.y + holeOffsetY);
    if (plated.shape === "pill" || plated.shape === "pill_hole_with_rect_pad") {
      const holeWidth = getNumberProperty(platedRecord, "hole_width") ?? getNumberProperty(platedRecord, "outer_diameter") ?? 0;
      const holeHeight = getNumberProperty(platedRecord, "hole_height") ?? getNumberProperty(platedRecord, "hole_diameter") ?? 0;
      if (!holeWidth || !holeHeight) continue;
      const rotation = getNumberProperty(platedRecord, "ccw_rotation") ?? 0;
      const rotationRad = -(rotation * Math.PI) / 180;
      let loop = createRoundedRectLoop({
        width: holeWidth,
        height: holeHeight,
        segments
      });
      if (rotationRad !== 0) {
        loop = rotateLoop({ loop, angle: rotationRad });
      }
      loops.push(translateLoop({ loop, offset: { x: relX, y: relY } }));
      continue;
    }
    const diameter = getNumberProperty(platedRecord, "hole_diameter") ?? getNumberProperty(platedRecord, "outer_diameter");
    if (!diameter) continue;
    loops.push(
      createCircleLoop({
        center: { x: relX, y: relY },
        radius: diameter / 2,
        segments
      })
    );
  }
  return loops.map(normalizeLoop).filter(isValidLoop);
};

// lib/utils/triangles-from-loops.ts
import earcut from "earcut";
var buildBoardMeshFromLoops = ({
  outerLoop,
  holeLoops,
  thickness
}) => {
  const flattenedVertices = [];
  const holeIndices = [];
  const allLoops = [];
  pushLoop(flattenedVertices, outerLoop);
  allLoops.push({ points: outerLoop, isHole: false });
  let vertexOffset = outerLoop.length;
  for (const holeLoop of holeLoops) {
    if (holeLoop.length < 3) continue;
    holeIndices.push(vertexOffset);
    pushLoop(flattenedVertices, holeLoop);
    allLoops.push({ points: holeLoop, isHole: true });
    vertexOffset += holeLoop.length;
  }
  const indices = earcut(flattenedVertices, holeIndices, 2);
  const zTop = thickness / 2;
  const zBottom = -thickness / 2;
  const triangles = [];
  for (let i = 0; i < indices.length; i += 3) {
    const ia = indices[i];
    let ib = indices[i + 1];
    let ic = indices[i + 2];
    const ax = flattenedVertices[ia * 2];
    const ay = flattenedVertices[ia * 2 + 1];
    const bx = flattenedVertices[ib * 2];
    const by = flattenedVertices[ib * 2 + 1];
    const cx = flattenedVertices[ic * 2];
    const cy = flattenedVertices[ic * 2 + 1];
    const crossZ = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    if (crossZ < 0) {
      ;
      [ib, ic] = [ic, ib];
    }
    const topA = toScenePoint({
      x: flattenedVertices[ia * 2],
      y: flattenedVertices[ia * 2 + 1],
      z: zTop
    });
    const topB = toScenePoint({
      x: flattenedVertices[ib * 2],
      y: flattenedVertices[ib * 2 + 1],
      z: zTop
    });
    const topC = toScenePoint({
      x: flattenedVertices[ic * 2],
      y: flattenedVertices[ic * 2 + 1],
      z: zTop
    });
    triangles.push(makeTriangle({ a: topA, b: topB, c: topC }));
    const bottomA = toScenePoint({
      x: flattenedVertices[ia * 2],
      y: flattenedVertices[ia * 2 + 1],
      z: zBottom
    });
    const bottomB = toScenePoint({
      x: flattenedVertices[ib * 2],
      y: flattenedVertices[ib * 2 + 1],
      z: zBottom
    });
    const bottomC = toScenePoint({
      x: flattenedVertices[ic * 2],
      y: flattenedVertices[ic * 2 + 1],
      z: zBottom
    });
    triangles.push(makeTriangle({ a: bottomA, b: bottomC, c: bottomB }));
  }
  for (const { points, isHole } of allLoops) {
    addLoopSideWalls({ triangles, loop: points, zTop, zBottom, isHole });
  }
  return {
    triangles,
    boundingBox: computeBoundingBox(triangles)
  };
};
var pushLoop = (flattenedVertices, loop) => {
  for (const p of loop) {
    flattenedVertices.push(p.x, p.y);
  }
};
var toScenePoint = ({
  x,
  y,
  z
}) => ({
  x,
  y: z,
  z: -y
});
var makeTriangle = ({
  a,
  b,
  c
}) => {
  const ab = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
  const ac = { x: c.x - a.x, y: c.y - a.y, z: c.z - a.z };
  const cross2 = {
    x: ab.y * ac.z - ab.z * ac.y,
    y: ab.z * ac.x - ab.x * ac.z,
    z: ab.x * ac.y - ab.y * ac.x
  };
  const length = Math.hypot(cross2.x, cross2.y, cross2.z) || 1;
  return {
    vertices: [a, b, c],
    normal: {
      x: cross2.x / length,
      y: cross2.y / length,
      z: cross2.z / length
    }
  };
};
var addLoopSideWalls = ({
  triangles,
  loop,
  zTop,
  zBottom,
  isHole
}) => {
  if (loop.length < 2) return;
  const isCounterClockwise = signedArea(loop) > 0;
  const invert = isHole ? isCounterClockwise : !isCounterClockwise;
  for (let i = 0; i < loop.length; i++) {
    const a = loop[i];
    const b = loop[(i + 1) % loop.length];
    const topA = toScenePoint({ x: a.x, y: a.y, z: zTop });
    const topB = toScenePoint({ x: b.x, y: b.y, z: zTop });
    const bottomA = toScenePoint({ x: a.x, y: a.y, z: zBottom });
    const bottomB = toScenePoint({ x: b.x, y: b.y, z: zBottom });
    if (invert) {
      triangles.push(makeTriangle({ a: topA, b: topB, c: bottomB }));
      triangles.push(makeTriangle({ a: topA, b: bottomB, c: bottomA }));
    } else {
      triangles.push(makeTriangle({ a: topA, b: bottomB, c: topB }));
      triangles.push(makeTriangle({ a: topA, b: bottomA, c: bottomB }));
    }
  }
};
var computeBoundingBox = (triangles) => {
  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;
  for (const triangle of triangles) {
    for (const vertex of triangle.vertices) {
      minX = Math.min(minX, vertex.x);
      minY = Math.min(minY, vertex.y);
      minZ = Math.min(minZ, vertex.z);
      maxX = Math.max(maxX, vertex.x);
      maxY = Math.max(maxY, vertex.y);
      maxZ = Math.max(maxZ, vertex.z);
    }
  }
  return {
    min: { x: minX, y: minY, z: minZ },
    max: { x: maxX, y: maxY, z: maxZ }
  };
};

// lib/utils/pcb-board-geometry.ts
var RADIUS_EPSILON2 = 1e-4;
var getHoleSegments = (totalHoleCount, drillQuality) => {
  if (drillQuality === "high") {
    return totalHoleCount > HOLE_COUNT_THRESHOLD ? HIGH_QUALITY_MODE_REDUCED_SEGMENTS : HIGH_QUALITY_MODE_SEGMENTS;
  }
  return totalHoleCount > HOLE_COUNT_THRESHOLD ? REDUCED_QUALITY_MODE_SEGMENTS : DEFAULT_QUALITY_MODE_SEGMENTS;
};
var getNumberProperty2 = (obj, key) => {
  const value = obj[key];
  return typeof value === "number" ? value : void 0;
};
var createBoardOutlineGeom = (board, center, thickness) => {
  const outline = "outline" in board ? board.outline : void 0;
  if (outline && outline.length >= 3) {
    let outlinePoints = outline.map((pt) => [
      pt.x - center.x,
      -(pt.y - center.y)
    ]);
    if (arePointsClockwise(outlinePoints)) {
      outlinePoints = outlinePoints.slice().reverse();
    }
    const shape2d = (0, import_primitives2.polygon)({ points: outlinePoints });
    let geom2 = (0, import_extrusions2.extrudeLinear)({ height: thickness }, shape2d);
    geom2 = (0, import_transforms3.translate)([0, 0, -thickness / 2], geom2);
    return geom2;
  }
  const baseRect = (0, import_primitives2.rectangle)({ size: [board.width, board.height] });
  let geom = (0, import_extrusions2.extrudeLinear)({ height: thickness }, baseRect);
  geom = (0, import_transforms3.translate)([0, 0, -thickness / 2], geom);
  return geom;
};
var createPillHoleWithSegments = (x, y, width, height, thickness, rotationRad = 0, segments = DEFAULT_QUALITY_MODE_SEGMENTS) => {
  const minDimension = Math.min(width, height);
  const maxAllowedRadius = Math.max(0, minDimension / 2 - RADIUS_EPSILON2);
  const roundRadius = maxAllowedRadius <= 0 ? 0 : Math.min(height / 2, maxAllowedRadius);
  const hole2d = (0, import_primitives2.roundedRectangle)({
    size: [width, height],
    roundRadius,
    segments
  });
  let hole3d = (0, import_extrusions2.extrudeLinear)({ height: thickness + 1 }, hole2d);
  hole3d = (0, import_transforms3.translate)([0, 0, -(thickness + 1) / 2], hole3d);
  if (rotationRad !== 0) {
    hole3d = (0, import_transforms3.rotateZ)(rotationRad, hole3d);
  }
  return (0, import_transforms3.translate)([x, y, 0], hole3d);
};
var createHoleGeoms = (boardCenter, thickness, holes = [], platedHoles = [], segments = DEFAULT_QUALITY_MODE_SEGMENTS) => {
  const holeGeoms = [];
  for (const hole of holes) {
    const holeRecord = hole;
    const relX = hole.x - boardCenter.x;
    const relY = -(hole.y - boardCenter.y);
    const holeShape = holeRecord.hole_shape;
    if (holeShape === "pill") {
      const holeWidth = getNumberProperty2(holeRecord, "hole_width");
      const holeHeight = getNumberProperty2(holeRecord, "hole_height");
      if (!holeWidth || !holeHeight) continue;
      const rotate = holeHeight > holeWidth;
      const width = rotate ? holeHeight : holeWidth;
      const height = rotate ? holeWidth : holeHeight;
      holeGeoms.push(
        createPillHoleWithSegments(
          relX,
          relY,
          width,
          height,
          thickness,
          rotate ? Math.PI / 2 : 0,
          segments
        )
      );
      continue;
    }
    if (holeShape === "rotated_pill") {
      const holeWidth = getNumberProperty2(holeRecord, "hole_width");
      const holeHeight = getNumberProperty2(holeRecord, "hole_height");
      if (!holeWidth || !holeHeight) continue;
      const rotation = getNumberProperty2(holeRecord, "ccw_rotation") ?? 0;
      const rotationRad = -(rotation * Math.PI) / 180;
      holeGeoms.push(
        createPillHoleWithSegments(
          relX,
          relY,
          holeWidth,
          holeHeight,
          thickness,
          rotationRad,
          segments
        )
      );
      continue;
    }
    const diameter = getNumberProperty2(holeRecord, "hole_diameter") ?? getNumberProperty2(holeRecord, "diameter");
    if (!diameter) continue;
    holeGeoms.push(
      createCircularHole(relX, relY, diameter / 2, thickness, segments)
    );
  }
  for (const plated of platedHoles) {
    const platedRecord = plated;
    const holeOffsetX = getNumberProperty2(platedRecord, "hole_offset_x") ?? 0;
    const holeOffsetY = getNumberProperty2(platedRecord, "hole_offset_y") ?? 0;
    const relX = plated.x - boardCenter.x + holeOffsetX;
    const relY = -(plated.y - boardCenter.y + holeOffsetY);
    if (plated.shape === "pill" || plated.shape === "pill_hole_with_rect_pad") {
      const holeWidth = getNumberProperty2(platedRecord, "hole_width") ?? getNumberProperty2(platedRecord, "outer_diameter") ?? 0;
      const holeHeight = getNumberProperty2(platedRecord, "hole_height") ?? getNumberProperty2(platedRecord, "hole_diameter") ?? 0;
      if (!holeWidth || !holeHeight) continue;
      const rotation = getNumberProperty2(platedRecord, "ccw_rotation") ?? 0;
      const rotationRad = -(rotation * Math.PI) / 180;
      holeGeoms.push(
        createPillHoleWithSegments(
          relX,
          relY,
          holeWidth,
          holeHeight,
          thickness,
          rotationRad,
          segments
        )
      );
      continue;
    }
    const diameter = getNumberProperty2(platedRecord, "hole_diameter") ?? getNumberProperty2(platedRecord, "outer_diameter");
    if (!diameter) continue;
    holeGeoms.push(
      createCircularHole(relX, relY, diameter / 2, thickness, segments)
    );
  }
  return holeGeoms;
};
var geom3ToTriangles = (geometry, polygons) => {
  const sourcePolygons = polygons ?? geom32.toPolygons(geometry);
  const triangles = [];
  for (const poly of sourcePolygons) {
    if (!poly || poly.vertices.length < 3) continue;
    const base = poly.vertices[0];
    const next = poly.vertices[1];
    const next2 = poly.vertices[2];
    const ab = [next[0] - base[0], next[1] - base[1], next[2] - base[2]];
    const ac = [
      next2[0] - base[0],
      next2[1] - base[1],
      next2[2] - base[2]
    ];
    const cross2 = [
      ab[1] * ac[2] - ab[2] * ac[1],
      ab[2] * ac[0] - ab[0] * ac[2],
      ab[0] * ac[1] - ab[1] * ac[0]
    ];
    const length = Math.sqrt(cross2[0] ** 2 + cross2[1] ** 2 + cross2[2] ** 2) || 1;
    const normal = {
      x: cross2[0] / length,
      y: cross2[1] / length,
      z: cross2[2] / length
    };
    for (let i = 1; i < poly.vertices.length - 1; i++) {
      const v1 = poly.vertices[i];
      const v2 = poly.vertices[i + 1];
      triangles.push({
        vertices: [
          { x: base[0], y: base[1], z: base[2] },
          { x: v1[0], y: v1[1], z: v1[2] },
          { x: v2[0], y: v2[1], z: v2[2] }
        ],
        normal
      });
    }
  }
  return triangles;
};
var createBoundingBox = (bbox) => {
  const [min, max] = bbox;
  return {
    min: { x: min[0], y: min[1], z: min[2] },
    max: { x: max[0], y: max[1], z: max[2] }
  };
};
var createBoardMesh = (board, options) => {
  const {
    thickness,
    holes = [],
    platedHoles = [],
    cutouts = [],
    drillQuality = "fast"
  } = options;
  const center = board.center ?? { x: 0, y: 0 };
  const totalHoleCount = holes.length + platedHoles.length;
  const segments = getHoleSegments(totalHoleCount, drillQuality);
  const outerLoop = createBoardOuterLoop(board, center);
  const holeLoops = [
    ...createHoleLoops({
      boardCenter: center,
      holes,
      platedHoles,
      segments
    }),
    ...createCutoutLoops({
      boardCenter: center,
      cutouts,
      segments
    })
  ];
  if (hasBoundaryCrossingLoops(outerLoop, holeLoops)) {
    return cutBoardMeshOutsideBoardBoundary({
      board,
      center,
      thickness,
      holes,
      platedHoles,
      cutouts,
      segments
    });
  }
  return buildBoardMeshFromLoops({ outerLoop, holeLoops, thickness });
};
var createBoardOuterLoop = (board, center) => {
  const outline = "outline" in board ? board.outline : void 0;
  if (outline && outline.length >= 3) {
    let points = outline.map((pt) => ({
      x: pt.x - center.x,
      y: -(pt.y - center.y)
    }));
    if (signedArea(points) < 0) points = points.slice().reverse();
    return normalizeLoop(points);
  }
  const width = board.width;
  const height = board.height;
  return normalizeLoop([
    { x: -width / 2, y: -height / 2 },
    { x: width / 2, y: -height / 2 },
    { x: width / 2, y: height / 2 },
    { x: -width / 2, y: height / 2 }
  ]);
};

// lib/utils/pcb-panel-geometry.ts
var geom33 = __toESM(require_geom3(), 1);
var import_measureBoundingBox2 = __toESM(require_measureBoundingBox2(), 1);
var import_booleans3 = __toESM(require_booleans(), 1);
var import_transforms4 = __toESM(require_transforms(), 1);
var createPanelMesh = (panel, options) => {
  const { thickness, holes = [], platedHoles = [], cutouts = [] } = options;
  const drillQuality = options.drillQuality ?? "fast";
  const center = panel.center ?? { x: 0, y: 0 };
  let panelGeom = createBoardOutlineGeom(panel, center, thickness);
  const totalHoleCount = holes.length + platedHoles.length;
  const segments = drillQuality === "high" ? totalHoleCount > HOLE_COUNT_THRESHOLD ? HIGH_QUALITY_MODE_REDUCED_SEGMENTS : HIGH_QUALITY_MODE_SEGMENTS : totalHoleCount > HOLE_COUNT_THRESHOLD ? REDUCED_QUALITY_MODE_SEGMENTS : DEFAULT_QUALITY_MODE_SEGMENTS;
  const holeGeoms = createHoleGeoms(
    center,
    thickness,
    holes,
    platedHoles,
    segments
  );
  const cutoutGeoms = createCutoutGeoms(center, thickness, cutouts, segments);
  const subtractGeoms = [...holeGeoms, ...cutoutGeoms];
  if (subtractGeoms.length > 0) {
    const unifiedHoles = batchedUnion(subtractGeoms);
    panelGeom = (0, import_booleans3.subtract)(panelGeom, unifiedHoles);
  }
  panelGeom = (0, import_transforms4.rotateX)(-Math.PI / 2, panelGeom);
  const polygons = geom33.toPolygons(panelGeom);
  const triangles = geom3ToTriangles(panelGeom, polygons);
  const bboxValues = (0, import_measureBoundingBox2.default)(panelGeom);
  const boundingBox = createBoundingBox(bboxValues);
  return {
    triangles,
    boundingBox
  };
};

// lib/converters/board-renderer.ts
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg";
var SOLDER_MASK_HEX = {
  green: { mask: "#0F3812", over: "#69e778ff" },
  red: { mask: "#3a0a0a", over: "#d63232ff" },
  blue: { mask: "#0a1a3a", over: "#3252d6ff" },
  purple: { mask: "#1f0a3a", over: "#9a3ad6ff" },
  black: { mask: "#0a0a0a", over: "#404040ff" },
  white: { mask: "#e8e8e8", over: "#ffffffff" },
  yellow: { mask: "#3a3000", over: "#e2c800ff" },
  not_specified: { mask: "#0F3812", over: "#69e778ff" }
};
var getBoardColor = (circuitJson) => {
  const board = circuitJson.find(
    (x) => x?.type === "pcb_board"
  );
  return board?.solder_mask_color ?? "not_specified";
};
async function renderBoardLayer(circuitJson, options) {
  const {
    layer,
    resolution = 1024,
    backgroundColor = "transparent",
    copperColor = "#ffe066",
    silkscreenColor = "#ffffff",
    drillColor = "rgba(0,0,0,0.5)",
    showPcbNotes = false
  } = options;
  const colorKey = getBoardColor(circuitJson);
  const colors = SOLDER_MASK_HEX[colorKey] ?? SOLDER_MASK_HEX.not_specified;
  const svg = convertCircuitJsonToPcbSvg(circuitJson, {
    layer,
    matchBoardAspectRatio: true,
    backgroundColor,
    drawPaddingOutsideBoard: false,
    showSolderMask: true,
    showPcbNotes,
    colorOverrides: {
      copper: {
        top: copperColor,
        bottom: copperColor
      },
      silkscreen: {
        top: silkscreenColor,
        bottom: silkscreenColor
      },
      soldermaskWithCopperUnderneath: {
        top: colors.over,
        bottom: colors.over
      },
      drill: drillColor
    }
  });
  const finalSvg = svg;
  return await convertSvgToPng(finalSvg, resolution, backgroundColor);
}
async function convertSvgToPng(svgString, resolution, backgroundColor) {
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const { svgToPngDataUrl } = await import("./svg-to-png-browser-MXUWCXAZ.js");
    return await svgToPngDataUrl(svgString, {
      width: resolution,
      background: backgroundColor
    });
  } else {
    try {
      const { svgToPngDataUrl } = await import("./svg-to-png-XFKMCXOE.js");
      return await svgToPngDataUrl(svgString, {
        width: resolution,
        background: backgroundColor
      });
    } catch (error) {
      console.warn(
        "Failed to load native svg-to-png, falling back to browser method:",
        error
      );
      return convertSvgToCanvasBrowser(svgString, resolution, backgroundColor);
    }
  }
}
async function convertSvgToCanvasBrowser(svgString, resolution, backgroundColor) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = resolution;
    canvas.height = resolution;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, resolution, resolution);
    const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;
    const img = new Image();
    img.onload = () => {
      try {
        ctx.drawImage(img, 0, 0, resolution, resolution);
        resolve(canvas.toDataURL("image/png"));
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = (error) => {
      console.error("Failed to load SVG image:", error);
      reject(error);
    };
    img.src = svgDataUrl;
  });
}
async function renderBoardTextures(circuitJson, { resolution = 1024, showPcbNotes = false }) {
  const colorKey = getBoardColor(circuitJson);
  const colors = SOLDER_MASK_HEX[colorKey] ?? SOLDER_MASK_HEX.not_specified;
  const top = await renderBoardLayer(circuitJson, {
    layer: "top",
    resolution,
    backgroundColor: colors.mask,
    showPcbNotes
  });
  const bottom = await renderBoardLayer(circuitJson, {
    layer: "bottom",
    resolution,
    backgroundColor: colors.mask,
    showPcbNotes
  });
  return { top, bottom };
}

// lib/converters/circuit-to-3d.ts
var DEFAULT_BOARD_THICKNESS = 1.6;
var DEFAULT_COMPONENT_HEIGHT = 2;
var FAUX_BOARD_MARGIN = 2;
var DEFAULT_FAUX_BOARD_SIZE = 10;
function convertRotationFromCadRotation(rot) {
  return {
    x: rot.x * Math.PI / 180,
    y: rot.y * Math.PI / 180,
    z: rot.z * Math.PI / 180
  };
}
function convertCadSizeToSceneSize(size) {
  return {
    x: size.x,
    y: size.z,
    z: size.y
  };
}
async function convertCircuitJsonTo3D(circuitJson, options = {}) {
  const {
    pcbColor: pcbColorOption,
    componentColor = "rgba(128,128,128,0.5)",
    copperColor = "#C87B4B",
    boardThickness = DEFAULT_BOARD_THICKNESS,
    boardDrillQuality = "fast",
    drawFauxBoard = false,
    defaultComponentHeight = DEFAULT_COMPONENT_HEIGHT,
    renderBoardTextures: shouldRenderTextures = true,
    textureResolution = 1024,
    showPcbNotes = false,
    coordinateTransform,
    showBoundingBoxes = true,
    projectBaseUrl,
    authHeaders
  } = options;
  const db = cju(circuitJson);
  const boxes = [];
  const pcbPanel = db.pcb_panel?.list?.()[0];
  const pcbBoard = db.pcb_board?.list?.()[0];
  const SOLDER_MASK_COLOR_MAP = {
    green: "rgba(0,140,0,0.85)",
    red: "rgba(180,30,30,0.85)",
    blue: "rgba(20,60,180,0.85)",
    purple: "rgba(110,40,160,0.85)",
    black: "rgba(20,20,20,0.95)",
    white: "rgba(235,235,235,0.95)",
    yellow: "rgba(220,200,30,0.9)",
    not_specified: "rgba(0,140,0,0.8)"
  };
  const boardSolderMaskColor = pcbBoard?.solder_mask_color;
  const pcbColor = pcbColorOption ?? (boardSolderMaskColor && SOLDER_MASK_COLOR_MAP[boardSolderMaskColor]) ?? SOLDER_MASK_COLOR_MAP.not_specified;
  const pcbComponents = db.pcb_component?.list?.() ?? [];
  const effectiveBoardThickness = pcbBoard?.thickness ?? boardThickness;
  if (pcbPanel) {
    const pcbHoles = db.pcb_hole?.list?.() ?? [];
    const pcbPlatedHoles = db.pcb_plated_hole?.list?.() ?? [];
    const pcbCutouts = db.pcb_cutout?.list?.() ?? [];
    const panelCutouts = pcbCutouts.filter((cutout) => !cutout.pcb_board_id);
    const panelMesh = createPanelMesh(pcbPanel, {
      thickness: effectiveBoardThickness,
      holes: pcbHoles,
      platedHoles: pcbPlatedHoles,
      cutouts: panelCutouts,
      drillQuality: boardDrillQuality
    });
    const meshWidth = panelMesh.boundingBox.max.x - panelMesh.boundingBox.min.x;
    const meshHeight = panelMesh.boundingBox.max.z - panelMesh.boundingBox.min.z;
    const panelBox = {
      center: {
        x: pcbPanel.center.x,
        y: 0,
        z: pcbPanel.center.y
      },
      size: {
        x: Number.isFinite(meshWidth) ? meshWidth : pcbPanel.width,
        y: effectiveBoardThickness,
        z: Number.isFinite(meshHeight) ? meshHeight : pcbPanel.height
      },
      mesh: panelMesh,
      color: pcbColor
    };
    if (shouldRenderTextures && textureResolution > 0) {
      try {
        const textures = await renderBoardTextures(circuitJson, {
          resolution: textureResolution,
          showPcbNotes
        });
        panelBox.texture = {
          top: textures.top,
          bottom: textures.bottom
        };
      } catch (error) {
        console.warn("Failed to render panel textures:", error);
        panelBox.color = pcbColor;
      }
    } else {
      panelBox.color = pcbColor;
    }
    boxes.push(panelBox);
  } else if (pcbBoard) {
    const pcbHoles = db.pcb_hole?.list?.() ?? [];
    const pcbPlatedHoles = db.pcb_plated_hole?.list?.() ?? [];
    const pcbCutouts = db.pcb_cutout?.list?.() ?? [];
    const boardCutouts = filterCutoutsForBoard(pcbCutouts, pcbBoard);
    const boardMesh = createBoardMesh(pcbBoard, {
      thickness: effectiveBoardThickness,
      holes: pcbHoles,
      platedHoles: pcbPlatedHoles,
      cutouts: boardCutouts,
      drillQuality: boardDrillQuality
    });
    const meshWidth = boardMesh.boundingBox.max.x - boardMesh.boundingBox.min.x;
    const meshHeight = boardMesh.boundingBox.max.z - boardMesh.boundingBox.min.z;
    const boardBox = {
      center: {
        x: pcbBoard.center.x,
        y: 0,
        z: pcbBoard.center.y
      },
      size: {
        x: Number.isFinite(meshWidth) ? meshWidth : pcbBoard.width,
        y: effectiveBoardThickness,
        z: Number.isFinite(meshHeight) ? meshHeight : pcbBoard.height
      },
      mesh: boardMesh,
      color: pcbColor
    };
    if (shouldRenderTextures && textureResolution > 0) {
      try {
        const textures = await renderBoardTextures(circuitJson, {
          resolution: textureResolution,
          showPcbNotes
        });
        boardBox.texture = {
          top: textures.top,
          bottom: textures.bottom
        };
      } catch (error) {
        console.warn("Failed to render board textures:", error);
        boardBox.color = pcbColor;
      }
    } else {
      boardBox.color = pcbColor;
    }
    boxes.push(boardBox);
  } else if (drawFauxBoard) {
    const hasComponentBounds = pcbComponents.length > 0;
    const componentBounds = hasComponentBounds ? findBoundsAndCenter(pcbComponents) : null;
    const fauxCenterX = componentBounds?.center.x ?? 0;
    const fauxCenterY = componentBounds?.center.y ?? 0;
    const fauxWidth = componentBounds ? Math.max(
      componentBounds.width + FAUX_BOARD_MARGIN * 2,
      DEFAULT_FAUX_BOARD_SIZE
    ) : DEFAULT_FAUX_BOARD_SIZE;
    const fauxHeight = componentBounds ? Math.max(
      componentBounds.height + FAUX_BOARD_MARGIN * 2,
      DEFAULT_FAUX_BOARD_SIZE
    ) : DEFAULT_FAUX_BOARD_SIZE;
    const fauxBoardBox = {
      center: {
        x: fauxCenterX,
        y: fauxCenterY,
        z: 0
      },
      size: {
        x: fauxWidth,
        y: effectiveBoardThickness,
        z: fauxHeight
      },
      color: pcbColor
    };
    if (shouldRenderTextures && textureResolution > 0) {
      try {
        const fauxBoardId = pcbComponents.find(
          (component) => typeof component.pcb_board_id === "string"
        )?.pcb_board_id ?? "__faux_board__";
        const fauxBoardCircuitJson = [
          ...circuitJson,
          {
            type: "pcb_board",
            pcb_board_id: fauxBoardId,
            center: { x: fauxCenterX, y: fauxCenterY },
            width: fauxWidth,
            height: fauxHeight,
            thickness: effectiveBoardThickness
          }
        ];
        const textures = await renderBoardTextures(fauxBoardCircuitJson, {
          resolution: textureResolution,
          showPcbNotes
        });
        fauxBoardBox.texture = {
          top: textures.top,
          bottom: textures.bottom
        };
      } catch (error) {
        console.warn("Failed to render faux board textures:", error);
        fauxBoardBox.color = pcbColor;
      }
    }
    boxes.push(fauxBoardBox);
  }
  const cadComponents = db.cad_component?.list?.() ?? [];
  const pcbComponentIdsWith3D = /* @__PURE__ */ new Set();
  const pcbComponentIdsWithBoundingBox = /* @__PURE__ */ new Set();
  for (const cad of cadComponents) {
    const {
      model_stl_url,
      model_obj_url,
      model_glb_url,
      model_gltf_url,
      model_step_url
    } = cad;
    const hasFootprinterModel = Boolean(
      cad.footprinter_string && !model_stl_url && !model_obj_url && !model_glb_url && !model_gltf_url && !model_step_url
    );
    if (cad.show_as_bounding_box) {
      pcbComponentIdsWithBoundingBox.add(cad.pcb_component_id);
    }
    const hasModelSource = Boolean(
      model_stl_url || model_obj_url || model_glb_url || model_gltf_url || model_step_url || hasFootprinterModel
    );
    if (!hasModelSource) continue;
    pcbComponentIdsWith3D.add(cad.pcb_component_id);
    const pcbComponent = db.pcb_component.get(cad.pcb_component_id);
    const isBottomLayer = pcbComponent?.layer === "bottom";
    const modelScaleFactor = cad.model_unit_to_mm_scale_factor ?? 1;
    const size = cad.size ? convertCadSizeToSceneSize({
      x: cad.size.x * modelScaleFactor,
      y: cad.size.y * modelScaleFactor,
      z: cad.size.z * modelScaleFactor
    }) : {
      x: pcbComponent?.width ?? 2,
      y: defaultComponentHeight,
      z: pcbComponent?.height ?? 2
    };
    const center = cad.position ? {
      x: cad.position.x,
      y: cad.position.z,
      z: cad.position.y
    } : {
      x: pcbComponent?.center.x ?? 0,
      y: isBottomLayer ? -(effectiveBoardThickness / 2 + size.y / 2) : effectiveBoardThickness / 2 + size.y / 2,
      z: pcbComponent?.center.y ?? 0
    };
    const meshType = model_stl_url ? "stl" : model_obj_url ? "obj" : model_gltf_url ? "gltf" : model_glb_url ? "glb" : model_step_url ? "step" : hasFootprinterModel ? "glb" : void 0;
    const sourceComponent = db.source_component.get(cad.source_component_id);
    const box = {
      center,
      size,
      isTranslucent: cad.show_as_translucent_model,
      label: sourceComponent?.name
    };
    if (model_stl_url || model_obj_url || model_glb_url || model_gltf_url || model_step_url) {
      box.meshUrl = model_stl_url || model_obj_url || model_glb_url || model_gltf_url || model_step_url;
      box.meshType = meshType;
    }
    if (cad.rotation) {
      box.rotation = convertRotationFromCadRotation({
        x: cad.rotation.x,
        y: cad.rotation.z,
        // Circuit Z rotation becomes model Y rotation
        z: cad.rotation.y
        // Circuit Y rotation becomes model Z rotation
      });
    } else if (isBottomLayer) {
      if (model_glb_url || model_gltf_url || hasFootprinterModel) {
        box.rotation = convertRotationFromCadRotation({
          x: 0,
          y: 0,
          z: 180
          // Flip via Z rotation for GLB models (matches circuit JSON convention)
        });
      } else {
        box.rotation = convertRotationFromCadRotation({
          x: 180,
          y: 0,
          z: 0
        });
      }
    }
    const usingGlbCoordinates = Boolean(model_glb_url || model_gltf_url);
    const usingObjFormat = Boolean(model_obj_url);
    const usingStepFormat = Boolean(model_step_url);
    const defaultTransform = getDefaultModelTransform(cad, {
      coordinateTransform,
      usingGlbCoordinates,
      usingObjFormat,
      usingStepFormat,
      hasFootprinterModel
    });
    if (model_stl_url) {
      box.mesh = await loadSTL({
        url: model_stl_url,
        transform: defaultTransform,
        projectBaseUrl,
        authHeaders
      });
    } else if (model_obj_url) {
      box.mesh = await loadOBJ({
        url: model_obj_url,
        transform: defaultTransform,
        projectBaseUrl,
        authHeaders
      });
    } else if (model_glb_url) {
      try {
        box.mesh = await loadGLB({
          url: model_glb_url,
          transform: defaultTransform,
          projectBaseUrl,
          authHeaders
        });
      } catch (err) {
        console.error(`Failed to load GLB from ${model_glb_url}:`, err);
      }
    } else if (model_gltf_url) {
      box.mesh = await loadGLTF({
        url: model_gltf_url,
        transform: defaultTransform,
        projectBaseUrl,
        authHeaders
      });
    } else if (model_step_url) {
      try {
        box.mesh = await loadSTEP({
          url: model_step_url,
          transform: defaultTransform,
          projectBaseUrl,
          authHeaders
        });
      } catch (err) {
        console.error(`Failed to load STEP from ${model_step_url}:`, err);
      }
    } else if (hasFootprinterModel && cad.footprinter_string) {
      box.mesh = await loadFootprinterModel(
        cad.footprinter_string,
        defaultTransform
      );
    }
    if (box.mesh && modelScaleFactor !== 1) {
      box.mesh = scaleMesh(box.mesh, modelScaleFactor);
    }
    if (box.mesh) {
      box.mesh = getMeshWithBoardNormalTransform(
        box.mesh,
        cad.model_board_normal_direction
      );
      const meshOrigin = getMeshOrigin(cad, box.mesh.boundingBox, {
        loaderTransform: defaultTransform,
        modelBoardNormalDirection: cad.model_board_normal_direction
      });
      if (meshOrigin) {
        box.mesh = translateMesh(box.mesh, {
          x: -meshOrigin.x,
          y: -meshOrigin.y,
          z: -meshOrigin.z
        });
      }
      if (cad.size) {
        box.mesh = fitMeshToCadBounds(
          box.mesh,
          size,
          cad.model_object_fit ?? "contain_within_bounds"
        );
      }
      box.size = getBoundingBoxSize(box.mesh.boundingBox);
    }
    if (!box.mesh) {
      if (hasFootprinterModel && !showBoundingBoxes) continue;
      box.color = componentColor;
    }
    boxes.push(box);
  }
  if (showBoundingBoxes) {
    for (const component of pcbComponents) {
      if (pcbComponentIdsWith3D.has(component.pcb_component_id)) continue;
      if (!pcbComponentIdsWithBoundingBox.has(component.pcb_component_id))
        continue;
      const sourceComponent = db.source_component.get(
        component.source_component_id
      );
      const compHeight = Math.min(
        Math.min(component.width, component.height),
        defaultComponentHeight
      );
      const isBottomLayer = component.layer === "bottom";
      boxes.push({
        center: {
          x: component.center.x,
          y: isBottomLayer ? -(effectiveBoardThickness + compHeight / 2) : effectiveBoardThickness / 2 + compHeight / 2,
          z: component.center.y
        },
        size: {
          x: component.width,
          y: compHeight,
          z: component.height
        },
        color: componentColor,
        label: sourceComponent?.name ?? "?",
        labelColor: "white"
      });
    }
  }
  let camera;
  if (pcbBoard) {
    const boardDiagonal = Math.sqrt(
      pcbBoard.width * pcbBoard.width + pcbBoard.height * pcbBoard.height
    );
    const cameraDistance = boardDiagonal * 1.5;
    camera = {
      position: {
        x: pcbBoard.center.x + cameraDistance * 0.5,
        y: cameraDistance * 0.7,
        z: pcbBoard.center.y + cameraDistance * 0.5
      },
      target: {
        x: pcbBoard.center.x,
        y: 0,
        z: pcbBoard.center.y
      },
      up: { x: 0, y: 1, z: 0 },
      fov: 50,
      near: 0.1,
      far: cameraDistance * 4
    };
  } else {
    const hasBoxes = boxes.length > 0;
    if (hasBoxes) {
      let minX = Infinity;
      let minZ = Infinity;
      let maxX = -Infinity;
      let maxZ = -Infinity;
      for (const box of boxes) {
        const halfX = (box.size?.x ?? 0) / 2;
        const halfZ = (box.size?.z ?? 0) / 2;
        minX = Math.min(minX, box.center.x - halfX);
        maxX = Math.max(maxX, box.center.x + halfX);
        minZ = Math.min(minZ, box.center.z - halfZ);
        maxZ = Math.max(maxZ, box.center.z + halfZ);
      }
      const width = Math.max(maxX - minX, 1);
      const height = Math.max(maxZ - minZ, 1);
      const diagonal = Math.sqrt(width * width + height * height);
      const distance = diagonal * 1.5;
      const centerX = (minX + maxX) / 2;
      const centerZ = (minZ + maxZ) / 2;
      camera = {
        position: {
          x: centerX + distance * 0.5,
          y: distance * 0.7,
          z: centerZ + distance * 0.5
        },
        target: { x: centerX, y: 0, z: centerZ },
        up: { x: 0, y: 1, z: 0 },
        fov: 50,
        near: 0.1,
        far: distance * 4
      };
    } else {
      camera = {
        position: { x: 30, y: 30, z: 25 },
        target: { x: 0, y: 0, z: 0 },
        up: { x: 0, y: 1, z: 0 },
        fov: 50,
        near: 0.1,
        far: 120
      };
    }
  }
  const lights = [
    {
      type: "ambient",
      color: "white",
      intensity: 0.5
    },
    {
      type: "directional",
      color: "white",
      intensity: 0.5,
      direction: { x: -1, y: -1, z: -1 }
    }
  ];
  return {
    boxes,
    camera,
    lights
  };
}

// lib/gltf/gltf-types.ts
var COMPONENT_TYPE = {
  BYTE: 5120,
  UNSIGNED_BYTE: 5121,
  SHORT: 5122,
  UNSIGNED_SHORT: 5123,
  UNSIGNED_INT: 5125,
  FLOAT: 5126
};
var TARGET = {
  ARRAY_BUFFER: 34962,
  ELEMENT_ARRAY_BUFFER: 34963
};
var PRIMITIVE_MODE = {
  POINTS: 0,
  LINES: 1,
  LINE_LOOP: 2,
  LINE_STRIP: 3,
  TRIANGLES: 4,
  TRIANGLE_STRIP: 5,
  TRIANGLE_FAN: 6
};
var FILTER = {
  NEAREST: 9728,
  LINEAR: 9729,
  NEAREST_MIPMAP_NEAREST: 9984,
  LINEAR_MIPMAP_NEAREST: 9985,
  NEAREST_MIPMAP_LINEAR: 9986,
  LINEAR_MIPMAP_LINEAR: 9987
};
var WRAP = {
  CLAMP_TO_EDGE: 33071,
  MIRRORED_REPEAT: 33648,
  REPEAT: 10497
};

// lib/gltf/buffer-builder.ts
var BufferBuilder = class {
  data;
  view;
  offset;
  constructor(initialSize = 1024 * 1024) {
    this.data = new ArrayBuffer(initialSize);
    this.view = new DataView(this.data);
    this.offset = 0;
  }
  ensureCapacity(additionalBytes) {
    if (this.offset + additionalBytes > this.data.byteLength) {
      const newSize = Math.max(
        this.data.byteLength * 2,
        this.offset + additionalBytes
      );
      const newData = new ArrayBuffer(newSize);
      const newView = new Uint8Array(newData);
      newView.set(new Uint8Array(this.data, 0, this.offset));
      this.data = newData;
      this.view = new DataView(this.data);
    }
  }
  addFloat32(value) {
    const byteOffset = this.offset;
    this.ensureCapacity(4);
    this.view.setFloat32(this.offset, value, true);
    this.offset += 4;
    return byteOffset;
  }
  addUint16(value) {
    const byteOffset = this.offset;
    this.ensureCapacity(2);
    this.view.setUint16(this.offset, value, true);
    this.offset += 2;
    return byteOffset;
  }
  addUint32(value) {
    const byteOffset = this.offset;
    this.ensureCapacity(4);
    this.view.setUint32(this.offset, value, true);
    this.offset += 4;
    return byteOffset;
  }
  addFloat32Array(values) {
    const byteOffset = this.offset;
    this.ensureCapacity(values.length * 4);
    for (const value of values) {
      this.view.setFloat32(this.offset, value, true);
      this.offset += 4;
    }
    return byteOffset;
  }
  addUint16Array(values) {
    const byteOffset = this.offset;
    this.ensureCapacity(values.length * 2);
    for (const value of values) {
      this.view.setUint16(this.offset, value, true);
      this.offset += 2;
    }
    return byteOffset;
  }
  addUint32Array(values) {
    const byteOffset = this.offset;
    this.ensureCapacity(values.length * 4);
    for (const value of values) {
      this.view.setUint32(this.offset, value, true);
      this.offset += 4;
    }
    return byteOffset;
  }
  addBytes(bytes) {
    const byteOffset = this.offset;
    this.ensureCapacity(bytes.length);
    new Uint8Array(this.data, this.offset).set(bytes);
    this.offset += bytes.length;
    return byteOffset;
  }
  align(alignment = 4) {
    const remainder = this.offset % alignment;
    if (remainder !== 0) {
      const padding = alignment - remainder;
      this.ensureCapacity(padding);
      this.offset += padding;
    }
  }
  getBuffer() {
    return this.data.slice(0, this.offset);
  }
  getCurrentOffset() {
    return this.offset;
  }
};

// lib/gltf/geometry.ts
function createBoxMesh(size) {
  const hw = size.x / 2;
  const hh = size.y / 2;
  const hd = size.z / 2;
  const positions = [];
  const normals = [];
  const texcoords = [];
  const indices = [];
  const faces = [
    // Front face (positive Z)
    {
      vertices: [
        [-hw, -hh, hd],
        [hw, -hh, hd],
        [hw, hh, hd],
        [-hw, hh, hd]
      ],
      normal: [0, 0, 1],
      uvs: [
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0]
      ]
    },
    // Back face (negative Z)
    {
      vertices: [
        [hw, -hh, -hd],
        [-hw, -hh, -hd],
        [-hw, hh, -hd],
        [hw, hh, -hd]
      ],
      normal: [0, 0, -1],
      uvs: [
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0]
      ]
    },
    // Top face (positive Y)
    {
      vertices: [
        [-hw, hh, hd],
        [hw, hh, hd],
        [hw, hh, -hd],
        [-hw, hh, -hd]
      ],
      normal: [0, 1, 0],
      uvs: [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1]
      ]
    },
    // Bottom face (negative Y)
    {
      vertices: [
        [-hw, -hh, -hd],
        [hw, -hh, -hd],
        [hw, -hh, hd],
        [-hw, -hh, hd]
      ],
      normal: [0, -1, 0],
      uvs: [
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0]
      ]
    },
    // Right face (positive X)
    {
      vertices: [
        [hw, -hh, hd],
        [hw, -hh, -hd],
        [hw, hh, -hd],
        [hw, hh, hd]
      ],
      normal: [1, 0, 0],
      uvs: [
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0]
      ]
    },
    // Left face (negative X)
    {
      vertices: [
        [-hw, -hh, -hd],
        [-hw, -hh, hd],
        [-hw, hh, hd],
        [-hw, hh, -hd]
      ],
      normal: [-1, 0, 0],
      uvs: [
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0]
      ]
    }
  ];
  let vertexIndex = 0;
  for (const face of faces) {
    for (let i = 0; i < 4; i++) {
      const vertex = face.vertices[i];
      positions.push(vertex[0], vertex[1], vertex[2]);
      normals.push(face.normal[0], face.normal[1], face.normal[2]);
      texcoords.push(face.uvs[i][0], face.uvs[i][1]);
    }
    indices.push(
      vertexIndex,
      vertexIndex + 1,
      vertexIndex + 2,
      vertexIndex,
      vertexIndex + 2,
      vertexIndex + 3
    );
    vertexIndex += 4;
  }
  return { positions, normals, texcoords, indices };
}
function createBoxMeshByFaces(size) {
  const hw = size.x / 2;
  const hh = size.y / 2;
  const hd = size.z / 2;
  const faceDefinitions = {
    // Front face (positive Z)
    front: {
      vertices: [
        [-hw, -hh, hd],
        [hw, -hh, hd],
        [hw, hh, hd],
        [-hw, hh, hd]
      ],
      normal: [0, 0, 1],
      uvs: [
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0]
      ]
    },
    // Back face (negative Z)
    back: {
      vertices: [
        [hw, -hh, -hd],
        [-hw, -hh, -hd],
        [-hw, hh, -hd],
        [hw, hh, -hd]
      ],
      normal: [0, 0, -1],
      uvs: [
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0]
      ]
    },
    // Top face (positive Y)
    top: {
      vertices: [
        [-hw, hh, hd],
        [hw, hh, hd],
        [hw, hh, -hd],
        [-hw, hh, -hd]
      ],
      normal: [0, 1, 0],
      uvs: [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1]
      ]
    },
    // Bottom face (negative Y)
    bottom: {
      vertices: [
        [-hw, -hh, -hd],
        [hw, -hh, -hd],
        [hw, -hh, hd],
        [-hw, -hh, hd]
      ],
      normal: [0, -1, 0],
      uvs: [
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0]
      ]
    },
    // Right face (positive X)
    right: {
      vertices: [
        [hw, -hh, hd],
        [hw, -hh, -hd],
        [hw, hh, -hd],
        [hw, hh, hd]
      ],
      normal: [1, 0, 0],
      uvs: [
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0]
      ]
    },
    // Left face (negative X)
    left: {
      vertices: [
        [-hw, -hh, -hd],
        [-hw, -hh, hd],
        [-hw, hh, hd],
        [-hw, hh, -hd]
      ],
      normal: [-1, 0, 0],
      uvs: [
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0]
      ]
    }
  };
  const result = {};
  for (const [faceName, face] of Object.entries(faceDefinitions)) {
    const positions = [];
    const normals = [];
    const texcoords = [];
    const indices = [0, 1, 2, 0, 2, 3];
    for (let i = 0; i < 4; i++) {
      const vertex = face.vertices[i];
      positions.push(vertex[0], vertex[1], vertex[2]);
      normals.push(face.normal[0], face.normal[1], face.normal[2]);
      texcoords.push(face.uvs[i][0], face.uvs[i][1]);
    }
    result[faceName] = {
      positions,
      normals,
      texcoords,
      indices
    };
  }
  return result;
}
function createMeshFromSTL(stlMesh) {
  const positions = [];
  const normals = [];
  const texcoords = [];
  const indices = [];
  let vertexIndex = 0;
  for (const triangle of stlMesh.triangles) {
    for (const vertex of triangle.vertices) {
      positions.push(vertex.x, vertex.y, vertex.z);
      normals.push(triangle.normal.x, triangle.normal.y, triangle.normal.z);
      texcoords.push(vertex.x, vertex.z);
    }
    indices.push(vertexIndex, vertexIndex + 2, vertexIndex + 1);
    vertexIndex += 3;
  }
  return { positions, normals, texcoords, indices };
}
function createMeshFromOBJ(objMesh) {
  if (!objMesh.materials || objMesh.materials.size === 0) {
    return [{ meshData: createMeshFromSTL(objMesh), materialIndex: -1 }];
  }
  const materialMeshes = /* @__PURE__ */ new Map();
  for (const triangle of objMesh.triangles) {
    const materialIndex = triangle.materialIndex ?? -1;
    if (!materialMeshes.has(materialIndex)) {
      materialMeshes.set(materialIndex, {
        positions: [],
        normals: [],
        texcoords: [],
        indices: []
      });
    }
    const targetMesh = materialMeshes.get(materialIndex);
    const baseIndex = targetMesh.positions.length / 3;
    for (const vertex of triangle.vertices) {
      targetMesh.positions.push(vertex.x, vertex.y, vertex.z);
      targetMesh.normals.push(
        triangle.normal.x,
        triangle.normal.y,
        triangle.normal.z
      );
      targetMesh.texcoords.push(vertex.x, vertex.z);
    }
    targetMesh.indices.push(baseIndex, baseIndex + 2, baseIndex + 1);
  }
  const result = [];
  for (const [materialIndex, meshData] of materialMeshes) {
    if (meshData.positions.length > 0) {
      result.push({ meshData, materialIndex });
    }
  }
  return result.length > 0 ? result : [{ meshData: createMeshFromSTL(objMesh), materialIndex: -1 }];
}
function transformMesh(mesh, translation, rotation, scale) {
  const result = {
    positions: [...mesh.positions],
    normals: [...mesh.normals],
    texcoords: [...mesh.texcoords],
    indices: [...mesh.indices]
  };
  if (mesh.colors) {
    result.colors = [...mesh.colors];
  }
  for (let i = 0; i < result.positions.length; i += 3) {
    let x = result.positions[i];
    let y = result.positions[i + 1];
    let z = result.positions[i + 2];
    if (scale) {
      x *= scale.x;
      y *= scale.y;
      z *= scale.z;
    }
    if (rotation) {
      const cosY = Math.cos(rotation.y);
      const sinY = Math.sin(rotation.y);
      const rx = x * cosY - z * sinY;
      const rz = x * sinY + z * cosY;
      x = rx;
      z = rz;
      const cosX = Math.cos(rotation.x);
      const sinX = Math.sin(rotation.x);
      const ry = y * cosX - z * sinX;
      const rz2 = y * sinX + z * cosX;
      y = ry;
      z = rz2;
      const cosZ = Math.cos(rotation.z);
      const sinZ = Math.sin(rotation.z);
      const rx2 = x * cosZ - y * sinZ;
      const ry2 = x * sinZ + y * cosZ;
      x = rx2;
      y = ry2;
    }
    result.positions[i] = x + translation.x;
    result.positions[i + 1] = y + translation.y;
    result.positions[i + 2] = z + translation.z;
  }
  if (rotation) {
    for (let i = 0; i < result.normals.length; i += 3) {
      let nx = result.normals[i];
      let ny = result.normals[i + 1];
      let nz = result.normals[i + 2];
      const cosY = Math.cos(rotation.y);
      const sinY = Math.sin(rotation.y);
      const rnx = nx * cosY - nz * sinY;
      const rnz = nx * sinY + nz * cosY;
      nx = rnx;
      nz = rnz;
      const cosX = Math.cos(rotation.x);
      const sinX = Math.sin(rotation.x);
      const rny = ny * cosX - nz * sinX;
      const rnz2 = ny * sinX + nz * cosX;
      ny = rny;
      nz = rnz2;
      const cosZ = Math.cos(rotation.z);
      const sinZ = Math.sin(rotation.z);
      const rnx2 = nx * cosZ - ny * sinZ;
      const rny2 = nx * sinZ + ny * cosZ;
      nx = rnx2;
      ny = rny2;
      result.normals[i] = nx;
      result.normals[i + 1] = ny;
      result.normals[i + 2] = nz;
    }
  }
  return result;
}
function convertMeshToGLTFOrientation(mesh) {
  const result = {
    positions: [...mesh.positions],
    normals: [...mesh.normals],
    texcoords: [...mesh.texcoords],
    indices: [...mesh.indices]
  };
  if (mesh.colors) {
    result.colors = [...mesh.colors];
  }
  for (let i = 0; i < result.positions.length; i += 3) {
    const x = result.positions[i];
    if (typeof x === "number") {
      result.positions[i] = -x;
    }
  }
  for (let i = 0; i < result.normals.length; i += 3) {
    const nx = result.normals[i];
    if (typeof nx === "number") {
      result.normals[i] = -nx;
    }
  }
  for (let i = 0; i < result.indices.length; i += 3) {
    const i1 = result.indices[i + 1];
    const i2 = result.indices[i + 2];
    if (typeof i1 === "number" && typeof i2 === "number") {
      result.indices[i + 1] = i2;
      result.indices[i + 2] = i1;
    }
  }
  return result;
}
function getBounds(positions) {
  if (positions.length === 0) {
    return {
      min: { x: 0, y: 0, z: 0 },
      max: { x: 0, y: 0, z: 0 }
    };
  }
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    minZ = Math.min(minZ, z);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    maxZ = Math.max(maxZ, z);
  }
  return {
    min: { x: minX, y: minY, z: minZ },
    max: { x: maxX, y: maxY, z: maxZ }
  };
}

// lib/gltf/gltf-builder.ts
var GLTFBuilder = class {
  gltf;
  bufferBuilder;
  nodes;
  meshes;
  materials;
  accessors;
  bufferViews;
  textures;
  images;
  imageDataMap;
  meshCache;
  materialCache;
  constructor() {
    this.gltf = {
      asset: {
        version: "2.0",
        generator: "circuit-json-to-gltf"
      },
      scene: 0,
      scenes: [{ name: "Scene", nodes: [] }]
    };
    this.bufferBuilder = new BufferBuilder();
    this.nodes = [];
    this.meshes = [];
    this.materials = [];
    this.accessors = [];
    this.bufferViews = [];
    this.textures = [];
    this.images = [];
    this.imageDataMap = /* @__PURE__ */ new Map();
    this.meshCache = /* @__PURE__ */ new Map();
    this.materialCache = /* @__PURE__ */ new Map();
  }
  async buildFromScene3D(scene3D) {
    const defaultMaterialIndex = this.addMaterial({
      name: "Default",
      pbrMetallicRoughness: {
        baseColorFactor: [0.35, 0.35, 0.35, 0.5],
        metallicFactor: 0.05,
        roughnessFactor: 0.95
      },
      alphaMode: "BLEND"
    });
    for (let i = 0; i < scene3D.boxes.length; i++) {
      const box = scene3D.boxes[i];
      await this.addBox(box, defaultMaterialIndex);
    }
  }
  async addBox(box, defaultMaterialIndex) {
    if (box.texture && (box.texture.top || box.texture.bottom)) {
      await this.addBoxWithFaceMaterials(box, defaultMaterialIndex);
      return;
    }
    if (box.mesh && "materials" in box.mesh && box.mesh.materials) {
      await this.addOBJMeshWithMaterials(box, box.mesh);
      return;
    }
    let meshData;
    if (box.mesh) {
      meshData = createMeshFromSTL(box.mesh);
    } else {
      meshData = createBoxMesh(box.size);
    }
    meshData = transformMesh(meshData, { x: 0, y: 0, z: 0 }, box.rotation);
    meshData = convertMeshToGLTFOrientation(meshData);
    let materialIndex = defaultMaterialIndex;
    if (box.color) {
      materialIndex = this.addMaterialFromColor({
        color: box.color,
        makeTransparent: !box.mesh,
        isTranslucent: box.isTranslucent
      });
    } else if (box.mesh) {
      const opacity = box.isTranslucent ? 0.5 : 1;
      materialIndex = this.addMaterial({
        name: `MeshMaterial_${this.materials.length}`,
        pbrMetallicRoughness: {
          baseColorFactor: [0.7, 0.7, 0.7, opacity],
          metallicFactor: 0.1,
          roughnessFactor: 0.9
        },
        alphaMode: box.isTranslucent ? "BLEND" : "OPAQUE",
        doubleSided: box.isTranslucent ? true : void 0
      });
    }
    const meshIndex = this.addMesh(meshData, materialIndex, box.label);
    const nodeIndex = this.nodes.length;
    this.nodes.push({
      name: box.label || `Box${nodeIndex}`,
      mesh: meshIndex,
      translation: this.toGltfTranslation(box.center)
    });
    this.gltf.scenes[0].nodes.push(nodeIndex);
  }
  async addOBJMeshWithMaterials(box, objMesh) {
    const meshDataArray = createMeshFromOBJ(objMesh);
    const objMaterialIndices = /* @__PURE__ */ new Map();
    for (const [name, objMaterial] of objMesh.materials) {
      let baseColor = [0.3, 0.3, 0.3, 1];
      if (objMaterial.color) {
        const color = typeof objMaterial.color === "string" ? this.parseColorString(objMaterial.color) : [
          objMaterial.color[0] / 255,
          objMaterial.color[1] / 255,
          objMaterial.color[2] / 255,
          objMaterial.color[3]
          // Use the alpha from the color
        ];
        baseColor = [color[0], color[1], color[2], color[3]];
      }
      let alpha = baseColor[3];
      if (objMaterial.dissolve !== void 0) {
        alpha = objMaterial.dissolve > 0 && objMaterial.dissolve < 1 ? objMaterial.dissolve : 1;
      }
      if (box.isTranslucent) {
        alpha = 0.5;
      }
      baseColor[3] = alpha;
      const gltfMaterialIndex = this.addMaterial({
        name: `OBJ_${name}`,
        pbrMetallicRoughness: {
          baseColorFactor: baseColor,
          metallicFactor: 0.05,
          roughnessFactor: 0.95
        },
        alphaMode: alpha < 1 ? "BLEND" : "OPAQUE",
        doubleSided: box.isTranslucent ? true : void 0
      });
      const materialIndex = objMesh.materialIndexMap?.get(name) ?? -1;
      objMaterialIndices.set(materialIndex, gltfMaterialIndex);
    }
    const preparedPrimitives = [];
    for (const { meshData, materialIndex } of meshDataArray) {
      const translatedMesh = transformMesh(
        meshData,
        { x: 0, y: 0, z: 0 },
        box.rotation
      );
      const transformedMeshData = convertMeshToGLTFOrientation(translatedMesh);
      const gltfMaterialIndex = objMaterialIndices.get(materialIndex) ?? objMaterialIndices.values().next().value ?? this.materials.length - 1;
      preparedPrimitives.push({
        material: gltfMaterialIndex,
        meshData: transformedMeshData
      });
    }
    const meshIndex = this.addMultiPrimitiveMesh(
      preparedPrimitives,
      box.label || `OBJMesh${this.meshes.length}`,
      "obj"
    );
    const nodeIndex = this.nodes.length;
    this.nodes.push({
      name: box.label || `OBJBox${nodeIndex}`,
      mesh: meshIndex,
      translation: this.toGltfTranslation(box.center)
    });
    this.gltf.scenes[0].nodes.push(nodeIndex);
  }
  async addMeshWithFaceTextures(box, defaultMaterialIndex) {
    const topTriangles = [];
    const bottomTriangles = [];
    const sideTriangles = [];
    const yThreshold = 0.8;
    for (const triangle of box.mesh.triangles) {
      const ny = Math.abs(triangle.normal.y);
      if (ny > yThreshold) {
        if (triangle.normal.y > 0) {
          topTriangles.push(triangle);
        } else {
          bottomTriangles.push(triangle);
        }
      } else {
        sideTriangles.push(triangle);
      }
    }
    const materials = [];
    if (topTriangles.length > 0 && box.texture?.top) {
      const topMaterialIndex = this.addMaterial({
        name: `TopMaterial_${this.materials.length}`,
        pbrMetallicRoughness: {
          baseColorFactor: [1, 1, 1, 1],
          metallicFactor: 0,
          roughnessFactor: 0.8
        },
        alphaMode: "OPAQUE",
        doubleSided: true
      });
      const textureIndex = await this.addTextureFromDataUrl(box.texture.top);
      if (textureIndex !== -1) {
        const material = this.materials[topMaterialIndex];
        if (material.pbrMetallicRoughness) {
          material.pbrMetallicRoughness.baseColorTexture = {
            index: textureIndex
          };
        }
      }
      materials.push({
        triangles: topTriangles,
        materialIndex: topMaterialIndex
      });
    }
    if (bottomTriangles.length > 0 && box.texture?.bottom) {
      const bottomMaterialIndex = this.addMaterial({
        name: `BottomMaterial_${this.materials.length}`,
        pbrMetallicRoughness: {
          // baseColorFactor: [     0.04,
          //   0.16,
          //   0.08, 1.0],
          metallicFactor: 0,
          roughnessFactor: 0.8
        },
        alphaMode: "OPAQUE",
        doubleSided: true
      });
      const textureIndex = await this.addTextureFromDataUrl(box.texture.bottom);
      if (textureIndex !== -1) {
        const material = this.materials[bottomMaterialIndex];
        if (material.pbrMetallicRoughness) {
          material.pbrMetallicRoughness.baseColorTexture = {
            index: textureIndex
          };
        }
      }
      materials.push({
        triangles: bottomTriangles,
        materialIndex: bottomMaterialIndex
      });
    }
    if (sideTriangles.length > 0) {
      const sideMaterialIndex = this.addMaterial({
        name: `GreenSideMaterial_${this.materials.length}`,
        pbrMetallicRoughness: {
          baseColorFactor: [0.04, 0.16, 0.08, 1],
          metallicFactor: 0,
          roughnessFactor: 0.8
        },
        alphaMode: "OPAQUE",
        doubleSided: true
      });
      materials.push({
        triangles: sideTriangles,
        materialIndex: sideMaterialIndex
      });
    }
    const primitives = [];
    const bounds = getBounds([]);
    let minX = Infinity;
    let minY = Infinity;
    let minZ = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let maxZ = -Infinity;
    for (const triangle of box.mesh.triangles) {
      for (const v of triangle.vertices) {
        minX = Math.min(minX, v.x);
        minY = Math.min(minY, v.y);
        minZ = Math.min(minZ, v.z);
        maxX = Math.max(maxX, v.x);
        maxY = Math.max(maxY, v.y);
        maxZ = Math.max(maxZ, v.z);
      }
    }
    const sizeX = maxX - minX;
    const sizeZ = maxZ - minZ;
    for (const { triangles, materialIndex } of materials) {
      const positions = [];
      const normals = [];
      const texcoords = [];
      const indices = [];
      let vertexIndex = 0;
      for (const triangle of triangles) {
        for (const v of triangle.vertices) {
          positions.push(v.x, v.y, v.z);
          normals.push(triangle.normal.x, triangle.normal.y, triangle.normal.z);
          const u = sizeX > 0 ? (v.x - minX) / sizeX : 0.5;
          const v_coord = sizeZ > 0 ? (v.z - minZ) / sizeZ : 0.5;
          texcoords.push(u, 1 - v_coord);
        }
        indices.push(vertexIndex, vertexIndex + 1, vertexIndex + 2);
        vertexIndex += 3;
      }
      const meshData = { positions, normals, texcoords, indices };
      const transformedMeshData = convertMeshToGLTFOrientation(
        transformMesh(meshData, { x: 0, y: 0, z: 0 }, box.rotation)
      );
      const positionAccessorIndex = this.addAccessor(
        transformedMeshData.positions,
        "VEC3",
        COMPONENT_TYPE.FLOAT,
        TARGET.ARRAY_BUFFER
      );
      const normalAccessorIndex = this.addAccessor(
        transformedMeshData.normals,
        "VEC3",
        COMPONENT_TYPE.FLOAT,
        TARGET.ARRAY_BUFFER
      );
      const texcoordAccessorIndex = this.addAccessor(
        transformedMeshData.texcoords,
        "VEC2",
        COMPONENT_TYPE.FLOAT,
        TARGET.ARRAY_BUFFER
      );
      const indicesAccessorIndex = this.addAccessor(
        transformedMeshData.indices,
        "SCALAR",
        COMPONENT_TYPE.UNSIGNED_SHORT,
        TARGET.ELEMENT_ARRAY_BUFFER
      );
      primitives.push({
        attributes: {
          POSITION: positionAccessorIndex,
          NORMAL: normalAccessorIndex,
          TEXCOORD_0: texcoordAccessorIndex
        },
        indices: indicesAccessorIndex,
        material: materialIndex,
        mode: PRIMITIVE_MODE.TRIANGLES
      });
    }
    const meshIndex = this.meshes.length;
    this.meshes.push({
      name: box.label || `MeshWithTextures${meshIndex}`,
      primitives
    });
    const nodeIndex = this.nodes.length;
    this.nodes.push({
      name: box.label || `Box${nodeIndex}`,
      mesh: meshIndex,
      translation: this.toGltfTranslation(box.center)
    });
    this.gltf.scenes[0].nodes.push(nodeIndex);
  }
  async addBoxWithFaceMaterials(box, defaultMaterialIndex) {
    if (box.mesh) {
      await this.addMeshWithFaceTextures(box, defaultMaterialIndex);
      return;
    }
    const faceMeshes = createBoxMeshByFaces(box.size);
    const faceMaterials = {};
    if (box.texture?.top) {
      const topMaterialIndex = this.addMaterial({
        name: `TopMaterial_${this.materials.length}`,
        pbrMetallicRoughness: {
          baseColorFactor: [0.04, 0.16, 0.08, 1],
          metallicFactor: 0,
          roughnessFactor: 0.8
        },
        alphaMode: "OPAQUE"
      });
      const textureIndex = await this.addTextureFromDataUrl(box.texture.top);
      if (textureIndex !== -1) {
        const material = this.materials[topMaterialIndex];
        if (material.pbrMetallicRoughness) {
          material.pbrMetallicRoughness.baseColorTexture = {
            index: textureIndex
          };
        }
      }
      faceMaterials.top = topMaterialIndex;
    } else {
      faceMaterials.top = defaultMaterialIndex;
    }
    if (box.texture?.bottom) {
      const bottomMaterialIndex = this.addMaterial({
        name: `BottomMaterial_${this.materials.length}`,
        pbrMetallicRoughness: {
          baseColorFactor: [0.04, 0.16, 0.08, 1],
          metallicFactor: 0,
          roughnessFactor: 0.8
        },
        alphaMode: "OPAQUE"
      });
      const textureIndex = await this.addTextureFromDataUrl(box.texture.bottom);
      if (textureIndex !== -1) {
        const material = this.materials[bottomMaterialIndex];
        if (material.pbrMetallicRoughness) {
          material.pbrMetallicRoughness.baseColorTexture = {
            index: textureIndex
          };
        }
      }
      faceMaterials.bottom = bottomMaterialIndex;
    } else {
      faceMaterials.bottom = defaultMaterialIndex;
    }
    const greenMaterialIndex = this.addMaterial({
      name: `GreenSideMaterial_${this.materials.length}`,
      pbrMetallicRoughness: {
        baseColorFactor: [0.04, 0.16, 0.08, 1],
        // Green color for PCB sides
        metallicFactor: 0,
        roughnessFactor: 0.8
      },
      alphaMode: "OPAQUE"
    });
    faceMaterials.front = greenMaterialIndex;
    faceMaterials.back = greenMaterialIndex;
    faceMaterials.left = greenMaterialIndex;
    faceMaterials.right = greenMaterialIndex;
    const meshIndex = this.meshes.length;
    const primitives = [];
    for (const [faceName, faceData] of Object.entries(faceMeshes)) {
      const transformedFaceData = convertMeshToGLTFOrientation(
        transformMesh(faceData, { x: 0, y: 0, z: 0 }, box.rotation)
      );
      const positionAccessorIndex = this.addAccessor(
        transformedFaceData.positions,
        "VEC3",
        COMPONENT_TYPE.FLOAT,
        TARGET.ARRAY_BUFFER
      );
      const normalAccessorIndex = this.addAccessor(
        transformedFaceData.normals,
        "VEC3",
        COMPONENT_TYPE.FLOAT,
        TARGET.ARRAY_BUFFER
      );
      const texcoordAccessorIndex = this.addAccessor(
        transformedFaceData.texcoords,
        "VEC2",
        COMPONENT_TYPE.FLOAT,
        TARGET.ARRAY_BUFFER
      );
      const indicesAccessorIndex = this.addAccessor(
        transformedFaceData.indices,
        "SCALAR",
        COMPONENT_TYPE.UNSIGNED_SHORT,
        TARGET.ELEMENT_ARRAY_BUFFER
      );
      primitives.push({
        attributes: {
          POSITION: positionAccessorIndex,
          NORMAL: normalAccessorIndex,
          TEXCOORD_0: texcoordAccessorIndex
        },
        indices: indicesAccessorIndex,
        material: faceMaterials[faceName],
        mode: PRIMITIVE_MODE.TRIANGLES
      });
    }
    this.meshes.push({
      name: box.label || `BoxMesh${meshIndex}`,
      primitives
    });
    const nodeIndex = this.nodes.length;
    this.nodes.push({
      name: box.label || `Box${nodeIndex}`,
      mesh: meshIndex,
      translation: this.toGltfTranslation(box.center)
    });
    this.gltf.scenes[0].nodes.push(nodeIndex);
  }
  addMesh(meshData, materialIndex, name) {
    const meshCacheKey = this.getMeshCacheKey(meshData, materialIndex);
    const cachedMeshIndex = this.meshCache.get(meshCacheKey);
    if (cachedMeshIndex !== void 0) {
      return cachedMeshIndex;
    }
    const meshIndex = this.meshes.length;
    const positionAccessorIndex = this.addAccessor(
      meshData.positions,
      "VEC3",
      COMPONENT_TYPE.FLOAT,
      TARGET.ARRAY_BUFFER
    );
    const normalAccessorIndex = this.addAccessor(
      meshData.normals,
      "VEC3",
      COMPONENT_TYPE.FLOAT,
      TARGET.ARRAY_BUFFER
    );
    const texcoordAccessorIndex = this.addAccessor(
      meshData.texcoords,
      "VEC2",
      COMPONENT_TYPE.FLOAT,
      TARGET.ARRAY_BUFFER
    );
    const indicesAccessorIndex = this.addAccessor(
      meshData.indices,
      "SCALAR",
      COMPONENT_TYPE.UNSIGNED_SHORT,
      TARGET.ELEMENT_ARRAY_BUFFER
    );
    this.meshes.push({
      name: name || `Mesh${meshIndex}`,
      primitives: [
        {
          attributes: {
            POSITION: positionAccessorIndex,
            NORMAL: normalAccessorIndex,
            TEXCOORD_0: texcoordAccessorIndex
          },
          indices: indicesAccessorIndex,
          material: materialIndex,
          mode: PRIMITIVE_MODE.TRIANGLES
        }
      ]
    });
    this.meshCache.set(meshCacheKey, meshIndex);
    return meshIndex;
  }
  toGltfTranslation(center) {
    return [-center.x, center.y, center.z];
  }
  getMeshCacheKey(meshData, materialIndex) {
    return `${materialIndex}:${this.hashNumberArray(meshData.positions)}:${this.hashNumberArray(meshData.normals)}:${this.hashNumberArray(meshData.texcoords)}:${this.hashNumberArray(meshData.indices)}`;
  }
  hashNumberArray(values) {
    let hash = 2166136261;
    for (let i = 0; i < values.length; i++) {
      const rounded = Math.round(values[i] * 1e6);
      hash ^= rounded;
      hash = Math.imul(hash, 16777619);
    }
    return `${values.length}:${hash >>> 0}`;
  }
  addMultiPrimitiveMesh(primitives, name, cachePrefix) {
    const meshCacheKey = `${cachePrefix}:${primitives.map(
      (primitive) => `${primitive.material}:${this.hashNumberArray(
        primitive.meshData.positions
      )}:${this.hashNumberArray(primitive.meshData.normals)}:${this.hashNumberArray(
        primitive.meshData.texcoords
      )}:${this.hashNumberArray(primitive.meshData.indices)}`
    ).join("|")}`;
    const cachedMeshIndex = this.meshCache.get(meshCacheKey);
    if (cachedMeshIndex !== void 0) {
      return cachedMeshIndex;
    }
    const meshIndex = this.meshes.length;
    const gltfPrimitives = primitives.map((primitive) => {
      const positionAccessorIndex = this.addAccessor(
        primitive.meshData.positions,
        "VEC3",
        COMPONENT_TYPE.FLOAT,
        TARGET.ARRAY_BUFFER
      );
      const normalAccessorIndex = this.addAccessor(
        primitive.meshData.normals,
        "VEC3",
        COMPONENT_TYPE.FLOAT,
        TARGET.ARRAY_BUFFER
      );
      const texcoordAccessorIndex = this.addAccessor(
        primitive.meshData.texcoords,
        "VEC2",
        COMPONENT_TYPE.FLOAT,
        TARGET.ARRAY_BUFFER
      );
      const indicesAccessorIndex = this.addAccessor(
        primitive.meshData.indices,
        "SCALAR",
        COMPONENT_TYPE.UNSIGNED_INT,
        TARGET.ELEMENT_ARRAY_BUFFER
      );
      return {
        attributes: {
          POSITION: positionAccessorIndex,
          NORMAL: normalAccessorIndex,
          TEXCOORD_0: texcoordAccessorIndex
        },
        indices: indicesAccessorIndex,
        material: primitive.material,
        mode: PRIMITIVE_MODE.TRIANGLES
      };
    });
    this.meshes.push({
      name,
      primitives: gltfPrimitives
    });
    this.meshCache.set(meshCacheKey, meshIndex);
    return meshIndex;
  }
  getMaterialCacheKey(material) {
    const { name: _name, ...materialWithoutName } = material;
    return JSON.stringify(materialWithoutName);
  }
  addAccessor(data, type, componentType, target) {
    const accessorIndex = this.accessors.length;
    const bufferViewIndex = this.bufferViews.length;
    let byteOffset;
    let byteLength;
    if (componentType === COMPONENT_TYPE.FLOAT) {
      byteOffset = this.bufferBuilder.addFloat32Array(data);
      byteLength = data.length * 4;
    } else if (componentType === COMPONENT_TYPE.UNSIGNED_SHORT) {
      byteOffset = this.bufferBuilder.addUint16Array(data);
      byteLength = data.length * 2;
    } else if (componentType === COMPONENT_TYPE.UNSIGNED_INT) {
      byteOffset = this.bufferBuilder.addUint32Array(data);
      byteLength = data.length * 4;
    } else {
      throw new Error(`Unsupported component type: ${componentType}`);
    }
    this.bufferViews.push({
      buffer: 0,
      byteOffset,
      byteLength,
      target
    });
    let count;
    switch (type) {
      case "SCALAR":
        count = data.length;
        break;
      case "VEC2":
        count = data.length / 2;
        break;
      case "VEC3":
        count = data.length / 3;
        break;
      default:
        throw new Error(`Unsupported type: ${type}`);
    }
    let min;
    let max;
    if (type === "VEC3" && target === TARGET.ARRAY_BUFFER) {
      const bounds = getBounds(data);
      min = [bounds.min.x, bounds.min.y, bounds.min.z];
      max = [bounds.max.x, bounds.max.y, bounds.max.z];
    }
    this.accessors.push({
      bufferView: bufferViewIndex,
      componentType,
      count,
      type,
      min,
      max
    });
    return accessorIndex;
  }
  addMaterial(material) {
    const materialCacheKey = this.getMaterialCacheKey(material);
    const cachedMaterialIndex = this.materialCache.get(materialCacheKey);
    if (cachedMaterialIndex !== void 0) {
      return cachedMaterialIndex;
    }
    const index = this.materials.length;
    this.materials.push(material);
    this.materialCache.set(materialCacheKey, index);
    return index;
  }
  addMaterialFromColor(opts) {
    const { color, makeTransparent = false, isTranslucent = false } = opts;
    const baseColor = typeof color === "string" ? this.parseColorString(color) : [color[0] / 255, color[1] / 255, color[2] / 255, color[3]];
    if (makeTransparent) {
      baseColor[3] = 0.5;
    }
    return this.addMaterial({
      name: `Material_${this.materials.length}`,
      pbrMetallicRoughness: {
        baseColorFactor: baseColor,
        metallicFactor: 0.05,
        roughnessFactor: 0.95
      },
      alphaMode: makeTransparent || isTranslucent ? "BLEND" : "OPAQUE",
      doubleSided: isTranslucent ? true : void 0
    });
  }
  parseColorString(color) {
    if (color.startsWith("#")) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16) / 255;
      const g = parseInt(hex.slice(2, 4), 16) / 255;
      const b = parseInt(hex.slice(4, 6), 16) / 255;
      const a = hex.length > 6 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
      return [r, g, b, a];
    } else if (color.startsWith("rgba(")) {
      const match = color.match(/rgba\(([^)]+)\)/);
      if (match) {
        const parts = match[1].split(",").map((s) => s.trim());
        return [
          parseFloat(parts[0]) / 255,
          parseFloat(parts[1]) / 255,
          parseFloat(parts[2]) / 255,
          parseFloat(parts[3])
        ];
      }
    } else if (color.startsWith("rgb(")) {
      const match = color.match(/rgb\(([^)]+)\)/);
      if (match) {
        const parts = match[1].split(",").map((s) => s.trim());
        return [
          parseFloat(parts[0]) / 255,
          parseFloat(parts[1]) / 255,
          parseFloat(parts[2]) / 255,
          1
        ];
      }
    }
    const namedColors = {
      white: [1, 1, 1, 1],
      black: [0, 0, 0, 1],
      red: [1, 0, 0, 1],
      green: [0, 1, 0, 1],
      blue: [0, 0, 1, 1],
      gray: [0.5, 0.5, 0.5, 1],
      grey: [0.5, 0.5, 0.5, 1]
    };
    return namedColors[color.toLowerCase()] || [0.5, 0.5, 0.5, 1];
  }
  async addTextureFromDataUrl(dataUrl) {
    try {
      const base64Match = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
      if (!base64Match) {
        console.warn("Invalid data URL format");
        return -1;
      }
      const mimeType = `image/${base64Match[1]}`;
      const base64Data = base64Match[2];
      const imageData = Uint8Array.from(
        atob(base64Data),
        (c) => c.charCodeAt(0)
      );
      const imageIndex = this.images.length;
      this.imageDataMap.set(`image${imageIndex}`, imageData);
      this.images.push({
        mimeType,
        bufferView: -1
        // Will be set when finalizing
      });
      const textureIndex = this.textures.length;
      this.textures.push({
        source: imageIndex,
        sampler: 0
        // Use default sampler
      });
      return textureIndex;
    } catch (error) {
      console.warn("Failed to add texture:", error);
      return -1;
    }
  }
  export(binary = false) {
    this.gltf.nodes = this.nodes;
    this.gltf.meshes = this.meshes;
    this.gltf.materials = this.materials;
    this.gltf.accessors = this.accessors;
    this.gltf.bufferViews = this.bufferViews;
    if (this.images.length > 0) {
      for (let i = 0; i < this.images.length; i++) {
        const imageData = this.imageDataMap.get(`image${i}`);
        if (imageData) {
          const byteOffset = this.bufferBuilder.addBytes(imageData);
          const bufferViewIndex = this.bufferViews.length;
          this.bufferViews.push({
            buffer: 0,
            byteOffset,
            byteLength: imageData.length
          });
          this.images[i].bufferView = bufferViewIndex;
        }
      }
      this.gltf.images = this.images;
      this.gltf.textures = this.textures;
      this.gltf.samplers = [
        {
          magFilter: FILTER.LINEAR,
          minFilter: FILTER.LINEAR_MIPMAP_LINEAR,
          wrapS: WRAP.REPEAT,
          wrapT: WRAP.REPEAT
        }
      ];
    }
    const bufferData = this.bufferBuilder.getBuffer();
    if (binary) {
      return this.createGLB(this.gltf, bufferData);
    } else {
      this.gltf.buffers = [
        {
          byteLength: bufferData.byteLength,
          uri: `data:application/octet-stream;base64,${this.arrayBufferToBase64(
            bufferData
          )}`
        }
      ];
      return this.gltf;
    }
  }
  createGLB(gltf, bufferData) {
    const gltfWithBuffer = {
      ...gltf,
      buffers: [
        {
          byteLength: bufferData.byteLength
        }
      ]
    };
    const jsonString = JSON.stringify(gltfWithBuffer);
    const jsonData = new TextEncoder().encode(jsonString);
    const jsonPadding = (4 - jsonData.length % 4) % 4;
    const jsonLength = jsonData.length + jsonPadding;
    const binPadding = (4 - bufferData.byteLength % 4) % 4;
    const binLength = bufferData.byteLength + binPadding;
    const totalSize = 12 + 8 + jsonLength + 8 + binLength;
    const glb = new ArrayBuffer(totalSize);
    const view = new DataView(glb);
    view.setUint32(0, 1179937895, true);
    view.setUint32(4, 2, true);
    view.setUint32(8, totalSize, true);
    view.setUint32(12, jsonLength, true);
    view.setUint32(16, 1313821514, true);
    const jsonArray = new Uint8Array(glb, 20, jsonLength);
    jsonArray.set(jsonData);
    for (let i = jsonData.length; i < jsonLength; i++) {
      jsonArray[i] = 32;
    }
    const binChunkOffset = 20 + jsonLength;
    view.setUint32(binChunkOffset, binLength, true);
    view.setUint32(binChunkOffset + 4, 5130562, true);
    const binArray = new Uint8Array(
      glb,
      binChunkOffset + 8,
      bufferData.byteLength
    );
    binArray.set(new Uint8Array(bufferData));
    return glb;
  }
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
};

// lib/converters/scene-to-gltf.ts
async function convertSceneToGLTF(scene, options = {}) {
  const builder = new GLTFBuilder();
  await builder.buildFromScene3D(scene);
  const result = builder.export(options.binary);
  return result;
}

// lib/utils/camera-position.ts
var DEFAULT_CAMERA_DIRECTION = [-0.7, 1.2, -0.8];
var TOP_DOWN_TILT = 1e-3;
var DEFAULT_PSEUDO_ORTHO_FOV = 4;
var CAMERA_PRESET_DIRECTIONS = {
  isometric: DEFAULT_CAMERA_DIRECTION,
  top_down: [0, 1, TOP_DOWN_TILT],
  bottom_up: [0, -1, TOP_DOWN_TILT],
  left_side: [-1, 0, 0],
  right_side: [1, 0, 0],
  front: [0, 0, 1],
  back: [0, 0, -1]
};
function normalizeVector([x, y, z]) {
  const length = Math.hypot(x, y, z);
  if (length === 0) {
    return [0, 1, 0];
  }
  return [x / length, y / length, z / length];
}
function dot([ax, ay, az], [bx, by, bz]) {
  return ax * bx + ay * by + az * bz;
}
function cross([ax, ay, az], [bx, by, bz]) {
  return [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx];
}
function getPresetDirection(preset) {
  return preset ? CAMERA_PRESET_DIRECTIONS[preset] : DEFAULT_CAMERA_DIRECTION;
}
function getVerticalFovRadians(opts) {
  if (opts?.focalLength !== void 0 && opts.sensorHeight !== void 0 && opts.focalLength > 0 && opts.sensorHeight > 0) {
    return 2 * Math.atan(opts.sensorHeight / (2 * opts.focalLength));
  }
  const fovDegrees = opts?.fov ?? (opts?.ortho ? DEFAULT_PSEUDO_ORTHO_FOV : 50);
  const fovRadians = fovDegrees * Math.PI / 180;
  if (!Number.isFinite(fovRadians) || fovRadians <= 0) {
    return 50 * Math.PI / 180;
  }
  return Math.min(Math.max(fovRadians, 0.01), Math.PI - 0.01);
}
function getVerticalFovDegrees(opts) {
  return getVerticalFovRadians(opts) * 180 / Math.PI;
}
function getRequiredDistanceForFrustum(corners, cameraDirection, right, up, tanHalfHorizontal, tanHalfVertical) {
  let requiredDistance = 0;
  for (const corner of corners) {
    const u = [corner[0], corner[1], corner[2]];
    const un = dot(u, cameraDirection);
    const ur = Math.abs(dot(u, right));
    const uu = Math.abs(dot(u, up));
    const distanceForHorizontal = un + ur / tanHalfHorizontal;
    const distanceForVertical = un + uu / tanHalfVertical;
    requiredDistance = Math.max(
      requiredDistance,
      distanceForHorizontal,
      distanceForVertical
    );
  }
  return requiredDistance;
}
function getBestCameraPosition(circuitJson, opts) {
  const verticalFovDegrees = getVerticalFovDegrees(opts);
  const panel = circuitJson.find((item) => item.type === "pcb_panel");
  const board = circuitJson.find((item) => item.type === "pcb_board");
  const surface = panel || board;
  if (!surface) {
    return {
      camPos: [30, 30, 25],
      lookAt: [0, 0, 0],
      fov: verticalFovDegrees
    };
  }
  const { width, height, center } = surface;
  if (!width || !height || !center) {
    return {
      camPos: [30, 30, 25],
      lookAt: [0, 0, 0],
      fov: verticalFovDegrees
    };
  }
  const lookAtX = center.x;
  const lookAtZ = center.y;
  const cameraDirection = normalizeVector(
    opts?.direction ?? getPresetDirection(opts?.preset)
  );
  const forward = [
    -cameraDirection[0],
    -cameraDirection[1],
    -cameraDirection[2]
  ];
  const worldUp = [0, 1, 0];
  const right = normalizeVector(cross(forward, worldUp));
  const up = normalizeVector(cross(right, forward));
  const verticalFov = verticalFovDegrees * Math.PI / 180;
  const aspectRatio = opts?.aspectRatio !== void 0 && Number.isFinite(opts.aspectRatio) && opts.aspectRatio > 0 ? opts.aspectRatio : 4 / 3;
  const tanHalfVertical = Math.tan(verticalFov / 2);
  const tanHalfHorizontal = tanHalfVertical * aspectRatio;
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const boardCorners = [
    [halfWidth, 0, halfHeight],
    [halfWidth, 0, -halfHeight],
    [-halfWidth, 0, halfHeight],
    [-halfWidth, 0, -halfHeight]
  ];
  const requiredDistanceAssumingVerticalFov = getRequiredDistanceForFrustum(
    boardCorners,
    cameraDirection,
    right,
    up,
    tanHalfHorizontal,
    tanHalfVertical
  );
  const tanHalfHorizontalIfFovIsHorizontal = tanHalfVertical;
  const tanHalfVerticalIfFovIsHorizontal = tanHalfHorizontalIfFovIsHorizontal / aspectRatio;
  const requiredDistanceAssumingHorizontalFov = getRequiredDistanceForFrustum(
    boardCorners,
    cameraDirection,
    right,
    up,
    tanHalfHorizontalIfFovIsHorizontal,
    tanHalfVerticalIfFovIsHorizontal
  );
  const requiredDistance = Math.max(
    requiredDistanceAssumingVerticalFov,
    requiredDistanceAssumingHorizontalFov
  );
  const distance = Math.max(requiredDistance, 1);
  const camX = lookAtX + cameraDirection[0] * distance;
  const camY = cameraDirection[1] * distance;
  const camZ = lookAtZ + cameraDirection[2] * distance;
  return {
    camPos: [-camX, camY, camZ],
    lookAt: [-lookAtX, 0, lookAtZ],
    fov: verticalFovDegrees
  };
}

// lib/index.ts
async function convertCircuitJsonToGltf(circuitJson, options = {}) {
  const {
    format = "gltf",
    boardTextureResolution = 1024,
    showPcbNotes = false,
    boardDrillQuality = "fast",
    drawFauxBoard = false,
    includeModels = true,
    modelCache,
    backgroundColor,
    showBoundingBoxes = false
  } = options;
  const scene3D = await convertCircuitJsonTo3D(circuitJson, {
    renderBoardTextures: true,
    textureResolution: boardTextureResolution,
    showPcbNotes,
    boardDrillQuality,
    drawFauxBoard,
    coordinateTransform: options.coordinateTransform,
    showBoundingBoxes,
    projectBaseUrl: options.projectBaseUrl,
    authHeaders: options.authHeaders
  });
  const gltfOptions = {
    binary: format === "glb",
    embedImages: true,
    forceIndices: true
  };
  const result = await convertSceneToGLTF(scene3D, gltfOptions);
  return result;
}
export {
  CAMERA_PRESET_DIRECTIONS,
  COORDINATE_TRANSFORMS,
  applyCoordinateTransform,
  clearGLBCache,
  clearOBJCache,
  clearSTLCache,
  convertCircuitJsonTo3D,
  convertCircuitJsonToGltf,
  convertSceneToGLTF,
  getBestCameraPosition,
  loadGLB,
  loadOBJ,
  loadSTL,
  renderBoardLayer,
  renderBoardTextures,
  transformTriangles
};
