# unihack
no way currently to start frontend server, idk the command to

### NPM Scripts
* npm start-backend: start the backend server - dont use yet
* npm run lint: run ESLint - eslint is just a style fixer
* npm run lint-fix: run ESLint, applying fixes
* npm run tsc: run TypeScript checks

#### for sceneRoutes
* in **backend/src/service/scene.ts** -> there is two **getSceneDialogue**, one will return all dialogue at once, the other one at a time, choose whichever you want and delete the other, api is currently written using all at once
    * all at once requires iterating through in front end
    * one by one, front end must keep track of lines done and check if have finished by undefined return <- need to add lineIndex as a param
* in **backend/src/data.ts** ->
    * /** Initalises Scenes */ -> Change where it says 'LEVEL X' to scene name
    * /** Initalises Dialogue */ -> Change the first empty string to dialogue and second/last empty string to sprite_ref -> I can change the return of the API to give include assets/sprites/, currently without
    * /** Initalises Dialogue */ -> If speaker is user, change 'Pomme' to 'user' DO NOT REMOVE SPRITE_REF
* in **backend/src/service/scene.ts** -> there is **getScene**, this is for starting scene; it will return unlocked: boolean that is checked by front end. If check is successful than **getDialogue** otherwise idk blocked ui 

#### master API
* pomodoro: /pomodoro
    * POST| /start -> emptyObj - start pomodoro
    * POST| /stop -> emptyOBJ - stop pomodoro and save state
* user: /user
    * POST| /register -> body(email, username, password)
    * POST| /login -> body(loginForm, password)
    * POST| /logout
    * DELETE| /delete -> body(password) -- will ret 204 not 200 dw abt it
    * PUT| /update/email -> body(email)
    * PUT| /update/username -> body(username)
    * PUT| /update/password -> body(oldPassword, newPassword)
* scene: /scene
    * GET | / -> get all scenes, obj can be seen in backend/service/src/service.ts -> getCharacterScenes
    * GET | /:sceneId -> get scene name + if unlocked
    * GET | /:sceneId/dialogue -> see sceneRoutes, currently gets all dialogue - obj can be seen in backend/service/src/service.ts - getSceneDialogue
* todo: /todo
    * POST| /create -> body(task)
    * PUT | /complete/:id -> this is the taskId
    * GET | /get -> returns first 20 tasks complete or not, can change amt with **getAmtTasks** in service/todolist.ts
* pomodoro -> socket io
    * pomodoro:tick -> will return an obj on teh status of the timer every second
        * {state, timeRemaining (ms), elapsedTime (ms)}
    * pomodoro:join -> joins a 'room' unique to userId, only one timer per id at a time, hopefully
    * **__POMODORO ORDER__** : pomodoro:join msg empty body -> listen for pomodoro:tick -> pomodoro/start -> pomodoro/stop  
    * socket will also requires sessions, we should socket.handshake.authorisation.token, this doesnt work with postman which I used for testing. A header is currently set to session with the same sessionId used in the API calls -> see in server crtl f for io.use
