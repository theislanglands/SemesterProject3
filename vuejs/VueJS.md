# VueJS
Pronounced view js.
Install vue cli with this command:
```npm install -g @vue/cli```
## Router
The router allows for showing different vue files depending on the browser path. This can be enabled either at creation by selecting the 'Manually select features' option, and selecting the Router option by using the arrows to go down, and selecting option with space. To continue press enter. Select 'No' in the option to use history mode for the router, by typing 'n'. Select what you prefer for the rest of the questions.

If you have already created a project, you can use the command:
```vue add router```
to add the router. Be ware that this overrides the main.js file.

The router is configured in the index.js file found in the router folder. To add a new path one can just add it to the routes array. Remember that the component has to be imported.
