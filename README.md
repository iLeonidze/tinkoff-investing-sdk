# Prerequisites

- NodeJS v12+


# Running

1. Login to your account in mobile application
2. Using Fiddler or Charles inspect network packets:
   - Find sessionId parameter in GET requests
   - Find deviceId parameter in GET requests
3. Fill in [identity.json](identity.json) file
4. Include this module or run [test.js](test.js) in CLI