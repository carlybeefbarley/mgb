# [MGB Landing Site][1]

This is landing page for MyGameBuilder.

**[Demo][1]**

## Development

**:warning: Heads up!**

Run a meteor build before starting the landing page. The landing page uses assets from the `app/`.

Then:

```
$ cd code13/landing
$ yarn
$ yarn start
```

Hack on `/src`, the site is rebuilt and reloaded automatically.

## Interpolation

HTML, JS, and LESS can use `{{ ENV_VAR }}` notation to interpolate system environment variables.

```html
<base href="{{ MGB_LANDING_BASE_URL }}">
<img href="{{ MGB_LANDING_BASE_URL }}img/foo.png">
```
```bash
$ MGB_LANDING_BASE_URL=/other/site/ yarn build
```
```html
<base href="/other/site/">
<img href="/other/site/img/foo.png">
```

## Borrowed Assets

You can reference built meteor assets in the HTML directly with `~`.  Built assets referenced this way will be copied over from the meteor app.  Gulp will log copy successes and failures.

This will automatically copy the `team.png` asset to the landing's `dist/` directory.
```html
<img src='~/app/images/mascots/team.png' />
```

## Deploying

Each deploy runs a fresh build prior to deploying.

```
$ yarn deploy               # Deploys to staging and production
$ yarn deploy:staging       # Deploys to `gh-pages` site
$ yarn deploy:production    # Deploys to all production domains
```

[1]: https://devlapse.github.io/mgb/
