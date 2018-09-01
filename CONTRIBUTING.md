
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
