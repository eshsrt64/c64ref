# $FFA5: ACPTR - Get data from the serial bus

* Communication registers: A
* Preparatory routines: TALK, TKSA
* Error returns: See READST
* Stack requirements: 13
* Registers affected: A, X



  **Description**: This is the routine to use when you want to get informa-
tion from a device on the serial bus, like a disk. This routine gets a
byte of data off the serial bus using full handshaking. The data is
returned in the accumulator. To prepare for this routine the TALK routine
must be called first to command the device on the serial bus to send data
through the bus. If the input device needs a secondary command, it must
be sent by using the TKSA KERNAL routine before calling this routine.
Errors are returned in the status word. The READST routine is used to
read the status word.


## How to Use:

0. Command a device on the serial bus to prepare to send data to
   the Commodore 64. (Use the TALK and TKSA KERNAL routines.)
1. Call this routine (using JSR).
2. Store or otherwise use the data.


## EXAMPLE:

    ;GET A BYTE FROM THE BUS
    JSR ACPTR
    STA DATA


# $FFC6: CHKIN - Open a channel for input

* Communication registers: X
* Preparatory routines: (OPEN)
* Error returns:
* Stack requirements: None
* Registers affected: A, X


  **Description**: Any logical file that has already been opened by the
KERNAL OPEN routine can be defined as an input channel by this routine.
Naturally, the device on the channel must be an input device. Otherwise
an error will occur, and the routine will abort.

  If you are getting data from anywhere other than the keyboard, this
routine must be called before using either the CHRIN or the GETIN KERNAL
routines for data input. If you want to use the input from the keyboard,
and no other input channels are opened, then the calls to this routine,
and to the OPEN routine are not needed.

  When this routine is used with a device on the serial bus, it auto-
matically sends the talk address (and the secondary address if one was
specified by the OPEN routine) over the bus.

## How to Use:

0. OPEN the logical file (if necessary; see description above).
1. Load the X register with number of the logical file to be used.
2. Call this routine (using a JSR command).


Possible errors are:

* #3: File not open
* #5: Device not present
* #6: File not an input file

## EXAMPLE:

    ;PREPARE FOR INPUT FROM LOGICAL FILE 2
    LDX #2
    JSR CHKIN


# $FFC9: CHKOUT - Open a channel for output

* Communication registers: X
* Preparatory routines: (OPEN)
* Error returns: 0,3,5,7 (See READST)
* Stack requirements: 4+
* Registers affected: A, X

  **Description**: Any logical file number that has been created by the
KERNAL routine OPEN can be defined as an output channel. Of course, the
device you intend opening a channel to must be an output device.
Otherwise an error will occur, and the routine will be aborted.

  This routine must be called before any data is sent to any output
device unless you want to use the Commodore 64 screen as your output
device. If screen output is desired, and there are no other output chan-
nels already defined, then calls to this routine, and to the OPEN routine
are not needed.

  When used to open a channel to a device on the serial bus, this routine
will automatically send the LISTEN address specified by the OPEN routine
(and a secondary address if there was one).

## How to Use:
+-----------------------------------------------------------------------+
| REMEMBER: this routine is NOT NEEDED to send data to the screen.      |
+-----------------------------------------------------------------------+

0. Use the KERNAL OPEN routine to specify a logical file number, a
   LISTEN address, and a secondary address (if needed).
1. Load the X register with the logical file number used in the open
   statement.
2. Call this routine (by using the JSR instruction).

## EXAMPLE:

    LDX #3        ;DEFINE LOGICAL FILE 3 AS AN OUTPUT CHANNEL
    JSR CHKOUT

Possible errors are:

* #3: File not open
* #5: Device not present
* #7: Not an output file


# $FFCF: CHRIN - Get a character from the input channel

* Communication registers: A
* Preparatory routines: (OPEN, CHKIN)
* Error returns: 0 (See READST)
* Stack requirements: 7+
* Registers affected: A, X

  **Description**: This routine gets a byte of data from a channel already
set up as the input channel by the KERNAL routine CHKIN. If the CHKIN has
NOT been used to define another input channel, then all your data is
expected from the keyboard. The data byte is returned in the accumulator.
The channel remains open after the call.

  Input from the keyboard is handled in a special way. First, the cursor
is turned on, and blinks until a carriage return is typed on the
keyboard. All characters on the line (up to 88 characters) are stored in
the BASIC input buffer. These characters can be retrieved one at a time
by calling this routine once for each character. When the carriage return
is retrieved, the entire line has been processed. The next time this
routine is called, the whole process begins again, i.e., by flashing the
cursor.

## How to Use:

### FROM THE KEYBOARD

1. Retrieve a byte of data by calling this routine.
2. Store the data byte.
3. Check if it is the last data byte (is it a CR?)
4. If not, go to step 1.

## EXAMPLE:

       LDY $#00      ;PREPARE THE Y REGISTER TO STORE THE DATA
   RD  JSR CHRIN
       STA DATA,Y    ;STORE THE YTH DATA BYTE IN THE YTH
                     ;LOCATION IN THE DATA AREA.
       INY
       CMP #CR       ;IS IT A CARRIAGE RETURN?
       BNE RD        ;NO, GET ANOTHER DATA BYTE

## EXAMPLE:

    JSR CHRIN
    STA DATA

### FROM OTHER DEVICES

0. Use the KERNAL OPEN and CHKIN routines.
1. Call this routine (using a JSR instruction).
2. Store the data.

## EXAMPLE:

    JSR CHRIN
    STA DATA


# $FFD2: CHROUT - Output a character

* Communication registers: A
* Preparatory routines: (CHKOUT,OPEN)
* Error returns: 0 (See READST)
* Stack requirements: 8+
* Registers affected: A

  **Description**: This routine outputs a character to an already opened
channel. Use the KERNAL OPEN and CHKOUT routines to set up the output
channel before calling this routine, If this call is omitted, data is
sent to the default output device (number 3, the screen). The data byte
to be output is loaded into the accumulator, and this routine is called.
The data is then sent to the specified output device. The channel is left
open after the call.

+-----------------------------------------------------------------------+
| NOTE: Care must be taken when using this routine to send data to a    |
| specific serial device since data will be sent to all open output     |
| channels on the bus. Unless this is desired, all open output channels |
| on the serial bus other than the intended destination channel must be |
| closed by a call to the KERNAL CLRCHN routine.                        |
+-----------------------------------------------------------------------+

## How to Use:

0. Use the CHKOUT KERNAL routine if needed, (see description above).
1. Load the data to be output into the accumulator.
2. Call this routine.

## EXAMPLE:

    ;DUPLICATE THE BASIC INSTRUCTION CMD 4,"A";
    LDX #4          ;LOGICAL FILE #4
    JSR CHKOUT      ;OPEN CHANNEL OUT
    LDA #'A
    JSR CHROUT      ;SEND CHARACTER


# $FFA8: CIOUT - Transmit a byte over the serial bus

* Communication registers: A
* Preparatory routines: LISTEN, [SECOND]
* Error returns: See READST
* Stack requirements: 5
* Registers affected: None

  **Description**: This routine is used to send information to devices on the
serial bus. A call to this routine will put a data byte onto the serial
bus using full serial handshaking. Before this routine is called, the
LISTEN KERNAL routine must be used to command a device on the serial bus
to get ready to receive data. (If a device needs a secondary address, it
must also be sent by using the SECOND KERNAL routine.) The accumulator is
loaded with a byte to handshake as data on the serial bus. A device must
be listening or the status word will return a timeout. This routine
always buffers one character. (The routine holds the previous character
to be sent back.) So when a call to the KERNAL UNLSN routine is made to
end the data transmission, the buffered character is sent with an End Or
Identify (EOI) set. Then the UNLSN command is sent to the device.

## How to Use:

0. Use the LISTEN KERNAL routine (and the SECOND routine if needed).
1. Load the accumulator with a byte of data.
2. Call this routine to send the data byte.

## EXAMPLE:


    LDA #'X       ;SEND AN X TO THE SERIAL BUS
    JSR CIOUT


# $FF81: CINT - Initialize screen editor & 6567 video chip

* Communication registers: None
* Preparatory routines: None
* Error returns: None
* Stack requirements: 4
* Registers affected: A, X, Y

  **Description**: This routine sets up the 6567 video controller chip in the
Commodore 64 for normal operation. The KERNAL screen editor is also
initialized. This routine should be called by a Commodore 64 program
cartridge.

## How to Use:

1. Call this routine.

## EXAMPLE:

    JSR CINT
    JMP RUN       ;BEGIN EXECUTION


# $FFE7: CLALL - Close all files

* Communication registers: None
* Preparatory routines: None
* Error returns: None
* Stack requirements: 11
* Registers affected: A, X

  **Description**: This routine closes all open files. When this routine is
called, the pointers into the open file table are reset, closing all
files. Also, the CLRCHN routine is automatically called to reset the I/O
channels.

## How to Use:

1. Call this routine.

## EXAMPLE:

    JSR CLALL   ;CLOSE ALL FILES AND SELECT DEFAULT I/O CHANNELS
    JMP RUN     ;BEGIN EXECUTION


# $FFC3: CLOSE - Close a logical file

* Communication registers: A
* Preparatory routines: None
* Error returns: 0,240 (See READST)
* Stack requirements: 2+
* Registers affected: A, X, Y

  **Description**: This routine is used to close a logical file after all I/O
operations have been completed on that file. This routine is called after
the accumulator is loaded with the logical file number to be closed (the
same number used when the file was opened using the OPEN routine).

## How to Use:

1. Load the accumulator with the number of the logical file to be
   closed.
2. Call this routine.

## EXAMPLE:

    ;CLOSE 15
    LDA #15
    JSR CLOSE

# $FFCC: CLRCHN - Clear I/O channels

* Communication registers: None
* Preparatory routines: None
* Error returns:
* Stack requirements: 9
* Registers affected: A, X

  **Description**: This routine is called to clear all open channels and re-
store the I/O channels to their original default values. It is usually
called after opening other I/O channels (like a tape or disk drive) and
using them for input/output operations. The default input device is 0
(keyboard). The default output device is 3 (the Commodore 64 screen).

  If one of the channels to be closed is to the serial port, an UNTALK
signal is sent first to clear the input channel or an UNLISTEN is sent to
clear the output channel. By not calling this routine (and leaving lis-
tener(s) active on the serial bus) several devices can receive the same
data from the Commodore 64 at the same time. One way to take advantage
of this would be to command the printer to TALK and the disk to LISTEN.
This would allow direct printing of a disk file.

  This routine is automatically called when the KERNAL CLALL routine is
executed.

## How to Use:
1. Call this routine using the JSR instruction.

## EXAMPLE:
    JSR CLRCHN


# $FFE4: GETIN - Get a character

* Communication registers: A
* Preparatory routines: CHKIN, OPEN
* Error returns: See READST
* Stack requirements: 7+
* Registers affected: A (X, Y)

  **Description**: If the channel is the keyboard, this subroutine removes
one character from the keyboard queue and returns it as an ASCII value in
the accumulator. If the queue is empty, the value returned in the
accumulator will be zero. Characters are put into the queue automatically
by an interrupt driven keyboard scan routine which calls the SCNKEY
routine. The keyboard buffer can hold up to ten characters. After the
buffer is filled, additional characters are ignored until at least one
character has been removed from the queue. If the channel is RS-232, then
only the A register is used and a single character is returned. See
READST to check validity. If the channel is serial, cassette, or screen,
call BASIN routine.


## How to Use:

1. Call this routine using a JSR instruction.
2. Check for a zero in the accumulator (empty buffer).
3. Process the data.


## EXAMPLE:

         ;WAIT FOR A CHARACTER
    WAIT JSR GETIN
         CMP #0
         BEQ WAIT


# $FFF3: IOBASE - Define I/O memory page

* Communication registers: X, Y
* Preparatory routines: None
* Error returns:
* Stack requirements: 2
* Registers affected: X, Y


  **Description**: This routine sets the X and Y registers to the address of
the memory section where the memory mapped 110 devices are located. This
address can then be used with an offset to access the memory mapped I/O
devices in the Commodore 64. The offset is the number of locations from
the beginning of the page on which the I/O register you want is located.
The X register contains the low order address byte, while the Y register
contains the high order address byte.

  This routine exists to provide compatibility between the Commodore 64,
VIC-20, and future models of the Commodore 64. If the I/O locations for
a machine language program are set by a call to this routine, they should
still remain compatible with future versions of the Commodore 64, the
KERNAL and BASIC.


## How to Use:

1. Call this routine by using the JSR instruction.
2. Store the X and the Y registers in consecutive locations.
3. Load the Y register with the offset.
4. Access that I/O location.

## EXAMPLE:

    ;SET THE DATA DIRECTION REGISTER OF THE USER PORT TO 0 (INPUT)
    JSR IOBASE
    STX POINT       ;SET BASE REGISTERS
    STY POINT+1
    LDY #2
    LDA #0          ;OFFSET FOR DDR OF THE USER PORT
    STA (POINT),Y   ;SET DDR TO 0


# $FF84: IOINIT - Initialize I/O devices

* Communication registers: None
* Preparatory routines: None
* Error returns:
* Stack requirements: None
* Registers affected: A, X, Y

  **Description**: This routine initializes all input/output devices and
routines. It is normally called as part of the initialization procedure
of a Commodore 64 program cartridge.

## EXAMPLE:
    JSR IOINIT


# $FFB1: LISTEN - Command a device on the serial bus to listen

* Communication registers: A
* Preparatory routines: None
* Error returns: See READST
* Stack requirements: None
* Registers affected: A

  **Description**: This routine will command a device on the serial bus to
receive data. The accumulator must be loaded with a device number between
0 and 31 before calling the routine. LISTEN will OR the number bit by bit
to convert to a listen address, then transmits this data as a command on
the serial bus. The specified device will then go into listen mode, and
be ready to accept information.

## How to Use:

1. Load the accumulator with the number of the device to command
   to LISTEN.
2. Call this routine using the JSR instruction.

## EXAMPLE:
    ;COMMAND DEVICE #8 TO LISTEN
    LDA #8
    JSR LISTEN


# $FFD5: LOAD - Load RAM from device

* Communication registers: A, X, Y
* Preparatory routines: SETLFS, SETNAM
* Error returns: 0,4,5,8,9, READST
* Stack requirements: None
* Registers affected: A, X, Y

  **Description**: This routine LOADs data bytes from any input device di-
rectly into the memory of the Commodore 64. It can also be used for a
verify operation, comparing data from a device with the data already in
memory, while leaving the data stored in RAM unchanged.

  The accumulator (.A) must be set to 0 for a LOAD operation, or 1 for a
verify, If the input device is OPENed with a secondary address (SA) of 0
the header information from the device is ignored. In this case, the X
and Y registers must contain the starting address for the load. If the
device is addressed with a secondary address of 1, then the data is
loaded into memory starting at the location specified by the header. This
routine returns the address of the highest RAM location loaded.

  Before this routine can be called, the KERNAL SETLFS, and SETNAM
routines must be called.


+-----------------------------------------------------------------------+
| NOTE: You can NOT LOAD from the keyboard (0), RS-232 (2), or the      |
| screen (3).                                                           |
+-----------------------------------------------------------------------+


## How to Use:

0. Call the SETLFS, and SETNAM routines. If a relocated load is de-
   sired, use the SETLFS routine to send a secondary address of 0.
1. Set the A register to 0 for load, 1 for verify.
2. If a relocated load is desired, the X and Y registers must be set
   to the start address for the load.
3. Call the routine using the JSR instruction.

## EXAMPLE:

            ;LOAD   A FILE FROM TAPE
     
            LDA #DEVICE1        ;SET DEVICE NUMBER
            LDX #FILENO         ;SET LOGICAL FILE NUMBER
            LDY CMD1            ;SET SECONDARY ADDRESS
            JSR SETLFS
            LDA #NAME1-NAME     ;LOAD A WITH NUMBER OF
                                ;CHARACTERS IN FILE NAME
            LDX #<NAME          ;LOAD X AND Y WITH ADDRESS OF
            LDY #>NAME          ;FILE NAME
            JSR SETNAM
            LDA #0              ;SET FLAG FOR A LOAD
            LDX #$FF            ;ALTERNATE START
            LDY #$FF
            JSR LOAD
            STX VARTAB          ;END OF LOAD
            STY VARTA B+1
            JMP START
    NAME    .BYT 'FILE NAME'
    NAME1                       ;


# $FF9C: MEMBOT - Set bottom of memory

* Communication registers: X, Y
* Preparatory routines: None
* Error returns: None
* Stack requirements: None
* Registers affected: X, Y

  **Description**: This routine is used to set the bottom of the memory. If
the accumulator carry bit is set when this routine is called, a pointer
to the lowest byte of RAM is returned in the X and Y registers. On the
unexpanded Commodore 64 the initial value of this pointer is $0800
(2048 in decimal). If the accumulator carry bit is clear (-O) when this
routine is called, the values of the X and Y registers are transferred to
the low and high bytes, respectively, of the pointer to the beginning of
RAM.

## How to Use:

TO READ THE BOTTOM OF RAM

1. Set the carry.
2. Call this routine.

TO SET THE BOTTOM OF MEMORY

1. Clear the carry.
2. Call this routine.

## EXAMPLE:

    ;MOVE BOTTOM OF MEMORY UP 1 PAGE
    SEC         ;READ MEMORY BOTTOM
    JSR MEMBOT
    INY
    CLC         ;SET MEMORY BOTTOM TO NEW VALUE
    JSR MEMBOT

# $FF99: MEMTOP - Set the top of RAM

* Communication registers: X, Y
* Preparatory routines: None
* Error returns: None
* Stack requirements: 2
* Registers affected: X, Y

  **Description**: This routine is used to set the top of RAM. When this
routine is called with the carry bit of the accumulator set, the pointer
to the top of RAM will be loaded into the X and Y registers. When this
routine is called with the accumulator carry bit clear, the contents of
the X and Y registers are loaded in the top of memory pointer, changing
the top of memory.

## EXAMPLE:
    ;DEALLOCATE THE RS-232 BUFFER
    SEC
    JSR MEMTOP   ;READ TOP OF MEMORY
    DEX
    CLC
    JSR MEMTOP   ;SET NEW TOP OF MEMORY


# $FFC0: OPEN - Open a logical file

* Communication registers: None
* Preparatory routines: SETLFS, SETNAM
* Error returns: 1,2,4,5,6,240, READST
* Stack requirements: None
* Registers affected: A, X, Y

  **Description**: This routine is used to OPEN a logical file. Once the
logical file is set up, it can be used for input/output operations. Most
of the I/O KERNAL routines call on this routine to create the logical
files to operate on. No arguments need to be set up to use this routine,
but both the SETLFS and SETNAM KERNAL routines must be called before
using this routine.


## How to Use:

0. Use the SETLFS routine.
1. Use the SETNAM routine.
2. Call this routine.

## EXAMPLE:

This is an implementation of the BASIC statement: OPEN 15,8,15,"I/O"

          LDA #NAME2-NAME    ;LENGTH OF FILE NAME FOR SETLFS
          LDY #>NAME         ;ADDRESS OF FILE NAME
          LDX #<NAME
          JSR SETNAM
          LDA #15
          LDX #8
          LDY #15
          JSR SETLFS
          JSR OPEN
    NAME  .BYT 'I/O'
    NAME2


# $FFF0: PLOT - Set cursor location

* Communication registers: A, X, Y
* Preparatory routines: None
* Error returns: None
* Stack requirements: 2
* Registers affected: A, X, Y

  **Description**: A call to this routine with the accumulator carry flag
set loads the current position of the cursor on the screen (in X,Y
coordinates) into the Y and X registers. Y is the column number of the
cursor location (6-39), and X is the row number of the location of the
cursor (0-24). A call with the carry bit clear moves the cursor to X,Y
as determined by the Y and X registers.

## How to Use:


READING CURSOR LOCATION

1. Set the carry flag.
2. Call this routine.
3. Get the X and Y position from the Y and X registers, respectively.


SETTING CURSOR LOCATION

1. Clear carry flag.
2. Set the Y and X registers to the desired cursor location.
3. Call this routine.


## EXAMPLE:

    ;MOVE THE CURSOR TO ROW 10, COLUMN 5 (5,10)
    LDX #10
    LDY #5
    CLC
    JSR PLOT


# $FF87: RAMTAS - Perform RAM test

  Communication registers: A, X, Y
  Preparatory routines: None
  Error returns: None
  Stack requirements: 2
  Registers affected: A, X, Y

  **Description**: This routine is used to test RAM and set the top and
bottom of memory pointers accordingly. It also clears locations $0000 to
$0101 and $0200 to $03FF. It also allocates the cassette buffer, and sets
the screen base to $0400. Normally, this routine is called as part of the
initialization process of a Commodore 64 program cartridge.

## EXAMPLE:
  JSR RAMTAS

# $FFDE: RDTIM - Read system clock

  Communication registers: A, X, Y
  Preparatory routines: None
  Error returns: None
  Stack requirements: 2
  Registers affected: A, X, Y

  **Description**: This routine is used to read the system clock. The clock's
resolution is a 60th of a second. Three bytes are returned by the
routine. The accumulator contains the most significant byte, the X index
register contains the next most significant byte, and the Y index
register contains the least significant byte.

## EXAMPLE:

  JSR RDTIM
  STY TIME
  STX TIME+1
  STA TIME+2
  ...
  TIME *=*+3


# $FFB7: READST - Read status word

  Communication registers: A
  Preparatory routines: None
  Error returns: None
  Stack requirements: 2
  Registers affected: A

  **Description**: This routine returns the current status of the I/O devices
in the accumulator. The routine is usually called after new communication
to an I/O device. The routine gives you information about device status,
or errors that have occurred during the I/O operation.
  The bits returned in the accumulator contain the following information:
(see table below)

+---------+------------+---------------+------------+-------------------+
|  ST Bit | ST Numeric |    Cassette   |   Serial   |    Tape Verify    |
| Position|    Value   |      Read     |  Bus R/W   |      + Load       |
+---------+------------+---------------+------------+-------------------+
|    0    |      1     |               |  time out  |                   |
|         |            |               |  write     |                   |
+---------+------------+---------------+------------+-------------------+
|    1    |      2     |               |  time out  |                   |
|         |            |               |    read    |                   |
+---------+------------+---------------+------------+-------------------+
|    2    |      4     |  short block  |            |    short block    |
+---------+------------+---------------+------------+-------------------+
|    3    |      8     |   long block  |            |    long block     |
+---------+------------+---------------+------------+-------------------+
|    4    |     16     | unrecoverable |            |   any mismatch    |
|         |            |   read error  |            |                   |
+---------+------------+---------------+------------+-------------------+
|    5    |     32     |    checksum   |            |     checksum      |
|         |            |     error     |            |       error       |
+---------+------------+---------------+------------+-------------------+
|    6    |     64     |  end of file  |  EOI line  |                   |
+---------+------------+---------------+------------+-------------------+
|    7    |   -128     |  end of tape  | device not |    end of tape    |
|         |            |               |   present  |                   |
+---------+------------+---------------+------------+-------------------+

## How to Use:

1. Call this routine.
2. Decode the information in the A register as it refers to your pro-
   gram.

## EXAMPLE:

  ;CHECK FOR END OF FILE DURING READ
  JSR READST
  AND #64                       ;CHECK EOF BIT (EOF=END OF FILE)
  BNE EOF                       ;BRANCH ON EOF

# $FF8A: RESTOR - Restore default system and interrupt vectors

  Preparatory routines: None
  Error returns: None
  Stack requirements: 2
  Registers affected: A, X, Y

  **Description**: This routine restores the default values of all system
vectors used in KERNAL and BASIC routines and interrupts. (See the Memory
Map for the default vector contents). The KERNAL VECTOR routine is used
to read and alter individual system vectors.

## How to Use:

1. Call this routine.

## EXAMPLE:
  JSR RESTOR

# $FFD8: SAVE - Save memory to a device

  Communication registers: A, X, Y
  Preparatory routines: SETLFS, SETNAM
  Error returns: 5,8,9, READST
  Stack requirements: None
  Registers affected: A, X, Y


  **Description**: This routine saves a section of memory. Memory is saved
from an indirect address on page 0 specified by the accumulator to the
address stored in the X and Y registers. It is then sent to a logical
file on an input/output device. The SETLFS and SETNAM routines must be
used before calling this routine. However, a file name is not required to
SAVE to device 1 (the Datassette(TM) recorder). Any attempt to save to
other devices without using a file name results in an error.

+-----------------------------------------------------------------------+
| NOTE: Device 0 (the keyboard), device 2 (RS-232), and device 3 (the   |
| screen) cannot be SAVEd to. If the attempt is made, an error occurs,  |
| and the SAVE is stopped.                                              |
+-----------------------------------------------------------------------+

## How to Use:

0. Use the SETLFS routine and the SETNAM routine (unless a SAVE with no
   file name is desired on "a save to the tape recorder"),
1. Load two consecutive locations on page 0 with a pointer to the start
   of your save (in standard 6502 low byte first, high byte next
   format).
2. Load the accumulator with the single byte page zero offset to the
   pointer.
3. Load the X and Y registers with the low byte and high byte re-
   spectively of the location of the end of the save.
4. Call this routine.

## EXAMPLE:

  LDA #1              ;DEVICE = 1:CASSETTE
  JSR SETLFS
  LDA #0              ;NO FILE NAME
  JSR SETNAM
  LDA PROG            ;LOAD START ADDRESS OF SAVE
  STA TXTTAB          ;(LOW BYTE)
  LDA PROG+1
  STA TXTTA B+1       ;(HIGH BYTE)
  LDX VARTAB          ;LOAD X WITH LOW BYTE OF END OF SAVE
  LDY VARTAB+1        ;LOAD Y WITH HIGH BYTE
  LDA #<TXTTAB        ;LOAD ACCUMULATOR WITH PAGE 0 OFFSET
  JSR SAVE


# $FF9F: SCNKEY - Scan the keyboard

  Communication registers: None
  Preparatory routines: IOINIT
  Error returns: None
  Stack requirements: 5
  Registers affected: A, X, Y

  **Description**: This routine scans the Commodore 64 keyboard and checks
for pressed keys. It is the same routine called by the interrupt handler.
If a key is down, its ASCII value is placed in the keyboard queue. This
routine is called only if the normal IRQ interrupt is bypassed.

## How to Use:

1. Call this routine.

## EXAMPLE:

  GET  JSR SCNKEY      ;SCAN KEYBOARD
       JSR GETIN       ;GET CHARACTER
       CMP #0          ;IS IT NULL?
       BEQ GET         ;YES... SCAN AGAIN
       JSR CHROUT      ;PRINT IT


# $FFED: SCREEN - Return screen format

  Communication registers: X, Y
  Preparatory routines: None
  Stack requirements: 2
  Registers affected: X, Y

  **Description**: This routine returns the format of the screen, e.g., 40
columns in X and 25 lines in Y. The routine can be used to determine what
machine a program is running on. This function has been implemented on
the Commodore 64 to help upward compatibility of your programs.

## How to Use:

1. Call this routine.

## EXAMPLE:

  JSR SCREEN
  STX MAXCOL
  STY MAXROW


# $FF93: SECOND - Send secondary address for LISTEN

  Communication registers: A
  Preparatory routines: LISTEN
  Error returns: See READST
  Stack requirements: 8
  Registers affected: A

  **Description**: This routine is used to send a secondary address to an
I/O device after a call to the LISTEN routine is made, and the device is
commanded to LISTEN. The routine canNOT be used to send a secondary
address after a call to the TALK routine.
  A secondary address is usually used to give setup information to a
device before I/O operations begin.
  When a secondary address is to be sent to a device on the serial bus,
the address must first be ORed with $60.

## How to Use:

1. load the accumulator with the secondary address to be sent.
2. Call this routine.

## EXAMPLE:

  ;ADDRESS DEVICE #8 WITH COMMAND (SECONDARY ADDRESS) #15
  LDA #8
  JSR LISTEN
  LDA #15
  JSR SECOND


# $FFBA: SETLFS - Set up a logical file

  Communication registers: A, X, Y
  Preparatory routines: None
  Error returns: None
  Stack requirements: 2
  Registers affected: None


  **Description**: This routine sets the logical file number, device address,
and secondary address (command number) for other KERNAL routines.
  The logical file number is used by the system as a key to the file
table created by the OPEN file routine. Device addresses can range from 0
to 31. The following codes are used by the Commodore 64 to stand for the
CBM devices listed below:


                ADDRESS          DEVICE

                   0            Keyboard
                   1            Datassette(TM)
                   2            RS-232C device
                   3            CRT display
                   4            Serial bus printer
                   8            CBM serial bus disk drive


  Device numbers 4 or greater automatically refer to devices on the
serial bus.
  A command to the device is sent as a secondary address on the serial
bus after the device number is sent during the serial attention
handshaking sequence. If no secondary address is to be sent, the Y index
register should be set to 255.

## How to Use:

1. Load the accumulator with the logical file number.
2. Load the X index register with the device number.
3. Load the Y index register with the command.

## EXAMPLE:

  FOR LOGICAL FILE 32, DEVICE #4, AND NO COMMAND:
  LDA #32
  LDX #4
  LDY #255
  JSR SETLFS


# $FF90: SETMSG - Control system message output

  Communication registers: A
  Preparatory routines: None
  Error returns: None
  Stack requirements: 2
  Registers affected: A

  **Description**: This routine controls the printing of error and control
messages by the KERNAL. Either print error messages or print control mes-
sages can be selected by setting the accumulator when the routine is
called. FILE NOT FOUND is an example of an error message. PRESS PLAY ON
CASSETTE is an example of a control message.
  Bits 6 and 7 of this value determine where the message will come from.
If bit 7 is 1, one of the error messages from the KERNAL is printed. If
bit 6 is set, control messages are printed.

## How to Use:

1. Set accumulator to desired value.
2. Call this routine.

## EXAMPLE:

  LDA #$40
  JSR SETMSG          ;TURN ON CONTROL MESSAGES
  LDA #$80
  JSR SETMSG          ;TURN ON ERROR MESSAGES
  LDA #0
  JSR SETMSG          ;TURN OFF ALL KERNAL MESSAGES


# $FFBD: SETNAM - Set file name

  Communication registers: A, X, Y
  Preparatory routines:
  Stack requirements: 2
  Registers affected:

  **Description**: This routine is used to set up the file name for the OPEN,
SAVE, or LOAD routines. The accumulator must be loaded with the length of
the file name. The X and Y registers must be loaded with the address of
the file name, in standard 6502 low-byte/high-byte format. The address
can be any valid memory address in the system where a string of
characters for the file name is stored. If no file name is desired, the
accumulator must be set to 0, representing a zero file length. The X and
Y registers can be set to any memory address in that case.

## How to Use:

1. Load the accumulator with the length of the file name.
2. Load the X index register with the low order address of the file
   name.
3. Load the Y index register with the high order address.
4. Call this routine.

## EXAMPLE:

  LDA #NAME2-NAME     ;LOAD LENGTH OF FILE NAME
  LDX #<NAME          ;LOAD ADDRESS OF FILE NAME
  LDY #>NAME
  JSR SETNAM

# $FFDB: SETTIM - Set the system clock

  Communication registers: A, X, Y
  Preparatory routines: None
  Error returns: None
  Stack requirements: 2
  Registers affected: None

  **Description**: A system clock is maintained by an interrupt routine that
updates the clock every 1/60th of a second (one "jiffy"). The clock is
three bytes long, which gives it the capability to count up to 5,184,000
jiffies (24 hours). At that point the clock resets to zero. Before
calling this routine to set the clock, the accumulator must contain the
most significant byte, the X index register the next most significant
byte, and the Y index register the least significant byte of the initial
time setting (in jiffies).

## How to Use:
1. Load the accumulator with the MSB of the 3-byte number to set the
   clock.
2. Load the X register with the next byte.
3. Load the Y register with the LSB.
4. Call this routine.

## EXAMPLE:
 ;SET THE CLOCK TO 10 MINUTES = 3600 JIFFIES
 LDA #0               ;MOST SIGNIFICANT
 LDX #>3600
 LDY #<3600           ;LEAST SIGNIFICANT
 JSR SETTIM

# $FFA2: SETTMO - Set IEEE bus card timeout flag

  Communication registers: A
  Preparatory routines: None
  Error returns: None
  Stack requirements: 2
  Registers affected: None
+-----------------------------------------------------------------------+
| NOTE: This routine is used ONLY with an IEEE add-on card!             |
+-----------------------------------------------------------------------+
  **Description**: This routine sets the timeout flag for the IEEE bus. When
the timeout flag is set, the Commodore 64 will wait for a device on the
IEEE port for 64 milliseconds. If the device does not respond to the
Commodore 64's Data Address Valid (DAV) signal within that time the
Commodore 64 will recognize an error condition and leave the handshake
sequence. When this routine is called when the accumulator contains a 0
in bit 7, timeouts are enabled. A 1 in bit 7 will disable the timeouts.

+-----------------------------------------------------------------------+
| NOTE: The Commodore 64 uses the timeout feature to communicate that a |
| disk file is not found on an attempt to OPEN a file only with an IEEE |
| card.                                                                 |
+-----------------------------------------------------------------------+

## How to Use:

TO SET THE TIMEOUT FLAG
1. Set bit 7 of the accumulator to 0.
2. Call this routine.

TO RESET THE TIMEOUT FLAG
1. Set bit 7 of the accumulator to 1.
2. Call this routine.

## EXAMPLE:

  ;DISABLE TIMEOUT
  LDA #0
  JSR SETTMO

# $FFE1: STOP - Check if <STOP> key is pressed

  Communication registers: A
  Preparatory routines: None
  Error returns: None
  Stack requirements: None
  Registers affected: A, X

  **Description**: If the <STOP> key on the keyboard was pressed during a
UDTIM call, this call returns the Z flag set. In addition, the channels
will be reset to default values. All other flags remain unchanged. If the
<STOP> key is not pressed then the accumulator will contain a byte
representing the lost row of the keyboard scan. The user can also check
for certain other keys this way.

## How to Use:
0. UDTIM should be called before this routine.
1. Call this routine.
2. Test for the zero flag.

## EXAMPLE:

  JSR UDTIM   ;SCAN FOR STOP
  JSR STOP
  BNE *+5     ;KEY NOT DOWN
  JMP READY   ;=... STOP

# $FFB4: TALK - Command a device on the serial bus to TALK

  Communication registers: A
  Preparatory routines: None
  Error returns: See READST
  Stack requirements: 8
  Registers affected: A

  **Description**: To use this routine the accumulator must first be loaded
with a device number between 0 and 31. When called, this routine then
ORs bit by bit to convert this device number to a talk address. Then this
data is transmitted as a command on the serial bus.

## How to Use:

1. Load the accumulator with the device number.
2. Call this routine.

## EXAMPLE:

  ;COMMAND DEVICE #4 TO TALK
  LDA #4
  JSR TALK

# $FF96: TKSA - Send a secondary address to a device commanded to TALK

  Communication registers: A
  Preparatory routines: TALK
  Error returns: See READST
  Stack requirements: 8
  Registers affected: A

  **Description**: This routine transmits a secondary address on the serial
bus for a TALK device. This routine must be called with a number between
0 and 31 in the accumulator. The routine sends this number as a secondary
address command over the serial bus. This routine can only be called
after a call to the TALK routine. It will not work after a LISTEN.

## How to Use:

0. Use the TALK routine.
1. Load the accumulator with the secondary address.
2. Call this routine.

## EXAMPLE:

  ;TELL DEVICE #4 TO TALK WITH COMMAND #7
  LDA #4
  JSR TALK
  LDA #7
  JSR TALKSA


# $FFEA: UDTIM - Update the system clock

  Communication registers: None
  Preparatory routines: None
  Error returns: None
  Stack requirements: 2
  Registers affected: A, X

  **Description**: This routine updates the system clock. Normally this
routine is called by the normal KERNAL interrupt routine every 1/60th of
a second. If the user program processes its own interrupts this routine
must be called to update the time. In addition, the <STOP> key routine
must be called, if the <STOP> key is to remain functional.

## How to Use:

1. Call this routine.

## EXAMPLE:


# $FFAE: UNLSN - Send an UNLISTEN command

  Communication registers: None
  Preparatory routines: None
  Error returns: See READST
  Stack requirements: 8
  Registers affected: A

  **Description**: This routine commands all devices on the serial bus to
stop receiving data from the Commodore 64 (i.e., UNLISTEN). Calling this
routine results in an UNLISTEN command being transmitted on the serial
bus. Only devices previously commanded to listen are affected. This
routine is normally used after the Commodore 64 is finished sending data
to external devices. Sending the UNLISTEN commands the listening devices
to get off the serial bus so it can be used for other purposes.

## How to Use:

1. Call this routine.

## EXAMPLE:
  JSR UNLSN


# $FFAB: UNTLK - Send an UNTALK command

  Communication registers: None
  Preparatory routines: None
  Error returns: See READST
  Stack requirements: 8
  Registers affected: A

  **Description**: This routine transmits an UNTALK command on the serial
bus. All devices previously set to TALK will stop sending data when this
command is received.

## How to Use:

1. Call this routine.

## EXAMPLE:
  JSR UNTALK


# $FF8D: VECTOR - Manage RAM vectors

  Communication registers: X, Y
  Preparatory routines: None
  Error returns: None
  Stack requirements: 2
  Registers affected: A, X, Y


  **Description**: This routine manages all system vector jump addresses
stored in RAM. Calling this routine with the the accumulator carry bit
set stores the current contents of the RAM vectors in a list pointed to
by the X and Y registers. When this routine is called with the carry
clear, the user list pointed to by the X and Y registers is transferred
to the system RAM vectors. The RAM vectors are listed in the memory map.

+-----------------------------------------------------------------------+
| NOTE: This routine requires caution in its use. The best way to use it|
| is to first read the entire vector contents into the user area, alter |
| the desired vectors, and then copy the contents back to the system    |
| vectors.                                                              |
+-----------------------------------------------------------------------+

## How to Use:

READ THE SYSTEM RAM VECTORS

1. Set the carry.
2. Set the X and y registers to the address to put the vectors.
3. Call this routine.

LOAD THE SYSTEM RAM VECTORS

1. Clear the carry bit.
2. Set the X and Y registers to the address of the vector list in RAM
   that must be loaded.
3. Call this routine.

## EXAMPLE:
  ;CHANGE THE INPUT ROUTINES TO NEW SYSTEM
  LDX #<USER
  LDY #>USER
  SEC
  JSR VECTOR      ;READ OLD VECTORS
  LDA #<MYINP     ;CHANGE INPUT
  STA USER+10
  LDA #>MYINP
  STA USER+11
  LDX #<USER
  LDY #>USER
  CLC
  JSR VECTOR      ;ALTER SYSTEM
  ...
  USER *=*+26
