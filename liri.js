require("dotenv").config();
var keys = require("./keys.js")
var request = require("request")
var Spotify = require("node-spotify-api")
var dateFormat = require("dateFormat")
var fs = require("fs")

// Takes an artist and searches the Bands in Town
// Artist API for an artist and render information
var concertThis = function (artist) {
    var region = ""
    var queryUrl = "https://rest.bandsintown.com/artists/" + artist.replace(" ", "+") + "/events?app_id=codingbootcamp"
    //console.log(queryUrl);

    request(queryUrl, function (err, response, body) {
        // If the request is successful
        if (!err && response.statusCode === 200) {
            // Save parsed body in a new variable for easier use
            var concertInfo = JSON.parse(body)

            outputData(artist + " concert information:")

            for (i = 0; i < concertInfo.length; i++) {

                region = concertInfo[i].venue.region
                //handle Canadian venues
                if (region === "") {
                    region = concertInfo[i].venue.country
                }

                // Need to return Name of venue, Venue location, Date of event (MM/DD/YYYY)
                outputData("Venue: " + concertInfo[i].venue.name)
                outputData("Location: " + concertInfo[i].venue.city + ", " + region);
                outputData("Date: " + dateFormat(concertInfo[i].datetime, "mm/dd/yyyy"))
            }
        }
    })
}

// This will take a song, search spotify and return information
var spotifyThisSong = function (song) {
    // Default should be "The Game" by Disturbed
    if (!song) {
        song = "The Game Disturbed"
    }
    console.log(keys.spotify)
    var spotify = new Spotify(keys.spotify);

    spotify.search({type: "track", query: song,limit: 1}, function (err, data) {
        if (err) {
            return console.log(err)
        }

        // Need to return Artist(s), Song Name, Album, Preview link of song from Spotify
        var songInfo = data.tracks.items[0]
        outputData(songInfo.artists[0].name)
        outputData(songInfo.name)
        outputData(songInfo.album.name)
        songInfo.preview_url && outputData(songInfo.preview_url)
    })
}

// This will take a movie, search IMDb and return information
var movieThis = function (movie) {
    // Default should be "The Hangover"
    if (!movie) {
        movie = "The +Hangover"
    }

    var queryUrl = "http://www.omdbapi.com/?t=" + movie + "&y=&plot=short&apikey=trilogy";
    //console.log(queryUrl);

    // Then create a request to the queryUrl
    request(queryUrl, function (err, response, body) {
        // If the request is successful
        if (!err && response.statusCode === 200) {
            // Need to return: Title, Year, IMDB Rating, Rotten Tomatoes Rating, Country,
            // Language, Plot, Actors
            var movieInfo = JSON.parse(body)

            outputData("Title: " + movieInfo.Title)
            outputData("Release year: " + movieInfo.Year)
            outputData("IMDB Rating: " + movieInfo.imdbRating)
            outputData("Rotten Tomatoes Rating: " + movieInfo.Ratings[1].Value)
            outputData("Country: " + movieInfo.Country)
            outputData("Language: " + movieInfo.Language)
            outputData("Plot: " + movieInfo.Plot)
            outputData("Actors: " + movieInfo.Actors)
        }
    })
}

// Using the `fs` Node package, LIRI will take the text inside of random.txt
// and then use it to call one of LIRI's commands.
var doWhatItSays = function () {

    // read from file
    fs.readFile("random.txt", "utf8", function (err, data) {
        if (err) {
            return console.log(err)
        }

        var dataArr = data.split(",")

        // call appropriate function and pass arguement
        runAction(dataArr[0], dataArr[1])
    });
}

// This function will handle outputting to the console and writing to log file
var outputData = function (data) {
    console.log(data)

    fs.appendFile("log.txt", "\r\n" + data, function (err) {
        if (err) {
            return console.log(err)
        }
    })
}

var runAction = function (func, parm) {
    switch (func) {
        case "concert-this":
            concertThis(parm)
            break
        case "spotify-this-song":
            spotifyThisSong(parm)
            break
        case "movie-this":
            movieThis(parm)
            break
        case "do-what-it-says":
            doWhatItSays()
            break
        default:
            outputData("That is not a command that I recognize, please try again.")
    }
}

runAction(process.argv[2], process.argv.slice(3).join(' '))