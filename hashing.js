const bcrypt = require('bcryptjs');

const salt = bcrypt.genSaltSync(10);

console.log("salt: ", salt);

const hash = bcrypt.hashSync("password", salt);

console.log("hash: ", hash);

console.log(bcrypt.compareSync("abc", hash));
