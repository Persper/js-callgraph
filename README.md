# Field-based Call Graph Construction for JavaScript #

This project implements a field-based call graph construction algorithm for JavaScript as described in

> A. Feldthaus, M. Schäfer, M. Sridharan, J. Dolby, F. Tip. Efficient Construction of Approximate Call Graphs for JavaScript IDE Services. In *ICSE*, 2013.


## Get Started
```
npm install
node jcg -h # for a list of command line arguments

# Running on simple input scripts
node jcg --cg input-scripts/simple-scripts/functioncall-arithmetic.js

# Running on a whole directory
node jcg --cg input-scripts/fullcalendar/

# Running on mixed input
node jcg --cg input-scripts/fullcalendar/fullcalendar/ input-scripts/fullcalendar/lib/jquery-2.1.0.js

# Running with output file
node jcg --cg input-scripts/simple-scripts/functioncall-arithmetic.js --output filename.json
```

For an example of the output json, please see [here](#unified-json-format).

## Running Tests
To run the testing framework run:
```
npm test
```
To install the git hooks to run tests automatically pre-commit run:
```
scripts/install-hooks
```
## Structure

The call graph constructor can be run in two basic modes (selected using the `--strategy` flag to `javascript-call-graph`), *pessimistic* and *optimistic*, which differ in how interprocedural flows are handled. In the basic pessimistic approach (strategy `NONE`), interprocedural flow is not tracked at all; a slight refinement is strategy `ONESHOT`, where interprocedural flow is tracked only for one-shot closures that are invoked immediatel. The optimistic approach (strategy `DEMAND`) performs interprocedural propagation along edges that may ultimately end at a call site (and are thus interesting for call graph construction). Full interprocedural propagation (strategy `FULL`) is not implemented yet.

All strategies use the same intraprocedural flow graph, in which properties are only identified by name; thus, like-named properties of different objects are conflated; this can lead to imprecise call graphs. Dynamic property reads and writes are ignored, as are reflective calls using `call` and `apply`; thus, the call graphs are intrinsically incomplete.

Module `flowgraph.js` contains the code for extracting an intraprocedural flow graph from an [Esprima](esprima.org) AST (for convenience, a version of Esprima is included in `esprima.js`) annotated with name bindings for local variables (see `bindings.js`, which uses `symtab.js` and `astutil.js`).

Modules `pessimistic.js` and `semioptimistic.js` implement the pessimistic and optimistic call graph builders, respectively. They both use `flowgraph.js` to build an intraprocedural flow graph, and then add some edges corresponding to interprocedural flow. Both use module `callgraph.js` for extracting a call graph from a given flow graph, by collecting, for every call site, all functions that can flow into the callee position. Both use module `natives.js` to add flow edges modelling well-known standard library functions.

The remaining modules define key data structures, in several variants.

Module `graph.js` implements graphs using adjacency sets, using sets of numbers as implemented by `numset.js`. The latter includes either `olist.js` to implement sets as ordered lists of numbers, or `bitset.js` to use bitsets (with disappointing performance, so we use ordered lists by default).

Modules `dftc.js`, `heuristictc.js` and `nuutila.js` implement several transitive closure algorithms used by `callgraph.js`. By default, we use `dftc.js` which uses a simple, depth first-search based algorithm. `heuristictc.js` does something even simpler, which is very fast but unsound. Finally, `nuutila.js` implements Nuutila's algorithm for transitive closure, which for our graphs is usually slower than the depth first-based ones.

## Unified JSON Format

```
[ # The calls are represented with a list object, which elements contains the bindings of nodes.
  {
    "source": { # The source object represent the start point of call
      "label": "global",
      "file": "...\\input-scripts\\simple-scripts\\functioncall-arithmetic.js",
      "start": { # The start point of source with row-column based pointers.
        "row": 7,
        "column": 4
      },
      "end": { # The end point of source with row-column based pointers.
        "row": 7,
        "column": 8
      },
      "range": { # The source node range with index-based pointers.
        "start": 59,
        "end": 63
      }
    },
    "target": { # The target object represent the end point of call
      "label": "f",
      "file": "...\\input-scripts\\simple-scripts\\functioncall-arithmetic.js",
      "start": { # The start point of target with row-column based pointers.
        "row": 3,
        "column": 0
      },
      "end": { # The end point of target with row-column based pointers.
        "row": 5,
        "column": 1
      },
      "range": { # The target node range with index-based pointers.
        "start": 14,
        "end": 51
      }
    }
  }
]
```



# How to contribute

  * First you should **fork** this repository (hit the fork button)
  * **Clone** your forked repository
    ```
        # Clone your fork to your local machine using SSH
        git clone git@github.com:USERNAME/FORKED-PROJECT.git
        # Or with HTTPS
        git clone https://github.com/USERNAME/FORKED-PROJECT.git
    ```
  * **Create a branch** for you new feature
  * **Commit your changes** to your branch
  * **Keep your fork synced** with the original repository if needed. See [Keeping the fork up to date](#keeping-the-fork-up-to-date) section for further details.
  * When you finished your work:
    * **Open a Pull Request** in the original repository and set master as base and your newly created branch as head. Please fill the description field for letting the others know what the contribution is about.
    * If your changes seem good for the maintainers they will accept your pull request and merge your commits into the original repository

  ### Keeping the fork up to date

  It is an optional step. It is recommended when you are working on a larger feature or a complex bug (not a tiny quick fix).
  Following the steps below ensures to track the original fork which is usually called __upstream__.
  First add the original repository as a remote:
  ```
    # Add 'upstream' repo to list of remotes
    git remote add upstream https://github.com/UPSTREAM-USER/ORIGINAL-PROJECT.git
    # Verify the new remote named 'upstream'
    git remote -v
  ```

  To update your fork to the latest version you have to fetch the changes from the upstream:
  ```
    # Fetch from upstream remote
    git fetch upstream
    # View all branches, including those from upstream
    git branch -va
  ```

  Now, checkout your own master branch and merge the upstream repo's master branch:

  ```
    # Checkout your master branch and merge upstream
    git checkout master
    git merge upstream/master
  ```

  Now your master is up to date with the remote upstream repository. Your feature branch should be also updated. For this purpose you can use a rebase command:
  ```
    git checkout newfeature
    # Updates origin/master
    git fetch origin
    # Rebases current branch onto origin/master
    git rebase origin/master
  ```

# License #

This code is licensed under the [Eclipse Public License (v2.0)](http://www.eclipse.org/legal/epl-2.0), a copy of which is included in this repository in file `LICENSE`.
