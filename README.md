jwtgen allows you to generate a JWT signed with your SSH private key.
You can then add your public key to the authorized keys of the targeted API.

# Usage

```sh
npm install -g @marmicode/jwtgen
```

```sh
jwtgen
```

![](usage.gif)

# Gotchas

RSA key must be in PEM format, generated with `ssh-keygen -m pem`.
