@echo off
set SRC=C:\Users\Nhan\Documents\Claude\Projects\document\html
set DST=E:\Workspace\github-page\zcrossoverz.github.io\prv

echo Copying files (including subfolders) from %SRC% to %DST% ...
robocopy "%SRC%" "%DST%" /E /IS /IT

echo Done.
pause