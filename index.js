const CordlrPlugin = require('cordlr-plugin')

module.exports = class RolesPlugin extends CordlrPlugin {
  constructor (bot, config) {
    super(bot, config)

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

    this.footer = this.embedFooter('Cordlr Role Plugin')

    this.resolveConfiguration()
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

  addRole (message, args, flags) {
    // Parse through the arguments
    const roles = this.parseArguments(message, args)
    return this.roleHandler(message, roles, 'add')
  }

  removeRole (message, args, flags) {
    // Parse through the arguments
    const roles = this.parseArguments(message, args)
    return this.roleHandler(message, roles, 'remove')
  }

  parseArguments(message, args) {
    const roles = {
      exist: [],
      dontExist: [],
      notAvailable: [],
      userAlreadyHave: [],
    }

    const serverRoles = this.getRoles(message)

    // FIXME improve this spaghetti code!
    // Loop through the arguments
    for (let roleName of args) {
      let exist = false
      let alreadyHas = false

      // Check if the role exist on Discord Server
      for (let serverRole of serverRoles) {
        if (serverRole[1].name.toLowerCase() === roleName.toLowerCase()) {

          let userAlreadyHave = message.member.roles.has(serverRole[1].id)
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

  roleHandler(message, roles, type) {
    let alreadyHas = false

    if (roles.exist != false) {
      const allRoles = []
      let successPrint = false

      // FIXME improve this code !
      // Check if role exist and it is in the whitelist
      for (let role of roles.exist) {
        for (let whitelistRole of this.roleConfig.whitelist) {
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
        }
      }

      if (roles.notAvailable != false) {
        this.roleNotAvailable(message, roles.notAvailable.join(', '))
      }

      if (successPrint) {
        this.successPrint(message, type, allRoles)
      }
    }

    if (roles.userAlreadyHave != false && alreadyHas) {
      this.informationPrint(message, roles.userAlreadyHave, type)
    }

    if (roles.dontExist != false) {
      this.roleNotExisting(message, roles.dontExist.join(', '))
    }
  }

  informationPrint(message, userAlreadyHave, type) {
      let information = ''
      const names = userAlreadyHave.join(', ')

      if (type === 'add') {
        information = `You already have the role(s) ${names}`
      }

      else if (type === 'remove') {
        information = `You cant remove role(s) you dont have: ${names}`
      }

      this.roleNotHandled(message, information)
  }

  successPrint(message, type, allRoles) {
    const action = {
      title: '',
      type: ''
    }

    if (type === 'add') {
      action.title = 'Role Added'
      action.type = 'added'
    }

    else if (type === 'remove') {
      action.title = 'Role Removed'
      action.type = 'removed'
    }

    this.sendInfo(message, `${allRoles.join(', ')} was ${action.type} to ${message.author.username}`, action.title, this.footer, 'success')

  }

  // Send message to user when role is not available
  roleNotAvailable (message, roleNames) {
    return this.sendInfo(message, `The role(s) ${roleNames} is not available.`, 'Role not available', this.footer, 'error')
  }
 
 // Send message to user if role got handled or not
 roleNotHandled (message, information) {
    return this.sendInfo(message, information, 'Information', this.footer, 'warning')
  }
 
  // Send message to user when role does not exist
  roleNotExisting (message, roleNames) {
    return this.sendInfo(message, `The role(s) ${roleNames} does not exist.`, 'Error', this.footer, 'error')
  }

  // Return a list of whitelisted roles
  listRoles (message, args, flags) {
    if (this.roleConfig.whitelist) {
      let fields = []
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
