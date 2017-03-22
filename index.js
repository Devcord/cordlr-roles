const CordlrPlugin = require('cordlr-plugin')

module.exports = class RolesPlugin extends CordlrPlugin {
  constructor (bot, config) {
    super (bot, config)

    this.name = 'Roles'
    this.description = 'Role Management for administrators and users'

    this.commands = {
      'addrole': {
        'usage': '<rolename>',
        'function': 'addRole',
        'description': 'Adds the selected role to your user',
        'permissions': []
      },
      'removerole': {
        'usage': '<rolename>',
        'function': 'removeRole',
        'description': 'Removes the selected role to your user',
        'permissions': []
      },
      'roles': {
        'usage': '',
        'function': 'listRoles',
        'description': 'Lists all possible roles to be added or removed',
        'permissions': []
      }
    }

    this.footer = this.embedFooter ('Cordlr Role Plugin')

    // Will only check permissions ONCE when bot is initiated!
    // This means if someone change the bots permissions
    // while it is live this piece of code will NOT know about it.
    this.hasPermission = this.checkPermissions ()

    this.resolveConfiguration ()
  }

  resolveConfiguration () {
    if (!this.config['cordlr-roles']) {
      this.config['cordlr-roles'] = {}
    }
    this.roleConfig = this.config['cordlr-roles']

    if (!this.roleConfig.whitelist) {
      this.roleConfig.whitelist = []
    }
  }

  checkPermissions () {
    this.bot.on('ready', () => {
      const admin = this.checkBotPermission('ADMINISTRATOR')
      const manageRoles = this.checkBotPermission('MANAGE_ROLES_OR_PERMISSIONS')

      if (admin || manageRoles) {
        return this.hasPermission = true
      }

      this.bot.emit('error', new Error('Bot has no permissions to handle roles, please give it the "Manage Roles" and/or "Administrator" permissions and then restart bot!'))
      return this.hasPermission = false
    })
  }

  addRole (message, args, flags) {
    if (this.hasPermission) {
      const roles = this.parseArguments(message, args)
      return this.roleHandler(message, roles, 'add')
    }

    this.botDontHavePermission(message)
  }

  removeRole (message, args, flags) {
    if (this.hasPermission) {
      const roles = this.parseArguments(message, args)
      return this.roleHandler(message, roles, 'remove')
    }
    
    this.botDontHavePermission(message)
  }

  parseArguments (message, args) {
    const roles = {
      exist: [],
      dontExist: [],
      notAvailable: [],
      userAlreadyHave: [],
      fields: []
    }

    const serverRoles = this.getRoles(message)

    for (let roleName of args) {
      let exist = false
      let alreadyHas = false

      for (const serverRole of serverRoles) {
        if (serverRole[1].name.toLowerCase() === roleName.toLowerCase()) {

          const userAlreadyHave = message.member.roles.has(serverRole[1].id)
          if (userAlreadyHave) {
            roles.userAlreadyHave.push(serverRole[1].name)
            alreadyHas = true
          }

          roles.exist.push(serverRole[1])
          exist = true
        }
      }

      if (!exist && !alreadyHas) {
        roles.dontExist.push(roleName)
      }
    }

    return roles
  }

  roleHandler (message, roles, type) {
    let alreadyHas = false

    if (roles.exist != false) {
      const allRoles = []
      let successPrint = false

      for (const role of roles.exist) {
        for (const whitelistRole of this.roleConfig.whitelist) {
          if (role.name.toLowerCase() === whitelistRole.toLowerCase()) {
            allRoles.push(role.name)
          }
        }

        if (!role.name in allRoles) {
          roles.notAvailable.push(role.name)
        }

        if (type === 'add' && !message.member.roles.has(role.id)) {
          message.member.addRole(role)
          successPrint = true
        }

        else if (type === 'remove' && message.member.roles.has(role.id)) {
          message.member.removeRole(role)
          successPrint = true
        }

        else {
          const i = allRoles.indexOf(role.name)
          allRoles.splice(i, 1)
          alreadyHas = true

          if (type === 'remove') {
            roles.userAlreadyHave.push(role.name)
          }
        }
      }

      if (successPrint) {
        this.successPush(message, roles, allRoles, type)
      }

      if (roles.notAvailable != false) {
        this.notAvailablePush(roles)
      }
    }

    if (roles.userAlreadyHave != false && alreadyHas) {
      this.userAlreadyHavePush(roles, type)
    }

    if (roles.dontExist != false) {
      this.dontExistPush(roles)
    }

    return this.send(message, roles)
  }
  
  dontExistPush (roles) {
    roles.fields.push({
      name: 'Error',
      value: `The role(s) ${roles.dontExist.join(', ')} does not exist.`,
      inline: false
    })
  }

  userAlreadyHavePush (roles, type) {
    let value = ''
    let name = ''

    if (type === 'add') {
      name = 'Not added'
      value = `You already have the role(s) ${roles.userAlreadyHave.join(', ')}.`
    }

    else if (type === 'remove') {
      name = 'Not removed'
      value = `You cant remove role(s) you dont have: ${roles.userAlreadyHave.join(', ')}.`
    }

    roles.fields.push({
      name: name,
      value: value,
      inline: false
    })
  }

  notAvailablePush (roles) {
    roles.fields.push({
      name: 'Role not available',
      value: `The role(s) ${roles.notAvailable.join(', ')} are not available.`,
      inline: false
    })
  }

  successPush (message, roles, allRoles, type) {
    let name = ''
    let value = ''

    if (type === 'add') {
      name = 'Role added'
      value = `The role(s) ${allRoles.join(', ')} was added to ${message.author.username}.`
    }

    else if (type === 'remove') {
      name = 'Role removed'
      value = `The role(s) ${allRoles.join(', ')} was removed from ${message.author.username}.`
    }

    roles.fields.unshift({
      name: name,
      value: value,
      inline: false
    })
  }

  botDontHavePermission (message) {
    return this.sendInfo(message, `${this.bot.user.username} dont have permission to handle roles, give it the "Manage Role" permission.`, 'No Manage Role Permission', this.footer)
  }

  send (message, roles) {
    // Green Color
    // const successColor = this.colorToDecimal('#36c17e')

    return this.sendEmbed(message, {
      title: '', // 'Roles',
      description: '', // `${this.config.prefix}addrole <rolename> | ${this.config.prefix}removerole <rolename>`,
      url: '',
      // color: successColor,
      fields: roles.fields,
      footer: {
        text: 'Cordlr Role Plugin',
        icon_url: 'https://avatars0.githubusercontent.com/u/22057549?v=3&s=200',
        proxy_icon_url: 'https://github.com/Devcord'
      }
    })
  }

  listRoles (message, args, flags) {
    if (this.roleConfig.whitelist) {
      const fields = []
      for (const role of this.roleConfig.whitelist) {
        fields.push({
          name: role,
          value: `${this.config.prefix}addrole ${role} | ${this.config.prefix}removerole ${role}`
        })
      }
      return this.sendFields(message, fields, null, this.footer)
    } else {
      return this.sendInfo(message, 'Their are no roles whitelisted yet. Tell your admin!', 'No Roles', this.footer)
    }
  }
}
