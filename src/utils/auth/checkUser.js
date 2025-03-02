// function checkUser(req,res){
//     const authToken = req.headers.authorization?.split(" ")[1];
//     console.log(authToken, "this is checkUser");

//     if (!authToken) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     checkToken(authToken);
// }

// module.exports = checkUser;

function generateUserCredentials() {
  const adjectives = [
    "Brave",
    "Clever",
    "Bright",
    "Witty",
    "Swift",
    "Noble",
    "Funky",
    "Chill",
    "Mighty",
    "Cool",
  ];
  const nouns = [
    "Tiger",
    "Falcon",
    "Wizard",
    "Phoenix",
    "Rider",
    "Ninja",
    "Knight",
    "Shadow",
    "Guardian",
    "Hero",
  ];
  const domains = ["example.com", "mail.com", "fakemail.org", "userhub.io"];

  const randomNumber = Math.floor(100 + Math.random() * 900);
  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];

  const username = `${randomAdjective}${randomNoun}${randomNumber}`;
  const email = `${username.toLowerCase()}@${randomDomain}`;

  return { username, email };
}

function generateRandomPassword(length = 12) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=<>?/|{}[]~";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars[randomIndex];
  }

  return password;
}

module.exports = { generateUserCredentials, generateRandomPassword };
