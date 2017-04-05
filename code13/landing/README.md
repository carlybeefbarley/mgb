# [MGB Landing Site][1]

This is landing page for MyGameBuilder.

**[Demo][1]**

## Development

**:warning: Heads up!**

Run a meteor build before starting the landing page. The landing page uses assets from the `app/`.

Then:

    $ cd code13/landing
    $ npm install
    $ npm start

Hack on `/src`, the site is rebuilt and reloaded automatically.


## Interpolation

HTML, JS, and LESS can use `{{ ENV_VAR }}` notation to interpolate system environment variables.

```html
<base href="{{ BASE_URL }}">
<img href="{{ BASE_URL }}/img/foo.png">
```
```bash
$ BASE_URL=/other/site/ npm run build
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

Runs a fresh build and deploys to the `gh-pages` branch, for now:

```
$ npm run deploy
```

[1]: https://devlapse.github.io/mgb/
