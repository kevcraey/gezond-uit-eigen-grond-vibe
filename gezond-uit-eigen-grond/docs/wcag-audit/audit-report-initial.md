
> gezond-uit-eigen-grond@4.1.1 audit:a11y
> pa11y-ci

(node:6726) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
Running Pa11y on 4 URLs:
 > http://localhost:9000/ - 2 errors
 > http://localhost:9000/#doe-de-test - 2 errors
 > http://localhost:9000/#advies-groenten - Failed to run
 > http://localhost:9000/#advies-eieren - Failed to run

Errors in http://localhost:9000/:

 • Heading levels should only increase by one
   (https://dequeuniversity.com/rules/axe/4.10/heading-order?application=axeAPI)

   ()

   [no context]

 • Elements must meet minimum color contrast ratio thresholds
   (https://dequeuniversity.com/rules/axe/4.10/color-contrast?application=axeAPI)

   ()

   [no context]

Errors in http://localhost:9000/#doe-de-test:

 • Elements must meet minimum color contrast ratio thresholds
   (https://dequeuniversity.com/rules/axe/4.10/color-contrast?application=axeAPI)

   ()

   [no context]

 • Elements must meet minimum color contrast ratio thresholds
   (https://dequeuniversity.com/rules/axe/4.10/color-contrast?application=axeAPI)

   ()

   [no context]

Errors in http://localhost:9000/#advies-groenten:

 • Error: Cannot read properties of null (reading 'value')

Errors in http://localhost:9000/#advies-eieren:

 • Error: Cannot read properties of null (reading 'value')

✘ 0/4 URLs passed
