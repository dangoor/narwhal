
Tusk Package Manager
====================

The `tusk` command line tool is Narwhal's package manager. It is installed
along with Narwhal by default and is your one-stop tool to manage your
Narwhal installation. `tusk` requires Narwhal to run.

    tusk help
    tusk sea help
    tusk package help
    tusk catalog help
    tusk config help
    
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
    cache/*.json    // Catalog downloads (md5(url)+".json")
    tusk.json       // Tusk configuration
    *.catalog.json  // Named catalogs

Sea specific: `<sea>/` ~

    package.json    // The sea package manifest
    catalog.json    // The sea catalog



Contributing
============

Add unit tests for all commands/workflows/API's you use to ensure they will continue to work as tusk evolves.

Unit Tests
----------

Command tests:

    narwhal tests/tusk/commands/all-tests.js

API tests:

    narwhal tests/tusk/api/all-tests.js

Tutorial tests:

    narwhal tests/tusk/tutorial/all-tests.js

Workflow tests:

    narwhal tests/tusk/workflow/all-tests.js


Tutorials
=========

(1) Create and publish a package
--------------------------------

Run the test:

    narwhal tests/tusk/tutorial/create-publish-package.js

Commands:

    // Create a new sea/project
    tusk sea create --name test-package ./test-package

    tusk sea list                                       // Optional
    
    // Activate the sea/project
    tusk sea switch test-package

    pwd                                                 // Optional
    tusk sea show                                       // Optional
    tusk sea validate                                   // Optional
    tusk package list                                   // Optional
    
    // Write some code
    cp -Rf $NARWHAL_HOME/tests/tusk/tutorial/_files/create-publish-package/* ./
    
    // Add a package as a dependency to the sea/project
    tusk package add http://github.com/cadorn/domplate/zipball/master

    tusk package list                                   // Optional
    
    // Install all sea/project dependencies
    tusk package install -f
    
    tusk package list                                   // Optional
    
    // Test the package
    narwhal tests/all-tests.js

Publishing:

    rm -Rf packages/dependencies
    cd ..
    zip -r test-package.zip ./test-package

**TODO: Info on how to initialize a sea from this package or use it as a dependency**
    
    
    
Commands
========

**NOTE: NOT ALL COMMANDS BELOW ARE WORKING AT THIS TIME. SEE 'tusk * help' FOR WORKING COMMANDS**


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

    tusk sea validate
    
Validate a sea to ensure it meets all requirements. You can use `--sea` to specify
a sea other than the currently active one.

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

    tusk catalog remove <name>
    
Remove a catalog.

    tusk catalog update [<name>]

Update one or all planet catalogs.

    tusk catalog packages --catalog <name>

List all packages in given catalog. If `--catalog` is omitted the sea catalog is used.

    tusk catalog packages --catalog <name> <overlay>

Add the catalog with name `<overlay>` as an overlay to `--catalog'. All package searches
in the catalog will first check the overlay catalog.


package
-------

    tusk package install <uri>

Download and install a package and all it's dependencies into the active sea. The packages
will be added to the sea catalog and as dependencies of the sea.
See `tusk add-package` for info on the `<uri>` except for:

    tusk package install <package>

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
Only the specified package is linked. All dependencies are ignored.

    tusk package remove [--catalog <catalog>] <name>

Remove a package and all it's dependencies from a catalog. If `--catalog` is omitted the package
will also be removed as a dependency of the sea. `--delete` will also delete the package source code.

    tusk package list

List all installed and dependent packages of the sea.

    tusk package create

List all installed and dependent packages of the sea.

    tusk package uninstall <name>

Uninstall a package from the sea.

    tusk package build <name>

Build a package from the sea. Build target are defined in `package.json` with:

    "build": {
        "defaultTarget": "dev",
        "targets": {
            "dev": "build/dev",
        }
    }
    