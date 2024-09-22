const mathjs = require('mathjs');
const config = {
  number: "Fraction",
};
const math = mathjs.create(mathjs.all, config);

const convert = ([x, y, z]) => {
  let displayX = "";
  let displayY = "";
  let displayZ = "";
  if (x.d === 1) {
    displayX = `${x.n*x.s}`;
  } else {
    displayX = `${x.n*x.s}/${x.d}`;
  }
  if (y.d === 1) {
    displayY = `${y.n*y.s}`;
  } else {
    displayY = `${y.n*y.s}/${y.d}`;
  }
  if (z.d === 1) {
    displayZ = `${z.n*z.s}`;
  } else {
    displayZ = `${z.n*z.s}/${z.d}`;
  }
  return `(${displayX}, ${displayY}, ${displayZ})`;
}

const calc = async (req, res) => {
  const studentNum = req.body.studentNum;

  // Ensure studentNum is a string and split it into individual digits
  const num = studentNum.toString().split("").map(Number);
  console.log(num);

  // Map the digits to the arrays A, B, and C using fractions
  const A = [
    math.fraction(num[0]),
    math.fraction(-num[1]),
    math.fraction(num[2]),
  ];
  const B = [
    math.fraction(-num[3]),
    math.fraction(num[4]),
    math.fraction(-num[5]),
  ];
  const C = [
    math.fraction(num[6]),
    math.fraction(-num[7]),
    math.fraction(num[8]),
  ];

  // 2. Find displacement vectors
  const AB = math.subtract(B, A);
  const BC = math.subtract(C, B);
  const AC = math.subtract(C, A);

  // 3. Find the perimeter of the triangle ABC
  const mag_AB_InRoot =
    math.square(AB[0]) + math.square(AB[1]) + math.square(AB[2]);
  const mag_BC_InRoot =
    math.square(BC[0]) + math.square(BC[1]) + math.square(BC[2]);
  const mag_AC_InRoot =
    math.square(AC[0]) + math.square(AC[1]) + math.square(AC[2]);

  // 4. Find angle A
  const angleA = math.round(
    math.acos(math.dot(AB, AC) / (math.norm(AB) * math.norm(AC))),
    2
  );

  // 5. Area of triangle
  const ABxAC = math.cross(AB, AC);
  const mag_area_InRoot =
    math.square(ABxAC[0]) + math.square(ABxAC[1]) + math.square(ABxAC[2]);

  // 6. Volume OABC
  const volume = math.divide(math.dot(math.cross(A, B), C), 6);

  console.log("volume: ", volume);

  // Median A

  const MBC = math.divide(BC, 2);
  const AMBC = math.subtract(MBC, A);
  const medianA = `L1: ${convert(A)} + t${convert(AMBC)}; t ∈ R`;

  // Median B

  const MAC = math.divide(AC, 2);
  const BMAC = math.subtract(MAC, B);
  const medianB = `L2: ${convert(B)} + t${convert(BMAC)}; t ∈ R`;

  // Median C

  const MAB = math.divide(AB, 2);
  const CMAB = math.subtract(MAB, C);
  const medianC = `L3: ${convert(C)} + t${convert(CMAB)}; t ∈ R`;

  console.log("medianA: ", medianA);
  console.log("medianB: ", medianB);
  console.log("medianC: ", medianC);

  res.status(201).json({ success: "route found" });
};

module.exports = {
  calc,
};
