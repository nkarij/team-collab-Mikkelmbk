const mysql = require('../config/mysql');

module.exports = (app) => {





    app.get('/', async (req, res, next) => {
        let movies = await getAllMovies();
        let recent_movies = await getRecentlyAddedMovies();

        res.render('home', {
            "movies":movies,
            "recentmovies":recent_movies
        });

    });

    app.get('/movies', async (req, res, next) => {
        let movies = await getAllMovies();

        res.render('movies', {
            "movies":movies,


        });

    });




    app.get('/contact', async (req, res, next) => {

        res.render('contact-us', {

        });

    });

    app.post('/contact', async (req, res, next) => {

        // variabler hentes ved submit
        let name = req.body.contactformname;
        let email = req.body.contactformemail;
        let message = req.body.contactformmessage;
        let getDate = new Date();
        let timeStamp = getDate.toISOString();

        // håndter valideringen, alle fejl pushes til et array så de er samlet ET sted
        let returnMessageArray = [];

        if(name == undefined || name == '') {
            returnMessageArray.push('Navn mangler');
        }
        if(email == undefined || email == '') {
            returnMessageArray.push('Email mangler')
        }
        if (message == undefined || message == '') {
            returnMessageArray.push('Beskedteksten mangler');
        }

        // hvis der er 1 eller flere elementer i `return_message`, så mangler der noget
        if (returnMessageArray.length > 0) {
            res.render('contact-us', {
                "returnMessageArray" : returnMessageArray.join(', '),
            });
        // indsæt i databasen
        } else {

            let database = await mysql.connect();
         
         // HER SKAL JEG LAVE EN TRY AND CATCH.... SE NYESTE VIDEO.
            let sql = await database.execute(`
                INSERT INTO messages
                (message_name, message_email, message_text, message_date)
                VALUES (?,?,?,?)`
                , [name, email, message, timeStamp]
            );

            // NB jeg bruger ikke disse returnmessages til noget, endnu!
            // affected rows er større end nul, hvis en (eller flere) række(r) blev indsat
            if (sql[0].affectedRows > 0) {
                returnMessageArray.push('Tak for din besked, vi vender tilbage hurtigst muligt');
            } else {
                returnMessageArray.push('Din besked blev ikke modtaget.... ');
            }

            database.end();

            res.render('contact-us', {
                "returnMessageArray": returnMessageArray.join(', '),
            });

        } // else slutter

    });


    async function getAllMovies(){
        let db = await mysql.connect();
        let [movies] = await db.execute(`
        SELECT *
        FROM movies
        INNER JOIN images ON fk_image_movie_id = movie_id
        WHERE fk_type_id = 1
        `)
        db.end();
        return movies
    }


    async function getRecentlyAddedMovies(){
        let db = await mysql.connect();
        let [recent_movies] = await db.execute(`
        SELECT movie_title, movie_description, movie_id, image_name
        FROM movies
        INNER JOIN images ON fk_image_movie_id = movie_id
        WHERE fk_type_id = 2
        `);
        db.end();
        return recent_movies
    }



} // module.exports slutter

/* SE NOGLE MERE AVANCEREDE ROUTES HER 
https://github.com/nkarij/the-awesome-newspage-nkarij/blob/master/server/routes/routes.js */