const fs = require('fs');
const inquirer = require('inquirer');
const shortid = require('shortid');
const shorthash = require('shorthash');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const main = async () => {
  const { expiresIn, passphrase } = await inquirer.prompt([
    {
      name: 'passphrase',
      message: 'Passphrase',
      type: 'password'
    },
    {
      name: 'audience',
      message: 'Audience',
      type: 'string'
    },
    {
      name: 'expiresIn',
      message: 'Token lifetime (e.g.: "1h", "7d")',
      type: 'string'
    }
  ]);

  const privateKey = await promisify(fs.readFile)(
    `${process.env.HOME}/.ssh/id_rsa`,
    'utf-8'
  );

  const user = process.env.USER;

  const token = jwt.sign(
    { sub: user },
    { key: privateKey, passphrase },
    {
      algorithm: 'RS256',
      expiresIn,
      jwtid: shortid.generate(),
      issuer: user,
      keyid: shorthash.unique(privateKey.trim())
    }
  );

  console.log(token);
};

main();
