const config = {
    mongoURI: process.env.MONGODB_URI,
    port: process.env.PORT || 5000,
    clientURL: process.env.CLIENT_URL || 'http://localhost:8080',
    jwtSecret: process.env.JWT_SECRET
};

module.exports = config;