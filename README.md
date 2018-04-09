## This is a bio scaffold.

[What is bio?](https://github.com/weidian-inc/bio-cli)

`bio-entry.js` is the file that bio runs scaffold.

`project-template/` is demo dir.

Supported tasks:

+   `dev-daily`: develop in daily environment
+   `dev-pre`: develop in pre environment
+   `dev-prod`: develop in prod environment
+   `build-daily`: build in daily environment
+   `build-pre`: build in pre environment
+   `build-prod`: build in prod environment

Quick Start:

+   step1: install Node.js（8.9.1+）

    https://nodejs.org/en/download/

+   step2: install bio

    `npm install bio-cli -g`

+   step 3

    `mkdir demo`

    `cd demo`
    
+   step 4

    `bio init bio-scaffold-vue`

+   step 5

    ```
    npm install
    ```
    
+   step 6
    
    ```
    bio run dev-daily
    ```

## project tree

```
pages/
    index/
        index.html
        index.js
        index.less
    detail/
        index.html
        index.js
        index.less
```

## build output

```
dist/
    pages/
        index.html
        detail.html
    static/
        index/index.js
        detail/index.js
```