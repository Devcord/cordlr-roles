# Cordlr-Roles

## Description

Allows users to manually join certain, whitelisted roles via `!addrole`, `!removerole` and `!roles`

Used with [Cordlr-cli](https://github.com/Devcord/cordlr-cli). Check out the [boilerplate](https://github.com/Devcord/cordlr-server-boilerplate) to get started!

## Usage [Read More](https://github.com/Devcord/cordlr-server-boilerplate)

`npm install cordlr-roles --save`

```json
{
  "token":"Your BotToken Here",
  "prefix":"!",
  "loader":"cordlr-loader",
  "plugins": [
    "cordlr-roles"
  ],
  "cordlr-roles": {
    "whitelist": [
      "Add your role name here",
      "roleName2",
      "RoleName3"
    ]
  }
}
```