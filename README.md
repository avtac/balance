# Balancr

<picture>
  <img height="100px" src="public/favicon.svg" alt="Balancr Logo">
</picture>

> [!NOTE]
> Developers of Balancr do not take any responsibility for incorrect calculations
> that may lead to exceeding aircraft limitations. Using this planning tool designed
> not substitute sound pilot judgement, confirm all calculations with your
> aircraft POH.

> [!WARNING]
> This is in early development, it is not guaranteed if any that configuration
> files will work in future versions.

Balancr is a tool to help pilots calculate their aircraft's weight and balance.
This is designed to allow users or organizations to create configuration files
for their aircraft and share that with anyone flying their aircraft.

## Use/Install

I am planning to host this as a static website but at the moment it can only be
used by building the project locally and hosting it on a python server.

### Building

> [!NOTE]
> `npm` is a prerequisite for building the project.

Download the code to your computer and navigate to that folder. Install the npm
packages and build.

``` bash
$ npm i
$ npm run build
```

This will create a `dist` directory where the build will be. This can be copied
to be used in a webserver or a python http server can be run for local access.

To run the python http server:
``` bash
$ python -m http.server 8000
```

In your browser navigate to localhost:8000.

## Development

This is early development and there will be lots of changes coming. Open an Issue
if you have any ideas how to improve the UI, usability, accessibility, or function.
Code cleanup will also be welcomed.

### Priority Tasks

[ ] - Mobile device accessibility
[ ] - Interactive Diagram and Graph
[ ] - Ability to export using a user defined template

