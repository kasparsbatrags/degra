@echo off
echo Building Docker images for all modules...

REM Būvēt company moduli
echo Building company module image...
docker build -t degra/company:latest -f company/Dockerfile .
if errorlevel 1 goto error

REM Būvēt address moduli
echo Building address module image...
docker build -t degra/address:latest -f address/Dockerfile .
if errorlevel 1 goto error

REM Būvēt freighttracking moduli
echo Building freighttracking module image...
docker build -t degra/freighttracking:latest -f freighttracking/Dockerfile .
if errorlevel 1 goto error

REM Būvēt usermanager moduli
echo Building usermanager module image...
docker build -t degra/usermanager:latest -f usermanager/Dockerfile .
if errorlevel 1 goto error

echo All images built successfully!
goto end

:error
echo Error building images!
exit /b 1

:end
