// This is to configure the admin page available at https://atmospherejs.com/sach/flow-db-admin

AdminConfig = {
  name: 'MGBv2 Administration',
  adminEmails: ['foo@foo.com'],   // TODO - find a way to not expose this to client side code
  collections:
  {
    People: {
      tableColumns: [
        { label: 'Name', name: 'name' },
        { label: 'Email', name: 'email' },
        { label: 'Avatar', name: 'avatar' }
      ]
    }
  }
}
