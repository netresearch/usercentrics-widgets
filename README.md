Usercentrics Widgets 
=====================

Lightweight customizable placeholders for third party content of your website (e.g. Youtube Videos) compatible with the
[Usercentrics CMP](https://usercentrics.com). The library supports both the classic `UC_UI` interface and the
Usercentrics v3 Browser API.

* Unlike the [Usercentrics Smart Data Protector](https://docs.usercentrics.com/#/smart-data-protector), this library 
  **does not block** third party content automatically. You have to change your website according the documentation 
  in this README!
  
* This is based on a [community project](https://philsch.github.io/usercentrics-widgets/) and no official product from Usercentrics 


## Quickstart

1. Setup Usercentrics CMP
2. For each `iframe` and `script` elements you want to edit
    1. change `src` to `data-uc-src`
    2. add `data-usercentrics="[SERVICE NAME]"` with the Name of the matching service form Usercentrics admin area
        1. (for example `data-usercentrics="Google Maps"` for Google Maps)
    3. add the attribute `data-uc-id` with the ID of the matching service form Usercentrics admin area
       (for example `data-uc-id="BJz7qNsdj-7"` for Youtube)
3. The Packet can load via NPM 
   1. Include in package.json
      ```
      "devDependencies": {
           "@netresearch/usercentrics-widgets": "^2.0.0"
      },
      ```        
      or
   2. Install via NPM
      ```
      npm install @netresearch/usercentrics-widgets
      ```

4. Include and add the files from the `/dist/` folder to your template
    1. `ucw.min.css` into the `<head>` section: 
       ```html
       <head>
         <link type="text/css" rel="stylesheet" href="ucw.min.css"/>
       </head>
       ```
    2. `ucw.js` (or if you need IE11 support `ucw.legacy.js`) at the end of your `<body>`
       ```html
         <script src="ucw.js"></script>
       </body>
       </html>
       ```

5. Example
   1. IFrame (Google Maps) 
      ```
      <iframe data-usercentrics="Google Maps" data-uc-id="S1pcEj_jZX" data-uc-src="https://www.google.com/maps/d/u/1/embed?mid=XXX" width="852" height="480"></iframe>
      ```
   2. External Script (bookingkit)
      ```
      <div id="bookingKitContainer" data-cw="6dfd2c67962b9442abd2a28759a7445e"></div>
      <script type="text/plain" data-usercentrics="bookingkit" data-uc-id="Ewb9uz1Rp" data-uc-src="https://4706b1799db005bf104.widget.bookingkit.net/bkscript/XXX/" async></script>
      ```
   3. Google Tag Manager and scripts without output can still be used as before. This library does not process them — they carry no `data-uc-src`, so Usercentrics blocks them directly via `type="text/plain"`
      ```
      <script type="text/plain" data-usercentrics="Google Tag Manager">
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','{settings.GoogleTagManagerContainerId}');
      </script>
      ```

## Pipeline on GitHub
* The pipeline is based on [GitHub Actions](https://github.com/netresearch/usercentrics-widgets/actions)
* It lints the sources, builds the `dist` folder with the JavaScript and CSS files, audits the dependencies and runs CodeQL
* There is no test suite, so the pipeline runs none. `bun test` is a placeholder that exits with an error

## Build changes locally
1. `dist/` is build output. It is not committed — run `bun run build` to produce it. The published npm package ships it
2. Changes can do in the /src/ folder
3. Install the dependencies with `bun install`
4. Build the changes with `bun run build`

## Supported technologies
* all iframes
* all scripts, including `type="module"` (see [Script embeds](#script-embeds))
* custom background images via `data-uc-background-image` on any widget; automatic poster images only for YouTube, via the Usercentrics privacy proxy

## Customization

All widgets can be changed via data attributes:

| Attribute                  | Description                     | Example                                                                       |
|----------------------------|---------------------------------|-------------------------------------------------------------------------------|
| `data-uc-src`              | The parked `src` of the blocked element. Its presence is what turns the element into a widget | `data-uc-src="https://www.youtube.com/embed/xxx"` |
| `data-uc-id`               | Usercentrics service ID         | `data-uc-id="BJz7qNsdj-7"`                                                     |
| `data-usercentrics`        | Usercentrics service name       | `data-usercentrics="Google Maps"`                                              |
| `data-text`                | Text for the placeholder        | `data-text="We need your consent"`                                            |
| `data-accept`              | Label for the accept button     | `data-accept="ok"`                                                            |
| `data-uc-background-image` | URL for custom background-image | `data-uc-background-image="https://picsum.photos/id/12/1920/1080.jpg"` |

## Script embeds

A blocked `<script>` carries its URL in `data-uc-src` and a non-executing `type`, conventionally `type="text/plain"`. On consent the element is put back into the document, the blocking `type` is removed and `src` is assigned — that order is what makes the browser run the script.

`type="module"` is preserved. A module embed is restored as a module:

```html
<script type="module" data-usercentrics="Some Service" data-uc-id="XXXXXXXX" data-uc-src="https://example.com/embed.mjs"></script>
```

Any other `type` is dropped on activation, which is what un-blocks a `text/plain` placeholder. If the element already has a `src` of its own it is overwritten by `data-uc-src`.

## Events

Both events bubble, so a listener on `document` or `window` receives them.

| Event | Target | `detail` | When |
|---|---|---|---|
| `ucw:activated` | the restored element (the `<iframe>` or `<script>`) | `{ ucId }` | after `src` has been assigned — the embed has started loading, not finished |
| `ucw:activation-failed` | `document` | `{ ucId, reason }` | the placeholder was no longer in the document when consent arrived, so the embed could not be restored. `reason` is currently always `placeholder-detached` |

```js
document.addEventListener('ucw:activated', (e) => {
  console.log('embed restored for service', e.detail.ucId);
});
```

`ucw:activation-failed` is dispatched on `document` because the element it concerns has been detached and a listener on it would never fire. It is the only signal for that case that survives the production build, which strips `console.*`.

##  Styling

There is a scss template in the style folder, this is independent of the css file from the dist folder

Instead of using the original predefined CSS file, you can use your own. See [/style/ucw.css](/style/ucw.css) as a reference
for which CSS classes need to be defined.



## Configuration via config file (optional)

You can centrally control the behavior and texts of the widgets using an optional config file. The file exposes a global variable `window.UCW_WIDGET_CONFIG`.

How to include:

- Include `ucw.js` (or `ucw.legacy.js`) with an additional `data-config` attribute pointing to your configuration file.

Example:

```html
<head>
  <link type="text/css" rel="stylesheet" href="/assets/{BUILD_NUMBER}/js/usercentrics-widgets/ucw.min.css" />
</head>
<body>
  ...
  <script src="/assets/{BUILD_NUMBER}/js/usercentrics-widgets/ucw.js"
          data-config="/assets/{BUILD_NUMBER}/js/usercentrics-widgets/ucw.config.js"></script>
</body>
```

Structure of the configuration (`window.UCW_WIDGET_CONFIG`):

- i18n (language-specific; keys `de` or `DE`, `en` or `EN` — no other casing is recognised)
  - textHtml: Complete HTML for the placeholder (overrides prefix/suffix variant)
  - acceptLabel: Text of the accept button
  - acceptLabelClass: Additional CSS class(es) added to the accept **button** itself, alongside `uc-widget-accept` and `uc-widget-control`
  - textServicePrefix: Text before the service name, if `textHtml` is not used
  - textSuffixHtml: HTML after the service name, if `textHtml` is not used
- Root level (optional, fallback for all languages):
  - textHtml, acceptLabel, acceptLabelClass, textServicePrefix, textSuffixHtml

Notes:
- Language is detected via the `lang` attribute on the `<html>` element. For German, `de-DE`, `de` or `DE` are supported; otherwise English is used.
- A complete example is [`src/config/ucw.config.example.js`](/src/config/ucw.config.example.js) in this repository. The build copies it to `dist/ucw.config.js`.
- The `data-config` URL is validated before it is loaded: it must be same-origin and end in `.js` or `.mjs`. Anything else — a CDN URL, a `data:` URI — is rejected and no config is loaded. A load error is ignored silently, and the widgets fall back to their defaults.
