# node_authentication
Nodejs authentication demo using Passportjs.

##Tech Stac:
1. nodejs as backend platform.
2. Expressjs for routing, sessions.
3. MongoDb for storing user informarion and session information.
4. Passportjs for registering, authenticating the user.
5. Jade templating engine for rendering the webpages.

##Features:
1. Register new user using email id, username and password.
2. Store encrypted password in database.
2. Email id verification.
3. Authenticate the user using Passportjs.
4. Webpage restriction, by allowing only logged in users to visit Members page.

##How to run:
1. Clone the reposetary.
2. Run npm install command to install all the deppendencied.
3. Add gmail smtp server configuration in models/users.js page at line 41, 42.
4. Run npm start command to start the application at http://localhost:3000
