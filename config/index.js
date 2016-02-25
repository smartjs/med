module.exports = {
	dbUrl: (process.env.DB_URL || 'mariadb://root@localhost:3306/med'),
	port: (process.env.PORT || 3000),
	secretKey: (process.env.SECRET_KEY || "secretKey")
};
