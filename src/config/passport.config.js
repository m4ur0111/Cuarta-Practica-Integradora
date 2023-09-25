const passport = require('passport');
const GitHubStrategy = require('passport-github2');
const userService = require('../models/user.model').userModel; // Importa el modelo de usuario correctamente.

const initializePassport = () => {
    passport.use(
        'github',
        new GitHubStrategy(
        {
            clientID: 'Iv1.cc0f5b128a06e053',
            clientSecret: '5626689b17009409038f5e6f68836c0df6732b36',
            callbackURL: 'http://localhost:8080/sessions/githubcallback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                console.log(profile);
                let user = await userService.findOne({ email: profile._json.email });
                if (!user) {
                    let newUser = {
                        nombre: profile._json.name, // Ajusta los campos según tu modelo de usuario.
                        apellido: '',
                        edad: 18,
                        email: profile._json.email,
                        pass: '', // Asegúrate de establecer la contraseña de manera segura.
                    };
                    let result = await userService.create(newUser);
                    done(null, result);
                } else {
                    done(null, user);
                }
            } catch (error) {
                return done(error);
            }
        }
        )
    );
};

passport.serializeUser((user, done) => {
    done(null, user._id); // Utiliza el ID del usuario en la base de datos
});

passport.deserializeUser(async (id, done) => {
    let user = await userService.findById(id);
    done(null, user);
});


module.exports = initializePassport;
