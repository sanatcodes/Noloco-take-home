# Noloco Take Full Stack Engineering exercise

### GET: `/schema`

- Returns the data schema of the Dublin Bikes dataset as a JSON array of Field objects.
- The schema should be dynamically derived from the dataset, accommodating similarly shaped datasets.
- Assumes potential irregularities in the dataset and normalizes values to the most reasonable data types.

### POST: `/data`

- Returns data from the Dublin Bikes dataset after applying request body filters.
- Filters should be applied using the schema's standardized field names.

## Technical Choices

List any technical choices you made during the development of the project, such as programming languages, frameworks, libraries, etc.

Decided to use Node JS, vanilla JavaScript and Express as that is used by the company. Also added Nodemon for hot reloading. I chose to keep it simple and lean. Used PostMan to test the API, it was very handy specially for testing POST requests.

I chose to make a couple of helper functions to make the code cleaner. These have helped with code reusability and readability. I focused on getting an end to end solution working first, then refactored the code to make it more readable and reusable. I decided to try to go back and figure out the options data type, but I ran out of time.

## Extra Features

I managed to add the endpoint to find a row by id and also to delete it by id. These were one of the most simplest additions. I went for these in the last minutes, to get some brownie points.

## Future Improvements

I realised a little a late that I didn't clearly understand the Options data type. I didn't know how to differentiate that from text. If I had some more time, I would go through all of the rows in a given column to understand the spread of unique values that are not numerical. This would help me get all the potential options. Also, find the options array. Lastly, I couldn't figure out why integer classification wasn't working. Noticed it later when I was preparing for demoing on video. Would love to figure out what went wrong there.

## Instructions to run the project

To set up the project locally:

1. **Clone the Repository**: `git clone https://github.com/sanatcodes/Noloco-take-home.git`
2. **Install Dependencies**: Navigate to the project directory and run `npm install`.
3. **Start the Application**: Execute `node app.js` to run the application.
