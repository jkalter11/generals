# The Game of The Generals Online

## About Application

Backend
- `node.js` as the backend platform and server
- `socket.io` handles client-server game flow
- `expressjs` for the backend application framework
- `mocha` for unit testing (installed globally so it can be run from the terminal)
- `grunt` for automation

Frontend
- `jQuery` for DOM manipulation, animation and AJAX

The Game of the Generals, also called GG as it is most fondly called, or simply The Generals, is an educational wargame invented in the Philippines by Sofronio H. Pasola, Jr. in 1970. It can be played within twenty to thirty minutes. It is designed for two players, each controlling an army, and a neutral arbiter or an adjutant. It needs the use of logic. The game simulates armies at war trying to outflank and outmaneuver each other. As in actual warfare, the game allows only one side's plan to succeed. Certain strategies and tactics, however, allow both sides the chance of securing a better idea of the other's plan as the game progresses. Players can also speak with others during matches, hoping to make a false impression on where the flag is. ([>>> more at Wikipedia](http://en.wikipedia.org/wiki/Game_of_the_Generals "The Game of the Generals"))

This is the ONLINE version of that game.

### Pieces in descending order by rank

| # |  CODE | Name                           |
|:-:| ----- | ------------------------------ |
| 1 | GA    | General of the Army (5 stars)  |
| 1 | GEN   | General (4 stars)              |
| 1 | LTG   | Lieutenant General (3 stars)   |
| 1 | MG    | Major General (2 stars)        |
| 1 | BG    | Brigadier General (1 star)     |
| 1 | COL   | Colonel                        |
| 1 | LTC   | Lieutenant Colonel             |
| 1 | MAJ   | Major                          |
| 1 | CPT   | Captain                        |
| 1 | 1LT   | First Lieutenant               |
| 1 | 2LT   | Second Lieutenant              |
| 1 | SGT   | Seargent                       |
| 6 | PVT   | Private                        |
| 2 | SPY   | Spy                            |
| 1 | FLG   | Flag                           |

#### Rules for a challenge:
- An officer can beat any lower ranking officer except the `SPY`
- The `SPY` can beat any ranking officer except the `PVT`
- Any piece can beat the `FLG` (including another `FLG`)
- Both are eliminated for 2 pieces of the same rank except the flag

#### Gameplay:
- The game is played on a *9x8* plain-square board
- The player who plays first will be the creator of the game session
- The pieces can be placed in NO particular order as long as they are placed in the first 3 rows of the player's home rows
- Each player can move a piece 1 step only either forward, backward, left or right ONLY

#### Who Wins:
- The player who captured the opponent's flag
- The player whose flag reaches the opponent's first row (be warned that the opponent can still capture the flag since the opponent is given one move after the player placed the flag to the other end)
