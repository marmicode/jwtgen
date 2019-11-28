const fs = require('fs');
const inquirer = require('inquirer');
const shortid = require('shortid');
const shorthash = require('shorthash');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const main = async () => {
  const { audience, expiresIn, passphrase, username } = await inquirer.prompt([
    {
      name: 'username',
      message: 'User name',
      type: 'string',
      default: process.env.USER
    },
    {
      name: 'passphrase',
      message: 'Passphrase',
      type: 'password',
      default: null
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

  const token = jwt.sign(
    { sub: username },
    { key: privateKey, passphrase },
    {
      algorithm: 'RS256',
      audience,
      expiresIn,
      jwtid: shortid.generate(),
      issuer: username,
      keyid: shorthash.unique(privateKey.trim())
    }
  );

  console.log(token);
};

main();
