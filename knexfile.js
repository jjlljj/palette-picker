// Update with your config settings.

module.exports = {
  development: {
    client: 'pg',
    connection: 'postgres://localhost/palette_picker',
    migrations: {
      directory: './db/migrations'
    },
    useNullAsDefault: true
  },
  test: {
    client: 'pg',
    connection: 'postgres://localhost/palette_picker_testing',
    migrations: {
      directory: './db/migrations'
    },
    useNullAsDefault
  }
};
