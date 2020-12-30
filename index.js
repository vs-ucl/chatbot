const BootBot = require('bootbot');
const config = require('config');

var port = process.env.PORT || config.get('PORT');

const bot = new BootBot({
  accessToken: config.get('ACCESS_TOKEN'),
  verifyToken: config.get('VERIFY_TOKEN'),
  appSecret: config.get('APP_SECRET')
});

const { MovieDb } = require('moviedb-promise')
const moviedb = new MovieDb('xxxxxxx') // removed 

bot.on('postback', (payload, chat) => {

    const buttonPayload = payload.postback.payload;
    let match;
    chat.conversation((conversation) => {
        console.log("button postback received... ");

        match = buttonPayload.match(/TELL_ME_MORE_ABOUT_MOVIE_(\d+)/i);
        if (match) {
            const movieID = match[1];
            console.log('tell me more button was pressed. ID: ' + movieID)
            moviedb.movieInfo({ id: movieID, append_to_response: 'credits' }).then(movie => {
                conversation.say("Movie title: " + movie.title + "\n\nMovie plot: " + movie.overview)
                handleMoreInfo(conversation, movie)
            }).catch(console.error)
        }
    })
});

bot.hear(['hi', 'hello', 'hey', 'holla'], (payload, chat) => {
  chat.say('Hi! If you would like to know details about a movie, tell me "movie" and the name of the movie', {typing: true})
});


bot.hear(/movie (.*)/i, (payload, chat, data) => {
  chat.conversation((conversation) => {
    const movieName = data.match[1];
    console.log("quering MovieDB... "+movieName);

    moviedb.searchMovie({ query: movieName }).then(json => {
        total_results = json.total_results
        if (total_results == 0) {
          conversation.say('I could not find the movie '+movieName+', you can try searching for another movie like "movie [movie name]"', {typing: true});
          conversation.end();
        } else {

          let gen_buttons = []

          json.results.slice(0, 3).forEach(function(movie) {
            gen_buttons.push({ type: 'postback', title: movie.title, payload: 'TELL_ME_MORE_ABOUT_MOVIE_' + movie.id }) 
            console.log(movie.title);
          });

          console.log(gen_buttons)
          conversation.say({ text: 'I found the following movies (click on a movie if you want more info):', buttons: gen_buttons});
          conversation.end();

        }
    }).catch(console.error)

  })
})


function handleMoreInfo(conversation, movie) {
    console.log("handleMoreInfo called")
    console.log(movie)

    setTimeout(() => {
    conversation.ask({
      text: "Would you like to know more about the movie?",
      quickReplies: [ "No","Genres", "Budget", "Runtime", "Credits" ]
    }, (payload, conversation) => {

        console.log("user choice: " , payload.message.text)
        let userWantsMoreInfo = true

        switch (payload.message.text) {
            case 'Genres':
                let genres = []
                movie.genres.forEach(genre => {
                    genres.push(genre.name)
                });
                conversation.say("Genres: " + genres.join(','));
                break;
            case 'Credits':
                let casts = []
                movie.credits.cast.forEach(cast => {
                    casts.push(cast.name + ' as ' + cast.character)
                });
                conversation.say("Casts:\n" + casts.join('\n'));
                break;
            case 'Budget':
                conversation.say("Budget: " + movie.budget + " dolars");
                break;
            case 'Runtime':
                conversation.say("Runtime: " + movie.runtime + " minutes");
                break;
            case 'No':
                conversation.say("Ok, ask me about a different movie then.");
                userWantsMoreInfo = false
                conversation.end();
                break;
            default:
                console.log("oops .. shouldn't happen");
        }

        if (userWantsMoreInfo) {
            handleMoreInfo(conversation, movie)
        }
            
    });
}, 2000)
}

bot.start(port);
