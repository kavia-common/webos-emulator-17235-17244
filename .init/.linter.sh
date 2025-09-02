#!/bin/bash
cd /home/kavia/workspace/code-generation/webos-emulator-17235-17244/macos_emulator_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

