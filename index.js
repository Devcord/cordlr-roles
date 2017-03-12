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
    const selectedRoleName = args.join(' ')
    const selectedRole = this.getRoleByName(message, selectedRoleName)

    if (selectedRole) {
      if(this.roleConfig.whitelist.indexOf(selectedRoleName) !== -1) {
        message.member.addRole(selectedRole[1])
        this.sendInfo(message, selectedRoleName + ' was added to ' + message.author.username, 'Role added', this.footer, 'success')
      } else {
        this.roleNotAvailable(message, selectedRoleName)
      }
    } else {
      this.roleNotExisting(message, selectedRoleName)
    }
  }

  removeRole (message, args, flags) {
    const selectedRoleName = args.join(' ')
    const selectedRole = this.getRoleByName(message, selectedRoleName)

    if (selectedRole) {
      if(this.roleConfig.whitelist.indexOf(selectedRoleName) !== -1) {
        message.member.removeRole(selectedRole[1])
        this.sendInfo(message, selectedRoleName + ' was removed from ' + message.author.username, 'Role removed', this.footer, 'success')
      } else {
        this.roleNotAvailable(message, selectedRoleName)
      }
    } else {
      this.roleNotExisting(message, selectedRoleName)
    }
  }

  roleNotAvailable (message, selectedRoleName) {
    return this.sendInfo(message, 'The role ' + selectedRoleName + ' is not available.', 'Role not available', this.footer, 'error')
  }

  roleNotExisting (message, selectedRoleName) {
    return this.sendInfo(message, 'The role ' + selectedRoleName + ' does not exist.', 'Error', this.footer, 'error')
  }

  listRoles (message, args, flags) {
    if(this.roleConfig.whitelist) {
      let fields = []
      for (const role of this.roleConfig.whitelist) {
        fields.push({
          name: role,
          value: this.config.prefix + 'addrole ' + role + ' | ' + this.config.prefix + 'removerole ' + role
        })
      }

      this.sendFields(message, fields, null, this.footer)
    } else {
      this.sendInfo(message, 'Their are no roles whitelisted yet. Tell your admin!', 'No Roles', this.footer)
    }
  }
}
