#!/usr/bin/env node

const fs = require('fs');
const inquirer = require('inquirer');
const { pem2jwk } = require('pem-jwk');
const shortid = require('shortid');
const shorthash = require('shorthash');
const jwt = require('jsonwebtoken');
const sshpk = require('sshpk');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const main = async () => {
  const homeDirectory = process.env.HOME;
  const configPath = `${homeDirectory}/.jwtgen`;
  const privateKey = await readFile(`${homeDirectory}/.ssh/id_rsa`, 'utf-8');
  const publicKey = sshpk
    .parseKey(await readFile(`${homeDirectory}/.ssh/id_rsa.pub`), 'ssh')
    .toBuffer('pem')
    .toString();

  const algorithm = 'RS256';
  const keyId = shorthash.unique(privateKey.trim());

  const publicJwk = {
    ...pem2jwk(publicKey),
    alg: algorithm,
    use: 'sig',
    kid: keyId
  };

  const config = JSON.parse(await tryReadFile(configPath)) || {};

  const { audience, expiresIn, passphrase, username } = await inquirer.prompt([
    {
      name: 'username',
      message: 'User name',
      type: 'string',
      default: config.username || process.env.USER
    },
    {
      name: 'audience',
      message: 'Audience',
      type: 'string',
      default: config.audience
    },
    {
      name: 'expiresIn',
      message: 'Token lifetime (e.g.: "1h", "7d")',
      type: 'string',
      default: config.expiresIn
    },
    {
      name: 'passphrase',
      message: 'Passphrase',
      type: 'password'
    }
  ]);

  await writeFile(
    configPath,
    JSON.stringify({
      username,
      audience,
      expiresIn
    })
  );

  const token = jwt.sign(
    { sub: username },
    { key: privateKey, passphrase },
    {
      algorithm,
      audience,
      expiresIn,
      jwtid: shortid.generate(),
      issuer: username,
      keyid: keyId
    }
  );

  console.log('Public Key PEM:');
  console.log(publicKey);
  console.log('\n');
  console.log('Public Key JWK:');
  console.log(publicJwk);
  console.log('\n');
  console.log('JWT:');
  console.log(token);
};

const tryReadFile = async filePath => {
  try {
    return await readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
};

main();
