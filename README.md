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
           "@netresearch/usercentrics-widgets": "^1.0.7"
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
   3. Google Tag Manager and scripts without output can still be used as before
      ```
      <script type="text/plain" data-usercentrics="Google Tag Manager">
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','{settings.GoogleTagManagerContainerId}');
      </script>
      ```

## Pipeline on github
* The pipeline is based on [Github Actions](https://github.com/netresearch/usercentrics-widgets/actions)
* The pipline build the `dist` folder and the JavaScript and css files
* The pipline also runs the tests

## Build changes locally
1. the /dist/ folder contains the latest version of the library
2. Changes can do in the /src/ folder
3. Install the library via NPM with `npm install`
4. Build the changes with `npm run build`

## Supported technologies
* all iframes
* all scripts
* background images only for Youtube at the moment

## Customization

All widgets can be changed via data attributes:

| Attribute                  | Description                     | Example                                                                       |
|----------------------------|---------------------------------|-------------------------------------------------------------------------------|
| `data-uc-src`              | `src` of the original element   | `data-uc-src="https://www.youtube.com/embed/xxx"`                             |
| `data-text`                | Text for the placeholder        | `data-text="We need your consent"`                                            |
| `data-accept`              | Label for the accept button     | `data-accept="ok"`                                                            |
| `data-uc-background-image` | URL for custom background-image | `data-uc-background-image="https://picsum.photos/id/12/1920/1080.jpg"` |

##  Styling

There is a scss template in the style folder, this is independent of the css file from the dist folder

Instead of using the original predefined CSS file, you can use your own. See [/style/ucw.css](/style/ucw.css) as a reference
which CSS classes need to be defined and [/example/customized.html](/example/customized.html) as an example.
