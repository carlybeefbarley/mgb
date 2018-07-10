# My Game Builder

This is the user facing application for My Game Builder.

## Setup

### Prerequisites

1. [Install Yarn][1] (`v0.27.5` or later)
1. [Install Node.js][2] (`v6.9.4` or later)
1. [Install Meteor][3] (use `v1.6.0.1`)

### Dependencies

1. Install `yarn` inside of `meteor`: `meteor npm install -g yarn`
1. Make sure you're in `code13/app`
1. Run `meteor yarn` to install dependencies
1. Widows users, skip to [Windows Setup](#windows-setup)

You should be ready to [develop](#develop) on the app now.

## Component Development

Components are developed with [`storybook`][4].

1. Create a `__stories__` directory along side your component
1. Put a `*.stories.js` file in `__stories__`
1. Start story book with `yarn storybook`
1. Open your browser to quickly develop your component

Search for `*.stories.js` to see examples of how to create stories.

Each story in your `*.stories.js` file automatically creates a Jest Snapshot test. See [StoryShots][5].  This means you do not need to test assertions for the structure of your components.  Instead, simply write stories and make sure they look correct.  Storybook will automatically test that the structure of your component doesn't change in future tests.

## Component Testing

Components are tested with [`Jest`][4].

1. Create a `__tests__` directory along side your component
1. Put a `*.test.js` file in `__tests__`
1. Run tests with `yarn test:watch`

Search for `*.test.js` to see examples of how to write tests.

Test component behavior only.  Do not test component structure. Instead, write [Stories](#developing-components) which automatically test the structure of your component.  This is a much more productive workflow.

## App Development

The app is developed by running `yarn start` and runs at http://localhost:3000.  Hack on `/app` to make changes.

## Commands

See `package.json` for the current list of scripts.

```
yarn ci               # Run the same checks as CI
yarn test             # Runs tests
yarn test:watch       # Runs tests in watch mode
yarn lint             # Format, fix, and lint code
yarn start            # Start the app with the production DB
yarn start:empty      # Start the app with an empty local DB
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

[1]: https://yarnpkg.com/en/docs/install
[2]: https://nodejs.org/en
[3]: https://www.meteor.com/install
[4]: https://storybook.js.org
[5]: https://storybook.js.org/testing/structural-testing
[6]: http://facebook.github.io/jest
