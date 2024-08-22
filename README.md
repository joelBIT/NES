<b><h2>A Nintendo Entertainment System (NES) emulator implemented in JavaScript.</h2></b>

<br>

One way to play on this emulator is to start a local <b>http-server</b> using the script <b>server.js</b> that I have included in the root folder. Install [http-server](https://www.npmjs.com/package/http-server) and run
```console
foo@bar:~$ node server.js
```
from the root folder of the project. Then go to <b>localhost:8080</b> in a browser and load a game.


<br><br>

 💻 <b>CPU</b>
  - All official instructions are implemented :heavy_check_mark:
  - nestest passes :heavy_check_mark:

<br><br>

<b>🖥️ PPU</b>
- Implemented as NTSC
  
<br><br>

:musical_note:  <b>APU</b>
  - All five channels (Square1, Square2, Triangle, Noise, DMC) are implemented :heavy_check_mark:
  - The APU needs some polishing but sounds decent most of the time

<br><br>

🔌 <b>Cartridge</b>
  - Most of the available NES games can be played on this emulator
  - Implemented mappers are:
      - Mapper 0: NROM
      - Mapper 1: MMC1
      - Mapper 2: UxROM
      - Mapper 3: CNROM
      - Mapper 4: MMC3
      - Mapper 7: AxROM
      - Mapper 9: MMC2
      - Mapper 66: GxROM
      - Mapper 69: JxROM

<br><br>
        
<img src="https://github.com/user-attachments/assets/82f96db7-af2d-4fba-bc87-893533722c13" width=400>  <img src="https://github.com/user-attachments/assets/8cb027e8-4102-4db9-8131-d6e0b5d2c83a" width="400">

<img src="https://github.com/user-attachments/assets/1f16bd87-d2d5-4cb2-957f-c77acb9d5259" width="400"> <img src="https://github.com/user-attachments/assets/d87e43d9-491b-44f4-80b0-32498b478eb4" width="400">

<img src="https://github.com/user-attachments/assets/893cb468-23e2-4c64-8bcf-bf5c0cbc6ad7" width="400"> <img src="https://github.com/user-attachments/assets/777a6304-feac-4baa-8677-abb5feaa310f" width="400">




<br><br>
:video_game: <b>Controls</b>
- Support for controller 1 and 2 :heavy_check_mark:
- It is possible to configure controller 1 and 2 (configuration is stored in local storage)

<table>
<tr><th>Controller 1 </th><th>Controller 2</th></tr>
<tr><td>

|Input | Keyboard Key(s)|
|--|--|
|Up | Arrow Up |
|Down | Arrow Down |
|Left | Arrow Left |
|Right | Arrow Right |
| A     |	Z               |
 | B	    | X               |
 | Select|	A               |
 | Start	| S            |

</td><td>

|Input|Keyboard Key(s)| 
|--|--|
|Up|U|
 | Down    	| J          |
| Left    	| H          |
| Right    	| K          |
 | A     |	G               |
 | B	    | F               |
 | Select|	R               |
 | Start	| T            |

</td></tr> </table>





