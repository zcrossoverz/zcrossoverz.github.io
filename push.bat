@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0"

echo.
echo =====================================
echo   zcrossoverz  -  Push to Git
echo =====================================
echo.

where git >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Git is not installed or not on PATH.
  pause
  exit /b 1
)

git rev-parse --is-inside-work-tree >nul 2>nul
if errorlevel 1 (
  echo [ERROR] This folder is not a git repository.
  pause
  exit /b 1
)

for /f "tokens=*" %%b in ('git rev-parse --abbrev-ref HEAD') do set "BRANCH=%%b"
echo Branch: !BRANCH!
echo.

git status --short
echo.

REM Exit if nothing to commit
for /f "tokens=*" %%s in ('git status --porcelain') do (
  set "HAS_CHANGES=1"
)
if not defined HAS_CHANGES (
  echo Nothing to commit. Working tree is clean.
  pause
  exit /b 0
)

REM Build a default commit message with the current timestamp
for /f "tokens=1-4 delims=/-. " %%a in ("%date%") do set "TODAY=%%c-%%b-%%a"
for /f "tokens=1-2 delims=:." %%a in ("%time%") do set "NOW=%%a:%%b"

set "MSG=%~1"
if "%MSG%"=="" (
  set /p "MSG=Commit message [content update !TODAY! !NOW!]: "
)
if "%MSG%"=="" set "MSG=content update !TODAY! !NOW!"

echo.
echo [1/3] Staging changes...
git add -A
if errorlevel 1 goto :fail

echo [2/3] Committing: "!MSG!"
git commit -m "!MSG!"
if errorlevel 1 goto :fail

echo [3/3] Pushing to origin/!BRANCH!...
git push origin !BRANCH!
if errorlevel 1 goto :fail

echo.
echo Done. Netlify will pick up the deploy from the repo.
echo.
pause
endlocal
exit /b 0

:fail
echo.
echo [ERROR] Push failed. Fix the issue above and try again.
pause
endlocal
exit /b 1
