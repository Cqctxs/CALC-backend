const calc = async (req, res) => {
  res.status(201).json({ success: "route found" });
};

module.exports = {
  calc,
};
