User interface

The "main usecase user loop":

1. find a movie
2. request a particular movie data
3. need a another bit of data ? Keep requesting - step 2. 
4. Do you have enough data about your movie? Stop requesting and find a another movie - step 1

The MovieDB API:

Search Movies
get/search/movie

Format:

api_key
string
1 validations
required
language
string

Pass a ISO 639-1 value to display translated data for the fields that support it.
optional
query
string

Pass a text query to search. This value should be URI encoded.
minLength: 1
required
page
integer

Specify which page to query.
minimum: 1
maximum: 1000
default: 1
optional
include_adult
boolean

Choose whether to inlcude adult (pornography) content in the results.
default
optional
region
string

Specify a ISO 3166-1 code to filter release dates. Must be uppercase.
pattern: ^[A-Z]{2}$
optional
year
integer
optional
primary_release_year
integer
optional
