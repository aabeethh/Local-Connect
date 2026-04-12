# LocalConnect

Kerala tourism platform that connects tourists with local guides.

## Project Structure

```text
LocalConnect/
|-- server.js
|-- package.json
|-- database/
|   |-- db.js
|   `-- localconnect.db
`-- public/
    |-- index.html
    |-- css/
    |   `-- main.css
    `-- js/
        |-- api.js
        |-- app.js
        |-- auth.js
        |-- tourist.js
        |-- guide.js
        `-- admin.js
```

## Setup

1. Install dependencies with `npm install`
2. Start the app with `npm start`
3. Open `http://localhost:3000`

## Default Admin Login

- Email: `admin@localconnect.com`
- Password: `admin123`

## Main Flow

- Tourists register and log in with a tourist account.
- A tourist can apply for a guide job from the enrolment page.
- The application includes a separate guide login email and password.
- When admin approves the application, a linked guide account is created.
- The user can keep using the tourist account and also sign in separately as a guide.
