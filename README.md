<b><h2>A Nintendo Entertainment System (NES) emulator implemented in JavaScript.</h2></b>

<br><br>

 💻 <b>CPU</b>
  - All official instructions are implemented :heavy_check_mark:
  - nestest passes :heavy_check_mark:

<br>
<b>Fully functional 🖥️ PPU</b>
<br><br><br>

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
      - Mapper 66: GxROM

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





