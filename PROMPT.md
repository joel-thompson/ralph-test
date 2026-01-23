@plan.md @activity.md

We are building the project from scratch in this repo.

First read activity.md to see what was recently accomplished.

Start the project locally with the appropriate command, check the package.json for the correct command. If it doesn't exist, you may need to set that up.

Open plan.md and choose the single highest priority task where passes is false.

Work on exactly ONE task: implement the change.

After implementing, use curl to:
1. Make a request to the local server URL
2. Verify the response is correct

Append a dated progress entry to activity.md describing what you changed and the curl request and response.

Update that task's passes in plan.md from false to true.

Make one git commit for that task only with a clear message.

Do not git init, do not change remotes, do not push.

ONLY WORK ON A SINGLE TASK.

When ALL tasks have passes true, output <promise>COMPLETE</promise>