const mathjs = require("mathjs");
const config = {
  number: "Fraction",
};
const math = mathjs.create(mathjs.all, config);

const primes = require("../lib/primes");

const formatVector = ([x, y, z]) => {
  let displayX = "";
  let displayY = "";
  let displayZ = "";
  if (x.d === 1) {
    displayX = `${x.n * x.s}`;
  } else {
    displayX = `${x.n * x.s}/${x.d}`;
  }
  if (y.d === 1) {
    displayY = `${y.n * y.s}`;
  } else {
    displayY = `${y.n * y.s}/${y.d}`;
  }
  if (z.d === 1) {
    displayZ = `${z.n * z.s}`;
  } else {
    displayZ = `${z.n * z.s}/${z.d}`;
  }
  return `(${displayX}, ${displayY}, ${displayZ})`;
};

const formatCartesian = ([a, b, c], d) => {
  const lcm = math.lcm(a.d, math.lcm(b.d, math.lcm(c.d, d.d)));
  const newN = math.multiply([a, b, c], lcm);
  const newD = math.multiply(d, lcm);
  return `${newN[0].n}x + ${newN[1].n}y + ${newN[2].n}z - ${newD.n} = 0`;
};

const simplifyDirectionVector = ([x, y, z]) => {
  const lcm = math.lcm(x.d, math.lcm(y.d, z.d));
  const multipliedX = math.multiply(x, lcm);
  const multipliedY = math.multiply(y, lcm);
  const multipliedZ = math.multiply(z, lcm);
  const gcd = math.gcd(multipliedX.n, math.gcd(multipliedY.n, multipliedZ.n));
  const newX = math.divide(multipliedX, gcd);
  const newY = math.divide(multipliedY, gcd);
  const newZ = math.divide(multipliedZ, gcd);
  return [newX, newY, newZ];
};

const solveLine = ([x1, y1, z1], [ux, uy, uz], [x2, y2, z2], [vx, vy, vz]) => {
  const solution = math.lusolve(
    [
      [ux, -vx],
      [uy, -vy],
    ],
    [x2 - x1, y2 - y1]
  );
  return solution;
};

const simplifyRoot = (inRoot) => {
  let newRoot = inRoot;
  let outRoot = 1;
  let factors = new Array(4410).fill(0);
  let num = inRoot;
  let i = 0;
  let divisor = primes[0];

  while (num > 1) {
    if (num % divisor === 0) {
      factors[divisor]++;
      num /= divisor;
    } else {
      i++;
      divisor = primes[i];
    }
  }

  for (let i = 2; i < factors.length; i++) {
    if (factors[i] >= 2) {
      if (factors[i] % 2 === 0) {
        outRoot *= math.pow(i, factors[i] / 2);
        newRoot /= math.pow(i, factors[i]);
      } else {
        outRoot *= math.pow(i, (factors[i]-1) / 2);
        newRoot /= math.pow(i, (factors[i]-1));
      }
    }
  }

  if (newRoot === 1) {
    return outRoot;
  } else {
    return `${outRoot}√${newRoot}`;
  }
};

const calc = async (req, res) => {
  const studentNum = req.body.studentNum;

  // Ensure studentNum is a string and split it into individual digits
  const num = studentNum.toString().split("").map(Number);

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
  const ABInRoot =
    math.square(AB[0]) + math.square(AB[1]) + math.square(AB[2]);
  const BCInRoot =
    math.square(BC[0]) + math.square(BC[1]) + math.square(BC[2]);
  const ACInRoot =
    math.square(AC[0]) + math.square(AC[1]) + math.square(AC[2]);

  // 4. Find angle A
  const angleA = math.round(
    math.acos(math.dot(AB, AC) / (math.norm(AB) * math.norm(AC))),
    2
  );

  // 5. Area of triangle
  const ABxAC = math.cross(AB, AC);
  const areaInRoot =
    math.square(ABxAC[0]) + math.square(ABxAC[1]) + math.square(ABxAC[2]);

  // 6. Volume OABC
  const volume = math.divide(math.dot(math.cross(A, B), C), 6);

  // 7. Median A
  const MBC = math.divide(BC, 2);
  const dirCentroidA = simplifyDirectionVector(math.subtract(MBC, A));
  const medianA = `L1: ${formatVector(A)} + s${formatVector(dirCentroidA)}; s ∈ R`;

  // Median B
  const MAC = math.divide(AC, 2);
  const dirCentroidB = simplifyDirectionVector(math.subtract(MAC, B));
  const medianB = `L2: ${formatVector(B)} + t${formatVector(dirCentroidB)}; t ∈ R`;

  // Median C
  const MAB = math.divide(AB, 2);
  const dirCentroidC = simplifyDirectionVector(math.subtract(MAB, C));
  const medianC = `L3: ${formatVector(C)} + u${formatVector(dirCentroidC)}; u ∈ R`;

  // 8. Centroid
  let sol = solveLine(A, dirCentroidA, B, dirCentroidB);
  let s = sol[0][0];
  let t = sol[1][0];
  const G = math.add(A, math.multiply(dirCentroidA, s));

  // 9. Cartesian equation of plane ABC
  const n = math.cross(AB, AC);
  const D = math.dot(n, A);

  const plane = formatCartesian(n, D);
  console.log(plane)

  // 10. Distance from O to plane ABC
  const distNum = math.abs(math.dot(n, A));
  const distDenInRoot = math.square(n[0]) + math.square(n[1]) + math.square(n[2]);

  // 11. Altitude from A to BC
  const dirAltitudeA = simplifyDirectionVector(math.cross(n, BC));
  const altitudeA = `L4: ${formatVector(A)} + s${formatVector(dirAltitudeA)}; s ∈ R`;

  // Altitude form B to AC
  const dirAltitudeB = simplifyDirectionVector(math.cross(n, AC));
  const altitudeB = `L5: ${formatVector(B)} + t${formatVector(dirAltitudeB)}; t ∈ R`;

  // Altitude from C to AB
  const dirAltitudeC = simplifyDirectionVector(math.cross(n, AB));
  const altitudeC = `L6: ${formatVector(C)} + u${formatVector(dirAltitudeC)}; u ∈ R`;

  // 12. Orthrocenter
  sol = solveLine(A, dirAltitudeA, B, dirAltitudeB);
  s = sol[0][0];
  t = sol[1][0];
  const H = math.add(A, math.multiply(dirAltitudeA, s));
  console.log(formatVector(H));



  res.status(201).json({ success: "route found" });
};

module.exports = {
  calc,
};
