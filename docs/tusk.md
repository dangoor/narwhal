
Tusk Package Manager
====================

The `tusk` command line tool is Narwhal's package manager. It is installed
along with Narwhal by default and is your one-stop tool to manage your
Narwhal installation. `tusk` requires Narwhal to run.

    tusk help
    
Status
------

`tusk` is a work in progress although already functional and capable of
handeling all your basic needs. If you have any questions or run into
any problems you can seek help in the [Mailing List](http://groups.google.com/group/narwhaljs).


Environmental Impact
--------------------

Like many other tools `tusk` needs to store some data on the system to manage
it's affairs. This data includes configuration, cache and backup files.

System(Planet) wide: `~/.tusk/` ~

    cache/*.zip     // Package downloads (md5(url)+".zip")
    tusk.json       // Tusk configuration
    *.catalog.json  // Named catalogs

Sea specific: `<sea>/.tusk/` ~

    tusk.json
    catalog.json    // The sea catalog



Commands
========

config
------

    tusk show-config

The planet-wide and sea-specific (if active) tusk configurations.



sea
---

    tusk create-sea <path>
    
Create a new sea.

    tusk show-sea

Show information about the currently active sea.

    tusk list-sea
    
List all known seas.

    tusk add-sea <path>
    
Add an existing sea to the `~/.tusk/tusk.json` config file.



package
-------

    tusk add-package --catalog <catalog> <uri>
    
Add the package at `<uri>` to the planet catalog named `<catalog>`. If `--catalog`
is omitted the package will be added to the sea catalog. The following uri's are
supported:

  * tusk add-package 
  * tusk add-package ./path/to/file
  * tusk add-package /path/to/file
  * tusk add-package file://
  * tusk add-package file://./path/to/file
  * tusk add-package file:///path/to/file
  * tusk app-package http://domain.com/path/package.zip

If a package with the same name already exists in the catalog it will not be
overwritten. You can force the new package to replace the old one with `-f`.


    tusk package -h

Bundle all modules for all installed packages into a directory. Different `flavors` of
packages are supported:

  * `browser` - Compiles modules ready for use on the browser engine

e.g.

    tusk package -f --flavor browser



Development
===========

Unit Tests
----------

    narwhal tests/tusk/all-tests.js



Work in Progress
----------------

The following functionality is currently under development.

A catalog is essentially a mapping of package names to where the 
packages can be found. This is similar to a cache as Kris Zyp mentioned.

Say we have a published catalog:

    http://repo.org/common/catalog.json ~
    {
      "packages": {
        "kitchen": http://domain.com/path/to/package.zip
        "kitchen.pantry": http://domain.com/path/to/package.zip
      }
    }

And a package:

    package.json ~
    {
      "name": "package.my",
      "catalogs": {
        "common": "http://repo.org/common/catalog.json"
      },
      "dependencies": {
        "bakery": {
          "catalog": "common",
          "package": "kitchen"
        },
        "bakery.pantry": {
          "catalog": "common",
          "package": "kitchen.pantry"
        }
      }
    }

Which is published to:

    http://domain.com/my/package.zip

I can add this package to my "test" catalog with:

    tusk package add --catalog test http://domain.com/my/package.zip

Where --catalog is optional and defaults to the default sea catalog.

To install this package I now do:

    tusk install --catalog test package.my

And use the dependencies via:

    require('#bakery/table');
    require('#bakery.pantry/cookies');


If I want to override the "bakery.pantry" dependency I can define a new 
package:

    package.json ~
    {
      "name": "kitchen.pantry.my",
    }

And add it to my "common.override" catalog:

    tusk package link --catalog common.override \
    http://domain.com/my/package.zip

Lastly I need to instruct tusk to use my "kitchen.pantry.my" package 
instead of the original "kitchen.pantry":

    package.local.json ~
    {
      "dependencies": {
        "bakery.pantry": {
          "catalog": "common.override",
          "package": "kitchen.pantry.my"
        }
      }
    }

This last step may not be desirable as it requires more work when always 
overriding the same packages. If the overridden package has the same 
name "kitchen.pantry" instead of "kitchen.pantry.my" the package could 
be installed with:

    tusk install --catalog test,common.override package.my

Or add the overriding package to the "test" catalog to begin with:

    tusk package link --catalog test http://domain.com/my/package.zip

(Assuming that dependencies are always looked up in the same catalog 
that the package to be installed resides in before proceeding to 
secondary catalogs defined in package.json)


When you want to deploy your application you could run:

    tusk catalog consolidate > catalog.json

Which can then be used on your server with:

    tusk catalog add catalog.json
    tusk package install package.my

If you have linked packages and not all your dependencies are published 
you can run:

    tusk --path /target/path consolidate

Which will put all your dependencies into the --path that you can then 
deploy along with the catalog.json file.


When managing catalogs and packages this way it may be more practical to 
have system wide catalogs for tusk that are not specific to a given sea. 
We can default to a local/sea catalog if no catalog is specified with 
--catalog.

