const math = require('math.js');
//Import all math models

const cross = ([x1, y1, z1], [x2, y2, z2]) => {
  return [math.subtract(math.multiply(y1, z2), math.multiply(z1, y2)), math.subtract(math.multiply(z1, x2), math.multiply(x1, z2)), math.subtract(math.multiply(x1, y2), math.multiply(y1, x2))];
}

const dot = ([x1, y1, z1], [x2, y2, z2]) => {
  return math.add(math.add(math.multiply(x1, x2), math.multiply(y1, y2)), math.multiply(z1, z2));
}

const calc = async (req, res) => {
  const studentNum = req.body.studentNum;

  // Split the student number into three arrays according to the question
  const num = studentNum.split('').map(Number);
  const A = [math.fraction(num[0],1), math.fraction(-num[1],1), math.fraction(num[2],1)];
  const B = [math.fraction(-num[3],1), math.fraction(num[4],1), math.fraction(-num[5],1)];
  const C = [math.fraction(num[6],1), math.fraction(-num[7],1), math.fraction(num[8],1)];

  // 2. Find displacement vectors
  const AB = math.subtract(B, A);
  const BC = math.subtract(C, B);
  const AC = math.subtract(C, A);

  print(AB);
  print(BC);
  print(AC);

  // 3. Find the perimeter of the triangle ABC
  const mag_AB_InRoot = math.square(AB[0]) + math.square(AB[1]) + math.square(AB[2]);
  const mag_BC_InRoot = math.square(BC[0]) + math.square(BC[1]) + math.square(BC[2]);
  const mag_AC_InRoot = math.square(AC[0]) + math.square(AC[1]) + math.square(AC[2]);
  
  // 4. Find angle A
  const angleA = math.round(math.acos(math.dot(AB, AC) / (math.norm(AB) * math.norm(AC))), 2);

  // 5. Area of triangle
  const ABxAC = math.cross(AB, AC);
  const mag_area_InRoot = math.square(ABxAC[0]) + math.square(ABxAC[1]) + math.square(ABxAC[2]);

  // 6. Volume OABC
  const volume = math.fraction(math.dot(ABxAC, BC), 6);

  // Median A
  
  const M_A = math.divide(BC, 2);

  // Median B
  // Median C
  
  answers = [];

  const q0 = studentNum
  res.status(201).json({ success: "route found" });
};

module.exports = {
  calc,
};
