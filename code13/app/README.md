# My Game Builder

This is the user facing application for My Game Builder.

## Setup

### Prerequisites

1. Yarn from https://yarnpkg.com/en/docs/install (`v0.27.5` or later)
1. Node.js from https://nodejs.org/en (`v6.9.4` or later)
1. Meteor from https://www.meteor.com/install (use `v1.5`).

### Dependencies

1. Make sure you're in `code13/app`
1. Run `yarn` to install dependencies
1. Widows users, skip to [Windows Setup](#windows-setup)

You should be ready to [develop](#develop) on the app now.

## Development

Start the app and open `http://localhost:3000`. Live reload is enabled but slow.

```
yarn start               # Start the app
yarn test                # Runs tests
yarn run start:empty     # Test the app with an empty local database
```

### Windows Setup

1. Ensure you're on Windows 10
1. AS ADMINISTRATOR, run `yarn add --global --production windows-build-tools`
1. To run the `go.sh` script which connects to the real databases, you need to add `.bat` to the line in the `go.sh` script that starts `meteor`: 

    In `go.sh`:
    ```
    meteor.bat -p 0.0.0.0:3000 $@
    ```

    then start the app from Powershell:
    ```
    yarn start
    ```

>If this doesn't work, try installing Github Desktop from https://desktop.github.com.
>Then, use the 'GIT Shell' Windows 'Program' it installs.
