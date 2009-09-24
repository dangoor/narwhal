
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

    tusk sea create <path>
    
Create a new sea.

    tusk sea init <path>
    
Initialize a sea for an existing package.

    tusk sea show

Show information about the currently active sea.

    tusk sea list
    
List all known seas.

    tusk sea switch [<number>|<name>|<path>]
    
Switch to a given sea. This is the same as executing the sea's `bin/sea`.

    tusk sea add <path>
    
Add an existing sea to the `~/.tusk/tusk.json` config file.

    tusk sea bundle <type>

Bundle all modules for all installed packages in the currently active sea into a directory.
Different `<type>`'s of bundles are supported:

  * `browser` - Compiles modules ready for use on the browser engine


catalog
-------

    tusk catalog add <uri>
    
Add the catalog at `<uri>` which points to a `catalog.json` file. The name of the catalog
is derived from the `name` property in the catalog. The name must start with `localhost`
or any valid top level domain with the rest of the name in dot format. This naming scheme
can ensure unique names across all public catalogs.

    tusk catalog list
    
List all active catalogs.


package
-------

    tusk package install <uri>

Download and install a package and all it's dependencies into the active sea. The packages
will be added to the sea catalog and as dependencies of the sea.
See `tusk add-package` for info on the `<uri>` except for:

    tusk package add <package>

If no sea is active the package will be installed into the planet/narwhal.

    tusk package add [--catalog <catalog>] <uri>
    
Add the package at `<uri>` and all it's dependencies to the planet catalog named `<catalog>`.
If `--catalog` is omitted the package will be added to the sea catalog and as a dependency to the
sea. The following uri's are supported:

  * tusk package add 
  * tusk package add ./path/to/package
  * tusk package add /path/to/package
  * tusk package add file://
  * tusk package add file://./path/to/package
  * tusk package add file:///path/to/package
  * tusk package app http://domain.com/path/package.zip
  * tusk package app tusk://<catalog>/<package>
  
`<catalog>` is the name of a planet catalog.

If a package with the same name already exists in the catalog it will not be
overwritten. You can force the new package to replace the old one with `-f`.

    tusk package link [--catalog <catalog>] <uri>

Same as `tusk package add` but it links to the package instead of coyping it. This
is typically used during development. Only file system based `<uri>`'s are supported.

    tusk package remove [--catalog <catalog>] <name>

Remove a package and all it's dependencies from a catalog. If `--catalog` is omitted the package
will also be removed as a dependency of the sea. `--delete` will also delete the package source code.

    tusk package list

List all installed and dependent packages of the sea.

    tusk package create

List all installed and dependent packages of the sea.


Development
===========

Unit Tests
----------

    narwhal tests/tusk/all-tests.js



Work in Progress
----------------

*NOTE: THE ACTUAL IMPLEMENTATION DIFFERES FROM THE OVERVIEW BELOW!*

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

