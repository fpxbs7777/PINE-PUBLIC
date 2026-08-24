@echo off
:: ============================================================================
:: SCRIPT DE LIMPIEZA TOTAL PARA OPEN CODE Y ROTACION DE IP
:: Ejecutar preferentemente como Administrador (Clic derecho -> Ejecutar como administrador)
:: ============================================================================

echo ============================================================================
echo [1/4] CERRANDO PROCESOS RELACIONADOS CON OPEN CODE
echo ============================================================================
taskkill /F /IM "opencode.exe" /T 2>nul
taskkill /F /IM "Code.exe" /T 2>nul
echo Procesos verificados y cerrados.
echo.

echo ============================================================================
echo [2/4] BORRANDO CACHE, SESIONES Y CONFIGURACIONES DE OPEN CODE
echo ============================================================================
echo Eliminando carpetas de configuracion local y almacenamiento temporal...

if exist "%USERPROFILE%\.opencode" rmdir /S /Q "%USERPROFILE%\.opencode" 2>nul
if exist "%USERPROFILE%\.config\opencode" rmdir /S /Q "%USERPROFILE%\.config\opencode" 2>nul
if exist "%USERPROFILE%\.cache\opencode" rmdir /S /Q "%USERPROFILE%\.cache\opencode" 2>nul
if exist "%USERPROFILE%\.local\share\opencode" rmdir /S /Q "%USERPROFILE%\.local\share\opencode" 2>nul

if exist "%APPDATA%\opencode" rmdir /S /Q "%APPDATA%\opencode" 2>nul
if exist "%LOCALAPPDATA%\opencode" rmdir /S /Q "%LOCALAPPDATA%\opencode" 2>nul

echo Eliminando cache de extensiones e historial de espacio de trabajo de VS Code...
powershell -Command "Remove-Item -Recurse -Force '$env:APPDATA\Code\User\globalStorage\*opencode*' -ErrorAction SilentlyContinue" 2>nul
powershell -Command "Remove-Item -Recurse -Force '$env:USERPROFILE\.vscode\extensions\*opencode*' -ErrorAction SilentlyContinue" 2>nul

echo Rastro de archivos de Open Code limpiado con exito.
echo.

echo ============================================================================
echo [3/4] ELIMINANDO VARIABLES DE ENTORNO Y CREDENCIALES
echo ============================================================================
echo Limpiando variables de entorno relacionadas con OpenCode...
powershell -Command "[Environment]::SetEnvironmentVariable('OPENCODE_API_KEY', $null, 'User')" 2>nul
powershell -Command "[Environment]::SetEnvironmentVariable('OPENCODE_API_KEY', $null, 'Machine')" 2>nul

echo Limpiando credenciales de OpenCode en el Administrador de Credenciales de Windows...
powershell -Command "cmdkey /list | Select-String -Pattern 'opencode' | ForEach-Object { $line = $_.Line.Trim(); if ($line -match 'Target:\s+(.+)') { cmdkey /delete:$($Matches[1]) } }" 2>nul

echo Credenciales y variables restablecidas.
echo.

echo ============================================================================
echo [4/4] RENOVANDO IP LOCAL Y LIMPIANDO CACHE DNS
echo ============================================================================
echo Liberando IP actual...
ipconfig /release >nul

timeout /t 2 /nobreak >nul

echo Solicitando nueva IP al router (DHCP)...
ipconfig /renew >nul

echo Limpiando resolver DNS...
ipconfig /flushdns >nul

echo IP liberada y renovada exitosamente.
echo.

echo ============================================================================
echo ¡PROCESO COMPLETADO EXITOSAMENTE!
echo ============================================================================
echo Ya podes abrir Open Code e ingresar con tu nueva cuenta / API Key Go.
pause