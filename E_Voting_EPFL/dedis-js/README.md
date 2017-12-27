# dedis-js
A magic JavaScript cauldron containing DEDIS related procedures used in browsers.

## Installation
Make sure you have the latest versions of node.js and npm.
```
git clone https://github.com/qantik/dedis-js
cd dedis-js
npm install
npm test # Run unit test suite
npm run build # Generates bundle.min.js
npm run doc # Generates doc markdown in doc/
```

## Usage
```html
<html>
  <head>
    <script src="bundle.min.js" type="text/javascript"></script>
    <script type="text/javascript">
      const misc = dedis.misc; // miscellaneous functions
      const net = dedis.net; // network functions
      const crypto = dedis.crypto // cryptography functions
      
      console.log(misc.reverseHex('01020304')); // 04030201
    </script>
  </head>
  <body>
    ...
  </body>
</html>
```
