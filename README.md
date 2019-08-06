# FTP_POC - Dockerfile Creator for custom stacks
FTP_POC allows the user to create his own custom stack (Dockerfile) for the online cloud solution in an easily accessible user-friendly way.
Select the available options to create your own suitable Dockerfile. An advanced mode with an editable preview of the Dockerfile is available if the available options are not enough.

# Live Deployment
Check out this [live deployment](https://romanpulgrabja.github.io/FTP_POC/) to see the Dockerfile Creator live in action based on the current master branch.

# Instructions for use
1. Select your Python Module set. It includes a set of common modules ready for use.
2. Select the user (Student, Tutor/Professor, Co-Workers) for this custom stack.
3. If required, check the additional dependencies that are available.
4. Enter the port that the stack should listen to. By default it is 8080.
5. Click on Build to generate your Dockerfile. If you want to undo your settings, click on the Reset button.
6. If the available options are not enough for your needs, you can open the advanced mode by clicking on the Advanced 
button. It allows you to edit the Dockerfile template manually.

# Notes for contributors
Do not upload files from the .idea folder. These files are custom to each individual, created by the PyCharm IDE. Uploading them will only cause merge conflicts each time someone tries to merge his contributions to the master. The .gitignore file is there to ignore anything located in the .idea folder.
Please clone the repository once before starting, if you already worked on the repository before (otherwise it will mess up your workspace).
