# BridgeX Modified
I created this repository as a reference for anyone wanting to setup a BridgeX on a Raspberry Pi Zero 1.1/2 W, but theoretically it should work on just about anything.

It basically is an upgrade to using [@abandonware/bleno](https://github.com/abandonware/bleno), [@abandonware/noble](https://github.com/abandonware/noble) and [@abandonware/bluetooth-hci-socket](https://github.com/abandonware/bluetooth-hci-socket) which allows NodeJS 12+ to be used inconjunction with the latest Raspbian OS.

I will try to document my process and guide through the installation, feel free to message me if you have any questions. I will also make quality of life changes throughout the codebase, as there is a lot of unneccesary or unused portions.

### Raspberry Pi Zero 1.1 W and original img
If you're wanting to use the original **bridgex.img** with the RPiZW, you can simply run `sudo npm rebuild` in `/usr/lib/node_modules/` to get it running and you don't need this repo.

**Note:** I've tested this with Raspbian OS 11 on a Raspberry Pi Zero 2 W and with Raspbian OS 10 on a Raspberry Pi Zero 1.1 W
## Bare Minimum
1. Clone the repository
   `git clone https://github.com/TacoDelPaco/BridgeX`
2. Run `npm rebuild` in the root of the directory
3. Run `node node_modules/@xyo-network/bridge.pi/bin/start.js`

Everything should be running, although you may want to put it in a `screen` or `tmux` to be able to run in the background. The web side of things also doesn't work, as it requires more steps which I include in the next section.

## Everything Else
**Note:** Be sure and edit `<RPi USERNAME>` in each file to whatever you set the Raspbian OS username to when setting it up/formatting
1. Create a file at `/etc/xdg/lxsession/LXDE-pi/autostart` and paste the following:
```
#@lxpanel --profile LXDE-pi
#@pcmanfm --desktop --profile LXDE-pi
#@xscreensaver -no-splash
@xset s off
@xset -dpms
@xset s noblank
@chromium-browser --noerrdialogs --disable-infobars --kiosk --app=file:///home/<RPi USERNAME>/bridge-client/loader.html
```
2. Create a symbolic link `sudo ln -s /home/<RPi USERNAME>/node_modules/@xyo-network/bridge.pi/bin/start.js /usr/bin/xyo-pi-bridge` and edit the file:
```
#!/usr/bin/env node

const { main } = require('/home/<RPi USERNAME>/node_modules/@xyo-network/bridge.pi/dist/index.js');

main()
```
3. Create a file at `/usr/local/bin/xyo-bridge-start.sh` and paste the following:
```
#!/bin/bash

sudo PORT=80 STORE=/home/<RPi USERNAME>/bridge-store STATIC=/home/<RPi USERNAME>/bridge-client /usr/bin/node /usr/bin/xyo-pi-bridge
```
4. Create a file at `/etc/systemd/system/xyo-bridge.service` and paste the following:
```
[Unit]
Description=XYO Bridge Service
After=network.target

[Service]
User=root
Type=simple
ExecStart=/usr/local/bin/xyo-bridge-start.sh
Restart=on-failure

[Install]
WantedBy=multi-user.target
```
5. Run `sudo systemctl enable xyo-bridge && sudo systemctl start xyo-bridge`
You should now have a fully automated BridgeX running on an updated NodeJS, OS, RPiZ2W, etc.
