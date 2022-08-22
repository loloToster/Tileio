<link rel="stylesheet" href="/static/css/docs-page.css">

# How to use the app

## Cells

After logging in for the first time you are presented with a grid of 10x5 empty cells. So what's next?

1. Enter the [editing mode](#editing-mode)
2. [Add a cell](#adding-a-cell)
3. [Move and resize the cell](#resizing-and-moving-a-cell)
4. If you are happy with your grid go to point `5` otherwise go to point `2`
5. Save your grid
6. Use your grid in any way you like

Read further for more information.

### Editing mode

To enter the editing mode click the ![Edit Button (pencil)]() in the top right corner of the grid.\
In editing mode you can [add a cell](), [delete a cell]() or [edit an existing cell](). After making any of those changes the **grid will not save automatically**, to save the changes click the ![Save Button (cloud)]().

If you messed something up you can also click the ![Revert Button (arrow)]() and revert the changes.

### Adding a cell

To add a cell enter the [editing mode](#editing-mode) and click the ![Add Button (plus symbol)](). You will be presented with a window in which you can add a cell.

There are two types of a cell that you can add, a link cell and a dynamic cell:

#### Link cell

A link cell is simply a cell that opens a new tab with specified url. There are three properties of a link cell that you can change:

1. Icon - The icon that is displayed in a cell. Its color is determined by the background color of a cell: white if background is dark and black if background is light. Icons are provided by [Simple Icons](https://simpleicons.org/) and [Font Awesome](https://fontawesome.com/search?m=free).
2. Color - The background color of a cell. 
3. Link - A url that the cell points to.

#### Dynamic cell

A dynamic cell is a cell that can do anything dynamic like display data, control music, create notes etc. To add a dynamic cell you can either choose one of the `Built-in Cells` or create/find a custom one and provide its url.

After choosing the cell settings you can add this cell by clicking the `Finish` button.

### Deleting a cell

There are two ways to delete a cell:

1. By dragging it to the trash while in [editing mode](#editing-mode).\
![Deleting cell by dragging Demo]()

2. Right-clicking it and clicking `Delete`. If you delete a cell while in [editing mode](#editing-mode) the deletion will not save automatically!\
![Deleting cell by context menu Demo]()

### Editing a cell

To edit a cell right-click it and click the `Edit` option. This will open the same window as the one in which you add a cell. In there you can change the cell in any way you like and then click the finish button to finalize the edit. If you edit a cell while in [editing mode](#editing-mode) the edit will not save automatically!

![Editing Cell Demo]()

### Resizing and Moving a cell

To resize or move a cell you have to enter the [editing mode](#editing-mode). You can do this by right-clicking any cell and choosing `Resize` option. To move a cell grab it and move it wherever you want to. To resize a cell hold the <img style="transform: rotate(-45deg);" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDUxMS42MjYgNTExLjYyNyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNTExLjYyNiA1MTEuNjI3OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPHBhdGggZD0iTTMyOC45MDYsNDAxLjk5NGgtMzYuNTUzVjEwOS42MzZoMzYuNTUzYzQuOTQ4LDAsOS4yMzYtMS44MDksMTIuODQ3LTUuNDI2YzMuNjEzLTMuNjE1LDUuNDIxLTcuODk4LDUuNDIxLTEyLjg0NSAgIGMwLTQuOTQ5LTEuODAxLTkuMjMxLTUuNDI4LTEyLjg1MWwtNzMuMDg3LTczLjA5QzI2NS4wNDQsMS44MDksMjYwLjc2LDAsMjU1LjgxMywwYy00Ljk0OCwwLTkuMjI5LDEuODA5LTEyLjg0Nyw1LjQyNCAgIGwtNzMuMDg4LDczLjA5Yy0zLjYxOCwzLjYxOS01LjQyNCw3LjkwMi01LjQyNCwxMi44NTFjMCw0Ljk0NiwxLjgwNyw5LjIyOSw1LjQyNCwxMi44NDVjMy42MTksMy42MTcsNy45MDEsNS40MjYsMTIuODUsNS40MjYgICBoMzYuNTQ1djI5Mi4zNThoLTM2LjU0MmMtNC45NTIsMC05LjIzNSwxLjgwOC0xMi44NSw1LjQyMWMtMy42MTcsMy42MjEtNS40MjQsNy45MDUtNS40MjQsMTIuODU0ICAgYzAsNC45NDUsMS44MDcsOS4yMjcsNS40MjQsMTIuODQ3bDczLjA4OSw3My4wODhjMy42MTcsMy42MTcsNy44OTgsNS40MjQsMTIuODQ3LDUuNDI0YzQuOTUsMCw5LjIzNC0xLjgwNywxMi44NDktNS40MjQgICBsNzMuMDg3LTczLjA4OGMzLjYxMy0zLjYyLDUuNDIxLTcuOTAxLDUuNDIxLTEyLjg0N2MwLTQuOTQ4LTEuODA4LTkuMjMyLTUuNDIxLTEyLjg1NCAgIEMzMzguMTQyLDQwMy44MDIsMzMzLjg1Nyw0MDEuOTk0LDMyOC45MDYsNDAxLjk5NHoiIGZpbGw9IiM2NjY2NjYiLz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4K"> icon in the bottom-right corner of the cell and move it around. (If the cell is dynamic its dimensions are available for it in the URL Api)

![Resizing and Moving Cell Demo]()

## Grid

To open grid settings click the ![Settings Button (gear)]() in the top-right corner of the grid.

### Changing size

To change the grid size move green sliders to set the desired width and height. After changing it click the `Save` button to save the changes. If there are cells colliding you will not be able to save the new size and will have to move some of the cells to free up the space. 

### Changing colors

1. Background color - background color changes the color of the background. (This setting is available for any dynamic cell in the URL Api)
2. Cell color - cell color is the default background color of a cell. (This setting is available for any dynamic cell in the URL Api)

After changing the colors click the `Save` button to save the changes.

## Other

### Log out

To log out open your profile by clicking the ![Profile Button (person)]() and then click ![Log out Button (red doors with arrow)]()

# Other guides

<!-- ## Where to find Ical url -->
