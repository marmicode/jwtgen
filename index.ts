const fs = require('fs');
const inquirer = require('inquirer');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const main = async () => {
  const { passphrase } = await inquirer.prompt([
    {
      name: 'passphrase',
      message: 'Passphrase',
      type: 'password'
    }
  ]);

  const privateKey = await promisify(fs.readFile)(
    `${process.env.HOME}/.ssh/id_rsa`,
    'utf-8'
  );

  const token = jwt.sign(
    { sub: process.env.USER },
    { key: privateKey, passphrase },
    { algorithm: 'RS256' }
  );

  console.log(token);
};

main();
