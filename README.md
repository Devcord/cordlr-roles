# Cordlr-Roles

[![Join the chat at https://gitter.im/Devcord/cordlr-roles](https://badges.gitter.im/Devcord/cordlr-roles.svg)](https://gitter.im/Devcord/cordlr-roles?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## Description

Allows users to manually join certain, whitelisted roles via `!addrole`, `!removerole` and `!roles`

Used with [Cordlr-cli](https://github.com/Devcord/cordlr-cli) and [Cordlr-loader](https://github.com/Devcord/cordlr-loader). Check out the [boilerplate](https://github.com/Devcord/cordlr-server-boilerplate) to get started!

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