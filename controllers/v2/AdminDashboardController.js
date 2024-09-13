
async function dashboardData(req, res) {
  try {
    
  } catch(error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
    dashboardData,
  };
  