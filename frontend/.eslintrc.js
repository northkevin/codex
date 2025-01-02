module.exports = {
    root: false, // Use root config
    extends: ['../.eslintrc.js', 'plugin:react/recommended'],
    plugins: ['react'],
    settings: {
        react: {
            version: 'detect',
        },
    },
}
