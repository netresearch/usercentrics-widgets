Usercentrics Widgets 
=====================

![GitHub release (latest by date)](https://img.shields.io/github/v/release/philsch/usercentrics-widgets?style=flat-square)
[![Build Status](https://travis-ci.com/philsch/usercentrics-widgets.svg?branch=master)](https://travis-ci.com/philsch/usercentrics-widgets)
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/standard/semistandard)
![size ucw.js](https://img.shields.io/github/size/philsch/usercentrics-widgets/dist/ucw.js?style=flat-square&label=/dist/ucw.js)
![size ucw.legacy.js](https://img.shields.io/github/size/philsch/usercentrics-widgets/dist/ucw.legacy.js?style=flat-square&label=/dist/ucw.legacy.js)

Lightweight placeholders for third party content of your website (e.g. Youtube Videos) compatible with the 
[Usercentrics CMP](https://usercentrics.com).

#### Disclaimer

* Unlike the [Usercentrics Smart Data Protector](https://docs.usercentrics.com/#/smart-data-protector), this library 
  **does not block** third party content automatically. You have to change your website according the documentation 
  in this README!
  
* This is a community project and no official product from Usercentrics.

## 🐞 Report bugs

I have just started with this project, please create a Github issue if you encounter any bugs, thanks! 

## 🚀 Howto

1. Setup Usercentrics CMP
1. For each `iframe` elements you want to replace
    1. change `src` to `data-src`
    1. add `class="uc-widget"`
    1. add the attribute `data-uc-id` with the ID of the matching service 
       (for example `data-uc-id="BJz7qNsdj-7"` for Youtube)
1. Download and add the files from the `/dist/` folder to your website
    1. `ucw.min.css` into the `<head>` section: 
       ```
       <head>
         <link type="text/css" rel="stylesheet" href="ucw.min.css"/>
       </head>
       ```
    1. `ucw.js` (or if you need IE11 support `ucw.legacy.js`) at the end of your `<body>`
       ```
         <script src="ucw.js"></script>
       </body>
       </html>
       ```
       
Instead of downloading the files you can also use the *jsdelivr CDN*, however it's recommended
to host the files on your server to avoid third party requests. 

Refer to the [/example/](./example) directory for complete examples.

## 📺 Supported technologies

* ✅ all iframes
* ⏳ background images only for Youtube at the moment

## 🎨 Customization

Instead of using the predefined CSS file, you can use your own. See [/style/ucw.css](/style/ucw.css) as a reference
which CSS classes need to be defined.
